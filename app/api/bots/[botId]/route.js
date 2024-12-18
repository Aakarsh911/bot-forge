import { connectToDB } from '../../../../utils/database';
import Bot from '../../../../models/bot';
import { NextResponse } from 'next/server';

export const GET = async (req, { params }) => {
  // Add CORS headers using NextResponse
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow requests from the front-end
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers }); // Respond to preflight request
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
      return NextResponse.json(
        { message: "Bot not found" },
        { status: 404, headers }
      );
    }

    // Respond with the bot data
    return NextResponse.json({ bot }, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching bot:", error);

    // Respond with an error message
    return NextResponse.json(
      { message: "Server error" },
      { status: 500, headers }
    );
  }
};
