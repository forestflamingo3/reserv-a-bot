/**
 * ReservABot - Core Web Controller and Configuration Engine
 * Davis Island Yacht Club (DIYC)
 */

/**
 * Dynamic configuration loader.
 * Prioritizes Script Properties; falls back to defaults.
 */
const CONFIG = {
  get WORKBOOK_CONFIG_ID() {
    return PropertiesService.getScriptProperties().getProperty("WORKBOOK_CONFIG_ID") || "YOUR_CONFIG_SPREADSHEET_ID";
  },
  get WORKBOOK_OPS_ID() {
    return PropertiesService.getScriptProperties().getProperty("WORKBOOK_OPS_ID") || "YOUR_OPS_SPREADSHEET_ID";
  },
  get SYSTEM_SUPER_EMAIL() {
    return PropertiesService.getScriptProperties().getProperty("SYSTEM_SUPER_EMAIL") || "diycreservabot@gmail.com";
  }
};

/**
 * Web App entry point. Renders public form or action modals based on query parameters.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  template.reservationId = (e && e.parameter && e.parameter.id) ? e.parameter.id : '';
  
  return template.evaluate()
    .setTitle('ReservABot - Boat Reservation System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Diagnostic authorization test function. Run from editor to grant OAuth scopes.
 */
function forceAuthPrompt() {
  const recipient = Session.getEffectiveUser().getEmail() || CONFIG.SYSTEM_SUPER_EMAIL;
  MailApp.sendEmail(recipient, "ReservABot Auth Test", "Authorization verified successfully.");
}
