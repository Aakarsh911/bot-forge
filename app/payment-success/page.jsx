'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, getSession } from 'next-auth/react';
import { useEffect } from 'react';
import axios from 'axios';

export default function PaymentSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    //get session
    useEffect(() => {
        getSession().then(r => console.log(r));
    }, []);

    useEffect(() => {
        console.log('Session status:', status);

        const amount = searchParams.get('amount');

        // Function to update user credits
        const updateCredits = async () => {
            try {
                if (amount && status === 'authenticated') {
                    // Update credits based on payment amount
                    await axios.post('/api/users/update-credits', { amount });
                    console.log('Credits updated successfully');
                }
            } catch (error) {
                console.error('Error updating credits:', error);
            } finally {
                // Redirect to the dashboard or homepage after updating credits
                router.push('/dashboard');
            }
        };

        // Handle different session states
        if (status === 'loading') {
            // If session is still loading, don't do anything yet
            console.log('Session is loading...');
        } else if (status === 'authenticated') {
            // If session is authenticated, update credits
            updateCredits();
        }
    }, [searchParams, status, router]);

    return <p>Redirecting to the dashboard...</p>;
}
