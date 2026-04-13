import { NextResponse } from "next/server";

import { bootstrapUser } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await bootstrapUser(user.id, user.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bootstrap failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
