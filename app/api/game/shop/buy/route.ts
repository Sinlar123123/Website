import { NextResponse } from "next/server";

import { buyItem } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const itemSlug = body.itemSlug as string | undefined;

  if (!itemSlug) {
    return NextResponse.json({ error: "itemSlug is required." }, { status: 400 });
  }

  try {
    await buyItem(user.id, itemSlug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
