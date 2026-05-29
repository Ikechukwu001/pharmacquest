import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pharmacquest — Train your pharmacy brain",
    template: "%s · Pharmacquest",
  },
  description:
    "Realistic clinical scenarios that train Nigerian pharmacy students how to think under pressure. Free for now.",
  keywords: [
    "pharmacy",
    "Nigeria",
    "medical training",
    "clinical simulation",
    "pharmacy school",
    "PCN",
  ],
  authors: [{ name: "Pharmacquest" }],
  openGraph: {
    title: "Pharmacquest — Train your pharmacy brain",
    description:
      "Realistic clinical scenarios from Nigerian community pharmacy. Learn to think under pressure.",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pharmacquest — Train your pharmacy brain",
    description:
      "Realistic clinical scenarios from Nigerian community pharmacy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}