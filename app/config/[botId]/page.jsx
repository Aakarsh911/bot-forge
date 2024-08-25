'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './config.css';
import { Tabs, ColorPicker } from 'antd';
import { Flex, Input } from 'antd';
import { PreviewButton } from '@/components/PreviewButton';
import { SaveButton } from '@/components/SaveButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faRobot } from '@fortawesome/free-solid-svg-icons';
import { SendOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

export default function ConfigBot() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const botId = params.botId;
  const [botName, setBotName] = useState('');
  const [purpose, setPurpose] = useState('');

  const [botAppearance, setBotAppearance] = useState({
    widgetColor: '#0157f9',
    botBubbleColor: '#ffffff',
    botTextColor: '#000000',
    userBubbleColor: '#ffffff',
    userTextColor: '#000000',
    chatBackgroundColor: '#f0f0f0',
    botTypingColor: '#0157f9',
    botHeaderBackgroundColor: '#0157f9',
    botHeaderTextColor: '#ffffff',
    botTypingTextColor: '#ffffff',
  });

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const response = await fetch(`/api/bots/${botId}`);
        if (response.ok) {
          const data = await response.json();
          setBotName(data.bot.name);
          setPurpose(data.bot.visiblePrompt);
          setBotAppearance({
            widgetColor: data.bot.widgetColor || '#0157f9',
            botBubbleColor: data.bot.botBubbleColor || '#ffffff',
            botTextColor: data.bot.botTextColor || '#000000',
            userBubbleColor: data.bot.userBubbleColor || '#ffffff',
            userTextColor: data.bot.userTextColor || '#000000',
            chatBackgroundColor: data.bot.chatBackgroundColor || '#f0f0f0',
            botTypingColor: data.bot.botTypingColor || '#0157f9',
            botTypingTextColor: data.bot.botTypingTextColor || '#ffffff',
            botHeaderBackgroundColor: data.bot.botHeaderBackgroundColor || '#0157f9',
            botHeaderTextColor: data.bot.botHeaderTextColor || '#ffffff',
          });
        } else {
          console.error('Failed to fetch bot data');
        }
      } catch (error) {
        console.error('An error occurred while fetching the bot data:', error);
      }
    };

    fetchBotData();
  }, [botId]);

  const handleColorChange = (color, field) => {
    let colorValue;

    if (Array.isArray(color.colors)) {
        // Start building the gradient string
        colorValue = 'linear-gradient(90deg, ';

        // Loop through each color in the array and construct the gradient stops
        color.colors.forEach((colorStop, index) => {
            let percent = colorStop.percent;
            let r = colorStop.color.metaColor.r;
            let g = colorStop.color.metaColor.g;
            let b = colorStop.color.metaColor.b;
            let a = colorStop.color.metaColor.a;

            // Append the current color stop to the gradient string
            colorValue += `rgba(${r}, ${g}, ${b}, ${a}) ${percent}%`;

            // Add a comma between color stops, but not after the last one
            if (index < color.colors.length - 1) {
                colorValue += ', ';
            }
        });
        colorValue += ')';
    } else {
        colorValue = color.toHexString();
    }

    // Update the bot appearance with the correct color or gradient
    setBotAppearance((prev) => ({
      ...prev,
      [field]: colorValue,
    }));
  };


  const saveConfig = async () => {
    console.log('Saving bot configuration:', botAppearance);
    try {
      const response = await fetch('/api/bots/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ botId, botAppearance }),
      });
    } catch (error) {
      console.error('Error saving bot configuration:', error);
    }
  };

  // Chat styles based on real-time appearance updates
  const chatStyles = {
    '--headerBackgroundColor': botAppearance.botHeaderBackgroundColor,
    '--headerTextColor': botAppearance.botHeaderTextColor,
    '--chatBackgroundColor': botAppearance.chatBackgroundColor,
    '--widgetColor': botAppearance.widgetColor,
    '--botResponseColor': botAppearance.botBubbleColor,
    '--botTextColor': botAppearance.botTextColor,
    '--userResponseColor': botAppearance.userBubbleColor,
    '--userTextColor': botAppearance.userTextColor,
    '--botTypingColor': botAppearance.botTypingColor,
    '--botTypingTextColor': botAppearance.botTypingTextColor,
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="config-box">
        <div className="grid-background-config"></div>
        <div className="orb orb1">
          <Tabs defaultActiveKey="1">
            <TabPane tab="General" key="1">
              <Flex vertical gap={12}>
                <label>Bot Name</label>
                <Input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  variant="filled"
                />
                <label>Purpose</label>
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  variant="filled"
                />
              </Flex>
            </TabPane>
            <TabPane tab="Appearance" key="2">
              <div className="appearance-settings">
                <h4>Customize Appearance</h4>
                <div className="color-wrapper">
                  <div className="color-picker-container">
                    <label>Bot Bubble Color</label>
                    <ColorPicker
                      onChange={(color) => handleColorChange(color, 'botBubbleColor')}
                      showText
                      mode={['single', 'gradient']}
                      defaultValue={botAppearance.botBubbleColor}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Bot Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botTextColor}
                      onChange={(color) => handleColorChange(color, 'botTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>User Bubble Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.userBubbleColor}
                      onChange={(color) => handleColorChange(color, 'userBubbleColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>User Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.userTextColor}
                      onChange={(color) => handleColorChange(color, 'userTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Bot Typing Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botTypingColor}
                      onChange={(color) => handleColorChange(color, 'botTypingColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Bot Typing Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botTypingTextColor}
                      onChange={(color) => handleColorChange(color, 'botTypingTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Chat Background Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.chatBackgroundColor}
                      onChange={(color) => handleColorChange(color, 'chatBackgroundColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Header Background Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botHeaderBackgroundColor}
                      onChange={(color) => handleColorChange(color, 'botHeaderBackgroundColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Header Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botHeaderTextColor}
                      onChange={(color) => handleColorChange(color, 'botHeaderTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Widget Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.widgetColor}
                      onChange={(color) => handleColorChange(color, 'widgetColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                </div>
                <SaveButton onClick={saveConfig}/>
              </div>
            </TabPane>
            <TabPane tab="APIs" key="3">
              Content of Tab 3
            </TabPane>
            <TabPane tab="Integration" key="4">
              Content of Tab 4
            </TabPane>
          </Tabs>
        </div>
        <div className="orb orb2">
          <div className="preview-header">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Chat" key="1">
                <div className="chat-container" style={chatStyles}>
                  <div className="chat-window">
                    <header>
                      <h1>
                        <FontAwesomeIcon icon={faRobot} className="header-bot-icon" />
                        {botName || 'ChatBot'}
                      </h1>
                    </header>
                    <div className="messages">
                      <div className="message assistant">
                        <span>Hello! How can I help you today?</span>
                      </div>
                      <div className="message user">
                        <span>Example user message</span>
                      </div>
                    </div>
                    <div className="input-container">
                      <input type="text" placeholder="Type your message here..." />
                      <SendOutlined className="share-button" />
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Widget" key="2">
                <iframe src="http://localhost:3000/view-bot/66c8e498688a63489dcc4403" className='preview-iframe'></iframe>
              </TabPane>
            </Tabs>
            <PreviewButton />
          </div>
        </div>
      </div>
    </div>
  );
}
