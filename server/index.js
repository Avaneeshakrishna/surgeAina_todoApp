// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/* ---------- CORS ---------- */
let corsOptions = { origin: true }; // reflect the request origin (good for quick tests)
if (process.env.CORS_ORIGINS) {
  const allow = process.env.CORS_ORIGINS.split(',').map(s => s.trim());
  corsOptions = {
    origin: allow,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  };
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ---------- Middlewares ---------- */
app.use(express.json());

/* ---------- MongoDB ---------- */
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ Missing MONGO_URI in environment');
  process.exit(1);
}
mongoose
  .connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Mongo connection error:', err?.message || err);
    process.exit(1);
  });

/* ---------- Model ---------- */
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const Task = mongoose.model('Task', taskSchema);

/* ---------- Routes ---------- */
// Health
app.get('/', (_req, res) => res.send('OK'));

// Get all
app.get('/tasks', async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
app.post('/tasks', async (req, res) => {
  try {
    const title = (req.body?.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = await Task.create({ title });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update
app.put('/tasks/:id', async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.title === 'string') update.title = req.body.title.trim();
    if (typeof req.body.completed === 'boolean') update.completed = req.body.completed;

    const task = await Task.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = app; // ✅ export the app (so server.js can call listen)
