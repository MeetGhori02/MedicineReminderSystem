# 💊 MediRemind — Medicine Reminder System

A full-stack medicine reminder web application built with React, Node.js, Prisma, and MySQL.

---

## 🧩 Tech Stack

| Layer     | Tech                                |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript        |
| ORM       | Prisma                              |
| Database  | MySQL                               |
| Auth      | JWT + bcrypt                        |
| Scheduler | node-cron                           |

---

## 📋 Prerequisites

- **Node.js** v18+
- **MySQL** running locally (port 3306)
- **npm** or **yarn**

---

## 🚀 Setup & Run Instructions

### STEP 1 — Create the MySQL database

```sql
CREATE DATABASE mrs;
```

### STEP 2 — Backend setup

```bash
cd backend
npm install
```

Edit `.env` with your credentials:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mrs"
JWT_SECRET="your-super-secret-key-change-this"
```

Run Prisma migrations to create tables:
```bash
npx prisma migrate dev --name init
# OR just push the schema
npx prisma db push
```

Generate Prisma client:
```bash
npx prisma generate
```

Start the backend:
```bash
npm run dev
```

The API will be at **http://localhost:5000**

### STEP 3 — Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be at **http://localhost:5173**

---

## 📁 Project Structure

```
mrs/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── routes/
│   │   │   ├── auth.ts        # Auth endpoints
│   │   │   ├── medicines.ts   # Medicine CRUD
│   │   │   └── dashboard.ts   # Dashboard stats
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT guard
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── medicineService.ts
│   │   │   └── reminderScheduler.ts
│   │   └── utils/
│   │       ├── prisma.ts
│   │       └── response.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── layout/Layout.tsx
    │   │   └── ui/MedicineFormModal.tsx
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   └── MedicinesPage.tsx
    │   ├── hooks/
    │   │   ├── useAuth.tsx
    │   │   ├── useDarkMode.ts
    │   │   └── useReminders.ts
    │   ├── services/api.ts
    │   └── types/index.ts
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET  | `/api/auth/me` | Get current user |

### Medicines (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/medicines` | List all (with search/date filter) |
| GET    | `/api/medicines/today` | Today's medicines |
| GET    | `/api/medicines/stats` | Adherence stats |
| POST   | `/api/medicines` | Add medicine |
| PUT    | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |
| PATCH  | `/api/medicines/:id/taken` | Mark taken/untaken |

### Dashboard (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/dashboard/summary` | User dashboard data |
| GET    | `/api/dashboard/admin` | Admin stats (admin only) |

---

## 🎯 Sample Test Data

Use these credentials after setup:

**Register:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Sample medicine POST body:**
```json
{
  "name": "Metformin",
  "dosage": "500mg",
  "date": "2024-01-15",
  "time": "08:00",
  "frequency": "DAILY",
  "beforeAfterFood": "AFTER",
  "notes": "Take with breakfast",
  "reminderEnabled": true
}
```

---

## ✨ Features

- 🔐 JWT Authentication (register/login)
- 💊 Full medicine CRUD
- ✅ Mark medicines as taken/untaken
- ⏰ Browser push notifications for reminders
- 🔊 Sound alerts
- 📊 Adherence tracking & dashboard
- 🔍 Search & date filter
- 🌙 Dark mode toggle
- 📱 Fully responsive (mobile-first)
- 🔄 Background scheduler (resets daily medicines at midnight)

---

## 🛠 Troubleshooting

**Prisma migration error:**
```bash
npx prisma migrate reset  # WARNING: drops all data
npx prisma db push
```

**CORS error:**
Make sure `FRONTEND_URL` in `.env` matches your frontend URL.

**Notification not showing:**
- Browser requires HTTPS for notifications in production
- Click "Allow" when the browser asks for notification permission
