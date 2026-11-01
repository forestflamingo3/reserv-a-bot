# ReservABot Mock Test Fixtures

Use these test datasets to populate `ReservABot_Config` for end-to-end sandbox verification.

---

## 1. `Boats` Tab
| BoatID | BoatName | Status |
| :--- | :--- | :--- |
| `B1` | `Whaler 1 (1999 Montauk 17)` | `Active` |
| `B2` | `Whaler 2 (Dauntless 180)` | `Active` |
| `B3` | `Signal Boat (Committee)` | `Active` |
| `B4` | `RIB Mark 1` | `Inactive` |

---

## 2. `Operators` Tab
| OperatorID | BoatID | OperatorName | OperatorEmail | Status |
| :--- | :--- | :--- | :--- | :--- |
| `OP101` | `B1` | `Captain Jack Aubrey` | `diycreservabot+op1@gmail.com` | `Active` |
| `OP102` | `B1` | `Karol Pichon` | `diycreservabot+op2@gmail.com` | `Active` |
| `OP103` | `B2` | `Captain Jack Aubrey` | `diycreservabot+op1@gmail.com` | `Active` |
| `OP104` | `B2` | `Stephen Maturin` | `diycreservabot+op3@gmail.com` | `Active` |
| `OP105` | `B3` | `Paul Leonard` | `diycreservabot+op4@gmail.com` | `Active` |

---

## 3. `Users` Tab
| UserID | Email | Role | Status |
| :--- | :--- | :--- | :--- |
| `U001` | `diycreservabot@gmail.com` | `Super` | `Active` |
| `U002` | `fleetcaptain@diyc.org` | `Admin` | `Active` |
| `U003` | `racecommittee@diyc.org` | `Admin` | `Active` |
| `U004` | `member@example.com` | `Member` | `Active` |

---

## 4. `Parameters` Tab
| ParamName | ParamValue |
| :--- | :--- |
| `NOTIFY_SUPER_ON_ALL` | `true` |
