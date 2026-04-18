-- V11: Massive UAT Data Seeding Rewritten (Random UUIDs)
-- Real-world entities replacing former templated test cases
-- "password123": $2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS

-- Clean up any residual old inserts to ensure clean seeding if re-ran
DELETE FROM audit_logs;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM equipment_items;
DELETE FROM equipment_models;
DELETE FROM categories;
DELETE FROM users;
DELETE FROM branches;

-- 1. Seed Branches (Сокольники, Мурино)
-- b_sokolniki: 6b3f7f09-1db7-4c45-9854-526b701bc3b3
-- b_murino: a43d9b89-21c8-47bc-8a1a-4d769c0d35e1
INSERT INTO branches (id, name, address, storage_capacity) VALUES
('6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'Склад Сокольники (Центр)', 'г. Москва, ул. Сокольнический вал, д. 2', 100),
('a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'Пункт выдачи Мурино (Север)', 'Ленинградская обл., г. Мурино, Оборонная ул.', 3);

-- 2. Seed 6 Distinct Users
-- u_alexey: e1f82c42-b35e-49b8-a619-3c82d5a73214 (Staff, Sokolniki)
-- u_marina: 9d8cf220-4b6a-4d37-8820-2a3b09de1c8d (Staff, Murino)
-- u_igor: 2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e (Renter, Verified)
-- u_dmitry: 7f4c92da-1e5b-43d7-86a2-5b9c1e7a4d3f (Renter, Not Verified)
-- u_olga: f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc (Renter, Verified)
-- u_admin: 3d8a7c2b-5e6f-4b9a-8c1d-2e5f4a7b9c6d (Admin)
INSERT INTO users (id, email, password_hash, role, is_verified, branch_id) VALUES
('e1f82c42-b35e-49b8-a619-3c82d5a73214', 'alexey.smirnov@toolsly.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'STAFF', TRUE, '6b3f7f09-1db7-4c45-9854-526b701bc3b3'), -- Алексей Смирнов
('9d8cf220-4b6a-4d37-8820-2a3b09de1c8d', 'marina.k@toolsly.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'STAFF', TRUE, 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1'), -- Марина Кузнецова
('2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e', 'igor.volkov@mail.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'RENTER', TRUE, NULL), -- Игорь Волков
('7f4c92da-1e5b-43d7-86a2-5b9c1e7a4d3f', 'dmitry.nazarov@mail.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'RENTER', FALSE, NULL), -- Дмитрий Назаров
('f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc', 'olga.stepanova@mail.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'RENTER', TRUE, NULL), -- Ольга Степанова
('3d8a7c2b-5e6f-4b9a-8c1d-2e5f4a7b9c6d', 'admin@toolsly.com', '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS', 'ADMIN', TRUE, '6b3f7f09-1db7-4c45-9854-526b701bc3b3'); -- Boss 

-- 3. Seed Categories
INSERT INTO categories (id, name, description) VALUES
('8e7b3c2d-9a1f-46e5-8c3b-2a5d4f1e9b7c', 'Строительное оборудование', 'Перфораторы, виброплиты, отбойные молотки'),
('5a9c4e2f-7b3d-4c8a-9e1b-6f3d2a5c8e4b', 'Измерительная техника', 'Нивелиры, лазерные уровни'),
('1c6b3a9d-5e2f-47c8-8a9b-3d6f2c5e4a1b', 'Электроинструмент', 'Шуруповерты, дрели, пилы');

-- 4. Seed Models
-- m_niv: a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6
-- m_vip: b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7
-- m_prf: c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8
-- m_shr: d4e5f6a7-b8c9-4ad1-e2f3-a4b5c6d7e8f9
INSERT INTO equipment_models (id, category_id, name, manufacturer, base_daily_price, market_value) VALUES
('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '5a9c4e2f-7b3d-4c8a-9e1b-6f3d2a5c8e4b', 'Оптический нивелир Bosch GOL 20 D', 'Bosch', 1800.00, 22000.00),
('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', '8e7b3c2d-9a1f-46e5-8c3b-2a5d4f1e9b7c', 'Виброплита Husqvarna LF 75 LAT', 'Husqvarna', 9500.00, 165000.00),
('c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', '8e7b3c2d-9a1f-46e5-8c3b-2a5d4f1e9b7c', 'Перфоратор Makita HR2470', 'Makita', 1200.00, 18000.00),
('d4e5f6a7-b8c9-4ad1-e2f3-a4b5c6d7e8f9', '1c6b3a9d-5e2f-47c8-8a9b-3d6f2c5e4a1b', 'Шуруповерт DeWalt DCD771C2', 'DeWalt', 500.00, 15000.00);

-- 5. Physical Inventory (15+ items) with distinct SNs
-- First 2 items stored dynamically later at Murino
INSERT INTO equipment_items (id, model_id, branch_id, serial_number, status, condition) VALUES
('e5f6a7b8-c9d0-4be1-f3a4-b5c6d7e8f9a0', 'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'SN-HUSQ-2024-001', 'AVAILABLE', 'NEW'),
('f6a7b8c9-d0e1-4cf2-a4b5-c6d7e8f9a0b1', 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'SN-BOS-2024-001', 'AVAILABLE', 'USED'),

-- Remainder at Sokolniki
('07b8c9d0-e1f2-4df3-b5c6-d7e8f9a0b1c2', 'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-MAK-2024-001', 'AVAILABLE', 'USED'),
('18c9d0e1-f2a3-4ef4-c6d7-e8f9a0b1c2d3', 'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-MAK-2024-002', 'AVAILABLE', 'WORN'),
('29d0e1f2-a3b4-4e05-d7e8-f9a0b1c2d3e4', 'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-MAK-2024-003', 'AVAILABLE', 'NEW'),
('3ae1f2a3-b4c5-4f16-e8f9-a0b1c2d3e4f5', 'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-MAK-2024-004', 'AVAILABLE', 'NEW'),

('4bf2a3b4-c5d6-4a27-f9a0-b1c2d3e4f5a6', 'd4e5f6a7-b8c9-4ad1-e2f3-a4b5c6d7e8f9', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-DEW-2024-001', 'AVAILABLE', 'USED'),
('5c03b4c5-d6e7-4b38-a0b1-c2d3e4f5a6b7', 'd4e5f6a7-b8c9-4ad1-e2f3-a4b5c6d7e8f9', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-DEW-2024-002', 'AVAILABLE', 'NEW'),
('6d14c5d6-e7f8-4c49-b1c2-d3e4f5a6b7c8', 'd4e5f6a7-b8c9-4ad1-e2f3-a4b5c6d7e8f9', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-DEW-2024-003', 'AVAILABLE', 'USED'),
('7e25d6e7-f8a9-4d5a-c2d3-e4f5a6b7c8d9', 'd4e5f6a7-b8c9-4ad1-e2f3-a4b5c6d7e8f9', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-DEW-2024-004', 'AVAILABLE', 'WORN'),

('8f36e7f8-a9b0-4e6b-d3e4-f5a6b7c8d9e0', 'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-HUSQ-2024-002', 'AVAILABLE', 'USED'),
('9047f8a9-b0c1-4f7c-e4f5-a6b7c8d9e0a1', 'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-HUSQ-2024-003', 'AVAILABLE', 'NEW'),

('a158a9b0-c1d2-408d-f5a6-b7c8d9e0a1b2', 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-BOS-2024-002', 'AVAILABLE', 'USED'),
('b269b0c1-d2e3-419e-a6b7-c8d9e0a1b2c3', 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-BOS-2024-003', 'AVAILABLE', 'WORN'),
('c37ac1d2-e3f4-42af-b7c8-d9e0a1b2c3d4', 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'SN-BOS-2024-004', 'AVAILABLE', 'NEW');

-- 6. Insert 10 Orders to simulate History for Revenue Graphics (March / April)
-- Igor: 2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e
-- Olga: f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc
-- Alexey: e1f82c42-b35e-49b8-a619-3c82d5a73214
INSERT INTO orders (id, renter_id, staff_id, branch_start_id, branch_end_id, status, total_price, created_at, updated_at) VALUES
('d48be2e3-f4a5-43b0-c8d9-e0a1b2c3d4e5', '2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e', 'e1f82c42-b35e-49b8-a619-3c82d5a73214', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'CLOSED', 6500.00, CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP - INTERVAL '38 days'),
('e59cf3f4-a5b6-44c1-d9e0-a1b2c3d4e5f6', 'f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc', '9d8cf220-4b6a-4d37-8820-2a3b09de1c8d', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'RETURNED', 22500.00, CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('f6ad0405-b6c7-45d2-e0a1-b2c3d4e5f6a7', '2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e', 'e1f82c42-b35e-49b8-a619-3c82d5a73214', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'CLOSED', 1420.00, CURRENT_TIMESTAMP - INTERVAL '28 days', CURRENT_TIMESTAMP - INTERVAL '25 days'),
('07be1516-c7d8-46e3-a1b2-c3d4e5f6a7b8', 'f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc', 'e1f82c42-b35e-49b8-a619-3c82d5a73214', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'CLOSED', 41800.00, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('18cf2627-d8e9-47f4-b2c3-d4e5f6a7b8c9', '2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e', '9d8cf220-4b6a-4d37-8820-2a3b09de1c8d', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'RETURNED', 5600.00, CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
('29d03738-e9f0-4805-c3d4-e5f6a7b8c9d0', 'f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc', 'e1f82c42-b35e-49b8-a619-3c82d5a73214', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'CLOSED', 1800.00, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('3ae14849-f0a1-4916-d4e5-f6a7b8c9d0e1', '2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e', 'e1f82c42-b35e-49b8-a619-3c82d5a73214', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'CLOSED', 13500.00, CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('4bf2595a-a1b2-4a27-e5f6-a7b8c9d0e1f2', 'f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc', '9d8cf220-4b6a-4d37-8820-2a3b09de1c8d', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'CLOSED', 8400.00, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('5c036a6b-b2c3-4b38-f6a7-b8c9d0e1f2a3', '2c9a6f1d-7b2e-41f8-9a6d-3f0b2f5a8c9e', 'e1f82c42-b35e-49b8-a619-3c82d5a73214', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', '6b3f7f09-1db7-4c45-9854-526b701bc3b3', 'RETURNED', 2900.00, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('6d147b7c-c3d4-4c49-a7b8-c9d0e1f2a3b4', 'f3a61d8b-9e2c-47a8-b64d-5f4c2e1ba3dc', '9d8cf220-4b6a-4d37-8820-2a3b09de1c8d', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', 'CLOSED', 14500.00, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '1 days');

-- Single linked item per order for metrics
INSERT INTO order_items (order_id, item_id) VALUES
('d48be2e3-f4a5-43b0-c8d9-e0a1b2c3d4e5', '07b8c9d0-e1f2-4df3-b5c6-d7e8f9a0b1c2'),
('e59cf3f4-a5b6-44c1-d9e0-a1b2c3d4e5f6', 'e5f6a7b8-c9d0-4be1-f3a4-b5c6d7e8f9a0'),
('f6ad0405-b6c7-45d2-e0a1-b2c3d4e5f6a7', '4bf2a3b4-c5d6-4a27-f9a0-b1c2d3e4f5a6'),
('07be1516-c7d8-46e3-a1b2-c3d4e5f6a7b8', '8f36e7f8-a9b0-4e6b-d3e4-f5a6b7c8d9e0'),
('18cf2627-d8e9-47f4-b2c3-d4e5f6a7b8c9', 'f6a7b8c9-d0e1-4cf2-a4b5-c6d7e8f9a0b1'),
('29d03738-e9f0-4805-c3d4-e5f6a7b8c9d0', 'a158a9b0-c1d2-408d-f5a6-b7c8d9e0a1b2'),
('3ae14849-f0a1-4916-d4e5-f6a7b8c9d0e1', 'b269b0c1-d2e3-419e-a6b7-c8d9e0a1b2c3'),
('4bf2595a-a1b2-4a27-e5f6-a7b8c9d0e1f2', '18c9d0e1-f2a3-4ef4-c6d7-e8f9a0b1c2d3'),
('5c036a6b-b2c3-4b38-f6a7-b8c9d0e1f2a3', '5c03b4c5-d6e7-4b38-a0b1-c2d3e4f5a6b7'),
('6d147b7c-c3d4-4c49-a7b8-c9d0e1f2a3b4', 'c37ac1d2-e3f4-42af-b7c8-d9e0a1b2c3d4');

-- 7. Active Order for "Dmitry" (Not Verified user)
-- Designed to test denial logic
INSERT INTO orders (id, renter_id, staff_id, branch_start_id, branch_end_id, status, total_price, created_at) VALUES
('7e258c8d-d4e5-4d5a-b8c9-d0e1f2a3b4c5', '7f4c92da-1e5b-43d7-86a2-5b9c1e7a4d3f', NULL, 'a43d9b89-21c8-47bc-8a1a-4d769c0d35e1', NULL, 'CREATED', 42000.00, CURRENT_TIMESTAMP - INTERVAL '2 hours');

INSERT INTO order_items (order_id, item_id) VALUES
('7e258c8d-d4e5-4d5a-b8c9-d0e1f2a3b4c5', 'e5f6a7b8-c9d0-4be1-f3a4-b5c6d7e8f9a0');
