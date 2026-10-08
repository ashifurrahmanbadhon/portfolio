import path from "path";
import fs from "fs";
import crypto from "crypto";
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
  }
  return sqliteInstance;
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
  if (neonSql) {
    const pgSql = convertPlaceholders(sqlText);
    return await neonSql.query(pgSql, params);
  } else {
    const db = getSqliteDb();
    return db.prepare(sqlText).run(...params);
  }
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
    SET failed_login_attempts = 0, locked_until = NULL, last_login_at = ?, updated_at = ?
    WHERE id = ?
  `, [now, now, adminId]);
}

export async function updateAdminProfile(adminId, { fullName, email, avatar, currentPassword, newPassword }) {
  const admin = await getAdminById(adminId);
  if (!admin) throw new Error("Admin not found");

  const now = new Date().toISOString();

  if (newPassword) {
    if (!currentPassword || !verifyPassword(currentPassword, admin.password_hash, admin.salt)) {
      throw new Error("Current password verification failed");
    }
    const { hash, salt } = hashPassword(newPassword);
    await execute(`
      UPDATE admins
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          avatar = COALESCE(?, avatar),
          password_hash = ?,
          salt = ?,
          updated_at = ?
      WHERE id = ?
    `, [fullName || null, email || null, avatar || null, hash, salt, now, adminId]);
  } else {
    await execute(`
      UPDATE admins
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          avatar = COALESCE(?, avatar),
          updated_at = ?
      WHERE id = ?
    `, [fullName || null, email || null, avatar || null, now, adminId]);
  }
}

// ==========================================
// Portfolio Content Query (Full Structured Object)
// ==========================================
export async function getPortfolioContent() {
  // 1. Hero
  const hero = (await queryOne("SELECT * FROM hero WHERE id = 1")) || {};

  // 2. About
  const about = (await queryOne("SELECT * FROM about WHERE id = 1")) || {};
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

  // 3. Highlights
  const highlights = (await queryAll("SELECT * FROM highlights ORDER BY sort_order ASC, id ASC")) || [];

  // 4. Experiences
  const expRows = (await queryAll("SELECT * FROM experiences ORDER BY sort_order ASC, id ASC")) || [];
  const experiences = expRows.map((r) => {
    let points = [];
    try {
      points = JSON.parse(r.description_points || "[]");
    } catch {
      points = [];
    }
    return { ...r, description_points: points };
  });

  // 5. Educations
  const eduRows = (await queryAll("SELECT * FROM educations ORDER BY sort_order ASC, id ASC")) || [];
  const educations = eduRows.map((ed) => {
    let highlights = [];
    try {
      highlights = JSON.parse(ed.highlights_json || "[]");
    } catch (_) {}
    return { ...ed, highlights };
  });

  // 6. Skills
  const skills = (await queryAll("SELECT * FROM skills ORDER BY category ASC, sort_order ASC, id ASC")) || [];
  const grouped_skills = {};
  for (const s of skills) {
    if (!grouped_skills[s.category]) {
      grouped_skills[s.category] = [];
    }
    grouped_skills[s.category].push(s);
  }

  // 7. Skill Badges
  const skill_badges = (await queryAll("SELECT * FROM skill_badges ORDER BY sort_order ASC, id ASC")) || [];

  // 8. Projects
  const projRows = (await queryAll("SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, id ASC")) || [];
  const projects = projRows.map((p) => {
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

  // 9. Services
  const services = (await queryAll("SELECT * FROM services ORDER BY sort_order ASC, id ASC")) || [];

  // 10. Social Links
  const social_links = (await queryOne("SELECT * FROM social_links WHERE id = 1")) || {};

  // 10b. Contact Channels (Separate Dedicated Table)
  let contact_channels = [];
  try {
    contact_channels = (await queryAll("SELECT * FROM contact_channels ORDER BY sort_order ASC, id ASC")) || [];
  } catch (err) {
    console.warn("Could not query contact_channels:", err.message);
  }

  // 11. Resume
  const resume = (await queryOne("SELECT * FROM resumes WHERE is_active = 1 ORDER BY id DESC LIMIT 1")) || {};

  // 12. Site Settings
  const site_settings = (await queryOne("SELECT * FROM site_settings WHERE id = 1")) || {};

  // 13. Certifications & Training
  const certifications = (await queryAll("SELECT * FROM certifications ORDER BY sort_order ASC, id ASC")) || [];

  // 14. Career & Experience Metrics
  const experience_metrics = (await queryAll("SELECT * FROM experience_metrics ORDER BY sort_order ASC, id ASC")) || [];

  // 15. Undergraduate Coursework Pillars
  const cwRows = (await queryAll("SELECT * FROM coursework_pillars ORDER BY sort_order ASC, id ASC")) || [];
  const coursework_pillars = cwRows.map((r) => {
    let courses = [];
    try {
      courses = JSON.parse(r.courses_json || "[]");
    } catch {}
    return { ...r, courses };
  });

  // 16. Core Software Tools
  const software_tools = (await queryAll("SELECT * FROM software_tools ORDER BY sort_order ASC, id ASC")) || [];

  // 17. Engineering Project Methodologies
  const project_methodologies = (await queryAll("SELECT * FROM project_methodologies ORDER BY sort_order ASC, id ASC")) || [];

  // 18. Page Headers (Map keyed by page_key)
  const phRows = (await queryAll("SELECT * FROM page_headers")) || [];
  const page_headers = {};
  for (const ph of phRows) {
    page_headers[ph.page_key] = ph;
  }

  // 19. Homepage Collaboration CTA
  const homepage_cta = (await queryOne("SELECT * FROM homepage_cta WHERE id = 1")) || {};

  return {
    success: true,
    hero,
    about: aboutEnhanced,
    highlights,
    experiences,
    experience_metrics,
    educations,
    coursework_pillars,
    certifications,
    skills,
    grouped_skills,
    skill_badges,
    software_tools,
    projects,
    project_methodologies,
    services,
    social_links,
    contact_channels,
    resume,
    site_settings,
    page_headers,
    homepage_cta,
  };
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
          const addImagesJson = JSON.stringify(item.additional_images || []);
          const isAct = item.is_active !== undefined ? (item.is_active ? 1 : 0) : (item.is_published !== undefined ? (item.is_published ? 1 : 0) : 1);
          await execute(`
            INSERT INTO projects (
              project_number, title, short_description, full_description, image_url,
              additional_images_json, tags_json, category, live_url, github_url,
              project_date, is_featured, is_published, is_active, sort_order, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.project_number || String(idx + 1).padStart(2, "0"),
            item.title || "",
            item.short_description || "",
            item.full_description || "",
            item.image_url || "",
            addImagesJson,
            tagsJson,
            item.category || "Engineering",
            item.live_url || "",
            item.github_url || "",
            item.project_date || "2024",
            item.is_featured ? 1 : 0,
            isAct,
            isAct,
            idx + 1,
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
        } else {
          const db = getSqliteDb();
          db.prepare(`
            INSERT OR REPLACE INTO page_headers (page_key, badge_text, title, highlight_word, description)
            VALUES (?, ?, ?, ?, ?)
          `).run(data.page_key, data.badge_text || "", data.title || "", data.highlight_word || "", data.description || "");
        }
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
            } else {
              const db = getSqliteDb();
              db.prepare(`
                INSERT OR REPLACE INTO page_headers (page_key, badge_text, title, highlight_word, description)
                VALUES (?, ?, ?, ?, ?)
              `).run(key, val.badge_text || "", val.title || "", val.highlight_word || "", val.description || "");
            }
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

  return { success: true, message: `Updated section: ${section}` };
}

// ==========================================
// ToolGhor Hub
// ==========================================
export async function getToolGhorContent() {
  const categories = (await queryAll("SELECT * FROM toolghor_categories ORDER BY sort_order ASC, id ASC")) || [];
  const tools = (await queryAll("SELECT * FROM toolghor_tools ORDER BY sort_order ASC, id ASC")) || [];
  const settings = (await queryOne("SELECT * FROM toolghor_settings WHERE id = 1")) || {};

  return {
    success: true,
    categories,
    tools,
    settings,
  };
}

export async function saveToolGhorTool(id, data, user = "admin") {
  const now = new Date().toISOString();

  if (id) {
    await execute(`
      UPDATE toolghor_tools SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        category_id = COALESCE(?, category_id),
        category_name = COALESCE(?, category_name),
        short_description = COALESCE(?, short_description),
        full_description = COALESCE(?, full_description),
        icon = COALESCE(?, icon),
        url = COALESCE(?, url),
        badge = COALESCE(?, badge),
        is_featured = COALESCE(?, is_featured),
        is_active = COALESCE(?, is_active),
        sort_order = COALESCE(?, sort_order),
        updated_at = ?
      WHERE id = ?
    `, [
      data.name ?? null,
      data.slug ?? null,
      data.category_id ?? null,
      data.category_name ?? null,
      data.short_description ?? null,
      data.full_description ?? null,
      data.icon ?? null,
      data.url ?? null,
      data.badge ?? null,
      data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
      data.sort_order ?? null,
      now,
      id,
    ]);
    await addActivityLog("Updated ToolGhor Tool", `Modified tool: ${data.name || id}`, "ToolGhor", user, 2);
  } else {
    await execute(`
      INSERT INTO toolghor_tools (
        category_id, category_name, name, slug, short_description, full_description,
        icon, url, badge, is_featured, is_active, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.category_id || 1,
      data.category_name || "General",
      data.name || "New Tool",
      data.slug || `tool-${Date.now()}`,
      data.short_description || "",
      data.full_description || "",
      data.icon || "wrench",
      data.url || "",
      data.badge || "",
      data.is_featured ? 1 : 0,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      data.sort_order || 99,
      now,
      now,
    ]);
    await addActivityLog("Created ToolGhor Tool", `Added new tool: ${data.name}`, "ToolGhor", user, 2);
  }
  return { success: true };
}

export async function deleteToolGhorTool(id, user = "admin") {
  await execute("DELETE FROM toolghor_tools WHERE id = ?", [id]);
  await addActivityLog("Deleted ToolGhor Tool", `Removed tool ID: ${id}`, "ToolGhor", user, 2);
  return { success: true };
}

export async function saveToolGhorCategory(id, data, user = "admin") {
  const now = new Date().toISOString();
  if (id) {
    await execute(`
      UPDATE toolghor_categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?
    `, [data.name ?? null, data.slug ?? null, data.description ?? null, data.icon ?? null, data.sort_order ?? null, id]);
  } else {
    await execute(`
      INSERT INTO toolghor_categories (name, slug, description, icon, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [data.name, data.slug, data.description || "", data.icon || "folder", data.sort_order || 99, now]);
  }
  await addActivityLog("Saved ToolGhor Category", `Category: ${data.name}`, "ToolGhor", user, 2);
  return { success: true };
}

export async function deleteToolGhorCategory(id, user = "admin") {
  await execute("DELETE FROM toolghor_categories WHERE id = ?", [id]);
  await addActivityLog("Deleted ToolGhor Category", `Removed category ID: ${id}`, "ToolGhor", user, 2);
  return { success: true };
}

export async function saveToolGhorSettings(data, user = "admin") {
  const now = new Date().toISOString();
  await execute(`
    UPDATE toolghor_settings SET
      site_title = COALESCE(?, site_title),
      tagline = COALESCE(?, tagline),
      hero_headline = COALESCE(?, hero_headline),
      hero_subheadline = COALESCE(?, hero_subheadline),
      announcement_banner = COALESCE(?, announcement_banner),
      footer_text = COALESCE(?, footer_text),
      updated_at = ?
    WHERE id = 1
  `, [
    data.site_title ?? null,
    data.tagline ?? null,
    data.hero_headline ?? null,
    data.hero_subheadline ?? null,
    data.announcement_banner ?? null,
    data.footer_text ?? null,
    now,
  ]);
  await addActivityLog("Updated ToolGhor Settings", "Saved global headlines and banners.", "ToolGhor", user, 2);
  return { success: true };
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
// Contact Inbox
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
  return (await queryAll("SELECT * FROM contact_messages ORDER BY id DESC")) || [];
}

export async function deleteContactMessage(id) {
  await execute("DELETE FROM contact_messages WHERE id = ?", [id]);
  return { success: true };
}

export async function markContactMessageRead(id, isRead = 1) {
  await execute("UPDATE contact_messages SET is_read = ? WHERE id = ?", [isRead ? 1 : 0, id]);
  return { success: true };
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
  const toolsRow = await queryOne("SELECT COUNT(*) as count FROM toolghor_tools");
  const sitesRow = await queryOne("SELECT COUNT(*) as count FROM websites");
  const unreadRow = await queryOne("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");

  const totalProjects = Number(projRow?.count || 0);
  const totalSkills = Number(skillsRow?.count || 0);
  const totalTools = Number(toolsRow?.count || 0);
  const totalWebsites = Number(sitesRow?.count || 0);
  const unreadMessages = Number(unreadRow?.count || 0);

  const recentLogs = (await queryAll("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 5")) || [];
  const websites = (await queryAll("SELECT * FROM websites ORDER BY id ASC")) || [];

  return {
    success: true,
    stats: {
      totalProjects,
      totalSkills,
      totalTools,
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
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT OR REPLACE INTO media_files (filename, original_name, mime_type, file_size, data)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename, originalName, mimeType, fileSize, data);
  }
  return { success: true, filename };
}

export async function getMediaFile(filename) {
  await ensureMediaTable();
  return await queryOne(
    "SELECT id, filename, original_name, mime_type, file_size, data, created_at FROM media_files WHERE filename = ?",
    [filename]
  );
}

