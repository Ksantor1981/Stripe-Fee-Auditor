# Stripe Fee Auditor Chrome Extension

Lightweight acquisition-channel extension for Chrome Web Store presence.

This version does not read Stripe pages and does not parse CSVs locally. It is intentionally small:

- Opens Stripe Balance report export page
- Opens Fee Auditor `/analyze` for a **free diagnosis** (CSV upload on the site)
- Optional Fee Monitor (`$9/mo`) — secondary
- Local monthly reminder via Chrome alarms/notifications

## Post-test backlog (after upload funnel eval ~2026-08-12)

1. **Copy align (cheap):** ✅ done 2026-08-04; refreshed 2026-08-05 — Store title/summary, popup UTMs (`popup` medium), sample link, site install CTAs
2. **Optional friction cut (only if installs matter):** CSV drop in popup → open `/analyze` (pass file or deep-link; no full MV3 offline parser)
3. **Out of scope until demand:** free diagnosis UI / fee math inside the extension popup

Store listing copy: `STORE_LISTING.md`. Zip and upload **0.1.2** to the existing listing (do not create a new product).

Ops reminder: `docs/ops/WEDNESDAY_MANUAL_STEPS.md` §6.

## Local test

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `chrome-extension`
5. Pin the extension and test the popup actions

## Chrome Web Store notes

Suggested category: `Productivity` or `Finance`.

Permissions explanation:

- `storage`: remember whether monthly reminder is enabled
- `alarms`: schedule the local monthly reminder
- `notifications`: show the reminder notification

No host permissions are requested. The extension does not read or modify Stripe pages.

## Store copy draft

See `STORE_LISTING.md` for the live title, summary, detailed description, and screenshot checklist.
