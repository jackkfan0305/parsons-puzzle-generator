import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-API-KEY");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 });
  }
  const { prompt } = await req.json();

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return NextResponse.json({ error: "Missing description" }, { status: 400 });
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const systemPrompt = `
  You are a code-puzzle generator.  When given a Python task description, you must output **only** a JSON array of objects, each with these exact fields:
  • "id"   : a unique integer in the order the lines belong
  • "code" : one line of valid Python code (no leading/trailing whitespace)  
  • "hint" : a brief, plain-English explanation of that line in respect to the task
  • "indent": an integer ≥ 0 representing the nesting level (each level = one block indent)
  Important:
    1. Output must be a single JSON array, starting with [ and ending with ].
    2. Do not include any backticks, markdown, comments, or extra keys.
    3. Ensure all strings are properly quoted and closed.
  `.trim();

  const userPrompt = `Generate the {id, code, hint} list for this task:\n\n"${prompt}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2, // low temp for accuracy
    });

    const text = completion.choices[0].message?.content ?? "";

    const data = JSON.parse(text);
    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "AI error" },
      { status: 500 }
    );
  }
}
