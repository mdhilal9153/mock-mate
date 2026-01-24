const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Checking available models...");
    // This fetches the official list from Google
    const modelResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await modelResponse.json();
    
    if (data.error) {
        console.error("API Key Error:", data.error.message);
    } else {
        console.log("✅ SUCCESS! Here are the exact model names you must use:");
        // Filter for "generateContent" models only
        const available = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));
        console.table(available);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

listModels();