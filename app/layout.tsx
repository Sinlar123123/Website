import type { Metadata } from "next";
import { Geist } from "next/font/google";
import WeatherBackdrop from "@/components/WeatherBackdrop";
import { getSpbAtmosphere } from "@/lib/weather/spb-atmosphere";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Даниил — Спортивный аналитик",
  description: "Начинающий программист. Я стану королём программистов!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const atmosphere = await getSpbAtmosphere();

  return (
    <html lang="ru" className={`${geist.variable} h-full antialiased`}>
      <body className="relative min-h-full bg-[#080810] text-slate-200">
        <WeatherBackdrop background={atmosphere.background} />
        {children}
      </body>
    </html>
  );
}
