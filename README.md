# Campus FindIt - Production Lost & Found Portal

A secure, high-performance, transparent web platform for college students, staff, and officers to report, search, match, and recover lost campus property with a verified physical chain of custody.

---

## 🚀 Tech Stack
- **Frontend**: React 18 + Vite (Vanilla CSS Design System with Glassmorphism, Responsive Dark Mode UI)
- **Backend**: Node.js + Express.js REST API
- **Database**: SQLite with `sql.js` (Zero native compilation dependency, auto-persisted `database.sqlite` with WAL semantics and foreign key constraints)
- **Security**: `bcryptjs` password hashing, JWT HttpOnly authentication, institutional email restriction (`@campus.edu`), role-based access control (RBAC), sanitized inputs, Multer file upload validation (5MB max limit, MIME type whitelist).
- **Matching Engine**: Automated multi-factor correlation matching background job (weighted similarity across Title, Category, Color/Brand, Location Zone, Date Proximity).
- **Reports & Analytics**: Native PDF report generator (`pdfkit`) and Excel/CSV table exporter.

---

## 📂 Project Folder Structure

```
Final Project 2.0/
├── database.sqlite             # Auto-generated persistent SQLite database
├── package.json
├── vite.config.js              # Vite configuration with API proxy
├── index.html
├── public/
│   └── uploads/                # Secured file uploads directory (images & evidence PDFs)
├── src/                        # Frontend Source
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css               # Modern Glassmorphic CSS design system
│   ├── context/
│   │   ├── AuthContext.jsx     # User authentication state & session recovery
│   │   └── ToastContext.jsx    # Animated notification toasts
│   ├── components/
│   │   ├── Navbar.jsx          # Dynamic navbar with role badges & notification drawer
│   │   ├── Footer.jsx          # Office hours, security contact, FAQ link
│   │   ├── ItemCard.jsx        # Public item card with badges and actions
│   │   ├── StatusBadge.jsx     # Visual pipeline status indicator
│   │   ├── Modal.jsx           # Dynamic dialog modal
│   │   └── ProtectedRoute.jsx  # Client RBAC route guard
│   └── pages/
│       ├── LandingPage.jsx     # Public search, announcements ticker, FAQ
│       ├── LoginPage.jsx       # Auth login with quick demo shortcuts
│       ├── RegisterPage.jsx    # Institutional email registration
│       ├── ForgotPassword.jsx  # Single-use reset token flow
│       ├── StudentDashboard.jsx# Report lost/found items, my reports pipeline, my claims
│       ├── OfficerDashboard.jsx# Pending verifications, pending claims queue, suggested matches
│       ├── AdminDashboard.jsx  # User directory RBAC, dropdown CRUD, stats, PDF/Excel export
│       └── ItemDetailsPage.jsx # Item detail view & proof of ownership claim form
└── server/                     # Backend Source
    ├── index.js                # Express main server entry point
    ├── config/
    │   └── db.js               # SQLite connection & wrapper with auto disk persistence
    ├── database/
    │   ├── schema.sql          # SQL schema DDL and performance indexes
    │   └── seed.js             # Seed categories, zones, demo accounts, baseline data
    ├── middleware/
    │   ├── auth.js             # JWT & RBAC authorization middleware
    │   └── upload.js           # Multer file upload validator
    ├── routes/
    │   ├── auth.js             # Auth REST endpoints
    │   ├── items.js            # Items search, report, verify REST endpoints
    │   ├── claims.js           # Claim submission & officer review endpoints
    │   ├── matches.js          # System match recommendations & manual triggers
    │   ├── admin.js            # User directory management, CRUD, report exporters
    │   └── notifications.js    # In-app notifications feed
    ├── services/
    │   ├── auditService.js     # Audit log service
    │   ├── matchingEngine.js   # Multi-factor correlation algorithm
    │   ├── pdfService.js       # PDF report builder
    │   └── excelService.js     # CSV/Excel export builder
    └── background/
        └── matchWorker.js      # Background scheduled matching job
```

---

## 🛠️ Setup & Running Instructions

### 1. Install Dependencies
```bash
cmd /c npm install
```

### 2. Seed Database
Seeds default categories, campus zones, demo accounts per role, baseline lost/found items, and initial matches:
```bash
cmd /c npm run seed
```

### 3. Start Development Server
Starts both Express backend API (`http://localhost:5000`) and Vite frontend (`http://localhost:3000`):
```bash
cmd /c npm run dev
```

---

## 🔑 Demo Account Credentials

| Role | Institutional Email | Password | Allowed Dashboards & Permissions |
| :--- | :--- | :--- | :--- |
| **Student / Staff** | `student@campus.edu` | `Password123!` | Report Lost/Found items, My Reports Pipeline, My Claims Tracker |
| **L&F Officer** | `officer@campus.edu` | `Password123!` | Officer Queues, Locker IDs, Claim Evidence Reviews, Match Approvals |
| **Administrator** | `admin@campus.edu` | `Password123!` | User Directory RBAC, Dropdowns CRUD, Global Stats, PDF/Excel Exports |

---

## ⚡ Key Features

1. **Privacy Protection**: Physical Storage Locker IDs and sensitive reference visual markers entered on Found Items are strictly protected by server-side RBAC and are **never** rendered in public or student responses.
2. **Automated Matching Engine**: Periodically compares open lost items with found items using weighted correlation:
   $$\text{Score} = \text{Category}(30\%) + \text{Title Text Sim}(30\%) + \text{Color/Brand}(15\%) + \text{Campus Zone}(15\%) + \text{Date Proximity}(10\%)$$
3. **Audit Trail**: All administrative and officer actions (status changes, claim approvals, role updates, category CRUD) are logged to `audit_logs`.
4. **PDF & Excel Exporters**: Built-in institutional summary report downloads for administration.
