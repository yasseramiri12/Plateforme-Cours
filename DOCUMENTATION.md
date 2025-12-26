# 📚 Plateforme de Cours - Complete Documentation

## 📖 Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Backend API](#backend-api)
4. [Frontend](#frontend)
5. [Static Pages (Vanilla JS)](#static-pages)
6. [Database Schema](#database-schema)
7. [Authentication & Authorization](#authentication)
8. [Setup & Installation](#setup)
9. [Usage Guide](#usage-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**Plateforme de Cours** is a learning management system (LMS) built with:
- **Backend**: Laravel 11 (PHP)
- **Frontend**: React 18 + Inertia.js + Tailwind CSS
- **Static Pages**: Vanilla JavaScript (no dependencies)
- **Authentication**: Laravel Sanctum (Session + Bearer Token)
- **Database**: MySQL/SQLite
- **Asset Bundler**: Vite

### Key Features
- Student dashboard with course management
- Course viewing and document downloads
- Calendar with course schedules
- PDF/Video downloads
- Admin notifications
- Group-based access control
- Responsive design (mobile-first)

---

## Project Architecture

### Directory Structure

```
plateforme-cours/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── EtudiantCoursController.php
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── Middleware/
│   │   │   ├── HandleCors.php
│   │   │   └── ...
│   │   └── Requests/
│   └── Models/
│       ├── Cour.php
│       ├── Etudiant.php
│       ├── Groupe.php
│       ├── Module.php
│       ├── Professeur.php
│       ├── Filiere.php
│       └── User.php
├── public/
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── build/
│   └── storage/
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   ├── Etudiant/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Courses.jsx
│   │   │   │   ├── Calendar.jsx
│   │   │   │   ├── DownloadPDFs.jsx
│   │   │   │   ├── DownloadVideos.jsx
│   │   │   │   └── StudentLayout.jsx
│   │   │   └── ...
│   │   ├── axiosConfig.js
│   │   └── app.jsx
│   ├── static/
│   │   ├── dashboard.html (backup)
│   │   └── dashboard.js (backup)
│   └── css/
├── routes/
│   ├── api.php
│   ├── web.php
│   └── auth.php
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── tests/
├── config/
├── storage/
└── vendor/

```

### Tech Stack Layers

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Inertia)          │
│  - Dashboard, Courses, Calendar, Downloads  │
└──────────────┬──────────────────────────────┘
               │ HTTP + Inertia Props
┌──────────────▼──────────────────────────────┐
│  Middleware (CORS, Auth, Rate Limiting)     │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  API Routes & Controllers                   │
│  - /api/etudiant/mes-cours                  │
│  - /api/etudiant/calendar                   │
│  - /api/etudiant/cours/{id}/download        │
└──────────────┬──────────────────────────────┘
               │ Eloquent ORM
┌──────────────▼──────────────────────────────┐
│         Database Layer                      │
│  - MySQL Tables (cours, etudiants, etc)     │
└─────────────────────────────────────────────┘
```

---

## Backend API

### API Endpoints (Protected)

All endpoints require **Bearer Token** authentication or **Laravel Session**.

#### 1. Get Student's Courses
```
GET /api/etudiant/mes-cours
```

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

**Response:**
```json
{
  "data": [
    {
      "id_cours": 1,
      "titre": "Introduction à React",
      "description": "Cours sur React 18",
      "type_document": "COURS",
      "fichier_url": "/storage/cours_files/xyz.pdf",
      "est_publie": 1,
      "est_valide": 1,
      "created_at": "2024-01-15",
      "groupes": [
        {
          "id_groupe": 1,
          "nom_groupe": "L1 Info A"
        }
      ]
    }
  ]
}
```

#### 2. Get Calendar Events
```
GET /api/etudiant/calendar
```

**Response:**
```json
{
  "data": [
    {
      "id_cours": 1,
      "titre": "React Basics",
      "type_document": "COURS",
      "created_at": "2024-01-15"
    }
  ]
}
```

#### 3. Download Course Document
```
GET /api/etudiant/cours/{courseId}/download
```

**Response:** Binary file stream with proper headers

---

### Controllers

#### EtudiantCoursController

**Location:** `app/Http/Controllers/Api/EtudiantCoursController.php`

**Key Methods:**

```php
// Get student's courses with relationships
public function index()

// Get student's calendar events
public function getCalendar()

// Download course document
public function download($courseId)
```

**Security Features:**
- Checks user profile (etudiant)
- Verifies group membership
- Validates course publication status
- Confirms file existence

---

### Middleware

#### HandleCors
**Location:** `app/Http/Middleware/HandleCors.php`

**Purpose:** Handle CORS preflight requests for cross-origin requests

**Features:**
- Accepts specific origins (localhost:8000, 127.0.0.1:3000, etc.)
- Returns 204 No Content for OPTIONS
- Sets proper Access-Control headers
- Handles credentials mode

---

### Models

#### Cour (Course)
```php
class Cour extends Model {
    protected $primaryKey = 'id_cours';
    public $timestamps = true;
    
    // Relationships
    public function groupes() { return $this->belongsToMany(Groupe::class); }
}
```

**Fields:**
- `id_cours` (PK)
- `titre`
- `description`
- `type_document` (COURS, TP, TD, VIDEO)
- `fichier_url` (file path)
- `est_publie` (boolean)
- `est_valide` (boolean)
- `created_at`, `updated_at`

#### Etudiant (Student)
```php
class Etudiant extends Model {
    protected $primaryKey = 'id_etudiant';
    
    // Relationships
    public function groupe() { return $this->belongsTo(Groupe::class); }
    public function user() { return $this->belongsTo(User::class); }
}
```

#### Groupe (Group)
```php
class Groupe extends Model {
    protected $primaryKey = 'id_groupe';
    
    // Relationships
    public function cours() { return $this->belongsToMany(Cour::class, 'diffusion'); }
    public function etudiants() { return $this->hasMany(Etudiant::class); }
}
```

---

## Frontend

### Structure

```
resources/js/
├── app.jsx                 (entry point)
├── axiosConfig.js          (global axios config)
└── Pages/
    ├── Etudiant/
    │   ├── Dashboard.jsx    (stats + recent courses)
    │   ├── Courses.jsx      (course list + downloads)
    │   ├── Calendar.jsx     (event calendar)
    │   ├── DownloadPDFs.jsx (pdf downloads)
    │   ├── DownloadVideos.jsx (video downloads)
    │   └── StudentLayout.jsx (layout wrapper)
    └── ...
```

### Key Components

#### Dashboard.jsx
Shows:
- Statistics (credits, GPA, active courses, class)
- Recent courses with download button
- Today's schedule

**API Calls:**
- `GET /api/etudiant/mes-cours` → Recent courses

#### Courses.jsx
Shows:
- All courses in grid layout
- Search and filter by type
- Download and view buttons

**API Calls:**
- `GET /api/etudiant/mes-cours` → All courses

#### Calendar.jsx
Shows:
- Calendar view of course events
- Course details for each date

**API Calls:**
- `GET /api/etudiant/calendar` → Events

#### DownloadPDFs.jsx & DownloadVideos.jsx
Shows:
- Filterable list of documents
- Download buttons with progress
- Error handling

**API Calls:**
- `GET /api/etudiant/cours/{id}/download` → File download

### Global Axios Configuration

**File:** `resources/js/axiosConfig.js`

```javascript
// Automatically adds Bearer token to all requests
const token = localStorage.getItem('auth_token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}

// Handles 401 errors (redirect to login)
```

---

## Static Pages

### Vanilla JavaScript Dashboard

**Files:**
- `public/dashboard.html` (HTML + CSS)
- `public/dashboard.js` (JavaScript logic)

**Purpose:** Demonstrate same functionality without React library

**Access:** `http://localhost:8000/dashboard.html`

### Architecture

```javascript
// State management (replaces React useState)
let appState = {
  courses: [],
  loading: false,
  stats: { activeCourses: 0, ... }
};

// DOM manipulation (replaces React rendering)
const renderCourses = (courses) => {
  container.innerHTML = buildHTML(courses);
  attachDownloadListeners(); // Event delegation
};

// Async API calls (fetch instead of axios)
const fetchCourses = async () => {
  try {
    const response = await fetch('/api/etudiant/mes-cours', {...});
    const data = await response.json();
    renderCourses(data.data);
  } catch (error) {
    showAlert(error.message, 'error');
  }
};

// Initialization
document.addEventListener('DOMContentLoaded', initializeApp);
```

### Key Features
- ✅ No React/Vue dependency
- ✅ Pure DOM manipulation
- ✅ Async/await for API calls
- ✅ Event delegation with addEventListener
- ✅ CSS variables for theming
- ✅ Responsive design (Flexbox/Grid)
- ✅ Learning-friendly comments

---

## Database Schema

### Tables

#### users
```sql
- id (PK)
- name
- email (UNIQUE)
- email_verified_at
- password
- remember_token
- created_at, updated_at
```

#### etudiants
```sql
- id_etudiant (PK)
- id_utilisateur (FK → users.id)
- id_groupe (FK → groupes.id_groupe)
- created_at, updated_at
```

#### groupes
```sql
- id_groupe (PK)
- nom_groupe (e.g., "L1 Info A")
- created_at, updated_at
```

#### cours
```sql
- id_cours (PK)
- titre
- description
- type_document (ENUM: COURS, TP, TD, VIDEO)
- fichier_url
- est_publie (BOOLEAN)
- est_valide (BOOLEAN)
- created_at, updated_at
```

#### diffusion (Pivot)
```sql
- id_cour (FK → cours.id_cours)
- id_groupe (FK → groupes.id_groupe)
- PRIMARY KEY (id_cour, id_groupe)
```

#### professeurs
```sql
- id_professeur (PK)
- nom_professeur
- email
- created_at, updated_at
```

#### modules
```sql
- id_module (PK)
- nom_module
- created_at, updated_at
```

---

## Authentication & Authorization

### Flow

1. **Login**
   - User submits credentials
   - Laravel generates Bearer token + Session cookie
   - Token stored in `localStorage.auth_token`

2. **API Requests**
   - All requests include `Authorization: Bearer {token}`
   - Sanctum middleware validates token
   - Session cookie included via `withCredentials: true`

3. **Session Expiry**
   - 401 response → Auto-redirect to `/login`
   - Token removed from localStorage

### CORS Configuration

**File:** `app/Http/Middleware/HandleCors.php`

**Allowed Origins:**
- `localhost:8000`
- `127.0.0.1:8000`
- `localhost:3000`
- `127.0.0.1:3000`

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Credentials:** Included for session-based auth

---

## Setup & Installation

### Prerequisites
- PHP 8.2+
- Node.js 20.19+
- MySQL 8.0 or SQLite
- Composer
- Git

### Installation Steps

```bash
# 1. Clone repository
git clone <repo-url>
cd plateforme-cours

# 2. Install PHP dependencies
composer install

# 3. Install Node dependencies
npm install

# 4. Copy environment file
cp .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. Create database
php artisan migrate

# 7. Seed sample data (optional)
php artisan db:seed

# 8. Create storage symlink
php artisan storage:link

# 9. Build frontend assets
npm run build

# 10. Start development servers
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (hot reload)
npm run dev
```

### Environment Variables

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=plateforme_cours
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

---

## Usage Guide

### For Students

#### 1. Login
```
URL: http://localhost:8000/login
Credentials: Use seeded student account
```

#### 2. View Dashboard
```
URL: http://localhost:8000/etudiant/dashboard
Shows:
- Statistics (credits, GPA, active courses)
- Recent courses
- Today's schedule
```

#### 3. Browse All Courses
```
URL: http://localhost:8000/etudiant/mes-cours
Features:
- Search by title
- Filter by type (COURS, TP, TD, VIDEO)
- Download documents
- View documents (eye icon)
```

#### 4. View Calendar
```
URL: http://localhost:8000/etudiant/calendar
Shows:
- Course events in calendar format
- Course details on hover
```

#### 5. Download Documents
```
PDFs: http://localhost:8000/etudiant/pdfs
Videos: http://localhost:8000/etudiant/videos
Features:
- Search and filter
- Progress indicator
- Error notifications
```

### For Developers

#### Adding a New Course API Endpoint

1. **Create method in controller:**
```php
// app/Http/Controllers/Api/EtudiantCoursController.php
public function getMyCourses() {
    $student = auth()->user()->etudiant;
    return $student->groupe->cours;
}
```

2. **Add route:**
```php
// routes/api.php
Route::get('/etudiant/mes-cours', [EtudiantCoursController::class, 'getMyCourses']);
```

3. **Consume in frontend:**
```javascript
const response = await fetch('/api/etudiant/mes-cours', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Debugging API Calls

```javascript
// Enable console logging
console.log('[API] Request:', url);
console.log('[API] Response:', data);

// Check Network tab in DevTools (F12)
// Look for Authorization header and response status
```

---

## Troubleshooting

### Issue: 404 Not Found on API

**Cause:** Route not registered or wrong URL

**Solution:**
1. Check `routes/api.php` for route definition
2. Verify controller and method exist
3. Test with Postman: `GET http://localhost:8000/api/etudiant/mes-cours`
4. Include header: `Authorization: Bearer {token}`

### Issue: CORS Error

**Cause:** Cross-origin request blocked

**Solution:**
1. Check `app/Http/Middleware/HandleCors.php`
2. Verify origin is in allowed list
3. Ensure `withCredentials: true` is set
4. Check browser console for exact error

### Issue: Session Expired (401)

**Cause:** Token expired or not stored

**Solution:**
1. Login again
2. Check `localStorage.auth_token` is set (F12 → Application)
3. Clear localStorage and login again
4. Check `SESSION_LIFETIME` in `.env`

### Issue: File Download Returns HTML

**Cause:** API returning error response as JSON

**Solution:**
1. Check file exists: `storage/app/public/cours_files/`
2. Verify file path in database: `SELECT fichier_url FROM cours`
3. Check storage symlink: `php artisan storage:link`
4. Test file download directly: `GET /storage/cours_files/filename.pdf`

### Issue: Vanilla JS Dashboard Shows Blank

**Cause:** Fetch fails silently

**Solution:**
1. Open DevTools (F12) → Console
2. Check for error messages
3. Verify auth token in localStorage
4. Test API endpoint: `http://localhost:8000/api/etudiant/mes-cours`

---

## File Locations Reference

| File | Purpose |
|------|---------|
| `public/dashboard.html` | Vanilla JS dashboard template |
| `public/dashboard.js` | Vanilla JS dashboard logic |
| `resources/js/axiosConfig.js` | Global HTTP client config |
| `app/Http/Middleware/HandleCors.php` | CORS handler |
| `app/Models/Cour.php` | Course model |
| `routes/api.php` | API routes |
| `.env` | Environment config |
| `package.json` | Node dependencies |
| `composer.json` | PHP dependencies |

---

## Support & Resources

- **Laravel Docs**: https://laravel.com/docs
- **React Docs**: https://react.dev
- **Inertia.js**: https://inertiajs.com
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com

---

**Last Updated:** December 21, 2025  
**Version:** 1.0  
**Maintainer:** Development Team
