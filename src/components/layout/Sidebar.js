import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const navItems = [
    {
      name: 'Orders',
      path: '/dashboard/orders',
      icon: '📦'
    },
   
    {
      name: 'Payments',
      path: '/dashboard/payments',
      icon: '💰'
    },
    {
      name: 'Delivery',
      path: '/dashboard/delivery',
      icon: '🚚'
    },
    {
      name: 'Products',
      path: '/dashboard/products',
      icon: '🏷️'
    },
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: '👤'
    },
    {
      name: 'Support',
      path: '/dashboard/support',
      icon: '📧'
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>ZappCart</h2>
        {isMobile && (
          <button className="close-sidebar" onClick={toggleSidebar}>
            &times;
          </button>
        )}
      </div>
      
      <div className="sidebar-content">
        <div className="vendor-info">
          <div className="vendor-avatar">VA</div>
          <div className="vendor-details">
            <h3>Vendor Admin</h3>
            <p>Vendor Dashboard</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => 
                isActive ? 'nav-item active' : 'nav-item'
              }
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

