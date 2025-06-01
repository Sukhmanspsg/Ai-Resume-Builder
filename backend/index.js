const cors = require('cors');
require('dotenv').config();
const express = require('express');
const db = require('./config/db');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// ✅ CORS must come BEFORE any routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const templateRoutes = require('./routes/templateRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const aiRoutes = require('./routes/aiRoutes');
const aiSuggestionRoutes = require('./routes/aiSuggestionsRoutes');

// Mount API routes first
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', aiSuggestionRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.send('🟢 Backend is running!');
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
