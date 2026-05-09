"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { api } from "~/trpc/react";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "~/lib/firebase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function Chatbot({ tasks }: { tasks: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "Hi! I'm your AI project assistant. Ask me to add tasks or check your agenda!"
  }]);

  const chatMutation = api.task.chat.useMutation();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMsg = input.trim();
    setInput("");
    
    const newHistory = [...history, { role: "user" as const, content: userMsg }];
    setHistory(newHistory);

    try {
      const response = await chatMutation.mutateAsync({
        message: userMsg,
        tasks: tasks,
        history: history.slice(1) 
      });

      setHistory([...newHistory, { role: "assistant", content: response.reply }]);

      // EXECUTE AGENT ACTION
      if (response.action && response.action.type === "ADD_TASK") {
        await addDoc(collection(db, "tasks"), {
          ...response.action.payload,
          createdAt: serverTimestamp(),
        });
      }

    } catch (error) {
      setHistory([...newHistory, { role: "assistant", content: "Oops, something went wrong. Try again!" }]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="font-medium text-white">Project Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {history.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-500 text-white rounded-tr-sm' 
                        : 'bg-white/10 text-white/90 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white/90 p-3 rounded-2xl rounded-tl-sm text-sm flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your agenda..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 placeholder-white/30"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || chatMutation.isPending}
                  className="p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors bg-white/5 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
