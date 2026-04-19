-- Add total_rental_days to equipment_items for maintenance tracking
ALTER TABLE equipment_items ADD COLUMN total_rental_days INT NOT NULL DEFAULT 0;
