'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import '../dashboard/dashboard.css';
import './create.css';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);

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
			<div className="create-box">
                <h1>Create Your New ChatBot</h1>
			</div>
		</div>
	);
}
