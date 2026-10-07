import sys
import os
from datetime import datetime
from db import get_db_connection, hash_password, init_db

def create_or_update_admin(username, password, email=None, role="super_admin", full_name="Super Admin"):
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    pw_hash, salt = hash_password(password)
    now_str = datetime.now().isoformat()
    if not email:
        email = os.environ.get("ADMIN_EMAIL", f"{username}@ashifurrahman.com")
    
    cursor.execute("SELECT id FROM admins WHERE username = ? OR email = ?", (username, email))
    row = cursor.fetchone()
    
    if row:
        cursor.execute("""
        UPDATE admins SET 
            username = ?,
            password_hash = ?, 
            salt = ?, 
            email = ?,
            role = ?,
            full_name = ?,
            is_active = 1,
            failed_login_attempts = 0,
            locked_until = NULL,
            updated_at = ?
        WHERE id = ?
        """, (username, pw_hash, salt, email, role, full_name, now_str, row['id']))
        print(f"Admin account updated successfully: '{username}' (Role: {role}, Email: {email})")
    else:
        cursor.execute("""
        INSERT INTO admins (
            username, email, full_name, role, is_active, failed_login_attempts,
            permissions_json, assigned_websites_json, password_hash, salt, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, 1, 0, '["*"]', '["*"]', ?, ?, ?, ?)
        """, (username, email, full_name, role, pw_hash, salt, now_str, now_str))
        print(f"Super Admin user '{username}' created successfully! (Email: {email}, Role: {role})")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        user = sys.argv[1]
        pw = sys.argv[2]
        email_arg = sys.argv[3] if len(sys.argv) >= 4 else None
        role_arg = sys.argv[4] if len(sys.argv) >= 5 else "super_admin"
        name_arg = sys.argv[5] if len(sys.argv) >= 6 else "Super Admin"
    else:
        print("Usage: python create_admin.py <username> <password> [email] [role] [full_name]")
        print("Defaulting to: username=admin, password=admin123, role=super_admin")
        user = "admin"
        pw = "admin123"
        email_arg = "admin@ashifurrahman.com"
        role_arg = "super_admin"
        name_arg = "Super Admin"
        
    create_or_update_admin(user, pw, email_arg, role_arg, name_arg)
