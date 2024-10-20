'use client';

import { useParams } from 'next/navigation';
import StripePage from '@/components/StripePage'; // Adjust the path if necessary
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
    const params = useParams();
    const price = params.price;
    console.log('Price:', price);

    return <StripePage price={price} />;
}
