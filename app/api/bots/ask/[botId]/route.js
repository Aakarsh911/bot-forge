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
    // Truncate only dynamic parameters from the API endpoint (e.g., /api/:barcode -> /api/)
    const truncatedEndpoint = api.apiEndpoint.replace(/:\w+/g, '');
    return `API endpoint: ${truncatedEndpoint}, when: ${api.when}`;
  }).join("\n");

  // Construct the system message for OpenAI
  const openAISystemMessage = `
    You are a chatbot whose purpose is: ${prompt}. You can suggest APIs to execute based on the user's request. 
    Provide the full API endpoint (with replaced query parameters) as a string and nothing else (no other text but the endpoint) and I will execute the API. 
    Do not ask for confirmation to execute the API, just provide the endpoint and I will handle it. 
    Below is a list of available APIs:
    ${apiInfo}
    If the user's prompt matches any of the "when" conditions, suggest the appropriate API for execution. 
  `;

  const requestData = {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: openAISystemMessage },
      ...updatedChatHistory,
    ],
  };

  let responseMessage = '';
  let apiToCall = null;

  try {
    // Make the request to OpenAI API
    const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    let openAIResponse = gptResponse.data.choices[0].message.content.trim();

    // Remove quotes from the OpenAI response
    openAIResponse = openAIResponse.replace(/['"]+/g, '');

    // Convert all the bot's API endpoints to lowercase and remove dynamic params for comparison
    const truncatedApiEndpoints = bot.API_URLs.map(api => 
      api.apiEndpoint.replace(/:\w+/g, '').toLowerCase()
    );

    // Truncate the OpenAI-provided endpoint only at dynamic parameters (keep the path intact)
    let truncatedSuggestedEndpoint = openAIResponse.split('?')[0].toLowerCase(); // Remove query parameters
    console.log(`Truncated API endpoints: ${truncatedApiEndpoints}`);
    console.log(`OpenAI suggested endpoint: ${openAIResponse}`);
    console.log(`Truncated suggested endpoint: ${truncatedSuggestedEndpoint}`);

    // Check if OpenAI suggests an API endpoint that matches
    const matchedApi = bot.API_URLs.find((api, index) => 
      truncatedSuggestedEndpoint.includes(truncatedApiEndpoints[index])
    );

    console.log(`Matched API: ${matchedApi ? matchedApi.apiEndpoint : 'None'}`);

    if (matchedApi) {
      apiToCall = openAIResponse; // Use the full OpenAI-provided endpoint

      console.log(`OpenAI suggested API: ${apiToCall}`);

      // Execute the corresponding API using the full endpoint (with query parameters already replaced by OpenAI)
      let apiResponse;
      try {
        apiResponse = await axios.get(apiToCall, {
          headers: matchedApi.parameters.reduce((acc, param) => {
            acc[param.key] = param.value;
            return acc;
          }, {}),
        });

        // Send the API result to OpenAI for refinement
        const refinedRequestData = {
          model: 'gpt-4',
          messages: [
            ...updatedChatHistory,
            { role: 'assistant', content: `API call result: ${JSON.stringify(apiResponse.data)}` },  // Include API response
          ],
        };

        const refinedResponse = await axios.post('https://api.openai.com/v1/chat/completions', refinedRequestData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });

        responseMessage = refinedResponse.data.choices[0].message.content;

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
