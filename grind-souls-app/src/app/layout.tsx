import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grind Souls - Gamified Habit Tracker",
  description: "Transform your daily habits into an epic RPG adventure. Complete quests, level up life areas, earn rewards, and build lasting routines with Dark Souls-inspired gamification.",
  keywords: "habit tracker, gamification, productivity, RPG, Dark Souls, quest system, personal development",
  authors: [{ name: "Grind Souls" }],
  creator: "Grind Souls",
  publisher: "Grind Souls",
  robots: "index, follow",
  openGraph: {
    title: "Grind Souls - Gamified Habit Tracker",
    description: "Transform your daily habits into an epic RPG adventure. Complete quests, level up life areas, and build lasting routines.",
    type: "website",
    locale: "en_US",
    siteName: "Grind Souls",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grind Souls - Gamified Habit Tracker",
    description: "Transform your daily habits into an epic RPG adventure. Complete quests, level up life areas, and build lasting routines.",
  },
  icons: {
    icon: "⚔️",
  },
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  colorScheme: "light dark",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
