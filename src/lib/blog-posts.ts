export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "veo3-prompt-guide",
    title: "The Complete VEO 3 Prompt Guide for YouTube Shorts (2026)",
    description:
      "Master VEO 3 prompt structure, best practices, and real examples. Learn the exact format that gets the best results from Google's AI video generator.",
    date: "2026-05-01",
    readTime: "8 min read",
    category: "AI Tools",
  },
  {
    slug: "kling-vs-runway-vs-veo3",
    title: "Kling 2.0 vs Runway Gen-4 vs VEO 3: Which AI Video Tool is Best?",
    description:
      "A detailed comparison of the three leading AI video generation tools in 2026. Use cases, pricing, prompt formats, and which to choose for your workflow.",
    date: "2026-05-03",
    readTime: "9 min read",
    category: "Comparison",
  },
  {
    slug: "youtube-shorts-script-template",
    title: "YouTube Shorts Script Template: How to Write Scripts That Go Viral",
    description:
      "Proven Shorts script templates, hook frameworks, and structure guides used by creators with millions of views. Free templates included.",
    date: "2026-05-05",
    readTime: "7 min read",
    category: "Scripting",
  },
  {
    slug: "ai-video-prompts-guide",
    title: "How to Write AI Video Prompts: The Ultimate Guide for Creators",
    description:
      "The complete guide to prompt engineering for AI video tools. Covers VEO 3, Kling, Runway, Pika, and Midjourney with real examples.",
    date: "2026-05-07",
    readTime: "10 min read",
    category: "Prompt Engineering",
  },
  {
    slug: "faceless-youtube-channel-scripts",
    title: "How to Create a Faceless YouTube Channel Using AI Video Tools",
    description:
      "The complete workflow for building a profitable faceless YouTube channel with AI video generation. Niche selection, scripting, production, and monetization.",
    date: "2026-05-08",
    readTime: "11 min read",
    category: "YouTube Strategy",
  },
]
