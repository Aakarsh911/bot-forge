import { NextResponse } from 'next/server';
import User from '../../../../../../models/user'; // Adjust the path if necessary
import { connectToDB } from '@/utils/database'; // Utility to connect to the MongoDB database
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe for payment handling

export async function POST(request, { params }) {
    const { userId, modelType } = params;
    let customerId = "";

    try {
        console.log('Request Params:', { userId, modelType }); // Log incoming parameters

        // Connect to the database
        await connectToDB();
        console.log('Connected to MongoDB');

        // Fetch the user by ID from the MongoDB database
        const user = await User.findById(userId);

        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('User:', user);
        console.log ('User credits:', user.credits);
        console.log('User payment method:', user.get('paymentMethodId'));
        console.log('User recurring price:', user.get('recurringPrice'));
        console.log('User Stripe Customer ID:', user.get('stripeCustomerId'));
        console.log('User email:', user.email);

        const paymentMethodId = user.get('paymentMethodId');
        const recurringPrice = user.get('recurringPrice');
        const stripeCustomerId = user.get('stripeCustomerId');

        // Determine the amount of credits to reduce based on the modelType
        const creditsToReduce = modelType === 'image' ? 2 : 1;

        console.log(`Reducing credits by ${creditsToReduce} for model type ${modelType}`);
        user.credits -= creditsToReduce;

        // Check if credits have dropped below zero
        if (user.credits < 0) {
            console.log('User credits below zero, initiating recharge process...');
            const rechargeAmount = user.recurringPrice; // The price to charge in cents
            const creditsToAdd = Math.round(rechargeAmount / 3);

            if (!user.get('paymentMethodId') || !user.get('recurringPrice')) {
                console.error('User missing payment details:', {
                    paymentMethodId: user.paymentMethodId,
                    recurringPrice: user.recurringPrice,
                });
                return NextResponse.json(
                    { error: 'User does not have a saved payment method or recurring price.' },
                    { status: 400 }
                );
            }

            console.log("customer id:" + customerId);
            try {
                console.log('Charging user via Stripe...');
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: recurringPrice, // Convert to cents
                    currency: 'usd',
                    customer: stripeCustomerId,
                    payment_method: user.get('paymentMethodId'),
                    off_session: true, // Charge automatically without user interaction
                    confirm: true,
                });

                if (paymentIntent.status === 'succeeded') {
                    console.log('Payment succeeded:', paymentIntent.id);
                    user.credits += creditsToAdd; // Add credits to the user's account
                    console.log(`Added ${creditsToAdd} credits to user account.`);
                } else {
                    console.error('Payment failed:', paymentIntent.status);
                    return NextResponse.json(
                        { error: 'Payment failed.', paymentStatus: paymentIntent.status },
                        { status: 400 }
                    );
                }
            } catch (paymentError) {
                console.error('Error during payment:', paymentError);
                return NextResponse.json(
                    { error: 'Failed to process payment for recharge.', details: paymentError.message },
                    { status: 402 }
                );
            }
        }

        // Save the updated user back to the database
        await user.save();
        console.log('Updated user credits:', user.credits);

        // Return the updated credits
        return NextResponse.json({ credits: user.credits });
    } catch (error) {
        console.error('Error reducing credits:', error);
        return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
    }
}
