'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './config.css';

export default function ConfigBot() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const botId = params.botId;

    const [botAppearance, setBotAppearance] = useState({
        widgetColor: '#0157f9',
        botBubbleColor: '#ffffff',
        userBubbleColor: '#ffffff',
        botTypingColor: '#0157f9',
        closeButtonColor: '#ffffff',
    });

    const [showTyping, setShowTyping] = useState(true);
    const [showBotMessage, setShowBotMessage] = useState(false);
    const [showUserMessage, setShowUserMessage] = useState(false);

    const [activeTab, setActiveTab] = useState('Appearance');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        const fetchBotData = async () => {
            try {
                const response = await fetch(`/api/bots/${botId}`);
                if (response.ok) {
                    const data = await response.json();
                    setBotAppearance({
                        widgetColor: data.widgetColor || '#0157f9',
                        botBubbleColor: data.botResponseColor || '#ffffff',
                        userBubbleColor: data.userResponseColor || '#ffffff',
                        botTypingColor: data.botTypingColor || '#0157f9',
                        closeButtonColor: data.closeButtonColor || '#ffffff',
                    });
                } else {
                    console.error('Failed to fetch bot data');
                }
            } catch (error) {
                console.error('An error occurred while fetching the bot data:', error);
            }
        };

        fetchBotData();

        // Simulate typing and message loading
        setTimeout(() => setShowTyping(false), 3000); // Hide typing indicator after 3 seconds
        setTimeout(() => setShowBotMessage(true), 3200); // Show bot message after 3.2 seconds
        setTimeout(() => setShowUserMessage(true), 3700); // Show user message after 3.7 seconds
    }, [botId]);

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="config-box">
                <div className="grid-background-config"></div>
                <div className="orb orb1"></div>
                <div className="orb orb2"></div>
            </div>
        </div>
    );
}
