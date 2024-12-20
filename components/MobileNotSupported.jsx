'use client';

import { useEffect, useState } from 'react';

const MobileNotSupported = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(screen.width < 1024); // Using screen width for the breakpoint
        };

        // Initial check
        checkMobile();

        // Add resize listener for responsiveness
        const resizeListener = () => {
            setIsMobile(screen.width < 1024);
        };

        window.addEventListener('resize', resizeListener);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    // Render only for mobile screens
    if (!isMobile) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                overflow: 'hidden',
            }}
        >
            <h1 style={{ textAlign: 'center', fontSize: '24px', color: '#333' }}>
                Mobile devices are not supported. Please switch to a desktop view.
            </h1>
        </div>
    );
};

export default MobileNotSupported;
