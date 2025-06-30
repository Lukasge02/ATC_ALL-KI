import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ALL-KI - Deine KI für den Alltag",
  description: "Personalisierte KI-Assistenten mit innovativem Widget-System für jeden Lebensbereich.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.variable} font-sans antialiased min-h-full`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
