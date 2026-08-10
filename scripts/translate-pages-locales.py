#!/usr/bin/env python3
"""Generate messages/pages/{locale}.json from en.json using Google Translate."""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Install: pip install deep-translator", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
EN_PATH = ROOT / "messages" / "pages" / "en.json"
OUT_DIR = ROOT / "messages" / "pages"

LOCALES = {"es": "es", "de": "de", "fr": "fr", "hi": "hi", "ru": "ru"}

SKIP_KEYS = frozenset({"href", "linkHref", "url", "publishedAt", "updatedAt"})
PRESERVE_RE = re.compile(
    r"^(https?://\S+|/[^\s]*|\$[\d.,]+(?:/[^\s,.)]+)?|\d{4}-\d{2}-\d{2}|\d+\s*min)$",
    re.I,
)
BATCH_SIZE = 15
BATCH_PAUSE_S = 6.0
MAX_RETRIES = 4


def should_skip_string(key: str | None, value: str) -> bool:
    if key in SKIP_KEYS:
        return True
    if not value or not value.strip():
        return True
    v = value.strip()
    if PRESERVE_RE.match(v):
        return True
    if v.startswith("http") or v.startswith("/"):
        return True
    return False


def collect_strings(obj, key: str | None, out: set[str]) -> None:
    if isinstance(obj, str):
        if not should_skip_string(key, obj):
            out.add(obj)
    elif isinstance(obj, list):
        for item in obj:
            collect_strings(item, key, out)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            collect_strings(v, k, out)


def protect_text(text: str) -> tuple[str, list[tuple[str, str]]]:
    protected: list[tuple[str, str]] = []

    def protect(m: re.Match[str]) -> str:
        token = m.group(0)
        placeholder = f"__PH{len(protected)}__"
        protected.append((placeholder, token))
        return placeholder

    work = text
    work = re.sub(r"https?://\S+", protect, work)
    work = re.sub(r"/[a-z0-9\-_/]+", protect, work)
    work = re.sub(r"\$[\d.,]+(?:/[^\s,.)]+)?", protect, work)
    work = re.sub(r"\b(?:Stripe|PayPal|Wise|OAuth|CSV|ACH|FX|Fee Auditor)\b", protect, work)
    return work, protected


def unprotect(text: str, protected: list[tuple[str, str]]) -> str:
    for placeholder, token in protected:
        text = text.replace(placeholder, token)
    return text


def translate_one(translator: GoogleTranslator, work: str, retries: int = MAX_RETRIES) -> str:
    for attempt in range(retries):
        try:
            return translator.translate(work) or work
        except Exception as e:
            wait = 2 ** attempt
            print(f"      retry {attempt + 1}/{retries} after {wait}s: {str(e)[:80]}", flush=True)
            time.sleep(wait)
    return work


def batch_translate(unique: list[str], target: str) -> dict[str, str]:
    translator = GoogleTranslator(source="en", target=target)
    mapping: dict[str, str] = {}
    protected_map: dict[str, tuple[str, list[tuple[str, str]]]] = {}
    work_list: list[str] = []

    for text in unique:
        work, prot = protect_text(text)
        protected_map[text] = (work, prot)
        work_list.append(work)

    total = len(work_list)
    for i in range(0, total, BATCH_SIZE):
        chunk_orig = unique[i : i + BATCH_SIZE]
        chunk_work = work_list[i : i + BATCH_SIZE]
        batch_no = i // BATCH_SIZE + 1
        batch_total = (total + BATCH_SIZE - 1) // BATCH_SIZE
        print(f"    batch {batch_no}/{batch_total} ({len(chunk_work)} strings)...", flush=True)

        translated: list[str] = []
        try:
            translated = translator.translate_batch(chunk_work)
        except Exception as e:
            print(f"    batch API failed, singles: {str(e)[:100]}", flush=True)
            translated = [translate_one(translator, w) for w in chunk_work]
            time.sleep(0.25)

        if len(translated) != len(chunk_orig):
            translated = [translate_one(translator, w) for w in chunk_work]

        for orig, tr in zip(chunk_orig, translated):
            _, prot = protected_map[orig]
            mapping[orig] = unprotect(tr or orig, prot)

        time.sleep(BATCH_PAUSE_S)

    return mapping


def apply_map(obj, mapping: dict[str, str], key: str | None = None):
    if isinstance(obj, str):
        if should_skip_string(key, obj):
            return obj
        return mapping.get(obj, obj)
    if isinstance(obj, list):
        return [apply_map(item, mapping, key) for item in obj]
    if isinstance(obj, dict):
        return {k: apply_map(v, mapping, k) for k, v in obj.items()}
    return obj


def count_keys(obj: dict) -> dict[str, int]:
    return {
        "seo": len(obj.get("seo", {})),
        "blog": len(obj.get("blog", {})),
    }


def main() -> None:
    only = sys.argv[1:] if len(sys.argv) > 1 else list(LOCALES.keys())
    en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    print(f"Loaded en.json ({EN_PATH.stat().st_size} bytes) keys={count_keys(en)}", flush=True)

    unique_set: set[str] = set()
    collect_strings(en, None, unique_set)
    unique = sorted(unique_set, key=len)
    print(f"Unique translatable strings: {len(unique)}", flush=True)

    for locale in only:
        if locale not in LOCALES:
            print(f"Skip unknown locale: {locale}", flush=True)
            continue
        target = LOCALES[locale]
        out_path = OUT_DIR / f"{locale}.json"
        print(f"Translating -> {locale}...", flush=True)
        mapping = batch_translate(unique, target)
        translated = apply_map(en, mapping)
        out_path.write_text(json.dumps(translated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  Wrote {out_path} ({out_path.stat().st_size} bytes) keys={count_keys(translated)}", flush=True)


if __name__ == "__main__":
    main()
