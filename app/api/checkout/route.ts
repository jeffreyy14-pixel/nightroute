import Stripe from 'stripe'
import { NextRequest } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLANS = {
  soiree: {
    name: 'Une soirée',
    price: 99, // en cents = 0.99$
    credits: 1,
  },
  weekend: {
    name: 'Un weekend',
    price: 199,
    credits: 3,
  },
  semaine: {
    name: 'Une semaine',
    price: 399,
    credits: 7,
  },
  mois: {
    name: 'Un mois',
    price: 799,
    credits: 30,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()

    const selectedPlan = PLANS[plan as keyof typeof PLANS]

    if (!selectedPlan) {
      return Response.json({ error: 'Forfait invalide' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `NightRoute — ${selectedPlan.name}`,
              description: `${selectedPlan.credits} plan${selectedPlan.credits > 1 ? 's' : ''} de soirée`,
            },
            unit_amount: selectedPlan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&credits=${selectedPlan.credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    })

    return Response.json({ url: session.url })

  } catch (error) {
    console.error('Stripe error:', (error as any).message)
    return Response.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}
