'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Using useSearchParams to get query params in app router
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTooth, faCamera } from "@fortawesome/free-solid-svg-icons";
import './botConfig.css';

export default function BotConfigPage() {
  const router = useRouter();
  const params = useParams(); // Retrieve query params
  console.log('Params:', params);
  const botId = params.botId;

  const [botConfig, setBotConfig] = useState(null); // Bot configuration from the database
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    console.log('Bot ID:', botId);
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

  const sendMessage = async () => {
    setInput("");
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/ask', { question: input });
      let botResponse = response.data.answer;

      const formattedResponse = botResponse.replace(
        "https://brushfloss.com",
        '<a href="https://brushfloss.com" target="_blank" rel="noopener noreferrer">https://brushfloss.com</a>'
      );

      setMessages([...messages, newMessage, { role: 'assistant', content: <span dangerouslySetInnerHTML={{ __html: formattedResponse }} /> }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chatStyles = {
    backgroundColor: botConfig?.widgetColor || '#1c1c1c',
    color: botConfig?.botResponseColor || '#ffffff',
  };

  return (
    <div>
      {botConfig && (
        <div style={{ padding: '1rem' }}>
          <h1>{botConfig.name} <FontAwesomeIcon icon={faTooth} /></h1>
          <div className="chatbox" style={chatStyles}>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                  <p>{msg.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message loading">
                  <p>{botConfig.visiblePrompt || 'Typing...'}</p>
                  <div className="dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} style={{ backgroundColor: botConfig.userResponseColor || '#007aff' }}>
                Send
              </button>
              <FontAwesomeIcon icon={faCamera} className="camera-icon" onClick={() => setIsPopupOpen(true)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
