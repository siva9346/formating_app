import { z } from "zod";

const MenuItemSchema = z.object({
  dish_name: z.string().min(1),
  category: z.string().min(1).nullable().optional().transform(v => v ?? null),
  ingredients: z.array(z.string().min(1)).nullable().optional().transform(v => v ?? null),
  price: z.string().min(1).nullable().optional().transform(v => v ?? null),
});

export const ExtractedSchema = z.object({
  menu_items: z.array(MenuItemSchema),
});

export type Extracted = z.infer<typeof ExtractedSchema>;

export async function extractMenuViaGemini(inputText: string): Promise<Extracted> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_GEMINI_API_KEY env var");
  }

  const systemPrompt = `You are a structured data extraction assistant for a home food delivery startup called HomeChef.

Given unstructured text (possibly from a WhatsApp chat or message dump),
extract all identifiable food menu items with their details in this JSON format:

{
  "menu_items": [
    {
      "dish_name": string,
      "category": string | null,
      "ingredients": string[] | null,
      "price": string | null
    }
  ]
}

Rules:
- Ignore non-food messages or unrelated chatter.
- Deduplicate dish names.
- Return an empty array if nothing relevant is found.`;

  // Build a response schema prompt to force JSON output
  const userPrompt = `Extract the JSON only, no commentary. Text:\n\n${inputText}`;

  // Gemini 1.5 Pro via REST (Generative Language API)
  // Using contents with a system instruction and user input
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { text: userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();

  // Try to locate the JSON text in candidates
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!text || typeof text !== "string") {
    // Fallback to empty result if no text; do not throw hard.
    return { menu_items: [] };
  }

  // Some models may wrap JSON in code fences; strip if present
  const cleaned = text.trim().replace(/^```(?:json)?\n([\s\S]*?)\n```$/i, "$1");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to salvage JSON by finding the first and last braces
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } else {
      return { menu_items: [] };
    }
  }

  const result = ExtractedSchema.safeParse(parsed);
  if (!result.success) {
    return { menu_items: [] };
  }
  
  // Normalize: lower trim dish names, unique by dish_name
  const dedup = new Map<string, typeof result.data.menu_items[number]>();
  for (const item of result.data.menu_items) {
    const key = item.dish_name.trim().toLowerCase();
    if (!dedup.has(key)) dedup.set(key, item);
  }
  return { menu_items: Array.from(dedup.values()) };
}

