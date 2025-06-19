



// // src/components/dashboard/Header.jsx (updated)
// import React, { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { useNotifications } from '../../contexts/VendorNotificationsContext';
// import VendorNotificationPanel from '../notifications/VendorNotificationPanel';
// import './Header.css';

// const Header = ({ toggleSidebar }) => {
//   const { currentUser, logout } = useAuth();
//   const { unreadCount } = useNotifications();
//   const navigate = useNavigate();
//   const [showNotifications, setShowNotifications] = useState(false);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/');
//     } catch (error) {
//       console.error('Failed to log out', error);
//     }
//   };

//   const toggleNotifications = () => {
//     setShowNotifications(!showNotifications);
//   };

//   return (
//     <header className="header">
//       <div className="header-left">
//         <button className="menu-toggle" onClick={toggleSidebar}>
//           <span></span>
//           <span></span>
//           <span></span>
//         </button>
//         <h1 className="header-title">Dashboard</h1>
//       </div>
      
//       <div className="header-right">
//         <div className="notifications">
//           <button className="notification-btn" onClick={toggleNotifications}>
//             🔔
//             {unreadCount > 0 && (
//               <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
//             )}
//           </button>
//           <VendorNotificationPanel
//             isOpen={showNotifications} 
//             onClose={() => setShowNotifications(false)} 
//           />
//         </div>
        
//         <div className="user-dropdown">
//           <button className="user-dropdown-toggle">
//             <div className="user-avatar">
//               {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
//             </div>
//             <span className="user-name">
//               {currentUser?.email?.split('@')[0] || 'User'}
//             </span>
//           </button>
          
//           <div className="dropdown-menu">
//             <a href="/dashboard/profile" className="dropdown-item">
//               Profile
//             </a>
//             <a href="#" className="dropdown-item" onClick={handleLogout}>
//               Logout
//             </a>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;



// src/components/dashboard/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useVendorNotifications } from '../../contexts/VendorNotificationsContext';
import VendorNotificationPanel from '../notifications/VendorNotificationPanel';
import { Bell } from 'lucide-react';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useVendorNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="header-title">Dashboard</h1>
      </div>
      
      <div className="header-right">
        <div className="vendor-notification-bell-container">
          <button className="notification-btn" onClick={toggleNotifications}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="vendor-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          <VendorNotificationPanel
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>
        
        <div className="user-dropdown">
          <button className="user-dropdown-toggle">
            <div className="user-avatar">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">
              {currentUser?.email?.split('@')[0] || 'User'}
            </span>
          </button>
          
          <div className="dropdown-menu">
            <a href="/dashboard/profile" className="dropdown-item">
              Profile
            </a>
            <a href="#" className="dropdown-item" onClick={handleLogout}>
              Logout
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;