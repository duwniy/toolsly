# Analysis: Inventory Management

## 1. Цель
Учет парка оборудования (Models) и конкретных единиц (Items) с контролем состояния и местоположения.

## 2. Техническое решение
- **Hierarchy**: `Category` -> `EquipmentModel` -> `EquipmentItem`.
- **Item Tracking**: Каждый `EquipmentItem` имеет уникальный `serial_number`.
- **Branch Binding**: Каждая единица привязана к `Branch` (филиалу).
- **Condition State**: Контроль износа через поле `condition` (`NEW`, `USED`, `WORN`, `DAMAGED`, `BROKEN`).
- **History Audit**: Любое изменение состояния логируется в `audit_logs` для восстановления хронологии износа.
- **Maintenance Triggers**: Автоматический переход в `MAINTENANCE`, если суммарная аренда превышает 50 дней.

## 3. Безопасность
- Просмотр каталога и Badges состояния доступен всем пользователям.
- Создание моделей и филиалов доступно только `ADMIN`.
- Прием возвратов и фиксация `Condition` доступно только `STAFF`.

## 4. Data Flow
1. Admin создает `Category` и `EquipmentModel`.
2. Staff добавляет физическую единицу `EquipmentItem` в конкретный `Branch`.
3. При возврате `STAFF` фиксирует состояние, система рассчитывает штрафы и записывает `AuditLog`.
4. Если превышен лимит использования (50 дней), `Item` переходит в `MAINTENANCE`.
