import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faRobot, faChartLine, faFileAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../css/sidebar.css';

export default function Sidebar({ redirectToSettings }) {
    return (
        <div className="sidebar">
            <ul>
                <li>
                    <a href="/dashboard" title="My Bots" className='active'>
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
                <li className="settings-icon">
                    {/* Using the passed redirectToSettings function */}
                    <a  title="Settings" onClick={redirectToSettings}>
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
    );
}
