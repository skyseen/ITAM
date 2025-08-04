-- Migration script to add missing columns to audit_logs table
-- This script adds the enhanced audit trail columns

\echo 'Starting audit_logs schema migration...'

-- Add missing columns with IF NOT EXISTS to avoid errors if columns already exist
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_name VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_role VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS asset_id INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS asset_identifier VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

\echo 'Migration completed successfully!'

-- Show the updated table structure
\echo 'Updated audit_logs table structure:'
\d audit_logs;