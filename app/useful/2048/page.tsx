import type { Metadata } from "next";
import Link from "next/link";

import Game2048 from "@/components/useful/Game2048";

export const metadata: Metadata = {
  title: "2048 8×8 — Полезное",
  description: "Бесконечная 2048 на поле 8×8: стрелки, WASD или свайпы.",
};

export default function Useful2048Page() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/#useful"
        className="inline-block text-sm text-violet-400 hover:text-violet-300 transition mb-8"
      >
        ← Полезное
      </Link>
      <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">2048</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-md">
        Классические правила на расширенном поле: после плитки 2048 игра не заканчивается.
      </p>
      <Game2048 />
    </main>
  );
}
