const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://feeauditor.com").replace(/\/$/, "");

const checks = [
  {
    path: "/",
    containsAny: [
      ["Free right now", "$12 one-time unlock for the full report"],
      "No Stripe API access",
      "Raw CSV never stored",
      "When a fee audit is useful",
      "$12 one-time unlock",
    ],
  },
  {
    path: "/sitemap.xml",
    contains: [
      "https://feeauditor.com/why-stripe-fee-rate-higher-than-2-9",
      "https://feeauditor.com/blog/stripe-fee-leakage-report-may-2026",
      "https://feeauditor.com/blog/how-to-export-stripe-balance-csv",
    ],
    excludes: [
      "https://feeauditor.com/blog/why-stripe-effective-rate-higher-than-2-9-percent",
    ],
  },
  {
    path: "/robots.txt",
    contains: ["Sitemap: https://feeauditor.com/sitemap.xml"],
  },
];

async function fetchText(path) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });

  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`);
  }

  return res.text();
}

let failed = false;

for (const check of checks) {
  const body = await fetchText(check.path);
  const missing = [];

  for (const rule of check.contains ?? []) {
    if (Array.isArray(rule)) {
      if (!rule.some((needle) => body.includes(needle))) {
        missing.push(`one of: ${rule.join(" | ")}`);
      }
    } else if (!body.includes(rule)) {
      missing.push(rule);
    }
  }

  for (const rule of check.containsAny ?? []) {
    if (Array.isArray(rule)) {
      if (!rule.some((n) => body.includes(n))) missing.push(`one of: ${rule.join(" | ")}`);
    } else if (!body.includes(rule)) {
      missing.push(rule);
    }
  }

  for (const needle of check.excludes ?? []) {
    if (body.includes(needle)) missing.push(`should not include: ${needle}`);
  }

  if (missing.length > 0) {
    failed = true;
    console.error(`FAIL ${check.path}`);
    for (const needle of missing) {
      console.error(`  missing: ${needle}`);
    }
  } else {
    console.log(`OK   ${check.path}`);
  }
}

if (failed) {
  console.error(`\nProduction smoke check failed for ${baseUrl}`);
  process.exit(1);
}

console.log(`\nProduction smoke check passed for ${baseUrl}`);
