export interface StructuredResponse {
    title: string;
    question: string;
    expectedResponse: string[];
    followUp: string[];
  }
  
  export interface InterviewFormData {
    jobDescription: string;
    interviewType: string;
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;
  }
  
  export interface ResponseDisplayProps {
    isLoading: boolean;
    error?: string;
    response?: StructuredResponse;
    onNextQuestion: () => void;
    onSubmitAnswer?: (answer: string) => Promise<string>;
    onReset?: () => void;
  }
  
  export interface InterviewFormProps {
    onSubmit: (data: InterviewFormData) => Promise<void>;
  }