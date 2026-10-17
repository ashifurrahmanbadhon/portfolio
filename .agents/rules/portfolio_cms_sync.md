# Portfolio CMS Synchronization Flow

1. **Source of Truth**: Neon PostgreSQL (Cloud) persists all updates via dedicated per-section tables.
2. **Local Dual-Write**: SQLite (`portfolio.db`) mirrors every cloud table schema and write in real-time.
3. **Immediate Cache Invalidation**: `invalidatePortfolioContentCache()` runs after DB writes commit (~2s refresh).
4. **Code & Deployment Flow**: Local Git changes → Push to GitHub `main` → Vercel auto-deploy pipeline triggers.
5. **Admin Panel Parity**: Every admin input round-trips to DB (`PUT /api/content`) with zero local-only state.
6. **Fallback Defaults**: `src/lib/portfolioDefaults.js` stays in sync with DB for instant SSR and hydration.
7. **Drift Verification**: `node scripts/audit_sync.cjs` validates 0 drift across Neon, SQLite, and `/api/content`.
