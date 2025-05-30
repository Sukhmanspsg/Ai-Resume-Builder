const { generateHTMLFromJSON } = require('../utils/resumeRenderer');

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
    const aiResponse = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9
    });

    // 📝 Get the raw string output
    const rawJson = aiResponse.choices[0].message.content;

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

    // 💾 Save feedback to the database (assuming feedbackModel is globally available or imported)
    feedbackModel.saveFeedback(user_id, resume_id, rawJson, (err, result) => {
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
