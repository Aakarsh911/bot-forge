'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './create.css';

export default function CreateBot() {
    const [chatLog, setChatLog] = useState([{ bot: true, message: "What would you like to name your bot?" }]);
    const [userInput, setUserInput] = useState("");
    const [colorInput, setColorInput] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [botData, setBotData] = useState({
        name: "",
        widgetColor: "",
        widgetLogo: null,
        visiblePrompt: "",
        botResponseColor: "",
        userResponseColor: "",
        botTypingColor: "",
        API_URLs: "",
        botPosition: "",
        modelType: "",
        closeButtonColor: "",
    });
    const { data: session, status } = useSession();
    const router = useRouter();
    const chatEndRef = useRef(null); // Ref to scroll to the last message

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLog]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    const handleNextStep = () => {
        setChatLog((prevLog) => [
            ...prevLog,
            { bot: true, message: getNextQuestion(currentStep + 1) }
        ]);
        setCurrentStep(currentStep + 1);
    };

    const handleTextSubmit = (e) => {
        if (e.key === 'Enter' && userInput.trim()) {
            setChatLog((prevLog) => [
                ...prevLog,
                { bot: false, message: userInput }
            ]);
            setBotData({
                ...botData,
                [getStepField(currentStep)]: userInput
            });
            setUserInput("");
            handleNextStep();
        }
    };

    const handleConfirmColor = () => {
        setChatLog((prevLog) => [
            ...prevLog,
            { bot: false, message: `Selected Color: ${colorInput}` }
        ]);
        setBotData({
            ...botData,
            [getStepField(currentStep)]: colorInput
        });
        handleNextStep();
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setChatLog((prevLog) => [
            ...prevLog,
            { bot: false, message: `Uploaded File: ${file.name}` }
        ]);
        setBotData({
            ...botData,
            [getStepField(currentStep)]: file
        });
        handleNextStep();
    };

    const handleFileClick = (e) => {
        const file = e.target.files[0];
        setChatLog((prevLog) => [
            ...prevLog,
            { bot: false, message: `Uploaded File: ${file.name}` }
        ]);
        setBotData({
            ...botData,
            [getStepField(currentStep)]: file
        });
        handleNextStep();
    };

    const getNextQuestion = (step) => {
        switch (step) {
            case 1:
                return "What would you like to name your bot?";
            case 2:
                return "What should be the widget color?";
            case 3:
                return "Upload a widget logo.";
            case 4:
                return "What should be the visible prompt?";
            case 5:
                return "What should be the bot's response color?";
            case 6:
                return "What should be the user's response color?";
            case 7:
                return "What should be the bot's typing indicator color?";
            case 8:
                return "Provide the API URLs the bot will use.";
            case 9:
                return "Where should the bot be positioned on the screen?";
            case 10:
                return "Which model type should the bot use?";
            case 11:
                return "What color should the close button be?";
            default:
                return "Thank you! You've completed setting up your bot.";
        }
    };

    const getStepField = (step) => {
        switch (step) {
            case 1: return "name";
            case 2: return "widgetColor";
            case 3: return "widgetLogo";
            case 4: return "visiblePrompt";
            case 5: return "botResponseColor";
            case 6: return "userResponseColor";
            case 7: return "botTypingColor";
            case 8: return "API_URLs";
            case 9: return "botPosition";
            case 10: return "modelType";
            case 11: return "closeButtonColor";
            default: return null;
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="create-box">
                <div className="chat-window">
                    {chatLog.map((entry, index) => (
                        <div key={index} className={`chat-message ${entry.bot ? 'bot' : 'user'}`}>
                            {entry.message}
                        </div>
                    ))}
                    <div ref={chatEndRef} />

                    <div className="user-input">
                        {currentStep === 2 || currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 11 ? (
                            <>
                                <input
                                    type="color"
                                    value={colorInput}
                                    onChange={(e) => setColorInput(e.target.value)}
                                />
                                <button className="confirm-button" onClick={handleConfirmColor}>
                                    Confirm Color
                                </button>
                            </>
                        ) : currentStep === 3 ? (
                            <div
                                className="drop-area"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <input
                                    id="fileInput"
                                    type="file"
                                    onChange={handleFileClick}
                                    style={{ display: 'none' }}
                                />
                                <p>Drag & Drop a file here or click to upload</p>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleTextSubmit}
                                placeholder="Type your response..."
                            />
                        )}
                    </div>
                </div>
                <div className="ocean">
                    <div className="wave"></div>
                    <div className="wave"></div>
                </div>
            </div>
        </div>
    );
}
