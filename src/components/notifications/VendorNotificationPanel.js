// src/components/notifications/VendorNotificationPanel.jsx
import React, { useEffect } from 'react';
import { useVendorNotifications } from '../../contexts/VendorNotificationsContext';
import { 
  Bell, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  X,
  ThumbsUp,
  ThumbsDown,
  CalendarClock,
  DollarSign
} from 'lucide-react';
import './VendorNotificationPanel.css';

const VendorNotificationPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead 
  } = useVendorNotifications();

  // Play sound effect when new unread notifications come in
  useEffect(() => {
    if (unreadCount > 0 && isOpen) {
      // Mark all as read when panel is opened
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const timeDiff = now - date;
    const minutesDiff = timeDiff / (1000 * 60);
    const hoursDiff = minutesDiff / 60;
    
    if (minutesDiff < 1) {
      return 'Just now';
    } else if (minutesDiff < 60) {
      return `${Math.floor(minutesDiff)}m ago`;
    } else if (hoursDiff < 24) {
      return `${Math.floor(hoursDiff)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    }
  };

  // Get notification icon based on type and action
  const getNotificationIcon = (notification) => {
    if (notification.type === 'order') {
      switch (notification.action) {
        case 'new': return <Package className="notification-icon new-order" />;
        case 'processing': return <Clock className="notification-icon processing" />;
        case 'prepared': return <CheckCircle className="notification-icon prepared" />;
        case 'ready': return <Package className="notification-icon ready" />;
        case 'delivery_assigned': return <Package className="notification-icon delivery-assigned" />;
        case 'out_for_delivery': return <Package className="notification-icon out-for-delivery" />;
        case 'delivered': return <CheckCircle className="notification-icon delivered" />;
        case 'cancelled': return <XCircle className="notification-icon cancelled" />;
        default: return <Package className="notification-icon" />;
      }
    }
    
    if (notification.type === 'support') {
      switch (notification.action) {
        case 'submitted': return <FileText className="notification-icon submitted" />;
        case 'approved': return <ThumbsUp className="notification-icon approved" />;
        case 'rejected': return <ThumbsDown className="notification-icon rejected" />;
        default: return <FileText className="notification-icon" />;
      }
    }

    if (notification.type === 'payment') {
      return <DollarSign className="notification-icon payment" />;
    }

    if (notification.type === 'schedule') {
      return <CalendarClock className="notification-icon schedule" />;
    }
    
    return <Bell className="notification-icon" />;
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate to the relevant page based on notification type
    if (notification.type === 'order' && notification.orderId) {
      window.location.href = `/dashboard/orders?id=${notification.orderId}`;
    } else if (notification.type === 'support' && notification.requestId) {
      window.location.href = `/dashboard/support`;
    } else if (notification.type === 'payment') {
      window.location.href = `/dashboard/payments`;
    } else if (notification.type === 'schedule') {
      window.location.href = `/dashboard/support`;
    }
    
    // Close the panel
    onClose();
  };

  // Function to extract order ID from message if available
  const extractOrderInfo = (notification) => {
    if (notification.type === 'order' && notification.message) {
      // Extract order ID using regex
      const orderIdMatch = notification.message.match(/#([A-Za-z0-9]+)/);
      if (orderIdMatch && orderIdMatch[1]) {
        return orderIdMatch[1];
      }
    }
    return '';
  };

  // Function to extract customer name and amount if available
  const extractCustomerInfo = (notification) => {
    const customerInfo = {
      name: notification.customerName || '',
      amount: notification.orderAmount || ''
    };
    
    // If not available in the notification object directly, try to extract from message
    if (!customerInfo.name && notification.message) {
      const customerMatch = notification.message.match(/from\s+([A-Za-z\s]+)/);
      if (customerMatch && customerMatch[1]) {
        customerInfo.name = customerMatch[1].trim();
      }
    }
    
    return customerInfo;
  };

  if (!isOpen) return null;

  // Limit display to 5 most recent notifications
  const displayNotifications = notifications.slice(0, 5);

  return (
    <div className="vendor-notification-panel">
      <div className="notification-panel-header">
        <h3>Notifications {unreadCount > 0 && <span className="notification-count">({unreadCount})</span>}</h3>
        <div className="notification-actions">
          <button 
            className="mark-all-read-btn" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle size={16} />
            Mark all as read
          </button>
          <button className="close-panel-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="notification-list">
        {displayNotifications.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={24} className="empty-icon" />
            <p>No notifications to display</p>
          </div>
        ) : (
          <>
            {displayNotifications.map(notification => {
              const orderInfo = extractOrderInfo(notification);
              const customerInfo = extractCustomerInfo(notification);
              
              return (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                  data-type={notification.type}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {getNotificationIcon(notification)}
                  
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    
                    {(notification.type === 'order' && (customerInfo.name || customerInfo.amount)) && (
                      <div className="notification-meta">
                        {customerInfo.name && (
                          <>
                            <strong>Customer:</strong> {customerInfo.name}
                          </>
                        )}
                        {customerInfo.amount && (
                          <span className="notification-amount"> • {customerInfo.amount}</span>
                        )}
                      </div>
                    )}
                    
                    {notification.adminComment && (
                      <div className="notification-comment">
                        <strong>Admin:</strong> {notification.adminComment}
                      </div>
                    )}
                    
                    <div className="notification-time">{formatDate(notification.timestamp)}</div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length > 5 && (
              <div className="view-all-link">
                <a href="/dashboard/notifications">View all notifications</a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorNotificationPanel;