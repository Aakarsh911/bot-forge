'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { Upload, Button } from 'antd';
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons';
import { marked } from 'marked';
import './botConfig.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BotConfigPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.botId;
  const [isImageModel, setIsImageModel] = useState(false);
  const [botConfig, setBotConfig] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [credits, setCredits] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // New state to manage initial loading

  useEffect(() => {
    if (window.self === window.top) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (botId) {
      fetchBotConfig();
    }
  }, [botId]);

  useEffect(() => {
    if (userId) {
      fetchCredits();
    }
  }, [userId]);

  const fetchBotConfig = async () => {
    try {
      const response = await axios.get(`/api/bots/${botId}`);
      setBotConfig(response.data.bot);
      setUserId(response.data.bot.userId);
      setIsImageModel(response.data.bot.modelType === 'image');
    } catch (error) {
      console.error('Error fetching bot config:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    } finally {
      setIsInitializing(false);
      // Mark initialization complete after fetching data
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && fileList.length === 0) return;

    const newMessage = { role: 'user', content: input };
    const previewMessage = previewFiles.map((file) =>
        file.type.startsWith('image/')
            ? { role: 'user', content: `<img src="${file.base64}" alt="Uploaded" style="max-width: 100%;">` }
            : { role: 'user', content: 'Document uploaded.' }
    );

    setMessages([...messages, newMessage, ...previewMessage]);
    setInput('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('question', input);
    formData.append('chatHistory', JSON.stringify(messages));
    fileList.forEach((file) => {
      formData.append('files', file.originFileObj);
    });

    try {
      const response = await axios.post(`/api/bots/ask/${botId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
      setFileList([]);
      setPreviewFiles([]);
      await reduceCredits();
    }
  };

  const reduceCredits = async () => {
    try {
      const response = await axios.post(`/api/users/${userId}/reduce-credits/${botConfig.modelType}`);
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error reducing credits:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
      <>
        {isInitializing ? ( // Show a loading screen while initializing
            <div className="loading-screen">
              <h1>Loading bot...</h1>
            </div>
        ) : credits === 0 ? ( // Show zero credits screen if applicable
            <div className="no-credits">
              <h1 className="zero-credits">Bot has 0 credits.</h1>
              <p>Reach out to the creator of the bot.</p>
            </div>
        ) : (
            <div className="chat-container">
              {botConfig && (
                  <div className="chat-window">
                    <header>
                      <h1>
                        <FontAwesomeIcon icon={faRobot} className="header-bot-icon" />
                        {botConfig.name}
                      </h1>
                    </header>
                    <div className="messages">
                      {messages.map((message, index) => (
                          <div key={index} className={`message ${message.role}`}>
                            {message.isHTML ? (
                                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                            ) : (
                                <span>{message.content}</span>
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
                              onChange={({ fileList }) => setFileList(fileList)}
                              multiple
                              beforeUpload={() => false}
                              showUploadList={false}
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
        )}
      </>
  );
}
