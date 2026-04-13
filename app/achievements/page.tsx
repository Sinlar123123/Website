import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import GameHub from "@/components/game/GameHub";
import { requireCharacterComplete } from "@/lib/auth/require-character";

export default async function AchievementsPage() {
  await requireCharacterComplete("/achievements");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <Link
        href="/"
        className="fixed left-2 top-3 z-50 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-violet-400 bg-clip-text text-4xl font-black tracking-wide text-transparent drop-shadow-[0_0_12px_rgba(129,140,248,0.45)] transition-all duration-200 hover:scale-105 hover:brightness-110"
      >
        Sinlar
      </Link>
      <div className="mb-4 flex justify-end">
        <SignOutButton />
      </div>
      <GameHub view="achievements" />
    </main>
  );
}
