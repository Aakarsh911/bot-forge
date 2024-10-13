import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount } = await request.json(); // Get the amount from the request body

    if (!amount) {
      throw new Error("Amount is missing in the request body");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe accepts amounts in cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    console.log("Client secret:", paymentIntent.client_secret);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
