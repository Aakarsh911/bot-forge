import { getToken } from 'next-auth/jwt';
import User from '../../../../models/user';
import Bot from '../../../../models/bot';
import { connectToDB } from '../../../../utils/database';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
    try {
        // Ensure the user is authenticated
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Connect to the database
        await connectToDB();

        // Extract bot data from request body (convert to JSON)
        const body = await req.json();
        const {
            name,
            widgetColor,
            widgetLogo,
            visiblePrompt,
            botResponseColor,
            botTextColor,
            userResponseColor,
            userTextColor,
            botTypingColor,
            chatBackgroundColor,
            botTypingTextColor,
            API_URLs,
            botPosition,
            modelType,
            closeButtonColor,
        } = body;

        // Create a new bot
        const newBot = new Bot({
            name,
            widgetColor,
            widgetLogo,
            visiblePrompt,
            botResponseColor,
            botTextColor,
            userResponseColor,
            userTextColor,
            botTypingColor,
            chatBackgroundColor,
            botTypingTextColor,
            API_URLs,
            botPosition,
            modelType,
            closeButtonColor,
        });

        // Save the bot
        await newBot.save();

        // Append the bot to the user's bots array
        await User.findOneAndUpdate(
            { email: token.email },
            { $push: { bots: newBot._id } },
            { new: true }
        );

        // Respond with success message
        return NextResponse.json({ message: 'Bot created successfully', bot: newBot }, { status: 201 });
    } catch (error) {
        console.error('Error creating bot:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
