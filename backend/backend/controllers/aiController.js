const dotenv = require('dotenv');
dotenv.config();

const { generateAIResponse } = require('../utils/groqService');

// ===============================
// Resume Summary Enhancement
// ===============================
exports.enhanceSummary = async (req, res) => {
  const { name, education, experience, skills } = req.body;

  // Prompt to instruct the AI to generate a clean, professional summary
  const prompt = `
  You are a professional resume writer. Based on the following inputs, generate a clean and formal resume summary.
  
  Name: ${name}
  Education: ${education}
  Experience: ${experience}
  Skills: ${skills}
  
  ⚠️ STRICT RULES:
  - Do NOT include phrases like “Here is a summary”, “Summary:”, “Here’s a professional summary”, etc.
  - Do NOT use markdown (no **bold**, headers, bullets).
  - Do NOT add sections like "Technical Skills" or "Soft Skills".
  - Do NOT provide notes or explanations.
  - Do NOT repeat the instructions or input data.
  - ONLY return a single, polished paragraph written in the third person, using a confident and formal tone.
  - Keep it around 4–5 lines long.
  
  Your response must ONLY contain the summary paragraph — nothing else.
  `;

  try {
    // Call Groq or other AI model to generate summary
    const aiResponse = await generateAIResponse(prompt);

    // Clean the AI response to remove unwanted lines or headers
    const lines = aiResponse.split('\n').map(line => line.trim());

    // Filter out short lines and generic fluff
    const filtered = lines.filter(line => {
      const lower = line.toLowerCase();
      return (
        line.length > 20 && // Skip very short lines
        !lower.includes('summary') &&
        !lower.includes('here is') &&
        !lower.includes('certified web developer') &&
        !lower.includes('based on') &&
        !lower.startsWith('**') &&
        !lower.endsWith('**')
      );
    });

    // Join filtered lines and normalize spaces
    const cleanedSummary = filtered.join(' ').replace(/\s+/g, ' ').trim();

    // Respond with the cleaned summary
    res.json({ suggestedSummary: cleanedSummary });
  } catch (err) {
    console.error('❌ Summary AI error:', err.message);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

// ===============================
// AI Skill Suggestion Endpoint
// ===============================
exports.suggestSkills = async (req, res) => {
  const { input } = req.body;

  // Basic input validation
  if (!input || input.length < 2) {
    return res.status(400).json({ suggestions: [] });
  }

  // Prompt to get related skill suggestions
  const prompt = `
    You are a resume optimization assistant.
    Suggest 5 technical or soft skills related to the keyword: "${input}".
    Respond ONLY with a plain comma-separated list, no introduction or explanation.
  `;

  try {
    // Ask the AI model to generate suggestions
    const text = await generateAIResponse(prompt); // e.g., "JavaScript, React, HTML, CSS, Node.js"

    // Clean and split into array
    const suggestions = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    res.json({ suggestions });
  } catch (err) {
    console.error('❌ Groq Skill Suggestion Error:', err);
    res.status(500).json({ message: 'Groq failed to suggest skills.' });
  }
};
