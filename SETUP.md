# ReservABot Deployment & Setup Guide

This guide walks an incoming developer through bootstrapping ReservABot from zero in a clean Google Workspace / Google Drive environment.

---

## 1. Prerequisites

* A Google account designated for system execution (recommended: `diycreservabot@gmail.com`).
* Access to [Google Apps Script](https://script.google.com).
* Node.js & npm (if deploying via Google clasp CLI).

---

## 2. Workbook Setup

Create two distinct Google Sheets workbooks in Google Drive. Record the 44-character Spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`).

### Workbook A: `ReservABot_Config`
Create the following tabs (exact spelling required):
1. **`Boats`**: Headers: `BoatID`, `BoatName`, `Status`
2. **`Operators`**: Headers: `OperatorID`, `BoatID`, `OperatorName`, `OperatorEmail`, `Status`
3. **`Users`**: Headers: `UserID`, `Email`, `Role`, `Status`
4. **`Templates`**: Headers: `TemplateName`, `Subject`, `Body`
5. **`Parameters`**: Headers: `ParamName`, `ParamValue`

*(Populate `Templates` and `Parameters` using the specs in `docs/DATA_SCHEMA.md` and `docs/EMAIL_TEMPLATES.md`)*.

### Workbook B: `ReservABot_Operations`
Create the following tabs:
1. **`Reservations`**: Headers: `Timestamp`, `UserEmail`, `UserName`, `BoatID`, `OperatorName`, `StartDateTime`, `EndDateTime`, `EventPurpose`, `Status`, `ReservationUUID`, `DenialReason`
2. **`Execution_Logs`**: Headers: `Timestamp`, `Level`, `Message`

---

## 3. Script Configuration (Script Properties)

Instead of hardcoding spreadsheet IDs in source code, ReservABot uses Apps Script **Script Properties**:

1. Open the Apps Script project connected to your repo.
2. Navigate to **Project Settings** (gear icon) -> **Script Properties**.
3. Add the following properties:
   * `WORKBOOK_CONFIG_ID`: ID of the `ReservABot_Config` sheet.
   * `WORKBOOK_OPS_ID`: ID of the `ReservABot_Operations` sheet.
   * `SYSTEM_SUPER_EMAIL`: Primary admin email (e.g., `diycreservabot@gmail.com`).

---

## 4. Deployment via Google Apps Script Web Editor

1. Copy `src/Code.gs`, `src/Operations.gs`, and `src/Index.html` into your Apps Script project.
2. In Project Settings, enable **Show "appsscript.json" manifest file in editor** and replace its contents with `appsscript.json`.
3. Run `forceAuthPrompt()` or `getActiveBoats()` from the editor toolbar to trigger the OAuth authorization prompt. Grant all requested permissions.
4. Click **Deploy** -> **Manage deployments** -> **Create deployment** (or edit existing):
   * **Type:** Web app
   * **Execute as:** `Me (diycreservabot@gmail.com)`
   * **Who has access:** `Anyone`
5. Copy the generated Web App URL (`https://script.google.com/macros/s/.../exec`).

---

## 5. Deployment via CLASP (Command Line)

```bash
# 1. Install clasp globally
npm install -g @google/clasp

# 2. Log in with the bot account
clasp login

# 3. Clone or create project
clasp create --title "ReservABot" --type webapp

# 4. Push files
clasp push

# 5. Deploy web app
clasp deploy --description "Production Deployment"
```
