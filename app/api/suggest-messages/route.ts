import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Get the Gemini model (use gemini-pro for text generation)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the prompt for generating message suggestions
    const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. These questions are for an anonymous social messaging platform, like Qooh.me
    
    Requirements:
    - Avoid personal or sensitive topics
    - Each message should be a question or interesting conversation starter
    - Messages should be friendly and appropriate for all ages
    - Messages should encourage thoughtful responses
    - Separate each message with ||
    - Do not include numbering or bullet points
    - Examples: "What's your favorite childhood memory?||If you could have dinner with anyone, who would it be?||What's something you've always wanted to learn?"
    
    Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response (remove extra whitespace, newlines)
    const cleanedText = text.trim().replace(/\n/g, '');

    // Return the suggested messages
    return NextResponse.json({
      success: true,
      messages: cleanedText
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating messages with Gemini:', error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: 'Failed to generate message suggestions',
      error: error.message
    }, { status: 500 });
  }
}

// Optional: Add GET method for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to generate message suggestions'
  }, { status: 200 });
}