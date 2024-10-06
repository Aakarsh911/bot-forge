import { NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { connectToDB } from '../../../../../utils/database';
import Bot from '../../../../../models/bot';

// Enable parsing of multipart/form-data requests
export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for handling file uploads
  },
};

// Utility to save uploaded files
const saveFile = async (file) => {
  const data = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(process.cwd(), 'uploads', `${Date.now()}-${file.name}`);
  await fsPromises.writeFile(filePath, data);
  return filePath;
};

// Utility to encode image to base64
const encodeImage = (imagePath) => {
  const image = fs.readFileSync(imagePath);
  return image.toString('base64');
};

// Utility to delete a file
const deleteFile = async (filePath) => {
  try {
    await fsPromises.unlink(filePath); // Remove the file from the filesystem
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

export const POST = async (req, { params }) => {
  const { botId } = params;

  try {
    // Parse form data
    const formData = await req.formData();
    const question = formData.get('question'); // Get the question text
    const chatHistory = JSON.parse(formData.get('chatHistory') || '[]'); // Get the chat history
    const files = formData.getAll('files'); // Get all uploaded files

    // Handle file upload and base64 encoding
    let base64Image = null;
    let filePath = null;

    if (files && files.length > 0) {
      filePath = await saveFile(files[0]);
      base64Image = encodeImage(filePath); // Encode the first file as Base64
    }

    // Connect to the database
    await connectToDB();
    const bot = await Bot.findById(botId);
    if (!bot) {
      return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    }

    const prompt = bot.prompt;

    // Add the user's question to the chat history
    const updatedChatHistory = [...chatHistory, { role: 'user', content: question }];

    // Prepare the API_URLs information to send to OpenAI
    const apiInfo = bot.API_URLs.map(api => {
      const truncatedEndpoint = api.apiEndpoint.replace(/:\w+/g, ''); // Truncate dynamic params
      return `API endpoint: ${truncatedEndpoint}, when: ${api.when}`;
    }).join("\n");

    // Construct the system message for OpenAI
    const openAISystemMessage = `
      You are a chatbot whose purpose is: ${prompt}. You can also suggest APIs (this only happens if an api is given to you and the when condition in the api matches) to execute based on the user's request. 
      Provide the full API endpoint (with replaced query parameters) as a string and nothing else (no other text but the endpoint) and I will execute the API. 
      Do not ask for confirmation to execute the API, just provide the endpoint and I will handle it. 
      Below is a list of available APIs:
      ${apiInfo}
      If the user's prompt matches any of the "when" conditions, suggest the appropriate API for execution.
      If not, then respond according to your purpose and do not recommend an API. 
      If there is an image uploaded in base64, read the image and consider it the prompt. Analyze the image if possible, and provide the best response based on the image content.
    `;

    // Prepare the OpenAI request payload (including text and image)
    const payload = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: openAISystemMessage },
        ...updatedChatHistory, // Include the user's chat history
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question || 'No question provided by the user.', // Use user-provided text
            },
            ...(base64Image
                ? [
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`, // Base64 encoded image
                    },
                  },
                ]
                : []), // Only add the image if it exists
          ],
        },
      ],
      max_tokens: 300,
    };

    // Send the request to OpenAI
    const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const responseMessage = gptResponse.data.choices[0].message.content;

    // Add assistant's response to the chat history
    const updatedChatHistoryWithResponse = [...updatedChatHistory, { role: 'assistant', content: responseMessage }];

    // Delete the uploaded image file
    if (filePath) {
      await deleteFile(filePath); // Delete the file after processing
    }

    // Send the final response back to the client
    return NextResponse.json({ answer: responseMessage, chatHistory: updatedChatHistoryWithResponse });
  } catch (error) {
    console.error('Error handling the request:', error.message);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
};