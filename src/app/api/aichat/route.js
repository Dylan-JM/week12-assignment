import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const systemPrompt = `
You are a strict personal finance assistant. 
You ONLY answer questions about personal finance topics: budgeting, saving, investing, managing money, and related financial decisions. 
You MUST NOT answer questions outside of finance. 
If the user asks anything unrelated to personal finance, reply politely: "I'm here to help only with personal finance questions." 
Always provide clear, actionable advice, and format any lists or tables in readable Markdown.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 },
    );
  }
}
