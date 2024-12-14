'use client';

import ScrollMagic from 'scrollmagic';
import { signIn, signOut, useSession } from 'next-auth/react';
import Provider from '../components/Provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import configImg from '/images/config-img.png';
import configImg2 from '/images/config-img2.png';
import '/css/main.css';
import Timeline from '@/components/Timeline';
import IntegrationCode from '@/components/IntegrationCode';

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const controller = new ScrollMagic.Controller();

    // Scroll animation for the features section
    new ScrollMagic.Scene({
      triggerElement: '#features-container',
      triggerHook: 0.8, // Trigger animation when 80% of the container is visible
      reverse: false, // Animate only once
    })
      .setTween('#features-container', {
        opacity: 1,
        transform: 'translateY(0)',
      })
      .addTo(controller);
  }, []);

  // Logout functionality
  const handleLogout = () => {
    signOut({ redirect: false });
    document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear();
    router.push('/');
  };

  return (
    <Provider>
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">BotForge</h1>
        <div className="nav-links">
          <button onClick={() => router.push('/pricing')}>Pricing</button>
          <button onClick={() => router.push('/support')}>Support</button>
          {session ? (
            <>
              <button onClick={() => router.push('/dashboard')}>Dashboard</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button onClick={() => signIn('google', { prompt: 'select_account' })}>
              Login with Google
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="main-content">
      <div className="grid-background"></div>
        <div className="left-side">
          <h1 className="header-logo">Forge Your Chatbot</h1>
        </div>
        <div className="right-side">
          <Image src={configImg} className="config-img" alt="Chatbot Configuration" />
          <Image src={configImg2} className="config-img2" alt="Chatbot Options" />
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <svg viewBox="0 0 1440 58" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" class="curve"><path d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z" fill="#000000"></path></svg>
        <div className="features-container">
          <h1 className="feature-heading">Forge the Future of Conversations</h1>
          <h3 className="feature-subheading">Create custom AI chatbots effortlessly and bring your ideas to life—fast, flexible, and uniquely yours.</h3>
          <Timeline />
          <IntegrationCode />
        </div>
      </div>
    </Provider>
  );
};

export default Page;
