# Swagger Manual Testing Flows

This guide describes how to test the core business processes of Toolsly using the Swagger UI (`/swagger-ui.html`).

## 🔑 Prerequisites
1. Get a valid JWT token via `POST /api/auth/login` (Identity group).
2. Click **Authorize** in Swagger and enter `Bearer <your_token>`.

---

## 🚀 Scenario 1: Complete Rental Lifecycle

### 1. Catalog Discovery
- **Endpoint**: `GET /api/catalog/models`
- **Action**: Find a tool model ID (e.g., "Drill Bosch X1").
- **Expected**: List of models with prices.

### 2. Create Order
- **Endpoint**: `POST /api/orders`
- **Payload**:
  ```json
  {
    "renterId": "...",
    "branchStartId": "...",
    "plannedEndDate": "2026-04-20T10:00:00Z"
  }
  ```
- **Expected**: `200 OK` with `OrderResponse` (Status: `CREATED`, ID: `<order_id>`).

### 3. Reserve Tools
- **Endpoint**: `POST /api/orders/{id}/reserve`
- **Action**: Use the `<order_id>` from the previous step.
- **Expected**: `200 OK`. Order status moves to `RESERVED`, and total price is calculated.

### 4. Issue Tools (Staff Action)
- **Endpoint**: `POST /api/orders/{id}/issue`
- **Query Params**: `staffId=...`
- **Expected**: `200 OK`. Order status moves to `ISSUED`. Tools are marked as `RENTED`.

### 5. Return Tools
- **Endpoint**: `POST /api/orders/{id}/return`
- **Query Params**: `branchId=...`
- **Expected**: `200 OK`. Order status moves to `RETURNED`. `actualEndDate` is set.

---

## 🛠️ Scenario 2: Inventory Management
1. **Check Items**: `GET /api/inventory/items`.
2. **Move Item**: `POST /api/inventory/items/{id}/location?branchId=...`.
3. **Verify Branches**: `GET /api/inventory/branches`.
