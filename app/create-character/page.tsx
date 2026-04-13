import Link from "next/link";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/auth/SignOutButton";
import CreateCharacterForm from "@/components/game/CreateCharacterForm";
import { requireUser } from "@/lib/auth/require-user";
import { bootstrapUser } from "@/lib/game/server";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function CreateCharacterPage({ searchParams }: Props) {
  const user = await requireUser();
  const email = user.email;
  if (!email) {
    redirect("/login");
  }

  await bootstrapUser(user.id, email);

  const params = await searchParams;
  const nextRaw = params.next;
  const nextPath =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/avatar";

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("character_setup_complete")
    .eq("id", user.id)
    .single();

  if (profile?.character_setup_complete) {
    redirect(nextPath);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="fixed left-2 top-3 z-50 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-violet-400 bg-clip-text text-4xl font-black tracking-wide text-transparent drop-shadow-[0_0_12px_rgba(129,140,248,0.45)] transition-all duration-200 hover:scale-105 hover:brightness-110"
      >
        Sinlar
      </Link>
      <div className="mb-6 flex justify-end">
        <SignOutButton />
      </div>
      <CreateCharacterForm nextPath={nextPath} />
    </main>
  );
}
