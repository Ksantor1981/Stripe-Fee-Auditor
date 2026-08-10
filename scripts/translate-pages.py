#!/usr/bin/env python3
"""Translate messages/pages/en.json with rate-limit backoff and resume."""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "messages" / "pages" / "en.json"
LOCALES = {"es": "es", "de": "de", "fr": "fr", "hi": "hi", "ru": "ru"}

SKIP_KEYS = frozenset({"href", "linkHref", "publishedAt", "updatedAt", "slug", "type"})
URL_RE = re.compile(r"^https?://")
PATH_RE = re.compile(r"^/[a-z0-9\-/?=&]+$", re.I)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def should_skip(key: str | None, value: str) -> bool:
    if key in SKIP_KEYS or not value.strip():
        return True
    return bool(URL_RE.match(value) or PATH_RE.match(value) or DATE_RE.match(value))


def collect_pairs(en_obj, existing_obj, key: str | None, todo: dict[str, str]) -> None:
    if isinstance(en_obj, str):
        if should_skip(key, en_obj):
            return
        if existing_obj is None or existing_obj == en_obj:
            todo[en_obj] = en_obj
    elif isinstance(en_obj, list):
        ex_list = existing_obj if isinstance(existing_obj, list) else [None] * len(en_obj)
        for en_item, ex_item in zip(en_obj, ex_list):
            collect_pairs(en_item, ex_item, key, todo)
    elif isinstance(en_obj, dict):
        ex_dict = existing_obj if isinstance(existing_obj, dict) else {}
        for k, v in en_obj.items():
            collect_pairs(v, ex_dict.get(k), k, todo)


def apply_map(en_obj, mapping: dict[str, str], key: str | None = None):
    if isinstance(en_obj, str):
        if should_skip(key, en_obj):
            return en_obj
        return mapping.get(en_obj, en_obj)
    if isinstance(en_obj, list):
        return [apply_map(x, mapping, key) for x in en_obj]
    if isinstance(en_obj, dict):
        return {k: apply_map(v, mapping, k) for k, v in en_obj.items()}
    return en_obj


def translate_one(text: str, translator: GoogleTranslator) -> str:
    chunks = [text[i : i + 4000] for i in range(0, max(len(text), 1), 4000)] if len(text) > 4500 else [text]
    parts: list[str] = []
    for chunk in chunks:
        for attempt in range(6):
            try:
                parts.append(translator.translate(chunk))
                time.sleep(0.25)
                break
            except Exception as e:
                err = str(e)
                wait = 5 * (attempt + 1) if "TooManyRequests" in err or "429" in err else 2
                time.sleep(wait)
        else:
            parts.append(chunk)
    return " ".join(parts)


def translate_locale(en: dict, code: str, google_code: str) -> dict:
    out_path = ROOT / "messages" / "pages" / f"{code}.json"
    existing = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else None
    todo: dict[str, str] = {}
    collect_pairs(en, existing, None, todo)
    texts = sorted(todo.keys(), key=len)
    print(f"{code}: {len(texts)} strings to translate")
    if not texts:
        return existing or en

    translator = GoogleTranslator(source="en", target=google_code)
    mapping = dict(todo)
    for i, text in enumerate(texts, 1):
        if i % 20 == 0 or i == len(texts):
            print(f"  {code}: {i}/{len(texts)}", flush=True)
        mapping[text] = translate_one(text, translator)
    return apply_map(en, mapping)


def main() -> None:
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(LOCALES.keys())
    en = json.loads(SRC.read_text(encoding="utf-8"))
    for code in targets:
        if code not in LOCALES:
            continue
        print(f"=== {code} ===")
        translated = translate_locale(en, code, LOCALES[code])
        out = ROOT / "messages" / "pages" / f"{code}.json"
        out.write_text(json.dumps(translated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
