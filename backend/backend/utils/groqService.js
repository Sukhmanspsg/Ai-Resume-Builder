const axios = require('axios');

const generateAIResponse = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-8b-8192", // or "llama3-70b-8192" if supported
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("Groq API Error:", err?.response?.data || err.message);
    throw err;
  }
};

module.exports = { generateAIResponse };
