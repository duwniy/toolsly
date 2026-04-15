# Analysis: ReportingService & Dashboard KPIs

## 1. KPIs Definitions

### Revenue (Выручка)
- **Definition**: Сумма `total_price` всех заказов в статусе `RETURNED`, дата завершения которых (`actual_end_date`) попадает в текущий календарный месяц.
- **SQL Source**: `SELECT SUM(total_price) FROM orders WHERE status = 'RETURNED' AND actual_end_date >= date_trunc('month', now())`

### Model Popularity (Топ-5 моделей)
- **Definition**: Рейтинг моделей по количеству упоминаний в таблице `order_items`.
- **SQL Source**: Join `equipment_models` -> `equipment_items` -> `order_items` с группировкой по `model.name`.

### Equipment Health (Damage Rate)
- **Definition**: Процент инструментов со статусом `condition = 'DAMAGED'` от общего числа инструментов.
- **Critical Threshold**: > 10% требует закупки новых единиц.

## 2. Архитектура ReportingService
- Использует `EntityManager` для выполнения нативных SQL-запросов (Native Queries) для максимальной производительности на больших данных.
- Результаты агрегируются в `DashboardStats` DTO и отдаются на фронтенд.

## 3. Обновление данных
- Данные на Дашборде обновляются при каждом заходе пользователя (Refetching).
- Кэширование может быть внедрено через Spring Cache `@Cacheable` при росте нагрузки.
