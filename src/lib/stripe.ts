import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.')
}

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null

// Stripe subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    maxUsers: 5,
    features: [
      'Up to 5 new hires per month',
      'Basic compliance modules',
      'Progress tracking',
      'Policy library access'
    ]
  },
  PAID: {
    id: 'paid',
    name: 'Professional',
    price: 10,
    maxUsers: -1, // Unlimited
    features: [
      'Unlimited new hires',
      'All compliance modules',
      'Advanced analytics',
      'Custom policy creation',
      'Priority support',
      'API access'
    ]
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Stripe API functions (these would typically be server-side)
export const createCheckoutSession = async (planId: string, companyId: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        companyId,
        successUrl: `${window.location.origin}/app?payment=success`,
        cancelUrl: `${window.location.origin}/app?payment=cancelled`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    
    const stripeInstance = await stripe
    if (!stripeInstance) {
      throw new Error('Stripe not initialized')
    }

    const { error } = await stripeInstance.redirectToCheckout({
      sessionId,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const createPortalSession = async (customerId: string) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/app`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}
