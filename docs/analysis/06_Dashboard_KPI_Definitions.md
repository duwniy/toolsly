# 06. Dashboard KPI Definitions

This document defines the formulas and data sources for the management dashboard.

## 📈 Revenue KPI
- **Target**: Monthly revenue trends.
- **Formula**: `SUM(total_price)` from orders where `actual_end_date` is within the current month.
- **Goal**: Monitor business growth and seasonal peaks.

## 🏗️ Operations KPI: Branch Occupancy
- **Target**: Efficiency of storage utilization per branch.
- **Formula**: `(ItemsCount / StorageCapacity) * 100`.
- **Logic**: Counts specifically items with `branch_id == :branchId`.
- **Visualization**: Radial Gauge or Bar chart (one per branch).
- **Warning Threshold**: > 80% (indicates logistics pressure).

## 🛠️ Assets KPI: Tool Health (Damage Stats)
- **Target**: Quality control and maintenance planning.
- **Segmented by**:
    - **NEW**: Ready for heavy use.
    - **USED**: Requires regular checks.
    - **DAMAGED**: Needs repair (unavailable for rent).
    - **BROKEN**: Pending write-off (unavailable for rent).
- **Calculation**: Count of items per `condition` value.

## 🏆 Market KPI: Top Rented Models
- **Target**: Inventory procurement planning.
- **Formula**: Count of `order_items` joined with `equipment_models`, sorted by frequency DESC.
