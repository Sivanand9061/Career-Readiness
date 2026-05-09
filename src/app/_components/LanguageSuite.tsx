"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mic, MicOff, Check, X, RefreshCw, PenTool, MessageSquare, Play, Square, Briefcase, GraduationCap, Terminal, Globe, FileText, Code, ChevronRight } from "lucide-react";
import { api } from "~/trpc/react";

export function LanguageSuite() {
  const [activeTab, setActiveTab] = useState<"grammar" | "interview" | "roadmap" | "ats">("roadmap");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 print:max-w-none print:m-0 print:p-0">
      {/* Tab Selector */}
      <div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl w-max print:hidden">
        <button
          onClick={() => setActiveTab("grammar")}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === "grammar" ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Grammar Reviewer
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === "interview" ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Virtual Interviewer
        </button>
        <button
          onClick={() => setActiveTab("roadmap")}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === "roadmap" ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Career Launchpad
        </button>
        <button
          onClick={() => setActiveTab("ats")}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === "ats" ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          ATS Resume Builder
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "grammar" && (
          <motion.div
            key="grammar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GrammarReviewer />
          </motion.div>
        )}
        {activeTab === "interview" && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <VirtualInterviewer />
          </motion.div>
        )}
        {activeTab === "roadmap" && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CareerRoadmap />
          </motion.div>
        )}
        {activeTab === "ats" && (
          <motion.div
            key="ats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AtsResumeBuilder />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// GRAMMAR REVIEWER COMPONENT
// ----------------------------------------------------
function GrammarReviewer() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [errors, setErrors] = useState<Array<{ original: string, suggestion: string, reason: string }>>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const checkMutation = api.language.checkGrammar.useMutation();
  const fixMutation = api.language.fixGrammar.useMutation();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        // Append to existing text
        setText(prev => prev + " " + currentTranscript.trim());
      };
    }
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const checkGrammar = async () => {
    if (!text.trim()) return;
    setIsChecking(true);
    const result = await checkMutation.mutateAsync({ text });
    setErrors(result.errors || []);
    setIsChecking(false);
  };

  const fixAll = async () => {
    if (!text.trim()) return;
    setIsFixing(true);
    const result = await fixMutation.mutateAsync({ text });
    setText(result.fixedText);
    setErrors([]);
    setIsFixing(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your email, story, or essay here... or use your voice."
          className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={checkGrammar}
          disabled={isChecking || !text.trim()}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
        >
          {isChecking ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Analyze Grammar
        </button>
        
        {errors.length > 0 && (
          <button
            onClick={fixAll}
            disabled={isFixing}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            {isFixing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
            Fix All Auto-Magic
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
          <h3 className="text-red-400 font-semibold flex items-center gap-2">
            <X className="w-5 h-5" /> Found {errors.length} Errors
          </h3>
          <div className="grid gap-3">
            {errors.map((err, i) => (
              <div key={i} className="flex flex-col gap-1 bg-black/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-lg">
                  <span className="text-red-400 line-through">{err.original}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-emerald-400 font-medium">{err.suggestion}</span>
                </div>
                <p className="text-gray-400 text-sm">{err.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ----------------------------------------------------
// VIRTUAL INTERVIEWER COMPONENT
// ----------------------------------------------------
function VirtualInterviewer() {
  const [role, setRole] = useState("");
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [history, setHistory] = useState<Array<{ role: string, content: string }>>([]);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState("");

  const interviewMutation = api.language.interviewChat.useMutation();
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const utteranceRef = useRef<any>(null); // Prevent garbage collection of utterance
  
  // Refs to avoid React closure traps in the speech events!
  const statusRef = useRef(status);
  const historyRef = useRef(history);
  const roleRef = useRef(role);
  const isInterviewingRef = useRef(isInterviewing);

  // Keep refs perfectly in sync with state
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { roleRef.current = role; }, [role]);
  useEffect(() => { isInterviewingRef.current = isInterviewing; }, [isInterviewing]);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        currentTranscript = currentTranscript.trim();
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;
      };

      recognitionRef.current.onend = () => {
        if (isInterviewingRef.current && statusRef.current === "listening") {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };
    }

    return () => {
      try { recognitionRef.current?.stop(); } catch(e) {}
    }
  }, []); // NO DEPENDENCIES! Run once and rely purely on Refs!

  const submitAnswer = async () => {
    if (!isInterviewingRef.current || statusRef.current !== "listening") return;
    
    const text = transcriptRef.current;
    if (!text) return; // Don't submit empty answers
    
    // Process answer
    setStatus("thinking");
    try { recognitionRef.current.stop(); } catch(e) {}
    
    const userMsg = { role: "user", content: text };
    setHistory(prev => [...prev, userMsg]);
    
    try {
      const response = await interviewMutation.mutateAsync({
        role: roleRef.current,
        message: text,
        history: historyRef.current 
      });

      const assistantMsg = { role: "assistant", content: response.reply };
      setHistory(prev => [...prev, assistantMsg]);
      
      // Speak
      setStatus("speaking");
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(response.reply);
      // @ts-ignore - Prevent garbage collection
      window.__utterance = utterance;
      
      utterance.rate = 1.0;
      
      utterance.onend = () => {
        if (isInterviewingRef.current) {
          setStatus("listening");
          transcriptRef.current = "";
          setTranscript("");
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };
      
      utterance.onerror = (e) => {
        console.error("Speech Error:", e);
        if (isInterviewingRef.current) {
          setStatus("listening");
          transcriptRef.current = "";
          setTranscript("");
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Interview API Error:", error);
      setStatus("listening");
      transcriptRef.current = "";
      setTranscript("Error connecting. Please try again.");
      try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  const startInterview = async () => {
    if (!role.trim()) return;
    setIsInterviewing(true);
    setStatus("thinking");
    setHistory([]);
    setTranscript("");
    transcriptRef.current = "";
    
    window.speechSynthesis.cancel(); // Clear queue BEFORE the API delay!
    
    // Initial greeting
    const response = await interviewMutation.mutateAsync({
      role,
      message: "Hello, I am ready for the interview.",
      history: []
    });

    setHistory([{ role: "assistant", content: response.reply }]);
    setStatus("speaking");
    
    const utterance = new SpeechSynthesisUtterance(response.reply);
    // @ts-ignore - Prevent garbage collection
    window.__utterance = utterance;
    
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      setStatus("listening");
      try { recognitionRef.current?.start(); } catch(e) {}
    };

    utterance.onerror = (e) => {
      console.error("Speech Error:", e);
      setStatus("listening");
      try { recognitionRef.current?.start(); } catch(e) {}
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopInterview = () => {
    setIsInterviewing(false);
    setStatus("idle");
    window.speechSynthesis.cancel();
    try { recognitionRef.current?.stop(); } catch(e) {}
  };

  return (
    <div className="space-y-6">
      {!isInterviewing ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 space-y-6 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-white">The Virtual Interviewer</h2>
            <p className="text-emerald-200/80">
              Describe the role you are applying for, your experience level, and the focus of the interview. 
              The AI will dynamically adapt to your context.
            </p>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Junior React Developer at a fintech startup"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={startInterview}
              disabled={!role.trim()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Interview
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 space-y-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          
          <div className="relative">
            {status === "listening" && (
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
            )}
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${status === 'listening' ? 'bg-emerald-500 text-white' : status === 'speaking' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
              {status === "listening" && <Mic className="w-12 h-12" />}
              {status === "thinking" && <RefreshCw className="w-12 h-12 animate-spin" />}
              {status === "speaking" && <MessageSquare className="w-12 h-12" />}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
              {status}
            </h3>
            {transcript && (
              <p className="text-emerald-300 text-lg italic max-w-2xl mx-auto">
                "{transcript}"
              </p>
            )}
          </div>

          <div className="flex gap-4">
            {status === "listening" && (
              <button
                onClick={submitAnswer}
                disabled={!transcript.trim()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Done Answering
              </button>
            )}
            <button
              onClick={stopInterview}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-6 py-3 rounded-xl font-medium transition-all"
            >
              <Square className="w-5 h-5 fill-current" />
              End Interview
            </button>
          </div>

        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 max-h-[400px] overflow-y-auto">
          <h4 className="text-white font-semibold">Interview Log</h4>
          <div className="space-y-4">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-white'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// CAREER ROADMAP COMPONENT
// ----------------------------------------------------
function CareerRoadmap() {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [weakness, setWeakness] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any[]>([]);

  const roadmapMutation = api.language.generateRoadmap.useMutation();

  const handleGenerate = async () => {
    if (!role || !skills) return;
    setIsGenerating(true);
    const result = await roadmapMutation.mutateAsync({ role, skills, weakness });
    setRoadmap(result.roadmap || []);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      {roadmap.length === 0 ? (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <GraduationCap className="w-12 h-12 text-purple-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Final Year Launchpad</h2>
            <p className="text-purple-200/80">
              Tell us what you know and where you want to go. The AI will generate a personalized, 
              step-by-step BCA graduation roadmap for your LinkedIn, GitHub, and job hunt.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-purple-300 font-medium">Target Job Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Junior React Developer, Data Analyst"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-purple-300 font-medium">Current Tech Stack / Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., HTML, CSS, basics of JavaScript, Java"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-purple-300 font-medium">Biggest Weakness (Optional)</label>
              <input
                type="text"
                value={weakness}
                onChange={(e) => setWeakness(e.target.value)}
                placeholder="e.g., I have 0 projects on GitHub, or I have no LinkedIn connections"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !role || !skills}
              className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 mt-4"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate My Launchpad
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your BCA Career Roadmap</h2>
            <button
              onClick={() => setRoadmap([])}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Start Over
            </button>
          </div>
          
          <div className="grid gap-8">
            {roadmap.map((phase, i) => {
              const IconComponent = phase.icon === "Github" ? Terminal : phase.icon === "Linkedin" ? Globe : phase.icon === "Code" ? Code : Briefcase;
              
              const colorMap: Record<string, string> = {
                blue: "from-blue-500/20 border-blue-500/30 text-blue-400 bg-blue-500",
                purple: "from-purple-500/20 border-purple-500/30 text-purple-400 bg-purple-500",
                emerald: "from-emerald-500/20 border-emerald-500/30 text-emerald-400 bg-emerald-500",
                orange: "from-orange-500/20 border-orange-500/30 text-orange-400 bg-orange-500"
              };
              
              const theme = colorMap[phase.themeColor] || colorMap["purple"] || "";
              const textTheme = theme.split(" ")[2] || "";
              const bgTheme = theme.split(" ")[3] || "";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`bg-gradient-to-br bg-black/40 ${theme.split(" ")[0]} border ${theme.split(" ")[1]} rounded-2xl p-8 relative overflow-hidden`}
                >
                  <div className="absolute -right-4 -top-8 text-[150px] font-black text-white/[0.03] pointer-events-none select-none">
                    {i + 1}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className={`p-4 rounded-2xl bg-black/40 border ${theme.split(" ")[1]}`}>
                      <IconComponent className={`w-8 h-8 ${textTheme}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${textTheme}`}>{phase.phase}</h3>
                      <p className="text-gray-400">{phase.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 mb-8 relative z-10">
                    {phase.tasks.map((task: any, tIdx: number) => (
                      <div key={tIdx} className="bg-black/40 border border-white/5 p-5 rounded-xl space-y-3 hover:border-white/10 transition-all">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${bgTheme}/20 p-1 rounded`}>
                            <ChevronRight className={`w-4 h-4 ${textTheme}`} />
                          </div>
                          <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm pl-9 leading-relaxed">{task.details}</p>
                        <div className="pl-9 pt-2">
                          <div className={`inline-block px-3 py-1.5 rounded-md ${bgTheme}/10 border ${theme.split(" ")[1]} text-xs font-medium ${textTheme}`}>
                            Action Step: {task.actionStep}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`bg-black/60 border border-dashed ${theme.split(" ")[1]} rounded-xl p-5 flex gap-4 relative z-10`}>
                    <Sparkles className={`w-6 h-6 ${textTheme} shrink-0`} />
                    <div>
                      <h4 className={`${textTheme} font-bold text-sm tracking-wide uppercase mb-1`}>Secret Industry Pro-Tip</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{phase.proTip}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// AI RESUME BUILDER COMPONENT
// ----------------------------------------------------
function AtsResumeBuilder() {
  const [targetRole, setTargetRole] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const builderMutation = api.language.buildResume.useMutation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSourceMaterial(text);
    };
    reader.readAsText(file);
  };

  const handleBuild = async () => {
    if (!targetRole || !sourceMaterial) return;
    setIsBuilding(true);
    const data = await builderMutation.mutateAsync({ targetRole, sourceMaterial });
    setResumeData(data);
    setIsBuilding(false);
  };

  return (
    <div className="space-y-8">
      {!resumeData ? (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-8 space-y-8 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <FileText className="w-12 h-12 text-orange-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">AI Resume Builder</h2>
            <p className="text-orange-200/80 max-w-xl mx-auto">
              Don't have a formatted resume? Upload your raw notes, old text resume, or just type out what you did. 
              The AI will instantly build a perfectly structured, beautifully formatted PDF-ready resume.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-orange-300 font-medium">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Junior Frontend Developer"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm text-orange-300 font-medium">Raw Source Material</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition-all font-medium"
                >
                  Upload File (.txt)
                </button>
                <input 
                  type="file" 
                  accept=".txt" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
              </div>
              <textarea
                value={sourceMaterial}
                onChange={(e) => setSourceMaterial(e.target.value)}
                placeholder="Upload a .txt file, or type your raw notes here. Example: 'I know React. I built a weather app last year. I study at ABC college...'"
                className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleBuild}
              disabled={isBuilding || !targetRole || !sourceMaterial}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50"
            >
              {isBuilding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
              Build My Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 print:space-y-0">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-2xl font-bold text-white">Your New Resume</h2>
            <button
              onClick={() => setResumeData(null)}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium"
            >
              Build Another
            </button>
          </div>

          {/* The Resume Preview Canvas */}
          <div id="resume-canvas" className="bg-white rounded-xl p-10 text-black max-w-4xl mx-auto shadow-2xl font-sans print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none">
            
            {/* Header */}
            <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{resumeData.personal?.name || "YOUR NAME"}</h1>
              <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-gray-600 font-medium">
                {resumeData.personal?.email && <span>{resumeData.personal.email}</span>}
                {resumeData.personal?.phone && <span>• {resumeData.personal.phone}</span>}
                {resumeData.personal?.linkedin && <span>• {resumeData.personal.linkedin}</span>}
                {resumeData.personal?.github && <span>• {resumeData.personal.github}</span>}
              </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Professional Summary</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{resumeData.summary}</p>
              </div>
            )}

            {/* Skills */}
            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Technical Skills</h3>
                <p className="text-gray-700 text-sm"><span className="font-semibold">Core Stack:</span> {resumeData.skills.join(", ")}</p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience && resumeData.experience.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Experience</h3>
                <div className="space-y-5">
                  {resumeData.experience.map((exp: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-gray-900">{exp.role}</h4>
                        <span className="text-sm font-semibold text-gray-600">{exp.duration}</span>
                      </div>
                      <div className="text-gray-600 font-medium text-sm mb-2">{exp.company}</div>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-2">
                        {exp.bullets?.map((bullet: string, j: number) => (
                          <li key={j} className="leading-snug">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Projects</h3>
                <div className="space-y-5">
                  {resumeData.projects.map((proj: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-gray-900">{proj.title} <span className="font-normal text-gray-500">| {proj.techStack}</span></h4>
                        <span className="text-sm font-semibold text-gray-600">{proj.duration}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-2">
                        {proj.bullets?.map((bullet: string, j: number) => (
                          <li key={j} className="leading-snug">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Education</h3>
                <div className="space-y-3">
                  {resumeData.education.map((edu: any, i: number) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <h4 className="font-bold text-gray-900">{edu.institution}</h4>
                        <div className="text-gray-700 text-sm">{edu.degree}</div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          
          <div className="flex justify-center mt-6 print:hidden">
            <button
              onClick={() => {
                // Minor delay to ensure styles apply before printing
                setTimeout(() => window.print(), 100);
              }}
              className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Save as PDF / Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
