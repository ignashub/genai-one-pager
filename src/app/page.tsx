'use client';

import { useState } from 'react';
import InterviewForm from './components/InterviewForm';
import ResponseDisplay from './components/ResponseDisplay';
import axios from 'axios';
import { StructuredResponse, InterviewFormData } from './types/interview';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [response, setResponse] = useState<StructuredResponse>();
  const [currentFormData, setCurrentFormData] = useState<InterviewFormData>(); // Store form data
  const [feedback, setFeedback] = useState<string>();

  const handleInterviewSubmit = async (formData: InterviewFormData) => {
    setIsLoading(true);
    setError(undefined);
    setCurrentFormData(formData); // Save form data for reuse
    
    try {
      const { data } = await axios.post('/api/chat', formData);
      setResponse(data.response);
    } catch (err) {
      setError('Failed to generate interview question. Please try again.');
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
    setError(undefined);
    setFeedback(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Interview Practice</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Prepare for your next interview with AI-powered practice sessions
          </p>
        </div>

        {/* Always show form if no response, or if it's collapsed */}
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
          error={error}
          response={response}
          onNextQuestion={handleNextQuestion}
          onSubmitAnswer={handleAnswerSubmit}
        />

        {/* Copyright Watermark */}
        <div className="fixed bottom-4 right-4 text-sm text-gray-400 dark:text-gray-500 opacity-70 font-light">
          Ignas Apsega @ Turing College 2025
        </div>
      </div>
    </div>
  );
}