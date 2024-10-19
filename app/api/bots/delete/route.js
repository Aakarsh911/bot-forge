import { getToken } from 'next-auth/jwt';
import User from '@/models/user';
import Bot from '@/models/bot';
import { connectToDB } from '../../../../utils/database';
import { NextResponse } from 'next/server';

export const DELETE = async (req) => {
    try {
        // Ensure the user is authenticated
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Connect to the database
        await connectToDB();

        // Extract bot ID from the request body
        const { botId } = await req.json();

        // Remove the bot from the user's bot list
        await User.findOneAndUpdate(
            { email: token.email },
            { $pull: { bots: botId } },
            { new: true }
        );

        // Delete the bot from the bots collection
        await Bot.findByIdAndDelete(botId);

        // Respond with success message
        return NextResponse.json({ message: 'Bot deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting bot:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
};
