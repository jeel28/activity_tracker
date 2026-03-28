require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 🔍 Debug (optional - remove later)
console.log("CLIENT_URL:", process.env.CLIENT_URL);

// ✅ CORS FIX (safe for production)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    if (origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());

// ✅ Routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/events', require('./routes/events'));
app.use('/api/stats', require('./routes/stats'));

// ✅ Health check
app.get('/health', (_, res) => {
  res.json({ ok: true });
});

// ❌ Global error handler (VERY IMPORTANT)
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ error: err.message });
});

// ✅ Use Railway PORT
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});