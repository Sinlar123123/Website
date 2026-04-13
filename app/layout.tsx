import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import WeatherBackdrop from "@/components/WeatherBackdrop";
import WeatherBackdropLoader from "@/components/WeatherBackdropLoader";
import { FALLBACK_ATMOSPHERE_CSS } from "@/lib/weather/spb-atmosphere";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Даниил — Спортивный аналитик",
  description: "Начинающий программист. Я стану королём программистов!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geist.variable} h-full antialiased`}>
      <body className="relative min-h-full bg-[#080810] text-slate-200">
        <Suspense fallback={<WeatherBackdrop background={FALLBACK_ATMOSPHERE_CSS} />}>
          <WeatherBackdropLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
