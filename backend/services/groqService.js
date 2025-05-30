const axios = require('axios');

exports.groqGenerateTemplate = async (userPrompt) => {
  const aiPrompt = `
You are a senior front-end developer. Your task is to generate a professional HTML resume template.

🔐 Respond ONLY with strict JSON in this format:
{
  "name": "Template Name",
  "description": "Brief description of the layout",
  "html_code": "<!DOCTYPE html><html><head>...</html>"
}

📌 DO NOT use backticks, markdown, explanations, or multiline strings.
📌 The "html_code" should include placeholders: {{name}}, {{summary}}, {{skills}}, {{education}}, {{experience}}.

User's request: ${userPrompt}
`;

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: aiPrompt }
      ],
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    console.log('🧠 Raw AI response:', content);

    // Try to extract the JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found in AI response');

    let parsed;
try {
  parsed = JSON.parse(jsonMatch[0]);
} catch (err) {
  // Attempt to fix broken escape characters (like \")
  const fixed = jsonMatch[0].replace(/\\"/g, '"');
  parsed = JSON.parse(fixed);
}


    if (!parsed.name || !parsed.html_code) {
      throw new Error('Missing required fields: name or html_code');
    }

    // Optional: sanitize bad input before saving
    const html_code = parsed.html_code.replace(/[\u0000-\u001F]+/g, '');

    return {
      name: parsed.name,
      description: parsed.description || '',
      html_code,
    };

  } catch (err) {
    console.error('❌ Error calling Groq API:', err.response?.data || err.message || err);
    throw err;
  }
};
