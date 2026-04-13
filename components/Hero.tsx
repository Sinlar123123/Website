"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

/** Луффи улыбается (Giphy). Свой вариант: положите `public/luffy.gif` и укажите `/luffy.gif`. */
const LUFFY_GIF_URL = "https://i.giphy.com/ZpfRVpfuh9YQM.gif";

export default function Hero() {
  const [avatarSrc, setAvatarSrc] = useState("/avatar.jpg");
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Bg blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-3xl"
        />
      </div>

      <div className="text-center px-6 max-w-2xl mx-auto">
        {/* Photo avatar */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          className="relative w-32 h-32 mx-auto mb-7"
        >
          {/* Фото кладите в portfolio/public/avatar.jpg (как раньше с обезьяной) */}
          <Image
            src={avatarSrc}
            alt="Даниил"
            width={128}
            height={128}
            priority
            unoptimized
            onError={() => setAvatarSrc("/file.svg")}
            className="w-full h-full rounded-full object-cover shadow-2xl shadow-indigo-500/30 ring-4 ring-white/[0.08]"
          />
          {/* Зелёная точка "онлайн" */}
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0d0d14] shadow-lg shadow-emerald-400/50" />
        </motion.div>

        {/* Name */}
        <motion.h1
          className="hero-name-title flex justify-center perspective-[520px] text-5xl font-black tracking-tight md:text-6xl mb-2"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.055, delayChildren: 0.12 },
            },
          }}
        >
          {Array.from("Даниил").map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              className="inline-block origin-bottom"
              variants={{
                hidden: { opacity: 0, y: 22, rotateX: -55, scale: 0.92 },
                show: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 380, damping: 22 },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Role */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="text-lg text-indigo-400 font-medium mb-5"
        >
          Спортивный аналитик · Будущий разработчик
        </motion.p>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto mb-8 max-w-md text-center"
        >
          <p className="text-slate-400 leading-relaxed">
            Анализирую спортивные данные, играю в Dota 2 и строю проекты, которыми сам пользуюсь.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-white font-semibold">Я стану королём программистов.</span>
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 20 }}
              className="relative inline-flex h-[3.35rem] w-[3.35rem] shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/[0.14] shadow-lg shadow-indigo-500/30 sm:h-16 sm:w-16"
              title="Отсылка к Monkey D. Luffy — король пиратов"
            >
              <img
                src={LUFFY_GIF_URL}
                alt="Луффи из One Piece улыбается"
                className="h-full w-full object-cover object-[center_15%]"
                loading="lazy"
                decoding="async"
              />
            </motion.span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(99,102,241,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors duration-200"
          >
            Мои проекты
          </motion.a>
          <motion.a
            href="#useful"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3 rounded-xl border border-white/[0.1] hover:border-indigo-500/40 text-slate-300 hover:text-white font-semibold text-sm transition-all duration-200"
          >
            Полезное
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-slate-700 text-xs"
        >
          <div className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-1.5 rounded-full bg-slate-600"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
