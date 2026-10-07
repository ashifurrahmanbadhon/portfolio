import path from "path";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), "portfolio.db");
    dbInstance = new DatabaseSync(dbPath);
  }
  return dbInstance;
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
export function addActivityLog(action, details = "", websiteName = "Central CMS", user = "admin", websiteId = null) {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO activity_logs (website_id, website_name, action, details, user, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(websiteId, websiteName, action, details, user, now);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// ==========================================
// Admin & Auth Helpers
// ==========================================
export function getAdminByIdentifier(identifier) {
  if (!identifier) return null;
  const db = getDb();
  const clean = identifier.trim().toLowerCase();
  const stmt = db.prepare(`
    SELECT * FROM admins
    WHERE LOWER(username) = ? OR LOWER(email) = ?
    LIMIT 1
  `);
  return stmt.get(clean, clean) || null;
}

export function getAdminById(id) {
  if (!id) return null;
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM admins WHERE id = ? LIMIT 1`);
  return stmt.get(id) || null;
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

export function recordFailedLogin(adminId, maxAttempts = 5, lockoutMinutes = 15) {
  const db = getDb();
  const admin = getAdminById(adminId);
  if (!admin) return 1;

  const currentAttempts = (admin.failed_login_attempts || 0) + 1;
  const now = new Date();
  let lockedUntil = null;

  if (currentAttempts >= maxAttempts) {
    lockedUntil = new Date(now.getTime() + lockoutMinutes * 60000).toISOString();
  }

  const stmt = db.prepare(`
    UPDATE admins
    SET failed_login_attempts = ?, locked_until = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(currentAttempts, lockedUntil, now.toISOString(), adminId);
  return currentAttempts;
}

export function recordSuccessfulLogin(adminId) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE admins
    SET failed_login_attempts = 0, locked_until = NULL, last_login_at = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(now, now, adminId);
}

export function updateAdminProfile(adminId, { fullName, email, avatar, currentPassword, newPassword }) {
  const db = getDb();
  const admin = getAdminById(adminId);
  if (!admin) throw new Error("Admin not found");

  if (newPassword) {
    if (!currentPassword || !verifyPassword(currentPassword, admin.password_hash, admin.salt)) {
      throw new Error("Current password verification failed");
    }
    const { hash, salt } = hashPassword(newPassword);
    const stmt = db.prepare(`
      UPDATE admins
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          password_hash = ?,
          salt = ?,
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(fullName || null, email || null, hash, salt, new Date().toISOString(), adminId);
  } else {
    const stmt = db.prepare(`
      UPDATE admins
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(fullName || null, email || null, new Date().toISOString(), adminId);
  }
}

// ==========================================
// Portfolio Content Query (Full Structured Object)
// ==========================================
export function getPortfolioContent() {
  const db = getDb();

  // 1. Hero
  const hero = db.prepare("SELECT * FROM hero WHERE id = 1").get() || {};

  // 2. About
  const about = db.prepare("SELECT * FROM about WHERE id = 1").get() || {};

  // 3. Highlights
  const highlights = db.prepare("SELECT * FROM highlights ORDER BY sort_order ASC, id ASC").all() || [];

  // 4. Experiences
  const expRows = db.prepare("SELECT * FROM experiences ORDER BY sort_order ASC, id ASC").all() || [];
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
  const educations = db.prepare("SELECT * FROM educations ORDER BY sort_order ASC, id ASC").all() || [];

  // 6. Skills
  const skills = db.prepare("SELECT * FROM skills ORDER BY category ASC, sort_order ASC, id ASC").all() || [];
  const grouped_skills = {};
  for (const s of skills) {
    if (!grouped_skills[s.category]) {
      grouped_skills[s.category] = [];
    }
    grouped_skills[s.category].push(s);
  }

  // 7. Skill Badges
  const skill_badges = db.prepare("SELECT * FROM skill_badges ORDER BY sort_order ASC, id ASC").all() || [];

  // 8. Projects
  const projRows = db.prepare("SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, id ASC").all() || [];
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
  const services = db.prepare("SELECT * FROM services ORDER BY sort_order ASC, id ASC").all() || [];

  // 10. Social Links
  const social_links = db.prepare("SELECT * FROM social_links WHERE id = 1").get() || {};

  // 11. Resume
  const resume = db.prepare("SELECT * FROM resumes WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get() || {};

  // 12. Site Settings
  const site_settings = db.prepare("SELECT * FROM site_settings WHERE id = 1").get() || {};

  return {
    success: true,
    hero,
    about,
    highlights,
    experiences,
    educations,
    skills,
    grouped_skills,
    skill_badges,
    projects,
    services,
    social_links,
    resume,
    site_settings,
  };
}

// ==========================================
// Portfolio Section Updates
// ==========================================
export function updatePortfolioSection(section, data, user = "admin") {
  const db = getDb();
  const now = new Date().toISOString();

  switch (section) {
    case "hero": {
      const stmt = db.prepare(`
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
      `);
      stmt.run(
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
        now
      );
      addActivityLog("Updated Hero Section", "Modified Hero headline, bio, or profile photo.", "Portfolio", user, 1);
      break;
    }

    case "about": {
      const stmt = db.prepare(`
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
          updated_at = ?
        WHERE id = 1
      `);
      stmt.run(
        data.subtitle ?? null,
        data.title ?? null,
        data.description1 ?? null,
        data.description2 ?? null,
        data.profile_image ?? null,
        data.focus1_title ?? null,
        data.focus1_text ?? null,
        data.focus2_title ?? null,
        data.focus2_text ?? null,
        now
      );
      addActivityLog("Updated About Section", "Modified bio descriptions and engineering focus badges.", "Portfolio", user, 1);
      break;
    }

    case "highlights": {
      if (Array.isArray(data.items)) {
        db.prepare("DELETE FROM highlights").run();
        const insertStmt = db.prepare(`
          INSERT INTO highlights (metric_value, metric_label, metric_subtext, sort_order)
          VALUES (?, ?, ?, ?)
        `);
        data.items.forEach((item, idx) => {
          insertStmt.run(item.metric_value || "", item.metric_label || "", item.metric_subtext || "", idx + 1);
        });
        addActivityLog("Updated Highlights Bar", `Saved ${data.items.length} metrics.`, "Portfolio", user, 1);
      }
      break;
    }

    case "experiences": {
      if (Array.isArray(data.items)) {
        db.prepare("DELETE FROM experiences").run();
        const insertStmt = db.prepare(`
          INSERT INTO experiences (
            role, organization, period, start_date, end_date, is_current,
            description_points, location, website, sort_order, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.items.forEach((item, idx) => {
          const pointsJson = JSON.stringify(item.description_points || item.points || []);
          insertStmt.run(
            item.role || "",
            item.organization || "",
            item.period || "",
            item.start_date || "",
            item.end_date || "",
            item.is_current ? 1 : 0,
            pointsJson,
            item.location || "",
            item.website || "",
            idx + 1,
            now
          );
        });
        addActivityLog("Updated Experience Timeline", `Saved ${data.items.length} work positions.`, "Portfolio", user, 1);
      }
      break;
    }

    case "educations": {
      if (Array.isArray(data.items)) {
        db.prepare("DELETE FROM educations").run();
        const insertStmt = db.prepare(`
          INSERT INTO educations (degree, institution, subject, start_year, end_year, result, badge_text, description, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.items.forEach((item, idx) => {
          insertStmt.run(
            item.degree || "",
            item.institution || "",
            item.subject || "",
            item.start_year || "",
            item.end_year || "",
            item.result || "",
            item.badge_text || "",
            item.description || "",
            idx + 1,
            now
          );
        });
        addActivityLog("Updated Education Entries", `Saved ${data.items.length} degrees/certifications.`, "Portfolio", user, 1);
      }
      break;
    }

    case "skills": {
      if (Array.isArray(data.items)) {
        db.prepare("DELETE FROM skills").run();
        const insertStmt = db.prepare(`
          INSERT INTO skills (category, name, level, icon, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `);
        data.items.forEach((item, idx) => {
          insertStmt.run(item.category || "General", item.name || "", item.level || 80, item.icon || "", idx + 1);
        });
        addActivityLog("Updated Skills Matrix", `Saved ${data.items.length} technical skills.`, "Portfolio", user, 1);
      }
      break;
    }

    case "projects": {
      if (Array.isArray(data.items)) {
        db.prepare("DELETE FROM projects").run();
        const insertStmt = db.prepare(`
          INSERT INTO projects (
            project_number, title, short_description, full_description, image_url,
            additional_images_json, tags_json, category, live_url, github_url,
            project_date, is_featured, is_published, sort_order, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.items.forEach((item, idx) => {
          const tagsJson = JSON.stringify(item.tags || []);
          const addImagesJson = JSON.stringify(item.additional_images || []);
          insertStmt.run(
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
            item.is_published !== undefined ? (item.is_published ? 1 : 0) : 1,
            idx + 1,
            now
          );
        });
        addActivityLog("Updated Projects Portfolio", `Saved ${data.items.length} projects.`, "Portfolio", user, 1);
      }
      break;
    }

    case "social_links":
    case "social": {
      const stmt = db.prepare(`
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
      `);
      stmt.run(
        data.email ?? null,
        data.phone ?? null,
        data.whatsapp ?? null,
        data.linkedin ?? null,
        data.github ?? null,
        data.facebook ?? null,
        data.location ?? null,
        data.maps_url ?? null,
        now
      );
      addActivityLog("Updated Contact & Social Details", "Modified phone, email, WhatsApp, or location.", "Portfolio", user, 1);
      break;
    }

    case "site_settings":
    case "settings": {
      const stmt = db.prepare(`
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
      `);
      stmt.run(
        data.site_title ?? null,
        data.brand_logo ?? null,
        data.favicon_url ?? null,
        data.meta_description ?? null,
        data.og_image_url ?? null,
        data.footer_brand ?? null,
        data.footer_copyright ?? null,
        now
      );
      addActivityLog("Updated Site Brand & Settings", "Modified site title, brand logo, or meta description.", "Portfolio", user, 1);
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
export function getToolGhorContent() {
  const db = getDb();
  const categories = db.prepare("SELECT * FROM toolghor_categories ORDER BY sort_order ASC, id ASC").all() || [];
  const tools = db.prepare("SELECT * FROM toolghor_tools ORDER BY sort_order ASC, id ASC").all() || [];
  const settings = db.prepare("SELECT * FROM toolghor_settings WHERE id = 1").get() || {};

  return {
    success: true,
    categories,
    tools,
    settings,
  };
}

export function saveToolGhorTool(id, data, user = "admin") {
  const db = getDb();
  const now = new Date().toISOString();

  if (id) {
    const stmt = db.prepare(`
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
    `);
    stmt.run(
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
      id
    );
    addActivityLog("Updated ToolGhor Tool", `Modified tool: ${data.name || id}`, "ToolGhor", user, 2);
  } else {
    const stmt = db.prepare(`
      INSERT INTO toolghor_tools (
        category_id, category_name, name, slug, short_description, full_description,
        icon, url, badge, is_featured, is_active, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
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
      now
    );
    addActivityLog("Created ToolGhor Tool", `Added new tool: ${data.name}`, "ToolGhor", user, 2);
  }
  return { success: true };
}

export function deleteToolGhorTool(id, user = "admin") {
  const db = getDb();
  db.prepare("DELETE FROM toolghor_tools WHERE id = ?").run(id);
  addActivityLog("Deleted ToolGhor Tool", `Removed tool ID: ${id}`, "ToolGhor", user, 2);
  return { success: true };
}

export function saveToolGhorCategory(id, data, user = "admin") {
  const db = getDb();
  const now = new Date().toISOString();
  if (id) {
    db.prepare(`
      UPDATE toolghor_categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?
    `).run(data.name ?? null, data.slug ?? null, data.description ?? null, data.icon ?? null, data.sort_order ?? null, id);
  } else {
    db.prepare(`
      INSERT INTO toolghor_categories (name, slug, description, icon, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.name, data.slug, data.description || "", data.icon || "folder", data.sort_order || 99, now);
  }
  addActivityLog("Saved ToolGhor Category", `Category: ${data.name}`, "ToolGhor", user, 2);
  return { success: true };
}

export function deleteToolGhorCategory(id, user = "admin") {
  const db = getDb();
  db.prepare("DELETE FROM toolghor_categories WHERE id = ?").run(id);
  addActivityLog("Deleted ToolGhor Category", `Removed category ID: ${id}`, "ToolGhor", user, 2);
  return { success: true };
}

export function saveToolGhorSettings(data, user = "admin") {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE toolghor_settings SET
      site_title = COALESCE(?, site_title),
      tagline = COALESCE(?, tagline),
      hero_headline = COALESCE(?, hero_headline),
      hero_subheadline = COALESCE(?, hero_subheadline),
      announcement_banner = COALESCE(?, announcement_banner),
      footer_text = COALESCE(?, footer_text),
      updated_at = ?
    WHERE id = 1
  `).run(
    data.site_title ?? null,
    data.tagline ?? null,
    data.hero_headline ?? null,
    data.hero_subheadline ?? null,
    data.announcement_banner ?? null,
    data.footer_text ?? null,
    now
  );
  addActivityLog("Updated ToolGhor Settings", "Saved global headlines and banners.", "ToolGhor", user, 2);
  return { success: true };
}

// ==========================================
// Central Websites & Multi-Site Directory
// ==========================================
export function getWebsites() {
  const db = getDb();
  return db.prepare("SELECT * FROM websites ORDER BY id ASC").all() || [];
}

export function saveWebsite(id, data, user = "admin") {
  const db = getDb();
  const now = new Date().toISOString();

  if (id) {
    db.prepare(`
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
    `).run(
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
      id
    );
    addActivityLog("Updated Website Registration", `Modified website: ${data.name || id}`, data.name || "Websites", user, id);
  } else {
    db.prepare(`
      INSERT INTO websites (
        name, slug, url, cms_url, description, website_type, cms_type,
        status, connection_status, logo, api_key, settings_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)
    `).run(
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
      now
    );
    addActivityLog("Registered New Website", `Connected website: ${data.name}`, data.name, user);
  }
  return { success: true };
}

export function deleteWebsite(id, user = "admin") {
  const db = getDb();
  const site = db.prepare("SELECT name FROM websites WHERE id = ?").get(id);
  db.prepare("DELETE FROM websites WHERE id = ?").run(id);
  addActivityLog("Disconnected Website", `Removed site: ${site?.name || id}`, "Websites", user, id);
  return { success: true };
}

// ==========================================
// Contact Inbox
// ==========================================
export function addContactMessage(name, email, subject, message, ip = "") {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO contact_messages (name, email, subject, message, is_read, ip_address, created_at)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(name, email, subject || "", message, ip, now);
  addActivityLog("New Contact Inquiry", `Message received from ${name} (${email})`, "Portfolio", "Visitor", 1);
  return { success: true };
}

export function getContactMessages() {
  const db = getDb();
  return db.prepare("SELECT * FROM contact_messages ORDER BY id DESC").all() || [];
}

// ==========================================
// Activity & Audit Logs
// ==========================================
export function getActivityLogs({ limit = 50, category = "all", search = "" } = {}) {
  const db = getDb();
  let query = "SELECT * FROM activity_logs";
  const params = [];
  const where = [];

  if (category && category !== "all") {
    where.push("website_name LIKE ?");
    params.push(`%${category}%`);
  }
  if (search) {
    where.push("(action LIKE ? OR details LIKE ? OR user LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
  query += " ORDER BY id DESC LIMIT ?";
  params.push(Number(limit) || 50);

  return db.prepare(query).all(...params) || [];
}

// ==========================================
// Central Dashboard Overview & Metrics
// ==========================================
export function getCentralDashboard() {
  const db = getDb();
  const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get()?.count || 0;
  const totalSkills = db.prepare("SELECT COUNT(*) as count FROM skills").get()?.count || 0;
  const totalTools = db.prepare("SELECT COUNT(*) as count FROM toolghor_tools").get()?.count || 0;
  const totalWebsites = db.prepare("SELECT COUNT(*) as count FROM websites").get()?.count || 0;
  const unreadMessages = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0").get()?.count || 0;
  const recentLogs = db.prepare("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 5").all() || [];
  const websites = db.prepare("SELECT * FROM websites ORDER BY id ASC").all() || [];

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
export function getSystemSettings() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM central_system_settings").all() || [];
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

export function saveSystemSettings(category, data, user = "admin") {
  const db = getDb();
  const now = new Date().toISOString();
  const jsonStr = JSON.stringify(data);
  db.prepare(`
    INSERT INTO central_system_settings (category, settings_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(category) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at = excluded.updated_at
  `).run(category, jsonStr, now);
  addActivityLog("Updated System Settings", `Modified category: ${category}`, "Central CMS", user);
  return { success: true };
}

// ==========================================
// User Accounts & Roles
// ==========================================
export function getUsers() {
  const db = getDb();
  const rows = db.prepare("SELECT id, username, email, full_name, role, is_active, last_login_at, permissions_json, assigned_websites_json, two_factor_enabled, created_at FROM admins").all() || [];
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
