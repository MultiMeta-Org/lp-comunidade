import { JetBrains_Mono, Newsreader, Plus_Jakarta_Sans } from "next/font/google"

// Same setup as ComentAqui's app/layout.tsx. The CSS variables feed
// --font-sans / --font-serif / --font-mono in @multimeta/theme.
// UI text. Newsreader is for page titles only and JetBrains Mono is used
// sparingly, so neither is preloaded.
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  axes: ["opsz"],
  display: "swap",
  preload: false,
})
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
})

/** Put on <html>: `<html className={cn("h-full", fontVariables)}>`. */
export const fontVariables = `${jakarta.variable} ${newsreader.variable} ${jetbrainsMono.variable}`
