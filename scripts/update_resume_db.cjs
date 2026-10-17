try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const pg = neon(process.env.DATABASE_URL);
const sqlite = new DatabaseSync('portfolio.db');

async function updateResumes() {
  const now = new Date().toISOString();
  const size = 297855;
  const fileName = 'Ashifur_Rahman_CV.pdf';
  const fileUrl = '/resume.pdf';

  // 1. SQLite
  sqlite.prepare(`
    UPDATE resumes SET
      file_name = ?,
      file_url = ?,
      file_size = ?,
      upload_date = ?,
      is_active = 1
    WHERE id = 1
  `).run(fileName, fileUrl, size, now);
  console.log('✓ SQLite resumes updated successfully.');

  // 2. Neon PG
  await pg.query(`
    UPDATE resumes SET
      file_name = $1,
      file_url = $2,
      file_size = $3,
      upload_date = $4,
      is_active = 1
    WHERE id = 1
  `, [fileName, fileUrl, size, now]);
  console.log('✓ Neon PG resumes updated successfully.');
}

updateResumes().catch(console.error);
