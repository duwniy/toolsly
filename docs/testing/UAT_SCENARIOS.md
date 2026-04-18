# UAT Test Scenarios — Toolsly Platform

## Test Accounts (V11 Migration)

| Persona | Email | Role | Verified | Branch |
|---|---|---|---|---|
| **Алексей Смирнов** | `alexey.smirnov@toolsly.com` | STAFF | ✅ | Склад Сокольники (Центр) |
| **Игорь Волков** | `igor.volkov@mail.com` | RENTER | ✅ | — |

> Password for both: `password123`

## Scenario 1: Full Rental Cycle (Happy Path)

1. Login as **Игорь Волков** (RENTER) → redirected to `/catalog`.
2. Browse available equipment models.
3. Create a new order selecting an available item from Сокольники.
4. Login as **Алексей Смирнов** (STAFF) → redirected to Dashboard.
5. Issue the order — verify renter is verified → success.
6. Return the order — confirm condition assessment and penalty calculation (if applicable).
7. Verify order status transitions: CREATED → ISSUED → RETURNED → CLOSED.

## Scenario 2: Dashboard KPI Validation

1. Login as **Алексей Смирнов** (STAFF).
2. Verify Dashboard shows Revenue charts populated from 10 historical orders (March–April).
3. Verify Popular Models widget shows tool usage statistics.

## Scenario 3: Storage Capacity Limit

1. The branch "Пункт выдачи Мурино (Север)" has `storage_capacity = 3` and currently holds 2 items.
2. Attempt to transfer a 4th item to Мурино — system should enforce capacity limit.

## Additional Accounts (Available but not on Quick Access)

| Persona | Email | Role | Verified | Purpose |
|---|---|---|---|---|
| Марина Кузнецова | `marina.k@toolsly.com` | STAFF | ✅ | North branch staff |
| Дмитрий Назаров | `dmitry.nazarov@mail.com` | RENTER | ❌ | Test ISSUE denial for unverified renter |
| Ольга Степанова | `olga.stepanova@mail.com` | RENTER | ✅ | Additional verified renter |
| Admin | `admin@toolsly.com` | ADMIN | ✅ | System administration |
