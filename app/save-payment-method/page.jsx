'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const SavePaymentMethodPage = () => {
    return (
        <Suspense fallback={<div>Loading payment details...</div>}>
            <SavePaymentMethodContent />
        </Suspense>
    );
};

const SavePaymentMethodContent = () => {
    const [clientSecret, setClientSecret] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const price = searchParams.get('price'); // Safely fetch price parameter

    useEffect(() => {
        // Redirect to login if unauthenticated
        if (status === 'unauthenticated') {
            signIn();
        }

        if (session) {
            // Call the Create Setup Intent API
            fetch('/api/create-setup-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: session.user.id }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    } else {
                        throw new Error('Failed to fetch client secret.');
                    }
                })
                .catch((err) => {
                    console.error('Error creating setup intent:', err);
                    setErrorMessage('Failed to load payment setup. Please try again.');
                });
        }
    }, [session, status]);

    if (!clientSecret) {
        return <div>Loading payment setup...</div>;
    }

    const options = { clientSecret };

    return (
        <Elements stripe={stripePromise} options={options}>
            <SavePaymentMethodForm price={price} />
        </Elements>
    );
};

const SavePaymentMethodForm = ({ price }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { data: session } = useSession();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setErrorMessage('Stripe has not loaded properly. Please try again.');
            setLoading(false);
            return;
        }

        const { setupIntent, error } = await stripe.confirmSetup({
            elements,
            confirmParams: {},
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message);
            console.error('Error saving payment method:', error);
            setLoading(false);
            return;
        }

        if (setupIntent.status === 'succeeded') {
            const paymentMethodId = setupIntent.payment_method;
            console.log('Retrieved PaymentMethod ID:', paymentMethodId);

            try {
                const response = await fetch('/api/save-payment-method', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: session.user.id,
                        setupIntentId: setupIntent.id,
                        recurringPrice: price,
                    }),
                });

                const data = await response.json();

                console.log('Backend response:', data);

                if (data.success) {
                    console.log('Payment Method Saved:', data.user.paymentMethodId);
                    console.log('Recurring Price Saved:', data.user.recurringPrice);
                } else {
                    setErrorMessage(data.error || 'Failed to save payment details.');
                }
            } catch (err) {
                console.error('Error saving payment method to backend:', err);
                setErrorMessage('Failed to save payment method. Please try again.');
            }
        } else {
            setErrorMessage('Payment setup was not successful.');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="payment-method-form">
            <PaymentElement />
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button type="submit" disabled={!stripe || loading}>
                {loading ? 'Saving...' : `Save Payment Method for $${price / 100}`}
            </button>
        </form>
    );
};

export default SavePaymentMethodPage;
