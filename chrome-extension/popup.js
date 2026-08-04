const URLS = {
  analyze:
    "https://feeauditor.com/analyze?utm_source=chrome_extension&utm_medium=extension&utm_campaign=popup_free_diagnosis",
  monitor:
    "https://feeauditor.com/monitor?utm_source=chrome_extension&utm_medium=extension&utm_campaign=popup_monitor",
  instructions:
    "https://feeauditor.com/stripe-balance-csv?utm_source=chrome_extension&utm_medium=extension&utm_campaign=popup_instructions",
  stripeExport: "https://dashboard.stripe.com/reports/balance",
};

const REMINDER_ALARM_NAME = "fee-auditor-monthly-reminder";

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

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-open");
    if (target === "stripe-export") openUrl(URLS.stripeExport);
    if (target === "analyze") openUrl(URLS.analyze);
    if (target === "monitor") openUrl(URLS.monitor);
    if (target === "instructions") openUrl(URLS.instructions);
  });
});

document.getElementById("reminder-toggle").addEventListener("click", toggleReminder);

renderReminder();
