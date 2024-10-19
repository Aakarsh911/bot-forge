'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { Upload, Button } from 'antd'; // Import Ant Design Upload and Button components
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons'; // Import icons
import { marked } from 'marked';
import './botConfig.css';

export default function BotConfigPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.botId;
  const [isImageModel, setIsImageModel] = useState(false);
  const [botConfig, setBotConfig] = useState(null); // Bot configuration from the database
  const [input, setInput] = useState(''); // User input for the chat
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! How can I help you today?' }]); // Chat messages
  const [isLoading, setIsLoading] = useState(false); // Loading state for bot typing animation
  const [fileList, setFileList] = useState([]); // Store uploaded files
  const [previewFiles, setPreviewFiles] = useState([]); // Store base64 preview of the files
  const [credits, setCredits] = useState(0); // User credits for the bot
  const [userId, setUserId] = useState(null); // User information

  useEffect(() => {
    if (window.self === window.top) {
      // If the page is not in an iframe, redirect to the homepage
      router.push('/');
    }
  }, [router]);

  // Fetch bot configuration on page load
  useEffect(() => {
    if (botId) {
      fetchBotConfig();

    }
  }, [botId]);

  // Track when userId changes and log or perform actions
  useEffect(() => {
    if (userId) {
      console.log("User ID has been updated:", userId);
      fetchCredits();
      // Perform actions based on the updated userId (e.g., fetch credits)
    }
  }, [userId]);

  const fetchBotConfig = async () => {
    try {
      const response = await axios.get(`/api/bots/${botId}`);
      setBotConfig(response.data.bot);
      setUserId(response.data.bot.userId); // Update userId here

    } catch (error) {
      console.error('Error fetching bot config:', error);
    } finally {

    }
  };

  const fetchCredits = async () => {
    console.log("Fetching user credits...");
    try {
      const response = await axios.get(`/api/users/${userId}`);
      console.log(response.data.credits);
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList); // Update the file list when files are uploaded

    // Convert the file to a base64 string for preview
    const previewPromises = fileList.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ base64: reader.result, type: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file.originFileObj);
      });
    });

    // Set preview file list
    Promise.all(previewPromises).then(previews => {
      setPreviewFiles(previews);
    });
  };

  const reduceCredits = async () => {
    try {
      const response = await axios.post(`/api/users/${userId}/reduce-credits/${botConfig.modelType}`);
      console.log('Credits reduced:', response.data);
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error reducing credits:', error);
    }
  }
  // Handle sending the message to the bot
  const sendMessage = async () => {
    if (!input.trim() && fileList.length === 0) return;

    const newMessage = { role: 'user', content: input };
    const previewMessage = previewFiles.map((file) => (
        file.type.startsWith('image/') ?
            { role: 'user', content: `<img src="${file.base64}" alt="Uploaded" style="max-width: 100%;">` } :
            { role: 'user', content: 'Document uploaded.' }
    ));

    setMessages([...messages, newMessage, ...previewMessage]);
    setInput('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('question', input);
    fileList.forEach((file) => {
      formData.append('files', file.originFileObj); // Append all files
    });

    try {
      const response = await axios.post(`/api/bots/ask/${botId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important to set for file uploads
        },
      });

      const { answer } = response.data;
      const formattedAnswer = marked(answer);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: formattedAnswer, isHTML: true },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setFileList([]); // Clear the file list after sending
      setPreviewFiles([]); // Clear preview files
    }
  };

  // Dynamic chat window styles based on botConfig
  const chatStyles = {
    '--headerBackgroundColor': botConfig?.botHeaderBackgroundColor || '#0157f9',
    '--headerTextColor': botConfig?.botHeaderTextColor || '#ffffff',
    '--chatBackgroundColor': botConfig?.chatBackgroundColor || '#f0f0f0',
    '--widgetColor': botConfig?.widgetColor || '#1c1c1c',
    '--botResponseColor': botConfig?.botBubbleColor || '#005b96',
    '--botTextColor': botConfig?.botTextColor || '#ffffff',
    '--userResponseColor': botConfig?.userBubbleColor || '#4CAF50',
    '--userTextColor': botConfig?.userTextColor || '#ffffff',
    '--botTypingColor': botConfig?.botTypingColor || '#eeeeee',
    '--botTypingTextColor': botConfig?.botTypingTextColor || '#000000',
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
      <div className="chat-container" style={chatStyles}>
        {botConfig && (
            <div className="chat-window">
              <p>{credits}</p>
              <header>
                <h1>
                  <FontAwesomeIcon icon={faRobot} className="header-bot-icon" />
                  {botConfig.name}
                </h1>
              </header>
              <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                      {/* Render HTML if it's a bot's message with Markdown formatting */}
                      {message.isHTML ? (
                          <div dangerouslySetInnerHTML={{ __html: message.content }} />
                      ) : (
                          <span dangerouslySetInnerHTML={{ __html: message.content }} /> // Render normal text and uploaded content for user messages
                      )}
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant typing">
                      <span className="typing-text">Bot is typing</span>
                      <div className="dot-container">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                )}
              </div>

              <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                />
                {isImageModel && (
                    <Upload
                        fileList={fileList}
                        onChange={handleFileChange}
                        multiple
                        beforeUpload={() => false} // Prevent auto-upload
                        showUploadList={false} // Do not show default upload list
                    >
                      <Button icon={<PaperClipOutlined />} />
                    </Upload>
                )}
                <button className="send-button" onClick={sendMessage}>
                  <SendOutlined className="send-icon" />
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
