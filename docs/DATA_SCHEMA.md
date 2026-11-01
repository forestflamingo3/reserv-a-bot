# ReservABot Data Schema Specification

ReservABot maintains state across two Google Sheets workbooks. Strict adherence to column names and index order is required.

---

## 1. Workbook: `ReservABot_Config`

### Tab: `Boats`
Stores fleet inventory.
| Column | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| A | `BoatID` | String | Unique Boat Identifier (e.g., `B1`, `W180`) |
| B | `BoatName` | String | Display Name (e.g., `Whaler 1 (Montauk)`) |
| C | `Status` | String/Bool | Active status (`Active` or `TRUE`) |

### Tab: `Operators`
Maps approved operators to boats they are certified/qualified to skipper.
| Column | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| A | `OperatorID` | String | Unique identifier (e.g., `OP101`) |
| B | `BoatID` | String | Matches `Boats.BoatID` string exactly |
| C | `OperatorName` | String | Full name of operator |
| D | `OperatorEmail`| String | Valid email address |
| E | `Status` | String/Bool | Active status (`Active`, `TRUE`, or blank) |

### Tab: `Users`
System roles and notification lists.
| Column | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| A | `UserID` | String | Unique member ID |
| B | `Email` | String | Member / Admin email |
| C | `Role` | String | `Admin`, `Super`, or `Member` |
| D | `Status` | String/Bool | Active status (`Active` or `TRUE`) |

### Tab: `Parameters`
System runtime flags and configurations.
| Column | Name | Type | Sample Value |
| :--- | :--- | :--- | :--- |
| A | `ParamName` | String | `NOTIFY_SUPER_ON_ALL` |
| B | `ParamValue` | String | `true` |

---

## 2. Workbook: `ReservABot_Operations`

### Tab: `Reservations`
Transactional reservation records.
| Col | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| A | `Timestamp` | DateTime | Submission date and time |
| B | `UserEmail` | String | Email of requester |
| C | `UserName` | String | Name of requester |
| D | `BoatID` | String | Identifier of requested vessel |
| E | `OperatorName` | String | Selected assigned operator |
| F | `StartDateTime` | DateTime/String | Reservation start |
| G | `EndDateTime` | DateTime/String | Reservation end |
| H | `EventPurpose` | String | Description / Regatta role |
| I | `Status` | String | `Pending`, `Approved`, `Denied`, `Cancelled` |
| J | `ReservationUUID`| String | UUID token (used for email action links) |
| K | `DenialReason` | String | Denial explanation or operator rejection note |

### Tab: `Execution_Logs`
Operational audit trail and error logs.
| Col | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| A | `Timestamp` | DateTime | Log generation timestamp |
| B | `Level` | String | `INFO`, `WARN`, `ERROR` |
| C | `Message` | String | Detailed trace message |
