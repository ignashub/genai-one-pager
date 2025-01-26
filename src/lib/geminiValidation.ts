import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Add role name mapping
const roleDisplayNames: Record<string, string> = {
  'software_engineering': 'Software Engineering',
  'data_science': 'Data Science',
  'product_management': 'Product Management',
  'sales': 'Sales',
  'marketing': 'Marketing',
  'finance': 'Finance',
  'hr': 'Human Resources',
  'operations': 'Operations'
};

const validationPrompt = `You are an AI job description validator. Analyze the provided job description and determine its role type.

Job Categories and Keywords to Consider:
- software_engineering: programming, development, coding, software, engineering, technical, algorithms
- data_science: data analysis, machine learning, statistics, analytics, modeling, Python, R
- product_management: product strategy, user experience, roadmap, stakeholder
- sales: sales, revenue, client relationships, deals, pipeline, CRM
- marketing: marketing strategy, campaigns, brand, digital marketing
- finance: financial analysis, accounting, budgeting, forecasting
- hr: recruitment, HR policies, employee relations, talent management
- operations: operations management, process optimization, logistics

Analyze the job description and return ONLY a JSON object (no markdown, no backticks) in this format:
{
  "isValid": boolean,
  "reason": string,
  "sanitizedContent": string | null,
  "detectedRole": string,
  "keywordsFound": string[],
  "suggestedAction": string
}

Selected Interview Type: "{interviewType}"`;

export async function validateWithGemini(content: string, interviewType: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const formattedPrompt = validationPrompt.replace('{interviewType}', interviewType);
    
    const result = await model.generateContent([
      formattedPrompt,
      content || '(empty input)'
    ]);
    
    const response = await result.response;
    let responseText = response.text();
    
    // Clean up the response text by removing markdown formatting
    responseText = responseText.replace(/```json\n?|\n?```/g, '');
    responseText = responseText.trim();
    
    try {
      const validationResult = JSON.parse(responseText);
      console.log('Gemini Validation Result:', validationResult);
      
      // Format the reason message with display names
      if (!validationResult.isValid) {
        const selectedDisplayName = roleDisplayNames[interviewType] || interviewType;
        const detectedDisplayName = roleDisplayNames[validationResult.detectedRole] || validationResult.detectedRole;
        
        validationResult.reason = validationResult.reason.replace(
          new RegExp(`'${interviewType}'|${interviewType}`, 'g'),
          selectedDisplayName
        );
        
        if (validationResult.detectedRole !== interviewType) {
          validationResult.suggestedAction = `Consider changing the interview type to '${detectedDisplayName}'`;
        }
      }
      
      return validationResult;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Response Text:', responseText);
      throw new Error('Failed to parse validation result');
    }
  } catch (error) {
    console.error('Gemini validation error:', error);
    throw new Error('Content validation failed. Please try again.');
  }
} 