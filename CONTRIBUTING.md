# Contributing to ReservABot

Thank you for maintaining and building on ReservABot. To preserve code quality and prevent operational regressions in Google Apps Script, all contributors must adhere to these conventions.

---

## 1. Architectural Commandments

1. **Strict Alphabetical Sorting in `src/Operations.gs`:**
   * Every function definition in `Operations.gs` MUST be kept in strict alphabetical order by function name.
   * Do not place helper functions at the bottom out of order.

2. **No Hardcoded Spreadsheet IDs:**
   * Never commit Google Sheet IDs into source code.
   * Access workbook IDs via `PropertiesService.getScriptProperties().getProperty("...")`.

3. **Dual-Token Schema Support:**
   * When modifying template parsing in `getFormattedTemplate`, preserve support for both `UserName` and `RequesterName` (and `UserEmail` / `RequesterEmail`) so existing sheet templates do not fail.

4. **Always Cut a New Version Deployment:**
   * Saving code in the Google Apps Script editor does NOT push changes to the active web app URL.
   * Every deploy must follow: **Deploy** -> **Manage deployments** -> **Edit** -> **New version** -> **Deploy**.

---

## 2. Local Development & Verification

1. Before submitting changes, run the automated test suite in `src/Tests.gs` via `runAllTests()`.
2. Inspect the `Execution_Logs` sheet tab in `ReservABot_Operations` to verify zero `ERROR` level traces.
3. Keep `.claspignore` intact so markdown documentation and test fixtures are not bundled into the production Apps Script runtime.
