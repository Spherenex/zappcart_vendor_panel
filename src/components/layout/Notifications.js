import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { ref, onValue, update } from 'firebase/database';
import './Notifications.css';

const Notifications = ({ toggle, isOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Reference to notifications in Firebase
    const notificationsRef = ref(db, 'notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsArray = Object.keys(notificationsData).map(key => ({
          id: key,
          ...notificationsData[key]
        }))
        // Filter for notifications for this vendor
        .filter(notification => notification.vendorId === 'VENDOR123') // Replace with actual vendor ID
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first
        
        setNotifications(notificationsArray);
        setUnreadCount(notificationsArray.filter(notification => !notification.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    
    // For demo purposes, create mock data if no real data exists
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      const mockNotifications = [
        {
          id: 'notif1',
          type: 'new_order',
          message: 'New order received from Rahul Sharma',
          orderId: 'order1',
          timestamp: now - 5 * 60000, // 5 minutes ago
          read: false
        },
        {
          id: 'notif2',
          type: 'new_order',
          message: 'New order received from Priya Patel',
          orderId: 'order2',
          timestamp: now - 20 * 60000, // 20 minutes ago
          read: false
        },
        {
          id: 'notif3',
          type: 'reminder',
          message: 'Order #34589 is waiting for confirmation',
          orderId: 'order1',
          timestamp: now - 35 * 60000, // 35 minutes ago
          read: false
        },
        {
          id: 'notif4',
          type: 'system',
          message: 'Daily prices have been updated',
          timestamp: now - 3 * 3600000, // 3 hours ago
          read: true
        },
        {
          id: 'notif5',
          type: 'system',
          message: 'Your payment of ₹2450 has been processed',
          timestamp: now - 1 * 86400000, // 1 day ago
          read: true
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(notification => !notification.read).length);
    }
    
    return () => unsubscribe();
  }, []);

  const markAsRead = (notificationId) => {
    // In a real app, update Firebase
    // const notificationRef = ref(db, `notifications/${notificationId}`);
    // update(notificationRef, { read: true });
    
    // For demo, update local state
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    // In a real app, update all notifications in Firebase
    // notifications.forEach(notification => {
    //   if (!notification.read) {
    //     const notificationRef = ref(db, `notifications/${notification.id}`);
    //     update(notificationRef, { read: true });
    //   }
    // });
    
    // For demo, update local state
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return 'a year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return 'a month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return 'yesterday';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return 'an hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return 'a minute ago';
    
    return 'just now';
  };

  return (
    <>
      <div className="notification-badge-container">
        <button className="notification-button" onClick={toggle}>
          🔔
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
      </div>
      
      <div className={`notifications-panel ${isOpen ? 'open' : ''}`}>
        <div className="notifications-header">
          <h3>Notifications</h3>
          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
            <button className="close-notifications" onClick={toggle}>
              &times;
            </button>
          </div>
        </div>
        
        <div className="notifications-content">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-icon">🔔</div>
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {notification.type === 'new_order' && '📦'}
                  {notification.type === 'reminder' && '⏰'}
                  {notification.type === 'system' && '🔔'}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;