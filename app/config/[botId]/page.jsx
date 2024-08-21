'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './config.css';

export default function ConfigBot() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State for bot appearance settings
    const [botAppearance, setBotAppearance] = useState({
        widgetColor: '#0157f9',
        botBubbleColor: '#ffffff',
        userBubbleColor: '#000000',
    });

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="create-box">
                <div className="create-content">
                    <div className="bot-customization">
                    </div>
                    <div className="bot-preview">
                    </div>
                </div>
                {/* End Here */}
            </div>
        </div>
    );
}
