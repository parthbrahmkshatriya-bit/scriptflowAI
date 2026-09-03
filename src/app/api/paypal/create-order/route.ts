import { createClient } from '@/lib/supabase/server';
import { PRICING_TIERS } from '@/lib/constants';

/** Annual was withdrawn — monthly is the only cycle sold. */
type BillingCycle = 'monthly';

type PayPalCreateOrderRequest = {
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
  const body: PayPalCreateOrderRequest = await request.json();
  const { plan, billingCycle } = body;

  if (!plan || !billingCycle) {
    return new Response(JSON.stringify({ error: 'Missing plan or billing cycle.' }), { status: 400 });
  }

  if (!['creator', 'studio', 'agency'].includes(plan)) {
    return new Response(JSON.stringify({ error: 'Invalid plan selected.' }), { status: 400 });
  }

  // Reject rather than silently downgrade to monthly — a caller asking for a
  // year must not be charged for a month without being told.
  if (billingCycle !== 'monthly') {
    return new Response(
      JSON.stringify({ error: 'Only monthly billing is available.' }),
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const tier = PRICING_TIERS.find((item) => item.plan === plan);

  if (!tier) {
    return new Response(JSON.stringify({ error: 'Selected plan is not available.' }), { status: 400 });
  }

  const price = tier.usdMonthly;

  if (price <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid price for selected plan.' }), { status: 400 });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: price.toFixed(2),
            },
            description: `ScriptFlow AI ${tier.name} Plan - ${billingCycle}`,
          },
        ],
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return new Response(JSON.stringify({ error: orderData?.message || 'Unable to create PayPal order.' }), {
        status: orderResponse.status,
      });
    }

    return new Response(JSON.stringify({ orderId: orderData.id }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message || 'PayPal order creation failed.' }), {
      status: 500,
    });
  }
}
