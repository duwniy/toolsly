-- Milestone 6: Add branch linkage to users for STAFF role
ALTER TABLE users ADD COLUMN branch_id UUID REFERENCES branches(id);
CREATE INDEX idx_users_branch ON users(branch_id);
