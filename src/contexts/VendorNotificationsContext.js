// src/contexts/VendorNotificationsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue, update, query, orderByChild, limitToLast, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebase';

const VendorNotificationsContext = createContext();

export const useVendorNotifications = () => {
  return useContext(VendorNotificationsContext);
};

export const VendorNotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [vendorShop, setVendorShop] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentVendor(user);
        
        try {
          const shopsRef = ref(db, 'shops');
          const snapshot = await get(shopsRef);
          
          if (snapshot.exists()) {
            const shopsData = snapshot.val();
            
            // Find the shop for this vendor
            const matchingShop = Object.entries(shopsData).find(([shopId, shopData]) => {
              const userEmail = user.email?.toLowerCase();
              const shopEmail = shopData.email?.toLowerCase();
              const ownerEmail = shopData.owner?.toLowerCase();
              const ownerEmailField = shopData.ownerEmail?.toLowerCase();
              
              return shopEmail === userEmail || 
                     ownerEmail === userEmail ||
                     ownerEmailField === userEmail;
            });
            
            if (matchingShop) {
              const [shopId, shopData] = matchingShop;
              setVendorShop({
                id: shopId,
                ...shopData
              });
            }
          }
        } catch (err) {
          console.error('Error fetching vendor shop:', err);
        }
      } else {
        setCurrentVendor(null);
        setVendorShop(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for orders notifications
  useEffect(() => {
    if (!vendorShop) return;

    const ordersRef = query(ref(db, 'orders'), orderByChild('timestamp'), limitToLast(50));
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        if (!snapshot.exists()) return;
        
        const ordersData = snapshot.val();
        const orderNotifications = [];
        
        Object.entries(ordersData).forEach(([orderId, orderData]) => {
          // Filter orders related to this vendor
          if (
            // Order is assigned to this vendor
            (orderData.vendor && (
              orderData.vendor.id === vendorShop.id ||
              orderData.vendor.email?.toLowerCase() === vendorShop.email?.toLowerCase()
            )) ||
            // Order is pending confirmation for this vendor
            (orderData.status === 'pending_vendor_confirmation' && orderData.assignedVendor && (
              orderData.assignedVendor.id === vendorShop.id ||
              orderData.assignedVendor.email?.toLowerCase() === vendorShop.email?.toLowerCase()
            ))
          ) {
            // Create notification based on order status
            const notificationData = createOrderNotification(orderId, orderData);
            if (notificationData) {
              orderNotifications.push(notificationData);
            }
          }
        });
        
        // Update notifications state with new order notifications
        setNotifications(prev => {
          // Filter out old order notifications and add new ones
          const filteredNotifications = prev.filter(n => n.type !== 'order');
          return [...filteredNotifications, ...orderNotifications].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
        
        // Calculate unread count
        setUnreadCount(prev => {
          const orderUnreadCount = orderNotifications.filter(n => !n.read).length;
          const otherUnreadCount = notifications.filter(n => n.type !== 'order' && !n.read).length;
          return orderUnreadCount + otherUnreadCount;
        });
        
      } catch (error) {
        console.error('Error processing order notifications:', error);
      }
    });

    return () => unsubscribe();
  }, [vendorShop]);

  // Listen for support request notifications
  useEffect(() => {
    if (!vendorShop || !currentVendor) return;

    const supportRef = query(ref(db, 'support_requests'), orderByChild('vendorId'), limitToLast(20));
    
    const unsubscribe = onValue(supportRef, (snapshot) => {
      try {
        if (!snapshot.exists()) return;
        
        const supportNotifications = [];
        snapshot.forEach((childSnapshot) => {
          const requestId = childSnapshot.key;
          const requestData = childSnapshot.val();
          
          // Only include notifications for this vendor
          if (requestData.vendorId === currentVendor.uid) {
            const notificationData = createSupportNotification(requestId, requestData);
            if (notificationData) {
              supportNotifications.push(notificationData);
            }
          }
        });
        
        // Update notifications state with new support notifications
        setNotifications(prev => {
          // Filter out old support notifications and add new ones
          const filteredNotifications = prev.filter(n => n.type !== 'support');
          return [...filteredNotifications, ...supportNotifications].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
        
        // Calculate unread count
        setUnreadCount(prev => {
          const supportUnreadCount = supportNotifications.filter(n => !n.read).length;
          const otherUnreadCount = notifications.filter(n => n.type !== 'support' && !n.read).length;
          return supportUnreadCount + otherUnreadCount;
        });
        
      } catch (error) {
        console.error('Error processing support notifications:', error);
      }
    });

    return () => unsubscribe();
  }, [vendorShop, currentVendor]);

  // Create order notification
  const createOrderNotification = (orderId, orderData) => {
    // Skip if no order data
    if (!orderData) return null;

    let title = '';
    let message = '';
    let action = '';
    
    switch (orderData.status) {
      case 'pending_vendor_confirmation':
        title = 'New Order';
        message = `You received a new order #${orderData.id?.slice(-6) || orderId.slice(-6)}${orderData.customer?.fullName ? ' from ' + orderData.customer.fullName : ''}`;
        action = 'new';
        break;
        
      case 'processing':
        title = 'Order Processing';
        message = `Order #${orderData.id?.slice(-6) || orderId.slice(-6)} is being processed`;
        action = 'processing';
        break;
        
      case 'prepared':
        title = 'Order Prepared';
        message = `Order #${orderData.id?.slice(-6) || orderId.slice(-6)} has been prepared`;
        action = 'prepared';
        break;
        
      case 'ready_for_pickup':
        title = 'Order Ready';
        message = `Order #${orderData.id?.slice(-6) || orderId.slice(-6)} is ready for pickup`;
        action = 'ready';
        break;
        
      case 'delivery_assigned':
        title = 'Delivery Assigned';
        message = `Delivery has been assigned for order #${orderData.id?.slice(-6) || orderId.slice(-6)}`;
        action = 'delivery_assigned';
        break;
        
      case 'out_for_delivery':
        title = 'Out for Delivery';
        message = `Order #${orderData.id?.slice(-6) || orderId.slice(-6)} is out for delivery`;
        action = 'out_for_delivery';
        break;
        
      case 'delivered':
        title = 'Order Delivered';
        message = `Order #${orderData.id?.slice(-6) || orderId.slice(-6)} has been delivered`;
        action = 'delivered';
        break;
        
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Order #${orderData.id?.slice(-6) || orderId.slice(-6)} has been cancelled`;
        action = 'cancelled';
        break;
        
      default:
        return null; // Skip other statuses
    }
    
    // Get the most relevant timestamp
    const timestamp = orderData.lastUpdated || 
                     (orderData.status === 'pending_vendor_confirmation' ? orderData.vendorAssignedAt : null) || 
                     orderData.orderDate || 
                     new Date().toISOString();
    
    // Calculate subtotal
    const subtotal = orderData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryCharge = orderData.deliveryCharge || 0;
    const totalAmount = subtotal + deliveryCharge;
    
    // Notification ID that's unique but consistent for updates to same order
    const notificationId = `order_${orderId}_${action}`;
    
    return {
      id: notificationId,
      type: 'order',
      title,
      message,
      action,
      orderId,
      timestamp,
      read: false, // Always mark as unread to start
      customerName: orderData.customer?.fullName || '',
      orderAmount: formatCurrency(totalAmount)
    };
  };

  // Create support notification
  const createSupportNotification = (requestId, requestData) => {
    // Skip if no request data
    if (!requestData) return null;
    
    let title = '';
    let message = '';
    let action = '';
    
    // Default to creating notification for pending requests
    if (requestData.status === 'pending') {
      title = 'Support Request Submitted';
      message = `Your ${getRequestTypeLabel(requestData.type)} request has been submitted and is pending review`;
      action = 'submitted';
    }
    // Create notification for approved requests
    else if (requestData.status === 'approved') {
      title = 'Support Request Approved';
      message = `Your ${getRequestTypeLabel(requestData.type)} request has been approved`;
      action = 'approved';
    }
    // Create notification for rejected requests
    else if (requestData.status === 'rejected') {
      title = 'Support Request Rejected';
      message = `Your ${getRequestTypeLabel(requestData.type)} request has been rejected`;
      action = 'rejected';
    }
    else {
      return null; // Skip other statuses
    }
    
    // Get the most relevant timestamp (updatedAt for status changes, createdAt for new)
    const timestamp = (action === 'submitted') ? 
                     requestData.createdAt : 
                     requestData.updatedAt || 
                     new Date().toISOString();
    
    // Notification ID that's unique but consistent for updates to same request
    const notificationId = `support_${requestId}_${action}`;
    
    return {
      id: notificationId,
      type: 'support',
      title,
      message,
      action,
      requestId,
      timestamp,
      read: false, // Always mark as unread to start
      requestType: requestData.type,
      adminComment: requestData.adminComment || null
    };
  };

  // Get request type label
  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'packaging': return 'Packaging';
      case 'schedule': return 'Vendor Schedule';
      case 'payment': return 'Payment';
      case 'payment_query': return 'Payment Query';
      default: return type;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    setUnreadCount(0);
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log('Audio play prevented by browser'));
    } catch (e) {
      console.log('Error playing notification sound');
    }
  };

  // Value to be provided to consumers
  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    playNotificationSound
  };

  return (
    <VendorNotificationsContext.Provider value={value}>
      {children}
    </VendorNotificationsContext.Provider>
  );
};