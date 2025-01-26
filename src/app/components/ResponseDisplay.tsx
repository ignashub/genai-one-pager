'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { InputTextarea } from 'primereact/inputtextarea';
import { ResponseDisplayProps } from '../types/interview';
import { ProgressSpinner } from 'primereact/progressspinner';

// Add LoadingDisplay component
const LoadingDisplay = () => (
  <div className="w-full max-w-3xl mx-auto mt-8 flex justify-center items-center p-8">
    <Card className="w-full shadow-lg">
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <ProgressSpinner
          style={{ width: '50px', height: '50px' }}
          strokeWidth="4"
          animationDuration=".5s"
        />
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Generating interview question...
        </p>
      </div>
    </Card>
  </div>
);

export default function ResponseDisplay({
  isLoading,
  response,
  onNextQuestion,
  onSubmitAnswer
}: ResponseDisplayProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset feedback when component is reset
  useEffect(() => {
    if (!response) {
      setFeedback(null);
      setUserAnswer('');
    }
  }, [response]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await onSubmitAnswer?.(userAnswer);
      setFeedback(result ?? null);
      setUserAnswer(''); // Clear answer after submission
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingDisplay />;
  }

  if (!response) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
      <Card className="shadow-lg">
        <div className="flex flex-col gap-6">
          {/* Title */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
            <h2 className="text-xl font-bold">{response.title}</h2>
          </div>

          {/* Question */}
          <div>
            <p className="text-lg leading-relaxed">{response.question}</p>
          </div>

          {/* Answer Input */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Your Answer:</h3>
            <InputTextarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer here..."
              className="w-full"
            />
            {/* Submit Answer Button */}
            <Button
              icon={isSubmitting ? undefined : 'pi pi-check'}
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !userAnswer.trim()}
              className="w-fit bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-none font-semibold shadow-md px-6 py-3 text-lg mt-2 group relative overflow-hidden gap-2"
            >
              <span className={`transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                Submit Answer
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isSubmitting ? 'opacity-100' : 'opacity-0'}`}>
                <span className="flex items-center gap-1">
                  Submitting...
                  <ProgressSpinner
                    style={{ width: '20px', height: '20px' }}
                    strokeWidth="4"
                    animationDuration=".5s"
                  />
                </span>
              </span>
            </Button>
          </div>

          {/* Feedback Display */}
          {feedback && (
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                Feedback
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {/* Split feedback into sections and style them */}
                {feedback.split('\n').map((section, index) => {
                  // Remove ### markers and clean up the text
                  const cleanSection = section.replace(/^###\s*/, '').trim();

                  // Function to format text with bold sections
                  const formatBoldText = (text: string) => {
                    return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        // Remove ** and render as bold
                        return (
                          <strong key={i} className="font-semibold text-slate-800 dark:text-slate-200">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    });
                  };

                  if (cleanSection.startsWith('Strengths:')) {
                    return (
                      <div key={index} className="mb-4">
                        <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                          Strengths
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                          {formatBoldText(cleanSection.replace('Strengths:', '').trim())}
                        </p>
                      </div>
                    );
                  } else if (cleanSection.startsWith('Areas for Improvement:')) {
                    return (
                      <div key={index} className="mb-4">
                        <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-2">
                          Areas for Improvement
                        </h4>
                        <div className="text-slate-600 dark:text-slate-300">
                          {cleanSection.replace('Areas for Improvement:', '').trim()
                            .split(/(?=\d+\.\s)/)
                            .filter(item => item.trim())
                            .map((point, pointIndex) => (
                              <div key={pointIndex} className="mb-3">
                                {formatBoldText(point)}
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  } else if (cleanSection.startsWith('Overall Assessment:')) {
                    return (
                      <div key={index} className="mb-4">
                        <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          Overall Assessment
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                          {formatBoldText(cleanSection.replace('Overall Assessment:', '').trim())}
                        </p>
                      </div>
                    );
                  } else if (cleanSection.trim()) {
                    return (
                      <p key={index} className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-2">
                        {formatBoldText(cleanSection)}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Expected Response (show after submission) */}
          {feedback && (
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                Expected Response Should Cover:
              </h3>
              <div className="space-y-4">
                {response.expectedResponse.map((point, index) => {
                  // Check if the point is a header (starts with **)
                  if (point.startsWith('**') && point.includes(':**')) {
                    const headerText = point.replace(/\*\*/g, '');
                    return (
                      <div key={index} className="mb-2">
                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {headerText}
                        </h4>
                      </div>
                    );
                  } else {
                    // Regular point - remove any leading dash or bullet
                    const cleanPoint = point.replace(/^[-•]\s*/, '').trim();
                    return (
                      <div key={index} className="pl-4">
                        <p className="text-slate-600 dark:text-slate-300 mb-1">
                          • {cleanPoint}
                        </p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            {/* Next Question Button */}
            <Button
              icon={isLoading ? undefined : 'pi pi-arrow-right'}
              onClick={() => {
                setFeedback(null);
                setUserAnswer('');
                onNextQuestion();
              }}
              disabled={isLoading}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-none font-semibold shadow-md px-6 py-3 text-lg group relative overflow-hidden gap-2"
            >
              <span className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Next Question
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                <span className="flex items-center gap-1">
                  Loading...
                  <ProgressSpinner
                    style={{ width: '20px', height: '20px' }}
                    strokeWidth="4"
                    animationDuration=".5s"
                  />
                </span>
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}