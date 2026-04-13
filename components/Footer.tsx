"use client";

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-indigo-400 font-bold">Даниил</span>
        <p className="text-slate-700 text-sm">
          © {new Date().getFullYear()} Даниил · Спортивный аналитик · Будущий король программистов
        </p>
        <a
          href="#hero"
          className="text-slate-600 hover:text-indigo-400 text-sm transition-colors duration-200"
        >
          Наверх ↑
        </a>
      </div>
    </footer>
  );
}
