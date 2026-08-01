import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Allowed CDN hostnames for Fal.AI video output
const ALLOWED_HOSTS = [
  "fal.media",
  "v3.fal.media",
  "storage.googleapis.com",
  "cdn.fal.ai",
  "fal-cdn.batuhan-941",
];

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return new NextResponse("url param required", { status: 422 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 422 });
  }

  if (!ALLOWED_HOSTS.some((h) => parsed.hostname.includes(h))) {
    return new NextResponse("URL not from an allowed host", { status: 403 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "video/mp4",
      "Cache-Control": "public, max-age=3600",
      // Allow FFmpeg.wasm (running in the same origin) to read this response
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
