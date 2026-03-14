import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

if(!process.env.GOOGLE_GEMINI_API_KEY){
  throw new Error('Missing GOOGLE_GEMINI_API_KEY environment variable')
}

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

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
    const text = result.response.text().trim().replace(/\n/g, '')

    const messages = text
      .split('||')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    // Return the suggested messages
    return Response.json({
      success: true,
      messages
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating messages with Gemini: ', error);
    // not exposing raw error.message to client
    return Response.json({
      success: false,
      message: 'Failed to generate message suggestions',
      error: error.message
    }, { status: 500 });
  }
}