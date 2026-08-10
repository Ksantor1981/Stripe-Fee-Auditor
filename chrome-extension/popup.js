const URLS = {
  analyze:
    "https://feeauditor.com/analyze?utm_source=chrome_extension&utm_medium=popup&utm_campaign=analyze_csv",
  sample:
    "https://feeauditor.com/analyze?sample=1&utm_source=chrome_extension&utm_medium=popup&utm_campaign=sample",
  monitor:
    "https://feeauditor.com/monitor?utm_source=chrome_extension&utm_medium=popup&utm_campaign=monitor",
  instructions:
    "https://feeauditor.com/stripe-balance-csv?utm_source=chrome_extension&utm_medium=popup&utm_campaign=export_guide",
  calculator:
    "https://feeauditor.com/stripe-fee-calculator?utm_source=chrome_extension&utm_medium=popup&utm_campaign=fee_calculator",
  stripeExport: "https://dashboard.stripe.com/reports/balance",
};

const REMINDER_ALARM_NAME = "fee-auditor-monthly-reminder";
const CALC_STORAGE_KEY = "feeCalculatorInputs";

function openUrl(url) {
  chrome.tabs.create({ url });
}

async function readReminderState() {
  const stored = await chrome.storage.local.get(["monthlyReminderEnabled"]);
  return Boolean(stored.monthlyReminderEnabled);
}

async function renderReminder() {
  const enabled = await readReminderState();
  const status = document.getElementById("reminder-status");
  const toggle = document.getElementById("reminder-toggle");

  status.textContent = enabled ? "On - opens Fee Auditor monthly" : "Off";
  toggle.textContent = enabled ? "Turn off" : "Turn on";
  toggle.classList.toggle("off", enabled);
}

async function toggleReminder() {
  const enabled = await readReminderState();
  const next = !enabled;

  await chrome.storage.local.set({ monthlyReminderEnabled: next });

  if (next) {
    await chrome.alarms.create(REMINDER_ALARM_NAME, {
      delayInMinutes: 60 * 24 * 30,
      periodInMinutes: 60 * 24 * 30,
    });
  } else {
    await chrome.alarms.clear(REMINDER_ALARM_NAME);
  }

  await renderReminder();
}

function getCalcInputs() {
  return {
    accountCountry: document.getElementById("calc-country").value,
    volumeRaw: document.getElementById("calc-volume").value,
    averageChargeRaw: document.getElementById("calc-avg-charge").value,
    intlShareRaw: document.getElementById("calc-intl").value,
    targetNetRaw: document.getElementById("calc-target-net").value,
  };
}

function renderCalculatorResults() {
  const results = document.getElementById("calc-results");
  if (!results || !globalThis.FeeCalculator) return;

  const estimate = globalThis.FeeCalculator.computeStripeFeeEstimate(getCalcInputs());
  const { formatMoney, formatRate } = globalThis.FeeCalculator;
  const profile = estimate.profile;
  const currency = profile.currency;
  const domesticPct = (profile.domesticPercent * 100).toFixed(2);
  const fixedFee = formatMoney(profile.domesticFixed, currency);

  if (estimate.monthlyVolume <= 0) {
    results.innerHTML = `<p class="calc-empty">Enter monthly volume to see an estimate.</p>`;
    return;
  }

  const gapText =
    estimate.gapVsPublished > 0
      ? `${formatMoney(estimate.gapVsPublished, currency)} above published`
      : "Close to published mix";

  const reverseBlock =
    estimate.targetNet > 0
      ? `<p class="calc-reverse">
          To receive ${formatMoney(estimate.targetNet, currency)} on one charge → ask for
          <strong>${formatMoney(estimate.reverseGross, currency)}</strong>
          (fee ~${formatMoney(estimate.reverseFee, currency)})
        </p>`
      : "";

  results.innerHTML = `
    <div class="calc-rate-row">
      <p class="calc-rate-label">Likely all-in rate</p>
      <p class="calc-rate-value">${formatRate(estimate.lowRate)}–${formatRate(estimate.highRate)}</p>
    </div>
    <div class="calc-stats">
      <div>
        <p class="calc-stat-label">Published ${domesticPct}% + ${fixedFee}</p>
        <p class="calc-stat-value">${formatMoney(estimate.publishedFee, currency)}<span>/mo</span></p>
      </div>
      <div class="calc-stat-highlight">
        <p class="calc-stat-label">Mid estimate</p>
        <p class="calc-stat-value">${formatMoney(estimate.midFee, currency)}<span>/mo</span></p>
        <p class="calc-stat-sub">${gapText}</p>
      </div>
    </div>
    <p class="calc-meta">~${estimate.chargeCount.toLocaleString("en-US")} charges/mo at your average.</p>
    ${reverseBlock}
  `;
}

async function persistCalculatorInputs() {
  await chrome.storage.local.set({ [CALC_STORAGE_KEY]: getCalcInputs() });
}

async function restoreCalculatorInputs() {
  const stored = await chrome.storage.local.get([CALC_STORAGE_KEY]);
  const saved = stored[CALC_STORAGE_KEY];
  if (!saved) return;

  if (saved.accountCountry) document.getElementById("calc-country").value = saved.accountCountry;
  if (saved.volumeRaw != null) document.getElementById("calc-volume").value = saved.volumeRaw;
  if (saved.averageChargeRaw != null) {
    document.getElementById("calc-avg-charge").value = saved.averageChargeRaw;
  }
  if (saved.intlShareRaw != null) document.getElementById("calc-intl").value = saved.intlShareRaw;
  if (saved.targetNetRaw != null) document.getElementById("calc-target-net").value = saved.targetNetRaw;
}

function initCalculator() {
  const countrySelect = document.getElementById("calc-country");
  if (!countrySelect || !globalThis.FeeCalculator) return;

  globalThis.FeeCalculator.STRIPE_ACCOUNT_COUNTRIES.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.id;
    option.textContent = country.label;
    countrySelect.appendChild(option);
  });

  const inputs = ["calc-country", "calc-volume", "calc-avg-charge", "calc-intl", "calc-target-net"];
  inputs.forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      renderCalculatorResults();
      void persistCalculatorInputs();
    });
  });

  void restoreCalculatorInputs().then(renderCalculatorResults);
}

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-open");
    if (target === "stripe-export") openUrl(URLS.stripeExport);
    if (target === "analyze") openUrl(URLS.analyze);
    if (target === "sample") openUrl(URLS.sample);
    if (target === "monitor") openUrl(URLS.monitor);
    if (target === "instructions") openUrl(URLS.instructions);
    if (target === "calculator") openUrl(URLS.calculator);
  });
});

document.getElementById("reminder-toggle").addEventListener("click", toggleReminder);

initCalculator();
renderReminder();
