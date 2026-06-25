const RAZORPAY_API = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  const creds = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string
): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Razorpay error shape: { error: { code, description, ... } }
    const description = data?.error?.description ?? data?.error?.code ?? `HTTP ${res.status}`;
    console.error("[razorpay] order creation failed:", res.status, JSON.stringify(data));
    throw new Error(`Razorpay: ${description}`);
  }

  return data as RazorpayOrder;
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const { createHmac } = await import("crypto");
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}
