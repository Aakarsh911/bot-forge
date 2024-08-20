import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import User from '../../../../models/user';
import { connectToDB } from '../../../../utils/database';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      }
    })
  ],
  callbacks: {
    // Called whenever a session is checked/created
    async session({ session, token, user }) {
      // Store the user id from MongoDB into the session object
      await connectToDB(); // Make sure the database is connected

      const sessionUser = await User.findOne({ email: session.user.email });
      if (sessionUser) {
        session.user.id = sessionUser._id.toString();
      }

      return session;
    },

    // Called when the user signs in
    async signIn({ profile }) {
      try {
        await connectToDB(); // Connect to the database

        // Check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // If the user does not exist, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(/\s/g, "").toLowerCase(),
            image: profile.picture,
          });
        }

        return true; // Sign in was successful
      } catch (error) {
        console.log("Error during sign-in:", error.message);
        return false; // Sign in failed
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure you have this in your environment variables
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export { handler as GET, handler as POST };
