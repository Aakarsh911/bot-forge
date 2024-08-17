'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Provider from '../components/Provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <Provider>
      <div className='main'>
        <h1>Welcome to BotForge</h1>
        
        {!session && (
          <>
            <p>You are not logged in.</p>
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
        )}
      </div>
    </Provider>
  );
};

export default Page;
