import { Resend } from "resend";

const FROM = "Parth from ScriptFlow AI <parth@scriptflow.ai>";

export async function sendUpdateEmail(params: {
  userEmail: string;
  userName?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("placeholder")) {
    console.log("[email] RESEND_API_KEY not configured — skipping update email");
    return { ok: false, reason: "no_api_key" };
  }

  const resend = new Resend(apiKey);
  const firstName = params.userName?.split(" ")[0]?.trim() || "there";

  const subject = "ScriptFlow AI just got a big upgrade ⚡";

  const text = `Hey ${firstName},

Just shipped a big update to ScriptFlow AI —
wanted to make sure you didn't miss it.

Here's what's new:

─────────────────────────────────────

⚡ FAST MODE vs ✨ PRO MODE for video generation

You can now choose how you want to generate
each scene's video:

Fast (OVI) — generates in ~30 seconds, $0.20/scene
Perfect for drafts, testing, and quick turnarounds.

Pro (VEO 3) — Google's best model, 2-4 minutes
Photorealistic quality, native audio, full voiceover.

Switch between them per scene, right inside the editor.

─────────────────────────────────────

🎬 MUCH better VEO 3 video quality

The way ScriptFlow writes your VEO 3 prompts
has been completely rebuilt.

Before: basic descriptions.
Now: full director's brief — specific lighting,
lens, color grading, voice characterisation,
audio mix. The kind of detail that actually
gets you cinematic results.

─────────────────────────────────────

🎞️ AUTO-STITCH IS LIVE

(This was "coming soon" in my last email —
it's here now.)

Once you've generated videos for your scenes,
hit the Stitch button at the top of your script.
ScriptFlow downloads all your clips and merges
them into one final MP4 right in your browser.
No editing software. No upload. Just click.

─────────────────────────────────────

👍 Rate your scripts and videos

There's now a quick thumbs-up / thumbs-down
on every script and every generated video.

Takes 2 seconds. Helps me understand what's
working and what needs fixing. Really appreciate it.

─────────────────────────────────────

Everything else:

→ Timestamps on all your scripts
→ Smooth navigation with loading states
→ Cleaner video generation status (no more clutter)

─────────────────────────────────────

Log in and try it:
${process.env.NEXT_PUBLIC_APP_URL ?? "https://scriptflowai.co"}/dashboard

If something feels off or you have feedback,
just reply to this email — I read every one personally.

— Parth
Founder, ScriptFlow AI
scriptflowai.co`;

  try {
    await resend.emails.send({ from: FROM, to: params.userEmail, subject, text });
    return { ok: true };
  } catch (err) {
    console.error(`[email] Failed to send update email to ${params.userEmail}:`, err);
    return { ok: false, reason: String(err) };
  }
}
