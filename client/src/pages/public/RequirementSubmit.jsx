import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import FormLayout from '../../components/common/FormLayout';
import Step1Requester from '../../components/domain/requirement-submit/Step1Requester';
import Step2Location from '../../components/domain/requirement-submit/Step2Location';
import Step3Beneficiaries from '../../components/domain/requirement-submit/Step3Beneficiaries';
import Step4Items from '../../components/domain/requirement-submit/Step4Items';
import Step5Urgency from '../../components/domain/requirement-submit/Step5Urgency';
import Step6Details from '../../components/domain/requirement-submit/Step6Details';
import Step7Review from '../../components/domain/requirement-submit/Step7Review';
import Step8Success from '../../components/domain/requirement-submit/Step8Success';
import { useAuth } from '../../hooks/useAuth';
import { requirementService } from '../../services/api';

export default function RequirementSubmit() {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const totalSteps = 7;

  const [formData, setFormData] = useState({
    // Step 1
    requester_type: 'individual',
    name: '',
    institution_name: '',
    institution_type: '',
    // Step 2
    state: 'maharashtra',
    district: '',
    city: '',
    address: '',
    // Step 3
    beneficiary_count: '',
    beneficiary_desc: '',
    // Step 4
    items: [{ name: '', quantity: '', unit: 'kg' }],
    // Step 5
    urgency: 'medium',
    // Step 6
    description: '',
    additional_notes: '',
  });

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNext = async () => {
    if (currentStep === 7) {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await requirementService.create(token, formData);
        setCurrentStep(8);
      } catch (err) {
        setSubmitError(err.message || 'Failed to submit requirement. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Requester formData={formData} updateData={updateData} onNext={handleNext} />;
      case 2:
        return <Step2Location formData={formData} updateData={updateData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Beneficiaries formData={formData} updateData={updateData} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4Items formData={formData} updateData={updateData} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Step5Urgency formData={formData} updateData={updateData} onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <Step6Details formData={formData} updateData={updateData} onNext={handleNext} onBack={handleBack} />;
      case 7:
        return (
          <Step7Review
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            setStep={setCurrentStep}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        );
      case 8:
        return <Step8Success />;
      default:
        return <Step1Requester formData={formData} updateData={updateData} onNext={handleNext} />;
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        {currentStep < 8 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#304355] uppercase tracking-wider block mb-1">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
              <div
                className="bg-[#304355] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {renderStep()}
      </div>
    </PageContainer>
  );
}
