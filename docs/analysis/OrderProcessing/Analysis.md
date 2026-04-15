# Analysis: Order Processing & State Machine

## 1. Цель
Управление жизненным циклом аренды, обеспечение атомарности перехода статусов и управление Soft Lock.

## 2. Техническое решение
- **State Machine**: Реализована в `OrderService`.
- **Статусы**: `CREATED` -> `RESERVED` -> `ISSUED` -> `RETURNED` -> `CLOSED`.
- **Soft Lock Logic**:
    - При переходе в `RESERVED` поле `reserved_until` у `EquipmentItem` устанавливается на `now + 15 min`.
    - Если статус не сменился на `ISSUED`, фоновая задача (ShedLock или @Scheduled) возвращает статус `AVAILABLE`.
- **Optimistic Locking**: Использование `@Version` гарантирует, что один экземпляр не будет забронирован двумя пользователями одновременно.

## 3. Безопасность
- Создание заказа: `RENTER`.
- Выдача (`ISSUE`) и Прием (`RETURN`): Только `STAFF`.
- Межфилиальный возврат: Требует проверки `storage_capacity` филиала-получателя.

## 4. Data Flow
1. `POST /orders` -> `CREATED`.
2. `PATCH /orders/{id}/reserve` -> `RESERVED` (включается Soft Lock).
3. `PATCH /orders/{id}/issue` -> `ISSUED` (проверка `is_verified`).
4. `PATCH /orders/{id}/return` -> `RETURNED`.
