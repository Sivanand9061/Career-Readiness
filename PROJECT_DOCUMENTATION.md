# 📘 Project Documentation: Career Readiness Suite

This document outlines the technical architecture, technology stack, and user workflows for the **Career Readiness Suite** project. It can be used as a reference for your BCA Final Year Project Report or Synopsis.

---

## 🛠️ 1. Technology Stack

### Frontend Architecture
*   **Framework:** Next.js 15 (App Router)
*   **Library:** React 19
*   **Styling:** TailwindCSS (for utility-first, responsive design)
*   **Animations:** Framer Motion (for fluid, professional UI transitions)
*   **Icons:** Lucide-React

### Backend & API Architecture
*   **API Layer:** tRPC (TypeScript Remote Procedure Call) for end-to-end type-safe API endpoints.
*   **Runtime Environment:** Node.js

### Artificial Intelligence & NLP
*   **LLM Engine:** Llama-3.3-70b-versatile
*   **Inference Provider:** Groq API (Chosen specifically for ultra-low latency, real-time conversational responses).

### Native Browser APIs Used
*   **Web Speech API (SpeechRecognition):** Handles continuous Speech-to-Text (STT) transcription via the user's microphone.
*   **Web Speech API (SpeechSynthesis):** Handles Text-to-Speech (TTS) for the Virtual Interviewer's voice.
*   **FileReader API:** Parses local `.txt` file uploads directly in the browser memory without needing a database.

---

## ⚙️ 2. Working of the Project (System Architecture)

The application operates on a modern **Client-Server Architecture** utilizing Next.js and tRPC:

1.  **User Input Phase:** The user provides input either via text fields, local file uploads (`.txt`), or voice dictation (Microphone).
2.  **Processing & Transport:** The React frontend securely packages this data and sends it to the Next.js backend via a tRPC mutation (`api.language.*`).
3.  **AI Orchestration:** The Node.js backend intercepts the request and injects the user's data into highly strict, role-playing System Prompts (e.g., instructing the AI to act as a "Strict ATS Algorithm" or "Professional Hiring Manager").
4.  **LLM Inference:** The backend communicates with the Groq API, executing the Llama-3 model to process the prompt. The model is forced to return either conversational text (for interviews) or strictly validated JSON objects (for the Roadmap and Resume Builder).
5.  **Rendering Phase:** The backend returns the processed data to the client. The frontend then dynamically renders the output:
    *   For Voice: It passes the text to the `SpeechSynthesis` engine to speak out loud.
    *   For JSON: It maps the arrays to Framer Motion animated UI cards or constructs a formatted HTML Canvas (Resume).

---

## 🔄 3. User Workflows

The application is divided into four distinct workflows:

### Workflow A: The Career Launchpad
1.  **Input:** The user enters their Target Job Role, Current Tech Stack, and their Self-Identified Weakness.
2.  **Action:** Clicks "Generate My Launchpad".
3.  **Execution:** The AI processes the gap between their current skills and target role, generating a highly structured JSON array.
4.  **Output:** The UI animates a 3-Phase timeline. Each phase includes specific tasks, tech-stack recommendations, and a "Secret Industry Pro-Tip".

### Workflow B: AI Resume Builder
1.  **Input:** The user types their target role. They then click "Upload File" to select a `.txt` file from their local device containing raw, messy notes about their education and experience.
2.  **Action:** Clicks "Build My Resume".
3.  **Execution:** The AI parses the messy data, expands it using professional action verbs, and maps it to a strict JSON Resume Schema (Personal, Summary, Experience, Projects, Education, Skills).
4.  **Output:** The UI dynamically populates a clean, white-background, LaTeX-style Resume Canvas. The user clicks "Save as PDF" to print the beautifully formatted document.

### Workflow C: Virtual Mock Interviewer
1.  **Setup:** The user types the Job Role they are applying for and clicks "Start Interview".
2.  **Initiation:** The AI verbally introduces itself using the browser's TTS engine.
3.  **Interaction:** The user's microphone automatically activates. The user speaks their answer. When finished, they click the "Done Answering" button.
4.  **Multi-turn Context:** The frontend appends the user's answer to an ongoing `history` array and sends the entire conversation log to the backend.
5.  **Continuation:** The AI evaluates the answer, gives brief feedback, and asks the next question out loud, creating a seamless, human-like loop.

### Workflow D: AI Grammar Reviewer
1.  **Input:** The user pastes a draft email or essay into the text editor (or uses the microphone to dictate it).
2.  **Action:** Clicks "Analyze Grammar".
3.  **Output:** The AI returns an array of specific grammatical errors, explaining the mistake and providing the correction. The user clicks "Fix All" to automatically overwrite their draft with the perfect version.
