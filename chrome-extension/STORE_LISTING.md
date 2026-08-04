# Chrome Web Store Listing — Stripe Fee Auditor

## Upload package

Use this ZIP:

```text
C:\tmp\stripe-fee-auditor-extension.zip
```

## Graphics

Store icon:

```text
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\store-icon-128.png
```

Screenshots:

```text
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\screenshot-1-extension-popup-1280x800.png
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\screenshot-2-report-dashboard-1280x800.png
C:\project\Stripe Fee Auditor\chrome-extension\store-assets\screenshot-3-export-workflow-1280x800.png
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
Stripe Fee Auditor
```

Short description:

```text
Free Stripe fee diagnosis helper: open Balance export, upload CSV on FeeAuditor.com. No OAuth.
```

Detailed description:

```text
Fee Auditor helps SaaS founders and finance teams check what they actually pay Stripe — not just the headline 2.9% rate.

This lightweight Chrome extension is a launcher for the free diagnosis on FeeAuditor.com (CSV upload in the browser). It does not analyze files inside the extension.

Workflow:

1. Open the Stripe Balance report export page
2. Upload your itemized Balance CSV on FeeAuditor.com for a free rate + fee-driver diagnosis
3. Optionally turn on a local monthly reminder
4. Optionally open Fee Monitor ($9/mo) for recurring reminders — secondary, not required for the free check

The extension does not read Stripe pages, does not connect to your Stripe account, and does not request host permissions.

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
Stripe Fee Auditor is a launcher and reminder companion. It opens Stripe's Balance export page and FeeAuditor.com in normal browser tabs. It does not scrape Stripe, inject scripts, read page contents, or access the user's Stripe account.
```
