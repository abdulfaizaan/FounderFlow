"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { StepPersonal } from "@/components/onboarding/step-personal";
import { StepStartup } from "@/components/onboarding/step-startup";
import { StepGoal } from "@/components/onboarding/step-goal";
import { StepTasks } from "@/components/onboarding/step-tasks";
import { completeOnboarding, trackOnboardingEvent } from "@/lib/actions/onboarding";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const prevStep = useRef(1);
  const [data, setData] = useState({
    name: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    availableHoursPerDay: 8,
    startupName: "",
    stage: "idea",
    targetCustomer: "",
    goalTitle: "",
    targetDate: "",
    definitionOfSuccess: "",
    milestoneTitle: "",
    tasks: [
      { title: "", estimateMinutes: 30 },
      { title: "", estimateMinutes: 30 },
      { title: "", estimateMinutes: 30 },
    ],
  });

  const updateData = (partial: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    if (!sessionStorage.getItem("ff:signup_started")) {
      sessionStorage.setItem("ff:signup_started", "1");
      trackOnboardingEvent("signup_started");
    }
  }, []);

  useEffect(() => {
    if (step > prevStep.current) {
      trackOnboardingEvent("onboarding_step_completed", step);
    }
    prevStep.current = step;
  }, [step]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await completeOnboarding(data);
      router.push("/today");
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const StepContent = [StepPersonal, StepStartup, StepGoal, StepTasks][step - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border bg-card/80 backdrop-blur-xl p-8 shadow-xl shadow-primary/5"
    >
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Set up your flow</h1>
      </div>
      <p className="text-muted-foreground mb-8 text-balance">
        Tell us about you and your startup so we can recommend what to work on every day.
      </p>

      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <StepContent data={data} updateData={updateData} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Get Started"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
