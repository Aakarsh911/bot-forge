import { connectToDB } from '../../../../utils/database';
import Bot from '../../../../models/bot';
import { NextResponse } from 'next/server';


export const GET = async (req, { params }) => {
    // Add CORS headers to allow requests from http://localhost:3001
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).end(); // Respond OK to preflight request
    return;
  }
    try {
        // Connect to the database
        await connectToDB();

        // Extract botId from the request parameters
        const { botId } = params;

        // Find the bot by ID
        const bot = await Bot.findById(botId);

        // Check if the bot exists
        if (!bot) {
            return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
        }

        // Respond with the bot data
        return NextResponse.json({ bot }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bot:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
};
