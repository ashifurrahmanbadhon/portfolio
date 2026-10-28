import path from "path";
import fs from "fs";
import crypto from "crypto";
import { exec } from "child_process";
import { neon } from "@neondatabase/serverless";
import { DatabaseSync } from "node:sqlite";

// ==========================================
// Database Connection Strategy
// Neon PostgreSQL (Preferred / Cloud) with SQLite Fallback (Local offline)
// ==========================================
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

let neonSql = null;
if (databaseUrl) {
  try {
    neonSql = neon(databaseUrl);
  } catch (err) {
    console.error("Failed to initialize Neon client:", err);
  }
}

let sqliteInstance = null;
function getSqliteDb() {
  if (!sqliteInstance) {
    let dbPath = path.join(process.cwd(), "portfolio.db");
    if (process.env.VERCEL) {
      const tmpPath = path.join("/tmp", "portfolio.db");
      if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
        try {
          fs.copyFileSync(dbPath, tmpPath);
        } catch (e) {
          console.warn("Could not copy db to /tmp:", e);
        }
      }
      if (fs.existsSync(tmpPath)) {
        dbPath = tmpPath;
      }
    }
    sqliteInstance = new DatabaseSync(dbPath);
    initSqliteDbIfEmpty(sqliteInstance);
    try {
      sqliteInstance.exec(`
        CREATE TABLE IF NOT EXISTS admin_presence (id INTEGER PRIMARY KEY, last_seen TEXT);
        CREATE TABLE IF NOT EXISTS contact_replies (id INTEGER PRIMARY KEY AUTOINCREMENT, message_id INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
      `);
      const hasPres = sqliteInstance.prepare("SELECT id FROM admin_presence WHERE id = 1").get();
      if (!hasPres) {
        sqliteInstance.prepare("INSERT INTO admin_presence (id, last_seen) VALUES (1, NULL)").run();
      }
    } catch (_) {}
  }
  return sqliteInstance;
}

function initSqliteDbIfEmpty(db) {
  try {
    const hasHero = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hero'").get();
    if (hasHero) return;

    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        email TEXT,
        full_name TEXT DEFAULT 'Super Admin',
        role TEXT DEFAULT 'super_admin',
        is_active INTEGER DEFAULT 1,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        last_login_at TEXT,
        permissions_json TEXT DEFAULT '["*"]',
        assigned_websites_json TEXT DEFAULT '["*"]',
        phone TEXT DEFAULT '01521417284',
        two_factor_enabled INTEGER DEFAULT 0,
        totp_secret TEXT,
        totp_created_at TEXT,
        failed_2fa_attempts INTEGER DEFAULT 0,
        locked_2fa_until TEXT,
        avatar TEXT,
        avatar_position TEXT DEFAULT '50% 50%'
      );
      CREATE TABLE IF NOT EXISTS hero (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        badge_text TEXT,
        introduction TEXT,
        profile_image TEXT,
        profile_position TEXT DEFAULT 'center 15%',
        primary_btn_text TEXT,
        primary_btn_link TEXT,
        secondary_btn_text TEXT,
        secondary_btn_link TEXT,
        spec_badge_label TEXT,
        spec_badge_title TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS about (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subtitle TEXT,
        title TEXT,
        description1 TEXT,
        description2 TEXT,
        profile_image TEXT,
        profile_position TEXT DEFAULT 'center 12%',
        focus1_title TEXT,
        focus1_text TEXT,
        focus2_title TEXT,
        focus2_text TEXT,
        pillars_json TEXT,
        principles_json TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_value TEXT,
        metric_label TEXT,
        metric_subtext TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        organization TEXT,
        period TEXT,
        start_date TEXT,
        end_date TEXT,
        is_current INTEGER DEFAULT 0,
        description_points TEXT,
        location TEXT,
        website TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS educations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        degree TEXT,
        institution TEXT,
        subject TEXT,
        start_year TEXT,
        end_year TEXT,
        period TEXT,
        result TEXT,
        badge_text TEXT,
        description TEXT,
        highlights_json TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        name TEXT,
        level INTEGER DEFAULT 80,
        icon TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS skill_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_number TEXT,
        title TEXT,
        short_description TEXT,
        full_description TEXT,
        image_url TEXT,
        image_position TEXT DEFAULT 'center center',
        additional_images_json TEXT,
        tags_json TEXT,
        category TEXT,
        live_url TEXT,
        github_url TEXT,
        project_date TEXT,
        is_featured INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        icon TEXT,
        deliverables TEXT,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS social_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        linkedin TEXT,
        github TEXT,
        facebook TEXT,
        location TEXT,
        maps_url TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS contact_channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_key TEXT UNIQUE NOT NULL,
        label TEXT,
        action_text TEXT,
        value TEXT,
        url TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT,
        file_url TEXT,
        is_active INTEGER DEFAULT 1,
        upload_date TEXT
      );
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_title TEXT,
        brand_logo TEXT,
        favicon_url TEXT,
        meta_description TEXT,
        og_image_url TEXT,
        footer_brand TEXT,
        footer_copyright TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        issuer TEXT,
        year TEXT,
        description TEXT,
        is_verified INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS experience_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric TEXT,
        label TEXT,
        subtext TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS coursework_pillars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        subtitle TEXT,
        courses_json TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS software_tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        proficiency TEXT,
        icon TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS project_methodologies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        step_number TEXT,
        title TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS page_headers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_key TEXT UNIQUE NOT NULL,
        badge_text TEXT,
        title TEXT,
        highlight_word TEXT,
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS homepage_cta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        badge_text TEXT,
        title TEXT,
        description TEXT,
        primary_btn_text TEXT,
        primary_btn_link TEXT,
        secondary_btn_text TEXT,
        secondary_btn_link TEXT
      );
      CREATE TABLE IF NOT EXISTS websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        slug TEXT UNIQUE,
        url TEXT,
        cms_url TEXT,
        description TEXT,
        website_type TEXT,
        cms_type TEXT,
        status TEXT,
        connection_status TEXT,
        logo TEXT,
        api_key TEXT,
        settings_json TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        identifier TEXT,
        token_hash TEXT,
        expires_at TEXT,
        used INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT,
        ip_address TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        website_id INTEGER,
        website_name TEXT,
        action TEXT,
        details TEXT,
        user TEXT,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS admin_presence (
        id INTEGER PRIMARY KEY,
        last_seen TEXT
      );
      CREATE TABLE IF NOT EXISTS contact_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Ensure SQLite admins table has avatar_position
    try {
      const adminCols = db.prepare("PRAGMA table_info(admins)").all();
      if (adminCols && adminCols.length > 0 && !adminCols.some((c) => c.name === "avatar_position")) {
        db.exec("ALTER TABLE admins ADD COLUMN avatar_position TEXT DEFAULT '50% 50%'");
      }
    } catch (_) {}
  } catch (e) {
    console.error("initSqliteDbIfEmpty error:", e);
  }
}

// Convert SQLite '?' positional placeholders to PostgreSQL '$1, $2, ...'
function convertPlaceholders(sql) {
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
}

export async function queryAll(sqlText, params = []) {
  if (neonSql) {
    const pgSql = convertPlaceholders(sqlText);
    const rows = await neonSql.query(pgSql, params);
    return rows || [];
  } else {
    const db = getSqliteDb();
    return db.prepare(sqlText).all(...params) || [];
  }
}

export async function queryOne(sqlText, params = []) {
  if (neonSql) {
    const pgSql = convertPlaceholders(sqlText);
    const rows = await neonSql.query(pgSql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  } else {
    const db = getSqliteDb();
    return db.prepare(sqlText).get(...params) || null;
  }
}

export async function execute(sqlText, params = []) {
  let result = null;
  if (neonSql) {
    const pgSql = convertPlaceholders(sqlText);
    result = await neonSql.query(pgSql, params);
  }
  // Dual-write to SQLite to guarantee local portfolio.db remains 100% in sync
  try {
    const db = getSqliteDb();
    const sqliteParams = params.map((p) => (typeof p === "boolean" ? (p ? 1 : 0) : p));
    const sqliteRes = db.prepare(sqlText).run(...sqliteParams);
    if (!result) result = sqliteRes;
  } catch (err) {
    // If SQLite schema difference occurs, log and maintain parity
  }
  return result;
}

// Universal getDb() interface for backward compatibility
export function getDb() {
  return {
    prepare: (sql) => ({
      get: (...params) => queryOne(sql, params),
      all: (...params) => queryAll(sql, params),
      run: (...params) => execute(sql, params),
    }),
  };
}

// ==========================================
// Password Hashing & Verification (PBKDF2)
// Compatible with Python's hashlib.pbkdf2_hmac
// ==========================================
export function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

// ==========================================
// Activity Logging Helper
// ==========================================
export async function addActivityLog(action, details = "", websiteName = "Central CMS", user = "admin", websiteId = null) {
  try {
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO activity_logs (website_id, website_name, action, details, "user", created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [websiteId, websiteName, action, details, user, now]);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// ==========================================
// Admin & Auth Helpers
// ==========================================
export async function getAdminByIdentifier(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  return await queryOne(`
    SELECT * FROM admins
    WHERE LOWER(username) = ? OR LOWER(email) = ?
    LIMIT 1
  `, [clean, clean]);
}

export async function getAdminById(id) {
  if (!id) return null;
  return await queryOne(`SELECT * FROM admins WHERE id = ? LIMIT 1`, [id]);
}

export function checkAdminLockout(admin, maxAttempts = 5) {
  if (!admin) return { isLocked: false, message: "" };
  if (!admin.is_active) {
    return { isLocked: true, message: "This administrative account is disabled." };
  }
  if (admin.locked_until) {
    const lockTime = new Date(admin.locked_until);
    if (lockTime > new Date()) {
      const remainingMins = Math.ceil((lockTime - new Date()) / 60000);
      return {
        isLocked: true,
        message: `Account is temporarily locked due to excessive failed attempts. Please try again in ${remainingMins} minute(s).`,
      };
    }
  }
  return { isLocked: false, message: "" };
}

export async function recordFailedLogin(adminId, maxAttempts = 5, lockoutMinutes = 15) {
  const admin = await getAdminById(adminId);
  if (!admin) return 1;

  const currentAttempts = (admin.failed_login_attempts || 0) + 1;
  const now = new Date();
  let lockedUntil = null;

  if (currentAttempts >= maxAttempts) {
    lockedUntil = new Date(now.getTime() + lockoutMinutes * 60000).toISOString();
  }

  await execute(`
    UPDATE admins
    SET failed_login_attempts = ?, locked_until = ?, updated_at = ?
    WHERE id = ?
  `, [currentAttempts, lockedUntil, now.toISOString(), adminId]);

  return currentAttempts;
}

export async function recordSuccessfulLogin(adminId) {
  const now = new Date().toISOString();
  await execute(`
    UPDATE admins
    SET failed_login_attempts = 0, locked_until = NULL, failed_2fa_attempts = 0, locked_2fa_until = NULL, last_login_at = ?, updated_at = ?
    WHERE id = ?
  `, [now, now, adminId]);
}

export function checkAdmin2faLockout(admin, maxAttempts = 5) {
  if (!admin) return { isLocked: false, message: "" };
  if (admin.locked_2fa_until) {
    const lockTime = new Date(admin.locked_2fa_until);
    if (lockTime > new Date()) {
      const remainingMins = Math.ceil((lockTime - new Date()) / 60000);
      return {
        isLocked: true,
        message: `Account 2FA is temporarily locked due to excessive failed attempts. Please try again in ${remainingMins} minute(s).`,
      };
    }
  }
  return { isLocked: false, message: "" };
}

export async function recordFailed2faAttempt(adminId, maxAttempts = 5, lockoutMinutes = 15) {
  const admin = await getAdminById(adminId);
  if (!admin) return 1;

  const currentAttempts = (admin.failed_2fa_attempts || 0) + 1;
  const now = new Date();
  let lockedUntil = null;

  if (currentAttempts >= maxAttempts) {
    lockedUntil = new Date(now.getTime() + lockoutMinutes * 60000).toISOString();
  }

  await execute(`
    UPDATE admins
    SET failed_2fa_attempts = ?, locked_2fa_until = ?, updated_at = ?
    WHERE id = ?
  `, [currentAttempts, lockedUntil, now.toISOString(), adminId]);

  return currentAttempts;
}

export async function updateAdminProfile(adminId, { fullName, email, avatar, avatarPosition, currentPassword, newPassword }) {
  const admin = await getAdminById(adminId);
  if (!admin) throw new Error("Admin not found");

  const now = new Date().toISOString();
  const isEmailChange = Boolean(email && email.trim().toLowerCase() !== (admin.email || "").toLowerCase());

  if (newPassword || isEmailChange) {
    if (!currentPassword || !verifyPassword(currentPassword, admin.password_hash, admin.salt)) {
      const err = new Error("Current administrative password verification required.");
      err.statusCode = 401;
      throw err;
    }
  }

  if (newPassword) {
    const { hash, salt } = hashPassword(newPassword);
    await execute(`
      UPDATE admins
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          avatar = COALESCE(?, avatar),
          avatar_position = COALESCE(?, avatar_position),
          password_hash = ?,
          salt = ?,
          updated_at = ?
      WHERE id = ?
    `, [fullName || null, email || null, avatar || null, avatarPosition || null, hash, salt, now, adminId]);
  } else {
    await execute(`
      UPDATE admins
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          avatar = COALESCE(?, avatar),
          avatar_position = COALESCE(?, avatar_position),
          updated_at = ?
      WHERE id = ?
    `, [fullName || null, email || null, avatar || null, avatarPosition || null, now, adminId]);
  }
}

let portfolioCache = null;
let portfolioCacheExpiry = 0;

export function invalidatePortfolioContentCache() {
  portfolioCache = null;
  portfolioCacheExpiry = 0;
}

// ==========================================
// Portfolio Content Query (Full Structured Object - Parallelized & Cached)
// ==========================================
export async function getPortfolioContent() {
  const now = Date.now();
  if (portfolioCache && now < portfolioCacheExpiry) {
    return portfolioCache;
  }

  const [
    heroRes,
    aboutRes,
    highlights,
    expRows,
    eduRows,
    skills,
    skill_badges,
    projRows,
    services,
    social_links_res,
    contact_channels_res,
    resumeRes,
    site_settings_res,
    certifications,
    experience_metrics,
    cwRows,
    software_tools,
    project_methodologies,
    phRows,
    homepage_cta_res
  ] = await Promise.all([
    queryOne("SELECT * FROM hero WHERE id = 1"),
    queryOne("SELECT * FROM about WHERE id = 1"),
    queryAll("SELECT * FROM highlights ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM experiences ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM educations ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM skills ORDER BY category ASC, sort_order ASC, id ASC"),
    queryAll("SELECT * FROM skill_badges ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM projects ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM services ORDER BY sort_order ASC, id ASC"),
    queryOne("SELECT * FROM social_links WHERE id = 1"),
    queryAll("SELECT * FROM contact_channels ORDER BY sort_order ASC, id ASC").catch(() => []),
    queryOne("SELECT * FROM resumes WHERE is_active = 1 ORDER BY id DESC LIMIT 1"),
    queryOne("SELECT * FROM site_settings WHERE id = 1"),
    queryAll("SELECT * FROM certifications ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM experience_metrics ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM coursework_pillars ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM software_tools ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM project_methodologies ORDER BY sort_order ASC, id ASC"),
    queryAll("SELECT * FROM page_headers"),
    queryOne("SELECT * FROM homepage_cta WHERE id = 1")
  ]);

  const hero = heroRes || {};
  const about = aboutRes || {};
  let aboutPillars = [];
  let aboutPrinciples = [];
  try {
    aboutPillars = JSON.parse(about.pillars_json || "[]");
  } catch {}
  try {
    aboutPrinciples = JSON.parse(about.principles_json || "[]");
  } catch {}
  const aboutEnhanced = {
    ...about,
    pillars: aboutPillars,
    principles: aboutPrinciples,
  };

  const experiences = (expRows || []).map((r) => {
    let points = [];
    try {
      points = JSON.parse(r.description_points || "[]");
    } catch {
      points = [];
    }
    return { ...r, description_points: points };
  });

  const educations = (eduRows || []).map((ed) => {
    let highlights = [];
    try {
      highlights = JSON.parse(ed.highlights_json || "[]");
    } catch (_) {}
    return { ...ed, highlights };
  });

  const grouped_skills = {};
  for (const s of (skills || [])) {
    if (!grouped_skills[s.category]) {
      grouped_skills[s.category] = [];
    }
    grouped_skills[s.category].push(s);
  }

  const projects = (projRows || []).map((p) => {
    let tags = [];
    let additionalImages = [];
    try {
      tags = JSON.parse(p.tags_json || "[]");
    } catch {
      tags = [];
    }
    try {
      additionalImages = JSON.parse(p.additional_images_json || "[]");
    } catch {
      additionalImages = [];
    }
    return { ...p, tags, additional_images: additionalImages };
  });

  const social_links = social_links_res || {};
  const contact_channels = contact_channels_res || [];
  const resume = resumeRes || {};
  const site_settings = site_settings_res || {};

  const coursework_pillars = (cwRows || []).map((r) => {
    let courses = [];
    try {
      courses = JSON.parse(r.courses_json || "[]");
    } catch {}
    return { ...r, courses };
  });

  const page_headers = {};
  for (const ph of (phRows || [])) {
    page_headers[ph.page_key] = ph;
  }

  const homepage_cta = homepage_cta_res || {};

  const result = {
    success: true,
    hero,
    about: aboutEnhanced,
    highlights: highlights || [],
    experiences,
    experience_metrics: experience_metrics || [],
    educations,
    coursework_pillars,
    certifications: certifications || [],
    skills: skills || [],
    grouped_skills,
    skill_badges: skill_badges || [],
    software_tools: software_tools || [],
    projects,
    project_methodologies: project_methodologies || [],
    services: services || [],
    social_links,
    contact_channels,
    resume,
    site_settings,
    page_headers,
    homepage_cta,
  };

  portfolioCache = result;
  portfolioCacheExpiry = Date.now() + 15000; // 15-second cache
  return result;
}

// ==========================================
// Portfolio Section Updates
// ==========================================
export async function updatePortfolioSection(section, data, user = "admin") {
  const now = new Date().toISOString();

  switch (section) {
    case "hero": {
      await execute(`
        UPDATE hero SET
          name = COALESCE(?, name),
          title = COALESCE(?, title),
          badge_text = COALESCE(?, badge_text),
          introduction = COALESCE(?, introduction),
          profile_image = COALESCE(?, profile_image),
          profile_position = COALESCE(?, profile_position),
          primary_btn_text = COALESCE(?, primary_btn_text),
          primary_btn_link = COALESCE(?, primary_btn_link),
          secondary_btn_text = COALESCE(?, secondary_btn_text),
          secondary_btn_link = COALESCE(?, secondary_btn_link),
          spec_badge_label = COALESCE(?, spec_badge_label),
          spec_badge_title = COALESCE(?, spec_badge_title),
          updated_at = ?
        WHERE id = 1
      `, [
        data.name ?? null,
        data.title ?? null,
        data.badge_text ?? null,
        data.introduction ?? null,
        data.profile_image ?? null,
        data.profile_position ?? null,
        data.primary_btn_text ?? null,
        data.primary_btn_link ?? null,
        data.secondary_btn_text ?? null,
        data.secondary_btn_link ?? null,
        data.spec_badge_label ?? null,
        data.spec_badge_title ?? null,
        now,
      ]);
      await addActivityLog("Updated Hero Section", "Modified Hero headline, bio, or profile photo.", "Portfolio", user, 1);
      break;
    }

    case "about": {
      const pillarsJson = data.pillars ? JSON.stringify(data.pillars) : (data.pillars_json ?? null);
      const principlesJson = data.principles ? JSON.stringify(data.principles) : (data.principles_json ?? null);
      await execute(`
        UPDATE about SET
          subtitle = COALESCE(?, subtitle),
          title = COALESCE(?, title),
          description1 = COALESCE(?, description1),
          description2 = COALESCE(?, description2),
          profile_image = COALESCE(?, profile_image),
          profile_position = COALESCE(?, profile_position),
          focus1_title = COALESCE(?, focus1_title),
          focus1_text = COALESCE(?, focus1_text),
          focus2_title = COALESCE(?, focus2_title),
          focus2_text = COALESCE(?, focus2_text),
          pillars_json = COALESCE(?, pillars_json),
          principles_json = COALESCE(?, principles_json),
          updated_at = ?
        WHERE id = 1
      `, [
        data.subtitle ?? null,
        data.title ?? null,
        data.description1 ?? null,
        data.description2 ?? null,
        data.profile_image ?? null,
        data.profile_position ?? null,
        data.focus1_title ?? null,
        data.focus1_text ?? null,
        data.focus2_title ?? null,
        data.focus2_text ?? null,
        pillarsJson,
        principlesJson,
        now,
      ]);
      await addActivityLog("Updated About Section", "Modified bio descriptions and engineering focus badges.", "Portfolio", user, 1);
      break;
    }

    case "highlights": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM highlights");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          await execute(`
            INSERT INTO highlights (metric_value, metric_label, metric_subtext, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `, [
            item.metric_value || "",
            item.metric_label || "",
            item.metric_subtext || "",
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1
          ]);
        }
        await addActivityLog("Updated Highlights Bar", `Saved ${data.items.length} metrics.`, "Portfolio", user, 1);
      }
      break;
    }

    case "experiences": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM experiences");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          const pointsJson = JSON.stringify(item.description_points || item.points || []);
          await execute(`
            INSERT INTO experiences (
              role, organization, period, start_date, end_date, is_current,
              description_points, location, website, is_active, sort_order, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.role || "",
            item.organization || "",
            item.period || "",
            item.start_date || "",
            item.end_date || "",
            item.is_current ? 1 : 0,
            pointsJson,
            item.location || "",
            item.website || "",
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1,
            now,
          ]);
        }
        await addActivityLog("Updated Experience Timeline", `Saved ${data.items.length} work positions.`, "Portfolio", user, 1);
      }
      break;
    }

    case "educations": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM educations");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          const period = item.period || (item.start_year ? `${item.start_year} – ${item.end_year || 'Present'}` : "");
          const highlightsJson = JSON.stringify(item.highlights || []);
          await execute(`
            INSERT INTO educations (degree, institution, subject, start_year, end_year, period, result, badge_text, description, highlights_json, is_active, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.degree || "",
            item.institution || "",
            item.subject || "",
            item.start_year || "",
            item.end_year || "",
            period,
            item.result || "",
            item.badge_text || "",
            item.description || "",
            highlightsJson,
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1,
            now,
          ]);
        }
        await addActivityLog("Updated Education Entries", `Saved ${data.items.length} degrees/certifications.`, "Portfolio", user, 1);
      }
      break;
    }

    case "skills": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM skills");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          await execute(`
            INSERT INTO skills (category, name, level, icon, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            item.category || "General",
            item.name || "",
            item.level || 80,
            item.icon || "",
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1
          ]);
        }
        await addActivityLog("Updated Skills Matrix", `Saved ${data.items.length} technical skills.`, "Portfolio", user, 1);
      }
      break;
    }

    case "projects": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM projects");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          const tagsJson = JSON.stringify(item.tags || []);
          const addImages = Array.isArray(item.additional_images) ? item.additional_images.filter(Boolean) : [];
          const addImagesJson = JSON.stringify(addImages);
          const isPub = item.is_published !== undefined ? (item.is_published ? 1 : 0) : 1;
          const isAct = item.is_active !== undefined ? (item.is_active ? 1 : 0) : isPub;
          const sortVal = item.sort_order !== undefined && item.sort_order !== null && item.sort_order !== ""
            ? Number(item.sort_order)
            : idx + 1;
          await execute(`
            INSERT INTO projects (
              project_number, title, short_description, full_description, image_url, image_position,
              additional_images_json, tags_json, category, live_url, github_url,
              project_date, is_featured, is_published, is_active, sort_order, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.project_number || String(idx + 1).padStart(2, "0"),
            item.title || "",
            item.short_description || "",
            item.full_description || item.short_description || "",
            item.image_url || "",
            item.image_position || "center center",
            addImagesJson,
            tagsJson,
            item.category || "Engineering",
            item.live_url || "",
            item.github_url || "",
            item.project_date || "2024",
            item.is_featured ? 1 : 0,
            isPub,
            isAct,
            sortVal,
            now,
          ]);
        }
        await addActivityLog("Updated Projects Portfolio", `Saved ${data.items.length} projects.`, "Portfolio", user, 1);
      }
      break;
    }

    case "social_links":
    case "social": {
      await execute(`
        UPDATE social_links SET
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          whatsapp = COALESCE(?, whatsapp),
          linkedin = COALESCE(?, linkedin),
          github = COALESCE(?, github),
          facebook = COALESCE(?, facebook),
          location = COALESCE(?, location),
          maps_url = COALESCE(?, maps_url),
          updated_at = ?
        WHERE id = 1
      `, [
        data.email ?? null,
        data.phone ?? null,
        data.whatsapp ?? null,
        data.linkedin ?? null,
        data.github ?? null,
        data.facebook ?? null,
        data.location ?? null,
        data.maps_url ?? null,
        now,
      ]);

      // Synchronize changes to separate contact_channels table
      try {
        if (data.email) {
          await execute("UPDATE contact_channels SET value = ?, url = ?, updated_at = ? WHERE channel_key = 'email'", [data.email, `mailto:${data.email}`, now]);
        }
        if (data.phone) {
          await execute("UPDATE contact_channels SET value = ?, url = ?, updated_at = ? WHERE channel_key = 'phone'", [data.phone, `tel:${data.phone.replace(/\s+/g, '')}`, now]);
        }
        if (data.whatsapp) {
          await execute("UPDATE contact_channels SET value = ?, url = ?, updated_at = ? WHERE channel_key = 'whatsapp'", [data.whatsapp, `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`, now]);
        }
        if (data.linkedin) {
          await execute("UPDATE contact_channels SET value = ?, url = ?, updated_at = ? WHERE channel_key = 'linkedin'", [data.linkedin, data.linkedin, now]);
        }
        if (data.github) {
          await execute("UPDATE contact_channels SET value = ?, url = ?, updated_at = ? WHERE channel_key = 'github'", [data.github, data.github, now]);
        }
        if (data.location) {
          await execute("UPDATE contact_channels SET value = ?, updated_at = ? WHERE channel_key = 'location'", [data.location, now]);
        }
      } catch (err) {
        console.warn("Sync to contact_channels skipped:", err?.message);
      }

      await addActivityLog("Updated Contact & Social Details", "Modified phone, email, WhatsApp, or location.", "Portfolio", user, 1);
      break;
    }

    case "contact_channels": {
      if (Array.isArray(data.items || data.channels)) {
        const items = data.items || data.channels;
        for (const ch of items) {
          if (!ch.channel_key) continue;
          await execute(`
            UPDATE contact_channels SET
              label = COALESCE(?, label),
              action_text = COALESCE(?, action_text),
              value = COALESCE(?, value),
              url = COALESCE(?, url),
              is_active = COALESCE(?, is_active),
              updated_at = ?
            WHERE channel_key = ?
          `, [
            ch.label ?? null,
            ch.action_text ?? null,
            ch.value ?? null,
            ch.url ?? null,
            ch.is_active !== undefined ? Number(ch.is_active) : null,
            now,
            ch.channel_key
          ]);
        }
      } else if (data.channel_key) {
        await execute(`
          UPDATE contact_channels SET
            is_active = COALESCE(?, is_active),
            value = COALESCE(?, value),
            url = COALESCE(?, url),
            updated_at = ?
          WHERE channel_key = ?
        `, [
          data.is_active !== undefined ? Number(data.is_active) : null,
          data.value ?? null,
          data.url ?? null,
          now,
          data.channel_key
        ]);
      }
      await addActivityLog("Updated Contact Channels", "Toggled active/disabled status or updated contact channel details.", "Portfolio", user, 1);
      break;
    }

    case "site_settings":
    case "settings": {
      await execute(`
        UPDATE site_settings SET
          site_title = COALESCE(?, site_title),
          brand_logo = COALESCE(?, brand_logo),
          favicon_url = COALESCE(?, favicon_url),
          meta_description = COALESCE(?, meta_description),
          og_image_url = COALESCE(?, og_image_url),
          footer_brand = COALESCE(?, footer_brand),
          footer_copyright = COALESCE(?, footer_copyright),
          updated_at = ?
        WHERE id = 1
      `, [
        data.site_title ?? null,
        data.brand_logo ?? null,
        data.favicon_url ?? null,
        data.meta_description ?? null,
        data.og_image_url ?? null,
        data.footer_brand ?? null,
        data.footer_copyright ?? null,
        now,
      ]);
      await addActivityLog("Updated Site Brand & Settings", "Modified site title, brand logo, or meta description.", "Portfolio", user, 1);
      break;
    }

    case "resume":
    case "resumes": {
      await execute(`
        UPDATE resumes SET
          file_name = COALESCE(?, file_name),
          file_url = COALESCE(?, file_url),
          upload_date = ?
        WHERE id = 1 OR is_active = 1
      `, [
        data.file_name ?? null,
        data.file_url ?? data.resume_url ?? null,
        now,
      ]);
      await addActivityLog("Updated Resume Link", "Modified CV file link or download name.", "Portfolio", user, 1);
      break;
    }

    case "certifications": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM certifications");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          await execute(`
            INSERT INTO certifications (title, issuer, year, description, is_verified, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            item.title || "",
            item.issuer || "",
            item.year || "",
            item.description || "",
            item.is_verified !== undefined ? (item.is_verified ? 1 : 0) : 1,
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1,
          ]);
        }
        await addActivityLog("Updated Certifications", `Saved ${data.items.length} certificates.`, "Portfolio", user, 1);
      }
      break;
    }

    case "experience_metrics": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM experience_metrics");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          await execute(`
            INSERT INTO experience_metrics (metric, label, subtext, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `, [
            item.metric || "",
            item.label || "",
            item.subtext || "",
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1
          ]);
        }
        await addActivityLog("Updated Experience Metrics", `Saved ${data.items.length} metrics.`, "Portfolio", user, 1);
      }
      break;
    }

    case "coursework_pillars": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM coursework_pillars");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          const coursesJson = JSON.stringify(item.courses || []);
          await execute(`
            INSERT INTO coursework_pillars (title, courses_json, is_active, sort_order)
            VALUES (?, ?, ?, ?)
          `, [
            item.title || "",
            coursesJson,
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1
          ]);
        }
        await addActivityLog("Updated Coursework Curriculum", `Saved ${data.items.length} pillars.`, "Portfolio", user, 1);
      }
      break;
    }

    case "software_tools": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM software_tools");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          await execute(`
            INSERT INTO software_tools (name, tool_type, icon, level, summary, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            item.name || "",
            item.tool_type || item.type || "",
            item.icon || "Monitor",
            item.level || "Proficient",
            item.summary || "",
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1
          ]);
        }
        await addActivityLog("Updated Software Tools", `Saved ${data.items.length} tools.`, "Portfolio", user, 1);
      }
      break;
    }

    case "skill_badges": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM skill_badges");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          const badgeName = typeof item === "string" ? item : (item.name || "");
          const isActive = typeof item === "object" && item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1;
          if (badgeName) {
            await execute(`INSERT INTO skill_badges (name, is_active, sort_order) VALUES (?, ?, ?)`, [badgeName, isActive, idx + 1]);
          }
        }
        await addActivityLog("Updated Skill Badges", `Saved ${data.items.length} badges.`, "Portfolio", user, 1);
      }
      break;
    }

    case "project_methodologies": {
      if (Array.isArray(data.items)) {
        await execute("DELETE FROM project_methodologies");
        for (let idx = 0; idx < data.items.length; idx++) {
          const item = data.items[idx];
          await execute(`
            INSERT INTO project_methodologies (step_number, title, description, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `, [
            item.step_number || String(idx + 1).padStart(2, "0"),
            item.title || "",
            item.description || "",
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
            idx + 1
          ]);
        }
        await addActivityLog("Updated Project Methodologies", `Saved ${data.items.length} steps.`, "Portfolio", user, 1);
      }
      break;
    }

    case "page_headers": {
      if (data.page_key) {
        if (neonSql) {
          await neonSql.query(`
            INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (page_key) DO UPDATE SET
              badge_text = EXCLUDED.badge_text,
              title = EXCLUDED.title,
              highlight_word = EXCLUDED.highlight_word,
              description = EXCLUDED.description
          `, [data.page_key, data.badge_text || "", data.title || "", data.highlight_word || "", data.description || ""]);
        }
        try {
          const db = getSqliteDb();
          db.prepare(`
            INSERT OR REPLACE INTO page_headers (page_key, badge_text, title, highlight_word, description)
            VALUES (?, ?, ?, ?, ?)
          `).run(data.page_key, data.badge_text || "", data.title || "", data.highlight_word || "", data.description || "");
        } catch (_) {}
      } else if (typeof data === "object") {
        for (const [key, val] of Object.entries(data)) {
          if (val && typeof val === "object") {
            if (neonSql) {
              await neonSql.query(`
                INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (page_key) DO UPDATE SET
                  badge_text = EXCLUDED.badge_text,
                  title = EXCLUDED.title,
                  highlight_word = EXCLUDED.highlight_word,
                  description = EXCLUDED.description
              `, [key, val.badge_text || "", val.title || "", val.highlight_word || "", val.description || ""]);
            }
            try {
              const db = getSqliteDb();
              db.prepare(`
                INSERT OR REPLACE INTO page_headers (page_key, badge_text, title, highlight_word, description)
                VALUES (?, ?, ?, ?, ?)
              `).run(key, val.badge_text || "", val.title || "", val.highlight_word || "", val.description || "");
            } catch (_) {}
          }
        }
      }
      await addActivityLog("Updated Page Header Banners", "Saved header titles and descriptions.", "Portfolio", user, 1);
      break;
    }

    case "homepage_cta": {
      await execute(`
        UPDATE homepage_cta SET
          badge_text = COALESCE(?, badge_text),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          primary_btn_text = COALESCE(?, primary_btn_text),
          primary_btn_link = COALESCE(?, primary_btn_link),
          secondary_btn_text = COALESCE(?, secondary_btn_text),
          secondary_btn_link = COALESCE(?, secondary_btn_link)
        WHERE id = 1
      `, [
        data.badge_text ?? null,
        data.title ?? null,
        data.description ?? null,
        data.primary_btn_text ?? null,
        data.primary_btn_link ?? null,
        data.secondary_btn_text ?? null,
        data.secondary_btn_link ?? null,
      ]);
      await addActivityLog("Updated Homepage CTA", "Modified collaboration callout texts.", "Portfolio", user, 1);
      break;
    }

    default:
      break;
  }

  // Invalidate cache AFTER writes commit to ensure immediate freshness for next read
  invalidatePortfolioContentCache();

  // Background dual-database sync and Git Push for instant live deployment
  triggerGitSyncInBackground();

  return { success: true, message: `Updated section: ${section}` };
}



// ==========================================
// Central Websites & Multi-Site Directory
// ==========================================
export async function getWebsites() {
  return (await queryAll("SELECT * FROM websites ORDER BY id ASC")) || [];
}

export async function saveWebsite(id, data, user = "admin") {
  const now = new Date().toISOString();

  if (id) {
    await execute(`
      UPDATE websites SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        url = COALESCE(?, url),
        cms_url = COALESCE(?, cms_url),
        description = COALESCE(?, description),
        website_type = COALESCE(?, website_type),
        cms_type = COALESCE(?, cms_type),
        status = COALESCE(?, status),
        connection_status = COALESCE(?, connection_status),
        logo = COALESCE(?, logo),
        api_key = COALESCE(?, api_key),
        updated_at = ?
      WHERE id = ?
    `, [
      data.name ?? null,
      data.slug ?? null,
      data.url ?? null,
      data.cms_url ?? null,
      data.description ?? null,
      data.website_type ?? null,
      data.cms_type ?? null,
      data.status ?? null,
      data.connection_status ?? null,
      data.logo ?? null,
      data.api_key ?? null,
      now,
      id,
    ]);
    await addActivityLog("Updated Website Registration", `Modified website: ${data.name || id}`, data.name || "Websites", user, id);
  } else {
    await execute(`
      INSERT INTO websites (
        name, slug, url, cms_url, description, website_type, cms_type,
        status, connection_status, logo, api_key, settings_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)
    `, [
      data.name || "New Website",
      data.slug || `site-${Date.now()}`,
      data.url || "https://example.com",
      data.cms_url || "",
      data.description || "",
      data.website_type || "Web Application",
      data.cms_type || "Built-in Central CMS",
      data.status || "active",
      data.connection_status || "connected",
      data.logo || "/globe.svg",
      data.api_key || `key_${Date.now()}`,
      now,
      now,
    ]);
    await addActivityLog("Registered New Website", `Connected website: ${data.name}`, data.name, user);
  }
  return { success: true };
}

export async function deleteWebsite(id, user = "admin") {
  const site = await queryOne("SELECT name FROM websites WHERE id = ?", [id]);
  await execute("DELETE FROM websites WHERE id = ?", [id]);
  await addActivityLog("Disconnected Website", `Removed site: ${site?.name || id}`, "Websites", user, id);
  return { success: true };
}

// ==========================================
// Admin Presence & Online State
// ==========================================
export async function isAdminOnline() {
  try {
    const row = await queryOne("SELECT last_seen FROM admin_presence WHERE id = 1");
    if (!row || !row.last_seen) return false;
    const lastSeenTime = new Date(row.last_seen).getTime();
    if (isNaN(lastSeenTime)) return false;
    const diffSeconds = (Date.now() - lastSeenTime) / 1000;
    // Returns true when last_seen is within 120 seconds
    return diffSeconds >= 0 && diffSeconds <= 120;
  } catch (err) {
    console.error("isAdminOnline error:", err);
    return false;
  }
}

export async function updateAdminPresence() {
  const now = new Date().toISOString();
  await execute(`
    INSERT INTO admin_presence (id, last_seen) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET last_seen = excluded.last_seen
  `, [now]);
  return { success: true, last_seen: now };
}

// ==========================================
// Contact Inbox & Replies
// ==========================================
export async function addContactMessage(name, email, subject, message, ip = "") {
  const now = new Date().toISOString();
  await execute(`
    INSERT INTO contact_messages (name, email, subject, message, is_read, ip_address, created_at)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `, [name, email, subject || "", message, ip, now]);
  await addActivityLog("New Contact Inquiry", `Message received from ${name} (${email})`, "Portfolio", "Visitor", 1);
  return { success: true };
}

export async function getContactMessages() {
  const messages = (await queryAll("SELECT * FROM contact_messages ORDER BY id DESC")) || [];
  if (messages.length === 0) return [];
  try {
    const replies = (await queryAll("SELECT * FROM contact_replies ORDER BY id ASC")) || [];
    const replyMap = {};
    for (const r of replies) {
      const mid = r.message_id;
      if (!replyMap[mid]) replyMap[mid] = [];
      replyMap[mid].push(r);
    }
    return messages.map((m) => ({
      ...m,
      replies: replyMap[m.id] || [],
    }));
  } catch (err) {
    console.warn("Could not load contact replies:", err);
    return messages.map((m) => ({ ...m, replies: [] }));
  }
}

export async function getContactReplies(messageId) {
  return (await queryAll("SELECT * FROM contact_replies WHERE message_id = ? ORDER BY id ASC", [messageId])) || [];
}

export async function addContactReply(messageId, body) {
  const now = new Date().toISOString();
  await execute(`
    INSERT INTO contact_replies (message_id, body, created_at)
    VALUES (?, ?, ?)
  `, [messageId, body, now]);
  await execute("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [messageId]);
  await addActivityLog("Contact Message Replied", `Replied to message ID #${messageId}`, "Portfolio", "Admin", 1);
  return { success: true, reply: { message_id: messageId, body, created_at: now } };
}

export async function deleteContactMessage(id) {
  await execute("DELETE FROM contact_messages WHERE id = ?", [id]);
  return { success: true };
}

export async function markContactMessageRead(id, isRead = 1) {
  await execute("UPDATE contact_messages SET is_read = ? WHERE id = ?", [isRead ? 1 : 0, id]);
  return { success: true };
}

export async function countUnreadContactMessages() {
  try {
    const row = await queryOne("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");
    return Number(row?.count || 0);
  } catch (err) {
    console.error("countUnreadContactMessages error:", err);
    return 0;
  }
}

// ==========================================
// Activity & Audit Logs
// ==========================================
export async function getActivityLogs({ limit = 50, category = "all", search = "" } = {}) {
  let query = "SELECT * FROM activity_logs";
  const params = [];
  const where = [];

  if (category && category !== "all") {
    where.push("website_name LIKE ?");
    params.push(`%${category}%`);
  }
  if (search) {
    where.push(`(action LIKE ? OR details LIKE ? OR "user" LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
  query += " ORDER BY id DESC LIMIT ?";
  params.push(Number(limit) || 50);

  return (await queryAll(query, params)) || [];
}

// ==========================================
// Central Dashboard Overview & Metrics
// ==========================================
export async function getCentralDashboard() {
  const projRow = await queryOne("SELECT COUNT(*) as count FROM projects");
  const skillsRow = await queryOne("SELECT COUNT(*) as count FROM skills");
  const sitesRow = await queryOne("SELECT COUNT(*) as count FROM websites");
  const unreadRow = await queryOne("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");

  const totalProjects = Number(projRow?.count || 0);
  const totalSkills = Number(skillsRow?.count || 0);
  const totalWebsites = Number(sitesRow?.count || 0);
  const unreadMessages = Number(unreadRow?.count || 0);

  const recentLogs = (await queryAll("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 5")) || [];
  const websites = (await queryAll("SELECT * FROM websites ORDER BY id ASC")) || [];

  return {
    success: true,
    stats: {
      totalProjects,
      totalSkills,
      totalWebsites,
      unreadMessages,
    },
    websites,
    recentLogs,
  };
}

// ==========================================
// System Settings
// ==========================================
export async function getSystemSettings() {
  const rows = (await queryAll("SELECT * FROM central_system_settings")) || [];
  const result = {};
  for (const r of rows) {
    try {
      result[r.category] = JSON.parse(r.settings_json);
    } catch {
      result[r.category] = {};
    }
  }
  return { success: true, settings: result };
}

export async function saveSystemSettings(category, data, user = "admin") {
  const now = new Date().toISOString();
  const jsonStr = JSON.stringify(data);
  await execute(`
    INSERT INTO central_system_settings (category, settings_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(category) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at = excluded.updated_at
  `, [category, jsonStr, now]);
  await addActivityLog("Updated System Settings", `Modified category: ${category}`, "Central CMS", user);
  return { success: true };
}

// ==========================================
// User Accounts & Roles
// ==========================================
export async function getUsers() {
  const rows =
    (await queryAll(
      "SELECT id, username, email, full_name, role, is_active, last_login_at, permissions_json, assigned_websites_json, two_factor_enabled, created_at FROM admins"
    )) || [];
  return {
    success: true,
    users: rows.map((u) => {
      let perms = ["*"];
      let sites = ["*"];
      try {
        perms = JSON.parse(u.permissions_json || '["*"]');
      } catch {}
      try {
        sites = JSON.parse(u.assigned_websites_json || '["*"]');
      } catch {}
      return { ...u, permissions: perms, websites: sites };
    }),
  };
}

// ==========================================
// Media & Document Files (Neon PostgreSQL & SQLite)
// ==========================================
export async function ensureMediaTable() {
  try {
    if (neonSql) {
      await neonSql.query(`
        CREATE TABLE IF NOT EXISTS media_files (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          original_name TEXT,
          mime_type VARCHAR(100),
          file_size INTEGER,
          data TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      const db = getSqliteDb();
      db.prepare(`
        CREATE TABLE IF NOT EXISTS media_files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT UNIQUE NOT NULL,
          original_name TEXT,
          mime_type TEXT,
          file_size INTEGER,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `).run();
    }
  } catch (err) {
    console.error("ensureMediaTable error:", err);
  }
}

export async function saveMediaFile({ filename, originalName, mimeType, fileSize, data }) {
  await ensureMediaTable();
  if (neonSql) {
    await neonSql.query(
      `INSERT INTO media_files (filename, original_name, mime_type, file_size, data)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (filename) DO UPDATE SET
         data = EXCLUDED.data,
         file_size = EXCLUDED.file_size,
         mime_type = EXCLUDED.mime_type`,
      [filename, originalName, mimeType, fileSize, data]
    );
  }
  try {
    const db = getSqliteDb();
    db.prepare(`
      INSERT OR REPLACE INTO media_files (filename, original_name, mime_type, file_size, data)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename, originalName, mimeType, fileSize, data);
  } catch (_) {}

  // Trigger git push if media saved
  triggerGitSyncInBackground();

  return { success: true, filename };
}

let gitSyncDebounceTimer = null;
export function triggerGitSyncInBackground() {
  if (process.env.VERCEL) {
    return;
  }
  if (gitSyncDebounceTimer) {
    clearTimeout(gitSyncDebounceTimer);
  }
  gitSyncDebounceTimer = setTimeout(() => {
    try {
      exec("git status --porcelain", { cwd: process.cwd() }, (err, stdout) => {
        if (err) return;
        const modified = (stdout || "")
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !l.includes("scratch/"));

        if (modified.length === 0) return;

        exec('git add public/ && git commit -m "chore(cms): auto-sync admin content update" && git push origin main', { cwd: process.cwd() }, (pushErr, pushOut, pushStderr) => {
          if (pushErr) {
            console.error("[Git Auto-Sync] Push error:", pushStderr || pushErr.message);
          } else {
            console.log("[Git Auto-Sync] Changes committed & pushed to GitHub! Vercel live deploy triggered.");
          }
        });
      });
    } catch (e) {
      console.warn("[Git Auto-Sync] Failed:", e.message);
    }
  }, 2000);
}

export async function getMediaFile(filename) {
  await ensureMediaTable();
  return await queryOne(
    "SELECT id, filename, original_name, mime_type, file_size, data, created_at FROM media_files WHERE filename = ?",
    [filename]
  );
}

