# TaskFlow — Full Stack Task Management App

A production-ready Task Management Application built with **Next.js**, **Node.js/Express**, and **MongoDB**.

---

## 🚀 Live Demo

- **Frontend:** `https://taskflow-frontend.onrender.com` 
- **Backend API:** `https://taskflow-backend.onrender.com` 

---

## 📁 Project Structure

```
taskapp/
├── backend/                   # Express REST API
│   ├── src/
│   │   ├── config/db.js       # MongoDB connection
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT protection
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js
│   │   │   └── Task.js
│   │   ├── routes/            # Route definitions
│   │   │   ├── auth.js
│   │   │   └── tasks.js
│   │   ├── utils/             # Helpers
│   │   │   ├── encryption.js  # AES encryption
│   │   │   ├── jwt.js
│   │   │   └── response.js
│   │   └── server.js          # Express entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                  # Next.js 14 App Router
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx       # Redirects to /dashboard
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── dashboard/
│   │   ├── components/        # Reusable UI
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js     # Auth context + hook
│   │   │   └── useTasks.js    # Task CRUD hook
│   │   └── lib/api.js         # Axios instance
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## 🏗️ Architecture Overview

```
Browser (Next.js)
      │
      │  HTTP requests (with cookies)
      ▼
Express REST API (Node.js)
      │
      ├── Helmet (security headers)
      ├── Rate Limiting (express-rate-limit)
      ├── CORS (credential-aware)
      ├── JWT Auth (HTTP-only cookie)
      ├── AES Encryption (task descriptions)
      ├── Input Validation (express-validator)
      └── MongoDB (Mongoose)
```

### Key Design Decisions

- **HTTP-only cookies** for JWT storage — prevents XSS token theft vs localStorage
- **AES-256 encryption** on task `description` field at rest using `crypto-js`
- **bcrypt (cost 12)** for password hashing — secure against brute force
- **Strict ownership checks** — every task query includes `user: req.user._id`
- **Global rate limiting** (200 req/15min) + stricter auth limiter (20 req/15min)
- **Compound indexes** on Task model for fast user-scoped queries
- **Protected frontend routes** via `ProtectedRoute` component + `useAuth` context

---

## ⚙️ Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskapp
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d
AES_SECRET_KEY=your_32_character_aes_encryption_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

App runs at **http://localhost:3000**

### 4. Docker (optional)

```bash
# From root
cp backend/.env.example backend/.env  # fill in values
docker-compose up --build
```

---

## 🌐 Deployment (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repository — Render auto-detects `render.yaml`
4. Set environment variables in the Render dashboard:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — random 32+ char string
   - `AES_SECRET_KEY` — random 32 char string
   - `FRONTEND_URL` — your frontend Render URL
   - `NEXT_PUBLIC_API_URL` — your backend Render URL
5. Deploy

### Vercel (frontend only)

```bash
cd frontend
npx vercel --prod
```

Set `NEXT_PUBLIC_API_URL` in Vercel's environment settings.

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

All responses follow the format:
```json
{ "success": true, "message": "...", ...data }
{ "success": false, "message": "...", "errors": [...] }
```

---

### Auth Endpoints

#### POST /auth/register

```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secure123"
}

// Response 201
{
  "success": true,
  "message": "Registration successful",
  "user": { "id": "64f...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

#### POST /auth/login

```json
// Request
{ "email": "jane@example.com", "password": "secure123" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "64f...", "name": "Jane Doe", "email": "jane@example.com" }
}
// Sets HTTP-only cookie: token=<jwt>
```

#### POST /auth/logout *(protected)*

```json
// Response 200
{ "success": true, "message": "Logged out successfully" }
// Clears token cookie
```

#### GET /auth/me *(protected)*

```json
// Response 200
{
  "success": true,
  "user": { "id": "64f...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

---

### Task Endpoints *(all protected)*

#### GET /tasks

Query params:
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 50) |
| status | string | `pending` \| `in-progress` \| `completed` |
| search | string | Search by title (case-insensitive) |
| sortBy | string | `createdAt` \| `updatedAt` \| `title` \| `status` |
| order | string | `asc` \| `desc` |

```json
// GET /tasks?page=1&limit=10&status=pending&search=bug

// Response 200
{
  "success": true,
  "message": "Tasks fetched",
  "tasks": [
    {
      "_id": "65a...",
      "title": "Fix login bug",
      "description": "The token isn't being cleared on logout",
      "status": "pending",
      "user": "64f...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalTasks": 25,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

#### POST /tasks

```json
// Request
{
  "title": "Fix login bug",
  "description": "The token isn't being cleared on logout",
  "status": "pending"
}

// Response 201
{
  "success": true,
  "message": "Task created",
  "task": { "_id": "65a...", "title": "Fix login bug", ... }
}
```

#### GET /tasks/:id

```json
// Response 200
{ "success": true, "task": { "_id": "65a...", ... } }

// Not found / wrong user — 404
{ "success": false, "message": "Task not found" }
```

#### PUT /tasks/:id

```json
// Request (all fields optional)
{ "title": "Updated title", "status": "in-progress" }

// Response 200
{ "success": true, "message": "Task updated", "task": { ... } }
```

#### DELETE /tasks/:id

```json
// Response 200
{ "success": true, "message": "Task deleted" }
```

---

## 🔐 Security Checklist

- ✅ JWT stored in HTTP-only cookie (not localStorage)
- ✅ Secure + SameSite cookie flags in production
- ✅ Passwords hashed with bcrypt (cost factor 12)
- ✅ AES encryption on task description field
- ✅ Input validation on all endpoints (express-validator)
- ✅ Helmet.js security headers
- ✅ CORS restricted to known frontend origin
- ✅ Rate limiting (global + auth-specific)
- ✅ 10kb request body limit (large payload attack prevention)
- ✅ No hardcoded secrets — all via environment variables
- ✅ Mongoose parameterized queries (no SQL/NoSQL injection)
- ✅ Strict ownership: every task query scoped to `req.user._id`
- ✅ Proper HTTP status codes throughout

---

## 🧪 Testing the API (curl)

```bash
# Register
curl -c cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"pass123"}'

# Login
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Create task
curl -b cookies.txt -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","description":"Testing the API","status":"pending"}'

# Get tasks with filters
curl -b cookies.txt "http://localhost:5000/api/tasks?page=1&limit=5&status=pending&search=first"

# Update task
curl -b cookies.txt -X PUT http://localhost:5000/api/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete task
curl -b cookies.txt -X DELETE http://localhost:5000/api/tasks/<TASK_ID>
```
