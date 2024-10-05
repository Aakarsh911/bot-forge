'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './config.css';
import { Tabs, ColorPicker, Card, Space, Button, Input, Form } from 'antd';
import { Flex } from 'antd';
import { PreviewButton } from '@/components/PreviewButton';
import { SaveButton } from '@/components/SaveButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { UilMessage } from '@iconscout/react-unicons';

const { TabPane } = Tabs;

export default function ConfigBot() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const botId = params.botId;
  const [botName, setBotName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [apiURLs, setApiURLs] = useState([]); // Add state for storing API URLs

  // State for API mappings
  const [apiMappings, setApiMappings] = useState([
    {
      id: Date.now(),
      when: '',
      apiEndpoint: '',
      parameters: [{ key: '', value: '' }],
    },
  ]);

  // State for managing color settings
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
    widgetLogo: null, // State to store the selected widget icon
  });

  useEffect(() => {
    const fetchBots = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/bots/fetch', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const data = await response.json();
          const botIds = data.bots.map(bot => bot._id);
          if (botIds.indexOf(botId) === -1) {
            router.push('/');
          }
        } catch (error) {
          console.error('Error fetching bots:', error);
        }
      } else {
        router.push('/');
      }
    };

    fetchBots();
  }, [status]);

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const response = await fetch(`/api/bots/${botId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Bot data:', data.bot.API_URLs);
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
            widgetLogo: data.bot.widgetLogo || null, // Set initial widget icon if available
          });
          if (data.bot.API_URLs) {
            setApiMappings(data.bot.API_URLs); // Store the fetched API mappings
          }
          if (data.bot.apiURLs) {
            setApiURLs(data.bot.apiURLs); // Store the fetched API URLs
          }
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
      colorValue = 'linear-gradient(90deg, ';

      color.colors.forEach((colorStop, index) => {
        let percent = colorStop.percent;
        let r = colorStop.color.metaColor.r;
        let g = colorStop.color.metaColor.g;
        let b = colorStop.color.metaColor.b;
        let a = colorStop.color.metaColor.a;

        colorValue += `rgba(${r}, ${g}, ${b}, ${a}) ${percent}%`;

        if (index < color.colors.length - 1) {
          colorValue += ', ';
        }
      });
      colorValue += ')';
    } else {
      colorValue = color.toHexString();
    }

    setBotAppearance(prev => ({
      ...prev,
      [field]: colorValue,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBotAppearance(prev => ({
          ...prev,
          widgetLogo: reader.result, // Store the base64 image data
        }));
      };
      reader.readAsDataURL(file);
    }
  };



  const saveConfig = async () => {
    console.log('Saving bot configuration:', {
      botName,
      purpose,
      botAppearance,
      apiMappings,
    });

    let apiMappingsNew = apiMappings;

    try {
      if (typeof apiMappings === 'string') {
        apiMappingsNew = JSON.parse(apiMappings);
      }

      apiMappingsNew = apiMappingsNew.map(mapping => ({
        ...mapping,
        id: String(mapping.id), // Ensure ID is a string
        parameters: mapping.parameters.map(param => ({
          key: String(param.key),
          value: String(param.value),
        })),
      }));

      apiMappingsNew = JSON.stringify(apiMappingsNew);

      const response = await fetch('/api/bots/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          botName,
          purpose,
          botAppearance,
          apiMappingsNew,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      } else {
        console.log('Bot configuration saved successfully.');
      }
    } catch (error) {
      console.error('Error saving bot configuration:', error);
    }
  };

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

  const modifyIframeLinks = () => {
    const iframe = document.querySelector('.preview-iframe');
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const links = iframeDoc.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_parent');
      });
    }
  };

  useEffect(() => {
    const iframe = document.querySelector('.preview-iframe');
    if (iframe) {
      iframe.onload = modifyIframeLinks;
    }
  }, []);

  // Handlers for API Mappings
  const handleAddMapping = () => {
    setApiMappings([
      ...apiMappings,
      {
        id: Date.now(),
        when: '',
        apiEndpoint: '',
        parameters: [{ key: '', value: '' }],
      },
    ]);
  };

  const handleRemoveMapping = id => {
    setApiMappings(apiMappings.filter(mapping => mapping.id !== id));
  };

  const handleMappingChange = (id, field, value) => {
    setApiMappings(
      apiMappings.map(mapping =>
        mapping.id === id ? { ...mapping, [field]: value } : mapping
      )
    );
  };

  const handleAddParameter = mappingId => {
    setApiMappings(
      apiMappings.map(mapping =>
        mapping.id === mappingId
          ? { ...mapping, parameters: [...mapping.parameters, { key: '', value: '' }] }
          : mapping
      )
    );
  };

  const handleRemoveParameter = (mappingId, index) => {
    setApiMappings(
      apiMappings.map(mapping =>
        mapping.id === mappingId
          ? {
              ...mapping,
              parameters: mapping.parameters.filter((_, i) => i !== index),
            }
          : mapping
      )
    );
  };

  const handleParameterChange = (mappingId, index, field, value) => {
    setApiMappings(
      apiMappings.map(mapping => {
        if (mapping.id === mappingId) {
          const newParameters = [...mapping.parameters];
          newParameters[index][field] = value;
          return { ...mapping, parameters: newParameters };
        }
        return mapping;
      })
    );
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
                  onChange={e => setBotName(e.target.value)}
                  variant="filled"
                  placeholder="Enter Bot Name"
                />
                <label>Purpose</label>
                <Input
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  variant="filled"
                  placeholder="Enter Bot Purpose"
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
                      onChange={color => handleColorChange(color, 'botBubbleColor')}
                      showText
                      mode={['single', 'gradient']}
                      defaultValue={botAppearance.botBubbleColor}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Bot Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botTextColor}
                      onChange={color => handleColorChange(color, 'botTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>User Bubble Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.userBubbleColor}
                      onChange={color => handleColorChange(color, 'userBubbleColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>User Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.userTextColor}
                      onChange={color => handleColorChange(color, 'userTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Bot Typing Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botTypingColor}
                      onChange={color => handleColorChange(color, 'botTypingColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Bot Typing Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botTypingTextColor}
                      onChange={color => handleColorChange(color, 'botTypingTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Chat Background Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.chatBackgroundColor}
                      onChange={color => handleColorChange(color, 'chatBackgroundColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Header Background Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botHeaderBackgroundColor}
                      onChange={color => handleColorChange(color, 'botHeaderBackgroundColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Header Text Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.botHeaderTextColor}
                      onChange={color => handleColorChange(color, 'botHeaderTextColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="color-picker-container">
                    <label>Widget Color</label>
                    <ColorPicker
                      defaultValue={botAppearance.widgetColor}
                      onChange={color => handleColorChange(color, 'widgetColor')}
                      showText
                      mode={['single', 'gradient']}
                    />
                  </div>
                  <div className="widget-icon-container">
                    <label>Widget Icon</label>
                    <div
                      style={{
                        width: '100%',
                        height: '150px',
                        border: '2px dashed #ccc',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#f9f9f9',
                      }}
                      onClick={() => document.getElementById('widgetLogoInput').click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        const reader = new FileReader();
                        reader.onload = () => {
                          setBotAppearance(prev => ({
                            ...prev,
                            widgetLogo: reader.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    >
                      {botAppearance.widgetLogo ? (
                        <img
                          src={botAppearance.widgetLogo}
                          alt="Widget Icon"
                          style={{ maxHeight: '100%', maxWidth: '100%' }}
                        />
                      ) : (
                        <span style={{ color: '#ccc' }}>Drag & Drop or Click to Upload</span>
                      )}
                      <input
                        type="file"
                        id="widgetLogoInput"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleIconChange}
                      />
                    </div>
                  </div>
                </div>
                </div>
              </TabPane>
              <TabPane tab="APIs" key="3">
                <div>
                  <div className="api-settings" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>API Mappings</h4>
                    <div className='button' onClick={handleAddMapping}>
                      <FontAwesomeIcon icon={faPlus} />
                    </div>
                  </div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {apiMappings.map((mapping, index) => (
                      <Card
                        key={mapping.id}
                        title={`Mapping ${index + 1}`}
                        extra={
                          apiMappings.length > 1 ? (
                            <FontAwesomeIcon
                              icon={faTrash}
                              color="red"
                              onClick={() => handleRemoveMapping(mapping.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          ) : null
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Form layout="vertical">
                          <Form.Item label="When">
                            <Input
                              placeholder="Enter trigger string"
                              value={mapping.when}
                              onChange={e =>
                                handleMappingChange(mapping.id, 'when', e.target.value)
                              }
                            />
                          </Form.Item>
                          <Form.Item label="API Endpoint">
                            <Input
                              placeholder="Enter API endpoint"
                              value={mapping.apiEndpoint}
                              onChange={e =>
                                handleMappingChange(mapping.id, 'apiEndpoint', e.target.value)
                              }
                            />
                          </Form.Item>
                          <Form.Item label="">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label>Parameters</label>
                              <div className='button' onClick={() => handleAddParameter(mapping.id)}>
                                <FontAwesomeIcon icon={faPlus} />
                              </div>
                            </div>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {mapping.parameters.map((param, paramIndex) => (
                                <Space key={paramIndex} align="baseline">
                                  <Input
                                    placeholder="Key"
                                    value={param.key}
                                    onChange={e =>
                                      handleParameterChange(
                                        mapping.id,
                                        paramIndex,
                                        'key',
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Value"
                                    value={param.value}
                                    onChange={e =>
                                      handleParameterChange(
                                        mapping.id,
                                        paramIndex,
                                        'value',
                                        e.target.value
                                      )
                                    }
                                  />
                                  {mapping.parameters.length > 1 && (
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      color="red"
                                      onClick={() => handleRemoveParameter(mapping.id, paramIndex)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  )}
                                </Space>
                              ))}
                            </Space>
                          </Form.Item>
                        </Form>
                      </Card>
                    ))}
                  </Space>
                </div>
              </TabPane>
              <TabPane tab="Integration" key="4">
                {/* Integration content can be added here */}
                <p>Integration settings will be available soon.</p>
              </TabPane>
            </Tabs>
            <SaveButton onClick={saveConfig} />
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
                        <div className="message assistant typing">
                          <span className="typing-text">Bot is typing</span>
                          <div className="dot-container">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </div>
                        </div>
                      </div>
                      <div className="input-container">
                        <input type="text" placeholder="Type your message here..." />
                        <button className="send-button">
                          <UilMessage size="20" className="send-button" />
                        </button>
                      </div>
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="Widget" key="2">
                  <div className="widget-settings" >
                    <h4>Customize Widget</h4>

                    <div
                      style={{
                        width: '100%',
                        height: '70vh',
                        border: '1px solid #ccc',
                        borderRadius: '10px',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#f0f0f0',
                      }}
                    >
                      {/* Mock Chrome browser top bar */}
                      <div
                        style={{
                          backgroundColor: '#e3e3e3',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 1rem',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}
                      >
                        {/* Left corner buttons (close, minimize, maximize) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#ff5f57',
                              borderRadius: '50%',
                            }}
                          ></div>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#ffbd2e',
                              borderRadius: '50%',
                            }}
                          ></div>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#28c840',
                              borderRadius: '50%',
                            }}
                          ></div>
                        </div>

                        {/* URL bar */}
                        <div style={{ flex: '1', marginLeft: '1rem', marginRight: '1rem' }}>
                          <input
                            type="text"
                            value="https://chatbot.example.com"
                            style={{
                              width: '100%',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: '1px solid #ccc',
                              outline: 'none',
                              height: '1em'
                            }}
                            readOnly
                          />
                        </div>

                        {/* Right side space for any additional buttons (optional) */}
                        <div></div>
                      </div>

                      {/* Mock Chrome browser content area */}
                      <div
                        style={{
                          padding: '1rem',
                          backgroundColor: '#ffffff',
                          height: 'calc(100% - 40px)',
                          position: 'relative',
                        }}
                      >
                      </div>

                      {/* Bottom-right widget button inside Chrome window */}
                      <button
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          right: '1rem',
                          background: botAppearance.widgetColor,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        {botAppearance.widgetLogo ? (
                          <img
                            src={botAppearance.widgetLogo}
                            alt="Widget Icon"
                            style={{ height: '2.5em', width: '2.5em', borderRadius: '50%' }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faRobot} />
                        )}
                      </button>
                    </div>
                  </div>
                </TabPane>

              </Tabs>
            </div>
          </div>
        </div>
      </div>
  );
}
