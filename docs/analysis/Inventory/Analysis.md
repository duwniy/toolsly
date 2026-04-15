# Analysis: Inventory Management

## 1. Цель
Учет парка оборудования (Models) и конкретных единиц (Items) с контролем состояния и местоположения.

## 2. Техническое решение
- **Hierarchy**: `Category` -> `EquipmentModel` -> `EquipmentItem`.
- **Item Tracking**: Каждый `EquipmentItem` имеет уникальный `serial_number`.
- **Branch Binding**: Каждая единица привязана к `Branch` (филиалу).
- **Condition State**: Контроль износа через поле `condition` (NEW, USED, DAMAGED).

## 3. Безопасность
- Просмотр каталога доступен всем.
- Создание моделей и филиалов доступно только `ADMIN`.
- Изменение состояния (создание `Items`) доступно `STAFF`.

## 4. Data Flow
1. Admin создает `Category` и `EquipmentModel`.
2. Staff добавляет физическую единицу `EquipmentItem` в конкретный `Branch`.
3. При каждой аренде/возврате обновляется `branch_id` (при необходимости) и `status`.
