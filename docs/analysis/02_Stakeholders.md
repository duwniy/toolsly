# 02. Stakeholders and Roles

## User Roles
Toolsly defines three primary roles for system interaction:

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **RENTER** | The Client / Customer | Search catalog, create orders, view personal rental history. |
| **STAFF** | Branch Consultant / Employee | Verify clients, issue/receive items, update item condition, manage local inventory. |
| **ADMIN** | Business Owner / Manager | View analytics, manage global settings, add new branches and models. |

## Verification Logic (`is_verified`)
- **STAFF** is responsible for verifying personal documents (Passport/ID).
- The `is_verified` flag is mandatory for issuing items where `market_value > 5000 RUB`.
