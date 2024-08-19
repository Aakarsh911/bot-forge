'use client';

import {useState, useEffect, useRef} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import './create.css';

export default function CreateBot() {
    const [chatLog, setChatLog] = useState([{bot: true, message: "What would you like to name your bot?"}]);
    const [userInput, setUserInput] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Default values for the bot schema
    const [botData, setBotData] = useState({
        name: "",
        widgetColor: "#0157f9", // Default widget color
        widgetLogo: "default-logo.png", // Default logo
        visiblePrompt: "",
        predefinedPrompts: new Map(),
        botResponseColor: "#ffffff", // Default bot response color
        userResponseColor: "#ffffff", // Default user response color
        botTypingColor: "#0157f9", // Default typing color
        API_URLs: [["https://default-api-url.com"]], // Default API URL
        botPosition: "bottom-right", // Default bot position
        modelType: "",
        closeButtonColor: "#ffffff", // Default close button color
        endMessageRating: [], // Default empty array for message ratings
    });

    const {data: session, status} = useSession();
    const router = useRouter();
    const chatEndRef = useRef(null);

    // dont display the input area if the step is 4
    useEffect(() => {
            if (currentStep === 4) {
                const userInputField = document.querySelector('.user-input-field');
                const chatMessages = document.querySelectorAll('.chat-message');
                const ocean = document.querySelector('.ocean');
                const animLoader = document.querySelector('.anim-loader');

                ocean.style.position = 'relative';
                animLoader.style.display = 'block';
                ocean.style.animation = "slide-up 2s forwards";
                animLoader.style.animation = "slide-up 2s forwards";

                chatMessages.forEach(chatMessage => {
                    chatMessage.style.display = 'none';
                });
                userInputField.style.display = 'none';

            }
        }
        , [currentStep]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({behavior: "smooth"});
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
            {bot: true, message: getNextQuestion(currentStep + 1)}
        ]);
        setCurrentStep(currentStep + 1);
    };

    const handleTextSubmit = (e) => {
        if (e.key === 'Enter' && userInput.trim()) {
            setChatLog((prevLog) => [
                ...prevLog,
                {bot: false, message: userInput}
            ]);
            setBotData({
                ...botData,
                [getStepField(currentStep)]: userInput
            });
            setUserInput("");
            handleNextStep();
        }
    };

    const handleDropdownSelect = (modelType) => {
        setChatLog((prevLog) => [
            ...prevLog,
            {bot: false, message: `Selected Model Type: ${modelType}`}
        ]);
        setBotData({
            ...botData,
            modelType: modelType
        });
        setDropdownOpen(false);
        handleNextStep();
    };

    const getNextQuestion = (step) => {
        switch (step) {
            case 1:
                return "What would you like to name your bot?";
            case 2:
                return "What prompt should be visible?";
            case 3:
                return "Which model type should the bot use?";
            default:
                return "Thank you! You've completed setting up your bot.";
        }
    };

    const getStepField = (step) => {
        switch (step) {
            case 1:
                return "name";
            case 2:
                return "visiblePrompt";
            case 3:
                return "modelType";
            default:
                return null;
        }
    };

    return (
        <div className="dashboard">
            <Sidebar/>
            <div className="create-box">
                <div className="chat-window">
                    {chatLog.map((entry, index) => (
                        <div key={index} className={`chat-message ${entry.bot ? 'bot' : 'user'}`}>
                            {entry.bot ? (
                                <div className="bot-message-container">
                                    <span className="bot-message-text">
                                        <FontAwesomeIcon icon={faRobot} className="bot-icon"/> <span className="bot-message">{entry.message}</span>
                                    </span>
                                </div>
                            ) : (
                                <div className="user-message-wrapper">
                                    <div className="user-image">
                                        <img
                                            src={session.user.image}
                                            alt="User Image"
                                            width={50}
                                            height={50}
                                        />
                                    </div>
                                    <span className='user-message-text'>{entry.message}</span>
                                </div>
                            )}
                            {currentStep === 3 && entry.bot && <div className="dropdown-container">
                                <div
                                    className="dropdown-trigger"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    Select Model Type
                                </div>
                                {dropdownOpen && (
                                    <div className="dropdown-options">
                                        <div onClick={() => handleDropdownSelect('text')}>Text</div>
                                        <div onClick={() => handleDropdownSelect('image')}>Image</div>
                                    </div>
                                )}
                            </div>}
                        </div>
                    ))}
                    <div ref={chatEndRef}/>

                    <div className="user-input">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={handleTextSubmit}
                            placeholder="Type your response..."
                            className='user-input-field'
                        /> 
                    </div>
                </div>
                <div className="ocean">
                    <div className="wave"></div>
                    <div className="wave"></div>
                </div>
                <div className="anim-loader">

                </div>
            </div>
        </div>
    );
}
