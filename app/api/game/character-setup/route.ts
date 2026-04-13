import { NextResponse } from "next/server";

import { completeCharacterSetup } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { nickname?: unknown; body_type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса." }, { status: 400 });
  }

  const bodyType = body.body_type === "female" ? "female" : "male";
  const nickname = typeof body.nickname === "string" ? body.nickname : "";

  try {
    await completeCharacterSetup(user.id, nickname, bodyType);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать персонажа.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
