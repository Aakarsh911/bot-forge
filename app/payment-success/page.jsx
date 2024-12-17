'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (hasProcessed || status !== 'authenticated') return;

      try {
        console.log(session);
        const amount = searchParams.get('amount');
        const userId = searchParams.get('userId');

        if (amount && userId) {
          console.log('Updating credits...');
          await axios.post('/api/users/update-credits', { amount, userId });

          console.log('Credits updated successfully');
          setHasProcessed(true);
          router.push('/dashboard');
        } else {
          console.error('Missing amount or userId');
          router.push('/error');
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

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<p>Loading payment details...</p>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
