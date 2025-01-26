'use client';

import { useState, useRef } from 'react';
import InterviewForm from './components/InterviewForm';
import ResponseDisplay from './components/ResponseDisplay';
import axios from 'axios';
import { StructuredResponse, InterviewFormData } from './types/interview';
import { useHasMounted } from '@/hooks/useHasMounted';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

export default function Home() {
  const hasMounted = useHasMounted();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<StructuredResponse>();
  const [currentFormData, setCurrentFormData] = useState<InterviewFormData>();
  const [feedback, setFeedback] = useState<string>();
  const toast = useRef<Toast>(null);

  const handleInterviewSubmit = async (formData: InterviewFormData) => {
    setIsLoading(true);
    setCurrentFormData(formData);
    
    try {
      const { data } = await axios.post('/api/chat', formData);
      setResponse(data.response);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.details) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation Error',
          detail: err.response.data.details,
          life: 5000,
          className: 'custom-toast',
          contentClassName: 'custom-toast-content',
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569'
          },
          contentStyle: {
            background: '#1e293b',
            color: '#f8fafc'
          }
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate interview question. Please try again.',
          life: 5000,
          className: 'custom-toast',
          contentClassName: 'custom-toast-content',
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569'
          },
          contentStyle: {
            background: '#1e293b',
            color: '#f8fafc'
          }
        });
      }
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!response) return;
    
    try {
      const { data } = await axios.post('/api/validate-answer', {
        userAnswer: answer,
        question: response.question,
        expectedResponse: response.expectedResponse
      });
      
      return data.feedback;
    } catch (err) {
      console.error('Error validating answer:', err);
      throw new Error('Failed to validate answer');
    }
  };

  const handleNextQuestion = async () => {
    if (currentFormData) {
      await handleInterviewSubmit(currentFormData);
    }
  };

  const handleStartOver = () => {
    setResponse(undefined);
    setCurrentFormData(undefined);
    setFeedback(undefined);
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-900">
      <Toast ref={toast} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Interview Practice</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Prepare for your next interview with AI-powered practice sessions
          </p>
        </div>

        {!response ? (
          <InterviewForm onSubmit={handleInterviewSubmit} />
        ) : (
          <div className="text-right mb-4 animate-fade-in">
            <button
              onClick={handleStartOver}
              className="px-6 py-3 rounded-md bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white transition-all duration-200 flex items-center gap-3 font-semibold shadow-md text-lg"
            >
              <span>←</span> Start Over
            </button>
          </div>
        )}
        
        <ResponseDisplay
          isLoading={isLoading}
          response={response}
          onNextQuestion={handleNextQuestion}
          onSubmitAnswer={handleAnswerSubmit}
        />

        <div className="fixed bottom-4 right-4 text-sm text-gray-400 dark:text-gray-500 opacity-70 font-light">
          Ignas Apsega @ Turing College 2025
        </div>
      </div>
    </div>
  );
}