import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const BASE_URL = "https://scriptflow-ai-omega.vercel.app";

export const viewport: Viewport = {
  themeColor: "#00e5c0",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "ScriptFlow AI — The Complete AI Video Studio for Viral Creators",
    template: "%s | ScriptFlow AI",
  },
  description:
    "From idea to finished video — script, voiceover, and AI-generated scenes. Powered by Kling, VEO 3, and Runway. Built for Indian creators.",
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
    "AI video studio India",
    "faceless YouTube channel",
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
    locale: "en_IN",
    url: BASE_URL,
    siteName: "ScriptFlow AI",
    title: "ScriptFlow AI — The Complete AI Video Studio for Viral Creators",
    description:
      "From idea to finished video — script, voiceover, and AI-generated scenes. Powered by Kling, VEO 3, and Runway. Built for Indian creators.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ScriptFlow AI — AI Video Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScriptFlow AI — The Complete AI Video Studio for Viral Creators",
    description:
      "From idea to finished video — script, voiceover, and AI-generated scenes. Powered by Kling, VEO 3, and Runway. Built for Indian creators.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      en: BASE_URL,
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
