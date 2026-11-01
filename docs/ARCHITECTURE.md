# ReservABot System Architecture & Workflow Sequences

---

## 1. System Context Diagram

```text
+-----------------------+            +---------------------------------+
| Requester / Member    |            | Assigned Operator (Skipper)     |
| (Browser / Web App)   |            | (Email Client / Rejection Link) |
+-----------+-----------+            +----------------+----------------+
            |                                         |
            | HTTP POST (Form Submit)                 | HTTP GET (?action=op_reject)
            v                                         v
+----------------------------------------------------------------------+
|                     ReservABot Web App Service                       |
|                   (diycreservabot@gmail.com)                         |
|   +-----------------------+              +-----------------------+   |
|   | src/Code.gs (Router)  | <----------> | src/Operations.gs     |   |
|   +-----------------------+              +-----------+-----------+   |
+------------------------------------------------------|---------------+
                                                       |
         +---------------------------------------------+-------------------------------+
         | Read/Write                                  | MailApp.sendEmail             | Read/Write
         v                                             v                               v
+-----------------------------+           +--------------------------+    +-----------------------------+
| ReservABot_Config Workbook  |           | Google Workspace SMTP    |    | ReservABot_Operations Wkbk  |
| - Boats                     |           | - Admin Alerts           |    | - Reservations              |
| - Operators                 |           | - Operator Notices       |    | - Execution_Logs            |
| - Users                     |           | - Requester Confirmations|    +-----------------------------+
| - Templates                 |           +--------------------------+
| - Parameters                |
+-----------------------------+
```

---

## 2. Sequence: Reservation Request Lifecycle

```text
Requester              Web App (Client/Server)            Google Sheets                Operator / Admins
    |                            |                              |                              |
    |-- 1. Open Web App -------->|                              |                              |
    |   (Loads active boats)     |-- 2. getActiveBoats() ------>|                              |
    |                            |<-- Returns Boat list --------|                              |
    |                            |                              |                              |
    |-- 3. Select Boat --------->|                              |                              |
    |   (Triggers lookup)        |-- 4. getOperatorsForBoat() ->|                              |
    |                            |<-- Returns Operator list ----|                              |
    |                            |                              |                              |
    |-- 5. Submit Form --------->|                              |                              |
    |                            |-- 6. Append Row ------------>| (Reservations Sheet)         |
    |                            |      Generate UUID           |                              |
    |                            |-- 7. Log Event ------------->| (Execution_Logs Sheet)       |
    |                            |-- 8. Render Templates ------>| (Templates Sheet)            |
    |                            |-- 9. MailApp.sendEmail() ---------------------------------->|
    |                            |      (Admins, Requester,                                    |
    |                            |       Operator with token links)                            |
    |<-- 10. Success Message ----|                                                             |
```

---

## 3. Sequence: Operator Rejection Lifecycle

```text
Operator               Web App (doGet / op_reject)         Google Sheets                Requester & Admins
    |                            |                              |                              |
    |-- 1. Click Rejection Link >|                              |                              |
    |   (?action=op_reject&id=..) |                              |                              |
    |<-- 2. Render Modal Form ---|                              |                              |
    |                            |                              |                              |
    |-- 3. Submit Reason ------->|                              |                              |
    |                            |-- 4. Update Status (Cancel)->|                              |
    |                            |      Set DenialReason (Col K)|                              |
    |                            |-- 5. Log Operational Event ->| (Execution_Logs)             |
    |                            |-- 6. Send Notifications ----------------------------------->|
    |                            |      (OperatorRejectionUser                                 |
    |                            |       OperatorRejectionAdmin)                               |
    |<-- 7. Success Banner ------|                                                             |
```
