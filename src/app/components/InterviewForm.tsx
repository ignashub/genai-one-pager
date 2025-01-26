'use client';

import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { InterviewFormProps, InterviewFormData } from '../types/interview';

const interviewTypes = [
  { label: 'Software Engineering', value: 'software_engineering' },
  { label: 'Data Science', value: 'data_science' },
  { label: 'Product Management', value: 'product_management' },
  { label: 'Finance', value: 'finance' },
  { label: 'Human Resources', value: 'hr' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Operations', value: 'operations' },
  { label: 'Sales', value: 'sales' }
];

export default function InterviewForm({ onSubmit }: InterviewFormProps) {
  const toast = useRef<Toast>(null);
  const [formData, setFormData] = useState<InterviewFormData>({
    jobDescription: '',
    interviewType: 'software_engineering',
    temperature: 0.7,
    maxOutputTokens: 1000,
    topP: 1,
    topK: 40
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate input';
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: errorMessage,
        life: 5000
      });
      console.error('Form submission error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 animate-fade-in">
      <Toast ref={toast} />
      <Card title="Interview Practice Setup" className="shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Job Description Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="jobDescription" className="font-medium">
              Job Description
            </label>
            <InputTextarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              rows={5}
              className="w-full"
              placeholder="Paste the job description here or describe the position you're preparing for..."
            />
          </div>

          {/* Interview Type Selection */}
          <div className="flex flex-col gap-2">
            <label htmlFor="interviewType" className="font-medium">
              Department/Role
            </label>
            <Dropdown
              id="interviewType"
              value={formData.interviewType}
              onChange={(e) =>
                setFormData({ ...formData, interviewType: e.value })
              }
              options={interviewTypes}
              placeholder="Select department or role"
              className="w-full"
            />
          </div>

          {/* Temperature Control */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Response Creativity: {formData.temperature.toFixed(1)}
            </label>
            <Slider
              value={formData.temperature}
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.value as number })
              }
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              Lower values for focused responses, higher for more creative ones
            </span>
          </div>

          {/* Max Output Tokens Control */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Max Output Length: {formData.maxOutputTokens}
            </label>
            <Slider
              value={formData.maxOutputTokens}
              onChange={(e) =>
                setFormData({ ...formData, maxOutputTokens: e.value as number })
              }
              min={100}
              max={2000}
              step={100}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              Controls the maximum length of generated responses
            </span>
          </div>

          {/* Top P Control */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Response Diversity (Top P): {formData.topP.toFixed(1)}
            </label>
            <Slider
              value={formData.topP}
              onChange={(e) =>
                setFormData({ ...formData, topP: e.value as number })
              }
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              Higher values increase response diversity
            </span>
          </div>

          {/* Top K Control */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Vocabulary Range (Top K): {formData.topK}
            </label>
            <Slider
              value={formData.topK}
              onChange={(e) =>
                setFormData({ ...formData, topK: e.value as number })
              }
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              Controls the range of words considered for responses
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-none font-semibold shadow-md px-6 py-3 text-lg group relative overflow-hidden flex justify-center items-center min-h-[3.5rem]"
          >
            <span className={`transition-opacity duration-200 absolute inset-0 flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <i className="pi pi-play" /> Start Interview Practice
            </span>
            <span className={`transition-opacity duration-200 absolute inset-0 flex items-center justify-center ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
              <span className="flex items-center gap-1">
                Preparing...
                <ProgressSpinner
                  style={{ width: '24px', height: '24px' }}
                  strokeWidth="4"
                  animationDuration=".5s"
                />
              </span>
            </span>
          </Button>
        </form>
      </Card>
    </div>
  );
}