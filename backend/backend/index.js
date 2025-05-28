const cors = require('cors');
require('dotenv').config();
const express = require('express');
const db = require('./config/db');
const app = express();


// ✅ CORS must come BEFORE any routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// ✅ All your routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/resumes', resumeRoutes);

const templateRoutes = require('./routes/templateRoutes');
app.use('/api/templates', templateRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);  // This is for your AI-related routes

const atsRoutes = require('./routes/atsRoutes');
app.use('/api/ats', atsRoutes);  // ✅ Fix: ATS routes under /api/ats
const path = require('path');
const aiSuggestionRoutes = require('./routes/aiSuggestionsRoutes');
app.use('/api/ai', aiSuggestionRoutes);



// Serve frontend for any other route (SPA fallback)
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
// Test route
app.get('/', (req, res) => {
  res.send('🟢 Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
