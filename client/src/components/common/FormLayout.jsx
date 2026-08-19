import React from 'react';
import Card, { CardBody, CardFooter, CardHeader } from './Card';

export default function FormLayout({
  title,
  description,
  currentStep,
  totalSteps,
  children,
  footer,
  className = ''
}) {
  return (
    <div className={`max-w-3xl mx-auto py-8 px-4 ${className}`}>
      <Card className="shadow-sm border border-slate-200/80">
        {(title || currentStep) && (
          <CardHeader className="bg-slate-50/50">
            <div>
              {currentStep && totalSteps && (
                <span className="text-xs font-bold text-[#304355] uppercase tracking-wider block mb-1">
                  Step {currentStep} of {totalSteps}
                </span>
              )}
              {title && <h2 className="text-xl font-bold text-[#1F2933]">{title}</h2>}
              {description && <p className="text-xs text-[#64707A] mt-0.5">{description}</p>}
            </div>
            {currentStep && totalSteps && (
              <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className="bg-[#304355] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            )}
          </CardHeader>
        )}

        <CardBody className="p-6 md:p-8">{children}</CardBody>

        {footer && <CardFooter className="bg-slate-50/50">{footer}</CardFooter>}
      </Card>
    </div>
  );
}
