const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://feeauditor.com").replace(/\/$/, "");

const res = await fetch(`${baseUrl}/api/health`, {
  headers: { "cache-control": "no-cache" },
});

if (!res.ok) {
  console.error(`Health check HTTP ${res.status} from ${baseUrl}/api/health`);
  process.exit(1);
}

const body = await res.json();

if (body.status !== "ok" || body.checks?.database !== "ok") {
  console.error("Health check failed:", JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(`Health OK — database=${body.checks.database} version=${body.version ?? "n/a"}`);
