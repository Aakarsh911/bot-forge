'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '@/components/Sidebar';
import './dashboard.css';

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		const body = document.querySelector('body');
		body.style.background = "#131313";

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

			// Apply glow to surrounding grid cells
			const applyGridGlow = () => {
				const columnPosition = Math.floor(randomColumn / gridSize);
				const cellsToGlow = document.querySelectorAll(`.grid-cell.col-${columnPosition - 1}, .grid-cell.col-${columnPosition}, .grid-cell.col-${columnPosition + 1}`);
				
				cellsToGlow.forEach(cell => {
					cell.classList.add('glow-border');
				});

				// Remove glow after a short delay
				setTimeout(() => {
					cellsToGlow.forEach(cell => {
						cell.classList.remove('glow-border');
					});
				}, 500); // Glow duration
			};

			// Trigger the glow effect
			setTimeout(applyGridGlow, 300); // Trigger glow as the line moves

			// Remove the line after animation
			setTimeout(() => {
				mainContent.removeChild(line);
			}, 3000); // Line duration
		};

		// Spawn the glowing line at intervals
		const intervalId = setInterval(generateGlowingLineWithBorders, 1000); // Reduced frequency

		return () => {
			clearInterval(intervalId);
		};
	}, []);

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
		body.style.background = "#131313";
		sidebar.style.background = "#131313";
		plusIcon.style.display = "none";
		chatbotText.style.display = "none";
		chatbot.style.animation = "expand 0.5s forwards";
		mainContent.style.animation = "remove-margin 0.5s forwards";
		setTimeout(() => {
			router.push('/create');
		}, 1100);
	};

	return (
		<div className="dashboard">
			<Sidebar />
			<div className="main-content">
				{/* Fainter Grid Div */}
				<div className="grid-background"></div>

				<h1>Dashboard</h1>

				<div className="chatbots-list">
					<div className="add-chatbot-button" onClick={handleExpand}>
						<FontAwesomeIcon icon={faPlus} className="plus-icon" />
						<p>Add Chatbot</p>
					</div>
				</div>
			</div>
		</div>
	);
}
