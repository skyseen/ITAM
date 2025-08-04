-- Complete Recreation Script for audit_logs Table
-- This script drops the existing audit_logs table and recreates it with the correct schema

\echo '🔄 Starting complete audit_logs table recreation...'

-- Drop the existing table with CASCADE to handle foreign key constraints
DROP TABLE IF EXISTS audit_logs CASCADE;

\echo '✅ Dropped existing audit_logs table'

-- Create the audit_logs table with the complete correct schema
CREATE TABLE audit_logs (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Action classification
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    resource_name VARCHAR(200),
    
    -- Actor information
    user_id INTEGER NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    
    -- Action details and context
    description TEXT NOT NULL,
    details TEXT,
    old_values TEXT,
    new_values TEXT,
    
    -- Asset-specific tracking
    asset_id INTEGER,
    asset_identifier VARCHAR(50),
    
    -- IP and session tracking
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\echo '✅ Created new audit_logs table with correct schema'

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_asset_id ON audit_logs(asset_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

\echo '✅ Created performance indexes'

-- Add foreign key constraints (referencing users and assets tables)
-- Note: These will only be added if the referenced tables exist
DO $$
BEGIN
    -- Check if users table exists and add FK constraint
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added foreign key constraint to users table';
    ELSE
        RAISE NOTICE '⚠️  Users table not found, skipping FK constraint';
    END IF;
    
    -- Check if assets table exists and add FK constraint
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assets') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_asset_id 
            FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added foreign key constraint to assets table';
    ELSE
        RAISE NOTICE '⚠️  Assets table not found, skipping FK constraint';
    END IF;
END $$;

-- Show the final table structure
\echo '🔍 Final audit_logs table structure:'
\d audit_logs;

\echo '🎉 Audit logs table recreation completed successfully!' 