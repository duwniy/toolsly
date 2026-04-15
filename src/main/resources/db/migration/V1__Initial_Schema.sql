-- Toolsly Initial PostgreSQL Schema
-- Version: 1.1 (Refined based on BRD/SRS/HLD)
-- Strategy: UUID PKs, Auditing Fields, Optimistic Locking

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- RENTER, STAFF, ADMIN
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version INT DEFAULT 0
);

-- 2. Branches
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    storage_capacity INT NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version INT DEFAULT 0
);

-- 3. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version INT DEFAULT 0
);

-- 4. Equipment Models
CREATE TABLE equipment_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100),
    specifications JSONB,
    base_daily_price DECIMAL(19, 2) NOT NULL,
    market_value DECIMAL(19, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version INT DEFAULT 0
);

-- 5. Equipment Items
CREATE TABLE equipment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES equipment_models(id),
    branch_id UUID REFERENCES branches(id),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, RENTERD, MAINTENANCE, IN_TRANSIT, BROKEN
    condition VARCHAR(50) DEFAULT 'NEW', -- NEW, USED, DAMAGED
    reserved_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version INT DEFAULT 0
);

-- 6. Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    renter_id UUID REFERENCES users(id),
    staff_id UUID REFERENCES users(id), -- Staff who issued the items
    branch_start_id UUID REFERENCES branches(id),
    branch_end_id UUID REFERENCES branches(id), -- For inter-branch returns
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- CREATED, RESERVED, ISSUED, RETURNED, CLOSED, CANCELLED
    total_price DECIMAL(19, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version INT DEFAULT 0
);

-- 7. Order Items (Liaison table if one order has multiple items)
CREATE TABLE order_items (
    order_id UUID REFERENCES orders(id),
    item_id UUID REFERENCES equipment_items(id),
    PRIMARY KEY (order_id, item_id)
);

-- 8. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, STATUS_CHANGE
    old_value JSONB,
    new_value JSONB,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and search
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_items_model ON equipment_items(model_id);
CREATE INDEX idx_items_branch ON equipment_items(branch_id);
CREATE INDEX idx_items_status ON equipment_items(status);
CREATE INDEX idx_orders_renter ON orders(renter_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
