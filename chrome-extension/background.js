const REMINDER_ALARM_NAME = "fee-auditor-monthly-reminder";
const ANALYZE_URL =
  "https://feeauditor.com/analyze?utm_source=chrome_extension&utm_medium=extension&utm_campaign=monthly_reminder";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["monthlyReminderEnabled"]).then((stored) => {
    if (stored.monthlyReminderEnabled) {
      chrome.alarms.create(REMINDER_ALARM_NAME, {
        delayInMinutes: 60 * 24 * 30,
        periodInMinutes: 60 * 24 * 30,
      });
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== REMINDER_ALARM_NAME) return;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Time to check your Stripe fees",
    message: "Export your latest Balance CSV and compare your real fee rate.",
    buttons: [{ title: "Analyze CSV" }],
    priority: 0,
  });
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: ANALYZE_URL });
});

chrome.notifications.onButtonClicked.addListener(() => {
  chrome.tabs.create({ url: ANALYZE_URL });
});
