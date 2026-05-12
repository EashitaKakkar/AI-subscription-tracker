import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { advice, teamSize } = await req.json();

    // TEMPLATE FALLBACK (Graceful Failure)
    const fallback = `Based on your team of ${teamSize}, we found several areas to lean out your AI stack. By consolidating redundant tools and switching to annual billing, you can significantly reduce overhead while maintaining your current output levels.`;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ summary: fallback });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Generate a 100-word executive summary for an AI spend audit. 
          Team Size: ${teamSize}. 
          Audit Findings: ${JSON.stringify(advice)}. 
          Tone: Professional, insightful, and concise. 
          Focus on the strategy for saving money.`
        }],
      }),
    });

    const data = await response.json();
    return NextResponse.json({ 
      summary: data.content[0].text || fallback 
    });

  } catch (error) {
    return NextResponse.json({ summary: "Audit complete. Review your personalized breakdown below for specific savings actions." });
  }
}