# ReservABot Email Template & Token Specification

Templates are stored in the `Templates` tab of `ReservABot_Config`.

---

## 1. Token Schema

| Token Placeholder | Description |
| :--- | :--- |
| `{{UserName}}` | Requester full name |
| `{{UserEmail}}` | Requester email address |
| `{{BoatID}}` | Boat identifier/name requested |
| `{{OperatorName}}` | Qualified operator assigned |
| `{{StartDateTime}}` | Booking start datetime |
| `{{EndDateTime}}` | Booking end datetime |
| `{{EventPurpose}}` | Purpose or regatta note |
| `{{ReservationUUID}}` | Unique tracking UUID |
| `{{ApprovalLink}}` | Admin approval/review portal link |
| `{{OperatorRejectLink}}` | Operator assignment decline link |
| `{{DenialReason}}` | Rejection or cancellation explanation |

---

## 2. Standard Templates Setup

### 1. `ApprovalRequest`
* **Subject:** `[ReservABot] New Reservation Request - {{BoatID}}`
* **Body:**
```text
A new boat reservation request has been submitted for review.

Requester: {{UserName}} ({{UserEmail}})
Boat: {{BoatID}}
Operator: {{OperatorName}}
Time: {{StartDateTime}} to {{EndDateTime}}
Purpose: {{EventPurpose}}

Review and approve or deny this request here:
{{ApprovalLink}}
```

### 2. `ReservationSubmittedUser`
* **Subject:** `[ReservABot] Reservation Request Received - {{BoatID}}`
* **Body:**
```text
Hello {{UserName}},

Your reservation request for {{BoatID}} has been received and is pending administrator review.

Details:
Operator: {{OperatorName}}
Schedule: {{StartDateTime}} to {{EndDateTime}}
Purpose: {{EventPurpose}}
Tracking ID: {{ReservationUUID}}

You will receive an update once the request is processed.
```

### 3. `ReservationSubmittedOperator`
* **Subject:** `[ReservABot] Assignment Notice: {{BoatID}} on {{StartDateTime}}`
* **Body:**
```text
Hello {{OperatorName}},

You have been listed as the operator for a requested boat booking:

Requester: {{UserName}}
Boat: {{BoatID}}
Time: {{StartDateTime}} to {{EndDateTime}}
Purpose: {{EventPurpose}}

If you are UNABLE to fulfill this assignment, click the link below to decline. This will cancel the reservation and notify the administration:
{{OperatorRejectLink}}
```

### 4. `OperatorRejectionAdmin`
* **Subject:** `[ReservABot] Operator Declined Assignment - {{BoatID}}`
* **Body:**
```text
Notice: Operator {{OperatorName}} has declined the booking assignment for {{BoatID}}.

Requester: {{UserName}} ({{UserEmail}})
Reason: {{DenialReason}}
Reservation UUID: {{ReservationUUID}}

The reservation status has automatically been marked as CANCELLED.
```

### 5. `OperatorRejectionUser`
* **Subject:** `[ReservABot] Reservation Cancelled (Operator Declined) - {{BoatID}}`
* **Body:**
```text
Hello {{UserName}},

Your reservation for {{BoatID}} on {{StartDateTime}} has been cancelled because the assigned operator ({{OperatorName}}) is unable to take the assignment.

Reason provided: {{DenialReason}}

Please submit a new request with an alternate operator or contact the club office.
```
