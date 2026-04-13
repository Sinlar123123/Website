"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const projectItems: { label: string; href: string; emoji: string; desc: string }[] = [
  {
    label: "Весёлые домашние дела",
    href: "/login?next=/avatar",
    emoji: "\u{1F3E0}\u{1F338}",
    desc: "Зайти в игру: логин или сразу в аватар",
  },
];

const usefulItems = [
  {
    label: "2048 (8×8)",
    href: "/useful/2048",
    emoji: "\u{1F3AE}",
    desc: "Бесконечная 2048 на большом поле",
  },
  {
    label: "Доска хотелок",
    href: "/useful/wishlist",
    emoji: "\u{2728}",
    desc: "Канбан для хотелок на двоих",
  },
];

function DropdownMenu({
  items,
  emptyText,
}: {
  items: { label: string; href: string; emoji: string; desc: string }[];
  emptyText: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-2"
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#13131f] shadow-2xl shadow-black/50">
      {items.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <div className="text-2xl mb-1">{"\u{1F3D7}\u{FE0F}"}</div>
          <div className="text-sm text-slate-500">{emptyText}</div>
        </div>
      ) : (
        <div className="py-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-white/[0.05]"
            >
              <span className="mt-0.5 text-xl">{item.emoji}</span>
              <div>
                <div className="text-sm font-medium text-slate-200 transition-colors group-hover:text-indigo-300">
                  {item.label}
                </div>
                <div className="mt-0.5 text-xs text-slate-600">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      )}
      </div>
    </motion.div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [usefulOpen, setUsefulOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const projectsRef = useRef<HTMLLIElement>(null);
  const usefulRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (projectsRef.current && !projectsRef.current.contains(e.target as Node)) {
        setProjectsOpen(false);
      }
      if (usefulRef.current && !usefulRef.current.contains(e.target as Node)) {
        setUsefulOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sinlarLinkClass =
    "fixed left-2 top-3 z-[60] bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-violet-400 bg-clip-text text-4xl font-black tracking-wide text-transparent drop-shadow-[0_0_12px_rgba(129,140,248,0.45)] transition-all duration-200 hover:scale-105 hover:brightness-110";

  return (
    <>
      <a href="#hero" className={sinlarLinkClass}>
        Sinlar
      </a>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0d0d14]/95 backdrop-blur-md border-b border-white/[0.06] shadow-xl shadow-black/30"
            : "bg-transparent"
        }`}
      >
      <div className="mx-auto flex max-w-5xl items-center justify-end px-6 py-4">
        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {/* Главная */}
          <li>
            <a
              href="#hero"
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all duration-200"
            >
              Главная
            </a>
          </li>
          {/* Проекты с дропдауном (открытие по наведению) */}
          <li
            ref={projectsRef}
            className="relative"
            onMouseEnter={() => {
              setProjectsOpen(true);
              setUsefulOpen(false);
            }}
            onMouseLeave={() => setProjectsOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                projectsOpen ? "bg-white/[0.07] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              Проекты
              <motion.svg
                animate={{ rotate: projectsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {projectsOpen && (
                <DropdownMenu items={projectItems} emptyText="Проекты появятся здесь" />
              )}
            </AnimatePresence>
          </li>

          {/* Полезное с дропдауном (открытие по наведению) */}
          <li
            ref={usefulRef}
            className="relative"
            onMouseEnter={() => {
              setUsefulOpen(true);
              setProjectsOpen(false);
            }}
            onMouseLeave={() => setUsefulOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                usefulOpen ? "bg-white/[0.07] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              Полезное
              <motion.svg
                animate={{ rotate: usefulOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {usefulOpen && (
                <DropdownMenu items={usefulItems} emptyText="Инструменты появятся здесь" />
              )}
            </AnimatePresence>
          </li>
        </ul>

        {/* Mobile burger */}
        <button
          className="md:hidden text-slate-400 hover:text-white p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0d0d14]/98 border-b border-white/[0.06] px-6 pb-4 overflow-hidden"
          >
            <a href="#hero" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-slate-400 hover:text-white transition-colors border-b border-white/[0.05]">
              Главная
            </a>
            <div className="py-2.5 border-b border-white/[0.05]">
              <div className="text-sm text-slate-400 mb-2">Проекты</div>
              <a
                href="/login?next=/avatar"
                onClick={() => setMobileOpen(false)}
                className="block pl-3 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
              >
                {"\u{1F3E0}\u{1F338}"} Весёлые домашние дела
              </a>
            </div>
            <div className="py-2.5">
              <div className="text-sm text-slate-400 mb-2">Полезное</div>
              <a
                href="/useful/2048"
                onClick={() => setMobileOpen(false)}
                className="block pl-3 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
              >
                {"\u{1F3AE}"} 2048 (8×8)
              </a>
              <a
                href="/useful/wishlist"
                onClick={() => setMobileOpen(false)}
                className="block pl-3 text-xs text-slate-400 hover:text-indigo-300 transition-colors mt-1.5"
              >
                {"\u{2728}"} Доска хотелок
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
}
