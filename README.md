# 💊 MediRemind — Medicine Reminder System

A full-stack medicine reminder web application built with React, Node.js, Mongoose, and MongoDB Atlas.

---

## 🧩 Tech Stack

| Layer     | Tech                                |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript        |
| ORM       | Mongoose                            |
| Database  | MongoDB Atlas                       |
| Auth      | JWT + bcrypt                        |
| Scheduler | node-cron                           |

---

## 📋 Prerequisites

- **Node.js** v18+
- **MongoDB Atlas** cluster or local MongoDB server
- **npm** or **yarn**

---

## 🚀 Setup & Run Instructions

### STEP 1 — Create the MongoDB database

Create a cluster in MongoDB Atlas and a database named `MRS`, or run a local MongoDB server and use `mongodb://localhost:27017/MRS`.

### STEP 2 — Backend setup

```bash
cd backend
npm install
```

Edit `.env` with your credentials:
```
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/MRS?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-key-change-this"
FRONTEND_URL="https://your-vercel-frontend.vercel.app"
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
npm run build
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

## 🚀 Deployment

### Backend on Render

1. Push this repository to GitHub.
2. Create a new Render Web Service from the repo.
3. Use the backend folder as the root directory.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables:
  - `MONGO_URI` = your MongoDB Atlas connection string
  - `JWT_SECRET` = a secure random string
  - `NODE_ENV` = `production`
  - `PORT` = `10000`
  - `FRONTEND_URL` = your Vercel frontend URL

### Frontend on Vercel

1. Create a Vercel project from the same repo.
2. Set the root directory to `frontend`.
3. Build Command: `npm install && npm run build`
4. Output Directory: `dist`
5. Add environment variable:
  - `VITE_API_BASE_URL` = your Render backend URL ending with `/api`

### Verification

1. Open the backend `/health` endpoint.
2. Register a user from the app.
3. Add a medicine.
4. Check MongoDB Atlas or Compass and confirm the `users` and `medicines` collections contain the new documents.

## 🛠 Troubleshooting

- If the backend cannot connect, verify `MONGO_URI` in Render and in `backend/.env`.
- If CORS fails, make sure `FRONTEND_URL` exactly matches your deployed frontend URL.
- If the frontend cannot call the API, confirm `VITE_API_BASE_URL` ends with `/api`.

**Notification not showing:**
- Browser requires HTTPS for notifications in production
- Click "Allow" when the browser asks for notification permission
