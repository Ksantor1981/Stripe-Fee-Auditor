# Chrome Web Store Listing — Stripe Fee Auditor

Update the **existing** product (do not create a second listing). Fake installs/reviews/bot traffic are forbidden and risk a ban. Goal: real install → use → retain → organic review.

## Upload package

Zip the `chrome-extension/` folder after bumping `manifest.json` version. Current target: **0.1.4**.

```text
C:\tmp\stripe-fee-auditor-extension.zip
```

## Store detail URL (for site CTAs)

Public listing:

```text
https://chromewebstore.google.com/detail/blnamggnpkfcfennippabkoafllecghc
```

The same URL is stored in `lib/chrome-extension.ts`. It can be overridden with
`NEXT_PUBLIC_CHROME_EXTENSION_STORE_URL` if the listing URL changes.

## Graphics

Store icon:

```text
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\store-icon-128.png
```

Screenshots (prefer 1280×800). Capture / refresh these five:

```text
1. Popup — Free diagnosis / Analyze CSV + Open Stripe export
   store-assets/screenshot-1-extension-popup-1280x800.png

2. Popup / tab — “Open Stripe export” (Balance report context)
   store-assets/screenshot-2-export-workflow-1280x800.png
   (or recreate as screenshot-2-open-stripe-export-1280x800.png)

3. Sample report on feeauditor.com (rate + free diagnosis)
   store-assets/screenshot-3-sample-report-1280x800.png
   (reuse/refresh screenshot-2-report-dashboard if needed)

4. Fee Monitor $9/mo page (secondary — label as optional)
   store-assets/screenshot-4-fee-monitor-1280x800.png

5. Privacy / no OAuth (popup trust row or site privacy strip)
   store-assets/screenshot-5-privacy-no-oauth-1280x800.png
```

Existing assets you already have:

```text
store-assets/screenshot-1-extension-popup-1280x800.png
store-assets/screenshot-2-report-dashboard-1280x800.png
store-assets/screenshot-3-export-workflow-1280x800.png
```

Small promo image:

```text
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\promo-small-440x280.jpg
```

Large promo image:

```text
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\promo-large-1400x560.jpg
```

Promo video URL:

```text
https://www.youtube.com/watch?v=C2ZKOwORFmw
```

Do not use the short `youtu.be/...` URL or a URL with `?si=...`; Chrome Web Store expects the full YouTube watch URL.

## Product details

Name:

```text
Stripe Fee Auditor — CSV Fee Check Helper
```

Summary / short description (≤132 characters):

```text
Open Stripe Balance export, audit your real fee rate, and get monthly CSV reminders. No OAuth or API keys.
```

Detailed description:

```text
Fee Auditor helps SaaS founders and finance teams check what they actually pay Stripe — not just the headline 2.9% rate.

This Chrome helper opens the Stripe Balance export workflow and FeeAuditor.com so you can upload an itemized Balance CSV and see your real effective fee rate plus one concrete driver. It does not read Stripe Dashboard pages, does not require Stripe OAuth or API keys, and does not analyze CSV files inside the extension.

Who it is for:
- Founders and operators who notice payouts or fees drifting month to month
- Fractional CFOs and finance leads who want a quick CSV check without connecting Stripe

Workflow:
1. Open the Stripe Balance report export page from the popup
2. Upload your itemized Balance CSV on FeeAuditor.com for a free rate + fee-driver diagnosis (or try the sample report first)
3. Optionally turn on a local monthly reminder so you repeat the check
4. Optionally open Fee Monitor ($9/mo) for recurring reminders — secondary, not required for the free check

Privacy:
- No host permissions for stripe.com
- Does not scrape or inject into Stripe pages
- Stores only the optional reminder preference in Chrome storage
- CSV upload and analysis happen on FeeAuditor.com when you choose to

Independent tool — not affiliated with Stripe, Inc.
```

Category:

```text
Productivity
```

Alternative category if available in the console:

```text
Finance
```

Language:

```text
English
```

Website:

```text
https://feeauditor.com
```

Support URL:

```text
https://feeauditor.com/about
```

Privacy policy:

```text
https://feeauditor.com/privacy
```

## Permissions justification

storage:

```text
Used to remember whether the local monthly reminder is enabled.
```

alarms:

```text
Used to schedule the optional monthly reminder to re-check Stripe fees.
```

notifications:

```text
Used to show the optional local reminder notification.
```

Single purpose:

```text
The extension provides quick links and optional monthly reminders for checking Stripe fees with FeeAuditor.com.
```

Data usage:

```text
The extension does not collect, sell, or transfer user data. It does not read or modify Stripe pages and does not request host permissions. If the user chooses to open FeeAuditor.com and upload a CSV, that upload is handled by the FeeAuditor.com web app under the published privacy policy.
```

Remote code:

```text
No remote code is used by the extension.
```

Host permissions:

```text
No host permissions are requested.
```

## Review notes

```text
Stripe Fee Auditor is a launcher and reminder companion. It opens Stripe's Balance export page and FeeAuditor.com in normal browser tabs. It does not scrape Stripe, inject scripts, read page contents, or access the user's Stripe account. CSV analysis runs only on FeeAuditor.com after the user uploads a file.
```

## Retention / quality signals (not listing fields)

- Prefer installs that open Analyze or Sample, not bounce uninstalls
- Soft review ask appears on the site only after a sample/full report (no incentives, no “5 stars”)
- Monthly reminder is the retention hook: install → reminder → return CSV upload
