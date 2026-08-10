const REMINDER_ALARM_NAME = "fee-auditor-monthly-reminder";
const ANALYZE_URL =
  "https://feeauditor.com/analyze?utm_source=chrome_extension&utm_medium=notification&utm_campaign=monthly_reminder";

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
    title: chrome.i18n.getMessage("notificationTitle"),
    message: chrome.i18n.getMessage("notificationMessage"),
    buttons: [{ title: chrome.i18n.getMessage("notificationButton") }],
    priority: 0,
  });
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: ANALYZE_URL });
});

chrome.notifications.onButtonClicked.addListener(() => {
  chrome.tabs.create({ url: ANALYZE_URL });
});
