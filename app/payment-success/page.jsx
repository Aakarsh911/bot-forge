'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasProcessed, setHasProcessed] = useState(false); // Track if payment success has been handled

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (hasProcessed || status !== 'authenticated') return; // Prevent multiple executions or if not authenticated

      try {
        console.log(session);
        const amount = searchParams.get('amount');
        const userId = searchParams.get('userId'); // Get userId from query params

        if (amount && userId) {
          console.log('Updating credits...');
          await axios.post('/api/users/update-credits', { amount, userId });

          console.log('Credits updated successfully');
          setHasProcessed(true); // Mark as processed
          router.push('/dashboard'); // Redirect after success
        } else {
          console.error('Missing amount or userId');
          router.push('/error'); // Redirect to an error page
        }
      } catch (error) {
        console.error('Error updating credits:', error);
        router.push('/error');
      }
    };

    if (status === 'authenticated') {
      handlePaymentSuccess();
    }
  }, [status, hasProcessed, searchParams, router, session]);

  if (status === 'loading') {
    return <p>Loading session...</p>;
  }

  if (hasProcessed) {
    return <p>Redirecting to your dashboard...</p>;
  }

  return <p>Processing payment success...</p>;
}
