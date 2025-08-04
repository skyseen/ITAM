-- Recreate audit_logs table with enhanced schema
-- This will drop the existing audit_logs table and recreate it with all required columns

\echo 'Dropping existing audit_logs table...'
DROP TABLE IF EXISTS audit_logs;

\echo 'Creating new audit_logs table with enhanced schema...'
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    resource_name VARCHAR(255),
    user_id INTEGER,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    description TEXT,
    details TEXT,
    old_values TEXT,
    new_values TEXT,
    asset_id INTEGER,
    asset_identifier VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Creating indexes for better performance...'
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_asset_id ON audit_logs(asset_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);

\echo 'audit_logs table recreated successfully!'

-- Show the new table structure
\echo 'New audit_logs table structure:'
\d audit_logs; 