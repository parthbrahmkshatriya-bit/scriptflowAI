import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { PRICING_TIERS } from '@/lib/constants';

/**
 * Capture stays tolerant of 'annual' even though it is no longer sold: an
 * order created just before the withdrawal is captured just after, and must
 * settle with the period the customer actually paid for. Creation is strict.
 */
type BillingCycle = 'monthly' | 'annual';

type PayPalCaptureOrderRequest = {
  orderId: string;
  plan: 'creator' | 'studio' | 'agency';
  billingCycle: BillingCycle;
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured.');
  }

  const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || 'Failed to fetch PayPal access token.');
  }

  return tokenData.access_token;
}

export async function POST(request: Request) {
  const body: PayPalCaptureOrderRequest = await request.json();
  const { orderId, plan, billingCycle } = body;

  if (!orderId || !plan || !billingCycle) {
    return new Response(JSON.stringify({ success: false, error: 'Missing orderId, plan, or billing cycle.' }), { status: 400 });
  }

  if (!['creator', 'studio', 'agency'].includes(plan)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid plan selected.' }), { status: 400 });
  }

  if (!['monthly', 'annual'].includes(billingCycle)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid billing cycle.' }), { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session?.user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const tier = PRICING_TIERS.find((item) => item.plan === plan);

  if (!tier) {
    return new Response(JSON.stringify({ success: false, error: 'Selected plan is not available.' }), { status: 400 });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: captureData?.message || 'Unable to capture PayPal order.',
        }),
        { status: captureResponse.status }
      );
    }

    const now = new Date();
    const currentPeriodEnd = new Date(now);
    if (billingCycle === 'monthly') {
      currentPeriodEnd.setUTCDate(currentPeriodEnd.getUTCDate() + 30);
    } else {
      currentPeriodEnd.setUTCDate(currentPeriodEnd.getUTCDate() + 365);
    }

    const admin = createAdminClient();
    const { error: insertError } = await admin.from('subscriptions').insert([
      {
        user_id: session.user.id,
        provider: 'paypal',
        provider_subscription_id: orderId,
        plan,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at_period_end: false,
      },
    ]);

    if (insertError) {
      return new Response(JSON.stringify({ success: false, error: insertError.message }), { status: 500 });
    }

    await admin
      .from('users')
      .update({
        plan,
        payment_provider: 'paypal',
        subscription_status: 'active',
        subscription_ends_at: currentPeriodEnd.toISOString(),
      })
      .eq('id', session.user.id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message || 'PayPal capture failed.' }), {
      status: 500,
    });
  }
}
