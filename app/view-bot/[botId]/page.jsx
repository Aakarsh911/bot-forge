'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { SendOutlined } from '@ant-design/icons';
import { marked } from 'marked';
import './botConfig.css';
import { UilMessage } from '@iconscout/react-unicons'

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

  useEffect(() => {
    // Check if the page is inside an iframe
    if (window.top === window.self) {
      // Redirect or block access if not in an iframe
      window.location.href = "/"; // Redirect to home page or another page
    }
  }, []);

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
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/bots/ask/${botId}`, {
        question: input,
        prompt: botConfig?.prompt,
        chatHistory: messages // Send the chat history with the request
      });

      const { answer } = response.data;

      // Convert the bot's response to HTML using marked
      const formattedAnswer = marked(answer);
      
      // Log the formatted HTML content
      console.log('Formatted HTML:', formattedAnswer);

      // Update the chat with the formatted bot response (only once)
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: formattedAnswer, isHTML: true }
      ]);
      setTimeout(() => {
        const chatWindow = document.querySelector('.messages');
        if (chatWindow) {
          const links = chatWindow.querySelectorAll('a');
          links.forEach(link => {
            link.setAttribute('target', '_blank'); // Open in a new tab
            link.setAttribute('rel', 'noopener noreferrer'); // Security features to prevent access to the original window
          });
        }
      }, 100); 
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
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
          <header><h1> <FontAwesomeIcon icon={faRobot} className="header-bot-icon"/>{botConfig.name}</h1></header>
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {/* Render HTML if it's a bot's message with Markdown formatting */}
                {message.isHTML ? (
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                ) : (
                  <span>{message.content}</span> // Render normal text for user messages
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
            <button className="send-button" onClick={sendMessage}>
              <UilMessage size="20" className="send-icon"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
