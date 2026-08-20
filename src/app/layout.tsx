import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BidUp.lol | Pay to Rank",
  description: "No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top. Will you take #1 when this site goes viral?",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

// @ts-ignore
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <Script
        src="https://hub.vemetric.com/script.js"
        data-token="sP8qPJqyP2sniWra"
        strategy="afterInteractive"
      />
      <body className="min-h-full flex flex-col font-mono bg-[#FCF2E5] text-[#524646] selection:bg-[#EC5B38]/20 selection:text-[#524646]">{children}</body>
    </html>
  );
}
