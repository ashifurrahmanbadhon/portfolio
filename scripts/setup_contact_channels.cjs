const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function setupContactChannelsTable() {
  console.log("=== Setting up contact_channels table in Neon & SQLite ===");

  const defaultChannels = [
    {
      channel_key: 'email',
      label: 'Direct Email',
      action_text: 'Send an Email',
      value: 'ashifur.badhon@gmail.com',
      url: 'mailto:ashifur.badhon@gmail.com',
      icon: 'Mail',
      is_active: 1,
      sort_order: 1
    },
    {
      channel_key: 'phone',
      label: 'Direct Phone Call',
      action_text: 'Make a Call',
      value: '+880 1521 417284',
      url: 'tel:+8801521417284',
      icon: 'Phone',
      is_active: 1,
      sort_order: 2
    },
    {
      channel_key: 'whatsapp',
      label: 'WhatsApp Instant Chat',
      action_text: 'Start WhatsApp Chat',
      value: '+880 1521 417284',
      url: 'https://wa.me/8801521417284',
      icon: 'MessageCircle',
      is_active: 1,
      sort_order: 3
    },
    {
      channel_key: 'linkedin',
      label: 'LinkedIn Profile',
      action_text: 'Connect on LinkedIn',
      value: 'https://www.linkedin.com/in/ashifurrahmanbadhon',
      url: 'https://www.linkedin.com/in/ashifurrahmanbadhon',
      icon: 'Linkedin',
      is_active: 1,
      sort_order: 4
    },
    {
      channel_key: 'github',
      label: 'GitHub Profile',
      action_text: 'Explore GitHub Profile',
      value: 'https://github.com/ashifurrahmanbadhon',
      url: 'https://github.com/ashifurrahmanbadhon',
      icon: 'Github',
      is_active: 1,
      sort_order: 5
    },
    {
      channel_key: 'location',
      label: 'Location',
      action_text: 'View on Google Maps',
      value: 'Tangail, Dhaka, Bangladesh',
      url: 'https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh',
      icon: 'MapPin',
      is_active: 1,
      sort_order: 6
    }
  ];

  // 1. Neon PG
  try {
    await pg.query(`
      CREATE TABLE IF NOT EXISTS contact_channels (
        id SERIAL PRIMARY KEY,
        channel_key VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(100),
        action_text VARCHAR(100),
        value TEXT,
        url TEXT,
        icon VARCHAR(50),
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("[PG] Table contact_channels verified/created.");

    // Seed defaults if empty
    for (const c of defaultChannels) {
      await pg.query(`
        INSERT INTO contact_channels (channel_key, label, action_text, value, url, icon, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (channel_key) DO UPDATE SET
          label = EXCLUDED.label,
          action_text = EXCLUDED.action_text,
          value = EXCLUDED.value,
          url = EXCLUDED.url,
          icon = EXCLUDED.icon,
          is_active = COALESCE(contact_channels.is_active, EXCLUDED.is_active),
          sort_order = EXCLUDED.sort_order
      `, [c.channel_key, c.label, c.action_text, c.value, c.url, c.icon, c.is_active, c.sort_order]);
    }
    const pgRows = await pg.query(`SELECT * FROM contact_channels ORDER BY sort_order ASC`);
    console.log("[PG] contact_channels rows:", pgRows.length);
  } catch (err) {
    console.error("[PG] Error:", err.message);
  }

  // 2. SQLite
  try {
    sqlite.prepare(`
      CREATE TABLE IF NOT EXISTS contact_channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_key TEXT UNIQUE NOT NULL,
        label TEXT,
        action_text TEXT,
        value TEXT,
        url TEXT,
        icon TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 1,
        updated_at TEXT
      )
    `).run();
    console.log("[SQLite] Table contact_channels verified/created.");

    for (const c of defaultChannels) {
      sqlite.prepare(`
        INSERT INTO contact_channels (channel_key, label, action_text, value, url, icon, is_active, sort_order, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT (channel_key) DO UPDATE SET
          label = excluded.label,
          action_text = excluded.action_text,
          value = excluded.value,
          url = excluded.url,
          icon = excluded.icon,
          sort_order = excluded.sort_order
      `).run(c.channel_key, c.label, c.action_text, c.value, c.url, c.icon, c.is_active, c.sort_order);
    }
    const sqliteRows = sqlite.prepare(`SELECT * FROM contact_channels ORDER BY sort_order ASC`).all();
    console.log("[SQLite] contact_channels rows:", sqliteRows.length);
  } catch (err) {
    console.error("[SQLite] Error:", err.message);
  }
}

setupContactChannelsTable();
