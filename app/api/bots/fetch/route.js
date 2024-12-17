import { getToken } from "next-auth/jwt";
import { connectToDB } from '../../../../utils/database';
import User from '../../../../models/user';
import Bot from '../../../../models/bot';

export const dynamic = 'force-dynamic'; // Ensure route is dynamic
export const runtime = 'nodejs'; // Explicit runtime declaration

export async function GET(req) {

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    // Connect to the database
    await connectToDB();

    // Find the user by their email and populate the bots array
    const user = await User.findOne({ email: token.email }).populate('bots');

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    // Return the bots
    return new Response(JSON.stringify({ bots: user.bots }), { status: 200 });
  } catch (error) {
    console.error('Error fetching bots:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
