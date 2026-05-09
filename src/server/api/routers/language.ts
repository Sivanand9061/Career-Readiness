import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Groq from "groq-sdk";
import { env } from "~/env.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const languageRouter = createTRPCRouter({
  checkGrammar: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const prompt = `You are an expert editor. Analyze the following text for grammar, spelling, and stylistic errors. Return ONLY a JSON object in this exact format:
      {
        "errors": [
          { "original": "teh", "suggestion": "the", "reason": "Spelling mistake" }
        ]
      }
      If the text is perfect, return { "errors": [] }.
      
      Text: "${input.text}"`;
      
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0,
        });

        return JSON.parse(completion.choices[0]?.message?.content || '{"errors":[]}');
      } catch (error) {
        console.error("Grammar Check Error:", error);
        return { errors: [] };
      }
    }),

  fixGrammar: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const prompt = `Rewrite the following text to perfectly fix all grammar, spelling, and awkward phrasing while preserving the original meaning and tone. Return ONLY the rewritten string, no quotes, no markdown, no explanations.
      
      Text: "${input.text}"`;
      
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
        });

        return { fixedText: completion.choices[0]?.message?.content?.trim() || input.text };
      } catch (error) {
        console.error("Grammar Fix Error:", error);
        return { fixedText: input.text };
      }
    }),

  interviewChat: publicProcedure
    .input(z.object({
      role: z.string(),
      message: z.string(),
      history: z.array(z.object({ role: z.string(), content: z.string() }))
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `You are a professional hiring manager conducting a verbal interview for the role described by the candidate: "${input.role}".
You must ask one question at a time. Keep your responses short and conversational, as if spoken out loud. Do not use bullet points or long paragraphs. 
Analyze their previous answer, give a tiny bit of feedback or acknowledgment, and then ask the next question.
If the history is empty, start by introducing yourself and asking the first question.`;
      
      const messages = [
        { role: "system", content: systemPrompt },
        ...input.history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.message }
      ];

      try {
        const completion = await groq.chat.completions.create({
          messages: messages as any,
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
        });

        return { reply: completion.choices[0]?.message?.content || "Could you repeat that?" };
      } catch (error) {
        console.error("Interview Error:", error);
        return { reply: "Sorry, I am having trouble connecting to my brain right now." };
      }
    }),

  generateRoadmap: publicProcedure
    .input(z.object({
      role: z.string(),
      skills: z.string(),
      weakness: z.string(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `You are a top-tier Career Coach for computer science students.
The student is in their final year of a BCA program.
Target Role: ${input.role}
Current Skills: ${input.skills}
Self-Identified Weakness: ${input.weakness}

Create a highly detailed, actionable 3-phase roadmap for them to get hired.
Return ONLY a JSON object in this exact format:
{
  "roadmap": [
    {
      "phase": "Phase Name (e.g., Phase 1: Portfolio & GitHub)",
      "themeColor": "blue", // must be "blue", "purple", "emerald", or "orange"
      "icon": "Github", // must be "Github", "Linkedin", "Code", or "Briefcase"
      "description": "Short explanation of this phase",
      "tasks": [
        {
          "title": "Actionable task name",
          "details": "A deep 2-3 sentence explanation of EXACTLY what to do, what tools to use, and why it matters to recruiters.",
          "actionStep": "A literal first step to take right now (e.g., 'Go to linkedin.com and update headline')"
        }
      ],
      "proTip": "One secret industry tip for this phase"
    }
  ]
}`;

      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        return JSON.parse(completion.choices[0]?.message?.content || '{"roadmap":[]}');
      } catch (error) {
        console.error("Roadmap API Error:", error);
        return { roadmap: [] };
      }
    }),

  buildResume: publicProcedure
    .input(z.object({
      sourceMaterial: z.string(),
      targetRole: z.string(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `You are an elite Resume Writer and Tech Career Coach.
Take the provided raw source material (which could be an old messy resume, scattered notes, or a raw text dump) and BUILD a highly professional, ATS-friendly resume targeted for the role: ${input.targetRole}.
You must expand on their points to sound highly professional, using strong action verbs.
Return ONLY a JSON object in this exact format:
{
  "personal": { "name": "Your Name", "email": "email@example.com", "phone": "", "linkedin": "", "github": "" },
  "summary": "A 3-sentence powerful professional summary.",
  "experience": [
    { "role": "Job Title", "company": "Company Name", "duration": "Jan 2020 - Present", "bullets": ["Strong bullet point 1", "Strong bullet point 2"] }
  ],
  "projects": [
    { "title": "Project Name", "techStack": "React, Node.js", "duration": "2023", "bullets": ["Strong bullet point 1"] }
  ],
  "education": [
    { "degree": "Bachelor of Computer Applications", "institution": "University Name", "year": "2024" }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}

Target Role:
${input.targetRole}

Raw Source Material / Old Resume:
${input.sourceMaterial}`;

      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (error) {
        console.error("Builder API Error:", error);
        return null;
      }
    })
});
