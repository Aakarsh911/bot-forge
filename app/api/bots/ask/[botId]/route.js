import { NextResponse } from 'next/server';
import axios from 'axios';

export const POST = async (req, { params }) => {
  const { botId } = params;
  const { question, prompt, chatHistory = [] } = await req.json(); // Accept chatHistory from the client

  // Add the user's question to the chat history
  const updatedChatHistory = [...chatHistory, { role: 'user', content: question }];

  const requestData = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt || 'You are a knowledgeable assistant.' }, // Use the prompt or default text
      ...updatedChatHistory,
    ],
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const answer = response.data.choices[0].message.content;

    // Add the assistant's response to the chat history
    updatedChatHistory.push({ role: 'assistant', content: answer });
    console.log(updatedChatHistory);
    // Return the updated chat history to the client
    return NextResponse.json({ answer, chatHistory: updatedChatHistory });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};
