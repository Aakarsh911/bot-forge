'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import './create.css';

export default function CreateBot() {
    const [chatLog, setChatLog] = useState([{ bot: true, message: "What would you like to name your bot?" }]);
    const [userInput, setUserInput] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false); // For checkmark animation
    const [showBotCreated, setShowBotCreated] = useState(false); // To show "Bot Created" text
    const [userImage, setUserImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isBeingCreated , setIsBeingCreated] = useState(false);// Loading state for bot creation

    // Typing effect states
    const [botMessage, setBotMessage] = useState("");
    const [fullMessage, setFullMessage] = useState(chatLog[0].message); // Message to be typed
    const [currentIndex, setCurrentIndex] = useState(0);

    const fadeInDuration = 500; // Time in milliseconds for the fade-in animation to complete

    // Default values for the bot schema
    const [botData, setBotData] = useState({
        name: "",
        widgetColor: "#0157f9",
        widgetLogo: "default-logo.png",
        visiblePrompt: "",
        botBubbleColor: "#ffffff",
        botTextColor: "#000000",
        userBubbleColor: "#ffffff",
        userTextColor: "#000000",
        botTypingColor: "#0157f9",
        botHeaderBackgroundColor: "#0157f9",
        botHeaderTextColor: "#ffffff",
        chatBackgroundColor: "#808080",
        botTypingTextColor: "#ffffff",
        API_URLs: [],
        botPosition: "bottom-right",
        modelType: "",
        closeButtonColor: "#ffffff",
    });

    const { data: session, status } = useSession();
    const router = useRouter();
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (session && session.user) {
            console.log(session.user);
            console.log(session.user.image);
            setUserImage(session.user.image);
            console.log("User Image: " + userImage);
        }
    }, [session]);

    useEffect(() => {
        if (currentIndex < fullMessage.length) {
            const timeout = setTimeout(() => {
                setBotMessage((prev) => prev + fullMessage[currentIndex]);
                setCurrentIndex(currentIndex + 1);
            }, 50); // Typing speed, adjust as necessary

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, fullMessage]);

    useEffect(() => {
        if (currentStep === 3) {
            const userInputField = document.querySelector('.user-input-field');
            userInputField.style.display = 'none';
        }

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
            createBot();
        }
    }, [currentStep]);

    // Delay typing effect until fade-in animation is complete
    useEffect(() => {
        if (chatLog[chatLog.length - 1].bot) {
            // Start typing effect after the fade-in animation duration
            setTimeout(() => {
                setFullMessage(chatLog[chatLog.length - 1].message);
                setBotMessage(""); // Clear the current bot message
                setCurrentIndex(0); // Reset the typing effect index
            }, fadeInDuration);
        }
    }, [chatLog]);

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
        const nextQuestion = getNextQuestion(currentStep + 1);
        setChatLog((prevLog) => [
            ...prevLog,
            { bot: true, message: nextQuestion }
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

    const handleDropdownSelect = (modelType) => {
        setChatLog((prevLog) => [
            ...prevLog,
            { bot: false, message: `Selected Model Type: ${modelType}` }
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
                return "What is the purpose of your chatbot?";
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

    const createBot = async () => {
        setLoading(true);
        setIsBeingCreated(true);
        try {
            const response = await fetch(`/api/bots/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(botData),
            });

            const data = await response.json();

            if (response.ok) {
                setShowCheckmark(true);
                setShowBotCreated(true);
                setTimeout(() => {
                    const checkmarkWrapper = document.querySelector('.checkmark-container');
                    checkmarkWrapper.style.animation = "fade-out 1s forwards";
                }, 3000);
                setTimeout(() => {
                    router.push(`/config/${data.bot._id}`);
                }, 3500);
                // route to the bot's config page
                console.log('Bot created successfully:', data.bot);
            } else {
                console.error('Error creating bot:', data.message);
            }

        } catch (error) {
            console.error('Error creating bot:', error);
        } finally {
            setLoading(false);
            setIsBeingCreated(false);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="create-box">
                <div className="chat-window">
                    {chatLog.map((entry, index) => (
                        <div key={index} className={`chat-message ${entry.bot ? 'bot' : 'user'}`}>
                            {entry.bot ? (
                                <div className="bot-message-container">
                                    <span className="bot-message-text">
                                        <FontAwesomeIcon icon={faRobot} className="bot-icon"/> <span
                                        className="bot-message">{index === chatLog.length - 1 ? botMessage : entry.message}</span>
                                    </span>
                                </div>
                            ) : (
                                <div className="user-message-wrapper">
                                    <FontAwesomeIcon icon={faUser} className="user-icon"/>
                                    <span className='user-message-text'>{entry.message}</span>
                                </div>
                            )}
                            {currentStep === 3 && entry.bot && (
                                <div className="dropdown-container">
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
                                </div>
                            )}
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
                    {isBeingCreated && (
                        <div className="create-loader">
                            <div className="inner-loader">
                                <div className="create-circle"></div>
                                <div className="create-circle"></div>
                                <div className="create-circle"></div>
                            </div>
                        </div>
                    )}
                    {showCheckmark && (
                        <div className="checkmark-container">
                            <div className="checkmark-wrapper">
                                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <path className="checkmark-check" fill="none" d="M14 27l7 7 15-15"/>
                                </svg>
                            </div>
                            {showBotCreated && <p className="bot-created-text">Bot Created!</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
