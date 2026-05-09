import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  const prompt = `
    You are a highly intelligent task assistant. Extract the details from the following user input and return ONLY a valid JSON object (no markdown formatting, no backticks, just the raw JSON).
    
    Input: "Junior web project due on 14th may"
    
    JSON Format:
    {
      "title": "A concise title of the task",
      "due": "The due date or time extracted. If none, write 'No due date'",
      "priority": "High" or "Medium" or "Low" (Infer this based on words like 'urgent', 'ASAP', or due date proximity),
      "category": "Tech", "Design", "Personal", or "Other" (Infer this based on context)
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
      temperature: 0,
    });

    console.log("Raw output:", completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
