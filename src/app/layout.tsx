import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://scriptflow-ai-omega.vercel.app";

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok",
    template: "%s | ScriptFlow AI",
  },
  description:
    "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika. Free to start.",
  keywords: [
    "AI video script generator",
    "video script AI",
    "YouTube Shorts script",
    "TikTok script generator",
    "VEO 3 prompts",
    "Kling prompts",
    "Runway prompts",
    "AI video prompts",
    "scene-by-scene script",
    "short-form video script",
  ],
  authors: [{ name: "ScriptFlow AI" }],
  creator: "ScriptFlow AI",
  publisher: "ScriptFlow AI",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ScriptFlow AI",
    title:
      "ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok",
    description:
      "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika. Free to start.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ScriptFlow AI — AI Video Script Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok",
    description:
      "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika. Free to start.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en": BASE_URL,
      "en-IN": BASE_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
