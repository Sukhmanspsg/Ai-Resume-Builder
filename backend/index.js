const cors = require('cors');
require('dotenv').config();
const express = require('express');
const db = require('./config/db');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// ✅ CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-domain.onrender.com', // Update this with your actual frontend URL
  'https://your-frontend-domain.vercel.app',   // Update this if using Vercel
  process.env.FRONTEND_URL // Environment variable for production
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

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
