-- Migration V13: Add reserved_until column to orders table
ALTER TABLE orders ADD COLUMN reserved_until TIMESTAMP WITH TIME ZONE;
