# Ashifur Rahman - Unified Next.js Portfolio & Central CMS Hub

A modern, high-performance, full-stack **Next.js 16 (App Router) & React 19** portfolio platform and unified **Central CMS Hub** for **Ashifur Rahman**.

The platform combines both the visitor-facing engineering portfolio and the administrative Central CMS in a single unified repository and deployment:
- 🌐 **Public Portfolio (`/`)**: High-performance personal portfolio with 14 sections (Hero, Metrics, About, Skills Matrix, Experience, Projects, Services, Contact Inbox, CV Manager).
- 🛠️ **Central CMS Admin (`/admin`)**: Unified multi-website administration hub for Portfolio, ToolGhor, and future connected web apps.
- ⚡ **Native Full-Stack APIs (`/api/...`)**: Over 30 built-in Next.js Route Handlers powered by native SQLite (`portfolio.db`) with zero external backend processes needed.

---

## 🌟 Architecture Overview

```
portfolionext/ (Unified Full-Stack Next.js Project)
│
├── src/
│   ├── app/
│   │   ├── page.js                   <-- Public Engineering Portfolio (Visitor Homepage)
│   │   │
│   │   ├── admin/page.js             <-- Central CMS Hub Dashboard
│   │   ├── login/page.js             <-- Central Admin Login
│   │   ├── portfolio/page.js         <-- Portfolio Live CMS Editor
│   │   ├── toolghor/page.js          <-- ToolGhor Directory Manager
│   │   ├── websites/page.js          <-- Multi-Website Connectivity & Ping Monitor
│   │   ├── analytics/page.js         <-- Live Analytics Dashboard
│   │   ├── history/page.js           <-- Global Change Audit Log
│   │   ├── roles/page.js             <-- Super Admin & Permissions Manager
│   │   ├── settings/page.js          <-- 2FA, Password Reset & Security Settings
│   │   │
│   │   └── api/                      <-- Native Serverless API Route Handlers
│   │       ├── content/              (Portfolio Content API)
│   │       ├── contact/              (Direct Visitor Messages to SQLite)
│   │       ├── auth/                 (JWT Auth, PBKDF2, Google Authenticator 2FA)
│   │       ├── toolghor/             (Tools Directory & Categories)
│   │       ├── websites/             (Website Registry & Latency Ping)
│   │       └── admin/                (Uploads, Logs, System Settings)
│   │
│   ├── components/                   <-- Modern React UI Components & Modals
│   ├── context/                      <-- AuthContext (State & Session Management)
│   └── lib/
│       ├── db.js                     <-- Native SQLite Adapter (Node.js node:sqlite)
│       ├── auth.js                   <-- JWT & Security Utilities
│       └── totp.js                   <-- RFC 6238 2FA Engine
│
├── public/                           <-- Static Assets, Uploads, Images & CV
│   ├── uploads/                      <-- User Uploads (Profile photos, project images)
│   ├── Ashifur Rahman.jpg
│   └── resume.pdf
│
├── portfolio.db                      <-- Relational SQLite Database
├── vercel.json                       <-- Vercel Next.js Framework Configuration
└── package.json                      <-- Next.js 16 + React 19 + Tailwind v4
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit in your browser:
- **Public Portfolio**: [http://localhost:3000/](http://localhost:3000/)
- **Central CMS Hub**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🔐 Admin Authentication & Credentials

- **Admin Portal URL**: `/admin` (or `/login`)
- **Default Username**: `admin`
- **Default Email**: `admin@ashifurrahman.com`
- **Default Password**: `admin123`
- **Role**: `super_admin`

### Security Features:
1. **PBKDF2-HMAC-SHA256 Password Hashing**: Military-grade salted hashing.
2. **Two-Factor Authentication (2FA)**: Google Authenticator (TOTP) + Single-use Recovery Backup Codes.
3. **Brute-Force & Lockout Protection**: 15-minute temporary lockout after 5 consecutive failed attempts.
4. **JWT Sessions**: Secure JSON Web Tokens with configurable expiration.

---

## ☁️ Deployment (Vercel)

This repository is pre-configured for one-click deployment on **[Vercel](https://vercel.com)**:
1. Connect this GitHub repository (`ashifurrahmanbadhon/portfolionext`) to Vercel.
2. The included `vercel.json` ensures the framework is recognized as **Next.js**.
3. All static pages and serverless API endpoints deploy automatically.
