import type { Metadata } from "next";
import Link from "next/link";

import WishlistBoard from "@/components/useful/WishlistBoard";

export const metadata: Metadata = {
  title: "Доска хотелок — Полезное",
  description: "Общая канбан-доска для забавных хотелок: как лёгкий Джиро для двоих.",
};

export default function UsefulWishlistPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/#useful"
        className="inline-block text-sm text-violet-400 hover:text-violet-300 transition mb-8"
      >
        ← Полезное
      </Link>
      <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Доска хотелок</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-2xl">
        Четыре колонки: Настюшка, Данюшка, Семья и Мечты. Доступ только у почт из белого списка в Supabase (вы и
        партнёр).
      </p>
      <WishlistBoard />
    </main>
  );
}
