"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const projects: {
  emoji: string;
  title: string;
  desc: string;
  stats?: { value: string; label: string }[];
  links?: { label: string; href: string }[];
}[] = [
  {
    emoji: "\u{1F3E0}\u{1F338}",
    title: "Весёлые домашние дела",
    desc:
      "Веб-приложение, которое делает бытовые задачи интереснее за счёт геймификации: ачивки, монетки и уровни мотивируют закрывать дела. Можно собирать аватар, покупать предметы и питомцев в магазине и смотреть прогресс — так виртуальные награды поддерживают и реальные привычки, а не только «картинку на экране».",
    links: [{ label: "Зайти в игру", href: "/login?next=/avatar" }],
  },
];

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-indigo-400 text-xs font-mono uppercase tracking-widest">— портфолио —</span>
          <h2 className="text-4xl md:text-5xl font-black mt-2">Проекты</h2>
        </motion.div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-20 px-8 rounded-3xl border border-dashed border-indigo-500/25 bg-indigo-500/[0.03] text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-5"
              >
                🚧
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">Первый проект в пути!</h3>
              <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
                Этот раздел заполнится по мере создания проектов.
                Каждый проект будет отображаться здесь красивой карточкой.
              </p>
              <div className="flex items-center gap-2 mt-6 text-indigo-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Работа ведётся
              </div>
            </div>

            {/* Ghost cards */}
            <div className="grid md:grid-cols-2 gap-5 mt-6 pointer-events-none select-none">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04] opacity-30"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] mb-4" />
                  <div className="h-4 w-2/3 rounded bg-white/[0.05] mb-2" />
                  <div className="h-3 w-full rounded bg-white/[0.04] mb-1.5" />
                  <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-300"
              >
                <div className="text-4xl mb-4">{project.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{project.desc}</p>
                {project.stats && (
                  <div className="flex gap-5 mb-5">
                    {project.stats.map((s) => (
                      <div key={s.label}>
                        <div className="text-lg font-bold text-indigo-400">{s.value}</div>
                        <div className="text-xs text-slate-600">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {project.links && (
                  <div className="flex gap-3">
                    {project.links.map((link) => (
                      <a key={link.label} href={link.href} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        {link.label} →
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
