"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  nextPath: string;
};

export default function CreateCharacterForm({ nextPath }: Props) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [bodyType, setBodyType] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/game/character-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, body_type: bodyType }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Ошибка сохранения.");
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#141422] p-6 shadow-xl shadow-black/40">
      <h1 className="text-2xl font-bold text-white">Создайте персонажа</h1>
      <p className="mt-1 text-sm text-slate-400">
        Один раз для аккаунта: выберите пол и никнейм. Потом можно менять внешность в игре.
      </p>

      <div className="mt-6 space-y-5">
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-slate-300">Пол</legend>
          <div className="flex gap-3">
            <label
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                bodyType === "male"
                  ? "border-indigo-400/70 bg-indigo-500/15 text-white"
                  : "border-white/10 bg-[#0f0f1a] text-slate-400 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="body"
                className="sr-only"
                checked={bodyType === "male"}
                onChange={() => setBodyType("male")}
              />
              Мужской
            </label>
            <label
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                bodyType === "female"
                  ? "border-indigo-400/70 bg-indigo-500/15 text-white"
                  : "border-white/10 bg-[#0f0f1a] text-slate-400 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="body"
                className="sr-only"
                checked={bodyType === "female"}
                onChange={() => setBodyType("female")}
              />
              Женский
            </label>
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Никнейм</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
            maxLength={24}
            placeholder="Например, Солнечный лис"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-400"
          />
          <span className="mt-1 block text-xs text-slate-600">2–24 символа: буквы, цифры, пробел, _ - .</span>
        </label>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="button"
          disabled={loading}
          onClick={() => void submit()}
          className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Сохраняем…" : "Продолжить"}
        </button>
      </div>
    </div>
  );
}
