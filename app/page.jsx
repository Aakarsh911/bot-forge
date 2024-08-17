"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import Provider from '../components/Provider';

const Page = () => {
  const { data: session } = useSession();

  return (
    <Provider>
      <div className='main'>
        <h1>Welcome to BotForge</h1>
        
        {!session && (
          <>
            <p>You are not logged in.</p>
            <button onClick={() => signIn()}>Login</button>
          </>
        )}

        {session && (
          <>
            <p>Welcome, {session.user.name}!</p>
            <button onClick={() => signOut()}>Logout</button>
          </>
        )}
      </div>
    </Provider>
  );
};

export default Page;
