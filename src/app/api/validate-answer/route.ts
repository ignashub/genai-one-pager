import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const { userAnswer, question, expectedResponse } = await request.json();

    if (!userAnswer || !question || !expectedResponse) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for minimal answers
    if (userAnswer.split(' ').length < 10) {
      return NextResponse.json({
        feedback: `Your answer appears to be too brief (${userAnswer.split(' ').length} words). 
        Please provide a more detailed response that addresses the question:
        
        "${question}"
        
        Expected response should cover:
        ${expectedResponse.map(point => `- ${point}`).join('\n')}
        
        Try to explain your approach thoroughly, considering all the points above.`
      });
    }

    const systemPrompt = `You are an expert interviewer providing feedback on candidate responses. 
    Analyze the answer based on the expected response points and provide constructive feedback.
    
    Guidelines:
    - Be specific about what was covered and what was missing
    - Provide actionable suggestions for improvement
    - Keep feedback professional and constructive
    - Use only English language
    - If the answer is too brief or generic, suggest expanding on specific points
    
    Format your response in these sections:
    1. Strengths: What was well covered
    2. Areas for Improvement: What was missing or could be better
    3. Overall Assessment: Brief summary and suggestions`;

    const userPrompt = `
    Question: ${question}
    
    Expected Response Points:
    ${expectedResponse.join('\n')}
    
    Candidate's Answer:
    ${userAnswer}
    
    Provide detailed, constructive feedback on the answer.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 1,
        topK: 40,
      }
    });

    const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);
    const response = await result.response;
    const feedback = response.text();

    if (!feedback) {
      throw new Error('No feedback received from Gemini API');
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate answer' },
      { status: 500 }
    );
  }
} 