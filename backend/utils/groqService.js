const axios = require('axios');

const generateAIResponse = async (prompt) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a professional resume writing assistant. Provide clear, concise, and professional responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq API Error:", err?.response?.data || err.message);
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or authentication error');
    } else if (err.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few seconds.');
    } else if (err.response?.status === 500) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    throw new Error('Failed to generate AI response: ' + (err.message || 'Unknown error'));
  }
};

module.exports = { generateAIResponse };
