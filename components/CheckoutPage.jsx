"use client";

import React, { useEffect, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "../css/CheckoutPage.css";

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutPage = ({ amount }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (amount > 0) {
      // Fetch the clientSecret from your backend
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      })
        .then((res) => res.json())
        .then((data) => {
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
    } else {
      setErrorMessage("Invalid amount.");
    }
  }, [amount]);

  if (!clientSecret) {
    return (
      <div className="loading-container">
        <div className="spinner" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Options to pass to Elements
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded properly. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Confirm the payment using Stripe's confirmPayment method
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `http://www.localhost:3000/payment-success?amount=${amount}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        console.error("Error during payment confirmation:", error);
      } else {
        console.log("Payment successful!");
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
