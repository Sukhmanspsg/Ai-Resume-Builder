const { Groq } = require("groq-sdk");

// Initialize Groq API with the key from environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ===============================
// ATS Scoring Endpoint
// ===============================
async function getATSScore(req, res) {
  console.log("✅ ATS endpoint hit");

  try {
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ message: "Missing content" });
    }

    // AI prompt to request a clean integer ATS score
    const prompt = `
You are an AI resume evaluator. Based on the following resume content, give a single integer score (0-100) for its ATS (Applicant Tracking System) compliance. Just return the number.

Resume content:
${content}
`;

    // Request a response from Groq's LLaMA model
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192"
    });

    // Extract raw response from AI
    const scoreText = completion.choices[0].message.content.trim();

    // Extract a number between 1 and 100 from the response
    const match = scoreText.match(/\b([1-9][0-9]?|100)\b/);
    const score = match ? parseInt(match[0]) : 0; // Default to 0 if no valid number is found

    // Return the score
    res.json({ score });
  } catch (err) {
    console.error("❌ ATS scoring failed:", err);
    res.status(500).json({ message: "Failed to score resume." });
  }
}

module.exports = { getATSScore };
