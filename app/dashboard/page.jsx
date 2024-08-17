'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faRobot, faChartLine, faFileAlt, faSignOutAlt, faPlus, faMicrochip, faCogs, faUser } from '@fortawesome/free-solid-svg-icons';
import './dashboard.css';

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	if (status === 'loading') {
		return <p>Loading...</p>;
	}

	if (status === 'unauthenticated') {
		router.push('/');
		return null;
	}

	return (
		<div className="dashboard">
			<div className="sidebar">
				<ul>
					<li>
						<a href="#" title="My Bots" className='active'>
							<FontAwesomeIcon icon={faRobot} className="fa-icon" />
						</a>
					</li>
					<li>
						<a href="#" title="Analytics">
							<FontAwesomeIcon icon={faChartLine} className="fa-icon" />
						</a>
					</li>
					<li>
						<a href="#" title="Guide">
							<FontAwesomeIcon icon={faFileAlt} className="fa-icon" />
						</a>
					</li>
				</ul>
				<ul className="bottom">
					<li>
						<a href="#" title="Settings">
							<FontAwesomeIcon icon={faCog} className="fa-icon" />
						</a>
					</li>
					<li>
						<a href="#" title="Logout" onClick={() => signOut()}>
							<FontAwesomeIcon icon={faSignOutAlt} className="fa-icon" />
						</a>
					</li>
				</ul>
			</div>

			<div className="main-content">
				<h1>Dashboard</h1>

				<div className="chatbots-list">
					<div className="add-chatbot-button">
						<FontAwesomeIcon icon={faPlus} className="plus-icon" />
            <p>Add Chatbot</p>
					</div>
				</div>
			</div>
		</div>
	);
}
