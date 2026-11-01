/**
 * ReservABot - Clean Environment Bootstrap Engine
 * 
 * Run bootstrapWorkbooks() once after creating two blank Google Sheets workbooks
 * and configuring WORKBOOK_CONFIG_ID and WORKBOOK_OPS_ID in Script Properties.
 * It builds all tabs, sets header styling, and seeds required defaults.
 */

function bootstrapWorkbooks() {
  const configId = PropertiesService.getScriptProperties().getProperty("WORKBOOK_CONFIG_ID");
  const opsId = PropertiesService.getScriptProperties().getProperty("WORKBOOK_OPS_ID");

  if (!configId || !opsId) {
    throw new Error("Missing WORKBOOK_CONFIG_ID or WORKBOOK_OPS_ID in Script Properties.");
  }

  const configSS = SpreadsheetApp.openById(configId);
  const opsSS = SpreadsheetApp.openById(opsId);

  const initTab = (ss, name, headers) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
    return sheet;
  };

  // 1. Config Tabs
  initTab(configSS, "Boats", ["BoatID", "BoatName", "Status"]);
  initTab(configSS, "Operators", ["OperatorID", "BoatID", "OperatorName", "OperatorEmail", "Status"]);
  initTab(configSS, "Users", ["UserID", "Email", "Role", "Status"]);
  
  const templateSheet = initTab(configSS, "Templates", ["TemplateName", "Subject", "Body"]);
  if (templateSheet.getLastRow() === 1) {
    const defaultTemplates = [
      [
        "ApprovalRequest",
        "[ReservABot] New Reservation Request - {{BoatID}}",
        "A new boat reservation request has been submitted for review.\n\nRequester: {{UserName}} ({{UserEmail}})\nBoat: {{BoatID}}\nOperator: {{OperatorName}}\nTime: {{StartDateTime}} to {{EndDateTime}}\nPurpose: {{EventPurpose}}\n\nReview and approve or deny this request here:\n{{ApprovalLink}}"
      ],
      [
        "ReservationSubmittedUser",
        "[ReservABot] Reservation Request Received - {{BoatID}}",
        "Hello {{UserName}},\n\nYour reservation request for {{BoatID}} has been received and is pending administrator review.\n\nDetails:\nOperator: {{OperatorName}}\nSchedule: {{StartDateTime}} to {{EndDateTime}}\nPurpose: {{EventPurpose}}\nTracking ID: {{ReservationUUID}}\n\nYou will receive an update once the request is processed."
      ],
      [
        "ReservationSubmittedOperator",
        "[ReservABot] Assignment Notice: {{BoatID}} on {{StartDateTime}}",
        "Hello {{OperatorName}},\n\nYou have been listed as the operator for a requested boat booking:\n\nRequester: {{UserName}}\nBoat: {{BoatID}}\nTime: {{StartDateTime}} to {{EndDateTime}}\nPurpose: {{EventPurpose}}\n\nIf you are UNABLE to fulfill this assignment, click the link below to decline. This will cancel the reservation and notify the administration:\n{{OperatorRejectLink}}"
      ],
      [
        "OperatorRejectionAdmin",
        "[ReservABot] Operator Declined Assignment - {{BoatID}}",
        "Notice: Operator {{OperatorName}} has declined the booking assignment for {{BoatID}}.\n\nRequester: {{UserName}} ({{UserEmail}})\nReason: {{DenialReason}}\nReservation UUID: {{ReservationUUID}}\n\nThe reservation status has automatically been marked as CANCELLED."
      ],
      [
        "OperatorRejectionUser",
        "[ReservABot] Reservation Cancelled (Operator Declined) - {{BoatID}}",
        "Hello {{UserName}},\n\nYour reservation for {{BoatID}} on {{StartDateTime}} has been cancelled because the assigned operator ({{OperatorName}}) is unable to take the assignment.\n\nReason provided: {{DenialReason}}\n\nPlease submit a new request with an alternate operator or contact the club office."
      ]
    ];
    defaultTemplates.forEach(row => templateSheet.appendRow(row));
  }

  const paramSheet = initTab(configSS, "Parameters", ["ParamName", "ParamValue"]);
  if (paramSheet.getLastRow() === 1) {
    paramSheet.appendRow(["NOTIFY_SUPER_ON_ALL", "true"]);
  }

  // 2. Operations Tabs
  initTab(opsSS, "Reservations", [
    "Timestamp", "UserEmail", "UserName", "BoatID", "OperatorName",
    "StartDateTime", "EndDateTime", "EventPurpose", "Status", "ReservationUUID", "DenialReason"
  ]);
  
  initTab(opsSS, "Execution_Logs", ["Timestamp", "Level", "Message"]);

  // Clean default 'Sheet1' if empty and unused
  [configSS, opsSS].forEach(ss => {
    const defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
      try { ss.deleteSheet(defaultSheet); } catch (e) {}
    }
  });

  Logger.log("Bootstrap complete. ReservABot schemas and templates successfully initialized.");
}
