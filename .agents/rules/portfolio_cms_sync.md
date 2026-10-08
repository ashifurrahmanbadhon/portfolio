# Strict Two-Way Synchronization Rule: Portfolio & Central CMS

Whenever Antigravity or any AI assistant adds, edits, or modifies anything in the portfolio (content, images, links, copy, or settings):

1. **Full Database Synchronization**:
   - Every content change must be updated in both **Neon PostgreSQL (Cloud)** and **SQLite (`portfolio.db`)**.
   - Separate tables (e.g. `hero`, `about`, `experiences`, `educations`, `skills`, `projects`, `contact_channels`, `social_links`, `homepage_cta`, `page_headers`, `resumes`) must remain dedicated, clean, and up to date.

2. **CMS Admin Parity**:
   - The CMS admin console (`src/app/admin/page.js`) must reflect the exact same state, inputs, toggles, and default values.
   - Any new feature or toggle on the public portfolio must have a corresponding control in the CMS admin console.

3. **Fallback Defaults (`portfolioDefaults.js`)**:
   - `src/lib/portfolioDefaults.js` must always be updated to match the latest portfolio content for immediate hydration, SSR, and offline safety.

4. **Instant Invalidation & Reactive Refresh**:
   - Clear and bump cache versions in `PortfolioContext.jsx` and `src/app/admin/page.js` so neither the user nor the visitor ever sees stale content.
