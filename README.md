# AI Interview Practice

An AI-powered interview preparation tool built with Next.js, Google's Gemini AI, Tailwind CSS, and PrimeReact. This application helps users practice for interviews by generating role-specific questions and providing detailed feedback on their answers.

## Live

[https://genai-one-pager.vercel.app](https://genai-one-pager.vercel.app)

## Features

- **Role-Based Questions**: Supports multiple roles including:
  - Software Engineering
  - Data Science
  - Product Management
  - Sales
  - Marketing
  - Finance
  - HR
  - Operations

- **Smart Validation**: Uses Gemini AI to validate job descriptions and ensure they match the selected role by:
  - Analyzing job description content
  - Detecting role-specific keywords
  - Providing suggestions if there's a mismatch
  - Sanitizing inappropriate content

- **Interactive Question Generation**:
  - Creates tailored questions based on job description
  - Includes expected response points
  - Generates relevant follow-up questions
  - Adapts difficulty based on role

- **Answer Evaluation**:
  - Real-time feedback on answers
  - Structured feedback sections:
    - Strengths
    - Areas for Improvement
    - Overall Assessment
  - Minimum word count validation
  - Specific improvement suggestions

- **Advanced Prompting Techniques**: Implements various prompting strategies:
  - Few-Shot Learning
  - Chain-of-Thought
  - Role Prompting with Task Decomposition

- **Customizable AI Parameters**: Fine-tune question generation with:
  - Temperature (0-1)
  - Max Output Tokens (100-2000)
  - Top-P (0-1)
  - Top-K (1-100)

- **Security Features**:
  - Rate limiting (20 requests/minute)
  - Input validation
  - Content moderation
  - Error handling

- **UI Features**:
  - Dark/Light mode
  - Responsive design
  - Toast notifications
  - Loading states
  - Error handling
  - Progress tracking

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage Example

1. Select a role (e.g., "Software Engineering")
2. Paste a job description
3. Adjust AI parameters (optional)
4. Submit to generate a question
5. Write your answer
6. Receive detailed feedback
7. Try follow-up questions or generate new ones

## Tech Stack

- **Next.js 14**: React framework
- **Google Gemini AI**: Powers question generation and validation
- **Tailwind CSS**: Styling
- **PrimeReact**: UI components
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **Axios**: HTTP client
- **Geist Font**: Typography

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── lib/          # Utilities and helpers
│   └── types/        # TypeScript definitions
├── public/           # Static assets
└── middleware.ts     # Rate limiting
```

## Environment Variables

```bash
GOOGLE_API_KEY=     # Required: Gemini API key
```

## Feedback & Suggestions:


Ignas made an interesting and comprehensive chat application which satisfies the desired requirements and despite few random submission fails during the demo, technically worked as expected. Ignas demonstrated a solid understanding of prompts, highlighted differences between user and system prompts. As we have discussed during the review, I would think about the following areas for further improvements:
- As the initial user prompt is used for initial field validation, I would suggest to incorporate it into generating upcoming questions which may be reflect user desires.
- As per regular user, I would like to get an final evaluation/summary which would reveal my application for a job/interview instead of having an infinitive chat with the application. 
- Also, I would think about introducing the level of strictness for AI-generated questions, e.g. internship role/regular position. That would make an entire application even more flexible.
All the defined prompts are good to use, logical and effective. Ignas applied the best practices onto it. As we have discussed, I would suggest to think about storing user interview data/history into databases or/and define responses data type with Pydantic Parser (https://python.langchain.com/v0.1/docs/modules/model_io/output_parsers/types/pydantic/).
- Tools to check: Ollama (for LLM models and self hosting), Langchain (for prompt engineering), Pydantic Parser (for data type definition), Pychain

## License

MIT

## Author

Ignas Apsega @ Turing College 2025
