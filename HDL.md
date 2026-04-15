# 03. High-Level Design (HLD) — Toolsly

## 1. Технологический стек
- **Backend:** Java 21, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA.
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, TanStack Query.
- **Database:** PostgreSQL (Supabase).
- **Hosting:** Render (Backend), Vercel (Frontend).

## 2. Схема базы данных (Ключевые сущности)
- **users:** `uuid`, `email`, `password_hash`, `role`, `is_verified`.
- **branches:** `uuid`, `name`, `storage_capacity`.
- **equipment_models:** `uuid`, `name`, `base_daily_price`, `market_value`.
- **equipment_items:** `uuid`, `model_id`, `branch_id`, `status`, `condition`, `serial_number`, `reserved_until`.
- **orders:** `uuid`, `renter_id`, `staff_id`, `status`, `total_price`, `branch_start_id`, `branch_end_id`.

## 3. Архитектурные паттерны
- **Layered Architecture:** Controller -> Service -> Repository -> Entity.
- **DTO Pattern:** Разделение внутренних сущностей и API ответов.
- **Audit Logging:** Использование Spring AOP для логирования всех изменений статусов в таблицу `audit_logs`.
- **Optimistic Locking:** Использование `@Version` в JPA для предотвращения конфликтов при бронировании.

## 4. API Endpoints (Примеры)
- `POST /api/v1/orders` — создание заказа и расчет цены.
- `PATCH /api/v1/orders/{id}/reserve` — активация Soft Lock.
- `PATCH /api/v1/orders/{id}/issue` — выдача (с проверкой верификации).
- `GET /api/v1/catalog` — доступные инструменты с фильтром по филиалам.