# ReservABot - Product Requirements Document (PRD)

**System Name:** ReservABot  
**Target Environment:** Davis Island Yacht Club (DIYC)  
**Status:** Turn-key Handover / Suspended Development  
**Primary Execution Identity:** `diycreservabot@gmail.com`  

---

## 1. Problem Statement & Executive Summary

Davis Island Yacht Club operates a dedicated fleet of powerboats and mark boats supporting club regattas, race committee operations, junior sailing events, and club maintenance. Previously, vessel tracking and reservation scheduling relied on ad-hoc communications, resulting in double-bookings, unverified skipper qualifications, missed notices, and lack of an audit trail.

**ReservABot** provides an automated, low-overhead reservation and workflow engine hosted entirely inside Google Workspace. It eliminates scheduling conflicts, validates qualified operators per vessel, facilitates multi-party approvals, and provides complete traceability without recurring SaaS hosting costs.

---

## 2. Target Personas & Stakeholders

* **Requester (Club Member / Regatta Chair):** Submits boat reservation requests specifying time, vessel, intended skipper, and event purpose.
* **Assigned Operator (Skipper):** Qualified club member designated to operate a specific vessel; retains authority to accept or decline the assignment.
* **Admins & Fleet Captains:** Review incoming reservation requests, evaluate fleet availability, and issue final approvals or rejections.
* **Super Admin (`diycreservabot@gmail.com`):** System service identity managing execution, script quotas, delivery fallbacks, and audit oversight.

---

## 3. Core Functional Requirements

### 3.1 Fleet & Operator Qualification Catalog
* **Dynamic Vessel Listing:** Reservation interface must populate only currently active vessels (`Boats` sheet).
* **Vessel-Operator Qualification Mapping:** Dropdowns must strictly constrain selectable operators to members vetted/certified for that specific hull or outboard configuration (`Operators` sheet).
* **Deterministic Selection:** Form must default to an unselected prompt (`-- Select a Boat --`) and load operators only after an explicit boat selection.

### 3.2 Submission & Tokenized Link Generation
* **Unique Reservation Identity:** Every request receives a unique UUID (`Utilities.getUuid()`).
* **Stateless Workflow Tokens:** Web application generates secure, tokenized query parameters for review actions:
  * Admin Review: `?action=approve&id=<ReservationUUID>`
  * Operator Rejection: `?action=op_reject&id=<ReservationUUID>`
* **Concurrent Logging:** Timestamp, member email, boat ID, operator, event purpose, and status (`Pending`) are committed to `Reservations` immediately upon submission.

### 3.3 Multi-Party Notification Matrix
* **Admins Notification:** All active system admins (and Super Admin) receive review alerts via the `ApprovalRequest` template.
* **Requester Confirmation:** Requesters receive instant receipt confirmation (`ReservationSubmittedUser`).
* **Operator Notification:** Assigned operators receive notice of selection along with a one-click rejection link (`ReservationSubmittedOperator`).
* **Super Admin Routing Control:** Global parameter (`NOTIFY_SUPER_ON_ALL`) toggles CC/BCC behavior for the service account.

### 3.4 Operator Rejection & Cancellation
* **One-Click Rejection Interface:** Operators clicking `?action=op_reject&id=...` are presented with a dedicated modal requiring an explanation.
* **Automated Status Transition:** Submitting a rejection instantly marks the reservation as `Cancelled` in Column I and records the note in Column K (`DenialReason`).
* **Cancellation Alerts:** Automated notifications dispatch to both Admins (`OperatorRejectionAdmin`) and the Requester (`OperatorRejectionUser`).

### 3.5 System Audit & Operational Diagnostics
* **Structured Execution Logging:** Script execution steps, template rendering warnings, and delivery failures log to `Execution_Logs` (`logOperationalEvent`).
* **Fail-Safe Template Fallbacks:** If the `Templates` sheet is missing or corrupted, the system falls back to standard text formatting rather than terminating.

---

## 4. Non-Functional Requirements & Technical Constraints

* **Platform Constraints:** Runs strictly within Google Apps Script (V8 runtime), bounded by standard Google Workspace daily email quotas (100–1,500/day depending on workspace tier).
* **Execution Identity:** Must run as `Execute as: Me` using the service account `diycreservabot@gmail.com` with `Who has access: Anyone` to permit unauthenticated member submissions.
* **Zero Infrastructure Overhead:** No external servers, databases, Docker containers, or cloud endpoints; all state resides in Google Sheets.
* **Maintainability & Portability:** Code modularized into `Code.gs` and `Operations.gs`, functions arranged in strict alphabetical order, and spreadsheet IDs managed via `PropertiesService`.

---

## 5. Scope & Future Roadmap (Post-Handoff)

* **Phase 1 (Delivered / Current):** Core public form, operator binding, multi-party notifications, operator rejection flow, and execution audit logging.
* **Phase 2 (Backlog / Future Dev):**
  * Admin decision UI (processing approval/denial directly within the web app without manual spreadsheet edits).
  * Hard double-booking validation (conflict checks preventing two overlapping reservations for the same `BoatID`).
  * Automated Google Calendar integration syncing approved reservations to a DIYC Fleet Calendar.
