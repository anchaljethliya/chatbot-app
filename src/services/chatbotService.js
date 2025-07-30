import axios from 'axios';

export const sendMessage = async (message) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  console.log('API Key loaded:', apiKey ? 'YES' : 'NO');
  console.log('API Key value:', apiKey);
  
  if (!apiKey) {
    return "Gemini API key is missing. Please set it in your .env.local file.";
  }
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
      return response.data.candidates[0].content.parts[0].text.trim();
    } else {
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      return "API key error: Please check if your Gemini API key is valid and has the correct permissions.";
    }
    return "Sorry, I couldn't get an answer from Gemini. Please try again later.";
  }
};