const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://feeauditor.com").replace(/\/$/, "");

const checks = [
  {
    path: "/",
    contains: [
      "Free right now",
      "No Stripe API access",
      "Raw CSV never stored",
      "When a fee audit is useful",
      "$12 one-time unlock",
    ],
  },
  {
    path: "/sitemap.xml",
    contains: [
      "https://feeauditor.com/blog/stripe-fee-leakage-report-may-2026",
      "https://feeauditor.com/blog/how-to-export-stripe-balance-csv",
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
  const missing = check.contains.filter((needle) => !body.includes(needle));

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
