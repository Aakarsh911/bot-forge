'use client';

import React, { useEffect, useState, Suspense } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSession, signIn } from 'next-auth/react';
import "../css/CheckoutPage.css";

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutPage = ({ amount }) => {
    return (
        <Suspense fallback={<div>Loading payment details...</div>}>
            <CheckoutContent amount={amount} />
        </Suspense>
    );
};

const CheckoutContent = ({ amount }) => {
    const [clientSecret, setClientSecret] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        console.log('checkout:', session);

        // Redirect to login if user is not authenticated
        if (status === 'unauthenticated') {
            signIn();
        }

        if (amount > 0 && session) {
            // Fetch the clientSecret from your backend
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount, userId: session.user.id }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log("Payment details:", data);
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                        console.log("Client secret:", data.clientSecret);
                    } else {
                        throw new Error("Client secret not returned");
                    }
                })
                .catch((err) => {
                    console.error("Error fetching client secret:", err);
                    setErrorMessage("Failed to load payment details. Please try again.");
                });
        } else if (status === 'authenticated') {
            setErrorMessage("Invalid amount.");
        }
    }, [amount, session, status]);

    if (status === "loading" || !clientSecret) {
        return (
            <div className="loading-container">
                <div className="spinner" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return <div className="error-message">{errorMessage}</div>;
    }

    const options = { clientSecret };

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm amount={amount} />
        </Elements>
    );
};

// The actual form component where PaymentElement is rendered
const CheckoutForm = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setErrorMessage("Stripe has not loaded properly. Please try again.");
            setLoading(false);
            return;
        }

        try {
            const { paymentIntent, error } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

            if (error) {
                setErrorMessage(error.message);
                console.error("Error during payment confirmation:", error);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                console.log("Payment successful:", paymentIntent);
                // Redirect manually
                if (typeof window !== 'undefined') {
                    const redirectString = `/payment-success?amount=${amount}&userId=${session.user.id}`;
                    window.location.href = redirectString;
                }
            } else {
                setErrorMessage("Payment could not be completed. Please try again.");
                console.error("Payment status:", paymentIntent?.status);
            }
        } catch (err) {
            setErrorMessage("Unexpected error occurred. Please try again.");
            console.error("Error confirming payment:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <PaymentElement />
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button
                disabled={!stripe || !elements || loading}
                className={`submit-button ${loading ? "disabled" : ""}`}
            >
                {!loading ? `Pay $${amount}` : "Processing..."}
            </button>
        </form>
    );
};

export default CheckoutPage;
