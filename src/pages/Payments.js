



// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, get } from 'firebase/database';
// import { onAuthStateChanged } from 'firebase/auth';
// import { db, auth } from '../services/firebase';
// import {
//     CreditCard,
//     DollarSign,
//     TrendingUp,
//     TrendingDown,
//     Clock,
//     CheckCircle,
//     XCircle,
//     RefreshCw,
//     User,
//     Calendar,
//     Eye,
//     Filter,
//     Search,
//     Download,
//     ArrowUpDown,
//     ArrowUp,
//     ArrowDown,
//     Smartphone,
//     Banknote,
//     Wallet,
//     AlertCircle,
//     FileText,
//     MoreHorizontal
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

//     // Filter and sort states
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [methodFilter, setMethodFilter] = useState('all');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [dateFilter, setDateFilter] = useState('all');
//     const [sortBy, setSortBy] = useState('date');
//     const [sortOrder, setSortOrder] = useState('desc');

//     // Statistics
//     const [paymentStats, setPaymentStats] = useState({
//         totalRevenue: 0,
//         pendingAmount: 0,
//         paidAmount: 0,
//         refundedAmount: 0,
//         totalTransactions: 0,
//         avgTransactionValue: 0,
//         commissionPaid: 0,
//         netEarnings: 0
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

//     // Fetch orders and convert delivered orders to payment records
//     useEffect(() => {
//         if (!vendorShop) return;

//         setLoading(true);
//         const ordersRef = ref(db, 'orders');

//         const unsubscribe = onValue(ordersRef, (snapshot) => {
//             try {
//                 if (!snapshot.exists()) {
//                     setPayments([]);
//                     setLoading(false);
//                     return;
//                 }

//                 const data = snapshot.val();
//                 const ordersArray = Object.keys(data).map(key => ({
//                     id: key,
//                     ...data[key]
//                 }));

//                 // Filter orders for this vendor (same logic as orders page)
//                 const vendorOrders = ordersArray.filter(order => {
//                     if (!order) return false;

//                     // Check if order is assigned to this vendor (multiple matching strategies)
//                     if (order.vendor) {
//                         const match =
//                             order.vendor.id === vendorShop.id ||
//                             (order.vendor.name && vendorShop.name &&
//                                 order.vendor.name.toLowerCase() === vendorShop.name.toLowerCase()) ||
//                             (order.vendor.email && vendorShop.email &&
//                                 order.vendor.email.toLowerCase() === vendorShop.email.toLowerCase()) ||
//                             (order.vendor.name && vendorShop.name &&
//                                 order.vendor.name.toLowerCase().includes(vendorShop.name.toLowerCase()));

//                         if (match) return true;
//                     }

//                     // Check assigned vendor
//                     if (order.assignedVendor) {
//                         const match =
//                             order.assignedVendor.id === vendorShop.id ||
//                             (order.assignedVendor.name && vendorShop.name &&
//                                 order.assignedVendor.name.toLowerCase() === vendorShop.name.toLowerCase());

//                         if (match) return true;
//                     }

//                     return false;
//                 });

//                 // Convert delivered orders to payment records
//                 const paymentRecords = vendorOrders.map(order => {
//                     const amount = order.totalAmount || 0;
//                     const commission = Math.round(amount * 0.10); // 10% commission
//                     const paymentStatus = getPaymentStatus(order.status);

//                     return {
//                         id: `pay_${order.id}`,
//                         orderId: order.id,
//                         transactionId: `txn_${order.id.slice(-8)}`,
//                         amount: amount,
//                         commission: commission,
//                         paymentMethod: order.paymentMethod || 'cash',
//                         status: paymentStatus,
//                         transactionDate: order.orderDate,
//                         customer: order.customer,
//                         gateway: order.paymentMethod === 'card' ? 'Razorpay' :
//                             order.paymentMethod === 'upi' ? 'UPI Gateway' :
//                                 order.paymentMethod === 'wallet' ? 'Paytm' : 'Cash',
//                         reference: order.paymentReference || '- will update later',
//                         vendor: order.vendor || vendorShop
//                     };
//                 });

//                 // Sort by date (newest first)
//                 paymentRecords.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

//                 setPayments(paymentRecords);
//                 calculateStats(paymentRecords);
//                 setLoading(false);

//             } catch (err) {
//                 console.error('Error processing payments:', err);
//                 setError('Failed to load payment data.');
//                 setLoading(false);
//             }
//         });

//         return () => unsubscribe();
//     }, [vendorShop]);

//     // Helper function to determine payment status from order status
//     const getPaymentStatus = (orderStatus) => {
//         switch (orderStatus) {
//             case 'delivered':
//                 return 'completed';
//             case 'processing':
//             case 'prepared':
//             case 'ready_for_pickup':
//             case 'out_for_delivery':
//                 return 'pending';
//             case 'cancelled':
//                 return 'refunded';
//             case 'pending_confirmation':
//             case 'pending':
//                 return 'pending';
//             default:
//                 return 'pending';
//         }
//     };

//     // Calculate payment statistics
//     const calculateStats = (paymentsList) => {
//         const stats = {
//             totalRevenue: 0,
//             pendingAmount: 0,
//             paidAmount: 0,
//             refundedAmount: 0,
//             totalTransactions: paymentsList.length,
//             avgTransactionValue: 0,
//             commissionPaid: 0,
//             netEarnings: 0
//         };

//         paymentsList.forEach(payment => {
//             const amount = payment.amount || 0;
//             const commission = payment.commission || 0;

//             stats.totalRevenue += amount;
//             stats.commissionPaid += commission;

//             switch (payment.status) {
//                 case 'pending':
//                 case 'processing':
//                     stats.pendingAmount += amount;
//                     break;
//                 case 'completed':
//                 case 'paid':
//                     stats.paidAmount += amount;
//                     break;
//                 case 'refunded':
//                     stats.refundedAmount += amount;
//                     break;
//             }
//         });

//         stats.avgTransactionValue = stats.totalTransactions > 0
//             ? stats.totalRevenue / stats.totalTransactions
//             : 0;
//         stats.netEarnings = stats.paidAmount - stats.commissionPaid;

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
//                     aValue = a.amount || 0;
//                     bValue = b.amount || 0;
//                     break;
//                 case 'date':
//                     aValue = new Date(a.transactionDate);
//                     bValue = new Date(b.transactionDate);
//                     break;
//                 case 'customer':
//                     aValue = a.customer?.fullName || '';
//                     bValue = b.customer?.fullName || '';
//                     break;
//                 case 'status':
//                     aValue = a.status || '';
//                     bValue = b.status || '';
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

//         // Status filter
//         if (statusFilter !== 'all') {
//             filtered = filtered.filter(payment => payment.status === statusFilter);
//         }

//         // Method filter
//         if (methodFilter !== 'all') {
//             filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
//         }

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
//     }, [payments, statusFilter, methodFilter, searchTerm, dateFilter, sortBy, sortOrder]);

//     // Export payments to CSV
//     const exportPayments = () => {
//         const csvData = filteredPayments.map(payment => ({
//             'Payment ID': payment.id,
//             'Order ID': payment.orderId || '- will update later',
//             'Transaction ID': payment.transactionId || '- will update later',
//             'Customer Name': payment.customer?.fullName || '- will update later',
//             'Customer Phone': payment.customer?.phone || '- will update later',
//             'Date': formatDate(payment.transactionDate),
//             'Amount': payment.amount || 0,
//             'Payment Method': getPaymentMethodText(payment.paymentMethod),
//             'Status': getStatusText(payment.status),
//             'Commission': payment.commission || 0,
//             'Net Amount': (payment.amount || 0) - (payment.commission || 0),
//             'Gateway': payment.gateway || '- will update later',
//             'Reference': payment.reference || '- will update later'
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

//     // Get status icon
//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'pending': return <Clock className="status-icon pending" />;
//             case 'processing': return <RefreshCw className="status-icon processing" />;
//             case 'completed':
//             case 'paid': return <CheckCircle className="status-icon completed" />;
//             case 'failed': return <XCircle className="status-icon failed" />;
//             case 'refunded': return <TrendingDown className="status-icon refunded" />;
//             default: return <AlertCircle className="status-icon" />;
//         }
//     };

//     // Get status text
//     const getStatusText = (status) => {
//         switch (status) {
//             case 'pending': return 'Pending';
//             case 'processing': return 'Processing';
//             case 'completed': return 'Completed';
//             case 'paid': return 'Paid';
//             case 'failed': return 'Failed';
//             case 'refunded': return 'Refunded';
//             default: return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
//         }
//     };

//     // Get payment method icon
//     const getPaymentMethodIcon = (method) => {
//         switch (method) {
//             case 'card': return <CreditCard size={16} />;
//             case 'upi': return <Smartphone size={16} />;
//             case 'wallet': return <Wallet size={16} />;
//             case 'cash': return <Banknote size={16} />;
//             default: return <DollarSign size={16} />;
//         }
//     };

//     // Get payment method text
//     const getPaymentMethodText = (method) => {
//         switch (method) {
//             case 'card': return 'Credit/Debit Card';
//             case 'upi': return 'UPI';
//             case 'wallet': return 'Digital Wallet';
//             case 'cash': return 'Cash on Delivery';
//             default: return method?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
//         }
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
//                     <div className="payment-status-badge">
//                         {getStatusIcon(payment.status)}
//                         <span>{getStatusText(payment.status)}</span>
//                     </div>
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
//                                 <p><strong>Gateway:</strong> {payment.gateway || '- will update later'}</p>
//                                 <p><strong>Reference:</strong> {payment.reference || '- will update later'}</p>
//                                 <p><strong>Date:</strong> {formatDate(payment.transactionDate)}</p>
//                             </div>
//                         </div>

//                         {/* Amount Breakdown */}
//                         <div className="detail-card">
//                             <h3>Amount Breakdown</h3>
//                             <div className="detail-content">
//                                 <div className="amount-row">
//                                     <span>Order Amount:</span>
//                                     <span className="amount">{formatCurrency(payment.amount)}</span>
//                                 </div>
//                                 <div className="amount-row">
//                                     <span>Platform Commission (Profit):</span>
//                                     <span className="profit" style={{ color: '#16a34a', fontWeight: 'bold' }}>
//                                         +{formatCurrency(payment.commission || 0)}
//                                     </span>
//                                 </div>
//                                 <hr />
//                                 <div className="amount-row total">
//                                     <span><strong>Net Amount:</strong></span>
//                                     <span className="net-amount">
//                                         <strong>{formatCurrency((payment.amount || 0) - (payment.commission || 0))}</strong>
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Customer Information */}
//                         <div className="detail-card">
//                             <h3>Customer Information</h3>
//                             <div className="detail-content">
//                                 <p><User size={16} /> <strong>{payment.customer?.fullName || '- will update later'}</strong></p>
//                                 <p><CreditCard size={16} /> {payment.customer?.phone || '- will update later'}</p>
//                                 <p>{getPaymentMethodIcon(payment.paymentMethod)} {getPaymentMethodText(payment.paymentMethod)}</p>
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
//                     <p>Track earnings and transactions for <strong>{vendorShop?.name || 'Your Restaurant'}</strong></p>
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
//                         <div className="stat-value">{formatCurrency(paymentStats.totalRevenue)}</div>
//                         <div className="stat-label">Total Revenue</div>
//                     </div>
//                 </div>

//                 <div className="stat-card pending">
//                     <div className="stat-icon">
//                         <Clock size={24} />
//                     </div>
//                     <div className="stat-content">
//                         <div className="stat-value">{formatCurrency(paymentStats.pendingAmount)}</div>
//                         <div className="stat-label">Pending Payments</div>
//                     </div>
//                 </div>

//                 <div className="stat-card completed">
//                     <div className="stat-icon">
//                         <CheckCircle size={24} />
//                     </div>
//                     <div className="stat-content">
//                         <div className="stat-value">{formatCurrency(paymentStats.paidAmount)}</div>
//                         <div className="stat-label">Completed Payments</div>
//                     </div>
//                 </div>

//                 <div className="stat-card net">
//                     <div className="stat-icon">
//                         <span className="stat-icon1">₹</span>
//                     </div>
//                     <div className="stat-content">
//                         <div className="stat-value">{formatCurrency(paymentStats.netEarnings)}</div>
//                         <div className="stat-label">Net Earnings</div>
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
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                     >
//                         <option value="all">All Status</option>
//                         <option value="pending">Pending</option>
//                         <option value="processing">Processing</option>
//                         <option value="completed">Completed</option>
//                         <option value="failed">Failed</option>
//                         <option value="refunded">Refunded</option>
//                     </select>

//                     <select
//                         value={methodFilter}
//                         onChange={(e) => setMethodFilter(e.target.value)}
//                     >
//                         <option value="all">All Methods</option>
//                         <option value="card">Credit/Debit Card</option>
//                         <option value="upi">UPI</option>
//                         <option value="wallet">Digital Wallet</option>
//                         <option value="cash">Cash on Delivery</option>
//                     </select>

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
//                         <CreditCard size={48} />
//                         <h3>No Payments Found</h3>
//                         <p>
//                             {statusFilter === 'all'
//                                 ? "Payment records are automatically generated from your delivered orders."
//                                 : `No payments found with status: ${getStatusText(statusFilter)}`
//                             }
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
//                                     <th>Payment Method</th>
//                                     <th onClick={() => handleSort('amount')}>
//                                         Amount {getSortIcon('amount')}
//                                     </th>
//                                     <th>Commission</th>
//                                     <th>Net Amount</th>
//                                     <th onClick={() => handleSort('status')}>
//                                         Status {getSortIcon('status')}
//                                     </th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filteredPayments.map(payment => (
//                                     <tr key={payment.id} className={`payment-row ${payment.status}`}>
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
//                                         <td>
//                                             <div className="method-cell">
//                                                 <div>
//                                                     <Banknote size={16} />
//                                                 </div>
//                                                 <span>{getPaymentMethodText(payment.paymentMethod)}</span>
//                                             </div>
//                                         </td>
//                                         <td className="amount-cell">
//                                             {formatCurrency(payment.amount)}
//                                         </td>
//                                         <td className="commission-cell" style={{ color: '#16a34a', fontWeight: 'bold' }}>
//                                             +{formatCurrency(payment.commission || 0)}
//                                         </td>
//                                         <td className="net-amount-cell">
//                                             <strong>{formatCurrency((payment.amount || 0) - (payment.commission || 0))}</strong>
//                                         </td>
//                                         <td>
//                                             <div className="status-cell">
//                                                 {getStatusIcon(payment.status)}
//                                                 <span>{getStatusText(payment.status)}</span>
//                                             </div>
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
    FileText
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

    // Statistics
    const [paymentStats, setPaymentStats] = useState({
        totalVendorAmount: 0,
        totalTransactions: 0,
        avgTransactionValue: 0
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

    // Helper function to get vendor price for an item
    const getVendorPrice = (itemId, orderAmount) => {
        // First check if there's a custom vendor price
        const customVendorPrice = vendorPrices[itemId]?.price;
        if (customVendorPrice !== undefined) return customVendorPrice;
        
        // If no custom price, calculate 90% of order amount (removing the 10% commission)
        return Math.round(orderAmount * 0.90);
    };

    // Fetch orders and convert delivered orders to payment records
    useEffect(() => {
        if (!vendorShop) return;

        setLoading(true);
        const ordersRef = ref(db, 'orders');
        const itemsRef = ref(db, 'items');

        // First get all items to have their data available
        get(itemsRef).then((itemsSnapshot) => {
            const itemsData = itemsSnapshot.exists() ? itemsSnapshot.val() : {};
            
            const unsubscribe = onValue(ordersRef, (snapshot) => {
                try {
                    if (!snapshot.exists()) {
                        setPayments([]);
                        setLoading(false);
                        return;
                    }

                    const data = snapshot.val();
                    const ordersArray = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));

                    // Filter orders for this vendor
                    const vendorOrders = ordersArray.filter(order => {
                        if (!order) return false;

                        // Check if order is assigned to this vendor
                        if (order.vendor) {
                            const match =
                                order.vendor.id === vendorShop.id ||
                                (order.vendor.name && vendorShop.name &&
                                    order.vendor.name.toLowerCase() === vendorShop.name.toLowerCase()) ||
                                (order.vendor.email && vendorShop.email &&
                                    order.vendor.email.toLowerCase() === vendorShop.email.toLowerCase()) ||
                                (order.vendor.name && vendorShop.name &&
                                    order.vendor.name.toLowerCase().includes(vendorShop.name.toLowerCase()));

                            if (match) return true;
                        }

                        // Check assigned vendor
                        if (order.assignedVendor) {
                            const match =
                                order.assignedVendor.id === vendorShop.id ||
                                (order.assignedVendor.name && vendorShop.name &&
                                    order.assignedVendor.name.toLowerCase() === vendorShop.name.toLowerCase());

                            if (match) return true;
                        }

                        return false;
                    });

                    // Convert delivered orders to payment records
                    const paymentRecords = vendorOrders.map(order => {
                        const amount = order.totalAmount || 0;
                        const itemId = order.items && order.items.length > 0 ? order.items[0].id : null;
                        const vendorAmount = getVendorPrice(itemId, amount);

                        return {
                            id: `pay_${order.id}`,
                            orderId: order.id,
                            transactionId: `txn_${order.id.slice(-8)}`,
                            amount: amount,
                            vendorAmount: vendorAmount,
                            transactionDate: order.orderDate,
                            customer: order.customer,
                            reference: order.paymentReference || '- will update later',
                            vendor: order.vendor || vendorShop
                        };
                    });

                    // Sort by date (newest first)
                    paymentRecords.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

                    setPayments(paymentRecords);
                    calculateStats(paymentRecords);
                    setLoading(false);

                } catch (err) {
                    console.error('Error processing payments:', err);
                    setError('Failed to load payment data.');
                    setLoading(false);
                }
            });

            return () => unsubscribe();
        }).catch(err => {
            console.error('Error fetching items:', err);
            setError('Failed to load item data.');
            setLoading(false);
        });
    }, [vendorShop, vendorPrices]);

    // Calculate payment statistics
    const calculateStats = (paymentsList) => {
        const stats = {
            totalVendorAmount: 0,
            totalTransactions: paymentsList.length,
            avgTransactionValue: 0
        };

        paymentsList.forEach(payment => {
            stats.totalVendorAmount += payment.vendorAmount || 0;
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
                    aValue = a.vendorAmount || 0;
                    bValue = b.vendorAmount || 0;
                    break;
                case 'date':
                    aValue = new Date(a.transactionDate);
                    bValue = new Date(b.transactionDate);
                    break;
                case 'customer':
                    aValue = a.customer?.fullName || '';
                    bValue = b.customer?.fullName || '';
                    break;
                default:
                    aValue = a.transactionDate;
                    bValue = b.transactionDate;
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
                payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.customer?.phone?.includes(searchTerm)
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));

            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.transactionDate);

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
    }, [payments, searchTerm, dateFilter, sortBy, sortOrder]);

    // Export payments to CSV
    const exportPayments = () => {
        const csvData = filteredPayments.map(payment => ({
            'Payment ID': payment.id,
            'Order ID': payment.orderId || '- will update later',
            'Transaction ID': payment.transactionId || '- will update later',
            'Customer Name': payment.customer?.fullName || '- will update later',
            'Customer Phone': payment.customer?.phone || '- will update later',
            'Date': formatDate(payment.transactionDate),
            'Vendor Amount': formatCurrency(payment.vendorAmount || 0)
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
                                <p><strong>Transaction ID:</strong> {payment.transactionId || '- will update later'}</p>
                                <p><strong>Order ID:</strong> {payment.orderId || '- will update later'}</p>
                                <p><strong>Date:</strong> {formatDate(payment.transactionDate)}</p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="detail-card">
                            <h3>Amount</h3>
                            <div className="detail-content">
                                <div className="amount-row">
                                    <span>Vendor Amount:</span>
                                    <span className="amount">{formatCurrency(payment.vendorAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="detail-card">
                            <h3>Customer Information</h3>
                            <div className="detail-content">
                                <p><User size={16} /> <strong>{payment.customer?.fullName || '- will update later'}</strong></p>
                             
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
                        placeholder="Search by payment ID, order ID, transaction ID, or customer..."
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
                </div>
            </div>

            {/* Payments Table */}
            <div className="payments-section">
                {filteredPayments.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No Payments Found</h3>
                        <p>
                            Payment records are automatically generated from your delivered orders.
                        </p>
                        {vendorShop && (
                            <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                                <p>Connected to: <strong>{vendorShop.name}</strong></p>
                                <p>Payments are automatically generated when orders are marked as delivered.</p>
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
                                    <th onClick={() => handleSort('customer')}>
                                        Customer {getSortIcon('customer')}
                                    </th>
                                    <th onClick={() => handleSort('amount')}>
                                        Vendor Amount {getSortIcon('amount')}
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
                                                <span>{formatDate(payment.transactionDate)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="customer-cell">
                                                <User size={14} />
                                                <div>
                                                    <div className="customer-name">{payment.customer?.fullName || '- will update later'}</div>
                                                    <div className="order-id">Order: #{payment.orderId || '- will update later'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="amount-cell">
                                            {formatCurrency(payment.vendorAmount)}
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