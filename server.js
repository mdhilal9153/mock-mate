require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());

// INCREASE PAYLOAD LIMIT for images (Crucial!)
app.use(express.json({ limit: '50mb' })); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert base64 string to Google's format
function fileToGenerativePart(base64String, mimeType) {
  return {
    inlineData: {
      data: base64String.split(',')[1], // Remove the "data:image/jpeg;base64," prefix
      mimeType
    },
  };
}

app.post('/api/chat', async (req, res) => {
  const { userMessage, image } = req.body;

  try {
    // Use your NEW model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are a strict technical interviewer. 
      Analyze the student's answer: "${userMessage}".
      
      ALSO, analyze the attached image of the student.
      - Are they making eye contact?
      - Do they look nervous or confident?
      
      Give a score out of 10 and a short critique based on both their Answer AND their Body Language.
    `;

    // Send Text + Image to Gemini
    const imagePart = fileToGenerativePart(image, "image/jpeg");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const aiText = response.text();

    res.json({ reply: aiText });
  } catch (error) {
    console.error(error);
    res.status(500).send("AI Vision Error");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));