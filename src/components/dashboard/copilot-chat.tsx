"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithCopilot } from "@/lib/actions/copilot";
import { motion, AnimatePresence } from "motion/react";
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

const SUGGESTED_PROMPTS: Record<CoachMode, string[]> = {
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

  const atLimit = !!usage && usage.used >= usage.limit;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
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
                  "px-2 py-1 text-[10px] rounded-md transition-colors",
                  mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
          {usage && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                usage.used >= usage.limit
                  ? "bg-warning/10 text-warning-dark dark:text-warning"
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
                  className="text-left px-3 py-2 text-sm border border-border rounded-lg hover:border-primary/20 hover:bg-primary/5 transition-colors duration-150"
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "FOUNDER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm border ${
                      msg.role === "FOUNDER"
                        ? "bg-primary/10 border-primary/15 text-foreground"
                        : "bg-muted border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center gap-1">
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

        <div className="flex gap-2 pt-3 border-t border-border">
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
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
            disabled={loading || atLimit}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || atLimit}
            className="inline-flex items-center justify-center w-9 h-9 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
