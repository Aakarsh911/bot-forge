import { connectToDB } from '@/utils/database';
import Bot from '@/models/bot';

export const POST = async (req) => {
  const { botId, botAppearance } = await req.json();

  try {
    await connectToDB();
    
    const updatedBot = await Bot.findByIdAndUpdate(botId, { ...botAppearance }, { new: true });

    if (!updatedBot) {
      return new Response(JSON.stringify({ message: 'Bot not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ bot: updatedBot }), { status: 200 });
  } catch (error) {
    console.error('Error updating bot:', error);
    return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
  }
};
