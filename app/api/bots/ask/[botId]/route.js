import { NextResponse } from 'next/server';
import axios from 'axios';
import Bot from '../../../../../models/bot';
import { connectToDB } from '../../../../../utils/database';

export const POST = async (req, { params }) => {
  const { botId } = params;
  const { question, chatHistory = [] } = await req.json();

  // Connect to the database
  await connectToDB();

  // Fetch the bot configuration from the database
  const bot = await Bot.findById(botId);

  if (!bot) {
    return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
  }

  const prompt = bot.prompt;

  // Add the user's question to the chat history
  const updatedChatHistory = [...chatHistory, { role: 'user', content: question }];

  // Prepare the API_URLs information to send to OpenAI
  const apiInfo = bot.API_URLs.map(api => {
    return `API ID: ${api.id}, when: ${api.when}, endpoint: ${api.apiEndpoint}, parameters: ${api.parameters.map(p => `${p.key}: ${p.value}`).join(', ')}`;
  }).join("\n");

  // Construct the system message for OpenAI
  const openAISystemMessage = `
    You are a chatbot whose purpose is : ${prompt}. You can also suggest APIs to execute based on the user's request. If you do so, just provide the api id as a string and NOTHING ELSE AND I REPEAT NOTHING ELSE and I will execute the api on my own. Also, do not ask for confirmation to execute the api. Just output the api id.
    Below is a list of available APIs:
    ${apiInfo}
    If the user's prompt matches any of the "when" conditions of the APIs, suggest the appropriate API for execution. 
    Extract relevant parameter values like match IDs and ask for any missing ones.
  `;

  const requestData = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: openAISystemMessage },
      ...updatedChatHistory,
    ],
  };

  let responseMessage = '';
  let apiToCall = null;

  try {
    const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const openAIResponse = gptResponse.data.choices[0].message.content;

    // Check if OpenAI suggests an API to call
    const apiMatch = bot.API_URLs.find(api => openAIResponse.toLowerCase().includes(api.id.toLowerCase()));

    if (apiMatch) {
      apiToCall = apiMatch;
      console.log(`OpenAI suggested API: ${apiMatch.apiEndpoint}`);

      // Check for dynamic placeholders in the API endpoint (e.g., /api/:barcode)
      const dynamicParams = apiMatch.apiEndpoint.match(/:\w+/g);
      let finalApiEndpoint = apiMatch.apiEndpoint;

      if (dynamicParams) {
        console.log(`Dynamic parameters detected: ${dynamicParams}`);

        // Replace dynamic placeholders with values from the user's question or provided values
        dynamicParams.forEach(param => {
          const paramName = param.slice(1);  // Remove the colon from :barcode -> barcode
          finalApiEndpoint = finalApiEndpoint.replace(param, question);  // Replace with the user's input (question)
        });

        console.log(`Final API endpoint after replacement: ${finalApiEndpoint}`);
      }

      // Execute the corresponding API
      let apiResponse;
      try {
        apiResponse = await axios.get(finalApiEndpoint, {
          headers: apiMatch.parameters.reduce((acc, param) => {
            acc[param.key] = param.value;
            return acc;
          }, {}),
        });

        console.log("API response received:", apiResponse.data);  // Log API response

        // Send the API result to OpenAI for refinement
        const refinedRequestData = {
          model: 'gpt-4o',
          messages: [
            ...updatedChatHistory,
            { role: 'assistant', content: `API call result: ${JSON.stringify(apiResponse.data)}` }  // Include API response
          ],
        };

        const refinedResponse = await axios.post('https://api.openai.com/v1/chat/completions', refinedRequestData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });

        responseMessage = refinedResponse.data.choices[0].message.content;
        console.log("Refined response from OpenAI:", responseMessage);  // Log refined response

      } catch (apiError) {
        console.error('Error calling API:', apiError.response ? apiError.response.data : apiError.message);
        responseMessage = 'Error fetching data from the API.';
      }
    } else {
      responseMessage = openAIResponse;
    }

  } catch (error) {
    console.error('Error with GPT response:', error.response ? error.response.data : error.message);
    responseMessage = 'Error generating response from the assistant.';
  }

  // Add the assistant's response to the chat history
  updatedChatHistory.push({ role: 'assistant', content: responseMessage });

  return NextResponse.json({ answer: responseMessage, chatHistory: updatedChatHistory });
};
