const { generateHTMLFromJSON } = require('../utils/resumeRenderer');
const FeedbackModel = require('../models/feedbackModel');
const { generateAIResponse } = require('../utils/groqService');

// ============================================
// Generate AI Resume Feedback + HTML Preview
// ============================================
exports.generateFeedback = async (req, res) => {
  const { user_id, resume_id, input } = req.body;

  // ✅ Validate required input
  if (!user_id || !resume_id || !input) {
    return res.status(400).json({ message: 'Missing required fields (user_id, resume_id, input)' });
  }

  // 🧠 Prompt to generate complete resume JSON from user input
  const prompt = `
  You are an expert resume builder and creative writing assistant.
  
  Based on the user input below, generate a complete and expressive resume in **strict JSON format**.

  ✳️ Rules:
  - Return **only valid JSON** (no markdown, no code blocks).
  - Make the language sound confident and personal, not robotic.
  - Focus on achievements, responsibilities, and technologies used.
  - Include all fields even if user input is missing. Use placeholders if needed.

  ✳️ JSON Output Format:
  {
    "name": "string",
    "title": "string",
    "summary": "string",
    "experience": [
      {
        "company": "string",
        "role": "string",
        "description": "first-person story of what you did, how you did it, and its impact"
      }
    ],
    "skills": ["Skill1", "Skill2"],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "year": "string"
      }
    ],
    "certifications": ["Certification1", "Certification2"],
    "languages": ["English", "Other"],
    "projects": [
      {
        "name": "Project Title",
        "description": "What the project was, how it worked, and what you learned"
      }
    ]
  }

  User Input:
  ${JSON.stringify(input, null, 2)}
  `;

  try {
    // 🔍 Send prompt to Groq for AI-generated resume JSON
    const rawJson = await generateAIResponse(prompt);

    let parsedJson;

    // ✅ Try to parse the response as JSON
    try {
      parsedJson = JSON.parse(rawJson);
    } catch (err) {
      // ❌ If parsing fails, return error with raw output for debugging
      return res.status(500).json({
        message: 'Failed to parse JSON from AI response.',
        raw: rawJson,
        error: err.message
      });
    }

    // 🎨 Render the resume into HTML using the parsed JSON
    const renderedHtml = generateHTMLFromJSON(parsedJson);

    // 💾 Save feedback to the database
    FeedbackModel.createFeedback(user_id, resume_id, 5, 'AI generated feedback', (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to save feedback', error: err });
      }

      // ✅ Success: return saved resume data
      res.status(200).json({
        message: 'AI feedback generated and stored',
        feedback_id: result.insertId,
        resume_json: parsedJson,
        resume_html: renderedHtml
      });
    });

  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

exports.submitFeedback = (req, res) => {
  const { userId, resumeId, rating, comment } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Use userId from request if available, otherwise allow anonymous feedback
  const finalUserId = userId || null;
  const finalResumeId = resumeId || null;
  const finalComment = comment || '';

  FeedbackModel.createFeedback(finalUserId, finalResumeId, rating, finalComment, (err, result) => {
    if (err) {
      console.error('Error submitting feedback:', err);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }
    
    console.log('✅ Feedback submitted successfully:', {
      id: result.insertId,
      userId: finalUserId,
      rating: rating,
      comment: finalComment ? 'Yes' : 'No comment'
    });
    
    res.json({ 
      message: 'Feedback submitted successfully', 
      id: result.insertId,
      success: true
    });
  });
};

exports.getAllFeedback = (req, res) => {
  // Only admin users should be able to access this endpoint
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  FeedbackModel.getAllFeedback((err, feedback) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    res.json(feedback);
  });
};

exports.getFeedbackStats = (req, res) => {
  // Only admin users should be able to access this endpoint
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  FeedbackModel.getFeedbackStats((err, stats) => {
    if (err) {
      console.error('Error fetching feedback stats:', err);
      return res.status(500).json({ error: 'Failed to fetch feedback statistics' });
    }
    res.json(stats);
  });
};

exports.getFeedbackByResume = (req, res) => {
  const { resumeId } = req.params;

  FeedbackModel.getFeedbackByResumeId(resumeId, (err, feedback) => {
    if (err) {
      console.error('Error fetching resume feedback:', err);
      return res.status(500).json({ error: 'Failed to fetch resume feedback' });
    }
    res.json(feedback);
  });
};
