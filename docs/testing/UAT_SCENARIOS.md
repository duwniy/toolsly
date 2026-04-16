# UAT Scenarios for Milestone 6

This document outlines the key business logic test cases to be performed during the User Acceptance Testing (UAT).

## Scenario 1: High-Value Equipment Verification
**Goal**: Verify that unverified users cannot rent equipment with market value > 5000 RUB.
- **Actor**: `client_new@mail.com` (not verified)
- **Item**: `Перфоратор Makita` (MK-001, Market Value: 15,000 RUB)
- **Action**: Create and attempt to issue an order.
- **Expected Result**: System throws `BusinessException` with code `VERIFICATION_REQUIRED`.

## Scenario 2: Branch Storage Capacity Limit
**Goal**: Verify that a branch cannot accept items exceeding its `storage_capacity`.
- **Actor**: `staff_north@toolsly.com`
- **Context**: "Северный терминал" has a capacity of **2**.
- **Action**: Return an order containing a 3rd item to this branch.
- **Expected Result**: System throws `BusinessException` with code `CAPACITY_EXCEEDED`.

## Scenario 3: Bulk Discount Calculation
**Goal**: Verify that the Pricing Engine correctly applies a 10% discount for long-term rentals.
- **Actor**: Any RENTER.
- **Rental Duration**: 10 days.
- **Action**: Use the pricing engine or create a reservation.
- **Expected Result**: Total price should be `(Daily Rate * 10) * 0.9`. Note that weekend markups (+20%) still apply to specific days before the discount.

## Scenario 4: Staff-Branch Data Insulation
**Goal**: Verify that STAFF users are correctly linked to their branches.
- **Actor**: `staff_north@toolsly.com`
- **Action**: Access the branch-specific dashboard.
- **Expected Result**: Only items and analytics for "Северный терминал" are displayed.
