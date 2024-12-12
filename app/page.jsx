'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Provider from '../components/Provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import '/css/main.css';
import Image from 'next/image';
import configImg from '/images/config-img.png';
import configImg2 from '/images/config-img2.png';

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Clear cookies on logout
  const handleLogout = () => {
    // Clear cookies and local storage to ensure complete session reset
    signOut({ redirect: false });
    document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear();
  };

  return (
    <Provider>
      <nav className='navbar'>
        <h1 className=''>Bot Forge</h1>
        <div className='nav-links'>
          <button>Dashboard</button>
          <button>Pricing</button>
          <button>Support</button>
          {session && (
            <>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>
      <div className='main-content '>
        <div className='left-side'>
          <h1 className='header-logo'>Bot Forge</h1>
        </div>
        <div className='right-side'>
          <Image src={configImg} className='config-img' />
          <Image src={configImg2} className='config-img2' />
        </div>
        {/* {!session && (
          <>
            <button onClick={() => signIn('google', { prompt: 'select_account' })}>
              Login with Google
            </button>
          </>
        )}

        {session && (
          <>
            <p>Welcome, {session.user.name}!</p>
            <button onClick={handleLogout}>Logout</button>
          </>
        )} */}
      </div>
      <div className="features">
        
      </div>
    </Provider>
  );
};

export default Page;
