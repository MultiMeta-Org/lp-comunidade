import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { BiaProvider } from "@/components/bia/bia";
import { fontVariables } from "@/lib/fonts";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal EVP",
  description: "Seu espaço diário de conteúdo e evolução.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fontVariables} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <BiaProvider>{children}</BiaProvider>
      </body>
    </html>
  );
}
