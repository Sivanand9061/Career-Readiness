import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Groq from "groq-sdk";
import { env } from "~/env.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const taskRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({ 
      message: z.string(),
      tasks: z.array(z.any()),
      history: z.array(z.object({ role: z.string(), content: z.string() })) 
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `You are an intelligent project assistant with the ability to ACT.
Here are the user's current tasks:
${JSON.stringify(input.tasks, null, 2)}

If the user asks you to ADD a task, you MUST return an action object to actually create it.
If the user asks you a general question, just reply.

You MUST respond in ONLY this exact JSON format:
{
  "reply": "Your conversational response to the user",
  "action": null | {
    "type": "ADD_TASK",
    "payload": {
      "title": "Task title",
      "due": "Due date",
      "priority": "High" | "Medium" | "Low",
      "category": "Tech" | "Design" | "Personal" | "Other",
      "energyLevel": "High" | "Low" (Infer deep work vs admin/email),
      "contextTag": "at_desk" | "on_the_move" | "gym" (Infer where this is done)
    }
  }
}`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...input.history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.message }
      ];

      try {
        const completion = await groq.chat.completions.create({
          messages: messages as any,
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return { 
          reply: parsed.reply || "I processed that.", 
          action: parsed.action || null 
        };
      } catch (error) {
        console.error("Groq Chat Error:", error);
        return { reply: "Sorry, I am having trouble connecting to my brain right now.", action: null };
      }
    }),
  
  parseTask: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const prompt = `
        You are a highly intelligent task assistant. Extract the details from the following user input and return ONLY a valid JSON object (no markdown formatting, no backticks, just the raw JSON).
        
        Input: "${input.text}"
        
        JSON Format:
        {
          "title": "A concise title of the task",
          "due": "The due date or time extracted. If none, write 'No due date'",
          "priority": "High" | "Medium" | "Low",
          "category": "Tech" | "Design" | "Personal" | "Other",
          "energyLevel": "High" | "Low",
          "contextTag": "at_desk" | "on_the_move" | "gym"
        }
      `;

      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0,
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(responseText);
        
        return {
          title: parsed.title || input.text,
          due: parsed.due || "No due date",
          priority: parsed.priority || "Medium",
          category: parsed.category || "Other",
          energyLevel: parsed.energyLevel || "High",
          contextTag: parsed.contextTag || "at_desk"
        };
      } catch (error) {
        console.error("Groq Parsing Error:", error);
        return {
          title: input.text,
          due: "No due date",
          priority: "Medium",
          category: "Other",
          energyLevel: "High",
          contextTag: "at_desk"
        };
      }
    })
});
