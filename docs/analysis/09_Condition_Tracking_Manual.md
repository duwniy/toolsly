# Equipment Condition Tracking & Lifecycle Audit

This feature allows Toolsly to maintain a source of truth for the health of industrial equipment throughout its lifecycle.

## 1. Condition Lifecycle
Items can transition through the following states:
- **NEW**: Brand new equipment.
- **USED**: Used but fully functional (Normal wear).
- **WORN**: High wear-and-tear (Ready for maintenance).
- **DAMAGED**: Physical damage (Restricted for rent, triggers fine).
- **BROKEN**: Critical failure (Restricted for rent, triggers heavy fine).

## 2. Return Handshake Flow
When an equipment item is returned by a contractor:
1. **Inspection**: Staff inspects the tool and selects the return condition.
2. **Commentary**: Staff records any incidents or usage notes.
3. **Fines**: 
   - **Overdue**: 1.5x daily rate for every day past `planned_end_date`.
   - **Damaged**: 30% of Market Value.
   - **Broken**: 50% of Market Value.
4. **Audit**: Every condition change is recorded in the `audit_logs` table.

## 3. Maintenance Triggers
- **Usage Threshold**: If an item's cumulative rental days exceed **50 days**, it is automatically flagged for `MAINTENANCE`.
- **Manual Maintenance**: Staff can manually set `DAMAGED` or `BROKEN` items to `MAINTENANCE` after inspection.

## 4. History Tracking
Staff can view a detailed timeline of any tool via `GET /api/inventory/items/{id}/history`. This timeline includes:
- **Timestamp**: When the condition was logged.
- **Staff Name**: Who performed the inspection.
- **Condition**: State of the tool at the time of return.
- **Comment**: Descriptive notes about the tool's state.

---
*Last Updated: 2026-04-19*
