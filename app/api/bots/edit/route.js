import { connectToDB } from '@/utils/database';
import Bot from '@/models/bot';

export const POST = async (req) => {
  const { botId, botName, purpose, botAppearance, apiMappingsNew } = await req.json();

  try {
    await connectToDB();

    // Find the bot by ID and update with specific fields from botAppearance and other data
    const updatedBot = await Bot.findByIdAndUpdate(
      botId,
      {
        $set: {
          name: botName, // Update bot name
          visiblePrompt: purpose, // Update visible prompt
          API_URLs: apiMappingsNew, // Update API URLs
          widgetColor: botAppearance.widgetColor, // Update widget color from botAppearance
          botBubbleColor: botAppearance.botBubbleColor, // Update bot bubble color
          botTextColor: botAppearance.botTextColor, // Update bot text color
          userBubbleColor: botAppearance.userBubbleColor, // Update user bubble color
          userTextColor: botAppearance.userTextColor, // Update user text color
          chatBackgroundColor: botAppearance.chatBackgroundColor, // Update chat background color
          botTypingColor: botAppearance.botTypingColor, // Update bot typing color
          botHeaderBackgroundColor: botAppearance.botHeaderBackgroundColor, // Update bot header background color
          botHeaderTextColor: botAppearance.botHeaderTextColor, // Update bot header text color
          botTypingTextColor: botAppearance.botTypingTextColor, // Update bot typing text color
          widgetLogo: botAppearance.widgetLogo, // Update widget logo
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
