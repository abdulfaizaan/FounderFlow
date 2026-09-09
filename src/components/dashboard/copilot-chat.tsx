"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithCopilot } from "@/lib/actions/copilot";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";

interface Message {
  role: "FOUNDER" | "AI";
  content: string;
}

interface CopilotChatProps {
  history: Message[];
  usage?: { used: number; limit: number };
}

const SUGGESTED_PROMPTS = [
  "What should I work on today?",
  "I have 3 hours, what should I do?",
  "Why am I not making progress?",
  "What's my biggest risk?",
];

import { useState, useRef, useEffect } from "react";
import { chatWithCopilot } from "@/lib/actions/copilot";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "FOUNDER" | "AI";
  content: string;
}

type CoachMode = "tactical" | "strategic" | "support";

interface CopilotChatProps {
  history: Message[];
  usage?: { used: number; limit: number };
}

const MODE_LABELS: Record<CoachMode, string> = {
  tactical: "Tactical",
  strategic: "Strategic",
  support: "Support",
};

const SUGGESTED_PROMPTS = {
  tactical: ["What should I work on today?", "I have 3 hours, what should I do?"],
  strategic: ["Why am I not making progress?", "What's my biggest risk?"],
  support: ["How do I deal with burnout?", "I'm feeling overwhelmed, help me prioritize."],
};

export function CopilotChat({ history, usage }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>(history);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<CoachMode>("tactical");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || loading || atLimit) return;

    const userMessage: Message = { role: "FOUNDER", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await chatWithCopilot(message, mode);
      const aiMessage: Message = { role: "AI", content: result.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "AI",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const atLimit = !!usage && usage.used >= usage.limit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-2xl border bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6349ea] to-[#0099ff] flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold">AI Coach</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-lg p-1">
            {(Object.keys(MODE_LABELS) as CoachMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-2 py-1 text-[10px] rounded-md transition-all",
                  mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
          {usage && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                usage.used >= usage.limit
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
              title={`${usage.used} of ${usage.limit} AI messages used this month. Resets on the 1st.`}
            >
              {usage.used} / {usage.limit}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {messages.length === 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Try asking:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS[mode].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={`${i}-${msg.content.length}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "FOUNDER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "FOUNDER"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground flex items-center gap-1">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    Thinking
                  </motion.span>
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              atLimit
                ? "Monthly AI limit reached — resets on the 1st"
                : `Ask your ${mode} coach...`
            }
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
            disabled={loading || atLimit}
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || atLimit}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-9 h-9 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
