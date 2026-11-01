/**
 * ReservABot - Core Business Operations Engine
 * All functions sorted strictly alphabetically by name.
 */

/**
 * Fetches active boats for the reservation form dropdown.
 * @return {Array<Object>} List of boat objects {id, name}
 */
function getActiveBoats() {
  try {
    const sheet = getConfigSheet("Boats");
    const data = sheet.getDataRange().getValues();
    const boats = [];
    
    // Header row 0: [BoatID, BoatName, Status]
    for (let i = 1; i < data.length; i++) {
      const boatId = String(data[i][0]).trim();
      const boatName = String(data[i][1]).trim();
      const status = data[i][2];
      const isActive = (status === true || String(status).toLowerCase() === "active");
      
      if (boatId && isActive) {
        boats.push({
          id: boatId,
          name: boatName ? boatName : boatId
        });
      }
    }
    return boats;
  } catch (err) {
    logOperationalEvent("ERROR", "getActiveBoats failed: " + err.message);
    throw new Error("Failed to load boats list: " + err.message);
  }
}

/**
 * Fetches email addresses for all Admin users (including Super Admins).
 * @return {Array<string>} Array of valid admin email addresses
 */
function getAdminEmails() {
  try {
    const sheet = getConfigSheet("Users");
    const data = sheet.getDataRange().getValues();
    const emails = [];
    
    // Header row 0: [UserID, Email, Role, Status]
    for (let i = 1; i < data.length; i++) {
      const email = String(data[i][1]).trim();
      const role = String(data[i][2]).trim().toLowerCase();
      const status = data[i][3];
      
      const isActive = (status === undefined || status === "" || status === true || String(status).toLowerCase() === "active");
      const isAdminRole = (role === "admin" || role === "super" || role === "superadmin");
      
      if (email && email.includes("@") && isActive && isAdminRole) {
        emails.push(email);
      }
    }
    
    if (emails.length === 0 && CONFIG.SYSTEM_SUPER_EMAIL) {
      emails.push(CONFIG.SYSTEM_SUPER_EMAIL);
    }
    
    return [...new Set(emails)];
  } catch (err) {
    logOperationalEvent("ERROR", "getAdminEmails error: " + err.message);
    return CONFIG.SYSTEM_SUPER_EMAIL ? [CONFIG.SYSTEM_SUPER_EMAIL] : ["diycreservabot@gmail.com"];
  }
}

/**
 * Returns a sheet from the Configuration workbook.
 * @param {string} sheetName - Tab name
 * @return {Sheet} SpreadsheetApp Sheet object
 */
function getConfigSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.WORKBOOK_CONFIG_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Config Tab '" + sheetName + "' not found.");
  return sheet;
}

/**
 * Retrieves a configuration setting value from the Parameters sheet in ReservABot_Config.
 * @param {string} key - Parameter key name
 * @param {string} defaultValue - Fallback value
 * @return {string}
 */
function getConfigValue(key, defaultValue) {
  try {
    const sheet = getConfigSheet("Parameters");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(key).trim().toLowerCase()) {
        return String(data[i][1]).trim();
      }
    }
    return defaultValue;
  } catch (err) {
    logOperationalEvent("WARN", "getConfigValue failed for [" + key + "]: " + err.message);
    return defaultValue;
  }
}

/**
 * Universal Template Parsing Engine.
 * Supports standard and legacy token mappings.
 * @param {string} templateName - Row identifier in Templates tab
 * @param {Object} variables - Dictionary of placeholder replacements
 * @return {Object} {subject, body}
 */
function getFormattedTemplate(templateName, variables) {
  try {
    const configSheet = getConfigSheet("Templates");
    const data = configSheet.getDataRange().getValues();
    
    let subjectTemplate = "";
    let bodyTemplate = "";
    let found = false;

    // Header row 0: [TemplateName, Subject, Body]
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(templateName).trim().toLowerCase()) {
        subjectTemplate = String(data[i][1]);
        bodyTemplate = String(data[i][2]);
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error("Template '" + templateName + "' not found in Config workbook.");
    }

    const normalizedVars = {
      UserName: variables.UserName || variables.RequesterName || "",
      RequesterName: variables.UserName || variables.RequesterName || "",
      UserEmail: variables.UserEmail || variables.RequesterEmail || "",
      RequesterEmail: variables.UserEmail || variables.RequesterEmail || "",
      BoatID: variables.BoatID || "",
      OperatorName: variables.OperatorName || "",
      StartDateTime: variables.StartDateTime || "",
      EndDateTime: variables.EndDateTime || "",
      EventPurpose: variables.EventPurpose || "N/A",
      ReservationUUID: variables.ReservationUUID || "",
      ApprovalLink: variables.ApprovalLink || "",
      OperatorRejectLink: variables.OperatorRejectLink || "",
      DenialReason: variables.DenialReason || ""
    };

    let subject = subjectTemplate;
    let body = bodyTemplate;

    Object.keys(normalizedVars).forEach(key => {
      const placeholder = new RegExp("{{" + key + "}}", "g");
      const val = normalizedVars[key] !== null && normalizedVars[key] !== undefined ? String(normalizedVars[key]) : "";
      subject = subject.replace(placeholder, val);
      body = body.replace(placeholder, val);
    });

    return { subject: subject, body: body };

  } catch (err) {
    logOperationalEvent("ERROR", "Template engine error [" + templateName + "]: " + err.message);
    throw err;
  }
}

/**
 * Returns a sheet from the Operations workbook.
 * @param {string} sheetName - Tab name
 * @return {Sheet} SpreadsheetApp Sheet object
 */
function getOperationsSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.WORKBOOK_OPS_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Operations Tab '" + sheetName + "' not found.");
  return sheet;
}

/**
 * Fetches qualified operators mapped to a specific Boat ID.
 * @param {string} boatId - Boat identifier
 * @return {Array<Object>} List of operator objects {id, name, email}
 */
function getOperatorsForBoat(boatId) {
  try {
    if (!boatId) return [];
    
    const sheet = getConfigSheet("Operators");
    const data = sheet.getDataRange().getValues();
    const operators = [];
    const targetId = String(boatId).trim().toLowerCase();
    
    // Header row 0: [OperatorID, BoatID, OperatorName, OperatorEmail, Status]
    for (let i = 1; i < data.length; i++) {
      const rowBoatId = String(data[i][1]).trim().toLowerCase();
      const opName = data[i][2];
      const status = data[i][4];
      const isActive = (status === undefined || status === "" || status === true || String(status).toLowerCase() === "active");
      
      if (rowBoatId === targetId && isActive && opName) {
        operators.push({
          id: String(data[i][0]),
          name: String(opName),
          email: String(data[i][3])
        });
      }
    }
    return operators;
  } catch (err) {
    logOperationalEvent("ERROR", "getOperatorsForBoat failed: " + err.message);
    throw new Error("Failed to load operators: " + err.message);
  }
}

/**
 * Appends audit traces to the Execution_Logs sheet.
 * @param {string} level - 'INFO', 'WARN', 'ERROR'
 * @param {string} message - Detail text
 */
function logOperationalEvent(level, message) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.WORKBOOK_OPS_ID);
    let logSheet = ss.getSheetByName("Execution_Logs");
    
    if (!logSheet) {
      logSheet = ss.insertSheet("Execution_Logs");
      logSheet.appendRow(["Timestamp", "Level", "Message"]);
      logSheet.getRange(1, 1, 1, 3).setFontWeight("bold");
    }
    
    logSheet.appendRow([new Date(), String(level).toUpperCase(), message]);
  } catch (err) {
    Logger.log("Failed to write to Execution_Logs: " + err.message);
  }
}

/**
 * Processes an operator assignment rejection via tokenized URL.
 * Updates status, logs reason, and notifies Admins and Requester.
 * @param {string} reservationUuid - Reservation ID
 * @param {string} reason - Operator reason
 * @return {Object} {success, message}
 */
function processOperatorRejection(reservationUuid, reason) {
  try {
    if (!reservationUuid) throw new Error("Missing reservation identifier.");
    
    const opsSheet = getOperationsSheet("Reservations");
    const data = opsSheet.getDataRange().getValues();
    
    let rowIndex = -1;
    let record = null;
    
    // Header row 0: [Timestamp, UserEmail, UserName, BoatID, OperatorName, StartDateTime, EndDateTime, EventPurpose, Status, ReservationUUID, DenialReason]
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][9]).trim() === String(reservationUuid).trim()) {
        rowIndex = i + 1;
        record = {
          userEmail: String(data[i][1]),
          userName: String(data[i][2]),
          boatId: String(data[i][3]),
          operatorName: String(data[i][4]),
          start: String(data[i][5]),
          end: String(data[i][6]),
          purpose: String(data[i][7]),
          status: String(data[i][8])
        };
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error("Reservation record not found.");
    }
    
    const rejectionReason = reason || "Operator unavailable";
    
    // Status (Col 9), DenialReason (Col 11)
    opsSheet.getRange(rowIndex, 9).setValue("Cancelled");
    opsSheet.getRange(rowIndex, 11).setValue("Operator Rejected: " + rejectionReason);
    
    const templateVars = {
      UserName: record.userName,
      UserEmail: record.userEmail,
      BoatID: record.boatId,
      OperatorName: record.operatorName,
      StartDateTime: record.start,
      EndDateTime: record.end,
      EventPurpose: record.purpose,
      ReservationUUID: reservationUuid,
      DenialReason: rejectionReason
    };
    
    // Notify Requester
    try {
      const userTemplate = getFormattedTemplate("OperatorRejectionUser", templateVars);
      MailApp.sendEmail(record.userEmail, userTemplate.subject, userTemplate.body);
    } catch (e) {
      logOperationalEvent("WARN", "User notification failed on operator rejection: " + e.message);
    }
    
    // Notify Admins
    const adminEmails = getAdminEmails();
    try {
      const adminTemplate = getFormattedTemplate("OperatorRejectionAdmin", templateVars);
      adminEmails.forEach(email => {
        MailApp.sendEmail(email, adminTemplate.subject, adminTemplate.body);
      });
    } catch (e) {
      logOperationalEvent("WARN", "Admin notification failed on operator rejection: " + e.message);
    }
    
    // Optional Super Admin copy
    const notifySuper = getConfigValue("NOTIFY_SUPER_ON_ALL", "true").toLowerCase() === "true";
    if (notifySuper && CONFIG.SYSTEM_SUPER_EMAIL && !adminEmails.includes(CONFIG.SYSTEM_SUPER_EMAIL)) {
      try {
        const adminTemplate = getFormattedTemplate("OperatorRejectionAdmin", templateVars);
        MailApp.sendEmail(CONFIG.SYSTEM_SUPER_EMAIL, adminTemplate.subject, adminTemplate.body);
      } catch (e) {
        logOperationalEvent("WARN", "Super Admin copy failed on operator rejection: " + e.message);
      }
    }
    
    logOperationalEvent("INFO", "Operator rejected assignment for UUID: " + reservationUuid + ". Reason: " + rejectionReason);
    
    return {
      success: true,
      message: "Assignment rejection recorded. Reservation cancelled and parties notified."
    };
    
  } catch (err) {
    const errorMsg = "processOperatorRejection Error: " + err.message;
    logOperationalEvent("ERROR", errorMsg);
    return { success: false, message: err.message };
  }
}

/**
 * Submits public boat reservation, generating token links for approval and rejection.
 * Notifies all Admins, Requester, Operator, and Super Admin.
 * @param {Object} data - Form payload
 * @return {Object} {success, message}
 */
function submitPublicReservation(data) {
  try {
    if (!data.email || !data.boat || !data.operator) {
      throw new Error("Missing required reservation fields (email, boat, or operator).");
    }

    const opsSheet = getOperationsSheet("Reservations");
    const newUuid = Utilities.getUuid();
    const timestamp = new Date();

    opsSheet.appendRow([
      timestamp,
      data.email,
      data.name,
      data.boat,
      data.operator,
      data.start,
      data.end,
      data.purpose,
      "Pending",
      newUuid
    ]);

    const webAppUrl = ScriptApp.getService().getUrl();
    const approvalLink = webAppUrl + "?action=approve&id=" + newUuid;
    const operatorRejectLink = webAppUrl + "?action=op_reject&id=" + newUuid;

    const templateVars = {
      UserName: data.name,
      UserEmail: data.email,
      BoatID: data.boat,
      OperatorName: data.operator,
      StartDateTime: data.start,
      EndDateTime: data.end,
      EventPurpose: data.purpose || "N/A",
      ReservationUUID: newUuid,
      ApprovalLink: approvalLink,
      OperatorRejectLink: operatorRejectLink
    };

    // 1. Notify All Admins
    const adminEmails = getAdminEmails();
    const adminEmailData = getFormattedTemplate("ApprovalRequest", templateVars);
    adminEmails.forEach(email => {
      MailApp.sendEmail(email, adminEmailData.subject, adminEmailData.body);
    });

    // 2. Notify Requester
    try {
      const userEmailData = getFormattedTemplate("ReservationSubmittedUser", templateVars);
      MailApp.sendEmail(data.email, userEmailData.subject, userEmailData.body);
    } catch (e) {
      logOperationalEvent("WARN", "Requester confirmation email failed: " + e.message);
    }

    // 3. Notify Operator
    try {
      const opSheet = getConfigSheet("Operators");
      const opData = opSheet.getDataRange().getValues();
      let operatorEmail = "";
      
      for (let i = 1; i < opData.length; i++) {
        if (String(opData[i][2]).trim().toLowerCase() === String(data.operator).trim().toLowerCase()) {
          operatorEmail = String(opData[i][3]).trim();
          break;
        }
      }

      if (operatorEmail && operatorEmail.includes("@")) {
        const opEmailData = getFormattedTemplate("ReservationSubmittedOperator", templateVars);
        MailApp.sendEmail(operatorEmail, opEmailData.subject, opEmailData.body);
      }
    } catch (e) {
      logOperationalEvent("WARN", "Operator notification email failed: " + e.message);
    }

    // 4. Send Super Admin Copy if enabled
    const notifySuper = getConfigValue("NOTIFY_SUPER_ON_ALL", "true").toLowerCase() === "true";
    if (notifySuper && CONFIG.SYSTEM_SUPER_EMAIL && !adminEmails.includes(CONFIG.SYSTEM_SUPER_EMAIL)) {
      try {
        MailApp.sendEmail(CONFIG.SYSTEM_SUPER_EMAIL, adminEmailData.subject, adminEmailData.body);
      } catch (e) {
        logOperationalEvent("WARN", "Super Admin copy failed: " + e.message);
      }
    }

    logOperationalEvent("INFO", "Reservation created & notifications dispatched [UUID: " + newUuid + "]");

    return { 
      success: true, 
      message: "Reservation submitted successfully! Notifications dispatched." 
    };

  } catch (err) {
    const errorMsg = "submitPublicReservation Failure: " + err.message;
    logOperationalEvent("ERROR", errorMsg);
    return { 
      success: false, 
      message: "Submission failed: " + err.message 
    };
  }
}
