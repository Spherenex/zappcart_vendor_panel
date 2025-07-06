

// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, get } from 'firebase/database';
// import { onAuthStateChanged } from 'firebase/auth';
// import { db, auth } from '../services/firebase';
// import {
//     Calendar,
//     TrendingUp,
//     Clock,
//     CheckCircle,
//     XCircle,
//     RefreshCw,
//     User,
//     Eye,
//     Search,
//     Download,
//     ArrowUpDown,
//     ArrowUp,
//     ArrowDown,
//     FileText
// } from 'lucide-react';
// import './VendorPaymentsPage.css';

// const VendorPaymentsPage = () => {
//     // State management
//     const [currentVendor, setCurrentVendor] = useState(null);
//     const [vendorShop, setVendorShop] = useState(null);
//     const [payments, setPayments] = useState([]);
//     const [filteredPayments, setFilteredPayments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [selectedPayment, setSelectedPayment] = useState(null);
//     const [vendorPrices, setVendorPrices] = useState({});

//     // Filter and sort states
//     const [searchTerm, setSearchTerm] = useState('');
//     const [dateFilter, setDateFilter] = useState('all');
//     const [sortBy, setSortBy] = useState('date');
//     const [sortOrder, setSortOrder] = useState('desc');

//     // Statistics
//     const [paymentStats, setPaymentStats] = useState({
//         totalVendorAmount: 0,
//         totalTransactions: 0,
//         avgTransactionValue: 0
//     });

//     // Get current vendor information
//     useEffect(() => {
//         const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 setCurrentVendor(user);
//                 try {
//                     const shopsRef = ref(db, 'shops');
//                     const snapshot = await get(shopsRef);

//                     if (snapshot.exists()) {
//                         const shopsData = snapshot.val();
//                         const matchingShop = Object.entries(shopsData).find(([shopId, shopData]) => {
//                             const userEmail = user.email?.toLowerCase();
//                             const shopEmail = shopData.email?.toLowerCase();
//                             return shopEmail === userEmail ||
//                                 shopData.owner?.toLowerCase() === userEmail ||
//                                 shopData.ownerEmail?.toLowerCase() === userEmail;
//                         });

//                         if (matchingShop) {
//                             const [shopId, shopData] = matchingShop;
//                             setVendorShop({ id: shopId, ...shopData });
                            
//                             // Get vendor prices if available
//                             if (shopData.vendorPrices) {
//                                 setVendorPrices(shopData.vendorPrices);
//                             }
//                         } else {
//                             setError(`No shop found for email: ${user.email}`);
//                         }
//                     }
//                 } catch (err) {
//                     setError('Failed to load vendor information.');
//                 }
//             } else {
//                 setCurrentVendor(null);
//                 setVendorShop(null);
//                 setError('Please log in to view payments.');
//             }
//             setLoading(false);
//         });

//         return () => unsubscribeAuth();
//     }, []);

//     // Helper function to get vendor price for an item
//     const getVendorPrice = (itemId, orderAmount) => {
//         // First check if there's a custom vendor price
//         const customVendorPrice = vendorPrices[itemId]?.price;
//         if (customVendorPrice !== undefined) return customVendorPrice;
        
//         // If no custom price, calculate 90% of order amount (removing the 10% commission)
//         return Math.round(orderAmount * 0.90);
//     };

//     // Fetch orders and convert delivered orders to payment records
//     useEffect(() => {
//         if (!vendorShop) return;

//         setLoading(true);
//         const ordersRef = ref(db, 'orders');
//         const itemsRef = ref(db, 'items');

//         // First get all items to have their data available
//         get(itemsRef).then((itemsSnapshot) => {
//             const itemsData = itemsSnapshot.exists() ? itemsSnapshot.val() : {};
            
//             const unsubscribe = onValue(ordersRef, (snapshot) => {
//                 try {
//                     if (!snapshot.exists()) {
//                         setPayments([]);
//                         setLoading(false);
//                         return;
//                     }

//                     const data = snapshot.val();
//                     const ordersArray = Object.keys(data).map(key => ({
//                         id: key,
//                         ...data[key]
//                     }));

//                     // Filter orders for this vendor
//                     const vendorOrders = ordersArray.filter(order => {
//                         if (!order) return false;

//                         // Check if order is assigned to this vendor
//                         if (order.vendor) {
//                             const match =
//                                 order.vendor.id === vendorShop.id ||
//                                 (order.vendor.name && vendorShop.name &&
//                                     order.vendor.name.toLowerCase() === vendorShop.name.toLowerCase()) ||
//                                 (order.vendor.email && vendorShop.email &&
//                                     order.vendor.email.toLowerCase() === vendorShop.email.toLowerCase()) ||
//                                 (order.vendor.name && vendorShop.name &&
//                                     order.vendor.name.toLowerCase().includes(vendorShop.name.toLowerCase()));

//                             if (match) return true;
//                         }

//                         // Check assigned vendor
//                         if (order.assignedVendor) {
//                             const match =
//                                 order.assignedVendor.id === vendorShop.id ||
//                                 (order.assignedVendor.name && vendorShop.name &&
//                                     order.assignedVendor.name.toLowerCase() === vendorShop.name.toLowerCase());

//                             if (match) return true;
//                         }

//                         return false;
//                     });

//                     // Convert delivered orders to payment records
//                     const paymentRecords = vendorOrders.map(order => {
//                         const amount = order.totalAmount || 0;
//                         const itemId = order.items && order.items.length > 0 ? order.items[0].id : null;
//                         const vendorAmount = getVendorPrice(itemId, amount);

//                         return {
//                             id: `pay_${order.id}`,
//                             orderId: order.id,
//                             transactionId: `txn_${order.id.slice(-8)}`,
//                             amount: amount,
//                             vendorAmount: vendorAmount,
//                             transactionDate: order.orderDate,
//                             customer: order.customer,
//                             reference: order.paymentReference || '- will update later',
//                             vendor: order.vendor || vendorShop
//                         };
//                     });

//                     // Sort by date (newest first)
//                     paymentRecords.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

//                     setPayments(paymentRecords);
//                     calculateStats(paymentRecords);
//                     setLoading(false);

//                 } catch (err) {
//                     console.error('Error processing payments:', err);
//                     setError('Failed to load payment data.');
//                     setLoading(false);
//                 }
//             });

//             return () => unsubscribe();
//         }).catch(err => {
//             console.error('Error fetching items:', err);
//             setError('Failed to load item data.');
//             setLoading(false);
//         });
//     }, [vendorShop, vendorPrices]);

//     // Calculate payment statistics
//     const calculateStats = (paymentsList) => {
//         const stats = {
//             totalVendorAmount: 0,
//             totalTransactions: paymentsList.length,
//             avgTransactionValue: 0
//         };

//         paymentsList.forEach(payment => {
//             stats.totalVendorAmount += payment.vendorAmount || 0;
//         });

//         stats.avgTransactionValue = stats.totalTransactions > 0
//             ? stats.totalVendorAmount / stats.totalTransactions
//             : 0;

//         setPaymentStats(stats);
//     };

//     // Handle sorting
//     const handleSort = (field) => {
//         if (sortBy === field) {
//             setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//         } else {
//             setSortBy(field);
//             setSortOrder('desc');
//         }
//     };

//     // Sort payments
//     const sortPayments = (paymentsList) => {
//         return [...paymentsList].sort((a, b) => {
//             let aValue, bValue;

//             switch (sortBy) {
//                 case 'amount':
//                     aValue = a.vendorAmount || 0;
//                     bValue = b.vendorAmount || 0;
//                     break;
//                 case 'date':
//                     aValue = new Date(a.transactionDate);
//                     bValue = new Date(b.transactionDate);
//                     break;
//                 case 'customer':
//                     aValue = a.customer?.fullName || '';
//                     bValue = b.customer?.fullName || '';
//                     break;
//                 default:
//                     aValue = a.transactionDate;
//                     bValue = b.transactionDate;
//             }

//             if (sortOrder === 'asc') {
//                 return aValue > bValue ? 1 : -1;
//             } else {
//                 return aValue < bValue ? 1 : -1;
//             }
//         });
//     };

//     // Filter payments
//     useEffect(() => {
//         let filtered = [...payments];

//         // Search filter
//         if (searchTerm) {
//             filtered = filtered.filter(payment =>
//                 payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 payment.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 payment.customer?.phone?.includes(searchTerm)
//             );
//         }

//         // Date filter
//         if (dateFilter !== 'all') {
//             const now = new Date();
//             const today = new Date(now.setHours(0, 0, 0, 0));

//             filtered = filtered.filter(payment => {
//                 const paymentDate = new Date(payment.transactionDate);

//                 switch (dateFilter) {
//                     case 'today':
//                         return paymentDate >= today;
//                     case 'yesterday':
//                         const yesterday = new Date(today);
//                         yesterday.setDate(yesterday.getDate() - 1);
//                         return paymentDate >= yesterday && paymentDate < today;
//                     case 'week':
//                         const weekAgo = new Date(today);
//                         weekAgo.setDate(weekAgo.getDate() - 7);
//                         return paymentDate >= weekAgo;
//                     case 'month':
//                         const monthAgo = new Date(today);
//                         monthAgo.setMonth(monthAgo.getMonth() - 1);
//                         return paymentDate >= monthAgo;
//                     default:
//                         return true;
//                 }
//             });
//         }

//         // Apply sorting
//         const sorted = sortPayments(filtered);
//         setFilteredPayments(sorted);
//     }, [payments, searchTerm, dateFilter, sortBy, sortOrder]);

//     // Export payments to CSV
//     const exportPayments = () => {
//         const csvData = filteredPayments.map(payment => ({
//             'Payment ID': payment.id,
//             'Order ID': payment.orderId || '- will update later',
//             'Transaction ID': payment.transactionId || '- will update later',
//             'Customer Name': payment.customer?.fullName || '- will update later',
//             'Customer Phone': payment.customer?.phone || '- will update later',
//             'Date': formatDate(payment.transactionDate),
//             'Vendor Amount': formatCurrency(payment.vendorAmount || 0)
//         }));

//         if (csvData.length === 0) {
//             alert('No payments to export');
//             return;
//         }

//         const csvContent = [
//             Object.keys(csvData[0]).join(','),
//             ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
//         ].join('\n');

//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `vendor_payments_${new Date().toISOString().slice(0, 10)}.csv`;
//         link.click();
//         URL.revokeObjectURL(url);
//     };

//     // Format currency
//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('en-IN', {
//             style: 'currency',
//             currency: 'INR',
//             minimumFractionDigits: 2,
//         }).format(amount);
//     };

//     // Format date
//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         return new Date(dateString).toLocaleDateString('en-IN', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     // Get sort icon
//     const getSortIcon = (field) => {
//         if (sortBy !== field) return <ArrowUpDown size={14} className="sort-icon" />;
//         return sortOrder === 'asc'
//             ? <ArrowUp size={14} className="sort-icon active" />
//             : <ArrowDown size={14} className="sort-icon active" />;
//     };

//     if (loading) {
//         return (
//             <div className="vendor-payments-page">
//                 <div className="loading-container">
//                     <RefreshCw className="loading-spinner" />
//                     <p>Loading payment data...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="vendor-payments-page">
//                 <div className="error-container">
//                     <XCircle className="error-icon" />
//                     <p>{error}</p>
//                     <button onClick={() => window.location.reload()}>Retry</button>
//                 </div>
//             </div>
//         );
//     }

//     // Payment details view
//     if (selectedPayment) {
//         const payment = payments.find(p => p.id === selectedPayment);

//         if (!payment) {
//             return (
//                 <div className="vendor-payments-page">
//                     <div className="error-container">
//                         <p>Payment not found</p>
//                         <button onClick={() => setSelectedPayment(null)}>Back to Payments</button>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="vendor-payments-page">
//                 <div className="payment-detail-header">
//                     <button
//                         className="back-button"
//                         onClick={() => setSelectedPayment(null)}
//                     >
//                         ← Back to Payments
//                     </button>
//                     <h1>Payment Details</h1>
//                 </div>

//                 <div className="payment-detail-container">
//                     <div className="payment-detail-grid">
//                         {/* Transaction Information */}
//                         <div className="detail-card">
//                             <h3>Transaction Information</h3>
//                             <div className="detail-content">
//                                 <p><strong>Payment ID:</strong> {payment.id}</p>
//                                 <p><strong>Transaction ID:</strong> {payment.transactionId || '- will update later'}</p>
//                                 <p><strong>Order ID:</strong> {payment.orderId || '- will update later'}</p>
//                                 <p><strong>Date:</strong> {formatDate(payment.transactionDate)}</p>
//                             </div>
//                         </div>

//                         {/* Amount */}
//                         <div className="detail-card">
//                             <h3>Amount</h3>
//                             <div className="detail-content">
//                                 <div className="amount-row">
//                                     <span>Vendor Amount:</span>
//                                     <span className="amount">{formatCurrency(payment.vendorAmount)}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Customer Information */}
//                         <div className="detail-card">
//                             <h3>Customer Information</h3>
//                             <div className="detail-content">
//                                 <p><User size={16} /> <strong>{payment.customer?.fullName || '- will update later'}</strong></p>
                             
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="vendor-payments-page">
//             {/* Header */}
//             <div className="page-header">
//                 <div className="header-content">
//                     <h1>Payment Management</h1>
//                     <p>Track earnings for <strong>{vendorShop?.name || 'Your Restaurant'}</strong></p>
//                 </div>
//                 <div className="header-buttons">
//                     <button className="export-button" onClick={exportPayments}>
//                         <Download size={16} />
//                         Export
//                     </button>
//                 </div>
//             </div>

//             {/* Statistics Cards */}
//             <div className="stats-grid">
//                 <div className="stat-card revenue">
//                     <div className="stat-icon">
//                         <TrendingUp size={24} />
//                     </div>
//                     <div className="stat-content">
//                         <div className="stat-value">{formatCurrency(paymentStats.totalVendorAmount)}</div>
//                         <div className="stat-label">Total Vendor Earnings</div>
//                     </div>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="filters-section">
//                 <div className="search-container">
//                     <Search size={16} />
//                     <input
//                         type="text"
//                         placeholder="Search by payment ID, order ID, transaction ID, or customer..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>

//                 <div className="filter-controls">
//                     <select
//                         value={dateFilter}
//                         onChange={(e) => setDateFilter(e.target.value)}
//                     >
//                         <option value="all">All Time</option>
//                         <option value="today">Today</option>
//                         <option value="yesterday">Yesterday</option>
//                         <option value="week">This Week</option>
//                         <option value="month">This Month</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Payments Table */}
//             <div className="payments-section">
//                 {filteredPayments.length === 0 ? (
//                     <div className="empty-state">
//                         <FileText size={48} />
//                         <h3>No Payments Found</h3>
//                         <p>
//                             Payment records are automatically generated from your delivered orders.
//                         </p>
//                         {vendorShop && (
//                             <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
//                                 <p>Connected to: <strong>{vendorShop.name}</strong></p>
//                                 <p>Payments are automatically generated when orders are marked as delivered.</p>
//                             </div>
//                         )}
//                     </div>
//                 ) : (
//                     <div className="payments-table-container">
//                         <table className="payments-table">
//                             <thead>
//                                 <tr>
//                                     <th onClick={() => handleSort('date')}>
//                                         Date {getSortIcon('date')}
//                                     </th>
//                                     <th onClick={() => handleSort('customer')}>
//                                         Customer {getSortIcon('customer')}
//                                     </th>
//                                     <th onClick={() => handleSort('amount')}>
//                                         Vendor Amount {getSortIcon('amount')}
//                                     </th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filteredPayments.map(payment => (
//                                     <tr key={payment.id} className="payment-row">
//                                         <td>
//                                             <div className="date-cell">
//                                                 <Calendar size={14} />
//                                                 <span>{formatDate(payment.transactionDate)}</span>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className="customer-cell">
//                                                 <User size={14} />
//                                                 <div>
//                                                     <div className="customer-name">{payment.customer?.fullName || '- will update later'}</div>
//                                                     <div className="order-id">Order: #{payment.orderId || '- will update later'}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="amount-cell">
//                                             {formatCurrency(payment.vendorAmount)}
//                                         </td>
//                                         <td>
//                                             <div className="actions-cell">
//                                                 <button
//                                                     className="view-button"
//                                                     onClick={() => setSelectedPayment(payment.id)}
//                                                     title="View Details"
//                                                 >
//                                                     <Eye size={16} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VendorPaymentsPage;


import React, { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import {
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    User,
    Eye,
    Search,
    Download,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    FileText,
    AlertTriangle,
    Shield
} from 'lucide-react';
import './VendorPaymentsPage.css';

const VendorPaymentsPage = () => {
    // State management
    const [currentVendor, setCurrentVendor] = useState(null);
    const [vendorShop, setVendorShop] = useState(null);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [vendorPrices, setVendorPrices] = useState({});

    // Filter and sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');

    // Statistics
    const [paymentStats, setPaymentStats] = useState({
        totalVendorAmount: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        pendingAmount: 0,
        completedAmount: 0
    });

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
                        const matchingShop = Object.entries(shopsData).find(([shopId, shopData]) => {
                            const userEmail = user.email?.toLowerCase();
                            const shopEmail = shopData.email?.toLowerCase();
                            return shopEmail === userEmail ||
                                shopData.owner?.toLowerCase() === userEmail ||
                                shopData.ownerEmail?.toLowerCase() === userEmail;
                        });

                        if (matchingShop) {
                            const [shopId, shopData] = matchingShop;
                            setVendorShop({ id: shopId, ...shopData });
                            
                            // Get vendor prices if available
                            if (shopData.vendorPrices) {
                                setVendorPrices(shopData.vendorPrices);
                            }
                        } else {
                            setError(`No shop found for email: ${user.email}`);
                        }
                    }
                } catch (err) {
                    setError('Failed to load vendor information.');
                }
            } else {
                setCurrentVendor(null);
                setVendorShop(null);
                setError('Please log in to view payments.');
            }
            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    // Fetch real payment data from Firebase
    useEffect(() => {
        if (!vendorShop) return;

        setLoading(true);
        
        // Reference to the payments collection in Firebase
        const paymentsRef = ref(db, 'payments');
        
        const unsubscribe = onValue(paymentsRef, (snapshot) => {
            try {
                if (!snapshot.exists()) {
                    setPayments([]);
                    setLoading(false);
                    return;
                }

                const data = snapshot.val();
                const paymentsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));

                // Filter payments for this vendor only
                const vendorPayments = paymentsArray.filter(payment => 
                    payment.vendorId === vendorShop.id ||
                    (payment.vendorName && vendorShop.name && 
                     payment.vendorName.toLowerCase() === vendorShop.name.toLowerCase())
                );

                // Sort by date (newest first)
                vendorPayments.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

                setPayments(vendorPayments);
                calculateStats(vendorPayments);
                setLoading(false);

            } catch (err) {
                console.error('Error processing payments:', err);
                setError('Failed to load payment data.');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [vendorShop]);

    // Also fetch itemPayments for quick status lookup
    useEffect(() => {
        if (!vendorShop) return;
        
        const itemPaymentsRef = ref(db, 'itemPayments');
        
        const unsubscribe = onValue(itemPaymentsRef, (snapshot) => {
            if (!snapshot.exists()) return;
            
            try {
                const data = snapshot.val();
                
                // Update any matching payments with status from itemPayments
                setPayments(prevPayments => {
                    const updatedPayments = [...prevPayments];
                    
                    updatedPayments.forEach(payment => {
                        if (payment.itemId && data[payment.itemId]) {
                            payment.status = data[payment.itemId].status || payment.status;
                            payment.lastStatusCheck = data[payment.itemId].lastChecked;
                        }
                    });
                    
                    return updatedPayments;
                });
                
                // Recalculate stats with updated statuses
                calculateStats(payments);
                
            } catch (err) {
                console.error('Error processing item payments:', err);
            }
        });
        
        return () => unsubscribe();
    }, [vendorShop, payments.length]);

    // Calculate payment statistics
    const calculateStats = (paymentsList) => {
        const stats = {
            totalVendorAmount: 0,
            totalTransactions: paymentsList.length,
            avgTransactionValue: 0,
            pendingAmount: 0,
            completedAmount: 0
        };

        paymentsList.forEach(payment => {
            const amount = payment.amount || 0;
            stats.totalVendorAmount += amount;
            
            // Track amounts by status
            if (payment.status === 'completed') {
                stats.completedAmount += amount;
            } else if (payment.status === 'initiated' || payment.status === 'processing') {
                stats.pendingAmount += amount;
            }
        });

        stats.avgTransactionValue = stats.totalTransactions > 0
            ? stats.totalVendorAmount / stats.totalTransactions
            : 0;

        setPaymentStats(stats);
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    // Sort payments
    const sortPayments = (paymentsList) => {
        return [...paymentsList].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'amount':
                    aValue = a.amount || 0;
                    bValue = b.amount || 0;
                    break;
                case 'date':
                    aValue = new Date(a.createdAt || a.timestamp);
                    bValue = new Date(b.createdAt || b.timestamp);
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                case 'item':
                    aValue = a.itemName || '';
                    bValue = b.itemName || '';
                    break;
                default:
                    aValue = new Date(a.createdAt || a.timestamp);
                    bValue = new Date(b.createdAt || b.timestamp);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Filter payments
    useEffect(() => {
        let filtered = [...payments];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.merchant_ref_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.payout_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment.status === statusFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));

            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.createdAt || payment.timestamp);

                switch (dateFilter) {
                    case 'today':
                        return paymentDate >= today;
                    case 'yesterday':
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        return paymentDate >= yesterday && paymentDate < today;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return paymentDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return paymentDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = sortPayments(filtered);
        setFilteredPayments(sorted);
    }, [payments, searchTerm, dateFilter, sortBy, sortOrder, statusFilter]);

    // Check payment status from API
    const checkPaymentStatus = async (payment) => {
        if (!payment.merchant_ref_id) {
            return { success: false, message: 'No reference ID available' };
        }
        
        try {
            // Set loading state for this payment
            setPayments(prevPayments => 
                prevPayments.map(p => 
                    p.id === payment.id ? { ...p, checkingStatus: true } : p
                )
            );
            
            // Call the status check API
            const response = await fetch(`http://localhost:5000/api/vendor-transfer-status/${payment.merchant_ref_id}`);
            const result = await response.json();
            
            if (result.status === 1) {
                // Update payment status in Firebase
                if (payment.itemId) {
                    const itemPaymentRef = ref(db, `itemPayments/${payment.itemId}`);
                    await update(itemPaymentRef, {
                        status: result.data.payout_status,
                        lastChecked: new Date().toISOString()
                    });
                }
                
                // Update local state
                setPayments(prevPayments => 
                    prevPayments.map(p => 
                        p.id === payment.id ? 
                        { 
                            ...p, 
                            status: result.data.payout_status,
                            lastStatusCheck: new Date().toISOString(),
                            checkingStatus: false
                        } : p
                    )
                );
                
                return { 
                    success: true, 
                    status: result.data.payout_status,
                    message: `Payment status: ${result.data.payout_status}`
                };
            } else {
                throw new Error(result.msg || 'Failed to check status');
            }
            
        } catch (error) {
            console.error('Error checking payment status:', error);
            
            // Update local state to show error
            setPayments(prevPayments => 
                prevPayments.map(p => 
                    p.id === payment.id ? { ...p, checkingStatus: false, statusError: true } : p
                )
            );
            
            return { success: false, message: error.message };
            
        }
    };

    // Export payments to CSV
    const exportPayments = () => {
        const csvData = filteredPayments.map(payment => ({
            'Payment ID': payment.id || '',
            'Reference ID': payment.merchant_ref_id || '',
            'Payout ID': payment.payout_id || '',
            'Item': payment.itemName || '',
            'Quantity': payment.quantity || '',
            'Date': formatDate(payment.createdAt || payment.timestamp),
            'Amount': formatCurrency(payment.amount || 0),
            'Status': payment.status || 'unknown',
            'Last Updated': payment.lastStatusCheck ? formatDate(payment.lastStatusCheck) : 'N/A'
        }));

        if (csvData.length === 0) {
            alert('No payments to export');
            return;
        }

        const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vendor_payments_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Format date
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

    // Get sort icon
    const getSortIcon = (field) => {
        if (sortBy !== field) return <ArrowUpDown size={14} className="sort-icon" />;
        return sortOrder === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="status-badge completed"><CheckCircle size={14} /> Completed</span>;
            case 'initiated':
                return <span className="status-badge initiated"><Clock size={14} /> Initiated</span>;
            case 'processing':
                return <span className="status-badge processing"><RefreshCw size={14} /> Processing</span>;
            case 'failed':
                return <span className="status-badge failed"><XCircle size={14} /> Failed</span>;
            default:
                return <span className="status-badge unknown"><AlertTriangle size={14} /> Unknown</span>;
        }
    };

    if (loading) {
        return (
            <div className="vendor-payments-page">
                <div className="loading-container">
                    <RefreshCw className="loading-spinner" />
                    <p>Loading payment data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="vendor-payments-page">
                <div className="error-container">
                    <XCircle className="error-icon" />
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    // Payment details view
    if (selectedPayment) {
        const payment = payments.find(p => p.id === selectedPayment);

        if (!payment) {
            return (
                <div className="vendor-payments-page">
                    <div className="error-container">
                        <p>Payment not found</p>
                        <button onClick={() => setSelectedPayment(null)}>Back to Payments</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="vendor-payments-page">
                <div className="payment-detail-header">
                    <button
                        className="back-button"
                        onClick={() => setSelectedPayment(null)}
                    >
                        ← Back to Payments
                    </button>
                    <h1>Payment Details</h1>
                </div>

                <div className="payment-detail-container">
                    <div className="payment-detail-grid">
                        {/* Transaction Information */}
                        <div className="detail-card">
                            <h3>Transaction Information</h3>
                            <div className="detail-content">
                                <p><strong>Payment ID:</strong> {payment.id}</p>
                                <p><strong>Reference ID:</strong> {payment.merchant_ref_id || 'N/A'}</p>
                                <p><strong>Payout ID:</strong> {payment.payout_id || 'N/A'}</p>
                                <p><strong>Date:</strong> {formatDate(payment.createdAt || payment.timestamp)}</p>
                                <p><strong>Status:</strong> {getStatusBadge(payment.status)}</p>
                                <p><strong>Last Status Check:</strong> {payment.lastStatusCheck ? formatDate(payment.lastStatusCheck) : 'Not checked yet'}</p>
                                
                                {payment.merchant_ref_id && (
                                    <button 
                                        className="check-status-button"
                                        onClick={() => checkPaymentStatus(payment)}
                                        disabled={payment.checkingStatus}
                                    >
                                        {payment.checkingStatus ? (
                                            <><RefreshCw size={14} className="spinning" /> Checking Status...</>
                                        ) : (
                                            <><RefreshCw size={14} /> Check Latest Status</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="detail-card">
                            <h3>Amount</h3>
                            <div className="detail-content">
                                <div className="amount-row">
                                    <span>Total Amount:</span>
                                    <span className="amount">{formatCurrency(payment.amount || 0)}</span>
                                </div>
                                {payment.quantity && (
                                    <div className="amount-detail">
                                        <span>Item Quantity:</span>
                                        <span>{payment.quantity}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Item Information */}
                        <div className="detail-card">
                            <h3>Item Information</h3>
                            <div className="detail-content">
                                <p><strong>Item Name:</strong> {payment.itemName || 'N/A'}</p>
                                <p><strong>Payment Method:</strong> {payment.paymentMethod || 'N/A'}</p>
                                {payment.paymentDetails && payment.paymentMethod === 'BANK' && (
                                    <>
                                        <p><strong>Account Holder:</strong> {payment.paymentDetails.accountHolderName || 'N/A'}</p>
                                        <p><strong>Account Number:</strong> ******{payment.paymentDetails.accountNumber?.slice(-4) || 'N/A'}</p>
                                        <p><strong>IFSC Code:</strong> {payment.paymentDetails.ifscCode || 'N/A'}</p>
                                    </>
                                )}
                                {payment.paymentDetails && payment.paymentMethod === 'UPI' && (
                                    <p><strong>UPI ID:</strong> {payment.paymentDetails.upiId || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="vendor-payments-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>Payment Management</h1>
                    <p>Track earnings for <strong>{vendorShop?.name || 'Your Restaurant'}</strong></p>
                </div>
                <div className="header-buttons">
                    <button className="export-button" onClick={exportPayments}>
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <div className="stat-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formatCurrency(paymentStats.totalVendorAmount)}</div>
                        <div className="stat-label">Total Vendor Earnings</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-container">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by reference ID, item name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="initiated">Initiated</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="payments-section">
                {filteredPayments.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No Payments Found</h3>
                        <p>
                            No payment records found matching your current filters.
                        </p>
                        {vendorShop && (
                            <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                                <p>Connected to: <strong>{vendorShop.name}</strong></p>
                                <p>Payments will appear here when they are processed through the system.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="payments-table-container">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('date')}>
                                        Date {getSortIcon('date')}
                                    </th>
                                    <th onClick={() => handleSort('item')}>
                                        Item {getSortIcon('item')}
                                    </th>
                                    <th onClick={() => handleSort('amount')}>
                                        Amount {getSortIcon('amount')}
                                    </th>
                                    <th onClick={() => handleSort('status')}>
                                        Status {getSortIcon('status')}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="payment-row">
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                <span>{formatDate(payment.createdAt || payment.timestamp)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="item-cell">
                                                <div className="item-name">{payment.itemName || 'Unknown Item'}</div>
                                                <div className="ref-id">Ref: {payment.merchant_ref_id || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="amount-cell">
                                            {formatCurrency(payment.amount || 0)}
                                        </td>
                                        <td className="status-cell">
                                            {getStatusBadge(payment.status)}
                                            {payment.checkingStatus && (
                                                <span className="checking-status-indicator">
                                                    <RefreshCw size={12} className="spinning" /> Checking...
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="view-button"
                                                    onClick={() => setSelectedPayment(payment.id)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {payment.merchant_ref_id && (
                                                    <button
                                                        className="status-button"
                                                        onClick={() => checkPaymentStatus(payment)}
                                                        disabled={payment.checkingStatus}
                                                        title="Check Status"
                                                    >
                                                        <RefreshCw size={16} className={payment.checkingStatus ? 'spinning' : ''} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorPaymentsPage;