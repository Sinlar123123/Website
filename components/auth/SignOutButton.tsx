"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={() => void signOut()}
      className="rounded-lg border border-white/20 px-3 py-2 text-xs text-slate-300 hover:border-rose-400"
    >
      Выйти
    </button>
  );
}
