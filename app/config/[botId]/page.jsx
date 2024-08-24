'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './config.css';
import { Tabs, ColorPicker } from 'antd';
import { Flex, Input } from 'antd';
import {PreviewButton} from "@/components/PreviewButton";

const { TabPane } = Tabs;

export default function ConfigBot() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const botId = params.botId;
  const [botName, setBotName] = useState('');
  const [purpose, setPurpose] = useState('');

  const [botAppearance, setBotAppearance] = useState({
    botBubbleColor: '#ffffff',
    botTextColor: '#000000',
    userBubbleColor: '#ffffff',
    userTextColor: '#000000',
    chatBackgroundColor: '#f0f0f0',
    botTypingColor: '#0157f9',
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
            botBubbleColor: data.bot.botResponseColor || '#ffffff',
            botTextColor: data.bot.botTextColor || '#000000',
            userBubbleColor: data.bot.userResponseColor || '#ffffff',
            userTextColor: data.bot.userTextColor || '#000000',
            chatBackgroundColor: data.bot.chatBackgroundColor || '#f0f0f0',
            botTypingColor: data.bot.botTypingColor || '#0157f9',
            botTypingTextColor: data.bot.botTypingTextColor || '#ffffff',
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
    setBotAppearance((prev) => ({
      ...prev,
      [field]: color.toHexString(),
    }));
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
                      onChange={(e) => setBotName(e.target.value)} // Add onChange handler
                      variant="filled"
                  />
                  <label>Purpose</label>
                  <Input
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)} // Add onChange handler
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
                          value={botAppearance.botBubbleColor}
                          onChange={(color) => handleColorChange(color, 'botBubbleColor')}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Bot Text Color</label>
                      <ColorPicker
                          value={botAppearance.botTextColor}
                          onChange={(color) => handleColorChange(color, 'botTextColor')}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>User Bubble Color</label>
                      <ColorPicker
                          value={botAppearance.userBubbleColor}
                          onChange={(color) => handleColorChange(color, 'userBubbleColor')}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>User Text Color</label>
                      <ColorPicker
                          value={botAppearance.userTextColor}
                          onChange={(color) => handleColorChange(color, 'userTextColor')}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Bot Typing Color</label>
                      <ColorPicker
                          value={botAppearance.botTypingColor}
                          onChange={(color) => handleColorChange(color, 'botTypingColor')}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Bot Typing Text Color</label>
                      <ColorPicker
                          value={botAppearance.botTypingTextColor}
                          onChange={(color) => handleColorChange(color, 'botTypingTextColor')}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Chat Background Color</label>
                      <ColorPicker
                          value={botAppearance.chatBackgroundColor}
                          onChange={(color) => handleColorChange(color, 'chatBackgroundColor')}
                      />
                    </div>
                  </div>
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
                </TabPane>
                <TabPane tab="Widget" key="2">
                </TabPane>
              </Tabs>
              <PreviewButton/>
            </div>
          </div>
        </div>
      </div>
  );
}
