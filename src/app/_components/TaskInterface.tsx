"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Bell, Clock, CheckCircle2, Trash2, Mic, MicOff } from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "~/lib/firebase";
import { getMessaging, getToken } from "firebase/messaging";
import { api } from "~/trpc/react";
import { env } from "~/env.js";
import { Chatbot } from "./Chatbot";

interface Task {
  id: string;
  title: string;
  due: string;
  priority: string;
  category: string;
}

export function TaskInterface() {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [jarvisActive, setJarvisActive] = useState(false);
  const [jarvisTranscript, setJarvisTranscript] = useState("");
  const processingRef = useRef(false);
  const transcriptRef = useRef(""); // Keeps latest transcript for closures
  
  const parseTaskMutation = api.task.parseTask.useMutation();
  const chatMutation = api.task.chat.useMutation();

  // Listen to Firestore tasks in real-time
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(fetchedTasks);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Keyboard Shortcut (Alt + J) to wake Jarvis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setJarvisActive(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // JARVIS VOICE ENGINE (Click-to-Wake / Secure Mode)
  useEffect(() => {
    if (!jarvisActive || typeof window === "undefined") return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = true; 

    let silenceTimer: NodeJS.Timeout;

    recognition.onresult = (event: any) => {
      if (processingRef.current) return;

      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      currentTranscript = currentTranscript.trim().toLowerCase();
      setJarvisTranscript(currentTranscript);
      transcriptRef.current = currentTranscript;

      if (silenceTimer) clearTimeout(silenceTimer);

      if (currentTranscript.length > 0) {
        // Wait 2 seconds after they stop talking to submit
        silenceTimer = setTimeout(async () => {
          if (processingRef.current) return;

          const finalSpeech = transcriptRef.current;

          processingRef.current = true;
          try { recognition.stop(); } catch(e) {}
          
          setJarvisTranscript("Thinking...");
          
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Male"));
          
          const thinking = new SpeechSynthesisUtterance("One moment, Shiv.");
          if (maleVoice) thinking.voice = maleVoice;
          thinking.rate = 1.05;
          thinking.pitch = 0.9;
          window.speechSynthesis.speak(thinking);
          
          try {
            const response = await chatMutation.mutateAsync({
              message: "I just asked this via voice: " + finalSpeech + ". Address me as Shiv. Give a very short, spoken-word response like Jarvis.",
              tasks: tasks,
              history: []
            });

            if (response.action && response.action.type === "ADD_TASK") {
              await addDoc(collection(db, "tasks"), {
                ...response.action.payload,
                createdAt: serverTimestamp(),
              });
            }

            setJarvisTranscript("Replying...");
            const utterance = new SpeechSynthesisUtterance(response.reply);
            if (maleVoice) utterance.voice = maleVoice;
            utterance.rate = 1.05;
            utterance.pitch = 0.9;
            
            utterance.onend = () => {
              // TURN MIC OFF COMPLETELY AFTER REPLY
              transcriptRef.current = "";
              setJarvisTranscript("");
              processingRef.current = false;
              setJarvisActive(false); 
            };
            
            window.speechSynthesis.speak(utterance);
          } catch (error) {
            console.error("Jarvis AI Error:", error);
            setJarvisTranscript("Error connecting to AI.");
            
            setTimeout(() => {
              transcriptRef.current = "";
              setJarvisTranscript("");
              processingRef.current = false;
              setJarvisActive(false); // Kill mic on error
            }, 2000);
          }
        }, 2000); // 2 seconds of silence
      }
    };

    recognition.onend = () => {
      if (jarvisActive && !processingRef.current) {
        try { recognition.start(); } catch(e) {}
      }
    };

    try { recognition.start(); } catch(e) {}

    return () => {
      try { recognition.stop(); } catch(e) {}
    };
  }, [jarvisActive]); // Removed tasks from dependency array so it doesn't re-render while speaking

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || parseTaskMutation.isPending) return;

    const currentInput = taskInput;
    setTaskInput(""); // clear input immediately for better UX

    try {
      // 1. Send to Gemini via tRPC
      const parsedData = await parseTaskMutation.mutateAsync({ text: currentInput });
      
      // 2. Save to Firestore
      await addDoc(collection(db, "tasks"), {
        ...parsedData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to parse/save task", error);
      // fallback
      setTaskInput(currentInput);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, { 
          vapidKey: env.NEXT_PUBLIC_VAPID_KEY 
        });
        
        if (currentToken) {
          // Save the token to Firestore
          await setDoc(doc(db, "subscribers", currentToken), {
            token: currentToken,
            createdAt: serverTimestamp()
          });
          alert("Successfully subscribed to notifications!");
        } else {
          console.log("No registration token available.");
        }
      }
    } catch (err) {
      console.log("An error occurred while retrieving token. ", err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <form 
          onSubmit={handleCreateTask}
          className="relative bg-black rounded-2xl p-4 flex flex-col shadow-2xl border border-white/10"
        >
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreateTask(e as any);
              }
            }}
            placeholder="DUMP THOUGHTS HERE..."
            className={`w-full bg-transparent border-none outline-none text-white placeholder-white/20 text-3xl font-bold tracking-tight resize-none min-h-[120px] transition-all duration-700 ${parseTaskMutation.isPending ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
            disabled={parseTaskMutation.isPending}
            style={{ fontFamily: "'Space Mono', monospace" }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-white/20 text-sm font-mono uppercase tracking-widest">
              {parseTaskMutation.isPending ? "Absorbing..." : "Press Enter to execute"}
            </span>
            <button
              type="submit"
              disabled={!taskInput.trim() || parseTaskMutation.isPending}
              className="bg-white text-black px-6 py-2 rounded-none font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-all disabled:opacity-0"
            >
              Commit
            </button>
          </div>
        </form>
      </motion.div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-white/50 text-sm font-medium">Total Tasks</span>
          <span className="text-2xl font-bold text-white">{tasks.length}</span>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-rose-400/80 text-sm font-medium">High Priority</span>
          <span className="text-2xl font-bold text-rose-400">
            {tasks.filter(t => t.priority === 'High').length}
          </span>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-indigo-400/80 text-sm font-medium">Tech Tasks</span>
          <span className="text-2xl font-bold text-indigo-400">
            {tasks.filter(t => t.category === 'Tech').length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-semibold text-white/90">Your Agenda</h2>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <button 
              onClick={() => {
                setJarvisActive(!jarvisActive);
                if (!jarvisActive) {
                  setJarvisTranscript("Listening...");
                  // Init voices
                  window.speechSynthesis.getVoices();
                  const u = new SpeechSynthesisUtterance("Voice systems online, Shiv.");
                  window.speechSynthesis.speak(u);
                } else {
                  setJarvisTranscript("");
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${jarvisActive ? 'bg-indigo-500/20 text-indigo-400' : 'hover:text-white hover:bg-white/10'}`}
            >
              {jarvisActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
              <span>{jarvisActive ? 'Listening...' : 'Enable Jarvis'}</span>
            </button>
            <button 
              onClick={handleSubscribe}
              className="flex items-center gap-2 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Enable Push Alerts</span>
            </button>
          </div>
        </div>

        {jarvisActive && jarvisTranscript && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
            <Mic className="w-5 h-5 text-indigo-400 animate-pulse" />
            <p className="text-indigo-200 text-sm italic">"{jarvisTranscript}"</p>
          </div>
        )}

        <div className="grid gap-4">
          <AnimatePresence>
            {tasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-white/30"
              >
                Your agenda is clear. Type a task above to get started.
              </motion.div>
            )}
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="mt-1 text-white/30 hover:text-green-400 transition-colors"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <div>
                      <h3 className="text-xl font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/50">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>{task.due}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          <span>{task.priority} Priority</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                          <span className="text-white/70">{task.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      <Chatbot tasks={tasks} />
    </div>
  );
}
