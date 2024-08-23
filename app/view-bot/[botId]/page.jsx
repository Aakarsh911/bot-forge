'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import './botConfig.css';

export default function BotConfigPage() {
  const router = useRouter();
  const params = useParams(); 
  const botId = params.botId;

  const [botConfig, setBotConfig] = useState(null); // Bot configuration from the database
  const [input, setInput] = useState(''); // User input for the chat
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! How can I help you today?' }]); // Chat messages
  const [isLoading, setIsLoading] = useState(false); // Loading state for bot typing animation
  
  // Fetch bot configuration on page load
  useEffect(() => {
    if (botId) {
      fetchBotConfig();
    }
  }, [botId]);

  const fetchBotConfig = async () => {
    try {
      const response = await axios.get(`/api/bots/${botId}`);
      setBotConfig(response.data.bot);
    } catch (error) {
      console.error('Error fetching bot config:', error);
    }
  };

  // Handle sending the message to the bot
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true); // Start typing animation

    try {
      const response = await axios.post(`/api/bots/ask/${botId}`, {
        question: input,
        prompt: botConfig?.prompt // Passing prompt from botConfig to the backend
      });

      const botResponse = response.data.answer;

      // Process bot's response
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false); // Stop typing animation
    }
  };

  // Dynamic chat window styles based on botConfig
  const chatStyles = {
    '--chatBackgroundColor': botConfig?.chatBackgroundColor || '#f0f0f0',
    '--widgetColor': botConfig?.widgetColor || '#1c1c1c',
    '--botResponseColor': botConfig?.botResponseColor || '#005b96',
    '--botTextColor': botConfig?.botTextColor || '#ffffff',
    '--userResponseColor': botConfig?.userResponseColor || '#4CAF50',
    '--userTextColor': botConfig?.userTextColor || '#ffffff',
    '--botTypingColor': botConfig?.botTypingColor || '#eeeeee', // Add botTypingColor
    '--botTypingTextColor': botConfig?.botTypingTextColor || '#000000' // Add botTypingTextColor
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
          <h1>{botConfig.name}</h1>
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.content}
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
            <button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
