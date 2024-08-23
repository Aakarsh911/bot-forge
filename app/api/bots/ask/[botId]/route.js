import { NextResponse } from 'next/server';
import axios from 'axios';

export const POST = async (req, { params }) => {
  const { botId } = params;
  const { question, prompt } = await req.json(); // Get question and prompt from request body

  let chatHistory = [];

  chatHistory.push({ role: 'user', content: question });

  const requestData = {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: prompt || 'You are a knowledgeable assistant.' }, // Use the prompt or default text
      ...chatHistory,
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
    chatHistory.push({ role: 'assistant', content: answer });

    return NextResponse.json({ answer, chatHistory });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};
