




// // VendorOrdersPage.js - Updated with Porter API integration for delivery
// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, get } from 'firebase/database';
// import { onAuthStateChanged } from 'firebase/auth';
// import { db, auth } from '../services/firebase';
// import { 
//   Package, 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   RefreshCw, 
//   MapPin, 
//   Phone,
//   User,
//   Calendar,
//   TrendingUp,
//   Eye,
//   ChevronDown,
//   ChevronUp,
//   Star,
//   Filter,
//   Search,
//   Download,
//   Timer,
//   AlertTriangle,
//   ThumbsUp,
//   ThumbsDown,
//   Bell,
//   DollarSign,
//   Truck,
//   Navigation
// } from 'lucide-react';
// import './VendorOrdersPage.css';

// // Porter API configuration
// const PORTER_API_BASE_URL = 'https://pfe-apigw-uat.porter.in';
// const PORTER_API_KEY = '659d4aaf-3797-4186-b7c3-2c231f5d0e22';

// // Order Timer Component for Vendor
// const VendorOrderTimer = ({ order, onTimerExpire }) => {
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [isExpired, setIsExpired] = useState(false);

//   useEffect(() => {
//     if (!order || order.status !== 'pending_vendor_confirmation' || !order.vendorAssignedAt) {
//       setTimeRemaining(0);
//       return;
//     }

//     const assignedTime = new Date(order.vendorAssignedAt).getTime();
//     const expiryTime = assignedTime + (5 * 60 * 1000); // 5 minutes

//     const updateTimer = () => {
//       const now = new Date().getTime();
//       const remaining = Math.max(0, expiryTime - now);
//       setTimeRemaining(remaining);

//       if (remaining === 0 && !isExpired) {
//         setIsExpired(true);
//         if (onTimerExpire) {
//           onTimerExpire(order.id);
//         }
//       }
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);

//     return () => clearInterval(interval);
//   }, [order, onTimerExpire, isExpired]);

//   if (timeRemaining === 0 || order?.status !== 'pending_vendor_confirmation') return null;

//   const minutes = Math.floor(timeRemaining / 60000);
//   const seconds = Math.floor((timeRemaining % 60000) / 1000);
//   const isUrgent = timeRemaining < 60000; // Less than 1 minute

//   return (
//     <div className={`vendor-order-timer ${isUrgent ? 'urgent' : ''}`}>
//       <Timer size={14} />
//       <span>
//         Respond in: {minutes}:{seconds.toString().padStart(2, '0')}
//       </span>
//       {isUrgent && <Bell size={14} className="urgent-bell" />}
//     </div>
//   );
// };

// // Delivery Timer Component
// const DeliveryTimer = ({ order, onDeliveryComplete }) => {
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [isDeliveryComplete, setIsDeliveryComplete] = useState(false);

//   useEffect(() => {
//     if (!order || order.status !== 'out_for_delivery' || !order.outForDeliveryAt) {
//       setTimeRemaining(0);
//       return;
//     }

//     const deliveryStartTime = new Date(order.outForDeliveryAt).getTime();
//     const deliveryCompleteTime = deliveryStartTime + (30 * 60 * 1000); // 30 minutes

//     const updateTimer = () => {
//       const now = new Date().getTime();
//       const remaining = Math.max(0, deliveryCompleteTime - now);
//       setTimeRemaining(remaining);

//       if (remaining === 0 && !isDeliveryComplete) {
//         setIsDeliveryComplete(true);
//         if (onDeliveryComplete) {
//           onDeliveryComplete(order.id);
//         }
//       }
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);

//     return () => clearInterval(interval);
//   }, [order, onDeliveryComplete, isDeliveryComplete]);

//   if (timeRemaining === 0 || order?.status !== 'out_for_delivery') return null;

//   const minutes = Math.floor(timeRemaining / 60000);
//   const seconds = Math.floor((timeRemaining % 60000) / 1000);

//   return (
//     <div className="delivery-timer">
//       <Truck size={14} />
//       <span>
//         Estimated delivery: {minutes}:{seconds.toString().padStart(2, '0')}
//       </span>
//     </div>
//   );
// };

// // Order Card Component
// const OrderCard = ({ 
//   order, 
//   onAccept, 
//   onReject, 
//   onStatusUpdate, 
//   onViewDetails,
//   onAssignDelivery,
//   onDeliveryComplete,
//   onTimerExpire,
//   formatCurrency,
//   formatDate,
//   getStatusIcon,
//   getStatusText
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [updating, setUpdating] = useState(false);

//   const handleStatusUpdate = async (newStatus) => {
//     setUpdating(true);
//     try {
//       await onStatusUpdate(order.id, newStatus);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   return (
//     <div className={`order-card ${order.status} ${order.status === 'pending_vendor_confirmation' ? 'pending-confirmation' : ''}`}>
//       {/* Order Header */}
//       <div className="order-header">
//         <div className="order-id">
//           <Package size={16} />
//           <span>#{order.id.slice(-6).toUpperCase()}</span>
//         </div>
//         <div className="order-status">
//           {getStatusIcon(order.status)}
//           <span>{getStatusText(order.status)}</span>
//         </div>
//         {order.assignmentType && (
//           <div className="assignment-type">
//             <span className={`assignment-badge ${order.assignmentType}`}>
//               {order.assignmentType === 'auto' ? 'Auto-Assigned' : 'Manual'}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Timer for pending confirmation */}
//       {order.status === 'pending_vendor_confirmation' && (
//         <VendorOrderTimer 
//           order={order} 
//           onTimerExpire={() => onTimerExpire(order.id)}
//         />
//       )}

//       {/* Timer for out for delivery */}
//       {order.status === 'out_for_delivery' && (
//         <DeliveryTimer 
//           order={order} 
//           onDeliveryComplete={onDeliveryComplete}
//         />
//       )}

//       {/* Order Content */}
//       <div className="order-content">
//         <div className="customer-info">
//           <div className="customer-name">
//             <User size={14} />
//             <span>{order.customer?.fullName}</span>
//           </div>
//           <div className="customer-contact">
//             <Phone size={14} />
//             <span>{order.customer?.phone}</span>
//           </div>
//           <div className="customer-address" title={`${order.customer?.address}, ${order.customer?.city}`}>
//             <MapPin size={14} />
//             <span>{order.customer?.address?.substring(0, 30)}...</span>
//           </div>
//         </div>

//         <div className="order-summary">
//           <div className="items-preview">
//             <span className="items-count">{order.items?.length || 0} items</span>
//             <div className="items-list">
//               {order.items?.slice(0, 2).map((item, idx) => (
//                 <span key={idx} className="item-name">{item.name}</span>
//               ))}
//               {order.items?.length > 2 && (
//                 <span className="more-items">+{order.items.length - 2} more</span>
//               )}
//             </div>
//           </div>

//           <div className="order-total">
//             <span>{formatCurrency(order.totalAmount)}</span>
//           </div>
//         </div>

//         <div className="order-time">
//           <Calendar size={14} />
//           <span>{formatDate(order.orderDate)}</span>
//         </div>

//         {/* Delivery information if assigned */}
//         {order.delivery && (
//           <div className="delivery-info">
//             <div className="delivery-header">
//               <Truck size={14} />
//               <span>Delivery Info</span>
//             </div>
//             {order.delivery.partnerName && (
//               <div className="delivery-partner">
//                 <User size={12} />
//                 <span>{order.delivery.partnerName}</span>
//               </div>
//             )}
//             {order.delivery.trackingId && (
//               <div className="delivery-tracking">
//                 <span>Tracking ID: {order.delivery.trackingId}</span>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Expanded details */}
//         {isExpanded && (
//           <div className="order-details-expanded">
//             <div className="items-detail">
//               <h4>Order Items:</h4>
//               <table className="items-table-mini">
//                 <tbody>
//                   {order.items?.map((item, idx) => (
//                     <tr key={idx}>
//                       <td>{item.name}</td>
//                       <td>×{item.quantity}</td>
//                       <td>{formatCurrency(item.price * item.quantity)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {order.customer?.email && (
//               <div className="customer-email">
//                 <strong>Email:</strong> {order.customer.email}
//               </div>
//             )}

//             <div className="full-address">
//               <strong>Full Address:</strong> {order.customer?.address}, {order.customer?.city}, {order.customer?.pincode}
//             </div>

//             {order.specialInstructions && (
//               <div className="special-instructions">
//                 <strong>Special Instructions:</strong> {order.specialInstructions}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Order Actions */}
//       <div className="order-actions">
//         {order.status === 'pending_vendor_confirmation' && (
//           <div className="confirmation-actions">
//             <button 
//               className="accept-btn"
//               onClick={() => onAccept(order.id)}
//               disabled={updating}
//             >
//               <ThumbsUp size={16} />
//               Accept Order
//             </button>
//             <button 
//               className="reject-btn"
//               onClick={() => onReject(order.id)}
//               disabled={updating}
//             >
//               <ThumbsDown size={16} />
//               Reject
//             </button>
//           </div>
//         )}

//         {order.status === 'processing' && (
//           <button 
//             className="update-btn"
//             onClick={() => handleStatusUpdate('prepared')}
//             disabled={updating}
//           >
//             {updating ? <RefreshCw size={16} className="spinning" /> : <CheckCircle size={16} />}
//             Mark as Prepared
//           </button>
//         )}

//         {order.status === 'prepared' && (
//           <button 
//             className="update-btn"
//             onClick={() => handleStatusUpdate('ready_for_pickup')}
//             disabled={updating}
//           >
//             {updating ? <RefreshCw size={16} className="spinning" /> : <Package size={16} />}
//             Ready for Pickup
//           </button>
//         )}

//         {order.status === 'ready_for_pickup' && (
//           <button 
//             className="assign-delivery-btn"
//             onClick={() => onAssignDelivery(order.id)}
//             disabled={updating}
//           >
//             {updating ? <RefreshCw size={16} className="spinning" /> : <Truck size={16} />}
//             Assign Delivery
//           </button>
//         )}

//         {order.delivery && order.status === 'delivery_assigned' && (
//           <button 
//             className="out-for-delivery-btn"
//             onClick={() => handleStatusUpdate('out_for_delivery')}
//             disabled={updating}
//           >
//             {updating ? <RefreshCw size={16} className="spinning" /> : <Navigation size={16} />}
//             Mark Out for Delivery
//           </button>
//         )}

//         <div className="secondary-actions">
//           <button 
//             className="view-btn"
//             onClick={() => onViewDetails(order.id)}
//           >
//             <Eye size={16} />
//             Details
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const VendorOrdersPage = () => {
//   // State management
//   const [currentVendor, setCurrentVendor] = useState(null);
//   const [vendorShop, setVendorShop] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   // Filter states
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateFilter, setDateFilter] = useState('all');

//   // Statistics
//   const [orderStats, setOrderStats] = useState({
//     total: 0,
//     pending: 0,
//     processing: 0,
//     completed: 0,
//     revenue: 0,
//     pendingConfirmation: 0,
//     outForDelivery: 0
//   });

//   // Notifications
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // Get current vendor information
//   useEffect(() => {
//     const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentVendor(user);

//         try {
//           const shopsRef = ref(db, 'shops');
//           const snapshot = await get(shopsRef);

//           if (snapshot.exists()) {
//             const shopsData = snapshot.val();

//             // Enhanced vendor matching
//             const matchingShop = Object.entries(shopsData).find(([shopId, shopData]) => {
//               const userEmail = user.email?.toLowerCase();
//               const shopEmail = shopData.email?.toLowerCase();
//               const ownerEmail = shopData.owner?.toLowerCase();
//               const ownerEmailField = shopData.ownerEmail?.toLowerCase();

//               return shopEmail === userEmail || 
//                      ownerEmail === userEmail ||
//                      ownerEmailField === userEmail;
//             });

//             if (matchingShop) {
//               const [shopId, shopData] = matchingShop;
//               setVendorShop({
//                 id: shopId,
//                 ...shopData
//               });
//             } else {
//               setError(`No shop found for email: ${user.email}. Please contact support.`);
//             }
//           } else {
//             setError('No shops data found in database.');
//           }
//         } catch (err) {
//           console.error('Error fetching vendor shop:', err);
//           setError('Failed to load vendor information.');
//         }
//       } else {
//         setCurrentVendor(null);
//         setVendorShop(null);
//         setError('Please log in to view orders.');
//       }
//       setLoading(false);
//     });

//     return () => unsubscribeAuth();
//   }, []);

//   // Fetch orders for this vendor
//   useEffect(() => {
//     if (!vendorShop) return;

//     setLoading(true);
//     const ordersRef = ref(db, 'orders');

//     const unsubscribe = onValue(ordersRef, (snapshot) => {
//       try {
//         if (!snapshot.exists()) {
//           setOrders([]);
//           setLoading(false);
//           return;
//         }

//         const data = snapshot.val();
//         const ordersArray = Object.keys(data).map(key => ({
//           id: key,
//           ...data[key],
//           timeline: data[key].timeline || [
//             { 
//               status: 'order_placed', 
//               time: data[key].orderDate || new Date().toISOString(),
//               note: 'Order placed successfully' 
//             }
//           ]
//         }));

//         // Enhanced order filtering for vendor
//         const vendorOrders = ordersArray.filter(order => {
//           // Check if order is assigned to this vendor
//           if (order.vendor && (
//             order.vendor.id === vendorShop.id ||
//             order.vendor.email?.toLowerCase() === vendorShop.email?.toLowerCase()
//           )) {
//             return true;
//           }

//           // Check if order is pending confirmation for this vendor
//           if (order.status === 'pending_vendor_confirmation' && order.assignedVendor && (
//             order.assignedVendor.id === vendorShop.id ||
//             order.assignedVendor.email?.toLowerCase() === vendorShop.email?.toLowerCase()
//           )) {
//             return true;
//           }

//           return false;
//         });

//         // Sort orders: pending confirmation first, then by date
//         vendorOrders.sort((a, b) => {
//           if (a.status === 'pending_vendor_confirmation' && b.status !== 'pending_vendor_confirmation') {
//             return -1;
//           }
//           if (b.status === 'pending_vendor_confirmation' && a.status !== 'pending_vendor_confirmation') {
//             return 1;
//           }
//           return new Date(b.orderDate) - new Date(a.orderDate);
//         });

//         setOrders(vendorOrders);
//         calculateStats(vendorOrders);

//         // Check for new pending confirmations
//         const pendingConfirmations = vendorOrders.filter(o => o.status === 'pending_vendor_confirmation');
//         if (pendingConfirmations.length > 0) {
//           setUnreadCount(pendingConfirmations.length);

//           // Play notification sound for new orders
//           if (pendingConfirmations.length > 0) {
//             try {
//               const audio = new Audio('/notification-sound.mp3');
//               audio.play().catch(e => console.log('Audio play prevented by browser'));
//             } catch (e) {
//               console.log('Error playing notification sound');
//             }
//           }
//         }

//         // Check for orders that should be automatically marked as delivered
//         vendorOrders.forEach(order => {
//           if (order.status === 'out_for_delivery' && order.outForDeliveryAt) {
//             const outForDeliveryTime = new Date(order.outForDeliveryAt).getTime();
//             const currentTime = new Date().getTime();
//             const diffInMinutes = (currentTime - outForDeliveryTime) / (1000 * 60);

//             if (diffInMinutes >= 30) {
//               handleDeliveryComplete(order.id);
//             }
//           }
//         });

//         setLoading(false);
//       } catch (err) {
//         console.error('Error processing orders:', err);
//         setError('Failed to load orders. Please refresh the page.');
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [vendorShop]);

//   // Calculate order statistics
//   const calculateStats = (ordersList) => {
//     const stats = {
//       total: ordersList.length,
//       pending: 0,
//       processing: 0,
//       completed: 0,
//       revenue: 0,
//       pendingConfirmation: 0,
//       outForDelivery: 0
//     };

//     ordersList.forEach(order => {
//       switch (order.status) {
//         case 'pending_vendor_confirmation':
//           stats.pendingConfirmation++;
//           break;
//         case 'processing':
//         case 'prepared':
//         case 'ready_for_pickup':
//         case 'delivery_assigned':
//           stats.processing++;
//           break;
//         case 'out_for_delivery':
//           stats.outForDelivery++;
//           break;
//         case 'delivered':
//           stats.completed++;
//           stats.revenue += order.totalAmount || 0;
//           break;
//         default:
//           break;
//       }
//     });

//     setOrderStats(stats);
//   };

//   // Handle order acceptance
//   const handleAcceptOrder = async (orderId) => {
//     try {
//       const orderRef = ref(db, `orders/${orderId}`);
//       const snapshot = await get(orderRef);

//       if (!snapshot.exists()) {
//         throw new Error('Order not found');
//       }

//       const orderData = snapshot.val();

//       const updatedTimeline = [
//         ...(orderData.timeline || []),
//         {
//           status: 'vendor_confirmed',
//           time: new Date().toISOString(),
//           note: `Order confirmed by ${vendorShop.name}`
//         },
//         {
//           status: 'processing',
//           time: new Date().toISOString(),
//           note: 'Order being prepared'
//         }
//       ];

//       await update(orderRef, {
//         status: 'processing',
//         vendor: {
//           id: vendorShop.id,
//           name: vendorShop.name,
//           email: vendorShop.email,
//           phone: vendorShop.phone,
//           rating: vendorShop.rating,
//           location: vendorShop.location,
//           category: vendorShop.category,
//           status: vendorShop.status
//         },
//         assignedVendor: null, // Clear the assignment since it's now confirmed
//         confirmedAt: new Date().toISOString(),
//         timeline: updatedTimeline
//       });

//       // Show success notification
//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'success',
//         message: `Order #${orderId.slice(-6)} accepted successfully!`,
//         timestamp: new Date().toISOString()
//       }]);

//     } catch (error) {
//       console.error('Error accepting order:', error);
//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'error',
//         message: `Failed to accept order: ${error.message}`,
//         timestamp: new Date().toISOString()
//       }]);
//     }
//   };

//   // Handle order rejection
//   const handleRejectOrder = async (orderId) => {
//     const confirmed = window.confirm('Are you sure you want to reject this order? It will be reassigned to another vendor.');
//     if (!confirmed) return;

//     try {
//       const orderRef = ref(db, `orders/${orderId}`);
//       const snapshot = await get(orderRef);

//       if (!snapshot.exists()) {
//         throw new Error('Order not found');
//       }

//       const orderData = snapshot.val();

//       const updatedTimeline = [
//         ...(orderData.timeline || []),
//         {
//           status: 'vendor_rejected',
//           time: new Date().toISOString(),
//           note: `Order rejected by ${vendorShop.name}`
//         }
//       ];

//       // Update to 'pending' instead of 'pending_manual_assignment' to align with admin panel
//       await update(orderRef, {
//         status: 'pending',
//         assignedVendor: null,
//         rejectedBy: orderData.rejectedBy 
//           ? [...orderData.rejectedBy, vendorShop.id] 
//           : [vendorShop.id],
//         rejectedAt: new Date().toISOString(),
//         timeline: updatedTimeline
//       });

//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'info',
//         message: `Order #${orderId.slice(-6)} rejected. It will be reassigned.`,
//         timestamp: new Date().toISOString()
//       }]);

//     } catch (error) {
//       console.error('Error rejecting order:', error);
//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'error',
//         message: `Failed to reject order: ${error.message}`,
//         timestamp: new Date().toISOString()
//       }]);
//     }
//   };

//   // Handle timer expiration (auto-reject)
//   const handleTimerExpire = async (orderId) => {
//     console.log(`Timer expired for order ${orderId}. Auto-rejecting.`);

//     try {
//       const orderRef = ref(db, `orders/${orderId}`);
//       const snapshot = await get(orderRef);

//       if (!snapshot.exists()) {
//         return;
//       }

//       const orderData = snapshot.val();

//       // Only auto-reject if the order is still in pending_vendor_confirmation state
//       if (orderData.status !== 'pending_vendor_confirmation') {
//         return;
//       }

//       const updatedTimeline = [
//         ...(orderData.timeline || []),
//         {
//           status: 'vendor_auto_rejected',
//           time: new Date().toISOString(),
//           note: `Order automatically rejected due to no response from ${vendorShop.name} within 5 minutes`
//         }
//       ];

//       await update(orderRef, {
//         status: 'pending',
//         assignedVendor: null,
//         rejectedBy: orderData.rejectedBy 
//           ? [...orderData.rejectedBy, vendorShop.id] 
//           : [vendorShop.id],
//         rejectedAt: new Date().toISOString(),
//         timeline: updatedTimeline
//       });

//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'warning',
//         message: `Order #${orderId.slice(-6)} was auto-rejected due to timeout.`,
//         timestamp: new Date().toISOString()
//       }]);

//     } catch (error) {
//       console.error('Error auto-rejecting order:', error);
//     }
//   };

//   // Handle order status update
//   const handleStatusUpdate = async (orderId, newStatus) => {
//     try {
//       const orderRef = ref(db, `orders/${orderId}`);
//       const snapshot = await get(orderRef);

//       if (!snapshot.exists()) {
//         throw new Error('Order not found');
//       }

//       const orderData = snapshot.val();
//       const statusMessages = {
//         'processing': 'Order is being prepared',
//         'prepared': 'Order is ready for pickup',
//         'ready_for_pickup': 'Order ready for delivery pickup',
//         'out_for_delivery': 'Order is out for delivery',
//         'delivered': 'Order has been delivered'
//       };

//       const updatedTimeline = [
//         ...(orderData.timeline || []),
//         {
//           status: newStatus,
//           time: new Date().toISOString(),
//           note: statusMessages[newStatus] || `Status updated to ${newStatus}`
//         }
//       ];

//       const updateData = {
//         status: newStatus,
//         timeline: updatedTimeline,
//         lastUpdated: new Date().toISOString()
//       };

//       // Add timestamp for out_for_delivery status
//       if (newStatus === 'out_for_delivery') {
//         updateData.outForDeliveryAt = new Date().toISOString();
//       }

//       await update(orderRef, updateData);

//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'success',
//         message: `Order status updated to ${getStatusText(newStatus)}`,
//         timestamp: new Date().toISOString()
//       }]);

//     } catch (error) {
//       console.error('Error updating order status:', error);
//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'error',
//         message: `Failed to update order: ${error.message}`,
//         timestamp: new Date().toISOString()
//       }]);
//     }
//   };

//   // Handle delivery assignment via Porter API
//   const handleAssignDelivery = async (orderId) => {
//     try {
//       // First, get the order details
//       const orderRef = ref(db, `orders/${orderId}`);
//       const snapshot = await get(orderRef);

//       if (!snapshot.exists()) {
//         throw new Error('Order not found');
//       }

//       const orderData = snapshot.val();

//       // Set status to "assigning_delivery" to prevent multiple assignments
//       await update(orderRef, {
//         status: 'assigning_delivery'
//       });

//       // Show loading notification
//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'info',
//         message: `Assigning delivery for Order #${orderId.slice(-6)}...`,
//         timestamp: new Date().toISOString()
//       }]);

//       // Generate a unique request ID for Porter
//       const requestId = `order_${orderId}_${Date.now()}`;

//       // Get vendor and customer addresses
//       const vendorAddress = orderData.vendor?.location || {};
//       const customerAddress = orderData.customer || {};

//       // Format data for Porter API based on their required structure
//       const porterRequestData = {
//         request_id: requestId,
//         delivery_instructions: {
//           instructions_list: [
//             {
//               type: "text",
//               description: `Food delivery for order #${orderId.slice(-6)}`
//             }
//           ]
//         },
//         pickup_details: {
//           address: {
//             apartment_address: vendorAddress.buildingName || vendorShop.name || "",
//             street_address1: vendorAddress.address || vendorShop.location?.address || "",
//             street_address2: "",
//             landmark: vendorAddress.landmark || "",
//             city: vendorAddress.city || "Bengaluru",
//             state: vendorAddress.state || "Karnataka",
//             pincode: vendorAddress.pincode || "560029",
//             country: "India",
//             lat: vendorAddress.lat || 12.9165757,
//             lng: vendorAddress.lng || 77.6101163,
//             contact_details: {
//               name: vendorShop.name || "Restaurant",
//               phone_number: `+91${vendorShop.phone || "9901728049"}`.replace(/\\+91\\+91/, '+91')
//             }
//           }
//         },
//         drop_details: {
//           address: {
//             apartment_address: customerAddress.flatNo || customerAddress.buildingName || "",
//             street_address1: customerAddress.address || "",
//             street_address2: "",
//             landmark: customerAddress.landmark || "",
//             city: customerAddress.city || "Bengaluru",
//             state: customerAddress.state || "Karnataka",
//             pincode: customerAddress.pincode || "560029",
//             country: "India",
//             lat: customerAddress.lat || 12.9165757,
//             lng: customerAddress.lng || 77.6101163,
//             contact_details: {
//               name: customerAddress.fullName || "Customer",
//               phone_number: `+91${customerAddress.phone || ""}`.replace(/\\+91\\+91/, '+91')
//             }
//           }
//         }
//       };

//       // Due to CORS restrictions in browser environment, we use a proxy or backend
//       // This is a simulation that would be replaced with actual API calls in production
//       const sendPorterRequest = async () => {
//         try {
//           // In production, this would be a call to your backend API that handles Porter requests
//           // For now, we're simulating the response

//           // Simulate API call delay
//           await new Promise(resolve => setTimeout(resolve, 2000));

//           // Simulate Porter API response based on their documentation
//           return {
//             success: true,
//             data: {
//               order_id: `CRN${Math.floor(10000000 + Math.random() * 90000000)}`,
//               status: "CONFIRMED",
//               delivery_partner: {
//                 name: "Rahul Kumar",
//                 phone: "9876543210",
//                 eta_pickup: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
//                 eta_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString()
//               },
//               tracking_url: `https://track.porter.in/track/${Math.floor(10000000 + Math.random() * 90000000)}`
//             }
//           };

//           /* PRODUCTION CODE - Uncomment and use with backend
//           // Make API call to your backend which will handle Porter API
//           const response = await fetch('/api/assign-delivery', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//               orderId,
//               porterRequestData
//             })
//           });

//           if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to create delivery with Porter');
//           }

//           return await response.json();
//           */
//         } catch (error) {
//           console.error('Error with Porter API request:', error);
//           throw new Error(`Failed to create delivery: ${error.message}`);
//         }
//       };

//       // Call Porter API (via simulation or backend)
//       const porterResponse = await sendPorterRequest();

//       if (!porterResponse.success) {
//         throw new Error('Failed to create delivery with Porter');
//       }

//       // Extract delivery information from response
//       const deliveryInfo = porterResponse.data;

//       // Update order with delivery information
//       const updatedTimeline = [
//         ...(orderData.timeline || []),
//         {
//           status: 'delivery_assigned',
//           time: new Date().toISOString(),
//           note: `Delivery assigned to ${deliveryInfo.delivery_partner.name} - Tracking ID: ${deliveryInfo.order_id}`
//         }
//       ];

//       await update(orderRef, {
//         status: 'delivery_assigned',
//         delivery: {
//           provider: 'Porter',
//           trackingId: deliveryInfo.order_id,
//           partnerName: deliveryInfo.delivery_partner.name,
//           partnerPhone: deliveryInfo.delivery_partner.phone,
//           estimatedPickupTime: deliveryInfo.delivery_partner.eta_pickup,
//           estimatedDeliveryTime: deliveryInfo.delivery_partner.eta_delivery,
//           assignedAt: new Date().toISOString(),
//           trackingUrl: deliveryInfo.tracking_url,
//           porterOrderDetails: deliveryInfo // Store full Porter response for reference
//         },
//         timeline: updatedTimeline
//       });

//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'success',
//         message: `Delivery assigned to ${deliveryInfo.delivery_partner.name} for Order #${orderId.slice(-6)}!`,
//         timestamp: new Date().toISOString()
//       }]);

//     } catch (error) {
//       console.error('Error assigning delivery:', error);

//       // Revert status if assignment fails
//       const orderRef = ref(db, `orders/${orderId}`);
//       await update(orderRef, {
//         status: 'ready_for_pickup'
//       });

//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'error',
//         message: `Failed to assign delivery: ${error.message}`,
//         timestamp: new Date().toISOString()
//       }]);
//     }
//   };

//   // Handle delivery completion (automatically after 30 minutes)
//   const handleDeliveryComplete = async (orderId) => {
//     try {
//       const orderRef = ref(db, `orders/${orderId}`);
//       const snapshot = await get(orderRef);

//       if (!snapshot.exists()) {
//         return;
//       }

//       const orderData = snapshot.val();

//       // Skip if already delivered
//       if (orderData.status === 'delivered') {
//         return;
//       }

//       const updatedTimeline = [
//         ...(orderData.timeline || []),
//         {
//           status: 'delivered',
//           time: new Date().toISOString(),
//           note: 'Order delivered successfully'
//         }
//       ];

//       await update(orderRef, {
//         status: 'delivered',
//         deliveredAt: new Date().toISOString(),
//         timeline: updatedTimeline
//       });

//       setNotifications(prev => [...prev, {
//         id: Date.now(),
//         type: 'success',
//         message: `Order #${orderId.slice(-6)} marked as delivered!`,
//         timestamp: new Date().toISOString()
//       }]);

//     } catch (error) {
//       console.error('Error completing delivery:', error);
//     }
//   };

//   // Filter orders based on current filters
//   useEffect(() => {
//     let filtered = [...orders];

//     // Status filter
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(order => order.status === statusFilter);
//     }

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(order => 
//         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (order.customer?.fullName && order.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (order.customer?.phone && order.customer.phone.includes(searchTerm))
//       );
//     }

//     // Date filter
//     if (dateFilter !== 'all') {
//       const now = new Date();
//       const today = new Date(now.setHours(0, 0, 0, 0));

//       filtered = filtered.filter(order => {
//         const orderDate = new Date(order.orderDate);

//         switch (dateFilter) {
//           case 'today':
//             return orderDate >= today;
//           case 'yesterday':
//             const yesterday = new Date(today);
//             yesterday.setDate(yesterday.getDate() - 1);
//             return orderDate >= yesterday && orderDate < today;
//           case 'week':
//             const weekAgo = new Date(today);
//             weekAgo.setDate(weekAgo.getDate() - 7);
//             return orderDate >= weekAgo;
//           default:
//             return true;
//         }
//       });
//     }

//     setFilteredOrders(filtered);
//   }, [orders, statusFilter, searchTerm, dateFilter]);

//   // Utility functions
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2
//     }).format(amount);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'pending_vendor_confirmation': return <Clock className="status-icon pending" />;
//       case 'processing': return <RefreshCw className="status-icon processing" />;
//       case 'prepared': return <CheckCircle className="status-icon prepared" />;
//       case 'ready_for_pickup': return <Package className="status-icon ready" />;
//       case 'delivery_assigned': return <Truck className="status-icon delivery-assigned" />;
//       case 'out_for_delivery': return <Truck className="status-icon delivery" />;
//       case 'delivered': return <CheckCircle className="status-icon delivered" />;
//       case 'cancelled': return <XCircle className="status-icon cancelled" />;
//       default: return <Clock className="status-icon" />;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case 'pending_vendor_confirmation': return 'Awaiting Your Confirmation';
//       case 'processing': return 'Processing';
//       case 'prepared': return 'Prepared';
//       case 'ready_for_pickup': return 'Ready for Pickup';
//       case 'delivery_assigned': return 'Delivery Assigned';
//       case 'out_for_delivery': return 'Out for Delivery';
//       case 'delivered': return 'Delivered';
//       case 'cancelled': return 'Cancelled';
//       default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="vendor-orders-page">
//         <div className="loading-container">
//           <RefreshCw className="loading-spinner" />
//           <p>Loading your orders...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="vendor-orders-page">
//         <div className="error-container">
//           <XCircle className="error-icon" />
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()}>Retry</button>
//         </div>
//       </div>
//     );
//   }

//   // No vendor state
//   if (!currentVendor || !vendorShop) {
//     return (
//       <div className="vendor-orders-page">
//         <div className="error-container">
//           <User className="error-icon" />
//           <p>Please log in to access your vendor dashboard.</p>
//         </div>
//       </div>
//     );
//   }

//   // Order details view
//   if (selectedOrder) {
//     const order = orders.find(o => o.id === selectedOrder);

//     if (!order) {
//       return (
//         <div className="vendor-orders-page">
//           <div className="error-container">
//             <p>Order not found</p>
//             <button onClick={() => setSelectedOrder(null)}>Back to Orders</button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="vendor-orders-page">
//         <div className="order-detail-header">
//           <button 
//             className="back-button"
//             onClick={() => setSelectedOrder(null)}
//           >
//             ← Back to Orders
//           </button>
//           <h1>Order Details - #{order.id.slice(-6).toUpperCase()}</h1>
//           <div className="order-status-badge">
//             {getStatusIcon(order.status)}
//             <span>{getStatusText(order.status)}</span>
//           </div>
//         </div>

//         {order.status === 'pending_vendor_confirmation' && (
//           <VendorOrderTimer 
//             order={order} 
//             onTimerExpire={() => handleTimerExpire(order.id)}
//           />
//         )}

//         {order.status === 'out_for_delivery' && (
//           <DeliveryTimer 
//             order={order} 
//             onDeliveryComplete={handleDeliveryComplete}
//           />
//         )}

//         <div className="order-detail-container">
//           <div className="order-detail-grid">
//             {/* Customer Information */}
//             <div className="detail-card">
//               <h3><User size={20} /> Customer Information</h3>
//               <div className="detail-content">
//                 <p><strong>Name:</strong> {order.customer?.fullName}</p>
//                 <p><strong>Phone:</strong> {order.customer?.phone}</p>
//                 {order.customer?.email && <p><strong>Email:</strong> {order.customer.email}</p>}
//                 <p><strong>Address:</strong> {order.customer?.address}, {order.customer?.city}, {order.customer?.pincode}</p>
//                 <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
//               </div>
//             </div>

//             {/* Order Items */}
//             <div className="detail-card items-card">
//               <h3><Package size={20} /> Order Items</h3>
//               <div className="items-list">
//                 {order.items?.map((item, idx) => (
//                   <div key={idx} className="item-row">
//                     <span className="item-name">{item.name}</span>
//                     <span className="item-quantity">×{item.quantity}</span>
//                     <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
//                   </div>
//                 ))}
//                 <div className="total-row">
//                   <span><strong>Total: {formatCurrency(order.totalAmount)}</strong></span>
//                 </div>
//               </div>
//             </div>

//             {/* Assignment Info */}
//             {order.assignmentType && (
//               <div className="detail-card assignment-card">
//                 <h3>Assignment Information</h3>
//                 <div className="detail-content">
//                   <p><strong>Assignment Type:</strong> {order.assignmentType === 'auto' ? 'Automatic' : 'Manual'}</p>
//                   {order.vendorAssignedAt && (
//                     <p><strong>Assigned At:</strong> {formatDate(order.vendorAssignedAt)}</p>
//                   )}
//                   {order.matchScore && (
//                     <p><strong>Match Score:</strong> {order.matchScore}%</p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Delivery Information */}
//             {order.delivery && (
//               <div className="detail-card delivery-card">
//                 <h3><Truck size={20} /> Delivery Information</h3>
//                 <div className="detail-content">
//                   <p><strong>Provider:</strong> {order.delivery.provider}</p>
//                   <p><strong>Tracking ID:</strong> {order.delivery.trackingId}</p>
//                   {order.delivery.partnerName && (
//                     <p><strong>Delivery Partner:</strong> {order.delivery.partnerName}</p>
//                   )}
//                   {order.delivery.partnerPhone && (
//                     <p><strong>Partner Phone:</strong> {order.delivery.partnerPhone}</p>
//                   )}
//                   {order.delivery.estimatedDeliveryTime && (
//                     <p><strong>Estimated Delivery:</strong> {formatDate(order.delivery.estimatedDeliveryTime)}</p>
//                   )}
//                   {order.delivery.trackingUrl && (
//                     <p>
//                       <strong>Tracking Link:</strong> 
//                       <a href={order.delivery.trackingUrl} target="_blank" rel="noopener noreferrer" className="tracking-link">
//                         Open Tracking
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Order Timeline */}
//             <div className="detail-card timeline-card">
//               <h3><Clock size={20} /> Order Timeline</h3>
//               <div className="timeline">
//                 {order.timeline?.map((event, idx) => (
//                   <div key={idx} className="timeline-item">
//                     <div className="timeline-marker"></div>
//                     <div className="timeline-content">
//                       <div className="timeline-status">{getStatusText(event.status)}</div>
//                       <div className="timeline-time">{formatDate(event.time)}</div>
//                       {event.note && <div className="timeline-note">{event.note}</div>}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="order-actions-detail">
//             {order.status === 'pending_vendor_confirmation' && (
//               <div className="confirmation-actions-detail">
//                 <button 
//                   className="accept-button-large"
//                   onClick={() => handleAcceptOrder(order.id)}
//                 >
//                   <ThumbsUp size={20} />
//                   Accept This Order
//                 </button>
//                 <button 
//                   className="reject-button-large"
//                   onClick={() => handleRejectOrder(order.id)}
//                 >
//                   <ThumbsDown size={20} />
//                   Reject Order
//                 </button>
//               </div>
//             )}

//             {order.status === 'processing' && (
//               <button 
//                 className="update-button-large"
//                 onClick={() => handleStatusUpdate(order.id, 'prepared')}
//               >
//                 <CheckCircle size={20} />
//                 Mark as Prepared
//               </button>
//             )}

//             {order.status === 'prepared' && (
//               <button 
//                 className="update-button-large"
//                 onClick={() => handleStatusUpdate(order.id, 'ready_for_pickup')}
//               >
//                 <Package size={20} />
//                 Ready for Pickup
//               </button>
//             )}

//             {order.status === 'ready_for_pickup' && (
//               <button 
//                 className="update-button-large"
//                 onClick={() => handleAssignDelivery(order.id)}
//               >
//                 <Truck size={20} />
//                 Assign Delivery
//               </button>
//             )}

//             {order.delivery && order.status === 'delivery_assigned' && (
//               <button 
//                 className="update-button-large"
//                 onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
//               >
//                 <Navigation size={20} />
//                 Mark Out for Delivery
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main orders list view
//   return (
//     <div className="vendor-orders-page">
//       {/* Header */}
//       <div className="page-header">
//         <div className="header-content">
//           <h1>My Orders</h1>
//           <p>Welcome back, <strong>{vendorShop.name}</strong></p>
//           {unreadCount > 0 && (
//             <div className="notification-badge">
//               <Bell size={16} />
//               <span>{unreadCount} pending confirmation</span>
//             </div>
//           )}
//         </div>
//         <div className="header-buttons">
//           <button 
//             className="refresh-button"
//             onClick={() => window.location.reload()}
//           >
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Notifications */}
//       {notifications.length > 0 && (
//         <div className="notifications-container">
//           {notifications.slice(-3).map(notification => (
//             <div key={notification.id} className={`notification ${notification.type}`}>
//               <span>{notification.message}</span>
//               <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
//                 <XCircle size={14} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Statistics Cards */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon">
//             <Package size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{orderStats.total}</div>
//             <div className="stat-label">Total Orders</div>
//           </div>
//         </div>

//         <div className="stat-card urgent">
//           <div className="stat-icon">
//             <AlertTriangle size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{orderStats.pendingConfirmation}</div>
//             <div className="stat-label">Needs Confirmation</div>
//           </div>
//         </div>

//         <div className="stat-card processing">
//           <div className="stat-icon">
//             <RefreshCw size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{orderStats.processing}</div>
//             <div className="stat-label">In Progress</div>
//           </div>
//         </div>

//         <div className="stat-card delivery">
//           <div className="stat-icon">
//             <Truck size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{orderStats.outForDelivery}</div>
//             <div className="stat-label">Out for Delivery</div>
//           </div>
//         </div>

//         <div className="stat-card completed">
//           <div className="stat-icon">
//             <TrendingUp size={24} />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{formatCurrency(orderStats.revenue)}</div>
//             <div className="stat-label">Revenue</div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="filters-section">
//         <div className="search-container">
//           <Search size={16} />
//           <input
//             type="text"
//             placeholder="Search orders by ID, customer name, or phone..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="filter-controls">
//           <select 
//             value={statusFilter} 
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="all">All Status</option>
//             <option value="pending_vendor_confirmation">Pending Confirmation</option>
//             <option value="processing">Processing</option>
//             <option value="prepared">Prepared</option>
//             <option value="ready_for_pickup">Ready for Pickup</option>
//             <option value="delivery_assigned">Delivery Assigned</option>
//             <option value="out_for_delivery">Out for Delivery</option>
//             <option value="delivered">Delivered</option>
//           </select>

//           <select 
//             value={dateFilter} 
//             onChange={(e) => setDateFilter(e.target.value)}
//           >
//             <option value="all">All Time</option>
//             <option value="today">Today</option>
//             <option value="yesterday">Yesterday</option>
//             <option value="week">This Week</option>
//           </select>
//         </div>
//       </div>

//       {/* Orders List */}
//       <div className="orders-section">
//         {filteredOrders.length === 0 ? (
//           <div className="empty-state">
//             <Package size={48} />
//             <h3>No Orders Found</h3>
//             <p>
//               {statusFilter === 'all' 
//                 ? "No orders found for your shop." 
//                 : `No orders found with status: ${getStatusText(statusFilter)}`
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="orders-grid">
//             {filteredOrders.map(order => (
//               <OrderCard
//                 key={order.id}
//                 order={order}
//                 onAccept={handleAcceptOrder}
//                 onReject={handleRejectOrder}
//                 onStatusUpdate={handleStatusUpdate}
//                 onViewDetails={setSelectedOrder}
//                 onAssignDelivery={handleAssignDelivery}
//                 onDeliveryComplete={handleDeliveryComplete}
//                 onTimerExpire={handleTimerExpire}
//                 formatCurrency={formatCurrency}
//                 formatDate={formatDate}
//                 getStatusIcon={getStatusIcon}
//                 getStatusText={getStatusText}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VendorOrdersPage;




// VendorOrdersPage.js - Updated with Porter API integration for delivery
import React, { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Phone,
  User,
  Calendar,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
  Search,
  Download,
  Timer,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Bell,
  DollarSign,
  Truck,
  Navigation
} from 'lucide-react';
import './VendorOrdersPage.css';
// Import the new OrderItems component
import OrderItems from '../components/OrderItems';

// Porter API configuration
const PORTER_API_BASE_URL = 'https://pfe-apigw-uat.porter.in';
const PORTER_API_KEY = '659d4aaf-3797-4186-b7c3-2c231f5d0e22';

// Order Timer Component for Vendor
const VendorOrderTimer = ({ order, onTimerExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!order ||
      ((order.status !== 'pending_vendor_confirmation' &&
        order.status !== 'pending_vendor_manual_acceptance' &&
        order.newStatus !== 'awaiting_vendor_confirmation')) ||
      !order.vendorAssignedAt) {
      setTimeRemaining(0);
      return;
    }

    const assignedTime = new Date(order.vendorAssignedAt).getTime();
    const expiryTime = assignedTime + (5 * 60 * 1000); // 5 minutes

    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, expiryTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        if (onTimerExpire) {
          onTimerExpire(order.id);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order, onTimerExpire, isExpired]);

  if (timeRemaining === 0 ||
    (order?.status !== 'pending_vendor_confirmation' &&
      order?.status !== 'pending_vendor_manual_acceptance' &&
      order?.newStatus !== 'awaiting_vendor_confirmation')) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isUrgent = timeRemaining < 60000; // Less than 1 minute

  return (
    <div className={`vendor-order-timer ${isUrgent ? 'urgent' : ''}`}>
      <Timer size={14} />
      <span>
        Respond in: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
      {isUrgent && <Bell size={14} className="urgent-bell" />}
    </div>
  );
};

// Updated DeliveryTimer Component
const DeliveryTimer = ({ order, onDeliveryComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isDeliveryComplete, setIsDeliveryComplete] = useState(false);

  useEffect(() => {
    // Fixed condition to check both status and newStatus
    if (!order || 
        (order.status !== 'out_for_delivery' && order.newStatus !== 'out_for_delivery') || 
        !order.outForDeliveryAt) {
      setTimeRemaining(0);
      return;
    }

    const deliveryStartTime = new Date(order.outForDeliveryAt).getTime();
    const deliveryCompleteTime = deliveryStartTime + (30 * 60 * 1000); // 30 minutes

    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, deliveryCompleteTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0 && !isDeliveryComplete) {
        console.log('Timer reached zero! Marking order as delivered:', order.id);
        setIsDeliveryComplete(true);
        if (onDeliveryComplete) {
          onDeliveryComplete(order.id);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order, onDeliveryComplete, isDeliveryComplete]);

  // Fixed condition to check both status and newStatus
  if (timeRemaining === 0 || 
      (order?.status !== 'out_for_delivery' && order?.newStatus !== 'out_for_delivery')) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <div className="delivery-timer">
      <Truck size={14} />
      <span>
        Estimated delivery: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

// Helper function to check status
const hasStatus = (order, statusValue) => {
  return order.status === statusValue || order.newStatus === statusValue;
};

// Order Card Component
const OrderCard = ({
  order,
  onAccept,
  onReject,
  onStatusUpdate,
  onViewDetails,
  onAssignDelivery,
  onDeliveryComplete,
  onTimerExpire,
  formatCurrency,
  formatDate,
  getStatusIcon,
  getStatusText
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Calculate total without tax
  const calculateTotalWithoutTax = () => {
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryCharge = order.deliveryCharge || 0;
    return subtotal + deliveryCharge;
  };

  const totalWithoutTax = calculateTotalWithoutTax();

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`order-card ${order.status} ${hasStatus(order, 'awaiting_vendor_confirmation') || hasStatus(order, 'pending_vendor_confirmation') ? 'pending-confirmation' : ''}`}>
      {/* Order Header */}
      <div className="order-header">
        <div className="order-id">
          <Package size={16} />
          <span>#{order.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="order-status">
          {getStatusIcon(order.status)}
          <span>{getStatusText(order)}</span>
        </div>
        {order.assignmentType && (
          <div className="assignment-type">
            <span className={`assignment-badge ${order.assignmentType}`}>
              {order.assignmentType === 'auto' ? 'Auto-Assigned' : 'Manual'}
            </span>
          </div>
        )}
      </div>

      {/* Timer for pending confirmation */}
      {(hasStatus(order, 'pending_vendor_confirmation') ||
        hasStatus(order, 'pending_vendor_manual_acceptance') ||
        hasStatus(order, 'awaiting_vendor_confirmation')) && (
          <VendorOrderTimer
            order={order}
            onTimerExpire={() => onTimerExpire(order.id)}
          />
        )}

      {/* Timer for out for delivery */}
      {hasStatus(order, 'out_for_delivery') && (
        <DeliveryTimer
          order={order}
          onDeliveryComplete={onDeliveryComplete}
        />
      )}

      {/* Order Content */}
      <div className="order-content">
        <div className="customer-info">
          <div className="customer-name">
            <User size={14} />
            <span>{order.customer?.fullName}</span>
          </div>

          <div className="customer-address" title={`${order.customer?.address}, ${order.customer?.city}`}>
            <MapPin size={14} />
            <span>{order.customer?.address?.substring(0, 30)}...</span>
          </div>
        </div>

        <div className="order-summary">
          <div className="items-preview">
            <span className="items-count">{order.items?.length || 0} items</span>
            <div className="items-list">
              {order.items?.slice(0, 2).map((item, idx) => (
                <span key={idx} className="item-name">{item.name}</span>
              ))}
              {order.items?.length > 2 && (
                <span className="more-items">+{order.items.length - 2} more</span>
              )}
            </div>
          </div>

          
        </div>

        <div className="order-time">
          <Calendar size={14} />
          <span>{formatDate(order.orderDate)}</span>
        </div>

        {/* Delivery information if assigned */}
        {order.delivery && (
          <div className="delivery-info">
            <div className="delivery-header">
              <Truck size={14} />
              <span>Delivery Info</span>
            </div>
            {order.delivery.partnerName && (
              <div className="delivery-partner">
                <User size={12} />
                <span>{order.delivery.partnerName}</span>
              </div>
            )}
            {order.delivery.trackingId && (
              <div className="delivery-tracking">
                <span>Tracking ID: {order.delivery.trackingId}</span>
              </div>
            )}
          </div>
        )}

        {/* Expanded details */}
        {isExpanded && (
          <div className="order-details-expanded">
            <div className="items-detail">
              <h4>Order Items:</h4>
              <table className="items-table-mini">
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>×{item.quantity}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {order.customer?.email && (
              <div className="customer-email">
                <strong>Email:</strong> {order.customer.email}
              </div>
            )}

            <div className="full-address">
              <strong>Full Address:</strong> {order.customer?.address}, {order.customer?.city}, {order.customer?.pincode}
            </div>

            {order.specialInstructions && (
              <div className="special-instructions">
                <strong>Special Instructions:</strong> {order.specialInstructions}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="order-actions">
        {/* Check for pending confirmation or awaiting_vendor_confirmation */}
        {(hasStatus(order, 'pending_vendor_confirmation') ||
          hasStatus(order, 'pending_vendor_manual_acceptance') ||
          hasStatus(order, 'awaiting_vendor_confirmation')) && (
            <div className="confirmation-actions">
              <button
                className="accept-btn"
                onClick={() => onAccept(order.id)}
                disabled={updating}
              >
                <ThumbsUp size={16} />
                Accept Order
              </button>
              <button
                className="reject-btn"
                onClick={() => onReject(order.id)}
                disabled={updating}
              >
                <ThumbsDown size={16} />
                Reject
              </button>
            </div>
          )}

        {/* Check for processing status */}
        {hasStatus(order, 'processing') && (
          <button
            className="update-btn"
            onClick={() => handleStatusUpdate('prepared')}
            disabled={updating}
          >
            {updating ? <RefreshCw size={16} className="spinning" /> : <CheckCircle size={16} />}
            Mark as Prepared
          </button>
        )}

        {/* Check for prepared status */}
        {hasStatus(order, 'prepared') && (
          <button
            className="update-btn"
            onClick={() => handleStatusUpdate('ready_for_pickup')}
            disabled={updating}
          >
            {updating ? <RefreshCw size={16} className="spinning" /> : <Package size={16} />}
            Ready for Pickup
          </button>
        )}

        {/* Check for ready_for_pickup status */}
        {hasStatus(order, 'ready_for_pickup') && (
          <button
            className="assign-delivery-btn"
            onClick={() => onAssignDelivery(order.id)}
            disabled={updating}
          >
            {updating ? <RefreshCw size={16} className="spinning" /> : <Truck size={16} />}
            Assign Delivery
          </button>
        )}

        {/* Check for delivery_assigned status */}
        {order.delivery && hasStatus(order, 'delivery_assigned') && (
          <button
            className="out-for-delivery-btn"
            onClick={() => handleStatusUpdate('out_for_delivery')}
            disabled={updating}
          >
            {updating ? <RefreshCw size={16} className="spinning" /> : <Navigation size={16} />}
            Mark Out for Delivery
          </button>
        )}

        <div className="secondary-actions">
          <button
            className="view-btn"
            onClick={() => onViewDetails(order.id)}
          >
            <Eye size={16} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorOrdersPage = () => {
  // State management
  const [currentVendor, setCurrentVendor] = useState(null);
  const [vendorShop, setVendorShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Statistics
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    revenue: 0,
    pendingConfirmation: 0,
    outForDelivery: 0
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get current vendor information
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentVendor(user);

        try {
          const shopsRef = ref(db, 'shops');
          const snapshot = await get(shopsRef);

          if (snapshot.exists()) {
            const shopsData = snapshot.val();

            // Enhanced vendor matching
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
            } else {
              setError(`No shop found for email: ${user.email}. Please contact support.`);
            }
          } else {
            setError('No shops data found in database.');
          }
        } catch (err) {
          console.error('Error fetching vendor shop:', err);
          setError('Failed to load vendor information.');
        }
      } else {
        setCurrentVendor(null);
        setVendorShop(null);
        setError('Please log in to view orders.');
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch orders for this vendor
  useEffect(() => {
    if (!vendorShop) return;

    setLoading(true);
    const ordersRef = ref(db, 'orders');

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const ordersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          timeline: data[key].timeline || [
            {
              status: 'order_placed',
              time: data[key].orderDate || new Date().toISOString(),
              note: 'Order placed successfully'
            }
          ]
        }));

        // Enhanced order filtering for vendor
        const vendorOrders = ordersArray.filter(order => {
          // Check if order is assigned to this vendor
          if (order.vendor && (
            order.vendor.id === vendorShop.id ||
            order.vendor.email?.toLowerCase() === vendorShop.email?.toLowerCase()
          )) {
            return true;
          }

          // Check if order is pending confirmation for this vendor (both auto and manual)
          if ((order.status === 'pending_vendor_confirmation' ||
            order.status === 'pending_vendor_manual_acceptance' ||
            order.newStatus === 'awaiting_vendor_confirmation') &&
            order.assignedVendor && (
              order.assignedVendor.id === vendorShop.id ||
              order.assignedVendor.email?.toLowerCase() === vendorShop.email?.toLowerCase()
            )) {
            return true;
          }

          return false;
        });

        // Sort orders: pending confirmation first, then by date
        vendorOrders.sort((a, b) => {
          // Orders with awaiting_vendor_confirmation newStatus should be at the top
          if ((a.newStatus === 'awaiting_vendor_confirmation' || a.status === 'pending_vendor_confirmation') && 
              !(b.newStatus === 'awaiting_vendor_confirmation' || b.status === 'pending_vendor_confirmation')) {
            return -1;
          }
          if ((b.newStatus === 'awaiting_vendor_confirmation' || b.status === 'pending_vendor_confirmation') && 
              !(a.newStatus === 'awaiting_vendor_confirmation' || a.status === 'pending_vendor_confirmation')) {
            return 1;
          }
          return new Date(b.orderDate) - new Date(a.orderDate);
        });

        setOrders(vendorOrders);
        calculateStats(vendorOrders);

        // Check for new pending confirmations - also check newStatus
        const pendingConfirmations = vendorOrders.filter(o => 
          o.status === 'pending_vendor_confirmation' || 
          o.newStatus === 'awaiting_vendor_confirmation'
        );
        
        if (pendingConfirmations.length > 0) {
          setUnreadCount(pendingConfirmations.length);

          // Play notification sound for new orders
          if (pendingConfirmations.length > 0) {
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.play().catch(e => console.log('Audio play prevented by browser'));
            } catch (e) {
              console.log('Error playing notification sound');
            }
          }
        }

        // Check for orders that should be automatically marked as delivered
        vendorOrders.forEach(order => {
          if (order.status === 'out_for_delivery' && order.outForDeliveryAt) {
            const outForDeliveryTime = new Date(order.outForDeliveryAt).getTime();
            const currentTime = new Date().getTime();
            const diffInMinutes = (currentTime - outForDeliveryTime) / (1000 * 60);

            if (diffInMinutes >= 30) {
              handleDeliveryComplete(order.id);
            }
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error processing orders:', err);
        setError('Failed to load orders. Please refresh the page.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [vendorShop]);

  // Calculate order statistics
  const calculateStats = (ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: 0,
      processing: 0,
      completed: 0,
      revenue: 0,
      pendingConfirmation: 0,
      outForDelivery: 0
    };

    ordersList.forEach(order => {
      // Calculate order total without tax for revenue
      const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      const deliveryCharge = order.deliveryCharge || 0;
      const totalWithoutTax = subtotal + deliveryCharge;

      // Check both status and newStatus for awaiting confirmation
      if (order.status === 'pending_vendor_confirmation' || 
          order.status === 'pending_vendor_manual_acceptance' ||
          order.newStatus === 'awaiting_vendor_confirmation') {
        stats.pendingConfirmation++;
      } else if (order.status === 'processing' || order.newStatus === 'processing' ||
                order.status === 'prepared' || order.newStatus === 'prepared' ||
                order.status === 'ready_for_pickup' || order.newStatus === 'ready_for_pickup' ||
                order.status === 'delivery_assigned' || order.newStatus === 'delivery_assigned') {
        stats.processing++;
      } else if (order.status === 'out_for_delivery' || order.newStatus === 'out_for_delivery') {
        stats.outForDelivery++;
      } else if (order.status === 'delivered' || order.newStatus === 'delivered') {
        stats.completed++;
        stats.revenue += totalWithoutTax; // Use total without tax for revenue
      }
    });

    setOrderStats(stats);
  };

  // Handle order acceptance
  const handleAcceptOrder = async (orderId) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        throw new Error('Order not found');
      }

      const orderData = snapshot.val();

      const updatedTimeline = [
        ...(orderData.timeline || []),
        {
          status: 'vendor_confirmed',
          time: new Date().toISOString(),
          note: `Order confirmed by ${vendorShop.name}`
        },
        {
          status: 'processing',
          time: new Date().toISOString(),
          note: 'Order being prepared'
        }
      ];

      await update(orderRef, {
        status: 'processing',
        newStatus: 'processing', // Update newStatus too
        vendor: {
          id: vendorShop.id,
          name: vendorShop.name,
          email: vendorShop.email,
          phone: vendorShop.phone,
          rating: vendorShop.rating,
          location: vendorShop.location,
          category: vendorShop.category,
          status: vendorShop.status
        },
        assignedVendor: null, // Clear the assignment since it's now confirmed
        confirmedAt: new Date().toISOString(),
        timeline: updatedTimeline
      });

      // Show success notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Order #${orderId.slice(-6)} accepted successfully!`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error accepting order:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to accept order: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to reject this order? It will be reassigned to another vendor.');
    if (!confirmed) return;

    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        throw new Error('Order not found');
      }

      const orderData = snapshot.val();

      const updatedTimeline = [
        ...(orderData.timeline || []),
        {
          status: 'vendor_rejected',
          time: new Date().toISOString(),
          note: `Order rejected by ${vendorShop.name}`
        }
      ];

      // Update to 'pending' instead of 'pending_manual_assignment' to align with admin panel
      await update(orderRef, {
        status: 'pending',
        newStatus: 'awaiting_vendor_confirmation', // Keep newStatus as awaiting_vendor_confirmation
        assignedVendor: null,
        rejectedBy: orderData.rejectedBy
          ? [...orderData.rejectedBy, vendorShop.id]
          : [vendorShop.id],
        rejectedAt: new Date().toISOString(),
        timeline: updatedTimeline
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `Order #${orderId.slice(-6)} rejected. It will be reassigned.`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error rejecting order:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to reject order: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Handle timer expiration (auto-reject)
  const handleTimerExpire = async (orderId) => {
    console.log(`Timer expired for order ${orderId}. Auto-rejecting.`);

    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        return;
      }

      const orderData = snapshot.val();

      // Only auto-reject if the order is still in pending confirmation state (auto or manual)
      // or has newStatus awaiting_vendor_confirmation
      if (orderData.status !== 'pending_vendor_confirmation' &&
          orderData.status !== 'pending_vendor_manual_acceptance' &&
          orderData.newStatus !== 'awaiting_vendor_confirmation') {
        return;
      }

      const updatedTimeline = [
        ...(orderData.timeline || []),
        {
          status: 'vendor_auto_rejected',
          time: new Date().toISOString(),
          note: `Order automatically rejected due to no response from ${vendorShop.name} within 5 minutes`
        }
      ];

      await update(orderRef, {
        status: 'pending',
        newStatus: 'awaiting_vendor_confirmation', // Keep newStatus as awaiting_vendor_confirmation
        assignedVendor: null,
        rejectedBy: orderData.rejectedBy
          ? [...orderData.rejectedBy, vendorShop.id]
          : [vendorShop.id],
        rejectedAt: new Date().toISOString(),
        timeline: updatedTimeline
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: `Order #${orderId.slice(-6)} was auto-rejected due to timeout.`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error auto-rejecting order:', error);
    }
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        throw new Error('Order not found');
      }

      const orderData = snapshot.val();
      const statusMessages = {
        'processing': 'Order is being prepared',
        'prepared': 'Order is ready for pickup',
        'ready_for_pickup': 'Order ready for delivery pickup',
        'out_for_delivery': 'Order is out for delivery',
        'delivered': 'Order has been delivered'
      };

      const updatedTimeline = [
        ...(orderData.timeline || []),
        {
          status: newStatus,
          time: new Date().toISOString(),
          note: statusMessages[newStatus] || `Status updated to ${newStatus}`
        }
      ];

      const updateData = {
        status: newStatus,
        newStatus: newStatus, // Update newStatus too
        timeline: updatedTimeline,
        lastUpdated: new Date().toISOString()
      };

      // Add timestamp for out_for_delivery status
      if (newStatus === 'out_for_delivery') {
        updateData.outForDeliveryAt = new Date().toISOString();
      }

      await update(orderRef, updateData);

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Order status updated to ${getStatusText({status: newStatus})}`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error updating order status:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to update order: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Handle delivery assignment via Porter API
  const handleAssignDelivery = async (orderId) => {
    try {
      // First, get the order details
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        throw new Error('Order not found');
      }

      const orderData = snapshot.val();

      // Set status to "assigning_delivery" to prevent multiple assignments
      await update(orderRef, {
        status: 'assigning_delivery',
        newStatus: 'assigning_delivery' // Update newStatus too
      });

      // Show loading notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `Assigning delivery for Order #${orderId.slice(-6)}...`,
        timestamp: new Date().toISOString()
      }]);

      // Generate a unique request ID for Porter
      const requestId = `order_${orderId}_${Date.now()}`;

      // Get vendor and customer addresses
      const vendorAddress = orderData.vendor?.location || {};
      const customerAddress = orderData.customer || {};

      // Format data for Porter API based on their required structure
      const porterRequestData = {
        request_id: requestId,
        delivery_instructions: {
          instructions_list: [
            {
              type: "text",
              description: `Food delivery for order #${orderId.slice(-6)}`
            }
          ]
        },
        pickup_details: {
          address: {
            apartment_address: vendorAddress.buildingName || vendorShop.name || "",
            street_address1: vendorAddress.address || vendorShop.location?.address || "",
            street_address2: "",
            landmark: vendorAddress.landmark || "",
            city: vendorAddress.city || "Bengaluru",
            state: vendorAddress.state || "Karnataka",
            pincode: vendorAddress.pincode || "560029",
            country: "India",
            lat: vendorAddress.lat || 12.9165757,
            lng: vendorAddress.lng || 77.6101163,
            contact_details: {
              name: vendorShop.name || "Restaurant",
              phone_number: `+91${vendorShop.phone || "9901728049"}`.replace(/\\+91\\+91/, '+91')
            }
          }
        },
        drop_details: {
          address: {
            apartment_address: customerAddress.flatNo || customerAddress.buildingName || "",
            street_address1: customerAddress.address || "",
            street_address2: "",
            landmark: customerAddress.landmark || "",
            city: customerAddress.city || "Bengaluru",
            state: customerAddress.state || "Karnataka",
            pincode: customerAddress.pincode || "560029",
            country: "India",
            lat: customerAddress.lat || 12.9165757,
            lng: customerAddress.lng || 77.6101163,
            contact_details: {
              name: customerAddress.fullName || "Customer",
              phone_number: `+91${customerAddress.phone || ""}`.replace(/\\+91\\+91/, '+91')
            }
          }
        }
      };

      // Due to CORS restrictions in browser environment, we use a proxy or backend
      // This is a simulation that would be replaced with actual API calls in production
      const sendPorterRequest = async () => {
        try {
          // In production, this would be a call to your backend API that handles Porter requests
          // For now, we're simulating the response

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Simulate Porter API response based on their documentation
          return {
            success: true,
            data: {
              order_id: `CRN${Math.floor(10000000 + Math.random() * 90000000)}`,
              status: "CONFIRMED",
              delivery_partner: {
                name: "Rahul Kumar",
                phone: "9876543210",
                eta_pickup: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                eta_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString()
              },
              tracking_url: `https://track.porter.in/track/${Math.floor(10000000 + Math.random() * 90000000)}`
            }
          };

          /* PRODUCTION CODE - Uncomment and use with backend
          // Make API call to your backend which will handle Porter API
          const response = await fetch('/api/assign-delivery', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId,
              porterRequestData
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create delivery with Porter');
          }
          
          return await response.json();
          */
        } catch (error) {
          console.error('Error with Porter API request:', error);
          throw new Error(`Failed to create delivery: ${error.message}`);
        }
      };

      // Call Porter API (via simulation or backend)
      const porterResponse = await sendPorterRequest();

      if (!porterResponse.success) {
        throw new Error('Failed to create delivery with Porter');
      }

      // Extract delivery information from response
      const deliveryInfo = porterResponse.data;

      // Update order with delivery information
      const updatedTimeline = [
        ...(orderData.timeline || []),
        {
          status: 'delivery_assigned',
          time: new Date().toISOString(),
          note: `Delivery assigned to ${deliveryInfo.delivery_partner.name} - Tracking ID: ${deliveryInfo.order_id}`
        }
      ];

      await update(orderRef, {
        status: 'delivery_assigned',
        newStatus: 'delivery_assigned', // Update newStatus too
        delivery: {
          provider: 'Porter',
          trackingId: deliveryInfo.order_id,
          partnerName: deliveryInfo.delivery_partner.name,
          partnerPhone: deliveryInfo.delivery_partner.phone,
          estimatedPickupTime: deliveryInfo.delivery_partner.eta_pickup,
          estimatedDeliveryTime: deliveryInfo.delivery_partner.eta_delivery,
          assignedAt: new Date().toISOString(),
          trackingUrl: deliveryInfo.tracking_url,
          porterOrderDetails: deliveryInfo // Store full Porter response for reference
        },
        timeline: updatedTimeline
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Delivery assigned to ${deliveryInfo.delivery_partner.name} for Order #${orderId.slice(-6)}!`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error assigning delivery:', error);

      // Revert status if assignment fails
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, {
        status: 'ready_for_pickup',
        newStatus: 'ready_for_pickup' // Update newStatus too
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to assign delivery: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Handle delivery completion (automatically after 30 minutes)
  const handleDeliveryComplete = async (orderId) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        return;
      }

      const orderData = snapshot.val();

      // Skip if already delivered
      if (orderData.status === 'delivered') {
        return;
      }

      const updatedTimeline = [
        ...(orderData.timeline || []),
        {
          status: 'delivered',
          time: new Date().toISOString(),
          note: 'Order delivered successfully'
        }
      ];

      await update(orderRef, {
        status: 'delivered',
        newStatus: 'delivered', // Update newStatus too
        deliveredAt: new Date().toISOString(),
        timeline: updatedTimeline
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Order #${orderId.slice(-6)} marked as delivered!`,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  // Filter orders based on current filters
  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.status === statusFilter || order.newStatus === statusFilter
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.fullName && order.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.phone && order.customer.phone.includes(searchTerm))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);

        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm, dateFilter]);

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_vendor_confirmation': return <Clock className="status-icon pending" />;
      case 'processing': return <RefreshCw className="status-icon processing" />;
      case 'prepared': return <CheckCircle className="status-icon prepared" />;
      case 'ready_for_pickup': return <Package className="status-icon ready" />;
      case 'delivery_assigned': return <Truck className="status-icon delivery-assigned" />;
      case 'out_for_delivery': return <Truck className="status-icon delivery" />;
      case 'delivered': return <CheckCircle className="status-icon delivered" />;
      case 'cancelled': return <XCircle className="status-icon cancelled" />;
      default: return <Clock className="status-icon" />;
    }
  };

  // FIXED: Corrected to take an order object instead of just status string
  const getStatusText = (order) => {
    // First check for newStatus
    if (order.newStatus === 'awaiting_vendor_confirmation') {
      return 'Awaiting Your Confirmation';
    }
    
    // If no newStatus or not awaiting_vendor_confirmation, check status
    switch (order.status) {
      case 'pending_vendor_confirmation': return 'Awaiting Your Confirmation';
      case 'pending_vendor_manual_acceptance': return 'Awaiting Your Confirmation (Manual)';
      case 'processing': return 'Processing';
      case 'prepared': return 'Prepared';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'delivery_assigned': return 'Delivery Assigned';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="vendor-orders-page">
        <div className="loading-container">
          <RefreshCw className="loading-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="vendor-orders-page">
        <div className="error-container">
          <XCircle className="error-icon" />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // No vendor state
  if (!currentVendor || !vendorShop) {
    return (
      <div className="vendor-orders-page">
        <div className="error-container">
          <User className="error-icon" />
          <p>Please log in to access your vendor dashboard.</p>
        </div>
      </div>
    );
  }

  // Order details view
  if (selectedOrder) {
    const order = orders.find(o => o.id === selectedOrder);

    if (!order) {
      return (
        <div className="vendor-orders-page">
          <div className="error-container">
            <p>Order not found</p>
            <button onClick={() => setSelectedOrder(null)}>Back to Orders</button>
          </div>
        </div>
      );
    }

    // Calculate order values for the OrderItems component
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryCharge = order.deliveryCharge || 0;
    const tax = order.tax || 0;
    const totalAmount = order.totalAmount || 0;

    return (
      <div className="vendor-orders-page">
        <div className="order-detail-header">
          <button
            className="back-button"
            onClick={() => setSelectedOrder(null)}
          >
            ← Back to Orders
          </button>
          <h1>Order Details - #{order.id.slice(-6).toUpperCase()}</h1>
          <div className="order-status-badge">
            {getStatusIcon(order.status)}
            <span>{getStatusText(order)}</span>
          </div>
        </div>

        {(order.status === 'pending_vendor_confirmation' ||
          order.status === 'pending_vendor_manual_acceptance' ||
          order.newStatus === 'awaiting_vendor_confirmation') && (
            <VendorOrderTimer
              order={order}
              onTimerExpire={() => handleTimerExpire(order.id)}
            />
          )}

        {(order.status === 'out_for_delivery' || order.newStatus === 'out_for_delivery') && (
          <DeliveryTimer
            order={order}
            onDeliveryComplete={handleDeliveryComplete}
          />
        )}

        <div className="order-detail-container">
          <div className="order-detail-grid">
            {/* Customer Information */}
            <div className="detail-card">
              <h3><User size={20} /> Customer Information</h3>
              <div className="detail-content">
                <p><strong>Name:</strong> {order.customer?.fullName}</p>
                <p><strong>Address:</strong> {order.customer?.address}, {order.customer?.city}, {order.customer?.pincode}</p>
                <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
              </div>
            </div>

            {/* Order Items - Using the new OrderItems component */}
            <OrderItems
              items={order.items}
              subtotal={subtotal}
              deliveryCharge={deliveryCharge}
              tax={tax}
              totalAmount={totalAmount}
              formatCurrency={formatCurrency}
            />

            {/* Assignment Info */}
            {order.assignmentType && (
              <div className="detail-card assignment-card">
                <h3>Assignment Information</h3>
                <div className="detail-content">
                  <p><strong>Assignment Type:</strong> {order.assignmentType === 'auto' ? 'Automatic' : 'Manual'}</p>
                  {order.vendorAssignedAt && (
                    <p><strong>Assigned At:</strong> {formatDate(order.vendorAssignedAt)}</p>
                  )}
                  {order.matchScore && (
                    <p><strong>Match Score:</strong> {order.matchScore}%</p>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Information */}
            {order.delivery && (
              <div className="detail-card delivery-card">
                <h3><Truck size={20} /> Delivery Information</h3>
                <div className="detail-content">
                  <p><strong>Provider:</strong> {order.delivery.provider}</p>
                  <p><strong>Tracking ID:</strong> {order.delivery.trackingId}</p>
                  {order.delivery.partnerName && (
                    <p><strong>Delivery Partner:</strong> {order.delivery.partnerName}</p>
                  )}
                  {order.delivery.partnerPhone && (
                    <p><strong>Partner Phone:</strong> {order.delivery.partnerPhone}</p>
                  )}
                  {order.delivery.estimatedDeliveryTime && (
                    <p><strong>Estimated Delivery:</strong> {formatDate(order.delivery.estimatedDeliveryTime)}</p>
                  )}
                  {order.delivery.trackingUrl && (
                    <p>
                      <strong>Tracking Link:</strong>
                      <a href={order.delivery.trackingUrl} target="_blank" rel="noopener noreferrer" className="tracking-link">
                        Open Tracking
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="detail-card timeline-card">
              <h3><Clock size={20} /> Order Timeline</h3>
              <div className="timeline">
                {order.timeline?.map((event, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-status">{getStatusText({status: event.status})}</div>
                      <div className="timeline-time">{formatDate(event.time)}</div>
                      {event.note && <div className="timeline-note">{event.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-actions-detail">
            {/* Check for pending confirmation or awaiting_vendor_confirmation */}
            {(order.status === 'pending_vendor_confirmation' ||
              order.status === 'pending_vendor_manual_acceptance' ||
              order.newStatus === 'awaiting_vendor_confirmation') && (
                <div className="confirmation-actions-detail">
                  <button
                    className="accept-button-large"
                    onClick={() => handleAcceptOrder(order.id)}
                  >
                    <ThumbsUp size={20} />
                    Accept This Order
                  </button>
                  <button
                    className="reject-button-large"
                    onClick={() => handleRejectOrder(order.id)}
                  >
                    <ThumbsDown size={20} />
                    Reject Order
                  </button>
                </div>
              )}

            {/* Check for processing status */}
            {(order.status === 'processing' || order.newStatus === 'processing') && (
              <button
                className="update-button-large"
                onClick={() => handleStatusUpdate(order.id, 'prepared')}
              >
                <CheckCircle size={20} />
                Mark as Prepared
              </button>
            )}

            {/* Check for prepared status */}
            {(order.status === 'prepared' || order.newStatus === 'prepared') && (
              <button
                className="update-button-large"
                onClick={() => handleStatusUpdate(order.id, 'ready_for_pickup')}
              >
                <Package size={20} />
                Ready for Pickup
              </button>
            )}

            {/* Check for ready_for_pickup status */}
            {(order.status === 'ready_for_pickup' || order.newStatus === 'ready_for_pickup') && (
              <button
                className="update-button-large"
                onClick={() => handleAssignDelivery(order.id)}
              >
                <Truck size={20} />
                Assign Delivery
              </button>
            )}

            {/* Check for delivery_assigned status */}
            {order.delivery && (order.status === 'delivery_assigned' || order.newStatus === 'delivery_assigned') && (
              <button
                className="update-button-large"
                onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
              >
                <Navigation size={20} />
                Mark Out for Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main orders list view
  return (
    <div className="vendor-orders-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>My Orders</h1>
          <p>Welcome back, <strong>{vendorShop.name}</strong></p>
          {unreadCount > 0 && (
            <div className="notification-badge">
              <Bell size={16} />
              <span>{unreadCount} pending confirmation</span>
            </div>
          )}
        </div>
        <div className="header-buttons">
          <button
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.slice(-3).map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <span>{notification.message}</span>
              <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
                <XCircle size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{orderStats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card urgent">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{orderStats.pendingConfirmation}</div>
            <div className="stat-label">Needs Confirmation</div>
          </div>
        </div>

        <div className="stat-card processing">
          <div className="stat-icon">
            <RefreshCw size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{orderStats.processing}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card delivery">
          <div className="stat-icon">
            <Truck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{orderStats.outForDelivery}</div>
            <div className="stat-label">Out for Delivery</div>
          </div>
        </div>

        {/* <div className="stat-card completed">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(orderStats.revenue)}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div> */}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending_vendor_confirmation">Pending Confirmation</option>
            <option value="processing">Processing</option>
            <option value="prepared">Prepared</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="delivery_assigned">Delivery Assigned</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No Orders Found</h3>
            <p>
              {statusFilter === 'all'
                ? "No orders found for your shop."
                : `No orders found with status: ${getStatusText({status: statusFilter})}`
              }
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={setSelectedOrder}
                onAssignDelivery={handleAssignDelivery}
                onDeliveryComplete={handleDeliveryComplete}
                onTimerExpire={handleTimerExpire}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrdersPage;