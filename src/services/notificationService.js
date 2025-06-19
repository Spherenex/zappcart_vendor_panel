// src/services/notificationService.js
import { ref, push, set } from 'firebase/database';
import { db } from '../services/firebase';

/**
 * Create a new notification in the database
 * @param {Object} notification - The notification object
 * @param {string} notification.type - Type of notification (order, support_ticket, vendor_request)
 * @param {string} notification.action - Action that triggered the notification (new, canceled, etc.)
 * @param {string} notification.message - The notification message
 * @param {string} notification.sourceId - ID of the source (order ID, support ticket ID, etc.)
 * @param {Object} notification.sourceData - Additional data related to the source
 * @param {string} notification.adminComment - Optional admin comment
 * @param {string} notification.priority - Priority level (normal, high)
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createNotification = async (notification) => {
  try {
    // Validate required fields
    if (!notification.type || !notification.message || !notification.sourceId) {
      console.error('Missing required notification fields');
      return null;
    }
    
    const notificationsRef = ref(db, 'notifications');
    
    const newNotification = {
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
      cleared: false
    };
    
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, newNotification);
    return newNotificationRef.key;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create an order notification
 * @param {string} orderId - The order ID
 * @param {string} action - The action (new, canceled, processed, delivered)
 * @param {Object} orderData - Order data
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createOrderNotification = async (orderId, action, orderData) => {
  // Validate order data
  if (!orderId || !action || !orderData) {
    console.error('Invalid order data for notification');
    return null;
  }
  
  // Validate that order has customer info
  if (!orderData.customer || !orderData.customer.fullName) {
    console.error('Order lacks customer information, skipping notification');
    return null;
  }
  
  let message = '';
  let priority = 'normal';
  
  const orderDisplayId = orderData.displayId || orderData.orderNumber || orderId;
  const customerName = orderData.customer?.fullName || 'Customer';
  const amount = orderData.totalAmount || orderData.amount || 0;
  
  switch (action) {
    case 'new':
      message = `New order #${orderDisplayId} placed by ${customerName} for ${formatCurrency(amount)}.`;
      break;
      
    case 'canceled':
      message = `Order #${orderDisplayId} has been canceled. Reason: ${orderData.cancellationReason || 'Not specified'}.`;
      priority = 'high';
      break;
      
    case 'processed':
      message = `Order #${orderDisplayId} is being processed by ${orderData.vendor?.name || 'vendor'}.`;
      break;
      
    case 'delivered':
      message = `Order #${orderDisplayId} has been delivered to ${customerName}.`;
      break;
      
    default:
      message = `Order #${orderDisplayId} has been updated.`;
  }
  
  return createNotification({
    type: 'order',
    action,
    message,
    sourceId: orderId,
    sourceData: {
      customerName: customerName,
      vendorName: orderData.vendor?.name || '',
      amount: amount,
      status: orderData.status || ''
    },
    priority
  });
};

/**
 * Create a support ticket notification
 * @param {string} ticketId - The ticket ID
 * @param {string} action - The action (new, replied, resolved, etc.)
 * @param {Object} ticketData - Ticket data
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createSupportTicketNotification = async (ticketId, action, ticketData) => {
  // Validate ticket data
  if (!ticketId || !ticketData || !ticketData.customerName) {
    console.error('Invalid support ticket data for notification');
    return null;
  }
  
  // Define high priority issues
  const highPriorityIssues = [
    'Product Quality Issue',
    'Order Delayed',
    'Incorrect Order'
  ];
  
  // Check if it's a high priority issue type
  const isHighPriorityIssue = highPriorityIssues.includes(ticketData.issueType);
  const priority = isHighPriorityIssue ? 'high' : 'normal';
  
  let message = '';
  let title = '';
  
  switch (action) {
    case 'new':
      title = 'New Support Ticket';
      message = `New support ticket from ${ticketData.customerName}: ${ticketData.issueType || 'General Issue'}.`;
      break;
      
    case 'replied':
      title = 'Support Ticket Updated';
      message = `Admin replied to your support ticket: ${ticketData.issueType || 'General Issue'}.`;
      break;
      
    case 'resolved':
      title = 'Support Ticket Resolved';
      message = `Your support ticket has been resolved: ${ticketData.issueType || 'General Issue'}.`;
      break;
      
    case 'approved':
      title = 'Support Request Approved';
      message = `Your request for ${ticketData.issueType || 'support'} has been approved.`;
      break;
      
    default:
      title = 'Support Ticket Update';
      message = `Your support ticket has been updated: ${ticketData.issueType || 'General Issue'}.`;
  }
  
  return createNotification({
    type: 'support_ticket',
    action,
    title,
    message,
    sourceId: ticketId,
    sourceData: {
      customerName: ticketData.customerName || '',
      issueType: ticketData.issueType || '',
      details: ticketData.customerNote || ticketData.details || ''
    },
    adminComment: ticketData.adminComment || ticketData.resolution || '',
    priority
  });
};

/**
 * Create a vendor request notification
 * @param {string} requestId - The request ID
 * @param {string} action - The action (new, approved, rejected, etc.)
 * @param {Object} requestData - Request data
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createVendorRequestNotification = async (requestId, action, requestData) => {
  // Validate request data
  if (!requestId || !requestData) {
    console.error('Invalid vendor request data for notification');
    return null;
  }
  
  const vendorName = requestData.vendorName || requestData.shopName || 'Vendor';
  const requestType = requestData.type || requestData.requestType || 'General Request';
  
  let message = '';
  let title = '';
  
  switch (action) {
    case 'new':
      title = 'New Vendor Request';
      message = `New vendor request from ${vendorName}: ${requestType}.`;
      break;
      
    case 'approved':
      title = 'Vendor Request Approved';
      message = `Vendor request from ${vendorName} has been approved: ${requestType}.`;
      break;
      
    case 'rejected':
      title = 'Vendor Request Rejected';
      message = `Vendor request from ${vendorName} has been rejected: ${requestType}.`;
      break;
      
    default:
      title = 'Vendor Request Update';
      message = `Vendor request from ${vendorName} has been updated: ${requestType}.`;
  }
  
  return createNotification({
    type: 'vendor_request',
    action,
    title,
    message,
    sourceId: requestId,
    sourceData: {
      vendorName: vendorName,
      requestType: requestType,
      details: requestData.details || requestData.description || ''
    },
    adminComment: requestData.adminComment || requestData.feedback || '',
    priority: 'normal'
  });
};

/**
 * Format currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount || 0);
};