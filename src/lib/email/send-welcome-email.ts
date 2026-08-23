import { Resend } from "resend";

const FROM = "Parth from ScriptFlow AI <parth@scriptflow.ai>";

export async function sendWelcomeEmail(params: {
  userEmail: string;
  userName?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("placeholder")) {
    console.log("[email] RESEND_API_KEY not configured — skipping welcome email");
    return;
  }

  const resend = new Resend(apiKey);
  const { userEmail, userName } = params;
  const firstName = userName?.split(" ")[0]?.trim() || "there";

  const subject = "Welcome to ScriptFlow AI — your complete AI video studio 🎬";

  const text = `Hey ${firstName},

Welcome to ScriptFlow AI — really glad you're here.

I built this because I was tired of jumping between
5 different tools just to make one AI video.
So I built the entire pipeline in one place.

Here's what you can do right now:

→ Type any video idea (one line is enough)
→ Get a complete scene-by-scene script in seconds
→ Generate voiceover for each scene instantly
→ Generate AI video for each scene (VEO 3, Kling, Runway)
→ Download your finished video — ready to post

One idea. One tool. One video. Done.

Your free plan gives you 3 scripts/month —
no credit card needed, no pressure.

—

Quick tip to get the best results:
Be specific with your idea. Instead of "a travel video,"
try "a solo traveler discovering a hidden café in Kyoto
at golden hour." The more detail you give, the better
the output across every step.

—

🚀 Coming very soon: Auto-stitch
We're adding automatic scene stitching — all your
generated scenes will be merged into one ready-to-download
video automatically. No editing software needed.

—

If you run into anything or have feedback, reply directly
— I read every single one personally.

Let's make something great.

Parth
Founder, ScriptFlow AI
scriptflowai.co`;

  try {
    await resend.emails.send({ from: FROM, to: userEmail, subject, text });
    console.log(`[email] Welcome email sent to ${userEmail}`);
  } catch (err) {
    // Non-fatal — never block the auth flow for an email failure
    console.error("[email] Failed to send welcome email:", err);
  }
}
