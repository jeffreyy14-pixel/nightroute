import Stripe from 'stripe'
import { NextRequest } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json()

    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status === 'paid') {
      return Response.json({ paid: true })
    }

    return Response.json({ paid: false })

  } catch (error) {
    console.error('Verify error:', (error as any).message)
    return Response.json({ paid: false })
  }
}
