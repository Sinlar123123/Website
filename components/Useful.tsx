"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Сюда будут добавляться полезные инструменты
const tools: {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  tag: string;
}[] = [
  {
    emoji: "\u{1F3AE}",
    title: "2048 на поле 8×8",
    desc: "Бесконечный режим: собирай плитки дальше после 2048. Клавиатура или свайпы.",
    href: "/useful/2048",
    tag: "игра",
  },
  {
    emoji: "\u{2728}",
    title: "Доска хотелок",
    desc: "Канбан для двоих: мечты, планы и «сбылось» — как лёгкий Джиро для хотелок.",
    href: "/useful/wishlist",
    tag: "дом",
  },
];

export default function Useful() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="useful" className="py-24 px-6 bg-white/[0.015]">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-indigo-400 text-xs font-mono uppercase tracking-widest">— инструменты —</span>
          <h2 className="text-4xl md:text-5xl font-black mt-2">Полезное</h2>
          <p className="text-slate-500 mt-3 max-w-lg">
            Инструменты и сервисы, которые я делаю и которыми пользуюсь сам
          </p>
        </motion.div>

        {tools.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-16 px-8 rounded-3xl border border-dashed border-violet-500/20 bg-violet-500/[0.02] text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-5"
            >
              🔮
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-3">Скоро здесь будут инструменты</h3>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
              Планирую запустить полезные сервисы для спортивной аналитики и Dota 2.
              Следите за обновлениями!
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool, i) => (
              <motion.a
                key={tool.title}
                href={tool.href}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all duration-300 group block"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{tool.emoji}</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-mono">
                    {tool.tag}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
