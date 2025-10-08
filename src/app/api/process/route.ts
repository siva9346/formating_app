import { NextRequest, NextResponse } from "next/server";
import { extractMenuViaGemini } from "@/lib/gemini";
import { ensureSchema, insertMenuItems } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".txt")) {
      return NextResponse.json({ error: "Only .txt files are allowed" }, { status: 400 });
    }

    const textContent = await file.text();

    const extracted = await extractMenuViaGemini(textContent);

    await ensureSchema();
    await insertMenuItems(extracted.menu_items);

    return NextResponse.json({ ok: true, count: extracted.menu_items.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

