"use client";

import { useEffect, useState } from 'react';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';
import { PRICING_TIERS } from '@/lib/constants';
import { isIndianUser } from '@/lib/location';
import type { SubscriptionPlan } from '@/types/database';

type BillingCycle = 'monthly' | 'annual';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve(false); return; }
    if (document.querySelector('script[src*="razorpay"]')) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isIndia, setIsIndia] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    setIsIndia(isIndianUser());
  }, []);

  const handleSuccess = (plan: string) => {
    setStatus({ type: 'success', text: `Payment successful! Your ${plan} plan is now active.` });
    window.setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleError = (error: string) => {
    setStatus({ type: 'error', text: error });
  };

  const handleRazorpayPayment = async (plan: SubscriptionPlan, planName: string) => {
    setLoadingPlan(plan);
    setStatus(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setStatus({ type: 'error', text: 'Razorpay failed to load. Please try again.' });
      setLoadingPlan(null);
      return;
    }

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus({ type: 'error', text: err.error || 'Failed to create order.' });
        setLoadingPlan(null);
        return;
      }

      const { order_id, amount, currency, key_id } = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const razorpay = new (window as any).Razorpay({
        key: key_id,
        amount,
        currency,
        name: 'ScriptFlow AI',
        description: `${planName} Plan — ${billingCycle === 'annual' ? 'Annual' : 'Monthly'}`,
        order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              billingCycle,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            handleSuccess(planName);
          } else {
            handleError(result.error || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
        theme: { color: '#0ea5e9' },
      });

      razorpay.on('payment.failed', () => {
        handleError('Payment failed. Please try again or contact support.');
        setLoadingPlan(null);
      });

      razorpay.open();
    } catch {
      setStatus({ type: 'error', text: 'Connection error. Please check your internet.' });
      setLoadingPlan(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 text-white">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">Pricing</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Flexible plans for creators, studios, and agencies.
          </h2>
          <p className="text-base leading-8 text-zinc-400">
            Pay in INR if you are in India, or pay in USD with PayPal from anywhere else.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              billingCycle === 'monthly'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-zinc-300 hover:text-white'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              billingCycle === 'annual'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-zinc-300 hover:text-white'
            }`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-4">
        {PRICING_TIERS.map((tier) => {
          const price = isIndia
            ? billingCycle === 'monthly'
              ? tier.inrMonthly
              : tier.inrAnnual
            : billingCycle === 'monthly'
            ? tier.usdMonthly
            : tier.usdAnnual;
          const currency = isIndia ? '₹' : '$';
          const period = billingCycle === 'monthly' ? '/mo' : '/yr';
          const isPaid = tier.plan !== 'free';

          return (
            <div
              key={tier.plan}
              className={`rounded-[2rem] border border-white/10 p-8 transition ${
                tier.plan === 'free' ? 'bg-white/5' : 'bg-black/20'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">{tier.name}</p>
                  <p className="mt-4 text-3xl font-semibold text-white">
                    {currency}{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-base font-medium text-zinc-400">{isPaid ? period : ''}</span>
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-zinc-300">{tier.description}</p>

              <ul className="mt-8 space-y-3 text-sm text-zinc-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {!isPaid ? (
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-sky-50"
                    onClick={() => { window.location.href = '/signup'; }}
                  >
                    Start Free
                  </button>
                ) : isIndia ? (
                  <button
                    type="button"
                    disabled={loadingPlan === tier.plan}
                    className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => handleRazorpayPayment(tier.plan as SubscriptionPlan, tier.name)}
                  >
                    {loadingPlan === tier.plan ? 'Loading...' : 'Pay with Razorpay'}
                  </button>
                ) : (
                  <PayPalCheckoutButton
                    plan={tier.plan as 'creator' | 'studio' | 'agency'}
                    billingCycle={billingCycle}
                    onSuccess={() => handleSuccess(tier.name)}
                    onError={handleError}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
        {isIndia
          ? 'Secure payments via Razorpay 🇮🇳'
          : 'Secure payments via PayPal 🌍'}
      </div>

      {status ? (
        <div
          className={`mt-6 rounded-3xl border p-4 text-sm ${
            status.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-100'
          }`}
        >
          {status.text}
        </div>
      ) : null}
    </section>
  );
}
