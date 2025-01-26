import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { systemPrompts, generateCustomPrompt } from '@/app/lib/prompt';
import { validateUserInput, validateSystemPrompt } from '@/lib/validation';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received body:', body);
    
    try {
      const inputValidation = await validateUserInput(body);
      if (!inputValidation.success) {
        console.log('Validation failed:', inputValidation.error);
        return new Response(JSON.stringify({ 
          error: 'Invalid input',
          details: inputValidation.error.errors[0]?.message || 'Validation failed'
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const validatedData = inputValidation.data;
      // Validate system prompt if present
      if (validatedData.systemPrompt) {
        const promptValidation = validateSystemPrompt(validatedData.systemPrompt);
        if (!promptValidation.success) {
          return new Response(JSON.stringify({ 
            error: 'Invalid system prompt',
            details: promptValidation.error.errors 
          }), { status: 400 });
        }
      }

      const { jobDescription, interviewType, temperature, maxOutputTokens, topP, topK } = validatedData;

      // Debug log
      console.log('Processing request with:', {
        jobDescription,
        interviewType,
        temperature,
        maxOutputTokens,
        topP,
        topK
      });

      // Input validation
      if (!jobDescription || !interviewType) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate job description length
      if (jobDescription.length > 1000) {
        return NextResponse.json(
          { error: 'Job description too long' },
          { status: 400 }
        );
      }

      // Validate parameters - only check if they're outside valid ranges
      if (typeof temperature !== 'undefined' && (temperature < 0 || temperature > 1)) {
        return NextResponse.json(
          { error: 'Temperature must be between 0 and 1' },
          { status: 400 }
        );
      }

      if (typeof topP !== 'undefined' && (topP < 0 || topP > 1)) {
        return NextResponse.json(
          { error: 'TopP must be between 0 and 1' },
          { status: 400 }
        );
      }

      if (typeof topK !== 'undefined' && (topK < 1 || topK > 100)) {
        return NextResponse.json(
          { error: 'TopK must be between 1 and 100' },
          { status: 400 }
        );
      }

      if (typeof maxOutputTokens !== 'undefined' && (maxOutputTokens < 100 || maxOutputTokens > 2000)) {
        return NextResponse.json(
          { error: 'MaxOutputTokens must be between 100 and 2000' },
          { status: 400 }
        );
      }

      const basePrompt = systemPrompts[interviewType as keyof typeof systemPrompts];
      if (!basePrompt) {
        return NextResponse.json(
          { error: 'Invalid interview type' },
          { status: 400 }
        );
      }

      const fullPrompt = generateCustomPrompt(basePrompt, jobDescription, [interviewType]);

      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: Number(temperature) || 0.7,
          maxOutputTokens: Number(maxOutputTokens) || 1000,
          topP: Number(topP) || 1,
          topK: Number(topK) || 40,
        }
      });

      try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const rawResponse = response.text();

        console.log('Raw Gemini Response:', rawResponse);

        if (!rawResponse) {
          throw new Error('Empty response received from Gemini API');
        }

        // Split response into sections using various possible markers
        const sections = rawResponse.split(/(?:###|\n\n+)/).filter(Boolean);
        
        // Enhanced question extraction
        let question = '';
        
        // Try different methods to extract the question
        for (const section of sections) {
          const cleanSection = section.trim();
          
          // Method 1: Look for explicit Question marker
          if (cleanSection.toLowerCase().includes('question:')) {
            question = cleanSection.split(/question:/i)[1].trim();
            break;
          }
          
          // Method 2: First substantial section if it looks like a question
          if (cleanSection.length > 50 && (
            cleanSection.includes('?') || 
            cleanSection.toLowerCase().includes('how') ||
            cleanSection.toLowerCase().includes('what') ||
            cleanSection.toLowerCase().includes('discuss') ||
            cleanSection.toLowerCase().includes('explain')
          )) {
            question = cleanSection;
            break;
          }
        }

        // If still no question found, use the first substantial section
        if (!question && sections.length > 0) {
          question = sections[0].trim();
        }

        // Extract expected response points with improved parsing
        const expectedSection = sections.find(s => 
          s.toLowerCase().includes('expected response') || 
          s.toLowerCase().includes('response points')
        );

        const expectedResponse = expectedSection
          ?.split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(line => {
            // If line ends with colon, it's a header
            if (line.endsWith(':')) {
              return `**${line}**`; // Mark as header with markdown
            }
            // If line starts with dash or number, it's a point
            if (line.startsWith('-') || /^\d+\./.test(line)) {
              return line.replace(/^[-\d.\s]+/, '').trim();
            }
            return line;
          })
          .filter(Boolean) || [];

        // If no structured points found, create default structure
        if (!expectedResponse.length) {
          expectedResponse.push(
            '**Key Points to Cover:**',
            '- Understanding of the problem',
            '- Technical approach',
            '- Implementation considerations',
            '- Best practices',
            '- Trade-offs and alternatives'
          );
        }

        // Find follow-up questions with improved parsing
        const followUpSection = sections.find(s => 
          s.toLowerCase().includes('follow-up') || 
          s.toLowerCase().includes('follow up')
        );

        let followUp = followUpSection
          ?.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.toLowerCase().includes('follow-up'))
          .map(point => point.replace(/^[-\d.\s]+/, '').trim()) || [];

        // If no follow-up questions found, add defaults
        if (!followUp.length) {
          followUp = [
            'How would you handle edge cases?',
            'What alternatives did you consider?',
            'How would you test this solution?'
          ];
        }

        const structuredResponse = {
          title: titleMap[interviewType] || 'Interview Question',
          question: question || 'Could not parse question. Please try again.',
          expectedResponse,
          followUp
        };

        return NextResponse.json({ response: structuredResponse });

      } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
          { error: 'Failed to generate interview question. Please try again.' },
          { status: 500 }
        );
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return new Response(JSON.stringify({ 
        error: 'Validation error',
        details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const titleMap: { [key: string]: string } = {
  software_engineering: 'Software Engineering Question',
  data_science: 'Data Science Question',
  product_management: 'Product Management Question',
  finance: 'Finance Question',
  hr: 'HR Question',
  marketing: 'Marketing Question',
  operations: 'Operations Question',
  sales: 'Sales Question'
};