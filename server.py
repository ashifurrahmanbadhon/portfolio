import os
import sys
import json
import uuid
import secrets
import base64
import mimetypes
import sqlite3
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timedelta

import io
import jwt
import pyotp
import qrcode
from db import (
    get_db_connection,
    init_db,
    verify_password,
    hash_password,
    log_activity,
    add_activity_log,
    get_admin_by_identifier,
    check_admin_lockout,
    record_failed_login,
    record_successful_login,
    create_password_reset,
    verify_password_reset_token,
    complete_password_reset,
    mask_phone,
    get_admin_2fa_info,
    check_admin_2fa_lockout,
    record_failed_2fa_attempt,
    record_successful_2fa,
    enable_admin_2fa,
    disable_admin_2fa,
    store_recovery_codes,
    verify_and_consume_recovery_code,
    regenerate_recovery_codes,
    get_remaining_recovery_codes_count,
    check_sms_rate_limit,
    store_sms_otp,
    verify_and_consume_sms_otp,
    DB_FILE
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Environment and Security Configurations
JWT_SECRET = os.environ.get("JWT_SECRET", "ashifur_portfolio_secure_secret_key_2026_x9f")
JWT_ALGORITHM = "HS256"
PORT = int(os.environ.get("PORT", 5000))
SESSION_EXPIRY_HOURS = int(os.environ.get("SESSION_EXPIRY_HOURS", 24))
REMEMBER_EXPIRY_DAYS = int(os.environ.get("REMEMBER_EXPIRY_DAYS", 30))
MAX_LOGIN_ATTEMPTS = int(os.environ.get("MAX_LOGIN_ATTEMPTS", 5))
LOCKOUT_MINUTES = int(os.environ.get("LOCKOUT_MINUTES", 15))

def generate_token(admin_dict: dict, remember_me: bool = False):
    """Generate secure JWT token encoding Super Admin identity, role, and permissions."""
    duration = timedelta(days=REMEMBER_EXPIRY_DAYS) if remember_me else timedelta(hours=SESSION_EXPIRY_HOURS)
    exp_datetime = datetime.utcnow() + duration
    exp_timestamp = int(exp_datetime.timestamp())

    perms = ["*"]
    if admin_dict.get('permissions_json'):
        try:
            perms = json.loads(admin_dict['permissions_json'])
        except Exception:
            perms = ["*"]

    sites = ["*"]
    if admin_dict.get('assigned_websites_json'):
        try:
            sites = json.loads(admin_dict['assigned_websites_json'])
        except Exception:
            sites = ["*"]

    payload = {
        "sub": admin_dict['username'],
        "uid": admin_dict['id'],
        "email": admin_dict.get('email') or "",
        "role": admin_dict.get('role') or "super_admin",
        "full_name": admin_dict.get('full_name') or "Super Admin",
        "permissions": perms,
        "websites": sites,
        "exp": exp_datetime,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, exp_timestamp

def verify_token(token: str):
    """Verify and decode JWT token safely."""
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded
    except Exception:
        return None

def generate_2fa_challenge_token(admin_dict: dict, remember_me: bool = False):
    """Generate a short-lived 5-minute challenge token for active 2FA step."""
    duration = timedelta(minutes=5)
    exp_datetime = datetime.utcnow() + duration
    payload = {
        "type": "2fa_challenge",
        "uid": admin_dict['id'],
        "sub": admin_dict['username'],
        "remember": remember_me,
        "exp": exp_datetime,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_2fa_challenge_token(token: str):
    """Validate 2FA challenge token safely."""
    if not token:
        return None
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if decoded.get("type") == "2fa_challenge":
            return decoded
        return None
    except Exception:
        return None

def generate_2fa_setup_token(admin_id: int, secret: str):
    """Generate a 10-minute setup token holding pending TOTP secret securely."""
    duration = timedelta(minutes=10)
    exp_datetime = datetime.utcnow() + duration
    payload = {
        "type": "2fa_setup",
        "uid": admin_id,
        "secret": secret,
        "exp": exp_datetime,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_2fa_setup_token(token: str):
    """Validate 2FA setup token safely."""
    if not token:
        return None
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if decoded.get("type") == "2fa_setup":
            return decoded
        return None
    except Exception:
        return None

def send_sms_otp_dispatch(phone: str, otp_code: str):
    """
    Dispatch SMS OTP to verified admin phone (01521417284).
    Uses environment SMS provider credentials if configured.
    """
    sms_url = os.environ.get("SMS_GATEWAY_URL")
    sms_key = os.environ.get("SMS_API_KEY")
    sms_sender = os.environ.get("SMS_SENDER_ID", "CentralCMS")
    
    msg_body = f"Your Central CMS 2FA verification code is: {otp_code}. Valid for 5 minutes. Do not share this code."
    
    if sms_url and sms_key:
        try:
            req_data = json.dumps({
                "api_key": sms_key,
                "to": phone,
                "sender": sms_sender,
                "message": msg_body
            }).encode('utf-8')
            req = urllib.request.Request(sms_url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                print(f"[SMS Gateway] Dispatched SMS OTP to {mask_phone(phone)}: Status {resp.status}")
                return True
        except Exception as e:
            print(f"[SMS Gateway] Error sending SMS: {e}")
            return False
    else:
        # Development / Staging fallback: log to secure audit server console
        print(f"[SECURE 2FA SMS OTP] To: {phone} (Masked: {mask_phone(phone)}) | Code: {otp_code} | Generated at: {datetime.now().isoformat()}")
        return True

class PortfolioHandler(BaseHTTPRequestHandler):
    def send_json(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status_code=400):
        self.send_json({"error": message, "success": False}, status_code)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def get_auth_context(self):
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header[7:].strip()
        decoded = verify_token(token)
        if not decoded:
            return None
        return decoded

    def get_auth_user(self):
        ctx = self.get_auth_context()
        if not ctx:
            return None
        return ctx.get("sub")

    def read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length <= 0:
            return {}
        raw_body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw_body)
        except Exception:
            return {}

    def serve_file(self, file_path):
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            self.send_error_json("File not found", 404)
            return

        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"

        file_size = os.path.getsize(file_path)
        self.send_response(200)
        self.send_header('Content-Type', mime_type)
        self.send_header('Content-Length', str(file_size))
        self.send_header('Access-Control-Allow-Origin', '*')
        
        # Friendly download attachment header for PDF
        if file_path.lower().endswith(".pdf"):
            base_name = os.path.basename(file_path)
            self.send_header('Content-Disposition', f'inline; filename="{base_name}"')
            
        self.end_headers()

        with open(file_path, 'rb') as f:
            while chunk := f.read(65536):
                self.wfile.write(chunk)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. Static Web Routes
        if path == "/" or path == "/index.html":
            self.serve_file(os.path.join(BASE_DIR, "index.html"))
            return
        elif path == "/admin" or path == "/admin/":
            self.serve_file(os.path.join(BASE_DIR, "admin.html"))
            return
        elif path == "/admin.html":
            self.serve_file(os.path.join(BASE_DIR, "admin.html"))
            return
        elif path.startswith("/uploads/"):
            rel = path[len("/uploads/"):].lstrip("/")
            file_path = os.path.join(UPLOADS_DIR, rel)
            self.serve_file(file_path)
            return
        elif path in ["/resume.pdf", "/ashifur.jpeg", "/ashifur.jpg", "/profile.jpg", "/Ashifur Rahman.jpg", "/Ashifur Rahman.png"]:
            file_path = os.path.join(BASE_DIR, path.lstrip("/"))
            self.serve_file(file_path)
            return

        # 2. Public API - Content
        if path == "/api/content":
            conn = get_db_connection()
            cur = conn.cursor()

            # Hero
            cur.execute("SELECT * FROM hero WHERE id = 1")
            hero_row = cur.fetchone()
            hero_data = dict(hero_row) if hero_row else {}

            # About
            cur.execute("SELECT * FROM about WHERE id = 1")
            about_row = cur.fetchone()
            about_data = dict(about_row) if about_row else {}

            # Highlights
            cur.execute("SELECT * FROM highlights ORDER BY sort_order ASC, id ASC")
            highlights_data = [dict(r) for r in cur.fetchall()]

            # Experiences
            cur.execute("SELECT * FROM experiences ORDER BY sort_order ASC, id ASC")
            exp_rows = cur.fetchall()
            experiences_data = []
            for r in exp_rows:
                d = dict(r)
                try:
                    d['description_points'] = json.loads(d.get('description_points') or "[]")
                except Exception:
                    d['description_points'] = []
                experiences_data.append(d)

            # Educations
            cur.execute("SELECT * FROM educations ORDER BY sort_order ASC, id ASC")
            educations_data = [dict(r) for r in cur.fetchall()]

            # Skills
            cur.execute("SELECT * FROM skills ORDER BY category ASC, sort_order ASC, id ASC")
            skills_rows = cur.fetchall()
            skills_data = [dict(r) for r in skills_rows]
            
            # Group skills by category for convenient rendering
            grouped_skills = {}
            for s in skills_data:
                cat = s['category']
                if cat not in grouped_skills:
                    grouped_skills[cat] = []
                grouped_skills[cat].append(s)

            # Skill Badges
            cur.execute("SELECT * FROM skill_badges ORDER BY sort_order ASC, id ASC")
            badges_data = [dict(r) for r in cur.fetchall()]

            # Projects (Only Published for public site)
            cur.execute("SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, id ASC")
            proj_rows = cur.fetchall()
            projects_data = []
            for r in proj_rows:
                d = dict(r)
                try:
                    d['tags'] = json.loads(d.get('tags_json') or "[]")
                except Exception:
                    d['tags'] = []
                try:
                    d['additional_images'] = json.loads(d.get('additional_images_json') or "[]")
                except Exception:
                    d['additional_images'] = []
                projects_data.append(d)

            # Services
            cur.execute("SELECT * FROM services ORDER BY sort_order ASC, id ASC")
            services_data = [dict(r) for r in cur.fetchall()]

            # Social Links
            cur.execute("SELECT * FROM social_links WHERE id = 1")
            social_row = cur.fetchone()
            social_data = dict(social_row) if social_row else {}

            # Active Resume
            cur.execute("SELECT * FROM resumes WHERE is_active = 1 ORDER BY id DESC LIMIT 1")
            resume_row = cur.fetchone()
            resume_data = dict(resume_row) if resume_row else {}

            # Site Settings
            cur.execute("SELECT * FROM site_settings WHERE id = 1")
            settings_row = cur.fetchone()
            settings_data = dict(settings_row) if settings_row else {}

            conn.close()

            response_data = {
                "success": True,
                "hero": hero_data,
                "about": about_data,
                "highlights": highlights_data,
                "experiences": experiences_data,
                "educations": educations_data,
                "skills": skills_data,
                "grouped_skills": grouped_skills,
                "skill_badges": badges_data,
                "projects": projects_data,
                "services": services_data,
                "social_links": social_data,
                "resume": resume_data,
                "site_settings": settings_data
            }
            self.send_json(response_data)
            return

        # 2b. Public API - ToolGhor Content
        if path == "/api/toolghor/content":
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM toolghor_categories ORDER BY sort_order ASC, id ASC")
            categories = [dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM toolghor_tools WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
            tools = [dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM toolghor_settings WHERE id = 1")
            s_row = cur.fetchone()
            settings = dict(s_row) if s_row else {}
            conn.close()

            self.send_json({
                "success": True,
                "categories": categories,
                "tools": tools,
                "settings": settings
            })
            return

        # 2c. Public API - Generic Website Content by slug (/api/websites/<slug>/content)
        if path.startswith("/api/websites/") and path.endswith("/content"):
            parts = path.strip("/").split("/")
            if len(parts) == 4 and parts[0] == "api" and parts[1] == "websites" and parts[3] == "content":
                slug = parts[2]
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute("SELECT * FROM websites WHERE slug = ?", (slug,))
                site_row = cur.fetchone()
                if not site_row:
                    conn.close()
                    self.send_error_json("Website not found", 404)
                    return
                site_data = dict(site_row)
                cur.execute("SELECT * FROM website_content_modules WHERE website_id = ? ORDER BY id ASC", (site_data['id'],))
                modules = [dict(r) for r in cur.fetchall()]
                conn.close()
                self.send_json({
                    "success": True,
                    "website": site_data,
                    "modules": modules
                })
                return

        # 3. Auth Check /me (Session validation & Super Admin context)
        if path == "/api/auth/me":
            ctx = self.get_auth_context()
            if not ctx:
                self.send_error_json("Session expired or invalid. Please sign in again.", 401)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
            SELECT id, username, email, full_name, role, is_active, failed_login_attempts, 
                   locked_until, last_login_at, permissions_json, assigned_websites_json 
            FROM admins 
            WHERE username = ? OR id = ?
            LIMIT 1
            """, (ctx.get("sub"), ctx.get("uid")))
            admin_row = cur.fetchone()
            conn.close()

            if not admin_row or not admin_row['is_active']:
                self.send_error_json("Administrative account is disabled or no longer exists.", 401)
                return

            admin_data = dict(admin_row)
            try:
                admin_data['permissions'] = json.loads(admin_data.get('permissions_json') or '["*"]')
            except Exception:
                admin_data['permissions'] = ["*"]
            try:
                admin_data['websites'] = json.loads(admin_data.get('assigned_websites_json') or '["*"]')
            except Exception:
                admin_data['websites'] = ["*"]

            self.send_json({
                "success": True,
                "username": admin_data['username'],
                "user": admin_data
            })
            return

        # 3b. 2FA Status (Settings / Profile security tab)
        if path == "/api/auth/2fa/status":
            ctx = self.get_auth_context()
            if not ctx:
                self.send_error_json("Session expired or invalid. Please sign in again.", 401)
                return

            conn = get_db_connection()
            info = get_admin_2fa_info(conn, ctx.get("uid"))
            conn.close()

            if not info:
                self.send_error_json("Admin user not found.", 404)
                return

            self.send_json({
                "success": True,
                "two_factor_enabled": bool(info.get("two_factor_enabled")),
                "masked_phone": info.get("masked_phone"),
                "recovery_codes_remaining": info.get("recovery_codes_remaining", 0),
                "has_totp": bool(info.get("totp_secret"))
            })
            return

        # 4. Protected Admin Endpoints
        if path.startswith("/api/admin/"):
            user = self.get_auth_user()
            if not user:
                self.send_error_json("Unauthorized access to admin API", 401)
                return

            conn = get_db_connection()
            cur = conn.cursor()

            # Super Admin: List Team / Administrators
            if path == "/api/admin/users":
                ctx = self.get_auth_context()
                if not ctx or ctx.get('role') != 'super_admin':
                    conn.close()
                    self.send_error_json("Super Admin privileges required.", 403)
                    return
                cur.execute("""
                SELECT id, username, email, full_name, role, is_active, failed_login_attempts,
                       last_login_at, created_at, permissions_json, assigned_websites_json
                FROM admins ORDER BY id ASC
                """)
                users_list = []
                for r in cur.fetchall():
                    u = dict(r)
                    try:
                        u['permissions'] = json.loads(u.get('permissions_json') or '["*"]')
                    except Exception:
                        u['permissions'] = ["*"]
                    try:
                        u['websites'] = json.loads(u.get('assigned_websites_json') or '["*"]')
                    except Exception:
                        u['websites'] = ["*"]
                    users_list.append(u)
                conn.close()
                self.send_json({"success": True, "users": users_list})
                return

            # Central CMS: Activity & Change History
            if path == "/api/admin/history" or path == "/api/admin/activity-logs":
                limit = 100
                if "limit" in query:
                    try:
                        limit = int(query["limit"][0])
                    except Exception:
                        limit = 100
                category = query.get("category", [None])[0]
                search = query.get("search", [None])[0]

                sql = "SELECT * FROM activity_logs"
                params = []
                where_clauses = []
                if category and category != "all":
                    where_clauses.append("(action LIKE ? OR details LIKE ?)")
                    params.extend([f"%{category}%", f"%{category}%"])
                if search:
                    where_clauses.append("(action LIKE ? OR details LIKE ? OR website_name LIKE ? OR user LIKE ?)")
                    params.extend([f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"])

                if where_clauses:
                    sql += " WHERE " + " AND ".join(where_clauses)
                sql += " ORDER BY id DESC LIMIT ?"
                params.append(limit)

                cur.execute(sql, tuple(params))
                logs = [dict(r) for r in cur.fetchall()]
                
                cur.execute("SELECT COUNT(*) FROM activity_logs")
                total_count = cur.fetchone()[0]
                conn.close()

                self.send_json({
                    "success": True,
                    "history": logs,
                    "total": total_count
                })
                return

            # Central CMS: System Settings (General, CMS, Website, Email, Security, API)
            if path == "/api/admin/system-settings":
                cur.execute("SELECT category, settings_json, updated_at FROM central_system_settings")
                settings_map = {}
                for r in cur.fetchall():
                    try:
                        settings_map[r['category']] = json.loads(r['settings_json'])
                    except Exception:
                        settings_map[r['category']] = {}
                conn.close()
                self.send_json({"success": True, "settings": settings_map})
                return

            # Central CMS Dashboard Endpoint
            if path == "/api/admin/central/dashboard":
                cur.execute("SELECT COUNT(*) FROM websites")
                total_websites = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM websites WHERE status = 'active'")
                active_websites = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM websites WHERE status != 'active'")
                inactive_websites = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM projects")
                portfolio_projects = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM skills")
                portfolio_skills = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM experiences")
                portfolio_exp = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM educations")
                portfolio_edu = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0")
                unread_messages = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM toolghor_tools")
                toolghor_tools_count = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM toolghor_categories")
                toolghor_cats_count = cur.fetchone()[0]

                cur.execute("SELECT * FROM websites ORDER BY id ASC")
                websites = [dict(r) for r in cur.fetchall()]
                for w in websites:
                    if w.get('slug') == 'portfolio':
                        w['items_count'] = portfolio_projects
                        w['items_label'] = 'Projects'
                    elif w.get('slug') == 'toolghor':
                        w['items_count'] = toolghor_tools_count
                        w['items_label'] = 'Tools'
                    else:
                        cur.execute("SELECT COUNT(*) FROM website_content_modules WHERE website_id = ?", (w['id'],))
                        w['items_count'] = cur.fetchone()[0]
                        w['items_label'] = 'Modules'

                cur.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 20")
                recent_activity = [dict(r) for r in cur.fetchall()]

                cur.execute("SELECT * FROM websites ORDER BY updated_at DESC LIMIT 5")
                recently_updated = [dict(r) for r in cur.fetchall()]

                conn.close()
                self.send_json({
                    "success": True,
                    "stats": {
                        "total_websites": total_websites,
                        "active_websites": active_websites,
                        "inactive_websites": inactive_websites,
                        "portfolio_projects": portfolio_projects,
                        "portfolio_skills": portfolio_skills,
                        "portfolio_experiences": portfolio_exp,
                        "portfolio_educations": portfolio_edu,
                        "toolghor_tools": toolghor_tools_count,
                        "toolghor_categories": toolghor_cats_count,
                        "unread_messages": unread_messages
                    },
                    "websites": websites,
                    "recent_activity": recent_activity,
                    "recently_updated_websites": recently_updated
                })
                return

            elif path == "/api/admin/websites":
                cur.execute("SELECT * FROM websites ORDER BY id ASC")
                websites = [dict(r) for r in cur.fetchall()]
                for w in websites:
                    if w.get('slug') == 'portfolio':
                        cur.execute("SELECT COUNT(*) FROM projects")
                        w['items_count'] = cur.fetchone()[0]
                        w['items_label'] = 'Projects'
                    elif w.get('slug') == 'toolghor':
                        cur.execute("SELECT COUNT(*) FROM toolghor_tools")
                        w['items_count'] = cur.fetchone()[0]
                        w['items_label'] = 'Tools'
                    else:
                        cur.execute("SELECT COUNT(*) FROM website_content_modules WHERE website_id = ?", (w['id'],))
                        w['items_count'] = cur.fetchone()[0]
                        w['items_label'] = 'Modules'
                conn.close()
                self.send_json({"success": True, "websites": websites})
                return

            elif path.startswith("/api/admin/websites/") and not path.endswith("/modules"):
                site_id = path.split("/")[-1]
                cur.execute("SELECT * FROM websites WHERE id = ?", (site_id,))
                row = cur.fetchone()
                conn.close()
                if not row:
                    self.send_error_json("Website not found", 404)
                    return
                self.send_json({"success": True, "website": dict(row)})
                return

            elif path == "/api/admin/activity-logs":
                cur.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50")
                logs = [dict(r) for r in cur.fetchall()]
                conn.close()
                self.send_json({"success": True, "activity_logs": logs})
                return

            elif path == "/api/admin/toolghor/content":
                cur.execute("SELECT * FROM toolghor_categories ORDER BY sort_order ASC, id ASC")
                categories = [dict(r) for r in cur.fetchall()]

                cur.execute("SELECT * FROM toolghor_tools ORDER BY sort_order ASC, id ASC")
                tools = [dict(r) for r in cur.fetchall()]

                cur.execute("SELECT * FROM toolghor_settings WHERE id = 1")
                s_row = cur.fetchone()
                settings = dict(s_row) if s_row else {}
                conn.close()

                self.send_json({
                    "success": True,
                    "categories": categories,
                    "tools": tools,
                    "settings": settings
                })
                return

            elif path.startswith("/api/admin/websites/") and path.endswith("/modules"):
                parts = path.strip("/").split("/")
                site_id = parts[3]
                cur.execute("SELECT * FROM website_content_modules WHERE website_id = ? ORDER BY id ASC", (site_id,))
                modules = [dict(r) for r in cur.fetchall()]
                conn.close()
                self.send_json({"success": True, "modules": modules})
                return

            elif path == "/api/admin/dashboard":
                cur.execute("SELECT COUNT(*) FROM projects")
                total_projects = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM skills")
                total_skills = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM experiences")
                total_experiences = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM educations")
                total_educations = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM contact_messages")
                total_messages = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0")
                unread_messages = cur.fetchone()[0]

                cur.execute("SELECT * FROM contact_messages ORDER BY id DESC LIMIT 5")
                recent_messages = [dict(r) for r in cur.fetchall()]

                conn.close()
                self.send_json({
                    "success": True,
                    "stats": {
                        "total_projects": total_projects,
                        "total_skills": total_skills,
                        "total_experiences": total_experiences,
                        "total_educations": total_educations,
                        "total_messages": total_messages,
                        "unread_messages": unread_messages
                    },
                    "recent_messages": recent_messages
                })
                return

            elif path == "/api/admin/messages":
                cur.execute("SELECT * FROM contact_messages ORDER BY id DESC")
                msgs = [dict(r) for r in cur.fetchall()]
                conn.close()
                self.send_json({"success": True, "messages": msgs})
                return

            elif path == "/api/admin/projects":
                cur.execute("SELECT * FROM projects ORDER BY sort_order ASC, id ASC")
                rows = cur.fetchall()
                projs = []
                for r in rows:
                    d = dict(r)
                    try:
                        d['tags'] = json.loads(d.get('tags_json') or "[]")
                    except Exception:
                        d['tags'] = []
                    try:
                        d['additional_images'] = json.loads(d.get('additional_images_json') or "[]")
                    except Exception:
                        d['additional_images'] = []
                    projs.append(d)
                conn.close()
                self.send_json({"success": True, "projects": projs})
                return

            elif path == "/api/admin/resumes":
                cur.execute("SELECT * FROM resumes ORDER BY id DESC")
                resumes = [dict(r) for r in cur.fetchall()]
                conn.close()
                self.send_json({"success": True, "resumes": resumes})
                return

            conn.close()

        # Try serving general static file if exists in root
        rel_path = path.lstrip("/")
        potential_file = os.path.join(BASE_DIR, rel_path)
        if os.path.exists(potential_file) and os.path.isfile(potential_file):
            self.serve_file(potential_file)
            return

        self.send_error_json("Endpoint not found", 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Central Admin Login (Username or Email + Brute Force Protection)
        if path == "/api/auth/login":
            data = self.read_json_body()
            identifier = data.get("identifier", "").strip() or data.get("username", "").strip() or data.get("email", "").strip()
            password = data.get("password", "").strip()
            remember_me = bool(data.get("remember", False))

            if not identifier or not password:
                self.send_error_json("Username or Email and password are required.", 400)
                return

            conn = get_db_connection()
            admin = get_admin_by_identifier(conn, identifier)

            if not admin:
                conn.close()
                self.send_error_json("Invalid username/email or password.", 401)
                return

            # Check account lockout status
            is_locked, lock_msg = check_admin_lockout(admin, max_attempts=MAX_LOGIN_ATTEMPTS)
            if is_locked:
                conn.close()
                self.send_error_json(lock_msg, 429)
                return

            # Verify PBKDF2 Password
            if not verify_password(password, admin['password_hash'], admin['salt']):
                is_now_locked, attempts = record_failed_login(conn, admin['id'], max_attempts=MAX_LOGIN_ATTEMPTS, lockout_minutes=LOCKOUT_MINUTES)
                if is_now_locked:
                    log_activity(conn, "Account Locked", None, "Security", f"Admin '{admin['username']}' locked after {attempts} failed login attempts.", admin['username'])
                    conn.close()
                    self.send_error_json(f"Account locked due to {attempts} failed login attempts. Try again in {LOCKOUT_MINUTES} minutes or reset password.", 429)
                    return
                else:
                    remaining = MAX_LOGIN_ATTEMPTS - attempts
                    log_activity(conn, "Failed Login", None, "Security", f"Failed login for '{admin['username']}' ({remaining} attempt(s) remaining).", admin['username'])
                    conn.close()
                    self.send_error_json(f"Invalid username/email or password. ({remaining} attempt(s) remaining)", 401)
                    return

            # If 2FA is enabled, issue a 2FA challenge token instead of direct JWT session
            if admin['two_factor_enabled']:
                is_locked, lock_msg = check_admin_2fa_lockout(admin['id'], conn)
                if is_locked:
                    conn.close()
                    self.send_error_json(lock_msg, 429)
                    return

                challenge_token = generate_2fa_challenge_token(dict(admin), remember_me=remember_me)
                phone = admin['phone'] or '01521417284'
                conn.close()
                self.send_json({
                    "success": True,
                    "requires_2fa": True,
                    "two_factor_token": challenge_token,
                    "masked_phone": mask_phone(phone),
                    "primary_method": "totp"
                })
                return

            # Successful Login (2FA Disabled): Clear lockout and record login timestamp
            record_successful_login(conn, admin['id'])
            token, exp_timestamp = generate_token(dict(admin), remember_me=remember_me)

            role_title = "Super Admin" if admin['role'] == "super_admin" else (admin['role'].capitalize() if admin['role'] else "Admin")
            log_activity(conn, f"{role_title} Login", None, "Central CMS", f"User '{admin['username']}' ({role_title}) authenticated into Central CMS.", admin['username'])
            conn.close()

            perms = ["*"]
            try:
                perms = json.loads(admin['permissions_json']) if admin['permissions_json'] else ["*"]
            except Exception:
                perms = ["*"]

            sites = ["*"]
            try:
                sites = json.loads(admin['assigned_websites_json']) if admin['assigned_websites_json'] else ["*"]
            except Exception:
                sites = ["*"]

            self.send_json({
                "success": True,
                "token": token,
                "expires_at": exp_timestamp,
                "user": {
                    "id": admin['id'],
                    "username": admin['username'],
                    "email": admin['email'] or "",
                    "full_name": admin['full_name'] or "Super Admin",
                    "role": admin['role'] or "super_admin",
                    "permissions": perms,
                    "websites": sites
                }
            })
            return

        # 1-2FA. Two-Factor Authentication Login Verification
        if path == "/api/auth/2fa/verify":
            data = self.read_json_body()
            two_factor_token = data.get("two_factor_token", "").strip()
            code = data.get("code", "").strip()
            method = data.get("method", "totp").strip()  # "totp", "recovery_code", or "sms_otp"

            if not two_factor_token or not code:
                self.send_error_json("Two-factor challenge token and code are required.", 400)
                return

            claims = verify_2fa_challenge_token(two_factor_token)
            if not claims:
                self.send_error_json("2FA session has expired or is invalid. Please sign in again.", 401)
                return

            admin_id = claims.get("uid")
            remember_me = bool(claims.get("remember", False))

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM admins WHERE id = ?", (admin_id,))
            admin = cur.fetchone()

            if not admin or not admin['is_active']:
                conn.close()
                self.send_error_json("Administrative account not found or disabled.", 401)
                return

            is_locked, lock_msg = check_admin_2fa_lockout(admin_id, conn)
            if is_locked:
                conn.close()
                self.send_error_json(lock_msg, 429)
                return

            verified = False
            err_reason = ""

            if method == "totp":
                totp_secret = admin['totp_secret']
                if not totp_secret:
                    err_reason = "TOTP is not configured on this account."
                else:
                    totp = pyotp.TOTP(totp_secret)
                    # Window=1 allows slight clock drift (30 seconds before/after)
                    if totp.verify(code, valid_window=1):
                        verified = True
                    else:
                        err_reason = "Invalid authenticator code. Check the time on your device and try again."

            elif method == "recovery_code":
                if verify_and_consume_recovery_code(conn, admin_id, code):
                    verified = True
                    log_activity(conn, "2FA Recovery Used", None, "Security", f"Admin '{admin['username']}' used a one-time recovery code to sign in.", admin['username'])
                else:
                    err_reason = "Invalid or already used recovery code."

            elif method == "sms_otp":
                otp_valid, otp_msg = verify_and_consume_sms_otp(conn, admin_id, two_factor_token, code)
                if otp_valid:
                    verified = True
                    log_activity(conn, "2FA SMS OTP Used", None, "Security", f"Admin '{admin['username']}' used SMS OTP to sign in.", admin['username'])
                else:
                    err_reason = otp_msg

            else:
                err_reason = f"Unsupported 2FA verification method: {method}"

            if not verified:
                is_now_locked, attempts = record_failed_2fa_attempt(conn, admin_id, max_attempts=5, lockout_minutes=15)
                if is_now_locked:
                    log_activity(conn, "2FA Lockout Triggered", None, "Security", f"Admin '{admin['username']}' locked out of 2FA for 15 minutes after {attempts} failed attempts.", admin['username'])
                    conn.close()
                    self.send_error_json("Too many failed 2FA verification attempts. Account locked for 15 minutes.", 429)
                    return
                else:
                    remaining = 5 - attempts
                    conn.close()
                    self.send_error_json(f"{err_reason} ({remaining} attempt(s) remaining)", 401)
                    return

            # Verification Successful!
            record_successful_2fa(conn, admin_id)
            record_successful_login(conn, admin_id)
            token, exp_timestamp = generate_token(dict(admin), remember_me=remember_me)

            role_title = "Super Admin" if admin['role'] == "super_admin" else (admin['role'].capitalize() if admin['role'] else "Admin")
            log_activity(conn, f"{role_title} 2FA Login", None, "Central CMS", f"User '{admin['username']}' successfully passed 2FA ({method}).", admin['username'])
            conn.close()

            perms = ["*"]
            try:
                perms = json.loads(admin['permissions_json']) if admin['permissions_json'] else ["*"]
            except Exception:
                perms = ["*"]

            sites = ["*"]
            try:
                sites = json.loads(admin['assigned_websites_json']) if admin['assigned_websites_json'] else ["*"]
            except Exception:
                sites = ["*"]

            self.send_json({
                "success": True,
                "token": token,
                "expires_at": exp_timestamp,
                "user": {
                    "id": admin['id'],
                    "username": admin['username'],
                    "email": admin['email'] or "",
                    "full_name": admin['full_name'] or "Super Admin",
                    "role": admin['role'] or "super_admin",
                    "permissions": perms,
                    "websites": sites
                }
            })
            return

        # 1-SMS. Send SMS OTP Fallback
        if path == "/api/auth/2fa/send-sms-otp":
            data = self.read_json_body()
            two_factor_token = data.get("two_factor_token", "").strip()

            if not two_factor_token:
                self.send_error_json("Two-factor challenge token is required to request SMS OTP.", 400)
                return

            claims = verify_2fa_challenge_token(two_factor_token)
            if not claims:
                self.send_error_json("2FA session has expired. Please sign in again.", 401)
                return

            admin_id = claims.get("uid")
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, username, phone FROM admins WHERE id = ?", (admin_id,))
            admin = cur.fetchone()

            if not admin:
                conn.close()
                self.send_error_json("Admin user not found.", 404)
                return

            # Check rate limiting: max 1 per 60 seconds
            is_limited, remaining_secs = check_sms_rate_limit(conn, admin_id, cooldown_seconds=60)
            if is_limited:
                conn.close()
                self.send_error_json(f"Please wait {remaining_secs} seconds before requesting a new OTP.", 429)
                return

            phone = admin['phone'] or "01521417284"
            otp_code = f"{secrets.randbelow(900000) + 100000:06d}"
            store_sms_otp(conn, admin_id, two_factor_token, otp_code, phone, expiry_minutes=5)
            conn.close()

            # Dispatch SMS to verified phone
            send_sms_otp_dispatch(phone, otp_code)

            self.send_json({
                "success": True,
                "masked_phone": mask_phone(phone),
                "message": f"Verification code sent to {mask_phone(phone)}."
            })
            return

        # 2FA Setup Flow (Authenticated User)
        if path == "/api/auth/2fa/setup":
            ctx = self.get_auth_context()
            if not ctx:
                self.send_error_json("Unauthorized. Please sign in.", 401)
                return

            admin_id = ctx.get("uid")
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, username, email FROM admins WHERE id = ?", (admin_id,))
            admin = cur.fetchone()
            conn.close()

            if not admin:
                self.send_error_json("Admin user not found.", 404)
                return

            secret = pyotp.random_base32()
            email_or_user = admin['email'] or admin['username'] or "admin@central-cms"
            totp = pyotp.TOTP(secret)
            uri = totp.provisioning_uri(name=email_or_user, issuer_name="Ashifur Rahman Central CMS")

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=8,
                border=3,
            )
            qr.add_data(uri)
            qr.make(fit=True)
            img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            qr_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            qr_data_url = f"data:image/png;base64,{qr_base64}"

            setup_token = generate_2fa_setup_token(admin_id, secret)

            self.send_json({
                "success": True,
                "setup_token": setup_token,
                "manual_key": secret,
                "qr_code": qr_data_url
            })
            return

        # 2FA Enable Confirmation
        if path == "/api/auth/2fa/enable":
            ctx = self.get_auth_context()
            if not ctx:
                self.send_error_json("Unauthorized. Please sign in.", 401)
                return

            data = self.read_json_body()
            setup_token = data.get("setup_token", "").strip()
            code = data.get("code", "").strip()

            if not setup_token or not code:
                self.send_error_json("Setup token and 6-digit verification code are required.", 400)
                return

            setup_claims = verify_2fa_setup_token(setup_token)
            if not setup_claims or setup_claims.get("uid") != ctx.get("uid"):
                self.send_error_json("Setup session expired or invalid. Please restart setup.", 400)
                return

            secret = setup_claims.get("secret")
            totp = pyotp.TOTP(secret)
            if not totp.verify(code, valid_window=1):
                self.send_error_json("Invalid verification code. Check the time on your authenticator app.", 400)
                return

            def gen_code():
                return f"{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
            recovery_codes = [gen_code() for _ in range(8)]

            conn = get_db_connection()
            enable_admin_2fa(conn, ctx.get("uid"), secret, recovery_codes)
            log_activity(conn, "2FA Enabled", None, "Security", f"User '{ctx.get('sub')}' enabled Two-Factor Authentication.", ctx.get('sub'))
            conn.close()

            self.send_json({
                "success": True,
                "message": "Two-Factor Authentication is now enabled.",
                "recovery_codes": recovery_codes
            })
            return

        # 2FA Disable Flow
        if path == "/api/auth/2fa/disable":
            ctx = self.get_auth_context()
            if not ctx:
                self.send_error_json("Unauthorized. Please sign in.", 401)
                return

            data = self.read_json_body()
            password = data.get("password", "").strip()
            code = data.get("code", "").strip()

            if not password or not code:
                self.send_error_json("Current password and 2FA / recovery code are required to disable 2FA.", 400)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM admins WHERE id = ?", (ctx.get("uid"),))
            admin = cur.fetchone()

            if not admin:
                conn.close()
                self.send_error_json("Admin user not found.", 404)
                return

            if not verify_password(password, admin['password_hash'], admin['salt']):
                conn.close()
                self.send_error_json("Incorrect password.", 401)
                return

            code_verified = False
            if admin['totp_secret']:
                totp = pyotp.TOTP(admin['totp_secret'])
                if totp.verify(code, valid_window=1):
                    code_verified = True

            if not code_verified:
                if verify_and_consume_recovery_code(conn, admin['id'], code):
                    code_verified = True

            if not code_verified:
                conn.close()
                self.send_error_json("Invalid 2FA authenticator or recovery code.", 400)
                return

            disable_admin_2fa(conn, admin['id'])
            log_activity(conn, "2FA Disabled", None, "Security", f"User '{admin['username']}' disabled Two-Factor Authentication.", admin['username'])
            conn.close()

            self.send_json({
                "success": True,
                "message": "Two-Factor Authentication has been successfully disabled."
            })
            return

        # 2FA Regenerate Recovery Codes
        if path == "/api/auth/2fa/regenerate-recovery-codes":
            ctx = self.get_auth_context()
            if not ctx:
                self.send_error_json("Unauthorized. Please sign in.", 401)
                return

            data = self.read_json_body()
            password = data.get("password", "").strip()
            code = data.get("code", "").strip()

            if not password and not code:
                self.send_error_json("Password or current authenticator code required.", 400)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM admins WHERE id = ?", (ctx.get("uid"),))
            admin = cur.fetchone()

            if not admin or not admin['two_factor_enabled']:
                conn.close()
                self.send_error_json("2FA is not enabled on this account.", 400)
                return

            verified = False
            if password and verify_password(password, admin['password_hash'], admin['salt']):
                verified = True
            elif code and admin['totp_secret']:
                totp = pyotp.TOTP(admin['totp_secret'])
                if totp.verify(code, valid_window=1):
                    verified = True

            if not verified:
                conn.close()
                self.send_error_json("Verification failed. Incorrect password or authenticator code.", 401)
                return

            def gen_code():
                return f"{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
            new_codes = [gen_code() for _ in range(8)]
            store_recovery_codes(conn, admin['id'], new_codes)
            log_activity(conn, "Recovery Codes Regenerated", None, "Security", f"User '{admin['username']}' regenerated 2FA recovery codes.", admin['username'])
            conn.close()

            self.send_json({
                "success": True,
                "recovery_codes": new_codes,
                "message": "New recovery codes generated. Old codes are now invalid."
            })
            return

        # 1b. Forgot Password - Generate Recovery Token
        if path == "/api/auth/forgot-password":
            data = self.read_json_body()
            identifier = data.get("identifier", "").strip() or data.get("email", "").strip() or data.get("username", "").strip()

            if not identifier:
                self.send_error_json("Please provide your username or email.", 400)
                return

            conn = get_db_connection()
            admin = get_admin_by_identifier(conn, identifier)

            if not admin:
                conn.close()
                # Return generic positive message to prevent user enumeration
                self.send_json({
                    "success": True,
                    "message": "If an account matches that username or email, password reset instructions have been issued."
                })
                return

            reset_token = secrets.token_urlsafe(32)
            expires_at = create_password_reset(conn, admin['id'], identifier, reset_token, expiry_hours=1)
            log_activity(conn, "Password Reset Requested", None, "Security", f"Password reset requested for admin '{admin['username']}'.", admin['username'])
            conn.close()

            self.send_json({
                "success": True,
                "message": "Password reset token generated successfully. Valid for 1 hour.",
                "reset_token": reset_token,
                "expires_at": expires_at
            })
            return

        # 1c. Reset Password - Consume Token and Update Password
        if path == "/api/auth/reset-password":
            data = self.read_json_body()
            token = data.get("token", "").strip()
            new_pass = data.get("new_password", "").strip()

            if not token or not new_pass:
                self.send_error_json("Reset token and new password are required.", 400)
                return

            if len(new_pass) < 8:
                self.send_error_json("New password must be at least 8 characters.", 400)
                return

            conn = get_db_connection()
            ok, result = complete_password_reset(conn, token, new_pass)

            if not ok:
                conn.close()
                self.send_error_json(result, 400)
                return

            log_activity(conn, "Password Reset Completed", None, "Security", f"Password successfully reset for admin '{result}'.", result)
            conn.close()

            self.send_json({
                "success": True,
                "message": "Password reset successful! You can now log in with your new password."
            })
            return

        # 2. Public Contact Message Form
        if path == "/api/contact":
            data = self.read_json_body()
            name = data.get("name", "").strip()
            email = data.get("email", "").strip()
            subject = data.get("subject", "").strip()
            message = data.get("message", "").strip()

            if not name or not email or not message:
                self.send_error_json("Name, email, and message are required.")
                return

            client_ip = self.client_address[0] if self.client_address else "unknown"
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
            INSERT INTO contact_messages (name, email, subject, message, is_read, ip_address, created_at)
            VALUES (?, ?, ?, ?, 0, ?, ?)
            """, (name, email, subject, message, client_ip, now_str))
            conn.commit()
            conn.close()

            self.send_json({
                "success": True,
                "message": "Thank you! Your message has been sent successfully."
            })
            return

        # 3. All following POST endpoints require authentication
        ctx = self.get_auth_context()
        if not ctx:
            self.send_error_json("Unauthorized access. Valid administrator session required.", 401)
            return
        user = ctx.get("sub")
        user_role = ctx.get("role", "admin")

        # 3a. Secure Logout
        if path == "/api/auth/logout":
            conn = get_db_connection()
            log_activity(conn, "Admin Logout", None, "Central CMS", f"Admin '{user}' signed out of Central CMS.", user)
            conn.close()
            self.send_json({"success": True, "message": "Signed out successfully."})
            return

        # 3b. Change Password
        if path == "/api/auth/change-password":
            data = self.read_json_body()
            curr_pass = data.get("current_password", "").strip()
            new_pass = data.get("new_password", "").strip()

            if not curr_pass or not new_pass or len(new_pass) < 8:
                self.send_error_json("New password must be at least 8 characters.", 400)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM admins WHERE username = ?", (user,))
            admin = cur.fetchone()

            if not admin or not verify_password(curr_pass, admin['password_hash'], admin['salt']):
                conn.close()
                self.send_error_json("Current password is incorrect.", 400)
                return

            new_hash, new_salt = hash_password(new_pass)
            now_str = datetime.now().isoformat()
            cur.execute("""
            UPDATE admins SET password_hash = ?, salt = ?, updated_at = ?
            WHERE id = ?
            """, (new_hash, new_salt, now_str, admin['id']))
            log_activity(conn, "Password Changed", None, "Security", f"Admin '{user}' successfully updated their account password.", user)
            conn.commit()
            conn.close()

            self.send_json({"success": True, "message": "Password changed successfully."})
            return

        # 3c. Record Custom Action History
        if path == "/api/admin/history/log":
            data = self.read_json_body()
            action = data.get("action", "Dashboard Action").strip()
            details = data.get("details", "").strip()
            website_name = data.get("website_name", "Central CMS").strip()

            conn = get_db_connection()
            log_activity(conn, action, None, website_name, details, user)
            conn.close()

            self.send_json({"success": True, "message": "Activity recorded successfully."})
            return

        # Super Admin: Create Administrator or Editor
        if path == "/api/admin/users":
            if user_role != "super_admin":
                self.send_error_json("Only Super Admin can manage administrators.", 403)
                return
            data = self.read_json_body()
            new_username = data.get("username", "").strip()
            new_password = data.get("password", "").strip()
            new_email = data.get("email", "").strip()
            new_role = data.get("role", "admin").strip().lower()
            new_fullname = data.get("full_name", "").strip() or "Administrator"
            new_perms = json.dumps(data.get("permissions", ["*"]))
            new_sites = json.dumps(data.get("websites", ["*"]))

            if not new_username or not new_password or len(new_password) < 8:
                self.send_error_json("Username and password (minimum 8 characters) are required.", 400)
                return

            if new_role not in ["super_admin", "admin", "editor"]:
                self.send_error_json("Role must be 'super_admin', 'admin', or 'editor'.", 400)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id FROM admins WHERE LOWER(username) = LOWER(?) OR (email != '' AND LOWER(email) = LOWER(?))", (new_username, new_email))
            if cur.fetchone():
                conn.close()
                self.send_error_json(f"An administrator with username '{new_username}' or email '{new_email}' already exists.", 400)
                return

            pw_hash, salt = hash_password(new_password)
            now_str = datetime.now().isoformat()
            cur.execute("""
            INSERT INTO admins (
                username, email, full_name, role, is_active, failed_login_attempts,
                permissions_json, assigned_websites_json, password_hash, salt, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?)
            """, (new_username, new_email, new_fullname, new_role, new_perms, new_sites, pw_hash, salt, now_str, now_str))
            new_id = cur.lastrowid
            log_activity(conn, "Admin Created", None, "User Management", f"Super Admin '{user}' created new user '{new_username}' with role '{new_role}'.", user)
            conn.commit()
            conn.close()

            self.send_json({"success": True, "id": new_id, "message": f"Administrator '{new_username}' created successfully."})
            return

        # Super Admin: Update Administrator / Editor Role & Website Permissions
        if path == "/api/admin/users/update":
            if user_role != "super_admin":
                self.send_error_json("Only Super Admin can manage user roles and permissions.", 403)
                return
            data = self.read_json_body()
            target_id = data.get("id")
            if not target_id:
                self.send_error_json("User ID is required.", 400)
                return
            
            new_role = data.get("role", "admin").strip().lower()
            if new_role not in ["super_admin", "admin", "editor"]:
                self.send_error_json("Role must be 'super_admin', 'admin', or 'editor'.", 400)
                return

            new_fullname = data.get("full_name", "").strip() or "User"
            new_email = data.get("email", "").strip()
            new_sites = json.dumps(data.get("websites", ["*"]))
            is_active = 1 if data.get("is_active", True) else 0
            new_password = data.get("password", "").strip()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, username FROM admins WHERE id = ?", (target_id,))
            target_user = cur.fetchone()
            if not target_user:
                conn.close()
                self.send_error_json("User not found.", 404)
                return

            now_str = datetime.now().isoformat()
            if new_password and len(new_password) >= 8:
                pw_hash, salt = hash_password(new_password)
                cur.execute("""
                UPDATE admins SET
                    role = ?, full_name = ?, email = ?, assigned_websites_json = ?,
                    is_active = ?, password_hash = ?, salt = ?, updated_at = ?
                WHERE id = ?
                """, (new_role, new_fullname, new_email, new_sites, is_active, pw_hash, salt, now_str, target_id))
            else:
                cur.execute("""
                UPDATE admins SET
                    role = ?, full_name = ?, email = ?, assigned_websites_json = ?,
                    is_active = ?, updated_at = ?
                WHERE id = ?
                """, (new_role, new_fullname, new_email, new_sites, is_active, now_str, target_id))

            log_activity(conn, "User Permissions Updated", None, "User Management", f"Super Admin updated user '{target_user['username']}' to role '{new_role}'.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"User '{target_user['username']}' updated successfully."})
            return

        # Super Admin: Delete Administrator / Editor
        if path == "/api/admin/users/delete":
            if user_role != "super_admin":
                self.send_error_json("Only Super Admin can delete administrators.", 403)
                return
            data = self.read_json_body()
            target_id = data.get("id")
            if not target_id:
                self.send_error_json("User ID is required.", 400)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, username, role FROM admins WHERE id = ?", (target_id,))
            target_user = cur.fetchone()
            if not target_user:
                conn.close()
                self.send_error_json("User not found.", 404)
                return

            if target_user['username'] == user or target_user['id'] == 1:
                conn.close()
                self.send_error_json("Cannot delete the primary Super Admin account.", 400)
                return

            cur.execute("DELETE FROM admins WHERE id = ?", (target_id,))
            log_activity(conn, "Admin Removed", None, "User Management", f"Super Admin '{user}' deleted user '{target_user['username']}'.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"User '{target_user['username']}' deleted successfully."})
            return

        # Super Admin: Save System Settings (General, CMS, Website, Email, Security, API)
        if path == "/api/admin/system-settings":
            if user_role != "super_admin":
                self.send_error_json("Only Super Admin can modify system settings.", 403)
                return
            data = self.read_json_body()
            category = data.get("category", "").strip().lower()
            settings_obj = data.get("settings", {})
            if category not in ["general", "cms", "website", "email", "security", "api"]:
                self.send_error_json("Invalid settings category.", 400)
                return

            conn = get_db_connection()
            cur = conn.cursor()
            now_str = datetime.now().isoformat()
            cur.execute("""
            INSERT INTO central_system_settings (category, settings_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(category) DO UPDATE SET
                settings_json = excluded.settings_json,
                updated_at = excluded.updated_at
            """, (category, json.dumps(settings_obj), now_str))
            log_activity(conn, "Settings Updated", None, "System Settings", f"Super Admin '{user}' updated '{category.upper()}' configuration.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"{category.capitalize()} settings saved successfully."})
            return

        # File & Image Upload
        if path == "/api/upload":
            data = self.read_json_body()
            file_name = data.get("filename", "")
            base64_content = data.get("content", "")

            if not base64_content:
                self.send_error_json("No file data provided.")
                return

            # Clean base64 header if present (e.g. data:image/png;base64,...)
            if "," in base64_content:
                _, base64_content = base64_content.split(",", 1)

            try:
                file_bytes = base64.b64decode(base64_content)
            except Exception as e:
                self.send_error_json("Invalid base64 encoding.")
                return

            # Generate unique safe file name
            ext = os.path.splitext(file_name)[1].lower() if file_name else ""
            if not ext:
                ext = ".png"
            
            clean_name = f"{uuid.uuid4().hex[:12]}{ext}"
            target_path = os.path.join(UPLOADS_DIR, clean_name)

            with open(target_path, "wb") as f:
                f.write(file_bytes)

            file_url = f"/uploads/{clean_name}"

            # If it's a PDF resume upload, also record in resumes table
            if ext == ".pdf":
                now_str = datetime.now().isoformat()
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute("UPDATE resumes SET is_active = 0")
                cur.execute("""
                INSERT INTO resumes (file_name, file_url, file_size, upload_date, is_active)
                VALUES (?, ?, ?, ?, 1)
                """, (file_name or clean_name, file_url, len(file_bytes), now_str))
                
                # Update Hero secondary button link
                cur.execute("UPDATE hero SET secondary_btn_link = ? WHERE id = 1", (file_url,))
                conn.commit()
                conn.close()

            self.send_json({
                "success": True,
                "url": file_url,
                "filename": clean_name,
                "original_name": file_name,
                "size": len(file_bytes)
            })
            return

        # Create Experience
        if path == "/api/admin/experiences":
            data = self.read_json_body()
            role = data.get("role", "").strip()
            org = data.get("organization", "").strip()
            period = data.get("period", "").strip()
            start_date = data.get("start_date", "").strip()
            end_date = data.get("end_date", "").strip()
            is_current = 1 if data.get("is_current") else 0
            points = json.dumps(data.get("description_points", []))
            loc = data.get("location", "").strip()
            website = data.get("website", "").strip()
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM experiences")
            next_order = cur.fetchone()[0]

            cur.execute("""
            INSERT INTO experiences (role, organization, period, start_date, end_date, is_current,
                                     description_points, location, website, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (role, org, period, start_date, end_date, is_current, points, loc, website, next_order, now_str))
            new_id = cur.lastrowid
            conn.commit()
            conn.close()

            self.send_json({"success": True, "id": new_id, "message": "Experience created successfully."})
            return

        # Create Education
        if path == "/api/admin/educations":
            data = self.read_json_body()
            degree = data.get("degree", "").strip()
            inst = data.get("institution", "").strip()
            subject = data.get("subject", "").strip()
            start_yr = data.get("start_year", "").strip()
            end_yr = data.get("end_year", "").strip()
            result = data.get("result", "").strip()
            badge = data.get("badge_text", "").strip()
            desc = data.get("description", "").strip()
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM educations")
            next_order = cur.fetchone()[0]

            cur.execute("""
            INSERT INTO educations (degree, institution, subject, start_year, end_year, result,
                                   badge_text, description, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (degree, inst, subject, start_yr, end_yr, result, badge, desc, next_order, now_str))
            new_id = cur.lastrowid
            conn.commit()
            conn.close()

            self.send_json({"success": True, "id": new_id, "message": "Education created successfully."})
            return

        # Create Skill
        if path == "/api/admin/skills":
            data = self.read_json_body()
            cat = data.get("category", "General").strip()
            name = data.get("name", "").strip()
            level = int(data.get("level", 80))
            icon = data.get("icon", "check").strip()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM skills WHERE category = ?", (cat,))
            next_order = cur.fetchone()[0]

            cur.execute("""
            INSERT INTO skills (category, name, level, icon, sort_order)
            VALUES (?, ?, ?, ?, ?)
            """, (cat, name, level, icon, next_order))
            new_id = cur.lastrowid
            conn.commit()
            conn.close()

            self.send_json({"success": True, "id": new_id, "message": "Skill created successfully."})
            return

        # Create Project
        if path == "/api/admin/projects":
            data = self.read_json_body()
            title = data.get("title", "").strip()
            short_desc = data.get("short_description", "").strip()
            full_desc = data.get("full_description", "").strip()
            image_url = data.get("image_url", "").strip()
            add_imgs = json.dumps(data.get("additional_images", []))
            tags = json.dumps(data.get("tags", []))
            cat = data.get("category", "").strip()
            live_url = data.get("live_url", "").strip()
            github_url = data.get("github_url", "").strip()
            p_date = data.get("project_date", "").strip()
            is_feat = 1 if data.get("is_featured") else 0
            is_pub = 1 if data.get("is_published", True) else 0
            num = data.get("project_number", "").strip()
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM projects")
            next_order = cur.fetchone()[0]
            if not num:
                num = f"{next_order:02d}"

            cur.execute("""
            INSERT INTO projects (project_number, title, short_description, full_description,
                                  image_url, additional_images_json, tags_json, category,
                                  live_url, github_url, project_date, is_featured, is_published,
                                  sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (num, title, short_desc, full_desc, image_url, add_imgs, tags, cat, live_url,
                  github_url, p_date, is_feat, is_pub, next_order, now_str))
            new_id = cur.lastrowid
            conn.commit()
            conn.close()

            self.send_json({"success": True, "id": new_id, "message": "Project created successfully."})
            return

        # Create Service
        if path == "/api/admin/services":
            data = self.read_json_body()
            title = data.get("title", "").strip()
            desc = data.get("description", "").strip()
            icon = data.get("icon", "zap").strip()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM services")
            next_order = cur.fetchone()[0]

            cur.execute("""
            INSERT INTO services (title, description, icon, sort_order)
            VALUES (?, ?, ?, ?)
            """, (title, desc, icon, next_order))
            new_id = cur.lastrowid
            conn.commit()
            conn.close()

            self.send_json({"success": True, "id": new_id, "message": "Service created successfully."})
            return

        # Reorder items
        if path == "/api/admin/reorder":
            data = self.read_json_body()
            table_name = data.get("table")
            order_list = data.get("order", []) # list of ids in new order

            allowed_tables = ["experiences", "educations", "skills", "projects", "services", "highlights"]
            if table_name not in allowed_tables:
                self.send_error_json("Invalid table for reordering.")
                return

            conn = get_db_connection()
            cur = conn.cursor()
            for idx, item_id in enumerate(order_list):
                cur.execute(f"UPDATE {table_name} SET sort_order = ? WHERE id = ?", (idx + 1, item_id))
            conn.commit()
            conn.close()

            self.send_json({"success": True, "message": "Order updated successfully."})
            return

        # Create Website
        if path == "/api/admin/websites":
            data = self.read_json_body()
            name = data.get("name", "").strip()
            if not name:
                self.send_error_json("Website name is required.")
                return

            slug = data.get("slug", "").strip()
            if not slug:
                slug = "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")
            
            url = data.get("url", "").strip()
            cms_url = data.get("cms_url", "").strip()
            desc = data.get("description", "").strip()
            w_type = data.get("website_type", "Web Application").strip()
            c_type = data.get("cms_type", "Built-in Central CMS").strip()
            status = data.get("status", "active").strip()
            c_status = data.get("connection_status", "connected").strip()
            logo = data.get("logo", "").strip()
            settings_json = json.dumps(data.get("settings", {}))
            now_str = datetime.now().isoformat()
            api_key = f"key_{uuid.uuid4().hex[:12]}"

            conn = get_db_connection()
            cur = conn.cursor()
            try:
                cur.execute("""
                INSERT INTO websites (name, slug, url, cms_url, description, website_type,
                                      cms_type, status, connection_status, logo, api_key,
                                      settings_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (name, slug, url, cms_url, desc, w_type, c_type, status, c_status, logo, api_key, settings_json, now_str, now_str))
                new_id = cur.lastrowid
                log_activity(conn, "Website Added", new_id, name, f"Added website '{name}' to Central CMS.", user)
                conn.commit()
                conn.close()
                self.send_json({"success": True, "id": new_id, "message": f"Website '{name}' added successfully."})
                return
            except sqlite3.IntegrityError:
                conn.close()
                self.send_error_json(f"A website with slug '{slug}' already exists.", 400)
                return

        # Ping / Test Website Connection
        if path.startswith("/api/admin/websites/") and path.endswith("/ping"):
            parts = path.strip("/").split("/")
            site_id = parts[3]
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM websites WHERE id = ?", (site_id,))
            site = cur.fetchone()
            if not site:
                conn.close()
                self.send_error_json("Website not found.", 404)
                return

            site_url = site['url']
            is_online = False
            latency_ms = 0
            if site_url:
                try:
                    start_t = datetime.now()
                    req = urllib.request.Request(site_url, headers={'User-Agent': 'CentralCMS-Monitor/1.0'})
                    with urllib.request.urlopen(req, timeout=4) as response:
                        if response.status in [200, 301, 302, 307, 308]:
                            is_online = True
                    latency_ms = int((datetime.now() - start_t).total_seconds() * 1000)
                except Exception:
                    is_online = bool(site_url.startswith("http"))
            
            new_status = "connected" if is_online else "offline"
            now_str = datetime.now().isoformat()
            cur.execute("UPDATE websites SET connection_status = ?, updated_at = ? WHERE id = ?", (new_status, now_str, site_id))
            log_activity(conn, "Connection Tested", site['id'], site['name'], f"Connection check: {new_status} ({latency_ms}ms)", user)
            conn.commit()
            conn.close()
            self.send_json({
                "success": True,
                "connection_status": new_status,
                "latency_ms": latency_ms,
                "message": f"Website is {new_status} ({latency_ms}ms)"
            })
            return

        # ToolGhor: Create Tool
        if path == "/api/admin/toolghor/tools":
            data = self.read_json_body()
            name = data.get("name", "").strip()
            if not name:
                self.send_error_json("Tool name is required.")
                return
            cat_id = data.get("category_id")
            cat_name = data.get("category_name", "General").strip()
            slug = data.get("slug", "").strip() or "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")
            short_desc = data.get("short_description", "").strip()
            full_desc = data.get("full_description", "").strip()
            icon = data.get("icon", "wrench").strip()
            url = data.get("url", "").strip()
            badge = data.get("badge", "").strip()
            is_feat = 1 if data.get("is_featured") else 0
            is_act = 1 if data.get("is_active", True) else 0
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM toolghor_tools")
            next_order = cur.fetchone()[0]

            cur.execute("""
            INSERT INTO toolghor_tools (category_id, category_name, name, slug, short_description,
                                       full_description, icon, url, badge, is_featured, is_active,
                                       sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (cat_id, cat_name, name, slug, short_desc, full_desc, icon, url, badge, is_feat, is_act, next_order, now_str, now_str))
            new_id = cur.lastrowid
            log_activity(conn, "Tool Created", 2, "ToolGhor", f"Created tool: '{name}'", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "id": new_id, "message": "Tool created successfully."})
            return

        # ToolGhor: Create Category
        if path == "/api/admin/toolghor/categories":
            data = self.read_json_body()
            name = data.get("name", "").strip()
            if not name:
                self.send_error_json("Category name is required.")
                return
            slug = data.get("slug", "").strip() or "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")
            desc = data.get("description", "").strip()
            icon = data.get("icon", "folder").strip()
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM toolghor_categories")
            next_order = cur.fetchone()[0]

            cur.execute("""
            INSERT INTO toolghor_categories (name, slug, description, icon, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (name, slug, desc, icon, next_order, now_str))
            new_id = cur.lastrowid
            log_activity(conn, "Category Created", 2, "ToolGhor", f"Created category: '{name}'", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "id": new_id, "message": "Category created successfully."})
            return

        # Future Websites: Add Modular Content
        if path.startswith("/api/admin/websites/") and path.endswith("/modules"):
            parts = path.strip("/").split("/")
            site_id = parts[3]
            data = self.read_json_body()
            mod_key = data.get("module_key", "").strip()
            mod_title = data.get("module_title", "").strip()
            mod_content = json.dumps(data.get("content", {}))
            now_str = datetime.now().isoformat()

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
            INSERT INTO website_content_modules (website_id, module_key, module_title, content_json, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """, (site_id, mod_key, mod_title, mod_content, now_str))
            new_id = cur.lastrowid
            log_activity(conn, "Module Added", site_id, f"Website #{site_id}", f"Added content module '{mod_title}'", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "id": new_id, "message": "Module created successfully."})
            return

        self.send_error_json("Endpoint not found", 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        user = self.get_auth_user()
        if not user:
            self.send_error_json("Unauthorized", 401)
            return

        data = self.read_json_body()
        now_str = datetime.now().isoformat()
        conn = get_db_connection()
        cur = conn.cursor()

        # Update Hero
        if path == "/api/admin/hero":
            cur.execute("""
            UPDATE hero SET
                name = ?, title = ?, badge_text = ?, introduction = ?, profile_image = ?,
                primary_btn_text = ?, primary_btn_link = ?, secondary_btn_text = ?, secondary_btn_link = ?,
                spec_badge_label = ?, spec_badge_title = ?, updated_at = ?
            WHERE id = 1
            """, (
                data.get("name"), data.get("title"), data.get("badge_text"),
                data.get("introduction"), data.get("profile_image"),
                data.get("primary_btn_text"), data.get("primary_btn_link"),
                data.get("secondary_btn_text"), data.get("secondary_btn_link"),
                data.get("spec_badge_label"), data.get("spec_badge_title"),
                now_str
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Hero section updated."})
            return

        # Update About
        if path == "/api/admin/about":
            cur.execute("""
            UPDATE about SET
                subtitle = ?, title = ?, description1 = ?, description2 = ?, profile_image = ?,
                focus1_title = ?, focus1_text = ?, focus2_title = ?, focus2_text = ?, updated_at = ?
            WHERE id = 1
            """, (
                data.get("subtitle"), data.get("title"), data.get("description1"),
                data.get("description2"), data.get("profile_image"),
                data.get("focus1_title"), data.get("focus1_text"),
                data.get("focus2_title"), data.get("focus2_text"),
                now_str
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "About section updated."})
            return

        # Update Highlights
        if path == "/api/admin/highlights":
            items = data.get("highlights", [])
            for h in items:
                h_id = h.get("id")
                if h_id:
                    cur.execute("""
                    UPDATE highlights SET metric_value = ?, metric_label = ?, metric_subtext = ?, sort_order = ?
                    WHERE id = ?
                    """, (h.get("metric_value"), h.get("metric_label"), h.get("metric_subtext"), h.get("sort_order", 0), h_id))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Key highlights updated."})
            return

        # Update Experience Item
        if path.startswith("/api/admin/experiences/"):
            exp_id = path.split("/")[-1]
            cur.execute("""
            UPDATE experiences SET
                role = ?, organization = ?, period = ?, start_date = ?, end_date = ?,
                is_current = ?, description_points = ?, location = ?, website = ?, sort_order = ?
            WHERE id = ?
            """, (
                data.get("role"), data.get("organization"), data.get("period"),
                data.get("start_date"), data.get("end_date"),
                1 if data.get("is_current") else 0,
                json.dumps(data.get("description_points", [])),
                data.get("location"), data.get("website"), data.get("sort_order", 0),
                exp_id
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Experience updated."})
            return

        # Update Education Item
        if path.startswith("/api/admin/educations/"):
            edu_id = path.split("/")[-1]
            cur.execute("""
            UPDATE educations SET
                degree = ?, institution = ?, subject = ?, start_year = ?, end_year = ?,
                result = ?, badge_text = ?, description = ?, sort_order = ?
            WHERE id = ?
            """, (
                data.get("degree"), data.get("institution"), data.get("subject"),
                data.get("start_year"), data.get("end_year"), data.get("result"),
                data.get("badge_text"), data.get("description"), data.get("sort_order", 0),
                edu_id
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Education updated."})
            return

        # Update Skill Item
        if path.startswith("/api/admin/skills/"):
            skill_id = path.split("/")[-1]
            cur.execute("""
            UPDATE skills SET
                category = ?, name = ?, level = ?, icon = ?, sort_order = ?
            WHERE id = ?
            """, (
                data.get("category"), data.get("name"), int(data.get("level", 80)),
                data.get("icon"), data.get("sort_order", 0), skill_id
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Skill updated."})
            return

        # Update Skill Badges List
        if path == "/api/admin/skill-badges":
            badges = data.get("badges", [])
            cur.execute("DELETE FROM skill_badges")
            for idx, b in enumerate(badges):
                name = b if isinstance(b, str) else b.get("name")
                if name:
                    cur.execute("INSERT INTO skill_badges (name, sort_order) VALUES (?, ?)", (name.strip(), idx + 1))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Skill badges updated."})
            return

        # Update Project Item
        if path.startswith("/api/admin/projects/"):
            proj_id = path.split("/")[-1]
            cur.execute("""
            UPDATE projects SET
                project_number = ?, title = ?, short_description = ?, full_description = ?,
                image_url = ?, additional_images_json = ?, tags_json = ?, category = ?,
                live_url = ?, github_url = ?, project_date = ?, is_featured = ?, is_published = ?,
                sort_order = ?
            WHERE id = ?
            """, (
                data.get("project_number"), data.get("title"), data.get("short_description"),
                data.get("full_description"), data.get("image_url"),
                json.dumps(data.get("additional_images", [])),
                json.dumps(data.get("tags", [])), data.get("category"),
                data.get("live_url"), data.get("github_url"), data.get("project_date"),
                1 if data.get("is_featured") else 0,
                1 if data.get("is_published", True) else 0,
                data.get("sort_order", 0), proj_id
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Project updated."})
            return

        # Update Service Item
        if path.startswith("/api/admin/services/"):
            serv_id = path.split("/")[-1]
            cur.execute("""
            UPDATE services SET
                title = ?, description = ?, icon = ?, sort_order = ?
            WHERE id = ?
            """, (
                data.get("title"), data.get("description"), data.get("icon"),
                data.get("sort_order", 0), serv_id
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Service updated."})
            return

        # Update Social Links
        if path == "/api/admin/social":
            cur.execute("""
            UPDATE social_links SET
                email = ?, phone = ?, whatsapp = ?, linkedin = ?, github = ?,
                facebook = ?, location = ?, maps_url = ?, updated_at = ?
            WHERE id = 1
            """, (
                data.get("email"), data.get("phone"), data.get("whatsapp"),
                data.get("linkedin"), data.get("github"), data.get("facebook"),
                data.get("location"), data.get("maps_url"), now_str
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Social and contact links updated."})
            return

        # Mark Message as Read/Unread
        if path.startswith("/api/admin/messages/") and path.endswith("/read"):
            msg_id = path.split("/")[-2]
            is_read = 1 if data.get("is_read", True) else 0
            cur.execute("UPDATE contact_messages SET is_read = ? WHERE id = ?", (is_read, msg_id))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Message read status updated."})
            return

        # Update Site Settings
        if path == "/api/admin/settings":
            cur.execute("""
            UPDATE site_settings SET
                site_title = ?, brand_logo = ?, favicon_url = ?, meta_description = ?,
                og_image_url = ?, footer_brand = ?, footer_copyright = ?, updated_at = ?
            WHERE id = 1
            """, (
                data.get("site_title"), data.get("brand_logo"), data.get("favicon_url"),
                data.get("meta_description"), data.get("og_image_url"),
                data.get("footer_brand"), data.get("footer_copyright"), now_str
            ))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Site settings updated."})
            return

        # Update Website Details
        if path.startswith("/api/admin/websites/") and not "/modules/" in path:
            site_id = path.split("/")[-1]
            cur.execute("""
            UPDATE websites SET
                name = ?, slug = ?, url = ?, cms_url = ?, description = ?,
                website_type = ?, cms_type = ?, status = ?, connection_status = ?,
                logo = ?, settings_json = ?, updated_at = ?
            WHERE id = ?
            """, (
                data.get("name"), data.get("slug"), data.get("url"),
                data.get("cms_url"), data.get("description"),
                data.get("website_type"), data.get("cms_type"),
                data.get("status"), data.get("connection_status"),
                data.get("logo"), json.dumps(data.get("settings", {})),
                now_str, site_id
            ))
            log_activity(conn, "Website Updated", site_id, data.get("name"), f"Updated website configuration for ID {site_id}.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Website updated successfully."})
            return

        # Update ToolGhor Tool
        if path.startswith("/api/admin/toolghor/tools/"):
            tool_id = path.split("/")[-1]
            cur.execute("""
            UPDATE toolghor_tools SET
                category_id = ?, category_name = ?, name = ?, slug = ?,
                short_description = ?, full_description = ?, icon = ?, url = ?,
                badge = ?, is_featured = ?, is_active = ?, sort_order = ?, updated_at = ?
            WHERE id = ?
            """, (
                data.get("category_id"), data.get("category_name"), data.get("name"),
                data.get("slug"), data.get("short_description"), data.get("full_description"),
                data.get("icon"), data.get("url"), data.get("badge"),
                1 if data.get("is_featured") else 0,
                1 if data.get("is_active", True) else 0,
                data.get("sort_order", 0), now_str, tool_id
            ))
            log_activity(conn, "Tool Updated", 2, "ToolGhor", f"Updated tool ID {tool_id}: '{data.get('name')}'", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Tool updated successfully."})
            return

        # Update ToolGhor Category
        if path.startswith("/api/admin/toolghor/categories/"):
            cat_id = path.split("/")[-1]
            cur.execute("""
            UPDATE toolghor_categories SET
                name = ?, slug = ?, description = ?, icon = ?, sort_order = ?
            WHERE id = ?
            """, (
                data.get("name"), data.get("slug"), data.get("description"),
                data.get("icon"), data.get("sort_order", 0), cat_id
            ))
            log_activity(conn, "Category Updated", 2, "ToolGhor", f"Updated category ID {cat_id}: '{data.get('name')}'", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Category updated successfully."})
            return

        # Update ToolGhor Settings
        if path == "/api/admin/toolghor/settings":
            cur.execute("""
            UPDATE toolghor_settings SET
                site_title = ?, tagline = ?, hero_headline = ?, hero_subheadline = ?,
                announcement_banner = ?, footer_text = ?, updated_at = ?
            WHERE id = 1
            """, (
                data.get("site_title"), data.get("tagline"), data.get("hero_headline"),
                data.get("hero_subheadline"), data.get("announcement_banner"),
                data.get("footer_text"), now_str
            ))
            log_activity(conn, "Settings Updated", 2, "ToolGhor", "Updated ToolGhor global settings & content.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "ToolGhor settings updated successfully."})
            return

        # Update Custom Website Modular Content
        if path.startswith("/api/admin/websites/") and "/modules/" in path:
            module_id = path.split("/")[-1]
            cur.execute("""
            UPDATE website_content_modules SET
                module_key = ?, module_title = ?, content_json = ?, updated_at = ?
            WHERE id = ?
            """, (
                data.get("module_key"), data.get("module_title"),
                json.dumps(data.get("content", {})), now_str, module_id
            ))
            log_activity(conn, "Module Updated", None, "Website Module", f"Updated content module ID {module_id}.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Module updated successfully."})
            return

        conn.close()
        self.send_error_json("Endpoint not found", 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        user = self.get_auth_user()
        if not user:
            self.send_error_json("Unauthorized", 401)
            return

        conn = get_db_connection()
        cur = conn.cursor()

        # Delete Website (Protect Primary Portfolio ID = 1)
        if path.startswith("/api/admin/websites/") and not "/modules/" in path:
            site_id = path.split("/")[-1]
            if str(site_id) == "1":
                conn.close()
                self.send_error_json("The primary Portfolio website cannot be deleted.", 400)
                return

            cur.execute("SELECT name FROM websites WHERE id = ?", (site_id,))
            row = cur.fetchone()
            s_name = row['name'] if row else f"ID {site_id}"

            cur.execute("DELETE FROM websites WHERE id = ?", (site_id,))
            cur.execute("DELETE FROM website_content_modules WHERE website_id = ?", (site_id,))
            log_activity(conn, "Website Removed", None, s_name, f"Deleted website entry '{s_name}'.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Website removed successfully."})
            return

        # Delete ToolGhor Tool
        if path.startswith("/api/admin/toolghor/tools/"):
            tool_id = path.split("/")[-1]
            cur.execute("DELETE FROM toolghor_tools WHERE id = ?", (tool_id,))
            log_activity(conn, "Tool Deleted", 2, "ToolGhor", f"Deleted tool ID {tool_id}.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Tool deleted."})
            return

        # Delete ToolGhor Category
        if path.startswith("/api/admin/toolghor/categories/"):
            cat_id = path.split("/")[-1]
            cur.execute("DELETE FROM toolghor_categories WHERE id = ?", (cat_id,))
            log_activity(conn, "Category Deleted", 2, "ToolGhor", f"Deleted category ID {cat_id}.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Category deleted."})
            return

        # Delete Custom Website Modular Content
        if path.startswith("/api/admin/websites/") and "/modules/" in path:
            module_id = path.split("/")[-1]
            cur.execute("DELETE FROM website_content_modules WHERE id = ?", (module_id,))
            log_activity(conn, "Module Deleted", None, "Website Module", f"Deleted content module ID {module_id}.", user)
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Module deleted."})
            return

        # Delete Experience
        if path.startswith("/api/admin/experiences/"):
            exp_id = path.split("/")[-1]
            cur.execute("DELETE FROM experiences WHERE id = ?", (exp_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Experience deleted."})
            return

        # Delete Education
        if path.startswith("/api/admin/educations/"):
            edu_id = path.split("/")[-1]
            cur.execute("DELETE FROM educations WHERE id = ?", (edu_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Education deleted."})
            return

        # Delete Skill
        if path.startswith("/api/admin/skills/"):
            skill_id = path.split("/")[-1]
            cur.execute("DELETE FROM skills WHERE id = ?", (skill_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Skill deleted."})
            return

        # Delete Project
        if path.startswith("/api/admin/projects/"):
            proj_id = path.split("/")[-1]
            cur.execute("DELETE FROM projects WHERE id = ?", (proj_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Project deleted."})
            return

        # Delete Service
        if path.startswith("/api/admin/services/"):
            serv_id = path.split("/")[-1]
            cur.execute("DELETE FROM services WHERE id = ?", (serv_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Service deleted."})
            return

        # Delete Contact Message
        if path.startswith("/api/admin/messages/"):
            msg_id = path.split("/")[-1]
            cur.execute("DELETE FROM contact_messages WHERE id = ?", (msg_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Message deleted."})
            return

        # Delete Resume
        if path.startswith("/api/admin/resumes/"):
            resume_id = path.split("/")[-1]
            cur.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Resume record deleted."})
            return

        conn.close()
        self.send_error_json("Endpoint not found", 404)

def run_server(port=PORT):
    init_db()
    server_address = ('', port)
    httpd = HTTPServer(server_address, PortfolioHandler)
    print("=" * 60)
    print(f"  Ashifur Rahman Portfolio & CMS Server is RUNNING!")
    print(f"  Public Portfolio: http://localhost:{port}/")
    print(f"  Admin CMS Panel:  http://localhost:{port}/admin")
    print(f"  API Content:      http://localhost:{port}/api/content")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
