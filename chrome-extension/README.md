# Stripe Fee Auditor Chrome Extension

Lightweight acquisition-channel extension for Chrome Web Store presence.

This version does not read Stripe pages and does not parse CSVs locally. It is intentionally small:

- Opens Stripe Balance report export page
- Opens Fee Auditor `/analyze` for a **free diagnosis** (CSV upload on the site)
- Optional Fee Monitor (`$9/mo`) — secondary
- Local monthly reminder via Chrome alarms/notifications

## Post-test backlog (after upload funnel eval ~2026-08-12)

1. **Copy align (cheap):** ✅ done 2026-08-04 — popup + Store listing free-first; Monitor secondary; UTMs `popup_free_diagnosis`
2. **Optional friction cut (only if installs matter):** CSV drop in popup → open `/analyze` (pass file or deep-link; no full MV3 offline parser)
3. **Out of scope until demand:** free diagnosis UI / fee math inside the extension popup

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

Title:

```text
Stripe Fee Auditor - CSV Fee Check Helper
```

Short description:

```text
Quick links and monthly reminders for checking your real Stripe fee rate from a Balance CSV.
```

Long description:

```text
Stripe Fee Auditor helps SaaS founders check what they actually pay Stripe, not just the headline 2.9% rate.

This lightweight extension gives you quick access to the workflow:

- Open the Stripe Balance export page
- Upload your Balance CSV to FeeAuditor.com
- Start a monthly reminder to re-check your effective fee rate
- Open Fee Monitor for monthly CSV reminders and rate drift checks

The extension does not read Stripe pages, does not connect to your Stripe account, and does not request host permissions. It is a launcher and reminder companion for the FeeAuditor.com web app.
```
