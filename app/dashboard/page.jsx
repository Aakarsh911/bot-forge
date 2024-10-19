'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import botSVG from './bot-icon.png';
import Image from 'next/image';

import Sidebar from '@/components/Sidebar';
import './dashboard.css';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [bots, setBots] = useState([]); // State to store fetched bots
  const [activeDropdown, setActiveDropdown] = useState(null); // State for active dropdown

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
          setBots(data.bots);
        } catch (error) {
          console.error('Error fetching bots:', error);
        }
      }
    };

    fetchBots();
  }, [status]);

  useEffect(() => {
    const body = document.querySelector('body');
    body.style.background = "#1d1f20";

    const generateGlowingLineWithBorders = () => {
      const mainContent = document.querySelector('.main-content');
      const gridSize = 40; // Match the grid size used in the background
      const line = document.createElement('div');
      line.classList.add('glowing-line');

      // Random column placement snapped to grid
      const randomColumn = Math.floor(Math.random() * (mainContent.offsetWidth / gridSize)) * gridSize;
      line.style.left = `${randomColumn}px`;

      // Append the glowing line
      mainContent.appendChild(line);

      // Remove the line after animation
      setTimeout(() => {
        mainContent.removeChild(line);
      }, 3000); // Line duration
    };

    // Spawn the glowing line at intervals
    const intervalId = setInterval(generateGlowingLineWithBorders, 750); // Reduced frequency

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.dropdown-menu');
      if (dropdown && !dropdown.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This function will be passed to Sidebar as a prop
  function redirectToSettings() {
    const botList = document.querySelectorAll('.chatbot-item');
    const chatbotButton = document.querySelector('.add-chatbot-button');
    const dashboardHeading = document.querySelector('h1'); // Target the dashboard heading

    // Step 1: Animate chatbot items and button to shrink
    chatbotButton.style.animation = 'shrink 0.5s forwards';
    for (let i = 0; i < botList.length; i++) {
      botList[i].style.animation = 'shrink 0.5s forwards';
    }

    // Step 2: Add a blinking cursor element
    const cursorSpan = document.createElement('span');
    cursorSpan.classList.add('blinking-cursor');
    dashboardHeading.textContent = "Dashboard"; // Reset text
    dashboardHeading.appendChild(cursorSpan);

    let currentText = "Dashboard";
    let newText = "Settings";
    let currentLength = currentText.length;
    let index = 0;

    // Backspace the "Dashboard" text
    function backspaceText() {
      if (currentLength > 0) {
        currentText = currentText.slice(0, -1);
        dashboardHeading.textContent = currentText;
        dashboardHeading.appendChild(cursorSpan); // Re-add the cursor
        currentLength--;
        setTimeout(backspaceText, 100); // Control backspace speed
      } else {
        typeSettingsText(); // Start typing "Settings" after backspacing
      }
    }

    // Type the "Settings" text
    function typeSettingsText() {
      if (index < newText.length) {
        dashboardHeading.textContent += newText.charAt(index);
        dashboardHeading.appendChild(cursorSpan); // Re-add the cursor
        index++;
        setTimeout(typeSettingsText, 150); // Control typing speed
      }
    }

    backspaceText();
    setTimeout(() => {
      document.querySelector('.blinking-cursor').style.display = 'none';
    }, 2500); // Hide the cursor after typing

  }


  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  const handleExpand = () => {
    setExpanded(!expanded);
    const chatbot = document.querySelector('.add-chatbot-button');
    const mainContent = document.querySelector('.main-content');
    const plusIcon = document.querySelector('.plus-icon');
    const chatbotText = document.querySelector('.add-chatbot-button p');
    const sidebar = document.querySelector('.sidebar');
    const body = document.querySelector('body');
    const chatBotItems = document.querySelectorAll('.chatbot-item');
    chatBotItems.forEach(item => {
      item.style.display = "none";
    });
    body.style.background = "#131313";
    sidebar.style.background = "#131313";
    plusIcon.style.display = "none";
    chatbotText.style.display = "none";
    chatbot.style.maxWidth = "none";
    chatbot.style.animation = "expand 0.5s forwards";
    mainContent.style.animation = "remove-margin 0.5s forwards";
    setTimeout(() => {
      router.push('/create');
    }, 1100);
  };

  const toggleDropdown = (botId) => {
    setActiveDropdown(activeDropdown === botId ? null : botId);
  };

  const handleEdit = (botId) => {
    router.push(`/config/${botId}`);
  };

  const handleDelete = async (botId) => {
    try {
      const response = await fetch('/api/bots/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ botId }),
      });

      if (response.ok) {
        console.log('Bot deleted successfully');
        // Remove the deleted bot from the local state to update the UI
        setBots(bots.filter((bot) => bot._id !== botId));
      } else {
        console.error('Failed to delete bot');
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
    }
  };

  return (
      <div className="dashboard">
        {/* Passing redirectToSettings as a prop to Sidebar */}
        <Sidebar redirectToSettings={redirectToSettings} />
        <div className="main-content">
          <div className="grid-background"></div>

          <h1>Dashboard</h1>

          <div className="chatbots-list">
            <div className="add-chatbot-button" onClick={handleExpand}>
              <FontAwesomeIcon icon={faPlus} className="plus-icon" />
              <p>Add Chatbot</p>
            </div>

            {/* Render the list of bots */}
            {bots && bots.length > 0 && bots.map((bot) => (
                <div key={bot._id} className="chatbot-item">
                  <h2 className='bot-header-name'>
                    {bot.name}
                    <FontAwesomeIcon
                        icon={faCog}
                        className="bot-settings-button"
                        onClick={() => toggleDropdown(bot._id)}
                    />
                  </h2>
                  <div className="bubble"></div>
                  {/*<Image className="chatbot-icon" src={botSVG} alt="Chatbot Logo" />*/}

                  {/* Dropdown Menu */}
                  {activeDropdown === bot._id && (
                      <div className="dropdown-menu">
                        <div className="edit" onClick={() => handleEdit(bot._id)}>Edit</div>
                        <div onClick={() => handleDelete(bot._id)}><span className="delete-text">Delete</span></div>
                      </div>
                  )}
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}
