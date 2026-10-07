# Ashifur Rahman - Central CMS & Multi-Website Management Hub

A modern, high-performance, full-stack **Central CMS Hub** and portfolio platform for **Ashifur Rahman**.
The system serves as a single unified admin panel that centrally controls multiple websites:
- 🌐 **Primary Portfolio**: Full-stack dynamic portfolio with live editing of all 14 sections.
- 🛠️ **ToolGhor**: Modern web application tools directory, categories, and settings manager.
- 🚀 **Future Websites**: Extensible registry to connect, monitor, ping, and manage upcoming web apps and content modules.

With the built-in Central CMS Admin Panel, **all website content can be updated dynamically from a single browser login without editing any code.**

---

## 🌟 Central CMS Architecture

```
Central CMS Hub (Single Admin Login)
│
├── 🌐 Portfolio CMS (ID: 1)
│   ├── Overview & Metrics
│   ├── Hero & Bio
│   ├── About & Engineering Focus
│   ├── Experience Timeline
│   ├── Education & Degrees
│   ├── Skills Matrix
│   ├── Projects & Case Studies
│   ├── Services & Focus Cards
│   ├── Contact Messages Inbox
│   ├── CV / Resume Manager
│   └── Social & Site Settings
│
├── 🛠️ ToolGhor CMS (ID: 2)
│   ├── Tools Directory (CRUD, icons, URLs, badges, featured)
│   ├── Categories Manager (Slug, icons, ordering)
│   ├── Homepage Content & Hero Copy
│   ├── Global ToolGhor Settings
│   └── Public REST API (`/api/toolghor/content`)
│
└── 🚀 Future Websites & Modules
    ├── Multi-Website Directory (Status, Types, URLs)
    ├── Live Ping & Latency Connectivity Checker
    ├── Custom Content Modules (`/api/admin/websites/:id/modules`)
    ├── Global Activity Audit Stream
    └── Public Content by Slug (`/api/websites/:slug/content`)
```

1. **Secure Admin Authentication**: JWT-based authentication with military-grade PBKDF2 password hashing (SHA-256) at `/admin`.
2. **Interactive Admin Dashboard**: Quick stats on Total Projects, Skills, Experiences, Education, and Unread Contact Messages.
3. **Hero Section Management**: Real-time updates for Name, Title, Availability Badge, Short Bio, CTAs, and Profile Photo upload with live preview.
4. **About Section Management**: Edit biography paragraphs, vision headlines, and key engineering focus badges.
5. **Key Highlights / Metrics Bar**: Easily modify stats like "B.Sc.", "15+ Projects", "100% Safety Compliance", etc.
6. **Work Experience Timeline**: Full CRUD (Add, Edit, Delete, Reorder with Up/Down buttons) with multi-bullet accomplishments and active job toggle.
7. **Education & Certifications**: Manage degree titles, institutions, passing years, CGPA/results, and coursework details.
8. **Technical Skills Matrix**: Manage skills by category, level sliders (0–100%), icons, plus quick skill badges.
9. **Projects & Case Studies**: Full CRUD for projects with tags, category, project numbers, live URLs, GitHub URLs, Featured toggle, and Publish/Draft toggle.
10. **Services / Focus Cards**: Manage core electrical engineering services and layout competencies.
11. **Contact Inquiries Inbox**: Contact messages sent by visitors are saved in the SQLite database with read/unread statuses and direct email reply buttons.
12. **CV / Resume Manager**: Upload, replace, preview, and download official PDF resumes directly through the admin panel.
13. **Social & Contact Details**: Update direct phone, WhatsApp instant chat link, email, LinkedIn, GitHub, and Google Maps location.
14. **Site Settings & SEO**: Customize Page Title, Navbar Brand Logo, Favicon, OpenGraph meta image, and footer copyright text.

---

## 📁 Architecture & File Overview

| File | Description |
|---|---|
| [`index.html`](./index.html) | **Public Portfolio Website** — 100% identical design and styling, connected dynamically to CMS API (`/api/content`) with automatic offline fallback. |
| [`admin.html`](./admin.html) | **Admin Control Panel** — Clean, modern single-page administration app accessible at `/admin`. |
| [`server.py`](./server.py) | **Python REST API & File Server** — Full backend supporting JWT auth, SQLite queries, image/file uploads, and static file delivery. |
| [`db.py`](./db.py) | **SQLite Database Management** — Handles 14 structured tables, password hashing, and auto-seeding initial portfolio data. |
| [`create_admin.py`](./create_admin.py) | **Admin Account Utility** — Command-line script to create or reset admin credentials anytime. |
| [`portfolio.db`](./portfolio.db) | **SQLite Database File** — Local relational database storing all portfolio content and messages. |
| [`start_cms.bat`](./start_cms.bat) | **Windows Launcher** — Double-click to start the server on `http://localhost:5000` and open the browser. |
| [`netlify.toml`](./netlify.toml) & [`_redirects`](./_redirects) | **Netlify Configuration** — Sets up routing for `/admin` and static asset headers. |
| `uploads/` | Directory where uploaded project images, profile photos, and new resumes are safely stored. |

---

## 🚀 How to Run Locally

### Option 1: One-Click Windows Batch Launcher
Double click [`start_cms.bat`](./start_cms.bat) or [`start_website.bat`](./start_website.bat).
The server will start and automatically open `http://localhost:5000/`.

### Option 2: Command Line (Python)
Ensure Python 3 is installed:
```bash
python server.py
```
Then visit:
- **Public Portfolio**: [http://localhost:5000/](http://localhost:5000/)
- **Admin CMS Panel**: [http://localhost:5000/admin](http://localhost:5000/admin)

---

## 🔐 Central Admin Authentication & Credentials

- **Admin Portal URL**: `http://localhost:5000/admin`
- **Username**: `admin`
- **Email**: `admin@ashifurrahman.com` (configurable via `ADMIN_EMAIL`)
- **Default Password**: `admin123`
- **Role**: `super_admin` (Full privileges across Central Dashboard, Portfolio, ToolGhor, and all connected sites)

### Security Features:
1. **Multi-Identifier Login**: Sign in with either username or registered email.
2. **Brute-Force & Lockout Protection**: Automatic 15-minute account lockout after 5 consecutive failed login attempts with attempt tracking warnings.
3. **Persistent Sessions**: "Remember me" option creates secure 30-day JWT sessions (regular session: 24 hours).
4. **Account Recovery**: Token-based password recovery via `/api/auth/forgot-password` and `/api/auth/reset-password`.
5. **Session Expiry Interception**: Automatic client-side and server-side token validation; expired sessions gracefully redirect to login.
6. **Future-Ready Role Architecture**: Extensible role model (`super_admin`, `admin`, `editor`) with granular `permissions` and `assigned_websites`.

### Environment Variables:
| Variable | Description | Default |
|---|---|---|
| `JWT_SECRET` | Cryptographic secret for signing JWT session tokens | Secure pre-configured secret |
| `ADMIN_EMAIL` | Default email associated with the Super Admin | `admin@ashifurrahman.com` |
| `PORT` | Local web server port | `5000` |
| `SESSION_EXPIRY_HOURS` | Standard session duration in hours | `24` |
| `REMEMBER_EXPIRY_DAYS` | Persistent session duration with "Remember Me" | `30` |
| `MAX_LOGIN_ATTEMPTS` | Maximum failed logins before temporary lockout | `5` |
| `LOCKOUT_MINUTES` | Lockout duration in minutes | `15` |

---

## ☁️ Production Deployment (Netlify & Cloud)

### 1. Static Frontend on Netlify
1. Connect this GitHub repository to [Netlify](https://www.netlify.com/).
2. Set Build command to empty and Publish directory to `.` (root).
3. The included `netlify.toml` and `_redirects` files ensure that `/admin` routes directly to the admin panel.

### 2. Full-Stack Backend Deployment
For live backend API persistence (saving changes to a remote database):
1. Deploy `server.py` to **Render.com**, **Railway.app**, or **Fly.io** (select Python service, set start command to `python server.py`).
2. Add environment variable `PORT=5000` and `JWT_SECRET=your_custom_secret_key`.
3. Set your custom domain or backend URL in Netlify redirects or environment variables.
