const { DatabaseSync } = require('node:sqlite');
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const sql = neon(databaseUrl);

const sqlite = new DatabaseSync('portfolio.db');

async function migrate() {
  console.log('--- Starting Migration from SQLite to Neon PostgreSQL ---');

  // 1. Table Definitions for PostgreSQL
  const tableSchemas = [
    {
      name: 'admins',
      create: `
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          email VARCHAR(255),
          full_name VARCHAR(255) DEFAULT 'Super Admin',
          role VARCHAR(100) DEFAULT 'super_admin',
          is_active INTEGER DEFAULT 1,
          failed_login_attempts INTEGER DEFAULT 0,
          locked_until TEXT,
          last_login_at TEXT,
          permissions_json TEXT DEFAULT '["*"]',
          assigned_websites_json TEXT DEFAULT '["*"]',
          phone VARCHAR(50) DEFAULT '01521417284',
          two_factor_enabled INTEGER DEFAULT 0,
          totp_secret TEXT,
          totp_created_at TEXT,
          failed_2fa_attempts INTEGER DEFAULT 0,
          locked_2fa_until TEXT
        );
      `
    },
    {
      name: 'hero',
      create: `
        CREATE TABLE IF NOT EXISTS hero (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'about',
      create: `
        CREATE TABLE IF NOT EXISTS about (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'highlights',
      create: `
        CREATE TABLE IF NOT EXISTS highlights (
          id SERIAL PRIMARY KEY,
          metric_value TEXT NOT NULL,
          metric_label TEXT NOT NULL,
          metric_subtext TEXT,
          sort_order INTEGER DEFAULT 0
        );
      `
    },
    {
      name: 'experiences',
      create: `
        CREATE TABLE IF NOT EXISTS experiences (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'educations',
      create: `
        CREATE TABLE IF NOT EXISTS educations (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'skills',
      create: `
        CREATE TABLE IF NOT EXISTS skills (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          level INTEGER NOT NULL DEFAULT 80,
          icon TEXT,
          sort_order INTEGER DEFAULT 0
        );
      `
    },
    {
      name: 'skill_badges',
      create: `
        CREATE TABLE IF NOT EXISTS skill_badges (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0
        );
      `
    },
    {
      name: 'projects',
      create: `
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'services',
      create: `
        CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          sort_order INTEGER DEFAULT 0
        );
      `
    },
    {
      name: 'social_links',
      create: `
        CREATE TABLE IF NOT EXISTS social_links (
          id SERIAL PRIMARY KEY,
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
      `
    },
    {
      name: 'resumes',
      create: `
        CREATE TABLE IF NOT EXISTS resumes (
          id SERIAL PRIMARY KEY,
          file_name TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER DEFAULT 0,
          upload_date TEXT,
          is_active INTEGER DEFAULT 1
        );
      `
    },
    {
      name: 'contact_messages',
      create: `
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT,
          message TEXT NOT NULL,
          is_read INTEGER DEFAULT 0,
          ip_address TEXT,
          created_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'site_settings',
      create: `
        CREATE TABLE IF NOT EXISTS site_settings (
          id SERIAL PRIMARY KEY,
          site_title TEXT NOT NULL,
          brand_logo TEXT NOT NULL,
          favicon_url TEXT,
          meta_description TEXT,
          og_image_url TEXT,
          footer_brand TEXT,
          footer_copyright TEXT,
          updated_at TEXT
        );
      `
    },
    {
      name: 'websites',
      create: `
        CREATE TABLE IF NOT EXISTS websites (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'activity_logs',
      create: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          website_id INTEGER,
          website_name TEXT,
          action TEXT NOT NULL,
          details TEXT,
          "user" TEXT DEFAULT 'admin',
          created_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'toolghor_categories',
      create: `
        CREATE TABLE IF NOT EXISTS toolghor_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          icon TEXT DEFAULT 'folder',
          sort_order INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'toolghor_tools',
      create: `
        CREATE TABLE IF NOT EXISTS toolghor_tools (
          id SERIAL PRIMARY KEY,
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
        );
      `
    },
    {
      name: 'toolghor_settings',
      create: `
        CREATE TABLE IF NOT EXISTS toolghor_settings (
          id SERIAL PRIMARY KEY,
          site_title TEXT NOT NULL,
          tagline TEXT,
          hero_headline TEXT,
          hero_subheadline TEXT,
          announcement_banner TEXT,
          footer_text TEXT,
          updated_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'website_content_modules',
      create: `
        CREATE TABLE IF NOT EXISTS website_content_modules (
          id SERIAL PRIMARY KEY,
          website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
          module_key TEXT NOT NULL,
          module_title TEXT NOT NULL,
          content_json TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'password_resets',
      create: `
        CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          identifier TEXT NOT NULL,
          token_hash TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'central_system_settings',
      create: `
        CREATE TABLE IF NOT EXISTS central_system_settings (
          category VARCHAR(100) PRIMARY KEY,
          settings_json TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'admin_recovery_codes',
      create: `
        CREATE TABLE IF NOT EXISTS admin_recovery_codes (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          code_hash TEXT NOT NULL,
          used INTEGER DEFAULT 0,
          used_at TEXT,
          created_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'admin_sms_otps',
      create: `
        CREATE TABLE IF NOT EXISTS admin_sms_otps (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          challenge_token_hash TEXT NOT NULL,
          otp_hash TEXT NOT NULL,
          phone TEXT NOT NULL,
          attempts INTEGER DEFAULT 0,
          max_attempts INTEGER DEFAULT 3,
          expires_at TEXT NOT NULL,
          used INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `
    },
    {
      name: 'admin_trusted_devices',
      create: `
        CREATE TABLE IF NOT EXISTS admin_trusted_devices (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          device_token_hash TEXT NOT NULL,
          device_name TEXT,
          ip_address TEXT,
          user_agent TEXT,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `
    }
  ];

  for (const table of tableSchemas) {
    console.log(`Creating table "${table.name}" if not exists...`);
    await sql.query(table.create);
  }

  // 2. Migrate Data Table by Table
  for (const table of tableSchemas) {
    const rows = sqlite.prepare(`SELECT * FROM "${table.name}"`).all();
    console.log(`Migrating ${rows.length} rows for table "${table.name}"...`);
    if (rows.length === 0) continue;

    // Check existing count in Postgres
    const existingCountRes = await sql.query(`SELECT count(*)::int as count FROM "${table.name}"`);
    if (existingCountRes[0] && existingCountRes[0].count > 0) {
      console.log(`Table "${table.name}" already has ${existingCountRes[0].count} rows. Clearing to ensure fresh sync...`);
      await sql.query(`TRUNCATE TABLE "${table.name}" CASCADE`);
    }

    // Insert rows
    for (const row of rows) {
      const keys = Object.keys(row);
      const quotedCols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map(k => row[k]);

      const insertQuery = `INSERT INTO "${table.name}" (${quotedCols}) VALUES (${placeholders})`;
      await sql.query(insertQuery, values);
    }

    // Reset sequence if table has serial 'id'
    try {
      await sql.query(`SELECT setval(pg_get_serial_sequence('"${table.name}"', 'id'), coalesce(max(id), 1), max(id) IS NOT NULL) FROM "${table.name}"`);
    } catch (e) {
      // Ignore if no serial sequence
    }
    console.log(`✓ Table "${table.name}" migrated successfully.`);
  }

  console.log('--- Migration Finished Successfully! ---');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
