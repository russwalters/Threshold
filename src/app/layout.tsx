import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const fraunces = localFont({
  src: [
    {
      path: "../fonts/Fraunces-Variable.ttf",
      style: "normal",
    },
    {
      path: "../fonts/Fraunces-Variable-Italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "Threshold — The owner's manual for your home",
  description:
    "Stop Googling your own house. Document, organize, and share everything about your home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
