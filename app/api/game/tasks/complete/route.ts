import { NextResponse } from "next/server";

import { completeHouseholdTask } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { taskSlug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса." }, { status: 400 });
  }

  const taskSlug = typeof body.taskSlug === "string" ? body.taskSlug : "";

  try {
    await completeHouseholdTask(user.id, taskSlug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось отметить задание.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
