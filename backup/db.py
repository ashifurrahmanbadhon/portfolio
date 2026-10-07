import os
import json
import sqlite3
import hashlib
import secrets
import hmac
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portfolio.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: str = None):
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, pw_hash: str, salt: str) -> bool:
    check_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    ).hex()
    return hmac.compare_digest(pw_hash, check_hash)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Admins Table (Central Super Admin & Role Architecture)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        full_name TEXT DEFAULT 'Super Admin',
        role TEXT DEFAULT 'super_admin',
        is_active INTEGER DEFAULT 1,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        last_login_at TEXT,
        permissions_json TEXT DEFAULT '["*"]',
        assigned_websites_json TEXT DEFAULT '["*"]',
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 1b. Password Resets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        identifier TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
    """)

    # 1c. 2FA Recovery / Backup Codes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_recovery_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        code_hash TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        used_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
    """)

    # 1d. 2FA SMS OTPs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_sms_otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        challenge_token_hash TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        phone TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
    """)

    # 1e. 2FA Trusted Devices Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_trusted_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        device_token_hash TEXT NOT NULL,
        device_name TEXT,
        ip_address TEXT,
        user_agent TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
    """)

    # Safe Schema Migrations for 2FA columns on admins table if not present
    cursor.execute("PRAGMA table_info(admins)")
    existing_admin_cols = [row['name'] for row in cursor.fetchall()]
    if 'phone' not in existing_admin_cols:
        cursor.execute("ALTER TABLE admins ADD COLUMN phone TEXT DEFAULT '01521417284'")
    if 'two_factor_enabled' not in existing_admin_cols:
        cursor.execute("ALTER TABLE admins ADD COLUMN two_factor_enabled INTEGER DEFAULT 0")
    if 'totp_secret' not in existing_admin_cols:
        cursor.execute("ALTER TABLE admins ADD COLUMN totp_secret TEXT")
    if 'totp_created_at' not in existing_admin_cols:
        cursor.execute("ALTER TABLE admins ADD COLUMN totp_created_at TEXT")
    if 'failed_2fa_attempts' not in existing_admin_cols:
        cursor.execute("ALTER TABLE admins ADD COLUMN failed_2fa_attempts INTEGER DEFAULT 0")
    if 'locked_2fa_until' not in existing_admin_cols:
        cursor.execute("ALTER TABLE admins ADD COLUMN locked_2fa_until TEXT")
    
    # Ensure default verified phone number is set
    cursor.execute("UPDATE admins SET phone = '01521417284' WHERE phone IS NULL OR phone = ''")


    # 2. Hero Section
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hero (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        badge_text TEXT,
        introduction TEXT,
        profile_image TEXT,
        primary_btn_text TEXT,
        primary_btn_link TEXT,
        secondary_btn_text TEXT,
        secondary_btn_link TEXT,
        spec_badge_label TEXT,
        spec_badge_title TEXT,
        updated_at TEXT
    )
    """)

    # 3. About Section
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS about (
        id INTEGER PRIMARY KEY,
        subtitle TEXT,
        title TEXT,
        description1 TEXT,
        description2 TEXT,
        profile_image TEXT,
        focus1_title TEXT,
        focus1_text TEXT,
        focus2_title TEXT,
        focus2_text TEXT,
        updated_at TEXT
    )
    """)

    # 4. Highlights / Stats Bar
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_value TEXT NOT NULL,
        metric_label TEXT NOT NULL,
        metric_subtext TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """)

    # 5. Experience
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        organization TEXT NOT NULL,
        period TEXT,
        start_date TEXT,
        end_date TEXT,
        is_current INTEGER DEFAULT 0,
        description_points TEXT,
        location TEXT,
        website TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT
    )
    """)

    # 6. Education
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS educations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        degree TEXT NOT NULL,
        institution TEXT NOT NULL,
        subject TEXT,
        start_year TEXT,
        end_year TEXT,
        result TEXT,
        badge_text TEXT,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT
    )
    """)

    # 7. Skills
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 80,
        icon TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """)

    # 8. Quick Skill Badges
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skill_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )
    """)

    # 9. Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_number TEXT,
        title TEXT NOT NULL,
        short_description TEXT,
        full_description TEXT,
        image_url TEXT,
        additional_images_json TEXT,
        tags_json TEXT,
        category TEXT,
        live_url TEXT,
        github_url TEXT,
        project_date TEXT,
        is_featured INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT
    )
    """)

    # 10. Services / Engineering Focus Areas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """)

    # 11. Social / Contact Info
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS social_links (
        id INTEGER PRIMARY KEY,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        linkedin TEXT,
        github TEXT,
        facebook TEXT,
        location TEXT,
        maps_url TEXT,
        updated_at TEXT
    )
    """)

    # 12. CV / Resumes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        upload_date TEXT,
        is_active INTEGER DEFAULT 1
    )
    """)

    # 13. Contact Messages
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        ip_address TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 14. Site Settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        site_title TEXT NOT NULL,
        brand_logo TEXT NOT NULL,
        favicon_url TEXT,
        meta_description TEXT,
        og_image_url TEXT,
        footer_brand TEXT,
        footer_copyright TEXT,
        updated_at TEXT
    )
    """)

    # 15. Central CMS: Websites
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        url TEXT NOT NULL,
        cms_url TEXT,
        description TEXT,
        website_type TEXT NOT NULL DEFAULT 'Web Application',
        cms_type TEXT NOT NULL DEFAULT 'Built-in Central CMS',
        status TEXT NOT NULL DEFAULT 'active',
        connection_status TEXT NOT NULL DEFAULT 'connected',
        logo TEXT,
        api_key TEXT,
        settings_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 16. Central CMS: Activity Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        website_id INTEGER,
        website_name TEXT,
        action TEXT NOT NULL,
        details TEXT,
        user TEXT DEFAULT 'admin',
        created_at TEXT NOT NULL
    )
    """)

    # 17. ToolGhor: Categories
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS toolghor_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'folder',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # 18. ToolGhor: Tools Directory
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS toolghor_tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        category_name TEXT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        short_description TEXT,
        full_description TEXT,
        icon TEXT DEFAULT 'wrench',
        url TEXT,
        badge TEXT,
        is_featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 19. ToolGhor: Site Settings & Homepage Content
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS toolghor_settings (
        id INTEGER PRIMARY KEY,
        site_title TEXT NOT NULL,
        tagline TEXT,
        hero_headline TEXT,
        hero_subheadline TEXT,
        announcement_banner TEXT,
        footer_text TEXT,
        updated_at TEXT NOT NULL
    )
    """)

    # 20. Future Websites: Modular Content Storage
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS website_content_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        website_id INTEGER NOT NULL,
        module_key TEXT NOT NULL,
        module_title TEXT NOT NULL,
        content_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    )
    """)

    # 21. Central CMS: System Settings (Role & Security Governed)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS central_system_settings (
        category TEXT PRIMARY KEY,
        settings_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Migrate admins schema to guarantee Super Admin role & permissions fields
    migrate_admins_table(cursor)

    conn.commit()

    # Seed Default Data if empty
    seed_initial_data(conn)
    conn.close()

def migrate_admins_table(cursor):
    """Safely adds missing columns to admins table without altering existing accounts."""
    cursor.execute("PRAGMA table_info(admins)")
    existing_cols = [row[1] for row in cursor.fetchall()]

    needed_cols = [
        ("email", "TEXT"),
        ("full_name", "TEXT DEFAULT 'Super Admin'"),
        ("role", "TEXT DEFAULT 'super_admin'"),
        ("is_active", "INTEGER DEFAULT 1"),
        ("failed_login_attempts", "INTEGER DEFAULT 0"),
        ("locked_until", "TEXT"),
        ("last_login_at", "TEXT"),
        ("permissions_json", "TEXT DEFAULT '[\"*\"]'"),
        ("assigned_websites_json", "TEXT DEFAULT '[\"*\"]'")
    ]
    for col_name, col_type in needed_cols:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE admins ADD COLUMN {col_name} {col_type}")

def seed_initial_data(conn):
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@ashifurrahman.com")

    # 1. Admin Account (Super Admin)
    cursor.execute("SELECT COUNT(*) FROM admins")
    if cursor.fetchone()[0] == 0:
        pw_hash, salt = hash_password("admin123")
        cursor.execute("""
        INSERT INTO admins (
            username, email, full_name, role, is_active, failed_login_attempts,
            permissions_json, assigned_websites_json, password_hash, salt, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
        """, ("admin", admin_email, "Super Admin", "super_admin", 1, '["*"]', '["*"]', pw_hash, salt, now_str, now_str))
    else:
        # Upgrade existing primary admin to Super Admin role and ensure email is populated
        cursor.execute("SELECT id, email, role FROM admins WHERE username = 'admin' OR id = 1 LIMIT 1")
        primary_admin = cursor.fetchone()
        if primary_admin:
            current_email = primary_admin['email'] if primary_admin['email'] else admin_email
            cursor.execute("""
            UPDATE admins SET
                role = 'super_admin',
                full_name = COALESCE(full_name, 'Super Admin'),
                email = ?,
                permissions_json = COALESCE(permissions_json, '["*"]'),
                assigned_websites_json = COALESCE(assigned_websites_json, '["*"]'),
                is_active = 1
            WHERE id = ?
            """, (current_email, primary_admin['id']))

    # 2. Hero Section
    cursor.execute("SELECT COUNT(*) FROM hero")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO hero (
            id, name, title, badge_text, introduction, profile_image,
            primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link,
            spec_badge_label, spec_badge_title, updated_at
        ) VALUES (
            1, 
            'ASHIFUR RAHMAN',
            'EEE ENGINEER',
            'Available for Engineering, Technology & AI Opportunities',
            'Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies.',
            '/ashifur.jpeg',
            'Contact Me',
            'mailto:ashifur.badhon@gmail.com',
            'Download CV',
            '/resume.pdf',
            'Specialization',
            'Engineering, Management & AI',
            ?
        )
        """, (now_str,))

    # 3. About Section
    cursor.execute("SELECT COUNT(*) FROM about")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO about (
            id, subtitle, title, description1, description2, profile_image,
            focus1_title, focus1_text, focus2_title, focus2_text, updated_at
        ) VALUES (
            1,
            'About Ashifur',
            'Engineering Precision With Analytical Rigor',
            'Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.',
            'Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.',
            '/ashifur.jpeg',
            'Energy Systems & Digital Innovation',
            'Focus Area',
            'AutoCAD & GIS',
            'Mapping & CAD',
            ?
        )
        """, (now_str,))

    # 4. Highlights
    cursor.execute("SELECT COUNT(*) FROM highlights")
    if cursor.fetchone()[0] == 0:
        default_highlights = [
            ("B.Sc.", "Electrical & Electronic Eng.", "Accredited Engineering Degree", 1),
            ("15+", "CAD & Power Projects", "SLDs, GIS Maps & Simulations", 2),
            ("100%", "Safety & Compliance", "Adhering to IEEE & BNBC standards", 3),
            ("6+", "Core Software Tools", "AutoCAD, ETAP, MATLAB, GIS", 4)
        ]
        cursor.executemany("""
        INSERT INTO highlights (metric_value, metric_label, metric_subtext, sort_order)
        VALUES (?, ?, ?, ?)
        """, default_highlights)

    # 5. Experiences
    cursor.execute("SELECT COUNT(*) FROM experiences")
    if cursor.fetchone()[0] == 0:
        exp1_points = json.dumps([
            "Categorized and pre-processed large datasets for operational use.",
            "Prepared production capacity forecasts to support marketing activities.",
            "Developed work plans based on manpower and time requirements.",
            "Managed workflow from order processing through sales completion.",
            "Coordinated with management and teams to maintain efficient supply chain operations.",
            "Prepared management reports on targets, achievements, and operational performance."
        ])
        exp2_points = json.dumps([
            "Supported operation and maintenance activities at 33/11 kV substations.",
            "Observed and assisted with control room operations.",
            "Conducted field visits and reviewed daily operational reports.",
            "Gained practical exposure to power distribution systems and field operations."
        ])
        default_experiences = [
            (
                "Executive Officer",
                "Ventech Digital — Sales & Management | Remote",
                "January 2023 – January 2025",
                "2023-01", "2025-01", 0, exp1_points, "Remote", "", 1, now_str
            ),
            (
                "Internee Engineer",
                "Dhaka Electric Supply Company Ltd. (DESCO) — Systemic & Commercial Operation Department | Uttara (West), Dhaka",
                "February 2023 – March 2023",
                "2023-02", "2023-03", 0, exp2_points, "Uttara, Dhaka", "https://desco.gov.bd", 2, now_str
            )
        ]
        cursor.executemany("""
        INSERT INTO experiences (
            role, organization, period, start_date, end_date, is_current,
            description_points, location, website, sort_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_experiences)

    # 6. Educations
    cursor.execute("SELECT COUNT(*) FROM educations")
    if cursor.fetchone()[0] == 0:
        default_educations = [
            (
                "Bachelor of Science in Electrical & Electronic Engineering (EEE)",
                "IUBAT – International University of Business Agriculture and Technology",
                "Electrical & Electronic Engineering",
                "2018", "2022", "Graduate", "Graduate",
                "Power System Analysis, High Voltage Engineering, Switchgear & Protection, Control Systems, AutoCAD Electrical.",
                1, now_str
            ),
            (
                "Higher Secondary Certificate (HSC) — Science",
                "General Mahmudul Hasan Adarsha College, Tangail",
                "Science",
                "2015", "2017", "Passed", "Passed",
                "Physics, Chemistry, Higher Mathematics, and Engineering Fundamentals.",
                2, now_str
            ),
            (
                "Secondary School Certificate (SSC) — Science",
                "Bindu Bashini Government Boys' High School, Tangail",
                "Science",
                "2013", "2015", "Passed", "Passed",
                "Foundation studies in Science, General Mathematics, and Physics.",
                3, now_str
            )
        ]
        cursor.executemany("""
        INSERT INTO educations (
            degree, institution, subject, start_year, end_year, result,
            badge_text, description, sort_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_educations)

    # 7. Skills
    cursor.execute("SELECT COUNT(*) FROM skills")
    if cursor.fetchone()[0] == 0:
        default_skills = [
            # Design & Simulation
            ("Design & Simulation", "AutoCAD (Electrical/2D)", 90, "monitor", 1),
            ("Design & Simulation", "MATLAB / Simulink", 85, "monitor", 2),
            ("Design & Simulation", "ETAP (Power System Analysis)", 80, "monitor", 3),
            ("Design & Simulation", "PSNA / PVSyst", 75, "monitor", 4),
            # GIS & Data Systems
            ("GIS & Data Systems", "GIS (ArcGIS / QGIS)", 85, "database", 5),
            ("GIS & Data Systems", "MS Excel (Advanced / Data)", 90, "database", 6),
            ("GIS & Data Systems", "Spatial Network Mapping", 80, "database", 7),
            ("GIS & Data Systems", "Technical Sales Analytics", 85, "database", 8),
            # Power Systems & Field
            ("Power Systems & Field", "Substation Operations & Testing", 88, "shield-check", 9),
            ("Power Systems & Field", "Single Line Diagrams (SLD)", 92, "shield-check", 10),
            ("Power Systems & Field", "Switchgear & Relay Coordination", 82, "shield-check", 11),
            ("Power Systems & Field", "Distribution Network & BOQ", 86, "shield-check", 12),
            # AI Tools & Automation
            ("AI Tools & Automation", "AI Tools & Generative AI", 82, "cpu", 13),
            ("AI Tools & Automation", "Prompt Engineering", 85, "cpu", 14),
            ("AI Tools & Automation", "AI-based Automation & Workflow", 78, "cpu", 15),
            ("AI Tools & Automation", "Data Management & Reporting", 88, "cpu", 16)
        ]
        cursor.executemany("""
        INSERT INTO skills (category, name, level, icon, sort_order)
        VALUES (?, ?, ?, ?, ?)
        """, default_skills)

    # 8. Skill Badges
    cursor.execute("SELECT COUNT(*) FROM skill_badges")
    if cursor.fetchone()[0] == 0:
        badges = [
            ("AutoCAD", 1), ("PSNA", 2), ("GIS", 3), ("MATLAB", 4),
            ("ETAP", 5), ("MS Excel", 6), ("Power Distribution", 7),
            ("Relay Testing", 8), ("Generative AI", 9), ("Prompt Engineering", 10),
            ("AI Automation", 11), ("Data Reporting", 12)
        ]
        cursor.executemany("""
        INSERT INTO skill_badges (name, sort_order) VALUES (?, ?)
        """, badges)

    # 9. Projects
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        default_projects = [
            (
                "01",
                "Design & Development of a Buck Converter for Solar Battery Charging",
                "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
                "Comprehensive hardware and simulation study analyzing switching frequency, inductor and capacitor sizing, and closed-loop regulation for off-grid photovoltaic battery storage.",
                "", json.dumps([]),
                json.dumps(["Power Electronics", "Buck Converter", "Solar Energy"]),
                "Hardware & Simulation", "", "", "2022", 1, 1, 1, now_str
            ),
            (
                "02",
                "132/33kV Grid Substation SLD & Protection Design",
                "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
                "Detailed engineering drafting of outdoor substation switchyard, instrument transformers (CT/PT), lightning arresters, and differential protection scheme layouts.",
                "", json.dumps([]),
                json.dumps(["AutoCAD", "ETAP", "Power Systems"]),
                "Substation Design", "", "", "2023", 1, 1, 2, now_str
            ),
            (
                "03",
                "GIS-Based Power Distribution Asset Mapping",
                "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
                "Integrated spatial geodatabases linking physical electrical assets with electrical loading, phase balancing, and GPS coordinate tracking.",
                "", json.dumps([]),
                json.dumps(["ArcGIS", "QGIS", "Spatial Analysis"]),
                "GIS & Infrastructure", "", "", "2023", 1, 1, 3, now_str
            ),
            (
                "04",
                "Automatic Power Factor Correction (APFC) Simulation",
                "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
                "Simulated automated capacitor bank switching algorithms to eliminate utility low power factor penalty surcharges.",
                "", json.dumps([]),
                json.dumps(["MATLAB", "Simulink", "Industrial Control"]),
                "Power Simulation", "", "", "2022", 0, 1, 4, now_str
            ),
            (
                "05",
                "50kW Rooftop Solar PV Feasibility & Sizing",
                "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
                "Delivered comprehensive energy yield projections, levelized cost of energy (LCOE), and carbon offset calculations for commercial rooftop installations.",
                "", json.dumps([]),
                json.dumps(["PVSyst", "Solar PV", "AutoCAD"]),
                "Renewable Energy", "", "", "2023", 0, 1, 5, now_str
            ),
            (
                "06",
                "Industrial Motor Control & Protective Schematics",
                "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
                "Drafted wiring diagrams and control logic schematics for three-phase induction motor protection and sequence control.",
                "", json.dumps([]),
                json.dumps(["PSNA", "Motor Control", "AutoCAD"]),
                "Industrial Automation", "", "", "2023", 0, 1, 6, now_str
            ),
            (
                "07",
                "Automated Sales & Quotation Management Engine",
                "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
                "Engineered scalable financial and inventory calculation templates reducing technical quotation turnaround time by 60%.",
                "", json.dumps([]),
                json.dumps(["MS Excel", "Data Analytics", "BOQ"]),
                "Analytics & Sales", "", "", "2024", 0, 1, 7, now_str
            )
        ]
        cursor.executemany("""
        INSERT INTO projects (
            project_number, title, short_description, full_description, image_url,
            additional_images_json, tags_json, category, live_url, github_url,
            project_date, is_featured, is_published, sort_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_projects)

    # 10. Services
    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] == 0:
        default_services = [
            (
                "Substation Operations & Maintenance",
                "Proficient in transformer inspection, switchgear testing, single-line diagram (SLD) verification, relay configuration, and electrical load balance monitoring.",
                "zap", 1
            ),
            (
                "AutoCAD Electrical Layouts",
                "Comprehensive experience generating 2D electrical layouts, cable conduit routings, substation civil/electrical layouts, and schematic wiring diagrams.",
                "layout", 2
            ),
            (
                "GIS & Asset Infrastructure Mapping",
                "Spatial infrastructure analysis, power line path planning, electrical distribution pole mapping, and geospatial database maintenance.",
                "map", 3
            ),
            (
                "Technical Sales & Data Analytics",
                "Data categorization, production forecasting, workflow coordination, BOQ preparation, and interactive Excel management dashboards.",
                "trending-up", 4
            )
        ]
        cursor.executemany("""
        INSERT INTO services (title, description, icon, sort_order)
        VALUES (?, ?, ?, ?)
        """, default_services)

    # 11. Social Links
    cursor.execute("SELECT COUNT(*) FROM social_links")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO social_links (
            id, email, phone, whatsapp, linkedin, github, facebook,
            location, maps_url, updated_at
        ) VALUES (
            1,
            'ashifur.badhon@gmail.com',
            '+880 1521 417284',
            '+8801521417284',
            'https://www.linkedin.com/in/ashifurrahmanbadhon',
            'https://github.com/ashifurrahmanbadhon',
            'https://facebook.com',
            'Tangail, Dhaka, Bangladesh',
            'https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh',
            ?
        )
        """, (now_str,))

    # 12. Resumes
    cursor.execute("SELECT COUNT(*) FROM resumes")
    if cursor.fetchone()[0] == 0:
        resume_size = 0
        resume_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resume.pdf")
        if os.path.exists(resume_path):
            resume_size = os.path.getsize(resume_path)
        cursor.execute("""
        INSERT INTO resumes (
            file_name, file_url, file_size, upload_date, is_active
        ) VALUES (?, ?, ?, ?, ?)
        """, ("Ashifur_Rahman_Resume.pdf", "/resume.pdf", resume_size, now_str, 1))

    # 13. Site Settings
    cursor.execute("SELECT COUNT(*) FROM site_settings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO site_settings (
            id, site_title, brand_logo, favicon_url, meta_description,
            og_image_url, footer_brand, footer_copyright, updated_at
        ) VALUES (
            1,
            'Ashifur Rahman | Electrical & Electronic Engineer',
            'ASHIFUR.EEE',
            '/ashifur.jpeg',
            'Portfolio of Ashifur Rahman - Electrical & Electronic Engineer skilled in Substation Operations, AutoCAD, GIS, MATLAB, ETAP, and Power Systems.',
            '/ashifur.jpeg',
            'ASHIFUR RAHMAN • EEE',
            'Designed with precision © {year}. All rights reserved.',
            ?
        )
        """, (now_str,))

    # 14. Central CMS: Default Connected Websites (Portfolio & ToolGhor)
    cursor.execute("SELECT COUNT(*) FROM websites")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO websites (
            id, name, slug, url, cms_url, description, website_type,
            cms_type, status, connection_status, logo, api_key,
            settings_json, created_at, updated_at
        ) VALUES (
            1,
            'Portfolio',
            'portfolio',
            'https://ashifurrahman.netlify.app/',
            '/admin?site=portfolio',
            'Ashifur Rahman official engineering portfolio & interactive showcase.',
            'Personal Portfolio',
            'Built-in Central CMS',
            'active',
            'connected',
            '/profile.jpg',
            'port_live_key_98234',
            '{}',
            ?,
            ?
        )
        """, (now_str, now_str))

        cursor.execute("""
        INSERT INTO websites (
            id, name, slug, url, cms_url, description, website_type,
            cms_type, status, connection_status, logo, api_key,
            settings_json, created_at, updated_at
        ) VALUES (
            2,
            'ToolGhor',
            'toolghor',
            'https://toolghor.netlify.app/',
            '/admin?site=toolghor',
            'Multi-purpose web tools, calculators, engineering utilities & digital tools hub.',
            'Web App / Tools Platform',
            'Built-in Central CMS',
            'active',
            'connected',
            'wrench',
            'tg_live_key_55102',
            '{}',
            ?,
            ?
        )
        """, (now_str, now_str))

    # 15. ToolGhor: Seed Real Categories
    cursor.execute("SELECT COUNT(*) FROM toolghor_categories")
    if cursor.fetchone()[0] == 0:
        categories_data = [
            ("Document Tools", "documents", "PDF merge, split, compress, PDF to DOCX, Word to PDF and document conversion tools", "file-text", 1, now_str),
            ("Image Tools", "images", "Image compress, resize, crop, merge, convert, passport photo, remove background", "image", 2, now_str),
            ("Calculators", "calculators", "Live currency rate, BMI, engineering unit, percentage, age and timezone calculators", "scale", 3, now_str),
            ("QR Code Tools", "qr", "Custom QR code generator and image QR scanner / decoder", "qr-code", 4, now_str),
            ("Video & Audio Tools", "media", "YouTube downloader, audio extractor from video, and social media video cropper", "video", 5, now_str),
            ("Resume Builder", "resume", "Professional resume builder and ATS-friendly CV templates", "briefcase", 6, now_str)
        ]
        cursor.executemany("""
        INSERT INTO toolghor_categories (name, slug, description, icon, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, categories_data)

    # 16. ToolGhor: Seed 27 Real Tools
    cursor.execute("SELECT COUNT(*) FROM toolghor_tools")
    if cursor.fetchone()[0] == 0:
        tools_data = [
            (1, "Document Tools", "Merge PDF", "merge-pdf",
             "Combine multiple PDF documents into a single organized file seamlessly.",
             "High-performance in-browser PDF merger using pdf-lib. No external server upload required.",
             "layers", "https://toolghor.netlify.app/tools/merge-pdf", "Popular", 1, 1, 1, now_str, now_str),
            (1, "Document Tools", "Split PDF", "split-pdf",
             "Extract selected pages or split large PDF files into separate documents.",
             "Select page ranges (e.g. 1-3, 5, 8-10) and export as individual files or a ZIP archive.",
             "split", "https://toolghor.netlify.app/tools/split-pdf", "Essential", 1, 1, 2, now_str, now_str),
            (1, "Document Tools", "Compress PDF", "compress-pdf",
             "Reduce PDF file size without sacrificing readability or image quality.",
             "Optimizes vector paths and embedded raster images to make PDFs email and web ready.",
             "file-down", "https://toolghor.netlify.app/tools/compress-pdf", "Popular", 1, 1, 3, now_str, now_str),
            (1, "Document Tools", "PDF to Image", "pdf-to-image",
             "Convert PDF pages to high-resolution PNG or JPG image files.",
             "Render each page with crisp DPI scaling and download individually or in a ZIP bundle.",
             "file-image", "https://toolghor.netlify.app/tools/pdf-to-image", "Utility", 0, 1, 4, now_str, now_str),
            (1, "Document Tools", "PDF to Word (DOCX)", "pdf-to-doc",
             "Convert PDF documents into fully editable Microsoft Word (.docx) documents.",
             "Preserves font styling, paragraphs, and tables for easy editing in MS Word and Google Docs.",
             "file-text", "https://toolghor.netlify.app/tools/pdf-to-doc", "Hot", 1, 1, 5, now_str, now_str),
            (1, "Document Tools", "Word to PDF", "word-to-pdf",
             "Convert DOC and DOCX Word documents into standardized PDF format.",
             "High-fidelity document rendering maintaining pagination, margins, and formatting.",
             "file-check", "https://toolghor.netlify.app/tools/word-to-pdf", "Popular", 1, 1, 6, now_str, now_str),
            (2, "Image Tools", "JPG to PDF", "jpg-to-pdf",
             "Convert JPG, PNG, and WebP images into a single multi-page PDF document.",
             "Arrange images in custom sequence, choose page orientations, and export instantly.",
             "file-plus", "https://toolghor.netlify.app/tools/jpg-to-pdf", "Popular", 1, 1, 7, now_str, now_str),
            (2, "Image Tools", "Compress Image", "compress-image",
             "Reduce image file size significantly while retaining maximum visual clarity.",
             "Lossy and lossless compression for JPEG, PNG, and WebP images with preview comparison.",
             "image-down", "https://toolghor.netlify.app/tools/compress-image", "Essential", 1, 1, 8, now_str, now_str),
            (2, "Image Tools", "Resize Image", "resize-image",
             "Scale images to exact pixel dimensions, percentage ratios, or specific file sizes.",
             "Custom aspect ratio locking, standard preset resolutions (HD, 4K, social avatars).",
             "maximize-2", "https://toolghor.netlify.app/tools/resize-image", "Utility", 0, 1, 9, now_str, now_str),
            (2, "Image Tools", "Crop Image", "crop-image",
             "Trim and crop unwanted areas from photos with custom or fixed aspect ratios.",
             "Visual canvas cropper supporting 1:1 square, 16:9 banner, 4:3 photo, and freeform crop.",
             "crop", "https://toolghor.netlify.app/tools/crop-image", "Utility", 0, 1, 10, now_str, now_str),
            (2, "Image Tools", "Merge Image", "merge-image",
             "Stitch and combine multiple photos side-by-side or stacked vertically.",
             "Create photo collages, before/after comparisons, and panoramic banner stitches.",
             "layers", "https://toolghor.netlify.app/tools/merge-image", "Creative", 0, 1, 11, now_str, now_str),
            (2, "Image Tools", "Convert Image", "convert-image",
             "Convert images between JPG, PNG, WebP, GIF, and SVG formats instantly.",
             "Batch image format converter running completely in your browser with zero data leakage.",
             "repeat", "https://toolghor.netlify.app/tools/convert-image", "Essential", 1, 1, 12, now_str, now_str),
            (2, "Image Tools", "Passport Size Photo", "passport-photo",
             "Create official passport & visa photos (35x45mm, 300x300px) with custom white/blue background.",
             "Adheres to international visa and Bangladesh government passport photo specifications.",
             "id-card", "https://toolghor.netlify.app/tools/passport-photo", "Popular", 1, 1, 13, now_str, now_str),
            (2, "Image Tools", "Remove Background", "remove-background",
             "Isolate subjects and create transparent PNGs or replace with solid studio backgrounds.",
             "AI-driven and canvas boundary edge detection for instant e-commerce and portrait cutouts.",
             "eraser", "https://toolghor.netlify.app/tools/remove-background", "AI Powered", 1, 1, 14, now_str, now_str),
            (3, "Calculators", "Live Currency Converter", "currency-converter",
             "Real-time currency exchange rates for BDT, USD, EUR, GBP, SAR, AED and 150+ currencies.",
             "Live forex data feed with instant calculations and historical trends.",
             "coins", "https://toolghor.netlify.app/tools/currency-converter", "Live Rates", 1, 1, 15, now_str, now_str),
            (3, "Calculators", "BMI Calculator", "bmi-calculator",
             "Calculate Body Mass Index (BMI), healthy weight ranges, and body category.",
             "Supports metric (cm/kg) and imperial (ft/in/lbs) units with WHO health classifications.",
             "scale", "https://toolghor.netlify.app/tools/bmi-calculator", "Health", 0, 1, 16, now_str, now_str),
            (3, "Calculators", "Unit Converter", "unit-converter",
             "Universal metric and imperial converter for length, weight, area, volume, temperature, and speed.",
             "Multi-category conversion matrix with high scientific precision for engineering tasks.",
             "ruler", "https://toolghor.netlify.app/tools/unit-converter", "Utility", 1, 1, 17, now_str, now_str),
            (3, "Calculators", "Percentage Calculator", "percentage-calculator",
             "Quick percentage calculations: percentage of, percentage change, increase/decrease, and discount.",
             "Instant answers for business discounts, academic marks, exam scores, and financial margins.",
             "percent", "https://toolghor.netlify.app/tools/percentage-calculator", "Math", 0, 1, 18, now_str, now_str),
            (3, "Calculators", "Age Calculator", "age-calculator",
             "Calculate exact age in years, months, days, hours, and find upcoming birthday countdowns.",
             "Provides total days lived, day of week born, and age milestones calculation.",
             "calendar", "https://toolghor.netlify.app/tools/age-calculator", "Utility", 0, 1, 19, now_str, now_str),
            (3, "Calculators", "Time Zone Converter", "time-zone-converter",
             "Compare and schedule across global time zones (BST, UTC, EST, PST, GMT, IST, etc.).",
             "Visual time comparison slider for scheduling international meetings and developer syncs.",
             "clock", "https://toolghor.netlify.app/tools/time-zone-converter", "Productivity", 0, 1, 20, now_str, now_str),
            (4, "QR Code Tools", "QR Code Generator", "qr-generator",
             "Generate customizable QR codes for URLs, WiFi networks, vCards, text, and WhatsApp.",
             "Custom color schemes, corner radiuses, and high-res SVG/PNG download support.",
             "qr-code", "https://toolghor.netlify.app/tools/qr-generator", "Popular", 1, 1, 21, now_str, now_str),
            (4, "QR Code Tools", "QR Code Decoder", "qr-decoder",
             "Scan and decode QR codes from image files, screenshots, or device camera feed.",
             "Zero external API calls. Decodes URLs, contact info, and text directly on client canvas.",
             "scan", "https://toolghor.netlify.app/tools/qr-decoder", "Utility", 0, 1, 22, now_str, now_str),
            (5, "Video & Audio Tools", "YouTube Downloader", "youtube-downloader",
             "Download YouTube videos and audio in MP4, WebM, and MP3 formats.",
             "Fast media extractor supporting various video qualities and audio extraction.",
             "download", "https://toolghor.netlify.app/tools/youtube-downloader", "Popular", 1, 1, 23, now_str, now_str),
            (5, "Video & Audio Tools", "Audio Extractor", "audio-extractor",
             "Extract crystal clear MP3, WAV, or AAC audio tracks from video files.",
             "In-browser Web Audio API extraction supporting MP4, MOV, WebM, and AVI formats.",
             "music", "https://toolghor.netlify.app/tools/audio-extractor", "Media", 1, 1, 24, now_str, now_str),
            (5, "Video & Audio Tools", "Social Media Video Cropper", "social-video-cropper",
             "Crop and resize videos for Instagram Reels (9:16), TikTok, YouTube Shorts, and feeds (1:1).",
             "Interactive video frame positioning, canvas playback, and social-ready exporting.",
             "video", "https://toolghor.netlify.app/tools/social-video-cropper", "Creator", 0, 1, 25, now_str, now_str),
            (6, "Resume Builder", "Professional Resume", "resume-builder",
             "Build modern, ATS-friendly resumes and CVs with real-time PDF generation.",
             "Clean typography, customizable sections, skills tags, and instant download.",
             "file-badge", "https://toolghor.netlify.app/tools/resume-builder", "Career", 1, 1, 26, now_str, now_str),
            (6, "Resume Builder", "CV Templates", "cv-templates",
             "Curated gallery of downloadable modern CV and resume templates for engineers & developers.",
             "Ready-to-use template designs optimized for corporate recruitment and tech job applications.",
             "layout-template", "https://toolghor.netlify.app/tools/cv-templates", "Templates", 1, 1, 27, now_str, now_str)
        ]
        cursor.executemany("""
        INSERT INTO toolghor_tools (
            category_id, category_name, name, slug, short_description, full_description,
            icon, url, badge, is_featured, is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, tools_data)

    # 17. ToolGhor: Settings
    cursor.execute("SELECT COUNT(*) FROM toolghor_settings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO toolghor_settings (
            id, site_title, tagline, hero_headline, hero_subheadline,
            announcement_banner, footer_text, updated_at
        ) VALUES (
            1,
            'ToolGhor - All-in-One Web Tools & Utilities Platform',
            'Everyday tools, now on one platform • দৈনন্দিন কাজের সব টুলস, এখন এক প্ল্যাটফর্মে',
            'All Your Essential Web Tools in One Place',
            'Free, fast & secure online tools for documents, images, calculators, QR codes, video/audio & resume building. 100% private in-browser processing.',
            '⚡ ToolGhor Live: 27+ powerful tools for PDF, image, calculators, QR & media processing!',
            'ToolGhor © {year} • Engineered with precision by Ashifur Rahman. All rights reserved.',
            ?
        )
        """, (now_str,))

    # 18. Central CMS: Activity Logs
    cursor.execute("SELECT COUNT(*) FROM activity_logs")
    if cursor.fetchone()[0] == 0:
        initial_logs = [
            (1, "Portfolio", "Website Connected", "Portfolio connected to Central CMS panel successfully.", "admin", now_str),
            (2, "ToolGhor", "Website Connected", "ToolGhor initialized as central multi-tools web application.", "admin", now_str),
            (None, "Central CMS", "System Initialized", "Central CMS unified multi-website architecture enabled.", "admin", now_str)
        ]
        cursor.executemany("""
        INSERT INTO activity_logs (website_id, website_name, action, details, user, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, initial_logs)

    # 19. Central CMS: System Settings (Role & Security Governed)
    cursor.execute("SELECT COUNT(*) FROM central_system_settings")
    if cursor.fetchone()[0] == 0:
        default_settings = [
            ("general", json.dumps({
                "platform_name": "Central CMS",
                "admin_name": "Ashifur Rahman",
                "timezone": "Asia/Dhaka (GMT+6)",
                "contact_email": admin_email,
                "tagline": "One Login. Every Website."
            }), now_str),
            ("cms", json.dumps({
                "realtime_sync": True,
                "cache_ttl": 60,
                "max_upload_size_mb": 15,
                "revisions_keep": 30,
                "auto_publish": True
            }), now_str),
            ("website", json.dumps({
                "default_cors": "*",
                "allow_registration": True,
                "health_check_interval_mins": 5,
                "default_type": "Web Application"
            }), now_str),
            ("email", json.dumps({
                "smtp_host": "smtp.gmail.com",
                "smtp_port": 587,
                "sender_email": admin_email,
                "auth_required": True,
                "lockout_alerts": True
            }), now_str),
            ("security", json.dumps({
                "session_timeout_hours": 24,
                "remember_me_days": 30,
                "lockout_threshold": 5,
                "lockout_duration_mins": 15,
                "rate_limit_rpm": 60,
                "two_factor_ready": True
            }), now_str),
            ("api", json.dumps({
                "master_api_key": "ccms_live_8f3a9e0b2c1d4e5f6a7b8c9d0e",
                "cors_origins": "*",
                "webhook_url": "",
                "api_logging": True
            }), now_str)
        ]
        cursor.executemany("""
        INSERT INTO central_system_settings (category, settings_json, updated_at)
        VALUES (?, ?, ?)
        """, default_settings)

    conn.commit()

def log_activity(conn, action: str, website_id: int = None, website_name: str = None, details: str = "", user: str = "admin"):
    """Record an action in the Central CMS activity logs table using an existing connection."""
    try:
        cursor = conn.cursor()
        now_str = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO activity_logs (website_id, website_name, action, details, user, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (website_id, website_name, action, details, user, now_str))
        conn.commit()
    except Exception as e:
        print(f"Warning: Failed to log activity: {e}")

def add_activity_log(action: str, website_id: int = None, website_name: str = None, details: str = "", user: str = "admin"):
    """Record an action in the Central CMS activity logs table with a fresh connection."""
    try:
        conn = get_db_connection()
        log_activity(conn, action, website_id, website_name, details, user)
        conn.close()
    except Exception as e:
        print(f"Warning: Failed to log activity: {e}")

# ========================================================
# Central Authentication, Lockout & Password Reset Helpers
# ========================================================

def get_admin_by_identifier(conn, identifier: str):
    """Fetch admin by either username or email (case-insensitive)."""
    if not identifier:
        return None
    cursor = conn.cursor()
    clean_id = identifier.strip().lower()
    cursor.execute("""
    SELECT * FROM admins 
    WHERE (LOWER(username) = ? OR LOWER(email) = ?)
    LIMIT 1
    """, (clean_id, clean_id))
    return cursor.fetchone()

def check_admin_lockout(admin, max_attempts: int = 5):
    """
    Check if an admin account is currently locked due to failed login attempts.
    Returns (is_locked: bool, message: str)
    """
    if not admin:
        return False, ""
    
    if not admin['is_active']:
        return True, "This administrative account is disabled. Please contact the Super Admin."
        
    locked_until_str = admin['locked_until']
    if locked_until_str:
        try:
            locked_until = datetime.fromisoformat(locked_until_str)
            now = datetime.now()
            if now < locked_until:
                remaining_secs = int((locked_until - now).total_seconds())
                remaining_mins = max(1, (remaining_secs + 59) // 60)
                return True, f"Account temporarily locked due to multiple failed login attempts. Try again in {remaining_mins} minute(s)."
        except Exception:
            pass
            
    return False, ""

def record_failed_login(conn, admin_id: int, max_attempts: int = 5, lockout_minutes: int = 15):
    """Increment failed login attempts and lock account if limit reached."""
    cursor = conn.cursor()
    cursor.execute("SELECT failed_login_attempts FROM admins WHERE id = ?", (admin_id,))
    row = cursor.fetchone()
    current_attempts = (row['failed_login_attempts'] if row else 0) + 1
    
    now = datetime.now()
    locked_until = None
    is_now_locked = False
    
    if current_attempts >= max_attempts:
        from datetime import timedelta
        locked_until = (now + timedelta(minutes=lockout_minutes)).isoformat()
        is_now_locked = True
        
    cursor.execute("""
    UPDATE admins 
    SET failed_login_attempts = ?, locked_until = ?, updated_at = ?
    WHERE id = ?
    """, (current_attempts, locked_until, now.isoformat(), admin_id))
    conn.commit()
    return is_now_locked, current_attempts

def record_successful_login(conn, admin_id: int):
    """Reset failed attempts and update last login timestamp."""
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    cursor.execute("""
    UPDATE admins 
    SET failed_login_attempts = 0, locked_until = NULL, last_login_at = ?, updated_at = ?
    WHERE id = ?
    """, (now_str, now_str, admin_id))
    conn.commit()

def create_password_reset(conn, admin_id: int, identifier: str, token: str, expiry_hours: int = 1):
    """Store a SHA-256 hashed password reset token with expiration."""
    cursor = conn.cursor()
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
    from datetime import timedelta
    now = datetime.now()
    expires_at = (now + timedelta(hours=expiry_hours)).isoformat()
    now_str = now.isoformat()
    
    # Invalidate older pending tokens for this admin
    cursor.execute("UPDATE password_resets SET used = 1 WHERE admin_id = ? AND used = 0", (admin_id,))
    
    cursor.execute("""
    INSERT INTO password_resets (admin_id, identifier, token_hash, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
    """, (admin_id, identifier, token_hash, expires_at, now_str))
    conn.commit()
    return expires_at

def verify_password_reset_token(conn, token: str):
    """Validate a reset token and return (reset_record, admin) if valid and not expired."""
    if not token or len(token) < 10:
        return None, None
    cursor = conn.cursor()
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
    SELECT * FROM password_resets 
    WHERE token_hash = ? AND used = 0 AND expires_at > ?
    ORDER BY id DESC LIMIT 1
    """, (token_hash, now_str))
    reset_rec = cursor.fetchone()
    
    if not reset_rec:
        return None, None
        
    cursor.execute("SELECT * FROM admins WHERE id = ? AND is_active = 1", (reset_rec['admin_id'],))
    admin = cursor.fetchone()
    return reset_rec, admin

def complete_password_reset(conn, token: str, new_password: str):
    """Reset the admin's password and mark token as used."""
    reset_rec, admin = verify_password_reset_token(conn, token)
    if not reset_rec or not admin:
        return False, "Invalid or expired password reset token."
        
    new_hash, new_salt = hash_password(new_password)
    now_str = datetime.now().isoformat()
    cursor = conn.cursor()
    
    cursor.execute("""
    UPDATE admins 
    SET password_hash = ?, salt = ?, failed_login_attempts = 0, locked_until = NULL, updated_at = ?
    WHERE id = ?
    """, (new_hash, new_salt, now_str, admin['id']))
    
    cursor.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (reset_rec['id'],))
    conn.commit()
    return True, admin['username']

# ========================================================
# Two-Factor Authentication (2FA) Security Helpers
# ========================================================

def mask_phone(phone: str = None) -> str:
    """Mask phone number safely (e.g. 01521417284 -> ******7284)."""
    clean = (phone or "01521417284").strip()
    if len(clean) >= 4:
        return f"******{clean[-4:]}"
    return "******7284"

def get_admin_2fa_info(conn, admin_id: int):
    """Retrieve 2FA status, secrets, phone and recovery metrics for an admin."""
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, username, email, phone, two_factor_enabled, totp_secret, 
           failed_2fa_attempts, locked_2fa_until
    FROM admins WHERE id = ?
    """, (admin_id,))
    admin = cursor.fetchone()
    if not admin:
        return None
        
    cursor.execute("SELECT COUNT(*) FROM admin_recovery_codes WHERE admin_id = ? AND used = 0", (admin_id,))
    recovery_count = cursor.fetchone()[0]
    
    phone = admin['phone'] or "01521417284"
    return {
        "id": admin['id'],
        "username": admin['username'],
        "email": admin['email'],
        "phone": phone,
        "masked_phone": mask_phone(phone),
        "two_factor_enabled": bool(admin['two_factor_enabled']),
        "totp_secret": admin['totp_secret'],
        "recovery_codes_remaining": recovery_count,
        "failed_2fa_attempts": admin['failed_2fa_attempts'] or 0,
        "locked_2fa_until": admin['locked_2fa_until']
    }

def check_admin_2fa_lockout(admin_id: int, conn) -> (bool, str):
    """Check if admin is temporarily locked out from 2FA attempts."""
    cursor = conn.cursor()
    cursor.execute("SELECT locked_2fa_until FROM admins WHERE id = ?", (admin_id,))
    row = cursor.fetchone()
    if not row or not row['locked_2fa_until']:
        return False, ""
    try:
        locked_until = datetime.fromisoformat(row['locked_2fa_until'])
        now = datetime.now()
        if now < locked_until:
            remaining_secs = int((locked_until - now).total_seconds())
            remaining_mins = max(1, (remaining_secs + 59) // 60)
            return True, f"Too many failed 2FA verification attempts. Locked for {remaining_mins} minute(s)."
    except Exception:
        pass
    return False, ""

def record_failed_2fa_attempt(conn, admin_id: int, max_attempts: int = 5, lockout_minutes: int = 15):
    """Increment failed 2FA attempts and lock if limit is reached."""
    cursor = conn.cursor()
    cursor.execute("SELECT failed_2fa_attempts FROM admins WHERE id = ?", (admin_id,))
    row = cursor.fetchone()
    current_attempts = (row['failed_2fa_attempts'] if row else 0) + 1
    
    now = datetime.now()
    locked_until = None
    is_now_locked = False
    
    if current_attempts >= max_attempts:
        from datetime import timedelta
        locked_until = (now + timedelta(minutes=lockout_minutes)).isoformat()
        is_now_locked = True
        
    cursor.execute("""
    UPDATE admins 
    SET failed_2fa_attempts = ?, locked_2fa_until = ?, updated_at = ?
    WHERE id = ?
    """, (current_attempts, locked_until, now.isoformat(), admin_id))
    conn.commit()
    return is_now_locked, current_attempts

def record_successful_2fa(conn, admin_id: int):
    """Reset failed 2FA attempts and clear lockout upon valid verification."""
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE admins 
    SET failed_2fa_attempts = 0, locked_2fa_until = NULL, updated_at = ?
    WHERE id = ?
    """, (datetime.now().isoformat(), admin_id))
    conn.commit()

def store_recovery_codes(conn, admin_id: int, plain_codes: list):
    """Store SHA-256 hashed single-use recovery codes, invalidating any previous ones."""
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    # Invalidate previous unused codes
    cursor.execute("DELETE FROM admin_recovery_codes WHERE admin_id = ?", (admin_id,))
    
    for code in plain_codes:
        clean_code = code.strip().replace("-", "").lower()
        code_hash = hashlib.sha256(clean_code.encode('utf-8')).hexdigest()
        cursor.execute("""
        INSERT INTO admin_recovery_codes (admin_id, code_hash, used, created_at)
        VALUES (?, ?, 0, ?)
        """, (admin_id, code_hash, now_str))
    conn.commit()

def regenerate_recovery_codes(conn, admin_id: int, plain_codes: list):
    """Regenerate recovery codes by purging old ones and saving new set."""
    return store_recovery_codes(conn, admin_id, plain_codes)

def verify_and_consume_recovery_code(conn, admin_id: int, code: str) -> bool:
    """Verify an 8-character recovery code, burn it immediately on success (one-time use)."""
    if not code:
        return False
    clean_code = code.strip().replace("-", "").lower()
    code_hash = hashlib.sha256(clean_code.encode('utf-8')).hexdigest()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id FROM admin_recovery_codes 
    WHERE admin_id = ? AND code_hash = ? AND used = 0
    LIMIT 1
    """, (admin_id, code_hash))
    rec = cursor.fetchone()
    
    if not rec:
        return False
        
    now_str = datetime.now().isoformat()
    cursor.execute("""
    UPDATE admin_recovery_codes 
    SET used = 1, used_at = ? 
    WHERE id = ?
    """, (now_str, rec['id']))
    conn.commit()
    return True

def get_remaining_recovery_codes_count(conn, admin_id: int) -> int:
    """Count of remaining unused recovery codes."""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM admin_recovery_codes WHERE admin_id = ? AND used = 0", (admin_id,))
    return cursor.fetchone()[0]

def enable_admin_2fa(conn, admin_id: int, totp_secret: str, plain_recovery_codes: list):
    """Activate 2FA for an admin, store secret and recovery codes."""
    now_str = datetime.now().isoformat()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE admins 
    SET two_factor_enabled = 1, totp_secret = ?, totp_created_at = ?,
        failed_2fa_attempts = 0, locked_2fa_until = NULL, updated_at = ?
    WHERE id = ?
    """, (totp_secret, now_str, now_str, admin_id))
    conn.commit()
    store_recovery_codes(conn, admin_id, plain_recovery_codes)

def disable_admin_2fa(conn, admin_id: int):
    """Disable 2FA, purge TOTP secret, recovery codes, and pending OTPs."""
    now_str = datetime.now().isoformat()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE admins 
    SET two_factor_enabled = 0, totp_secret = NULL, totp_created_at = NULL,
        failed_2fa_attempts = 0, locked_2fa_until = NULL, updated_at = ?
    WHERE id = ?
    """, (now_str, admin_id))
    cursor.execute("DELETE FROM admin_recovery_codes WHERE admin_id = ?", (admin_id,))
    cursor.execute("DELETE FROM admin_sms_otps WHERE admin_id = ?", (admin_id,))
    conn.commit()

def check_sms_rate_limit(conn, admin_id: int, cooldown_seconds: int = 60) -> (bool, int):
    """Check if an SMS was sent recently (rate limit 1 per 60 seconds)."""
    cursor = conn.cursor()
    cursor.execute("""
    SELECT created_at FROM admin_sms_otps 
    WHERE admin_id = ? 
    ORDER BY id DESC LIMIT 1
    """, (admin_id,))
    row = cursor.fetchone()
    if not row:
        return False, 0
    try:
        last_sent = datetime.fromisoformat(row['created_at'])
        diff = (datetime.now() - last_sent).total_seconds()
        if diff < cooldown_seconds:
            remaining = int(cooldown_seconds - diff)
            return True, remaining
    except Exception:
        pass
    return False, 0

def store_sms_otp(conn, admin_id: int, challenge_token: str, otp_code: str, phone: str, expiry_minutes: int = 5):
    """Store hashed 6-digit SMS OTP, invalidating previous active OTPs for this admin."""
    cursor = conn.cursor()
    # Invalidate previous unused OTPs
    cursor.execute("UPDATE admin_sms_otps SET used = 1 WHERE admin_id = ? AND used = 0", (admin_id,))
    
    from datetime import timedelta
    now = datetime.now()
    expires_at = (now + timedelta(minutes=expiry_minutes)).isoformat()
    now_str = now.isoformat()
    
    challenge_token_hash = hashlib.sha256(challenge_token.encode('utf-8')).hexdigest()
    otp_hash = hashlib.sha256(otp_code.strip().encode('utf-8')).hexdigest()
    
    cursor.execute("""
    INSERT INTO admin_sms_otps (
        admin_id, challenge_token_hash, otp_hash, phone, attempts, max_attempts, expires_at, used, created_at
    ) VALUES (?, ?, ?, ?, 0, 3, ?, 0, ?)
    """, (admin_id, challenge_token_hash, otp_hash, phone, expires_at, now_str))
    conn.commit()
    return expires_at

def verify_and_consume_sms_otp(conn, admin_id: int, challenge_token: str, otp_code: str) -> (bool, str):
    """Verify and consume a 6-digit SMS OTP with attempt tracking and expiration checks."""
    if not otp_code or len(otp_code.strip()) != 6:
        return False, "Invalid 6-digit verification code format."
        
    challenge_token_hash = hashlib.sha256(challenge_token.encode('utf-8')).hexdigest()
    otp_hash = hashlib.sha256(otp_code.strip().encode('utf-8')).hexdigest()
    now_str = datetime.now().isoformat()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM admin_sms_otps 
    WHERE admin_id = ? AND challenge_token_hash = ? AND used = 0
    ORDER BY id DESC LIMIT 1
    """, (admin_id, challenge_token_hash))
    otp_rec = cursor.fetchone()
    
    if not otp_rec:
        return False, "No active OTP request found. Please request a new code."
        
    # Check expiration
    if otp_rec['expires_at'] < now_str:
        cursor.execute("UPDATE admin_sms_otps SET used = 1 WHERE id = ?", (otp_rec['id'],))
        conn.commit()
        return False, "The verification code has expired. Please request a new one."
        
    # Check attempts
    if otp_rec['attempts'] >= otp_rec['max_attempts']:
        cursor.execute("UPDATE admin_sms_otps SET used = 1 WHERE id = ?", (otp_rec['id'],))
        conn.commit()
        return False, "Too many failed attempts on this OTP. Please request a new one."
        
    # Check code match
    if otp_rec['otp_hash'] != otp_hash:
        new_attempts = otp_rec['attempts'] + 1
        cursor.execute("UPDATE admin_sms_otps SET attempts = ? WHERE id = ?", (new_attempts, otp_rec['id']))
        conn.commit()
        remaining = otp_rec['max_attempts'] - new_attempts
        if remaining <= 0:
            cursor.execute("UPDATE admin_sms_otps SET used = 1 WHERE id = ?", (otp_rec['id'],))
            conn.commit()
            return False, "Invalid verification code. Maximum attempts exceeded."
        return False, f"Invalid verification code. ({remaining} attempt(s) remaining)"
        
    # Valid: burn the OTP
    cursor.execute("UPDATE admin_sms_otps SET used = 1 WHERE id = ?", (otp_rec['id'],))
    conn.commit()
    return True, "Verified successfully"

if __name__ == "__main__":
    init_db()
    print("Database initialized, schema migrated and seeded successfully.")
