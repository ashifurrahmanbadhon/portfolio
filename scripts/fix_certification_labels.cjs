/**
 * scripts/fix_certification_labels.cjs
 * Idempotent migration to update training labels, insert AI certificate,
 * and fix location to Tangail, Bangladesh in both PostgreSQL and SQLite.
 */
try { process.loadEnvFile('.env.local'); } catch (_) {}
const { execute, queryAll, queryOne, getPool } = require('../src/lib/db.js');

async function run() {
  console.log('=== Starting Part D & E Fixes ===');

  // 1. Update 3 existing certification titles to Training
  const updates = [
    {
      oldTitle: 'AutoCAD Electrical 2D & SLD Master Certification',
      newTitle: 'AutoCAD Electrical 2D & SLD Training',
    },
    {
      oldTitle: 'Substation Operations & High Voltage Safety Protocols',
      newTitle: 'Substation Operations & High Voltage Safety Training (DESCO)',
    },
    {
      oldTitle: 'GIS Spatial Data Analysis & Utility Network Management',
      newTitle: 'GIS Spatial Data Analysis & Utility Network Management Training',
    },
  ];

  for (const item of updates) {
    const existing = await queryOne('SELECT id, title FROM certifications WHERE title = ?', [item.oldTitle]);
    if (existing) {
      console.log(`Updating "${item.oldTitle}" -> "${item.newTitle}" (id: ${existing.id})`);
      await execute('UPDATE certifications SET title = ? WHERE id = ?', [item.newTitle, existing.id]);
    } else {
      console.log(`Row for "${item.oldTitle}" already updated or not found.`);
    }
  }

  // 2. Insert AI certificate if not already present
  const aiTitle = 'Certificate in Artificial Intelligence (AI)';
  const aiIssuer = 'e-Learning & Earning Ltd.';
  const existingAi = await queryOne('SELECT id FROM certifications WHERE title = ? AND issuer = ?', [aiTitle, aiIssuer]);
  if (!existingAi) {
    console.log(`Inserting active AI Certificate: "${aiTitle}" by "${aiIssuer}"`);
    await execute(
      `INSERT INTO certifications (title, issuer, year, description, is_verified, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        aiTitle,
        aiIssuer,
        '2026',
        'Certified in Artificial Intelligence — covering AI fundamentals, machine learning concepts, and hands-on use of modern AI tools to build practical, real-world solutions.',
        1,
        1,
        4,
      ]
    );
  } else {
    console.log(`AI Certificate already exists (id: ${existingAi.id}). Ensuring it is active.`);
    await execute('UPDATE certifications SET is_active = 1, is_verified = 1 WHERE id = ?', [existingAi.id]);
  }

  // 3. Update page_headers education entry
  const newEduDesc =
    'Formal degree in Electrical & Electronic Engineering complemented by on-site utility training at DESCO and CAD and GIS training.';
  const eduHeader = await queryOne("SELECT page_key, description FROM page_headers WHERE page_key = 'education'");
  if (eduHeader && eduHeader.description && eduHeader.description.includes('accredited CAD and GIS certifications')) {
    console.log('Updating page_headers education description to new training wording.');
    await execute("UPDATE page_headers SET description = ? WHERE page_key = 'education'", [newEduDesc]);
  } else {
    console.log('page_headers education description already updated or not matching old pattern.');
  }

  // 4. Update social_links location to Tangail, Bangladesh
  const socialRow = await queryOne('SELECT id, location, maps_url FROM social_links LIMIT 1');
  if (socialRow) {
    const newLocation = 'Tangail, Bangladesh';
    const newMapsUrl = 'https://maps.google.com/?q=Tangail,+Bangladesh';
    if (socialRow.location !== newLocation || socialRow.maps_url !== newMapsUrl) {
      console.log(`Updating social_links: location="${newLocation}", maps_url="${newMapsUrl}"`);
      await execute('UPDATE social_links SET location = ?, maps_url = ? WHERE id = ?', [
        newLocation,
        newMapsUrl,
        socialRow.id,
      ]);
    } else {
      console.log('social_links location already set to Tangail, Bangladesh.');
    }
  }

  // Also check contact_channels table if 'location' channel exists
  try {
    const locChannel = await queryOne("SELECT id, value FROM contact_channels WHERE channel_key = 'location'");
    if (locChannel && locChannel.value !== 'Tangail, Bangladesh') {
      console.log('Updating contact_channels location value.');
      await execute("UPDATE contact_channels SET value = ?, url = ? WHERE channel_key = 'location'", [
        'Tangail, Bangladesh',
        'https://maps.google.com/?q=Tangail,+Bangladesh',
      ]);
    }
  } catch (_) {}

  console.log('=== Finished Part D & E Fixes ===');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
