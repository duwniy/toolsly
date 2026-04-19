ALTER TABLE orders 
ADD COLUMN target_branch_id UUID REFERENCES branches(id),
ADD COLUMN staff_comment TEXT,
ADD COLUMN is_incident BOOLEAN DEFAULT FALSE;
