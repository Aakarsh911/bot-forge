'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SamplePage() {
    const params = useParams();
    const botId = params.botId;
    const [widgetColor, setWidgetColor] = useState('#0157f9'); // Default color
    const [isIframeVisible, setIsIframeVisible] = useState(false);

    useEffect(() => {
        // Fetch widget color from API
        const fetchBotData = async () => {
            try {
                const response = await fetch(`/api/bots/${botId}`);
                if (response.ok) {
                    const data = await response.json();
                    setWidgetColor(data.bot.widgetColor || '#0157f9'); // Use the color from the API or default
                } else {
                    console.error('Failed to fetch bot data');
                }
            } catch (error) {
                console.error('An error occurred while fetching the bot data:', error);
            }
        };

        fetchBotData();
    }, [botId]);

    const toggleIframe = () => {
        setIsIframeVisible(!isIframeVisible);
    };

    return (
        <div style={{ position: 'relative', height: '100vh', backgroundColor: '#f0f0f0' }}>
            <h1 style={{ textAlign: 'center', paddingTop: '20px' }}>Sample Page</h1>

            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: widgetColor,
                    cursor: 'pointer',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={toggleIframe}
            >
                <span style={{ fontSize: '24px', color: '#fff' }}>+</span>
            </div>

            {/* Render iframe but toggle visibility */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '20px',
                    width: '400px',
                    height: '600px',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                    display: isIframeVisible ? 'block' : 'none', // Use CSS to toggle visibility
                }}
            >
                <iframe
                    src={`https://bot-forge.vercel.app/view-bot/${botId}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
            </div>
        </div>
    );
}
