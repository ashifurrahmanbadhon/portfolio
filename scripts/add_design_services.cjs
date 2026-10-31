try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const sqlite = new DatabaseSync('portfolio.db');
const pg = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('--- Migrating SQLite ---');
  const sqliteCheck = sqlite.prepare("SELECT id, title FROM work_packages WHERE title = 'Design Services'").get();
  if (sqliteCheck) {
    console.log('SQLite already has Design Services:', sqliteCheck);
  } else {
    sqlite.prepare(`
      INSERT INTO work_packages (category, title, description, deliverables, tags, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'DESIGN',
      'Design Services',
      'All your everyday design needs in one place — emails people actually read, thumbnails that earn clicks, and posts that make your brand look serious.',
      'Email templates that look right in Gmail, Outlook & mobile\nYouTube thumbnails (1280×720) designed to earn the click\nFacebook & Instagram posts — feed + story sizes\nYour brand colors & logo used consistently everywhere',
      'HTML Email, YouTube Thumbnails, Social Posts',
      8,
      1
    );
    console.log('SQLite inserted Design Services.');
  }

  console.log('--- Migrating Neon PG ---');
  const pgRows = await pg.query("SELECT id, title FROM work_packages WHERE title = 'Design Services'");
  if (pgRows && pgRows.length > 0) {
    console.log('Neon PG already has Design Services:', pgRows);
  } else {
    await pg.query(`
      INSERT INTO work_packages (category, title, description, deliverables, tags, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'DESIGN',
      'Design Services',
      'All your everyday design needs in one place — emails people actually read, thumbnails that earn clicks, and posts that make your brand look serious.',
      'Email templates that look right in Gmail, Outlook & mobile\nYouTube thumbnails (1280×720) designed to earn the click\nFacebook & Instagram posts — feed + story sizes\nYour brand colors & logo used consistently everywhere',
      'HTML Email, YouTube Thumbnails, Social Posts',
      8,
      1
    ]);
    console.log('Neon PG inserted Design Services.');
  }

  const sCount = sqlite.prepare('SELECT COUNT(*) as c FROM work_packages').get()?.c;
  const pCount = (await pg.query('SELECT COUNT(*) as c FROM work_packages'))[0]?.c;
  console.log('Final counts: SQLite =', sCount, 'Neon PG =', pCount);
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

