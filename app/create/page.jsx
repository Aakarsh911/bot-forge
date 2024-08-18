'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './create.css';

export default function CreateBot() {

    useEffect(() => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.style.background = "#131313";
    });

    const { data: session, status } = useSession();
    const router = useRouter();
    
    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="create-box">
            <div class="ocean">
                <div class="wave"></div>
                <div class="wave"></div>
            </div>
            </div>
        </div>
    );
}
