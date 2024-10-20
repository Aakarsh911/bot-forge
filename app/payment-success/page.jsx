'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import axios from 'axios';

export default function PaymentSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const amount = searchParams.get('amount');

        // Make a request to your API to update the user's credits
        const updateCredits = async () => {
            try {
                if (amount) {
                    // Send a POST request to update credits based on the amount
                    await axios.post('/api/users/update-credits', { amount });

                    console.log('Credits updated successfully');
                }
            } catch (error) {
                console.error('Error updating credits:', error);
            } finally {
                // Redirect to the homepage
                router.push('/dashboard');
            }
        };

        updateCredits();
    }, [searchParams, router]);

    return (
        <div>
            <p>Redirecting to the homepage...</p>
        </div>
    );
}
