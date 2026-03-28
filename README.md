# ⚡ Activity Tracker

A full-stack daily activity tracker with points, calendar, to-do list, and monthly review.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS → deployed on Vercel
- **Backend**: Node.js + Express → deployed on Railway
- **Database**: SQLite + Prisma ORM

---

## 🖥️ Run Locally (Windows)

### Step 1 — Install prerequisites
Make sure you have:
- Node.js v18+ → https://nodejs.org
- Git → https://git-scm.com

### Step 2 — Setup the server

Open a terminal (CMD or PowerShell) and run:

```bash
cd activity-tracker/server
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
node src/seed.js
npm run dev
```

Server will run at http://localhost:4000

### Step 3 — Setup the client

Open a SECOND terminal:

```bash
cd activity-tracker/client
npm install
npm run dev
```

Frontend will run at http://localhost:5173

Open http://localhost:5173 in your browser. Done!

---

## 🌍 Deploy for Free (Vercel + Railway)

### PART 1 — Deploy Backend to Railway

1. Push your code to GitHub:
   ```bash
   cd activity-tracker
   git init
   git add .
   git commit -m "initial commit"
   # Create a new repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/activity-tracker.git
   git push -u origin main
   ```

2. Go to https://railway.app → Sign up with GitHub

3. Click **"New Project"** → **"Deploy from GitHub repo"** → select your repo

4. Railway will detect the railway.json config automatically

5. In Railway dashboard → your service → **Variables** tab, add:
   ```
   DATABASE_URL = file:./prod.db
   CLIENT_URL   = https://your-app.vercel.app   ← (add after Vercel deploy)
   PORT         = 4000
   ```

6. Click **Deploy**. Railway gives you a URL like:
   `https://activity-tracker-production.up.railway.app`

7. Test it: open `https://your-railway-url.railway.app/health` → should return `{"ok":true}`

---

### PART 2 — Deploy Frontend to Vercel

1. Go to https://vercel.com → Sign up with GitHub

2. Click **"Add New Project"** → Import your GitHub repo

3. Set **Root Directory** to `client`

4. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://your-railway-url.railway.app/api
   ```

5. Click **Deploy**

6. Vercel gives you a URL like: `https://activity-tracker-xyz.vercel.app`

---

### PART 3 — Final step: Update CORS

Go back to Railway → Variables → update:
```
CLIENT_URL = https://activity-tracker-xyz.vercel.app
```
Redeploy. Done! ✅

---

## 📱 Access on Phone

Once deployed, just open your Vercel URL on your phone browser.
It's fully mobile-responsive!

---

## 🗂️ Project Structure

```
activity-tracker/
├── client/                  ← React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Today.jsx        ← Daily task check-ins
│   │   │   ├── Calendar.jsx     ← Calendar + reminders
│   │   │   ├── Todos.jsx        ← To-do list
│   │   │   ├── Monthly.jsx      ← Monthly review + heatmap
│   │   │   └── ManageTasks.jsx  ← Add/edit/delete tasks
│   │   ├── lib/api.js           ← Axios API client
│   │   ├── App.jsx              ← Routing + nav
│   │   └── main.jsx
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                  ← Express backend
│   └── src/
│       ├── routes/
│       │   ├── tasks.js         ← CRUD for predefined tasks
│       │   ├── logs.js          ← Daily task check-in logs
│       │   ├── todos.js         ← To-do list
│       │   ├── events.js        ← Calendar reminders
│       │   └── stats.js         ← Monthly stats aggregation
│       ├── index.js             ← Express app entry
│       ├── prisma.js            ← Prisma client
│       └── seed.js              ← Default tasks seeder
│
├── prisma/
│   └── schema.prisma        ← Database schema
│
├── railway.json             ← Railway deployment config
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get active tasks |
| GET | /api/tasks/all | Get all tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/logs/:date | Get logs for date |
| GET | /api/logs/range/:from/:to | Get logs for date range |
| POST | /api/logs/toggle | Toggle task done/undone |
| GET | /api/todos | Get all todos |
| POST | /api/todos | Create todo |
| PUT | /api/todos/:id | Update todo |
| DELETE | /api/todos/:id | Delete todo |
| GET | /api/events/:date | Get events for date |
| GET | /api/events/month/:year/:month | Get events for month |
| POST | /api/events | Create event |
| DELETE | /api/events/:id | Delete event |
| GET | /api/stats/monthly/:year/:month | Get monthly stats |
