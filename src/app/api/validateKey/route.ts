import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || !apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Make a simple request to validate the key
    await openai.models.list();

    return NextResponse.json({ valid: true });
  } catch (error: any) {
    console.error("Error validating API key:", error);

    // Handle specific OpenAI API errors
    if (error?.status === 401) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Error validating API key" },
      { status: 500 }
    );
  }
}
