'use client';

import { useParams } from 'next/navigation';
import StripePage from '@/components/StripePage'; // Adjust the path if necessary
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const params = useParams();
    const price = params.price;
    console.log('Price:', price);
    const { data: session, status } = useSession();

    useEffect(() => {
        console.log('Session:', session);
    });
    return <StripePage price={price} />;
}
