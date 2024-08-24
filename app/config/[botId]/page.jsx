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
    botHeaderBackgroundColor: '#0157f9',
    botHeaderTextColor: '#ffffff',
    botTypingTextColor: '#ffffff',
    botHeaderBackgroundColor: '#0157f9',
    botHeaderTextColor: '#ffffff',
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
                        onChangeComplete={(color) => handleColorChange(color, 'botBubbleColor')}
                        showText
                        mode={['single', 'gradient']}
                        defaultValue={botAppearance.botBubbleColor}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Bot Text Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.botTextColor}
                          onChangeComplete={(color) => handleColorChange(color, 'botTextColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>User Bubble Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.userBubbleColor}
                          onChangeComplete={(color) => handleColorChange(color, 'userBubbleColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>User Text Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.userTextColor}
                          onChangeComplete={(color) => handleColorChange(color, 'userTextColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Bot Typing Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.botTypingColor}
                          onChangeComplete={(color) => handleColorChange(color, 'botTypingColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Bot Typing Text Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.botTypingTextColor}
                          onChangeComplete={(color) => handleColorChange(color, 'botTypingTextColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>

                    <div className="color-picker-container">
                      <label>Chat Background Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.chatBackgroundColor}
                          onChangeComplete={(color) => handleColorChange(color, 'chatBackgroundColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>
                    <div className="color-picker-container">
                      <label>Header Background Color</label>
                      <ColorPicker
                          defaultValue={botAppearance.botHeaderBackgroundColor}
                          onChangeComplete={(color) => handleColorChange(color, 'botHeaderBackgroundColor')}
                          showText
                          mode={['single', 'gradient']}
                      />
                    </div>
                    <div className="color-picker-container">
                      <label>Header Text color</label>
                      <ColorPicker
                          defaultValue={botAppearance.botHeaderTextColor}
                          onChangeComplete={(color) => handleColorChange(color, 'botHeaderTextColor')}
                          showText
                          mode={['single', 'gradient']}
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
