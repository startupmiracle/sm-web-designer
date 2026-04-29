"use client";

import { Check } from "lucide-react";

const steps = ["Analyzing", "Designing", "Building", "Deploying"];

interface ProgressStepperProps {
  currentStep: number;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <div className="rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const isDone = currentStep > index;
          const isActive = currentStep === index;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                isActive
                  ? "border-[oklch(0.48_0.12_155)] bg-[oklch(0.95_0.03_150)]"
                  : "border-[oklch(0.9_0.02_90)] bg-[oklch(0.985_0.005_90)]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone || isActive
                    ? "bg-[oklch(0.48_0.12_155)] text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="text-sm font-medium text-stone-700">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
