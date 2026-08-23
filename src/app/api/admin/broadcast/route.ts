import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendUpdateEmail } from "@/lib/email/send-update-email";

const ADMIN_EMAIL = "parth.brahmkshatriya@gmail.com";
// Resend free tier: 100 emails/day. Batch with a small delay to stay safe.
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1200;

export async function POST() {
  // 1. Auth — must be the admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Fetch all users with an email
  const admin = createAdminClient();
  const { data: users, error } = await admin
    .from("users")
    .select("email, full_name")
    .not("email", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const recipients = users ?? [];
  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0 });
  }

  // 3. Send in batches
  let sent = 0;
  let failed = 0;
  const failures: string[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (u) => {
        const result = await sendUpdateEmail({ userEmail: u.email, userName: u.full_name });
        if (result.ok) {
          sent++;
        } else {
          failed++;
          failures.push(`${u.email}: ${result.reason}`);
        }
      })
    );
    // Pause between batches to respect Resend rate limits
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log(`[broadcast] Done — sent: ${sent}, failed: ${failed}, total: ${recipients.length}`);
  return NextResponse.json({ sent, failed, total: recipients.length, failures });
}
