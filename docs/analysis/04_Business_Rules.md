# 04. Business Rules

## 1. Pricing Engine
The system automates price calculation based on the following logic:

- **Base Formula**: `Total = (Base Daily Price * Days) + Weekend Markup - Bulk Discount`.
- **Weekend Markup**: `+20%` to the daily rate if the day is Saturday or Sunday.
- **Bulk Discount**: `-10%` from the total sum if the duration `>= 8 days`.

## 2. High-Value Equipment Control
- **Constraint**: Items with `market_value > 5000 RUB` cannotTransition to `ISSUED` status unless the User has `is_verified = true`.

## 3. Branch Logistics
- **Storage Limit**: A Branch cannot accept a return if its current item count reaches `storage_capacity`.
- **Inter-branch Returns**: Allowed by default, provided capacity exists.

## 4. Concurrency (Soft Lock)
- **Duration**: 15 minutes.
- **Cleanup**: An automated task or database trigger must release `RESERVED` items back to `AVAILABLE` if the order isn't issued within the window.
