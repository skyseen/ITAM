#!/usr/bin/env python3
"""
Database Migration Script - Audit Logs Schema Update
====================================================

This script updates the audit_logs table to match the enhanced AuditLog model
by adding the missing columns that were introduced for comprehensive audit tracking.

Missing Columns to Add:
- resource_type: Type of resource being audited
- resource_name: Name/identifier of the resource
- user_name: Full name of the user who performed the action
- user_role: Role of the user (admin, manager, user)
- description: Human-readable description of the action
- details: Additional details about the action
- old_values: JSON field for storing old values
- new_values: JSON field for storing new values
- asset_id: ID of the related asset (if applicable)
- asset_identifier: Asset identifier for easy reference
- ip_address: IP address of the user
- user_agent: User agent string from the request

Author: IT Asset Management System
Created: 2024
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Get database connection using the same configuration as the app"""
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/itams")
    
    # Parse the URL to get connection parameters
    if db_url.startswith("postgresql://"):
        # Remove postgresql:// prefix
        db_url = db_url[13:]
        
        # Split user:pass@host:port/db
        if "@" in db_url:
            user_pass, host_port_db = db_url.split("@", 1)
            if ":" in user_pass:
                user, password = user_pass.split(":", 1)
            else:
                user, password = user_pass, ""
        else:
            user, password = "postgres", "postgres"
            host_port_db = db_url
            
        if "/" in host_port_db:
            host_port, database = host_port_db.split("/", 1)
        else:
            host_port, database = host_port_db, "itams"
            
        if ":" in host_port:
            host, port = host_port.split(":", 1)
            port = int(port)
        else:
            host, port = host_port, 5432
    else:
        # Fallback defaults
        host, port, database, user, password = "localhost", 5432, "itams", "postgres", "postgres"
    
    return psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password
    )

def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = %s AND column_name = %s
    """, (table_name, column_name))
    return cursor.fetchone() is not None

def migrate_audit_logs_schema():
    """Add missing columns to the audit_logs table"""
    
    print("🔄 Starting audit_logs schema migration...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Connected to database successfully")
        
        # Check if audit_logs table exists
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'audit_logs'
        """)
        
        if not cursor.fetchone():
            print("❌ audit_logs table does not exist!")
            return False
        
        print("✅ audit_logs table found")
        
        # Define the columns to add
        columns_to_add = [
            ("resource_type", "VARCHAR(50)"),
            ("resource_name", "VARCHAR(255)"),
            ("user_name", "VARCHAR(255)"),
            ("user_role", "VARCHAR(50)"),
            ("description", "TEXT"),
            ("details", "TEXT"),
            ("old_values", "TEXT"),  # JSON as TEXT
            ("new_values", "TEXT"),  # JSON as TEXT
            ("asset_id", "INTEGER"),
            ("asset_identifier", "VARCHAR(100)"),
            ("ip_address", "VARCHAR(45)"),  # IPv6 can be up to 45 chars
            ("user_agent", "TEXT")
        ]
        
        added_columns = []
        skipped_columns = []
        
        for column_name, column_type in columns_to_add:
            if check_column_exists(cursor, 'audit_logs', column_name):
                print(f"⏭️  Column '{column_name}' already exists, skipping...")
                skipped_columns.append(column_name)
                continue
            
            print(f"➕ Adding column '{column_name}' ({column_type})...")
            
            try:
                cursor.execute(f"""
                    ALTER TABLE audit_logs 
                    ADD COLUMN {column_name} {column_type}
                """)
                added_columns.append(column_name)
                print(f"✅ Added column '{column_name}'")
                
            except Exception as e:
                print(f"❌ Failed to add column '{column_name}': {e}")
                conn.rollback()
                return False
        
        # Commit all changes
        conn.commit()
        
        print(f"\n🎉 Migration completed successfully!")
        print(f"   📊 Added columns: {len(added_columns)}")
        print(f"   ⏭️  Skipped columns: {len(skipped_columns)}")
        
        if added_columns:
            print(f"   ➕ New columns: {', '.join(added_columns)}")
        
        if skipped_columns:
            print(f"   ⏭️  Existing columns: {', '.join(skipped_columns)}")
        
        # Verify the final schema
        print(f"\n🔍 Verifying final schema...")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'audit_logs'
            ORDER BY ordinal_position
        """)
        
        columns = cursor.fetchall()
        print(f"   📋 Total columns in audit_logs: {len(columns)}")
        
        for col in columns:
            nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
            print(f"      • {col['column_name']} ({col['data_type']}) {nullable}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Audit Logs Schema Migration")
    print("=" * 50)
    
    success = migrate_audit_logs_schema()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("   The dashboard should now work properly.")
        sys.exit(0)
    else:
        print("\n❌ Migration failed!")
        print("   Please check the error messages above.")
        sys.exit(1)