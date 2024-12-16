import { NextResponse } from 'next/server';
import User from '../../../models/user'; // Adjust path as needed
import { connectToDB } from '@/utils/database';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId, setupIntentId, recurringPrice } = await request.json();

        // Validate required parameters
        if (!userId || !setupIntentId || !recurringPrice) {
            console.error('Missing parameters:', { userId, setupIntentId, recurringPrice });
            return NextResponse.json(
                { error: 'Missing required parameters: userId, setupIntentId, or recurringPrice.' },
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDB();
        console.log('Connected to MongoDB.');

        // Fetch the user
        let user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        console.log('User before updates:', {
            id: user._id.toString(),
            stripeCustomerId: user.get('stripeCustomerId'),
        });

        // Retrieve the SetupIntent
        console.log(`Retrieving Setup Intent: ${setupIntentId}`);
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
        const paymentMethodId = setupIntent.payment_method;

        if (!paymentMethodId) {
            return NextResponse.json(
                { error: 'PaymentMethod not found in SetupIntent.' },
                { status: 400 }
            );
        }
        console.log('Retrieved PaymentMethod ID:', paymentMethodId);

        // Retrieve the PaymentMethod to check its ownership
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        if (!paymentMethod) {
            return NextResponse.json(
                { error: 'Failed to retrieve PaymentMethod.' },
                { status: 500 }
            );
        }

        console.log('Retrieved PaymentMethod details:', paymentMethod);

        // Check if the PaymentMethod is already attached to another customer
        if (paymentMethod.customer && paymentMethod.customer !== user.get('stripeCustomerId')) {
            console.log(
                `PaymentMethod ${paymentMethodId} is already attached to another customer: ${paymentMethod.customer}`
            );

            // Update the user's stripeCustomerId to match the PaymentMethod's customer
            user.set('stripeCustomerId', paymentMethod.customer);
            user.stripeCustomerId = paymentMethod.customer;
            user.set('paymentMethodId', paymentMethodId);
            user.stripeCustomerId = paymentMethod.customer;
            try {
                await user.save();
            } catch (saveError) {
                console.error('Error saving user:', saveError);
                // Potentially handle or rethrow
            }
            console.log(`Setting user's stripeCustomerId to ${paymentMethod.customer}...`);
        } else if (!user.get('stripeCustomerId')) {
            // Create a new Stripe Customer if the user doesn't have one
            console.log('User does not have a Stripe Customer ID. Creating one...');
            const newCustomer = await stripe.customers.create({
                email: user.get('email'),
                metadata: { userId: user._id.toString() },
            });
            user.set('stripeCustomerId', paymentMethod.customer);
            user.stripeCustomerId = paymentMethod.customer;
            user.set('paymentMethodId', paymentMethodId);
            user.stripeCustomerId = paymentMethod.customer;
            try {
                await user.save();
            } catch (saveError) {
                console.error('Error saving user:', saveError);
                // Potentially handle or rethrow
            }
            console.log('Stripe Customer created:', newCustomer.id);
        }

        // Save the user with updated stripeCustomerId
        try {
            await user.save();
        } catch (saveError) {
            console.error('Error saving user:', saveError);
            // Potentially handle or rethrow
        }

        console.log('User after saving updates:', {
            id: user._id.toString(),
            stripeCustomerId: user.get('stripeCustomerId'),
        });

        // Save PaymentMethod and Recurring Price to User
        user.set('paymentMethodId', paymentMethodId);
        user.set('recurringPrice', recurringPrice);
        await user.save();

        console.log('User successfully updated:', {
            id: user._id.toString(),
            stripeCustomerId: user.get('stripeCustomerId'),
            paymentMethodId: user.get('paymentMethodId'),
            recurringPrice: user.get('recurringPrice'),
        });

        return NextResponse.json({
            success: true,
            message: 'PaymentMethod linked and user updated successfully.',
            user: {
                id: user._id.toString(),
                email: user.get('email'),
                username: user.get('username'),
                paymentMethodId: user.get('paymentMethodId'),
                recurringPrice: user.get('recurringPrice'),
                stripeCustomerId: user.get('stripeCustomerId'),
            },
        });
    } catch (error) {
        console.error('Error processing request:', error.message);
        return NextResponse.json(
            { error: 'Failed to process payment method.', details: error.message },
            { status: 500 }
        );
    }
}
