-- V10: Real-World Data Seeding
-- Replaces mock data with realistic Toolssly inventory, branches, and users.

-- 1. Clear existing data (reverse dependency order)
DELETE FROM audit_logs;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM equipment_items;
DELETE FROM equipment_models;
DELETE FROM categories;
DELETE FROM users;
DELETE FROM branches;

-- 2. Seed Branches
INSERT INTO branches (id, name, address, storage_capacity) VALUES
('b1111111-b111-b111-b111-b11111111111', 'Флагманский (ул. Ленина, 10)', 'г. Москва, ул. Ленина, д. 10', 500),
('b2222222-b222-b222-b222-b22222222222', 'Северный (пр. Мира, 5)', 'г. Москва, пр. Mira, д. 5', 300),
('b3333333-b333-b333-b333-b33333333333', 'Пункт Мега (ТЦ Мега)', 'г. Москва, пересечение МКАД и Калужского ш., ТЦ Мега', 150);

-- 3. Seed Users
-- Password is "password123": $2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS
INSERT INTO users (id, email, password_hash, role, is_verified, branch_id) VALUES
('11111111-1111-1111-1111-111111111111', 'staff_central@toolsly.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'STAFF', TRUE, 'b1111111-b111-b111-b111-b11111111111'),
('22222222-2222-2222-2222-222222222222', 'verified_renter@mail.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'RENTER', TRUE, NULL),
('33333333-3333-3333-3333-333333333333', 'unverified_renter@mail.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'RENTER', FALSE, NULL),
('44444444-4444-4444-4444-444444444444', 'admin@toolsly.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'ADMIN', TRUE, 'b1111111-b111-b111-b111-b11111111111');

-- 4. Seed Categories
INSERT INTO categories (id, name, description) VALUES
('c1111111-c111-c111-c111-c11111111111', 'Электроинструмент', 'Профессиональный электроинструмент для строительства и ремонта'),
('c2222222-c222-c222-c222-c22222222222', 'Измерительная техника', 'Высокоточное лазерное и оптическое оборудование'),
('c3333333-c333-c333-c333-c33333333333', 'Садовая техника и лестницы', 'Стремянки, лестницы и оборудование для благоустройства');

-- 5. Seed Equipment Models
INSERT INTO equipment_models (id, category_id, name, manufacturer, base_daily_price, market_value) VALUES
('e1111111-e111-e111-e111-e11111111111', 'c1111111-c111-c111-c111-c11111111111', 'Перфоратор Makita HR2470', 'Makita', 800.00, 14500.00),
('e2222222-e222-e222-e222-e22222222222', 'c2222222-c222-c222-c222-c22222222222', 'Нивелир Bosch GLL 3-80', 'Bosch', 1500.00, 28000.00),
('e3333333-e333-e333-e333-e33333333333', 'c1111111-c111-c111-c111-c11111111111', 'Дрель Интерскол', 'Интерскол', 400.00, 4500.00),
('e4444444-e444-e444-e444-e44444444444', 'c3333333-c333-c333-c333-c33333333333', 'Стремянка 2м', 'Alumet', 300.00, 3200.00);

-- 6. Seed Equipment Items
INSERT INTO equipment_items (id, model_id, branch_id, serial_number, status, condition) VALUES
(uuid_generate_v4(), 'e1111111-e111-e111-e111-e11111111111', 'b1111111-b111-b111-b111-b11111111111', 'MK-2470-001', 'AVAILABLE', 'NEW'),
(uuid_generate_v4(), 'e1111111-e111-e111-e111-e11111111111', 'b1111111-b111-b111-b111-b11111111111', 'MK-2470-002', 'AVAILABLE', 'USED'),
(uuid_generate_v4(), 'e2222222-e222-e222-e222-e22222222222', 'b1111111-b111-b111-b111-b11111111111', 'BS-GLL-801', 'AVAILABLE', 'NEW'),
(uuid_generate_v4(), 'e3333333-e333-e333-e333-e33333333333', 'b2222222-b222-b222-b222-b22222222222', 'IS-DRL-001', 'AVAILABLE', 'USED'),
(uuid_generate_v4(), 'e4444444-e444-e444-e444-e44444444444', 'b3333333-b333-b333-b333-b33333333333', 'AL-STR-001', 'AVAILABLE', 'NEW');
