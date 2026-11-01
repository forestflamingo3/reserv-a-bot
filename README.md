# ReservABot - Boat Reservation & Operations Management System

A standalone Google Apps Script (GAS) web application designed for Davis Island Yacht Club (DIYC) to manage powerboat and mark boat reservations, qualified operator assignments, multi-tier approvals, and cancellation workflows.

---

## 1. System Architecture

ReservABot runs as a serverless Google Apps Script Web App deployed directly within Google Workspace.

* **Frontend:** Responsive web interface (`src/Index.html`) providing the public reservation form, dynamic dropdown bindings, operator assignment selectors, and tokenized approval/rejection endpoints.
* **Backend:** Google Apps Script V8 runtime:
  * `src/Code.gs`: Routing (`doGet`), configuration loader (`CONFIG` via Script Properties), and HTML templating.
  * `src/Operations.gs`: Core business logic, strictly alphabetized functions, sheet transaction isolation, and template parsing.
  * `src/Bootstrap.gs`: One-click workbook initialization and schema creation utility.
* **Data Layer:** Two dedicated Google Sheets workbooks:
  * `ReservABot_Config`: Static and operational metadata (`Boats`, `Operators`, `Users`, `Templates`, `Parameters`).
  * `ReservABot_Operations`: Transactional records (`Reservations`, `Execution_Logs`).
* **Identity & Messaging:**
  * Runs under dedicated service identity: `diycreservabot@gmail.com`.
  * Multi-party notifications via `MailApp.sendEmail` with tokenized templates and configurable super-admin CC routing (`NOTIFY_SUPER_ON_ALL`).

---

## 2. Complete Repository Layout

```text
reservabot/
├── .gitignore                     # Ignores clasp credentials and local environment files
├── .claspignore                   # Prevents documentation from pushing to Apps Script runtime
├── README.md                      # System overview, architecture, and workflow lifecycle
├── SETUP.md                       # Cold-start bootstrapping, clasp CLI guide, permissions
├── appsscript.json                # Apps Script manifest and OAuth scopes
├── docs/
│   ├── PRD.md                     # Product Requirements Document (business context & specs)
│   ├── ARCHITECTURE.md            # Architecture diagrams and sequence workflows
│   ├── DATA_SCHEMA.md             # Complete sheet, tab, column, and data-type reference
│   ├── EMAIL_TEMPLATES.md         # Template definitions, tokens, and routing triggers
│   ├── MOCK_DATA.md               # Seed data for boats, operators, and test users
│   └── RUNBOOK.md                 # Maintenance guide, troubleshooting, and deployment tips
└── src/
    ├── Code.gs                    # Main controller, doGet router, Script Property configuration
    ├── Operations.gs              # Core logic (strictly alphabetized functions)
    ├── Bootstrap.gs               # One-click workbook builder and template seeder
    └── Index.html                 # UI layout, client-side handlers, and action modals
```

---

## 3. Quick Start for New Developers

1. Create two blank Google Sheets workbooks: `ReservABot_Config` and `ReservABot_Operations`.
2. Push repository code to Apps Script via clasp or paste `src/` files into the editor.
3. Configure `WORKBOOK_CONFIG_ID`, `WORKBOOK_OPS_ID`, and `SYSTEM_SUPER_EMAIL` in **Script Properties**.
4. Run `bootstrapWorkbooks()` in `src/Bootstrap.gs` to automatically construct all sheet tabs, headers, and default templates.
5. Populate fleet and operator records from `docs/MOCK_DATA.md`.
6. Run `forceAuthPrompt()` in `src/Code.gs` to grant OAuth scopes.
7. Deploy as Web App (`Execute as: Me`, `Access: Anyone`).
