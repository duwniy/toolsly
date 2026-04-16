-- Milestone 6: Seed UAT Data
-- Admin: admin@toolsly.com / password123
-- Staff: staff_central@toolsly.com / password123
-- Staff: staff_north@toolsly.com / password123
-- Clients: client_verified@mail.com, client_new@mail.com / password123

-- BCrypt hash for "password123": $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu

-- 1. Branches
INSERT INTO branches (id, name, address, storage_capacity, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Центральный офис', 'ул. Ленина, 1', 100, 'SYSTEM'),
  ('22222222-2222-2222-2222-222222222222', 'Северный терминал', 'ул. Северная, 50', 2, 'SYSTEM');

-- 2. Users (Admin, Staff, Renters)
INSERT INTO users (id, email, password_hash, role, is_verified, branch_id, created_by) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@toolsly.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'ADMIN', true, NULL, 'SYSTEM'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'staff_central@toolsly.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'STAFF', true, '11111111-1111-1111-1111-111111111111', 'SYSTEM'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'staff_north@toolsly.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'STAFF', true, '22222222-2222-2222-2222-222222222222', 'SYSTEM'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'client_verified@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'RENTER', true, NULL, 'SYSTEM'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'client_new@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'RENTER', false, NULL, 'SYSTEM');

-- 3. Categories
INSERT INTO categories (id, name, description, created_by) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Электроинструмент', 'Перфораторы, дрели, пилы', 'SYSTEM'),
  ('c2222222-2222-2222-2222-222222222222', 'Садовая техника', 'Лестницы, лопаты, триммеры', 'SYSTEM');

-- 4. Equipment Models
INSERT INTO equipment_models (id, category_id, name, manufacturer, base_daily_price, market_value, created_by) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Перфоратор Makita', 'Makita', 1200.00, 15000.00, 'SYSTEM'),
  ('b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Лестница алюминиевая', 'Alumet', 400.00, 3000.00, 'SYSTEM');

-- 5. Equipment Items (Inventory)
INSERT INTO equipment_items (id, model_id, branch_id, serial_number, status, condition, created_by) VALUES
  -- Makita (3 units)
  ('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'MAK-001', 'AVAILABLE', 'NEW', 'SYSTEM'),
  ('e1111111-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'MAK-002', 'AVAILABLE', 'USED', 'SYSTEM'),
  ('e1111111-1111-1111-1111-111111111113', 'b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'MAK-003', 'AVAILABLE', 'NEW', 'SYSTEM'),
  -- Ladders (5 units)
  ('e2222222-2222-2222-2222-222222222221', 'b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'LAD-001', 'AVAILABLE', 'NEW', 'SYSTEM'),
  ('e2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'LAD-002', 'AVAILABLE', 'USED', 'SYSTEM'),
  ('e2222222-2222-2222-2222-222222222223', 'b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'LAD-003', 'AVAILABLE', 'DAMAGED', 'SYSTEM'),
  ('e2222222-2222-2222-2222-222222222224', 'b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'LAD-004', 'AVAILABLE', 'NEW', 'SYSTEM'),
  ('e2222222-2222-2222-2222-222222222225', 'b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'LAD-005', 'AVAILABLE', 'USED', 'SYSTEM');
