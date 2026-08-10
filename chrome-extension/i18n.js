/** Chrome extension i18n helper. */
function msg(key, ...substitutions) {
  const text = chrome.i18n.getMessage(key, substitutions);
  return text || key;
}

function applyStaticI18n() {
  const map = {
    ".eyebrow": "eyebrow",
    "h1": "heroTitle",
    ".hero-copy": "heroCopy",
    ".trust-row span:nth-child(1)": "trustNoOAuth",
    ".trust-row span:nth-child(2)": "trustQuickEstimate",
    ".trust-row span:nth-child(3)": "trustCsvAudit",
    ".calculator .label": "calcLabel",
    ".calculator-note": "calcNote",
    'label.calc-field-wide span': "calcCountry",
    '#calc-volume': null,
    ".calc-verify": "calcVerify",
    '[data-open="stripe-export"] strong': "actionExportTitle",
    '[data-open="stripe-export"] small': "actionExportSub",
    '[data-open="analyze"] strong': "actionAnalyzeTitle",
    '[data-open="analyze"] small': "actionAnalyzeSub",
    '[data-open="sample"] strong': "actionSampleTitle",
    '[data-open="sample"] small': "actionSampleSub",
    '[data-open="monitor"] strong': "actionMonitorTitle",
    '[data-open="monitor"] small': "actionMonitorSub",
    ".reminder .label": "reminderLabel",
    "#reminder-toggle": null,
    '[data-open="calculator"]': "footerCalculator",
    '[data-open="instructions"]': "footerGuide",
  };

  document.querySelector(".calc-field:nth-child(2) span") &&
    (document.querySelector(".calc-field:nth-child(2) span").textContent = msg("calcVolume"));
  document.querySelector(".calc-field:nth-child(3) span") &&
    (document.querySelector(".calc-field:nth-child(3) span").textContent = msg("calcAvgCharge"));
  document.querySelector(".calc-field:nth-child(4) span") &&
    (document.querySelector(".calc-field:nth-child(4) span").textContent = msg("calcIntl"));
  document.querySelector(".calc-field:nth-child(5) span") &&
    (document.querySelector(".calc-field:nth-child(5) span").textContent = msg("calcTargetNet"));

  for (const [selector, key] of Object.entries(map)) {
    if (!key) continue;
    const el = document.querySelector(selector);
    if (el) el.textContent = msg(key);
  }
}

globalThis.extMsg = msg;
globalThis.applyStaticI18n = applyStaticI18n;
