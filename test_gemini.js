// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `{"test": "ok"}`;
    const result = await model.generateContent(prompt);
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
