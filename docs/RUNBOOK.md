# ReservABot Operational Runbook & Troubleshooting

A practical reference for common maintenance tasks, diagnosing execution faults, and managing deployments.

---

## 1. Deploying Code Changes

Google Apps Script web applications **do not** automatically serve saved editor code. Every production code change requires creating a new version:

1. In the Apps Script Editor, open **Deploy** -> **Manage deployments**.
2. Click the **Pencil (Edit)** icon next to the active deployment.
3. In the **Version** dropdown, select **New version**.
4. Click **Deploy**.
5. Test the live URL in an incognito window.

---

## 2. Permission and OAuth Scope Management

### Symptom: `You do not have permission to call MailApp.sendEmail`
* **Root Cause:** A new scope was added to code (`https://www.googleapis.com/auth/script.send_mail`), but the service identity has not accepted the consent screen.
* **Resolution:**
  1. Open the project editor while logged into `diycreservabot@gmail.com`.
  2. Select `forceAuthPrompt` from the function dropdown on the toolbar.
  3. Click **Run** and click through **Review permissions** -> **Advanced** -> **Allow**.
  4. Cut a **New version** deployment.

---

## 3. Common Operational Pitfalls

| Issue | Root Cause | Fix |
| :--- | :--- | :--- |
| Anonymous users see permission errors reading sheets | Deployment set to *Execute as: User accessing the web app* | Set deployment to **Execute as: Me (`diycreservabot@gmail.com`)** with access set to **Anyone**. |
| Operator dropdown remains empty or disabled | Timing bug or boat ID mismatch | Ensure `getOperatorsForBoat` compares trimmed string IDs; verify `loadBoatsDropdown` fires `onchange` cleanly. |
| Emails send from personal developer account | Deployment published under personal Gmail session | Publish the web app deployment directly while authenticated as `diycreservabot@gmail.com`. |
| Script quota exhausted | Google daily limit reached (100 emails/day for free Gmail, 1,500/day for Workspace) | Toggle `NOTIFY_SUPER_ON_ALL` to `false` in `Parameters` sheet to reduce message multiplication. |

---

## 4. Inspecting Audit Logs

All operational warnings and errors write directly to `ReservABot_Operations` -> **`Execution_Logs`**.

```text
[Timestamp]            [Level]   [Message]
2026-10-31 14:02:11    INFO      Reservation created & notifications dispatched [UUID: abc-123]
2026-10-31 14:15:30    WARN      Operator notification email failed: Invalid recipient
```
