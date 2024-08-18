'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './create.css';

export default function CreateBot() {

    useEffect(() => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.style.background = "#131313";
    });

    const { data: session, status } = useSession();
    const router = useRouter();
    const [botData, setBotData] = useState({
        name: '',
        widgetColor: '#f28c28',
        widgetLogo: null,
        prompt: '',
        visiblePrompt: '',
        botResponseColor: '#f28c28',
        userResponseColor: '#000000',
        botTypingColor: '#888888',
        botPosition: 'bottom-right',
        modelType: 'gpt-3.5-turbo',
        closeButtonColor: '#ff0000',
    });

    const [isPositionDropdownOpen, setPositionDropdownOpen] = useState(false);
    const [isModelDropdownOpen, setModelDropdownOpen] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    const dropdownRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setPositionDropdownOpen(false);
                setModelDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        setTimeout(() => {
            setFadeIn(true);
        }, 500); // Delay before the fade-in starts
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBotData({ ...botData, [name]: value });
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        setBotData({ ...botData, widgetLogo: file });
    };

    const handleColorChange = (name, color) => {
        setBotData({ ...botData, [name]: color });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Bot data submitted:', botData);
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    return (
        <div className="dashboard">
            <Sidebar />
            <div className={`create-box ${fadeIn ? 'fade-in' : ''}`}>
                <h1>Create Your New ChatBot</h1>
                <div className="create-content">
                    <form className="create-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Bot Name</label>
                            <input
                                type="text"
                                name="name"
                                value={botData.name}
                                onChange={handleInputChange}
                                placeholder="Enter bot name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Widget Color</label>
                            <div
                                className="color-box"
                                style={{ backgroundColor: botData.widgetColor }}
                                onClick={() =>
                                    document.getElementById('widgetColorPicker').click()
                                }
                            ></div>
                            <input
                                type="color"
                                id="widgetColorPicker"
                                style={{ display: 'none' }}
                                value={botData.widgetColor}
                                onChange={(e) => handleColorChange('widgetColor', e.target.value)}
                            />
                        </div>
                        <div className="form-group file-drop">
                            <label>Bot Logo</label>
                            <div
                                className="drop-area"
                                onClick={() => document.getElementById('fileInput').click()}
                                onDrop={handleFileDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {botData.widgetLogo ? (
                                    <img
                                        src={URL.createObjectURL(botData.widgetLogo)}
                                        alt="Bot Logo"
                                        className="preview-logo"
                                    />
                                ) : (
                                    <p>Click or drag & drop to upload bot logo</p>
                                )}
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept="image/*"
                                    onChange={handleFileDrop}
                                    hidden
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Prompt</label>
                            <textarea
                                name="prompt"
                                value={botData.prompt}
                                onChange={handleInputChange}
                                placeholder="Enter bot prompt"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Visible Prompt</label>
                            <textarea
                                name="visiblePrompt"
                                value={botData.visiblePrompt}
                                onChange={handleInputChange}
                                placeholder="Enter visible prompt for users"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Bot Response Color</label>
                            <div
                                className="color-box"
                                style={{ backgroundColor: botData.botResponseColor }}
                                onClick={() =>
                                    document.getElementById('botResponseColorPicker').click()
                                }
                            ></div>
                            <input
                                type="color"
                                id="botResponseColorPicker"
                                style={{ display: 'none' }}
                                value={botData.botResponseColor}
                                onChange={(e) =>
                                    handleColorChange('botResponseColor', e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>User Response Color</label>
                            <div
                                className="color-box"
                                style={{ backgroundColor: botData.userResponseColor }}
                                onClick={() =>
                                    document.getElementById('userResponseColorPicker').click()
                                }
                            ></div>
                            <input
                                type="color"
                                id="userResponseColorPicker"
                                style={{ display: 'none' }}
                                value={botData.userResponseColor}
                                onChange={(e) =>
                                    handleColorChange('userResponseColor', e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Bot Typing Color</label>
                            <div
                                className="color-box"
                                style={{ backgroundColor: botData.botTypingColor }}
                                onClick={() =>
                                    document.getElementById('botTypingColorPicker').click()
                                }
                            ></div>
                            <input
                                type="color"
                                id="botTypingColorPicker"
                                style={{ display: 'none' }}
                                value={botData.botTypingColor}
                                onChange={(e) =>
                                    handleColorChange('botTypingColor', e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group" ref={dropdownRef}>
                            <label>Bot Position</label>
                            <div
                                className="custom-dropdown"
                                onClick={() => setPositionDropdownOpen(!isPositionDropdownOpen)}
                            >
                                {botData.botPosition}
                                {isPositionDropdownOpen && (
                                    <ul className="dropdown-list">
                                        <li onClick={() => setBotData({ ...botData, botPosition: 'bottom-right' })}>Bottom Right</li>
                                        <li onClick={() => setBotData({ ...botData, botPosition: 'bottom-left' })}>Bottom Left</li>
                                        <li onClick={() => setBotData({ ...botData, botPosition: 'top-right' })}>Top Right</li>
                                        <li onClick={() => setBotData({ ...botData, botPosition: 'top-left' })}>Top Left</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="form-group" ref={dropdownRef}>
                            <label>Model Type</label>
                            <div
                                className="custom-dropdown"
                                onClick={() => setModelDropdownOpen(!isModelDropdownOpen)}
                            >
                                {botData.modelType}
                                {isModelDropdownOpen && (
                                    <ul className="dropdown-list">
                                        <li onClick={() => setBotData({ ...botData, modelType: 'gpt-3.5-turbo' })}>GPT-3.5 Turbo</li>
                                        <li onClick={() => setBotData({ ...botData, modelType: 'gpt-4' })}>GPT-4</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Close Button Color</label>
                            <div
                                className="color-box"
                                style={{ backgroundColor: botData.closeButtonColor }}
                                onClick={() =>
                                    document.getElementById('closeButtonColorPicker').click()
                                }
                            ></div>
                            <input
                                type="color"
                                id="closeButtonColorPicker"
                                style={{ display: 'none' }}
                                value={botData.closeButtonColor}
                                onChange={(e) =>
                                    handleColorChange('closeButtonColor', e.target.value)
                                }
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            Create Bot
                        </button>
                    </form>
                    <div className="preview-box">
                        <h2>Bot Preview</h2>
                        {/* Blank preview area */}
                    </div>
                </div>
            </div>
        </div>
    );
}
