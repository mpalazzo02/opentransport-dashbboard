import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                    isCompleted && "border-openTransport-primary bg-openTransport-primary text-white",
                    isCurrent && "border-openTransport-primary text-openTransport-primary",
                    !isCompleted && !isCurrent && "border-gray-300 text-gray-500",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-openTransport-primary",
                      !isCurrent && "text-gray-500",
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && <div className="text-xs text-gray-500 mt-1">{step.description}</div>}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn("flex-1 h-0.5 mx-4 mt-4", isCompleted ? "bg-openTransport-primary" : "bg-gray-300")}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
