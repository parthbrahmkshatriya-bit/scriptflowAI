import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

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

const BASE_URL = "https://scriptflowai.co";

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "ScriptFlow AI — The Complete AI Video Studio for Viral Creators",
    template: "%s | ScriptFlow AI",
  },
  description:
    "Turn any video idea into a production-ready script in seconds. AI writes scenes, generates real video clips with narration via VEO 3, and stitches them into one final MP4. No camera, no editing software.",
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
      "Turn any video idea into a production-ready script in seconds. AI writes scenes, generates real video clips with narration via VEO 3, and stitches them into one final MP4. No camera, no editing software.",
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
      "Turn any video idea into a production-ready script in seconds. AI writes scenes, generates real video clips with narration via VEO 3, and stitches them into one final MP4. No camera, no editing software.",
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
        <NextTopLoader color="#7c3aed" height={3} showSpinner={false} shadow="0 0 10px #7c3aed,0 0 5px #7c3aed" />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
