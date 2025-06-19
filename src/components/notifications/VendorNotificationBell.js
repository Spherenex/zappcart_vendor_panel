// src/components/notifications/VendorNotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useVendorNotifications } from '../../contexts/VendorNotificationsContext';
import VendorNotificationPanel from './VendorNotificationPanel';
import './VendorNotificationBell.css';

const VendorNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, playNotificationSound } = useVendorNotifications();
  const notificationRef = useRef(null);
  const prevUnreadCountRef = useRef(unreadCount);

  // Play sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      playNotificationSound();
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, playNotificationSound]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="vendor-notification-bell-container" ref={notificationRef}>
      <button 
        className="vendor-notification-bell-button" 
        onClick={togglePanel}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="vendor-notification-badge">{unreadCount}</span>
        )}
      </button>
      
      <VendorNotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
};

export default VendorNotificationBell;