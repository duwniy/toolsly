# Analysis: Core Infrastructure & JPA Foundation

## 1. Цель
Обеспечение единого стандарта хранения данных, автоматического аудита и масштабируемой архитектуры БД на основе UUID.

## 2. Техническое решение
- **BaseEntity**: Абстрактный класс с `@MappedSuperclass`, предоставляющий UUID PK и поля аудита (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`).
- **UUID Strategy**: Использование `UUID.randomUUID()` при инициализации (соотв. PostgreSQL `uuid-ossp`).
- **Auditing**: Использование `AuditingEntityListener` из Spring Data JPA для автоматического заполнения временных меток и имени пользователя.
- **Optimistic Locking**: Поле `@Version` во всех сущностях для предотвращения конфликтов параллельного доступа (Lost Update).

## 3. Безопасность
Все системные поля (`created_at`, `updated_at` и т.д.) защищены от прямой записи через API (используется `updatable = false`).

## 4. Data Flow
При сохранении любой сущности:
1. JPA вызывает `AuditingEntityListener`.
2. Генерируется или сохраняется UUID.
3. Версия увеличивается автоматически при обновлении.
