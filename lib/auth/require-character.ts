import { redirect } from "next/navigation";

import { bootstrapUser } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

import { requireUser } from "./require-user";

export async function requireCharacterComplete(nextPath: string) {
  const user = await requireUser();
  const email = user.email;
  if (!email) {
    redirect("/login");
  }

  await bootstrapUser(user.id, email);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("character_setup_complete")
    .eq("id", user.id)
    .single();

  if (error) {
    redirect(`/create-character?next=${encodeURIComponent(nextPath)}`);
  }

  if (!data?.character_setup_complete) {
    redirect(`/create-character?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
