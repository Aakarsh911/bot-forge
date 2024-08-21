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
                    console.log(data);
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
                <div className="create-content">
                    <div className="bot-customization">
                        <div className="customization-header">
                            <div 
                                className={`tab ${activeTab === 'Appearance' ? 'active-tab' : ''}`} 
                                onClick={() => handleTabClick('Appearance')}
                            >
                                Appearance
                            </div>
                            <div 
                                className={`tab ${activeTab === 'APIs' ? 'active-tab' : ''}`} 
                                onClick={() => handleTabClick('APIs')}
                            >
                                APIs
                            </div>
                            <div 
                                className={`tab ${activeTab === 'Integration' ? 'active-tab' : ''}`} 
                                onClick={() => handleTabClick('Integration')}
                            >
                                Integration
                            </div>
                        </div>
                        <div className="customization-body">
                            {activeTab === 'Appearance' && (
                                <div className="tab-content appearance-section">
                                    Appearance Section
                                </div>
                            )}
                            {activeTab === 'APIs' && (
                                <div className="tab-content apis-section">
                                    APIs Section
                                </div>
                            )}
                            {activeTab === 'Integration' && (
                                <div className="tab-content integration-section">
                                    Integration Section
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bot-preview">
                        <div className="chat-preview">
                            {showTyping && (
                                <div className="chat-bubble bot typing-indicator" style={{ backgroundColor: botAppearance.botBubbleColor }}>
                                    Bot is typing
                                    <div className="dots-container">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                </div>
                            )}
                            {showBotMessage && (
                                <div className="chat-bubble bot" style={{ backgroundColor: botAppearance.botBubbleColor }}>
                                    Bot: This is a sample bot response.
                                </div>
                            )}
                            {showUserMessage && (
                                <div className="chat-bubble user" style={{ backgroundColor: botAppearance.userBubbleColor }}>
                                    User: This is a sample user response.
                                </div>
                            )}
                        </div>
                        <button className="close-button" style={{ backgroundColor: botAppearance.closeButtonColor }}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
