// src/pages/VendorNotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useVendorNotifications } from '../contexts/VendorNotificationsContext';
import { 
  Bell, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  CalendarClock,
  DollarSign,
  Eye
} from 'lucide-react';
import './Notifications.css';

const VendorNotificationsPage = () => {
  const { notifications, markAllAsRead } = useVendorNotifications();
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Mark all as read when component mounts
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Apply filters
  useEffect(() => {
    setLoading(true);
    
    let filtered = [...notifications];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        (notification.message && notification.message.toLowerCase().includes(search)) ||
        (notification.title && notification.title.toLowerCase().includes(search)) ||
        (notification.customerName && notification.customerName.toLowerCase().includes(search)) ||
        (notification.adminComment && notification.adminComment.toLowerCase().includes(search))
      );
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredNotifications(filtered);
    setLoading(false);
  }, [notifications, typeFilter, searchTerm]);

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    // Convert to local date (without time)
    const date = new Date(notification.timestamp).toLocaleDateString('en-US');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
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

  // Get notification type display name
  const getNotificationTypeDisplay = (notification) => {
    if (notification.type === 'order') {
      return 'Order';
    }
    
    if (notification.type === 'support') {
      return 'Support';
    }

    if (notification.type === 'payment') {
      return 'Payment';
    }

    if (notification.type === 'schedule') {
      return 'Schedule';
    }
    
    return 'Notification';
  };

  // Extract order ID from notification
  const extractOrderId = (notification) => {
    if (notification.orderId) return notification.orderId;
    
    // Try to extract from message using regex
    if (notification.message) {
      const orderIdMatch = notification.message.match(/#([A-Za-z0-9]+)/);
      if (orderIdMatch && orderIdMatch[1]) {
        return orderIdMatch[1];
      }
    }
    
    return null;
  };

  // Get notification action link
  const getNotificationAction = (notification) => {
    const orderId = extractOrderId(notification);
    
    if (notification.type === 'order' && orderId) {
      return (
        <a 
          href={`/dashboard/orders?id=${orderId}`}
          className="notification-action-btn"
        >
          <Eye size={16} />
          View Order
        </a>
      );
    }
    
    if (notification.type === 'support' && notification.requestId) {
      return (
        <a 
          href={`/dashboard/support`}
          className="notification-action-btn"
        >
          <Eye size={16} />
          View Details
        </a>
      );
    }

    if (notification.type === 'payment') {
      return (
        <a 
          href={`/dashboard/payments`}
          className="notification-action-btn"
        >
          <Eye size={16} />
          View Payments
        </a>
      );
    }

    if (notification.type === 'schedule') {
      return (
        <a 
          href={`/dashboard/support`}
          className="notification-action-btn"
        >
          <Eye size={16} />
          View Schedule
        </a>
      );
    }
    
    return null;
  };

  // Extract customer info
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
    
    // Try to extract amount if not already available
    if (!customerInfo.amount && notification.message) {
      const amountMatch = notification.message.match(/₹([0-9,]+)/);
      if (amountMatch && amountMatch[1]) {
        customerInfo.amount = `₹${amountMatch[1]}`;
      }
    }
    
    return customerInfo;
  };

  return (
    <div className="vendor-notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>
      
      {/* Filters */}
      <div className="notifications-filters">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <Filter size={16} />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="order">Orders</option>
            <option value="support">Support</option>
            <option value="payment">Payments</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>
      </div>
      
      {/* Notifications List */}
      {loading ? (
        <div className="loading-container">
          <RefreshCw size={32} className="loading-spinner" />
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-notifications-container">
          <Bell size={48} className="empty-icon" />
          <h3>No Notifications Found</h3>
          <p>
            {typeFilter === 'all' 
              ? "You don't have any notifications yet." 
              : `No ${typeFilter} notifications found.`
            }
          </p>
        </div>
      ) : (
        <div className="notifications-list-container">
          {sortedDates.map(date => (
            <div key={date} className="notifications-date-group">
              <div className="date-header">{date}</div>
              
              <div className="notifications-group">
                {groupedNotifications[date].map(notification => {
                  const customerInfo = extractCustomerInfo(notification);
                  
                  return (
                    <div key={notification.id} className="notification-card">
                      <div className="notification-card-header">
                        <div className="notification-type">
                          {getNotificationIcon(notification)}
                          <span>{getNotificationTypeDisplay(notification)}</span>
                        </div>
                        <div className="notification-time">
                          {formatDate(notification.timestamp)}
                        </div>
                      </div>
                      
                      <div className="notification-card-content">
                        <h3 className="notification-title">{notification.title}</h3>
                        <p className="notification-message">{notification.message}</p>
                        
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
                            <strong>Admin Comment:</strong> {notification.adminComment}
                          </div>
                        )}
                      </div>
                      
                      <div className="notification-card-actions">
                        {getNotificationAction(notification)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorNotificationsPage;