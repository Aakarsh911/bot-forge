import { NextResponse } from 'next/server';
import User from '../../../models/user'; // Adjust path as needed
import { connectToDB } from '@/utils/database';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            console.error('Missing required parameter: userId.');
            return NextResponse.json(
                { error: 'Missing required parameter: userId.' },
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDB();
        console.log('Connected to MongoDB.');

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        let stripeCustomerId = user.get('stripeCustomerId');
        if (!stripeCustomerId) {
            console.log('Creating Stripe customer...');
            const customer = await stripe.customers.create({
                email: user.get('email'),
                metadata: { userId: user._id.toString() },
            });
            stripeCustomerId = customer.id;
            user.set('stripeCustomerId', stripeCustomerId);
            await user.save();
        }

        console.log(`Creating SetupIntent for customer: ${stripeCustomerId}`);
        const setupIntent = await stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
        });

        return NextResponse.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
        console.error('Error creating SetupIntent:', error.message);
        return NextResponse.json(
            { error: 'Failed to create SetupIntent.', details: error.message },
            { status: 500 }
        );
    }
}
