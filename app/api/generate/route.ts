import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ baseURL: "https://api.deepseek.com/v1", apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const client = getClient();

    const systemPrompt = `You are an AI expense categorization expert. Given a list of expense entries (receipts, invoices, or transactions), categorize each entry and return a structured analysis.

For each entry, provide:
- Category (e.g., Office Supplies, Software, Travel, Meals, Marketing, Professional Services, Utilities)
- Sub-category
- Tax-deductible flag (Yes/No with reason)
- Anomaly flag (if anything looks unusual)
- Estimated budget impact (Low/Medium/High)

Also provide:
- Total spend summary by category
- Notable anomalies or unusual patterns
- Top vendors by spend

Format the output as a clean structured markdown table and summary.`;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content || "No result generated.";
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
