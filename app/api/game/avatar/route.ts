import { NextResponse } from "next/server";

import { equipItem, saveAvatarBase, unequipSlot } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    await saveAvatarBase(user.id, body.appearance ?? {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save avatar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    if (body.mode === "equip") {
      await equipItem(user.id, body.itemSlug);
    } else if (body.mode === "unequip") {
      await unequipSlot(user.id, body.slot);
    } else {
      return NextResponse.json({ error: "Unsupported mode." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update equipment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
