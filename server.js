require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' })); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(base64String, mimeType) {
  return {
    inlineData: {
      data: base64String.split(',')[1], 
      mimeType
    },
  };
}

app.post('/api/chat', async (req, res) => {
  const { userMessage, image } = req.body;

  try {
   
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
  ROLE:
  You are a Senior Technical Lead at a top tech company. You are conducting a high-stakes interview. You are NOT an AI assistant. You are a busy professional who values competence and brevity.

  INPUT DATA:
  1. Candidate's Answer: "${userMessage}"
  2. Visuals: Analyze the attached image for eye contact and nervousness.

  STRICT SPEAKING RULES (DO NOT BREAK):
  - NO FLUFF: Do NOT say "That's a great answer," "Thank you for sharing," or "I understand."
  - NO SUMMARIES: Do NOT repeat or summarize what the candidate just said.
  - BE SKEPTICAL: If the answer is vague, challenge them. (e.g., "That's too high-level. How exactly does that work under the hood?")
  - SHORT & DIRECT: Keep your response conversational and brief (2-3 sentences max).
  - CONVERSATIONAL: Speak like a human. Use plain English. No bullet points unless asking a coding question.

  YOUR TASK:
  1. Briefly critique their answer and body language (be blunt but professional).
  2. Assign a score out of 10 based on technical accuracy and confidence.
  3. Immediately ask the NEXT technical question based on their response. Do not wait.

  Output Format:
  [Score: X/10]
  [Critique & Next Question]
`;

  
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));