"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Wallet, Server, Shield, Zap } from "lucide-react"

interface PaymentFlowProps {
  currentStep?: number
  onStepClick?: (step: number) => void
}

export function PaymentFlow({ currentStep = 0, onStepClick }: PaymentFlowProps) {
  const [activeStep, setActiveStep] = useState(currentStep)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setActiveStep(currentStep)
  }, [currentStep])

  const steps = [
    {
      number: 1,
      title: "Request Content",
      description: "AI agent sends HTTP request",
      icon: Server,
      detail: "GET /api/x402 → Receives 402 Payment Required",
    },
    {
      number: 2,
      title: "Send Payment",
      description: "Pay with crypto wallet",
      icon: Wallet,
      detail: "0.001 ETH → Relayer Address with memo",
    },
    {
      number: 3,
      title: "Get Attestation",
      description: "Relayer generates proof",
      icon: Shield,
      detail: "Signed JWT with transaction hash",
    },
    {
      number: 4,
      title: "Access Content",
      description: "Submit attestation",
      icon: Zap,
      detail: "Server verifies & grants access",
    },
  ]

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick) {
      onStepClick(stepNumber)
    }
    setActiveStep(stepNumber)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const isActive = index === activeStep
            const isCompleted = index < activeStep
            const Icon = step.icon

            return (
              <button
                key={step.number}
                onClick={() => handleStepClick(index)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 relative z-10
                  ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg"
                      : isCompleted
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground"
                  }
                  ${animating && isActive ? "animate-pulse" : ""}
                  group-hover:scale-105 group-hover:border-primary/50
                `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                  )}
                </div>

                <div className="text-center">
                  <div
                    className={`
                    text-xs font-semibold transition-colors
                    ${isActive ? "text-foreground" : "text-muted-foreground"}
                    group-hover:text-foreground
                  `}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground hidden sm:block">{step.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Details */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {(() => {
                  const Icon = steps[activeStep].icon
                  return <Icon className="w-6 h-6 text-primary" />
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Step {activeStep + 1}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-bold">{steps[activeStep].title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{steps[activeStep].description}</p>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <code className="text-xs font-mono">{steps[activeStep].detail}</code>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {activeStep > 0 && (
                <Button variant="outline" size="sm" onClick={() => handleStepClick(activeStep - 1)}>
                  Previous
                </Button>
              )}
              {activeStep < steps.length - 1 && (
                <Button size="sm" onClick={() => handleStepClick(activeStep + 1)}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {activeStep === steps.length - 1 && (
                <Button size="sm" onClick={() => handleStepClick(0)}>
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
