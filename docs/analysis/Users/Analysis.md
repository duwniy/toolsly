# Analysis: User Management & Security

## 1. Цель
Обеспечение безопасного доступа к системе на основе ролей (`RENTER`, `STAFF`, `ADMIN`) и верификации пользователей.

## 2. Техническое решение
- **Spring Security**: Использование `SecurityFilterChain` для фильтрации запросов.
- **JWT**: Stateless аутентификация через токены (JJWT библиотека).
- **Password Hashing**: Использование `BCryptPasswordEncoder`.
- **RBAC**: Ограничение доступа к эндпоинтам на основе ролей (например, только `STAFF` может изменять статус `is_verified`).

## 3. Безопасность
- Пароли никогда не хранятся в открытом виде.
- Верификация (`is_verified`) может быть установлена только пользователем с ролью `STAFF` или `ADMIN`.
- Все API-запросы (кроме Auth) требуют валидный JWT.

## 4. Data Flow
1. Пользователь логинится -> Получает JWT.
2. JWT передается в хедере `Authorization: Bearer <token>`.
3. `JwtFilter` валидирует токен и устанавливает `SecurityContext`.
4. `AuditorAware` использует текущего пользователя для заполнения полей `createdBy/updatedBy`.
