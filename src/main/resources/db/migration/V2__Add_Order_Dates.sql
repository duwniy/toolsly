-- Fix missing columns in orders table
ALTER TABLE orders ADD COLUMN planned_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN actual_end_date TIMESTAMP WITH TIME ZONE;
