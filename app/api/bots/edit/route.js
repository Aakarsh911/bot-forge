import { connectToDB } from '@/utils/database';
import Bot from '@/models/bot';

export const POST = async (req) => {
  const { botId, botName, purpose, botAppearance, apiMappingsNew } = await req.json();

  try {
    await connectToDB();

    // Ensure that apiMappingsNew is an array and not a string
    const apiURLs = Array.isArray(apiMappingsNew) ? apiMappingsNew : JSON.parse(apiMappingsNew);

    // Find the bot by ID and update with specific fields from botAppearance and other data
    const updatedBot = await Bot.findByIdAndUpdate(
      botId,
      {
        $set: {
          name: botName,
          visiblePrompt: purpose,
          API_URLs: apiURLs, // Update API_URLs with the parsed array
          widgetColor: botAppearance.widgetColor,
          botBubbleColor: botAppearance.botBubbleColor,
          botTextColor: botAppearance.botTextColor,
          userBubbleColor: botAppearance.userBubbleColor,
          userTextColor: botAppearance.userTextColor,
          chatBackgroundColor: botAppearance.chatBackgroundColor,
          botTypingColor: botAppearance.botTypingColor,
          botHeaderBackgroundColor: botAppearance.botHeaderBackgroundColor,
          botHeaderTextColor: botAppearance.botHeaderTextColor,
          botTypingTextColor: botAppearance.botTypingTextColor,
          widgetLogo: botAppearance.widgetLogo
        }
      },
      { new: true } // Return the updated document
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
