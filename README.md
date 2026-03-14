# TaskFlow

A task management app built with Next.js, Express, and MongoDB.

## Stack

- **Backend** — Node.js + Express
- **Frontend** — Next.js 14
- **Database** — MongoDB
- **Auth** — JWT via HTTP-only cookies

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB installed and running

### Backend

```bash
cd backend
cp .env.example .env
# fill in your values
npm install
node src/server.js
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskapp
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
AES_SECRET_KEY=your_32_char_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API

All task routes require authentication via cookie.

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

GET /api/tasks supports `page`, `limit`, `status`, `search`, `sortBy`, `order` query params.

## Security

Passwords are hashed with bcrypt. JWTs are stored in HTTP-only cookies only — never in localStorage. Task descriptions are AES-encrypted before hitting the database. All routes are rate limited.

## Deployment

Backend on Render, frontend on Vercel, database on MongoDB Atlas.

Set `FRONTEND_URL` on Render to your Vercel URL and `NEXT_PUBLIC_API_URL` on Vercel to your Render URL.
