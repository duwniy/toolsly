# 08. Glossary: Toolsly Domain Terms

| Term | Russian Term | Description |
| :--- | :--- | :--- |
| **Model** | Модель | A definition of a tool type (e.g., "Bosch GSB 18V-55"). Contains specs, images, and category info. |
| **Item** | Экземпляр (Инструмент) | A physical instance of a Model with a unique serial number or internal ID. |
| **Branch** | Филиал (Точка) | A physical location where items are stored and rented. Has a `storage_capacity`. |
| **Item** | Экземпляр | Конкретная физическая единица инструмента с уникальным серийным номером. |
| **Model** | Модель | Тип оборудования (Makita HR2470) с базовой ценой и спецификациями. |
| **Soft Lock** | Мягкая блокировка | Temporal reservation (15 min) of an Item during checkout window. |
| **Order** | Заказ | Документ аренды, фиксирующий сроки, цену и участвующие стороны. |
| **Condition** | Состояние | Текущее физическое состояние экземпляра: `NEW`, `USED`, `WORN`, `DAMAGED`, `BROKEN`. |
| **Audit Log** | Журнал аудита | Immutable history of state changes (e.g., condition history, status updates). |
| **Verified** | Верифицирован | Flag for Users, mandatory for high-value items (>5000 RUB). |
| **Optimistic Lock** | Оптимистичная блок-ка | Concurrency control using `@Version` to prevent double-booking. |
