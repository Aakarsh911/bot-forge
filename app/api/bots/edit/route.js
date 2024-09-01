import { connectToDB } from '@/utils/database';
import Bot from '@/models/bot';

export const POST = async (req) => {
  // Extract the entire bot configuration from the request body
  const { botId, botName, purpose, botAppearance, apiMappings } = await req.json();

  try {
    await connectToDB();

    // Find the bot by ID and update with new data
    const updatedBot = await Bot.findByIdAndUpdate(
        botId,
        {
          name: botName,
          visiblePrompt: purpose,
          botAppearance,
          API_URLs: apiMappings, // Ensure this matches the schema definition
        },
        { new: true }
    );

    if (!updatedBot) {
      return new Response(JSON.stringify({ message: 'Bot not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ bot: updatedBot }), { status: 200 });
  } catch (error) {
    console.error('Error updating bot:', error);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
};
