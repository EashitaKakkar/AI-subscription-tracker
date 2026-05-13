import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
interface AdviceItem {
  tool: string;
  action: string;
  savings: number;
  reason: string;
}

interface RequestBody {
  advice: AdviceItem[];
  teamSize: string;
}

export async function POST(req: Request) {
  try {
    const { advice, teamSize }: RequestBody = await req.json();
    
    const fallback = `Based on your team of ${teamSize}, we found several areas to lean out your AI stack. By consolidating redundant tools and switching to annual billing, you can significantly reduce overhead while maintaining your current output levels.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ summary: fallback });

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-2.5-flash"; 
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
    You are an expert SaaS Financial Consultant. Generate a professional 100-word executive bulleted summary for an AI spend audit. 
    Context:
    - Team Size: ${teamSize}
    - Audit Findings: ${JSON.stringify(advice)}
    Requirements:
    - Tone: Professional, insightful, consise and bulleted in points. 
    - Focus: Strategic path to saving money (consolidation and annual billing).
    - Constraint: Use the exact dollar amounts from the findings. Do not exceed 100 words. `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json( { summary: text || fallback } );

  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Gemini API Error Message:", errorMessage);

      if (errorMessage.toLowerCase().includes("404") || errorMessage.toLowerCase().includes("not found")) {
        return NextResponse.json({ 
          summary: `Based on your team of any size, we recommend consolidating your subscriptions. You're currently seeing overlap in your coding and research tools which could be streamlined into a single provider to save on monthly overhead.` 
        });
      }
    }

    return NextResponse.json({ 
      summary: "Audit complete. Review your personalized breakdown below for specific savings actions." 
    }, { status: 500 });
  }
}