"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Props = {
  nextPath?: string;
};

export default function AuthForm({ nextPath = "/avatar" }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function signIn() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        throw authError;
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа.");
    } finally {
      setLoading(false);
    }
  }

  async function signUp() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) {
        throw authError;
      }
      setMessage("Регистрация успешна. Теперь войдите.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#141422] p-6">
      <h1 className="text-2xl font-bold text-white">Вход в игровой профиль</h1>
      <p className="mt-1 text-sm text-slate-400">Для вас и вашей жены: отдельный аккаунт и отдельный аватар.</p>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
          />
        </label>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => void signIn()}
          disabled={loading || !email || !password}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Войти
        </button>
        <button
          onClick={() => void signUp()}
          disabled={loading || !email || !password}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Зарегистрироваться
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}
    </div>
  );
}
