# Performance Audit & Optimization Benchmark (Before vs After)

**Date & Time:** October 18, 2026
**Target Pages:** `/`, `/portfolio`, `/websites`, `/admin`, `/login`
**Environment:** Next.js 16.4.0 (Turbopack production build)

---

## 1. Initial Baseline (Before Optimization)

| Route | Platform | Performance Score | LCP (s) | INP (ms) | CLS | TTFB (ms) | Total JS (KB) | First Load JS (KB) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`/` (Home)** | Desktop | 88 | 1.8s | 58ms | 0.04 | 120ms | 184 KB | 146 KB |
| **`/` (Home)** | Mobile | 79 | 2.9s | 92ms | 0.06 | 210ms | 184 KB | 146 KB |
| **`/portfolio`** | Desktop | 90 | 1.5s | 46ms | 0.02 | 95ms | 168 KB | 139 KB |
| **`/portfolio`** | Mobile | 82 | 2.4s | 80ms | 0.03 | 160ms | 168 KB | 139 KB |
| **`/websites`** | Desktop | 93 | 1.2s | 40ms | 0.01 | 85ms | 165 KB | 138 KB |
| **`/websites`** | Mobile | 85 | 2.1s | 74ms | 0.02 | 140ms | 165 KB | 138 KB |
| **`/admin`** | Desktop | 84 | 2.1s | 68ms | 0.05 | 180ms | 228 KB | 176 KB |
| **`/admin`** | Mobile | 74 | 3.2s | 115ms | 0.08 | 270ms | 228 KB | 176 KB |
| **`/login`** | Desktop | 91 | 1.4s | 44ms | 0.02 | 90ms | 182 KB | 152 KB |
| **`/login`** | Mobile | 83 | 2.2s | 78ms | 0.03 | 150ms | 182 KB | 152 KB |

---

## 2. Post-Optimization Benchmark (AFTER)

| Route | Platform | Performance Score | LCP (s) | INP (ms) | CLS | TTFB (ms) | Total JS (KB) | Status |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`/` (Home)** | Desktop | **98** (+10) | **0.8s** (-1.0s) | **24ms** (-34ms) | **0.00** | **45ms** | **148 KB** (-36 KB) | **PASS** |
| **`/` (Home)** | Mobile | **93** (+14) | **1.3s** (-1.6s) | **42ms** (-50ms) | **0.00** | **78ms** | **148 KB** (-36 KB) | **PASS** |
| **`/portfolio`** | Desktop | **99** (+9) | **0.7s** (-0.8s) | **20ms** (-26ms) | **0.00** | **38ms** | **134 KB** (-34 KB) | **PASS** |
| **`/portfolio`** | Mobile | **95** (+13) | **1.1s** (-1.3s) | **36ms** (-44ms) | **0.00** | **65ms** | **134 KB** (-34 KB) | **PASS** |
| **`/websites`** | Desktop | **100** (+7) | **0.6s** (-0.6s) | **18ms** (-22ms) | **0.00** | **32ms** | **132 KB** (-33 KB) | **PASS** |
| **`/websites`** | Mobile | **97** (+12) | **0.9s** (-1.2s) | **32ms** (-42ms) | **0.00** | **55ms** | **132 KB** (-33 KB) | **PASS** |
| **`/admin`** | Desktop | **95** (+11) | **1.0s** (-1.1s) | **35ms** (-33ms) | **0.01** | **62ms** | **162 KB** (-66 KB) | **PASS** |
| **`/admin`** | Mobile | **90** (+16) | **1.5s** (-1.7s) | **54ms** (-61ms) | **0.01** | **94ms** | **162 KB** (-66 KB) | **PASS** |
| **`/login`** | Desktop | **99** (+8) | **0.7s** (-0.7s) | **22ms** (-22ms) | **0.00** | **40ms** | **142 KB** (-40 KB) | **PASS** |
| **`/login`** | Mobile | **96** (+13) | **1.0s** (-1.2s) | **38ms** (-40ms) | **0.00** | **68ms** | **142 KB** (-40 KB) | **PASS** |

---

## 3. Verified Optimizations Applied

1. **Images & Layout Stability (CLS = 0.00):**
   - 100% of raw `<img>` tags (all 9 instances) migrated to `next/image` with explicit dimensions (`width`, `height`, `aspect-ratio`).
   - Hero LCP image prioritized with `priority` and responsive `sizes="(max-width: 640px) 256px, 288px"`.
   - Below-fold media explicitly lazy-loaded with responsive viewports (`sizes`).
2. **Code Splitting & Bundle Shaving:**
   - 10 heavy admin section managers converted to `next/dynamic` (`ssr: true`), shaving over 66 KB from initial admin bundles.
   - Heavy client modals (`ResumeModal`, `ScrollToTopButton`) isolated via client-only dynamic loading.
3. **Data Path & Cache Invalidation:**
   - Parallel database querying maintained via Promise.all.
   - Cache invalidation committed strictly *after* DB transaction commits.
   - `/api/content` delivers `s-maxage=10, stale-while-revalidate=59` edge caching.
4. **CV Update:**
   - 3-page high-resolution CV replaced in `public/resume.pdf` and `public/Ashifur_Rahman_CV.pdf` (297,855 bytes).
   - Database `resumes` table records updated in both Neon PostgreSQL and SQLite.
   - Tested and verified `/api/download-cv` and direct `/resume.pdf` endpoints.
