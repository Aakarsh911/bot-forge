import {getToken} from 'next-auth/jwt';
import User from '../../../../models/user';
import Bot from '../../../../models/bot';
import {connectToDB} from '../../../../utils/database';
import {NextResponse} from 'next/server';
import axios from 'axios';
const {OpenAIAPI} = require('openai');

export const POST = async (req) => {
    try {
        // Ensure the user is authenticated
        const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
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

        const chatgptInput = `This is a chatbot prompt: ${visiblePrompt} You have to refine this prompt and only return the prompt and nothing else. You have to add 
        things such as if the user ask anything unrelated tell them the main purpose of the chatbot.`;

        const requestData = {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: chatgptInput },
                { role: 'user', content: chatgptInput },
            ],
        };
        let prompt = '';
        async function generatePrompt() {
            try {
                const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                });

                prompt = response.data.choices[0].message.content;
                console.log(prompt);

            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);

            }
        }
        await generatePrompt();

        const newBot = new Bot({
            name,
            widgetColor,
            widgetLogo,
            visiblePrompt,
            prompt,
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
            {email: token.email},
            {$push: {bots: newBot._id}},
            {new: true}
        );
        return NextResponse.json({message: 'Bot created successfully', bot: newBot}, {status: 201});
    } catch (error) {
        console.error('Error creating bot:', error);
        return NextResponse.json({message: 'Server error'}, {status: 500});
    }
}
