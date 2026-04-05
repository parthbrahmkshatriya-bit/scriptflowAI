# ScriptFlow AI — Complete Project Knowledge Base

---

## 1. PRODUCT VISION

### What is ScriptFlow AI?
An AI-powered web application that converts a one-line video concept into a complete, scene-by-scene production script for short-form vertical video (YouTube Shorts, Instagram Reels, TikTok). Unlike generic AI writing tools, ScriptFlow outputs structured, ready-to-shoot breakdowns with copy-paste-ready prompts formatted for specific AI video generation tools (VEO 3, Kling, Runway, Pika, Midjourney).

### One-line pitch
"Turn any video idea into a production-ready script in 10 seconds."

### The problem we solve
AI video generation tools (VEO 3, Kling 2.0, Runway Gen-4, Pika 2.0) can produce stunning video clips from text prompts. But the planning phase before generation takes 60-90 minutes per video:
- Think of concept (5 min)
- Break into scenes mentally (10-15 min)
- Write scene descriptions and timing (10 min)
- Craft generation prompts per scene, per tool (20-30 min)
- Iterate on failed prompts (15+ min)
- Write voiceover/text overlay copy (10 min)

ScriptFlow reduces this entire process to under 2 minutes.

### Target users
1. **AI Video Creators** — Use VEO/Kling/Runway daily, spend more time writing prompts than creating. Willingness to pay: High ($15-19/mo)
2. **Faceless Channel Operators** — Run 5-10 YouTube/TikTok channels, need scripts at scale. Willingness to pay: Very high ($19+/mo)
3. **Small Businesses / Agencies** — Want short-form presence but lack creative skill. Willingness to pay: Medium ($9-15/mo)
4. **Content Educators** — Make tutorials and explainers, need structured output. Willingness to pay: Medium ($9-15/mo)

### Key differentiator
No other tool outputs AI generation prompts formatted specifically for each video tool. ChatGPT/Gemini give you paragraphs. ScriptFlow gives you a production-ready package with prompts you can copy-paste directly into VEO 3, Kling, Runway, or Pika.

---

## 2. TECHNOLOGY STACK

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router) | SSR + API routes + PWA support. Claude Code works very well with Next.js |
| Language | TypeScript | Type safety. Claude Code generates better TS than JS |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with accessible pre-built components |
| Backend / DB | Supabase (PostgreSQL) | Auth, DB, Edge Functions, RLS — all in one. Generous free tier |
| AI Engine | Claude Haiku 4.5 API | Fastest + cheapest Anthropic model. ~$0.001 per script |
| Payments | Stripe + Razorpay | Stripe for international, Razorpay for India (UPI/cards) |
| PWA | next-pwa + Service Worker | Installable on Android/iOS from browser |
| Mobile (Phase 2) | React Native + Expo | Shares business logic with Next.js |
| Hosting | Vercel | Zero-config deployment for Next.js. Free tier includes SSL, CDN |
| Analytics | PostHog (self-serve) | Product analytics, funnels, feature flags. Free: 1M events/month |
| Email | Resend | Transactional emails. Free: 3K/month |
| Error Tracking | Sentry | Free tier for error monitoring |

---

## 3. PROJECT STRUCTURE

```
scriptflow-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, signup, callback
│   │   ├── (marketing)/        # Landing page, pricing, blog
│   │   ├── (dashboard)/        # Protected app pages
│   │   │   ├── dashboard/      # Script history + stats
│   │   │   ├── generate/       # Script generation form
│   │   │   ├── script/[id]/    # Individual script view
│   │   │   └── settings/       # Account + billing
│   │   ├── s/[slug]/           # Public shared script view
│   │   ├── api/                # API routes
│   │   │   ├── generate/       # POST: AI script generation
│   │   │   ├── generate-guest/ # POST: Landing page demo (no auth)
│   │   │   ├── webhook/        # Stripe + Razorpay webhooks
│   │   │   └── scripts/        # CRUD operations
│   │   └── layout.tsx          # Root layout + providers
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # GenerateForm, etc.
│   │   ├── scripts/            # SceneCard, ScriptHeader, etc.
│   │   └── layout/             # Navbar, Sidebar, Footer
│   ├── lib/
│   │   ├── supabase/           # Supabase client (server + browser)
│   │   ├── stripe/             # Stripe helpers
│   │   ├── razorpay/           # Razorpay helpers
│   │   ├── ai/                 # AI prompt templates + generation
│   │   ├── schemas/            # Zod validation schemas
│   │   └── utils/              # Helpers, constants, formatters
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global styles + Tailwind config
├── supabase/
│   ├── migrations/             # SQL migration files
│   └── functions/              # Edge Functions
├── public/                     # Static assets + PWA manifest
├── CLAUDE.md                   # Claude Code project context
└── package.json
```

---

## 4. DATABASE SCHEMA

### Table: users (extends Supabase auth.users)
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | No | References auth.users.id |
| email | text | No | User email |
| full_name | text | Yes | Display name |
| avatar_url | text | Yes | Profile picture URL |
| plan | enum | No | 'free' / 'creator' / 'pro' — default: 'free' |
| scripts_used_this_month | integer | No | Resets on 1st of each month. Default: 0 |
| stripe_customer_id | text | Yes | Stripe customer ID |
| razorpay_customer_id | text | Yes | Razorpay customer ID |
| payment_provider | enum | Yes | 'stripe' / 'razorpay' / null |
| subscription_status | enum | No | 'active' / 'cancelled' / 'past_due' / 'none' — default: 'none' |
| subscription_ends_at | timestamptz | Yes | When current billing period ends |
| preferred_platform | text | Yes | Default video platform preference |
| preferred_ai_tool | text | Yes | Default AI tool preference |
| preferred_style | text | Yes | Default visual style preference |
| created_at | timestamptz | No | Auto-set on insert |
| updated_at | timestamptz | No | Auto-updated via trigger |

### Table: scripts
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | No | Auto-generated |
| user_id | uuid (FK) | No | References users.id, ON DELETE CASCADE |
| concept | text | No | User's original concept (max 500 chars) |
| title | text | No | AI-generated title |
| duration | enum | No | '15s' / '30s' / '60s' |
| platform | enum | No | 'youtube_shorts' / 'instagram_reels' / 'tiktok' |
| visual_style | enum | No | 'cinematic' / 'cartoon' / 'realistic' / 'minimal' / 'anime' |
| ai_tool | enum | No | 'veo3' / 'kling' / 'runway' / 'pika' / 'midjourney' / 'generic' |
| scene_count | integer | No | Number of scenes generated |
| is_favorite | boolean | No | Default: false |
| is_public | boolean | No | Default: false |
| share_slug | text (unique) | Yes | Short slug for public sharing |
| generation_time_ms | integer | Yes | How long AI generation took |
| model_used | text | Yes | AI model identifier |
| created_at | timestamptz | No | Auto-set |

### Table: scenes
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | No | Auto-generated |
| script_id | uuid (FK) | No | References scripts.id, ON DELETE CASCADE |
| scene_number | integer | No | Ordered position (1-based) |
| duration_seconds | integer | No | Scene duration |
| visual_description | text | No | What the viewer sees |
| camera_direction | text | No | Camera angle, movement, framing |
| voiceover_text | text | Yes | Narration or dialogue |
| onscreen_text | text | Yes | Text overlay |
| ai_generation_prompt | text | No | Copy-paste ready prompt for selected AI tool |
| suggested_music | text | Yes | Music/SFX suggestion |
| transition | text | Yes | Transition to next scene |

### Table: subscriptions
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | No | Auto-generated |
| user_id | uuid (FK) | No | References users.id |
| provider | enum | No | 'stripe' / 'razorpay' |
| provider_subscription_id | text | No | External subscription ID |
| plan | enum | No | 'creator' / 'pro' |
| status | enum | No | 'active' / 'cancelled' / 'past_due' / 'trialing' |
| current_period_start | timestamptz | No | Billing period start |
| current_period_end | timestamptz | No | Billing period end |
| cancel_at_period_end | boolean | No | If true, cancels at period end |
| created_at | timestamptz | No | Auto-set |

### Row Level Security Policies
- **users**: SELECT/UPDATE own row only (user_id = auth.uid())
- **scripts**: CRUD own scripts only. Public scripts SELECTable by anyone via share_slug
- **scenes**: SELECT scenes of own scripts only. INSERT/DELETE cascades from scripts
- **subscriptions**: SELECT own only. INSERT/UPDATE via server-side webhooks only

---

## 5. API SPECIFICATION

### POST /api/generate (auth required)
- **Body**: { concept (string, 10-500 chars), duration ('15s'/'30s'/'60s'), platform, visual_style, ai_tool }
- **Logic**: Validate with Zod → Check usage limit → Call Claude API → Store script + scenes → Increment counter
- **Response 200**: { script_id, title, scenes[], generation_time_ms }
- **Errors**: 401 (no auth), 403 (limit reached), 422 (validation), 429 (rate limit: max 5/min), 500 (AI error)

### POST /api/generate-guest (no auth)
- Same input. Rate limit: 1 per IP per 24 hours
- Returns truncated: first 3 scenes, ai_generation_prompt = "[Sign up to see full prompts]"

### GET /api/scripts — Paginated list (auth required)
- Query: page, limit (max 50), sort, filter (favorites_only)
- Response: { scripts[], total, page, has_more }

### GET /api/scripts/[id] — Single script with scenes
### PATCH /api/scripts/[id] — Update favorite/public/title
### DELETE /api/scripts/[id] — Delete script + cascade scenes
### POST /api/scripts/[id]/remix — Generate variation (counts as new script)
### POST /api/webhook/stripe — Stripe subscription events (verify signature)
### POST /api/webhook/razorpay — Razorpay subscription events (verify signature)

---

## 6. FUNCTIONAL REQUIREMENTS (SCREEN-BY-SCREEN)

### FR-01: Landing Page (/)
- Hero with value prop: "Turn any idea into a production-ready video script in 10 seconds"
- Live demo: text input + generate button, works without login, shows 3 truncated scenes
- How it works: 3 steps with icons
- Pricing section: 3 plan cards with USD/INR toggle
- Social proof: script counter, testimonials, supported AI tools logos
- FAQ accordion (6-8 questions, SEO-optimized)
- Footer with links, SEO meta tags, mobile responsive

### FR-02: Authentication (/login, /signup)
- Email + password, Google OAuth, Magic Link
- Password reset flow
- JWT persistence, auto-refresh
- Protected route middleware on /dashboard/*

### FR-03: Script Generation (/dashboard/generate)
- Concept textarea (max 500 chars, character counter)
- Duration radio (15s/30s/60s with estimated scene count)
- Platform dropdown (YouTube Shorts, Instagram Reels, TikTok)
- Visual style dropdown (Cinematic, Cartoon, Realistic, Minimal, Anime)
- AI tool dropdown (VEO 3, Kling 2.0, Runway Gen-4, Pika 2.0, Midjourney, Generic)
- Usage counter: "2 of 3 scripts used this month"
- Generate button with loading state
- Paywall modal when limit reached
- Saves user preferences for next visit

### FR-04: Script Output View (/dashboard/script/[id])
- Script header: title, concept, badges (platform, style, tool), date, duration
- Scene cards: scene number, duration, visual description, camera direction, voiceover, on-screen text, AI generation prompt (highlighted), music/SFX, transition
- Copy button per scene's AI prompt (clipboard + "Copied!" feedback)
- Copy All Prompts button
- Favorite toggle, Share button (generates public URL), Remix button
- Delete with confirmation
- Export as text/PDF
- Public view via /s/[slug] (read-only, "Made with ScriptFlow AI" footer)

### FR-05: Dashboard (/dashboard)
- Welcome header with plan badge
- Stats: scripts this month, total scripts, favorites
- New Script CTA button
- Script list: cards with title, concept, badges, date, scene count
- Search, filter (platform, style, favorites), sort
- Pagination (20/page, load more)
- Empty state with illustration
- Upgrade prompt for free users

### FR-06: Settings (/dashboard/settings)
- Profile: edit name, avatar
- Default preferences: platform, style, AI tool
- Subscription management: current plan, billing date, upgrade/downgrade/cancel
- Billing history table
- Currency toggle (USD/INR)
- Delete account (danger zone)

### FR-07: PWA Requirements
- manifest.json with icons (192px, 512px), theme color
- Service worker: cache app shell, static assets, last 10 scripts
- Offline: shows cached scripts + "Generation requires internet" message
- Full-screen mode on mobile (display: standalone)
- Share target: receive text from other apps into concept field

---

## 7. AI PROMPT ENGINEERING

### System Prompt (store in src/lib/ai/system-prompt.ts, NEVER expose to client)
```
You are ScriptFlow AI, an expert short-form video script writer and AI prompt engineer.

Given a video concept, generate a complete scene-by-scene production script.

Output ONLY valid JSON matching the provided schema. No markdown, no explanation.

Rules:
1. Total scene durations MUST sum to the requested video duration
2. ai_generation_prompt MUST be formatted specifically for {{ai_tool}}
3. All content is for vertical 9:16 format
4. visual_style: {{style}}
5. Hook the viewer in Scene 1 (first 2 seconds)
6. End with CTA or punchline
7. on_screen_text: max 10 words per scene
8. Keep voiceover natural and conversational
```

### Tool-Specific Prompt Formatting
| AI Tool | Format Rules |
|---------|-------------|
| VEO 3 | Natural language: subject, action, setting, lighting, camera, duration, 9:16 |
| Kling 2.0 | Structured: [Subject] [Action] [Setting] --duration X --ar 9:16 --style Y |
| Runway Gen-4 | Paragraph emphasizing motion + Runway camera keywords (dolly, pan, tilt, zoom) |
| Pika 2.0 | Comma-separated tags with -ar 9:16, -s [style] |
| Midjourney | Scene description --ar 9:16 --style raw --v 6.1 (stills only, no motion) |
| Generic | Universal descriptive prompt, no tool-specific flags |

### Expected JSON Output
```json
{
  "title": "string (catchy, 5-10 words)",
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 4,
      "visual_description": "string",
      "camera_direction": "string",
      "voiceover_text": "string | null",
      "onscreen_text": "string | null",
      "ai_generation_prompt": "string (tool-specific)",
      "suggested_music": "string | null",
      "transition": "cut | fade | swipe | zoom | dissolve"
    }
  ]
}
```

---

## 8. PRICING & USAGE LIMITS

| Plan | Price (USD) | Price (INR) | Scripts/month | Features |
|------|-------------|-------------|---------------|----------|
| Free | $0 | ₹0 | 3 | Basic output, no prompt formatting in guest demo |
| Creator | $9/mo | ₹199/mo | 30 | All platforms, styles, prompt formatting, script history |
| Pro | $19/mo | ₹499/mo | Unlimited | Remix, trending hooks library, priority generation |

**Usage counter resets on 1st of each month via Supabase cron function.**

**Unit economics**: Run cost $30-70/mo. Break-even at 4-8 users. Gross margin at 100 users: ~90%.

---

## 9. GO-TO-MARKET STRATEGY

### Week 1: Build + Seed
- Build MVP with Claude Code (5-7 days)
- Create 3 videos USING ScriptFlow, post with "Made with ScriptFlow AI"
- Post in r/aivideo, AI creator Discords, Twitter/X

### Week 2: Validate + First Revenue
- Comment on AI video tool tutorials on YouTube
- Twitter/X thread: "I built an AI tool in 5 days that writes my entire video script"
- DM 20 mid-size AI creators offering free Pro for 3 months for a mention

### Week 3-4: Scale + Optimize
- Product Hunt launch
- SEO blog posts: "Best AI video script generators 2026", "How to write prompts for VEO 3"
- Free lead magnet: "Video Script Template Pack" PDF
- Referral program: share ScriptFlow, get 5 free scripts per referral

### Month 2+: Expand
- Trending hooks library (P1 feature)
- React Native mobile app
- Agency/team plans
- Razorpay integration for India market

### Distribution channels (all free/organic)
- Reddit: r/aivideo, r/Shorts, r/reels
- Twitter/X: build-in-public, AI creator circles
- YouTube: comments on AI video tutorials
- Discord: AI creator servers
- Product Hunt
- SEO: high-intent keywords

---

## 10. MONTHLY COST BREAKDOWN

### Month 1 (Building, 0 users): $6-11 (₹500-900)
- Supabase: $0 (free tier)
- Vercel: $0 (free tier)
- Claude API (development): ~$5-10
- Domain: ~$1/mo
- Resend: $0 (free tier)
- Stripe/Razorpay: $0

### Month 2-3 (Launched, 10-100 users): $9-36 (₹750-3,000)
- Supabase: $0 (free tier still)
- Vercel: $0 (free tier still)
- Claude API: ~$5-20
- Stripe/Razorpay fees: ~$3-15
- Revenue at this stage: $90-$1,900/mo

### Month 4-6 (Growing, 100-500 users): $116-246 (₹9,700-20,500)
- Supabase Pro: $25
- Vercel Pro: $20
- Claude API: ~$20-50
- Resend Starter: $20
- Stripe/Razorpay fees: ~$30-150
- Revenue at this stage: $900-$9,500/mo

---

## 11. DEVELOPMENT PHASES

| Phase | Duration | Deliverables | Success Criteria |
|-------|----------|-------------|-----------------|
| Phase 1 | Week 1 (Days 1-7) | Core: auth, generation form, AI integration, output view, dashboard | Can generate and view scripts end-to-end |
| Phase 2 | Week 2 (Days 8-14) | Payments: Stripe + Razorpay, usage limits, paywall, settings | Can accept payments, limits enforced |
| Phase 3 | Week 3 (Days 15-21) | Polish: landing page, PWA, SEO, export, share, analytics | PWA installable, launch ready |
| Phase 4 | Week 4+ | Launch: Product Hunt, communities, creator outreach, iterate | First paying customers |
| Phase 5 | Month 3-4 | Mobile: React Native app for App Store + Play Store | Apps approved and live |

---

## 12. COMPETITIVE MOAT

1. **Tool-specific prompt formatting** — Only tool that formats prompts for VEO 3, Kling, Runway, Pika specifically
2. **Prompt engineering knowledge** — System prompt encodes what actually works with each tool. Refines over time.
3. **Data flywheel** — Every script teaches us what concepts/styles work → feeds trending hooks library
4. **Built-in distribution** — Free tier watermark + creator partnerships = organic marketing
5. **SEO time barrier** — Early content on "AI video script generator" builds search authority competitors can't buy

---

## 13. NON-FUNCTIONAL REQUIREMENTS

- Performance: script generation < 15 seconds, page load (LCP) < 2.5s
- Security: JWT validation, RLS on all tables, API keys in env vars only, input sanitization, rate limiting
- Accessibility: WCAG 2.1 AA, keyboard navigation, 4.5:1 contrast
- SEO: server-rendered landing page, structured data, sitemap, Core Web Vitals
- Browser support: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Responsive: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)

---

## 14. ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## 15. CRITICAL DEVELOPMENT RULES

- NEVER put ANTHROPIC_API_KEY or SUPABASE_SERVICE_ROLE_KEY in client code
- NEVER trust client-side usage counters for billing decisions
- ALWAYS verify webhook signatures before processing events
- ALWAYS use parameterized queries (Supabase client handles this)
- NEVER store raw AI responses without validating JSON output
- ALWAYS handle AI generation failures gracefully (retry once, then show error)
- PWA service worker must NOT cache API routes or auth endpoints
- Use Zod for ALL input validation (shared between client and server)
- Error boundaries on every page layout
- Loading skeletons for all async data
- Optimistic UI updates for favorites and toggles
- All copy-to-clipboard uses navigator.clipboard API with fallback
- Dark theme by default, light theme supported
- All dates in user's local timezone
- All monetary values stored in cents/paise, displayed formatted

---

## 16. CLAUDE CODE PROMPTS (PHASE 1 SEQUENCE)

### Prompt 1: Project Init
"Read the CLAUDE.md file. Initialize this project with Next.js 15 (App Router), TypeScript, Tailwind CSS, and shadcn/ui. Set up the project structure as defined in CLAUDE.md. Create a .env.local.example file with all required environment variables."

### Prompt 2: Supabase Setup
"Set up Supabase integration: install @supabase/supabase-js and @supabase/ssr. Create Supabase client utilities (browser + server) in src/lib/supabase/. Set up auth middleware in middleware.ts to protect /dashboard/* routes. Create SQL migration with all four tables (users, scripts, scenes, subscriptions) and RLS policies."

### Prompt 3: Auth Pages
"Create the authentication pages: /login and /signup with email+password form, Google OAuth button, and magic link option. Use shadcn/ui form components with Zod validation. Create /auth/callback route for OAuth redirect. Style with dark theme."

### Prompt 4: Generation Form
"Create /dashboard/generate page with the script generation form. Include: concept textarea (max 500 chars with counter), duration radio group (15s/30s/60s), platform dropdown, visual style dropdown, AI tool dropdown. Use Zod schema for validation. Add a Generate button with loading state."

### Prompt 5: AI Integration
"Create the /api/generate API route. It should: validate input with Zod, check user's monthly usage limit, call Claude Haiku API with the system prompt, parse JSON response, save script + scenes to Supabase, increment usage counter, return the result. Handle all error cases."

### Prompt 6: Script Output View
"Create /dashboard/script/[id] page. Fetch script with scenes from Supabase. Display: script header with metadata badges, scene cards with all fields, copy button per AI prompt (navigator.clipboard), copy all prompts button, favorite toggle, share button, delete with confirmation."

### Prompt 7: Dashboard
"Create /dashboard page. Show: welcome header, stats cards (scripts this month, total, favorites), new script CTA, paginated script list with search and filters, empty state."

---

*This document is the single source of truth for ScriptFlow AI. Reference it for any product, technical, or business question.*
