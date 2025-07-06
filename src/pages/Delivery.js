



// import React, { useState, useEffect } from 'react';
// import { getDatabase, ref, onValue, query, orderByChild, startAt, endAt } from 'firebase/database';
// import { useAuth } from '../contexts/AuthContext';
// import { 
//   Truck, 
//   MapPin, 
//   Phone, 
//   User, 
//   Clock, 
//   Calendar,
//   Search,
//   CheckCircle,
//   AlertTriangle,
//   Package,
//   FileText,
//   FileSpreadsheet
// } from 'lucide-react';
// import './Delivery.css';

// const Delivery = () => {
//   const { currentUser } = useAuth();
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState('all');
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [shopId, setShopId] = useState(null);
//   const [allDeliveries, setAllDeliveries] = useState([]);
//   const [exporting, setExporting] = useState(false);

//   useEffect(() => {
//     const fetchVendorInfo = async () => {
//       if (!currentUser) return;
      
//       try {
//         const db = getDatabase();
//         const shopsRef = ref(db, 'shops');
        
//         onValue(shopsRef, (snapshot) => {
//           if (snapshot.exists()) {
//             const shops = snapshot.val();
            
//             // Find the shop that matches the current user's email
//             let foundShopId = null;
            
//             Object.entries(shops).forEach(([id, shop]) => {
//               if (shop.email === currentUser.email) {
//                 foundShopId = id;
//               }
//             });
            
//             if (foundShopId) {
//               setShopId(foundShopId);
//               fetchDeliveries(foundShopId);
//             } else {
//               setError("Shop not found for this vendor");
//               setLoading(false);
//             }
//           } else {
//             setError("No shops found in database");
//             setLoading(false);
//           }
//         });
//       } catch (err) {
//         console.error("Error fetching vendor data:", err);
//         setError("Failed to load vendor data");
//         setLoading(false);
//       }
//     };

//     fetchVendorInfo();
//   }, [currentUser]);

//   const fetchDeliveries = (vendorId) => {
//     try {
//       const db = getDatabase();
//       const ordersRef = ref(db, 'orders');
      
//       // Fetch all orders without date filtering initially
//       onValue(ordersRef, (snapshot) => {
//         if (snapshot.exists()) {
//           const ordersData = snapshot.val();
//           const ordersArray = [];
          
//           Object.keys(ordersData).forEach(key => {
//             const order = ordersData[key];
            
//             // Only include orders for this vendor - check multiple possible vendor ID fields
//             const isVendorMatch = (
//               (order.vendor && order.vendor.id === vendorId) ||
//               (order.vendor && order.vendor.shopId === vendorId) ||
//               (order.shopId === vendorId) ||
//               (order.vendorId === vendorId)
//             );
            
//             if (isVendorMatch) {
//               // Convert order to delivery format
//               const deliveryStatus = getDeliveryStatus(order.status);
              
//               const deliveryData = {
//                 id: key,
//                 orderId: `ORD-${key.substring(0, 5)}`,
//                 customerName: order.customer?.fullName || 'Unknown Customer',
//                 customerAddress: order.customer?.address || 'Address not provided',
//                 customerPhone: order.customer?.phone || 'Phone not provided',
//                 items: order.items || [],
//                 itemCount: order.items?.length || 0,
//                 totalAmount: order.totalAmount || 0,
//                 status: deliveryStatus,
//                 orderStatus: order.status,
//                 timestamp: order.orderDate ? new Date(order.orderDate).getTime() : Date.now(),
//                 orderDate: order.orderDate || new Date().toISOString(),
//                 estimatedDelivery: order.estimatedDelivery,
//                 deliveryPerson: order.deliveryPerson || null,
//                 deliveryNotes: order.deliveryNotes || '',
//                 shopName: order.vendor?.name || 'Your Shop',
//                 shopAddress: order.vendor?.address || '',
//               };
              
//               ordersArray.push(deliveryData);
//             }
//           });
          
//           // Sort by date (newest first)
//           ordersArray.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          
//           setAllDeliveries(ordersArray);
//           setDeliveries(ordersArray); // Initially show all
//           setLoading(false);
//         } else {
//           setDeliveries([]);
//           setAllDeliveries([]);
//           setLoading(false);
//         }
//       });
//     } catch (err) {
//       console.error("Error fetching deliveries:", err);
//       setError("Failed to load deliveries");
//       setLoading(false);
      
//       // For development/demo purposes, use mock data
//       if (process.env.NODE_ENV === 'development') {
//         const mockData = getMockDeliveries();
//         setDeliveries(mockData);
//         setAllDeliveries(mockData);
//         setLoading(false);
//       }
//     }
//   };

//   // Apply date filtering when selectedDate changes
//   useEffect(() => {
//     if (selectedDate === 'all') {
//       setDeliveries(allDeliveries);
//     } else {
//       const startOfDay = new Date(selectedDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       const endOfDay = new Date(selectedDate);
//       endOfDay.setHours(23, 59, 59, 999);
      
//       const filteredByDate = allDeliveries.filter(delivery => {
//         const orderDate = new Date(delivery.orderDate);
//         return orderDate >= startOfDay && orderDate <= endOfDay;
//       });
      
//       setDeliveries(filteredByDate);
//     }
//   }, [selectedDate, allDeliveries]);

//   // Convert order status to delivery status
//   const getDeliveryStatus = (orderStatus) => {
//     switch (orderStatus) {
//       case 'cancelled': return 'failed';
//       case 'delivered': return 'delivered';
//       case 'out_for_delivery': return 'in_progress';
//       case 'processing':
//       case 'prepared': return 'assigned';
//       default: return 'pending';
//     }
//   };

//   // Get mock deliveries for development/demo
//   const getMockDeliveries = () => {
//     return [
//       {
//         id: 'del1',
//         orderId: 'ORD-12345',
//         customerName: 'Ananya Desai',
//         customerAddress: '123 Brigade Road, Bengaluru, Karnataka',
//         customerPhone: '9876543210',
//         items: [
//           { name: 'Large Mutton-Cuts', quantity: 1, price: 950 },
//           { name: 'Fish and Seafood', quantity: 1, price: 950 }
//         ],
//         itemCount: 2,
//         totalAmount: 1900,
//         status: 'delivered',
//         orderStatus: 'delivered',
//         timestamp: Date.now() - 3600000,
//         orderDate: new Date(Date.now() - 3600000).toISOString(),
//         estimatedDelivery: new Date(Date.now() + 1800000).toISOString(),
//         deliveryPerson: {
//           name: 'Rahul Kumar',
//           phone: '9988776655',
//           rating: 4.8
//         },
//         deliveryNotes: 'Leave at door',
//         shopName: 'Sri Ramakrishna Hotel',
//         shopAddress: '262, Subedar Chatram Rd, RK Puram, Gandhi Nagar, Bengaluru'
//       },
//       {
//         id: 'del2',
//         orderId: 'ORD-67890',
//         customerName: 'Raj Mehta',
//         customerAddress: '456 MG Road, Bengaluru, Karnataka',
//         customerPhone: '8765432109',
//         items: [
//           { name: 'Large Mutton-Cuts', quantity: 2, price: 950 }
//         ],
//         itemCount: 1,
//         totalAmount: 1900,
//         status: 'in_progress',
//         orderStatus: 'out_for_delivery',
//         timestamp: Date.now() - 7200000,
//         orderDate: new Date(Date.now() - 7200000).toISOString(),
//         estimatedDelivery: new Date(Date.now() + 900000).toISOString(),
//         deliveryPerson: {
//           name: 'Priya Singh',
//           phone: '8877665544',
//           rating: 4.9
//         },
//         deliveryNotes: 'Call upon arrival',
//         shopName: 'Sri Ramakrishna Hotel',
//         shopAddress: '262, Subedar Chatram Rd, RK Puram, Gandhi Nagar, Bengaluru'
//       },
//       {
//         id: 'del3',
//         orderId: 'ORD-24680',
//         customerName: 'Suresh Patel',
//         customerAddress: '789 Residency Road, Bengaluru, Karnataka',
//         customerPhone: '7654321098',
//         items: [
//           { name: 'Fish and Seafood', quantity: 1, price: 950 },
//           { name: 'Chicken', quantity: 1, price: 450 }
//         ],
//         itemCount: 2,
//         totalAmount: 1400,
//         status: 'assigned',
//         orderStatus: 'processing',
//         timestamp: Date.now() - 1800000,
//         orderDate: new Date(Date.now() - 1800000).toISOString(),
//         estimatedDelivery: new Date(Date.now() + 3600000).toISOString(),
//         deliveryPerson: {
//           name: 'Amit Sharma',
//           phone: '7766554433',
//           rating: 4.7
//         },
//         deliveryNotes: '',
//         shopName: 'Sri Ramakrishna Hotel',
//         shopAddress: '262, Subedar Chatram Rd, RK Puram, Gandhi Nagar, Bengaluru'
//       }
//     ];
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const options = { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   // Get status text
//   const getStatusText = (status) => {
//     switch(status) {
//       case 'pending': return 'Pending';
//       case 'assigned': return 'Assigned';
//       case 'in_progress': return 'In Progress';
//       case 'delivered': return 'Delivered';
//       case 'failed': return 'Failed';
//       default: return status;
//     }
//   };

//   // Get status icon
//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'pending': return <Clock className="status-icon pending" size={16} />;
//       case 'assigned': return <User className="status-icon assigned" size={16} />;
//       case 'in_progress': return <Truck className="status-icon in-progress" size={16} />;
//       case 'delivered': return <CheckCircle className="status-icon delivered" size={16} />;
//       case 'failed': return <AlertTriangle className="status-icon failed" size={16} />;
//       default: return <Clock className="status-icon" size={16} />;
//     }
//   };

//   // Filter deliveries based on active tab and search term
//   const getFilteredDeliveries = () => {
//     return deliveries.filter(delivery => {
//       // Filter by tab
//       if (activeTab !== 'all' && delivery.status !== activeTab) {
//         return false;
//       }
      
//       // Filter by search term
//       if (searchTerm && 
//           !delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) && 
//           !delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !delivery.customerPhone.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       return true;
//     });
//   };

//   const filteredDeliveries = getFilteredDeliveries();

//   // Get daily stats - now based on filtered deliveries
//   const getDailyStats = () => {
//     const total = deliveries.length;
//     const delivered = deliveries.filter(d => d.status === 'delivered').length;
//     const inProgress = deliveries.filter(d => d.status === 'in_progress').length;
//     const pending = deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length;
//     const failed = deliveries.filter(d => d.status === 'failed').length;
    
//     const totalRevenue = deliveries
//       .filter(d => d.status === 'delivered')
//       .reduce((sum, d) => sum + d.totalAmount, 0);
    
//     return { total, delivered, inProgress, pending, failed, totalRevenue };
//   };

//   const stats = getDailyStats();

//   // Export to Excel function
//   const exportToExcel = async () => {
//     try {
//       setExporting(true);
      
//       // Load XLSX library dynamically
//       if (!window.XLSX) {
//         const script = document.createElement('script');
//         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
//         document.head.appendChild(script);
        
//         await new Promise((resolve, reject) => {
//           script.onload = resolve;
//           script.onerror = reject;
//         });
//       }
      
//       const XLSX = window.XLSX;
      
//       // Create workbook
//       const workbook = XLSX.utils.book_new();
      
//       // Summary sheet data
//       const summaryData = [
//         ['Delivery Report Summary'],
//         [''],
//         ['Period:', selectedDate === 'all' ? 'All Time' : formatDate(selectedDate)],
//         ['Generated:', new Date().toLocaleDateString()],
//         ['Shop:', filteredDeliveries[0]?.shopName || 'Your Shop'],
//         [''],
//         ['Statistics:'],
//         ['Total Orders', stats.total],
//         ['Delivered', stats.delivered],
//         ['In Progress', stats.inProgress],
//         ['Pending', stats.pending],
//         ['Failed', stats.failed],
//         ['Total Revenue', stats.totalRevenue],
//         ['']
//       ];
      
//       const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
//       XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
//       // Deliveries sheet data
//       const deliveriesData = [
//         [
//           'Order ID',
//           'Customer Name',
//           'Customer Phone',
//           'Customer Address',
//           'Status',
//           'Order Date',
//           'Items',
//           'Item Count',
//           'Total Amount',
//           'Delivery Person',
//           'Delivery Phone',
//           'Delivery Notes',
//           'Shop Name'
//         ]
//       ];
      
//       filteredDeliveries.forEach(delivery => {
//         const itemsText = delivery.items.map(item => 
//           `${item.name} (x${item.quantity}) - ${formatCurrency(item.price)}`
//         ).join('; ');
        
//         deliveriesData.push([
//           delivery.orderId,
//           delivery.customerName,
//           delivery.customerPhone,
//           delivery.customerAddress,
//           getStatusText(delivery.status),
//           formatDate(delivery.orderDate),
//           itemsText,
//           delivery.itemCount,
//           delivery.totalAmount,
//           delivery.deliveryPerson?.name || 'Not Assigned',
//           delivery.deliveryPerson?.phone || 'N/A',
//           delivery.deliveryNotes || 'None',
//           delivery.shopName
//         ]);
//       });
      
//       const deliveriesSheet = XLSX.utils.aoa_to_sheet(deliveriesData);
//       XLSX.utils.book_append_sheet(workbook, deliveriesSheet, 'Deliveries');
      
//       // Download file
//       const fileName = `delivery-report-${selectedDate === 'all' ? 'all-time' : selectedDate}.xlsx`;
//       XLSX.writeFile(workbook, fileName);
      
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       alert('Failed to export to Excel. Please try again.');
//     } finally {
//       setExporting(false);
//     }
//   };

//   // Export to PDF function
//   const exportToPDF = () => {
//     try {
//       setExporting(true);
      
//       // Create a new window for printing
//       const printWindow = window.open('', '_blank');
      
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Delivery Report</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               margin: 20px;
//               color: #333;
//             }
            
//             .header {
//               text-align: center;
//               margin-bottom: 30px;
//               border-bottom: 2px solid #333;
//               padding-bottom: 20px;
//             }
            
//             .header h1 {
//               color: #2563eb;
//               margin: 0;
//             }
            
//             .summary {
//               display: grid;
//               grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//               gap: 15px;
//               margin-bottom: 30px;
//             }
            
//             .stat-card {
//               border: 1px solid #ddd;
//               padding: 15px;
//               border-radius: 8px;
//               text-align: center;
//             }
            
//             .stat-card h3 {
//               margin: 0 0 10px 0;
//               color: #666;
//               font-size: 14px;
//             }
            
//             .stat-value {
//               font-size: 24px;
//               font-weight: bold;
//               color: #2563eb;
//             }
            
//             .revenue .stat-value {
//               color: #16a34a;
//             }
            
//             .deliveries-table {
//               width: 100%;
//               border-collapse: collapse;
//               margin-top: 20px;
//               font-size: 12px;
//             }
            
//             .deliveries-table th,
//             .deliveries-table td {
//               border: 1px solid #ddd;
//               padding: 8px;
//               text-align: left;
//             }
            
//             .deliveries-table th {
//               background-color: #f8f9fa;
//               font-weight: bold;
//             }
            
//             .status {
//               padding: 4px 8px;
//               border-radius: 4px;
//               font-size: 11px;
//               font-weight: bold;
//             }
            
//             .status.delivered { background-color: #dcfce7; color: #166534; }
//             .status.in_progress { background-color: #dbeafe; color: #1e40af; }
//             .status.pending { background-color: #fef3c7; color: #92400e; }
//             .status.assigned { background-color: #e0e7ff; color: #3730a3; }
//             .status.failed { background-color: #fecaca; color: #dc2626; }
            
//             .items-cell {
//               max-width: 200px;
//               word-wrap: break-word;
//             }
            
//             @media print {
//               body { margin: 0; }
//               .no-print { display: none; }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h1>Delivery Report</h1>
//             <p><strong>${filteredDeliveries[0]?.shopName || 'Your Shop'}</strong></p>
//             <p>Period: ${selectedDate === 'all' ? 'All Time' : formatDate(selectedDate)}</p>
//             <p>Generated on: ${new Date().toLocaleDateString()}</p>
//           </div>
          
//           <div class="summary">
//             <div class="stat-card">
//               <h3>Total Orders</h3>
//               <div class="stat-value">${stats.total}</div>
//             </div>
//             <div class="stat-card">
//               <h3>Delivered</h3>
//               <div class="stat-value">${stats.delivered}</div>
//             </div>
//             <div class="stat-card">
//               <h3>In Progress</h3>
//               <div class="stat-value">${stats.inProgress}</div>
//             </div>
//             <div class="stat-card">
//               <h3>Pending</h3>
//               <div class="stat-value">${stats.pending}</div>
//             </div>
//             <div class="stat-card revenue">
//               <h3>Revenue</h3>
//               <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
//             </div>
//           </div>
          
//           <table class="deliveries-table">
//             <thead>
//               <tr>
//                 <th>Order ID</th>
//                 <th>Customer</th>
//                 <th>Phone</th>
//                 <th>Status</th>
//                 <th>Order Date</th>
//                 <th>Items</th>
//                 <th>Amount</th>
//                 <th>Delivery Person</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${filteredDeliveries.map(delivery => `
//                 <tr>
//                   <td>${delivery.orderId}</td>
//                   <td>${delivery.customerName}</td>
//                   <td>${delivery.customerPhone}</td>
//                   <td><span class="status ${delivery.status}">${getStatusText(delivery.status)}</span></td>
//                   <td>${formatDate(delivery.orderDate)}</td>
//                   <td class="items-cell">
//                     ${delivery.items.map(item => 
//                       `${item.name} (x${item.quantity})`
//                     ).join(', ')}
//                   </td>
//                   <td>${formatCurrency(delivery.totalAmount)}</td>
//                   <td>${delivery.deliveryPerson?.name || 'Not Assigned'}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
          
//           <script>
//             window.onload = function() {
//               window.print();
//               window.onafterprint = function() {
//                 window.close();
//               };
//             };
//           </script>
//         </body>
//         </html>
//       `;
      
//       printWindow.document.write(htmlContent);
//       printWindow.document.close();
      
//     } catch (error) {
//       console.error('Error exporting to PDF:', error);
//       alert('Failed to export to PDF. Please try again.');
//     } finally {
//       setExporting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="delivery-page">
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading deliveries...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="delivery-page">
//         <div className="error-container">
//           <AlertTriangle size={32} />
//           <h3>Error Loading Deliveries</h3>
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()}>Retry</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="delivery-page">
//       <div className="delivery-header">
//         <h2>Order Deliveries</h2>
//         <div className="delivery-header-controls">
//           <div className="delivery-date-picker">
//             <Calendar size={20} />
//             <select 
//               value={selectedDate} 
//               onChange={(e) => setSelectedDate(e.target.value)}
//             >
//               <option value="all">All Time</option>
//               <option value={new Date().toISOString().split('T')[0]}>Today</option>
//               <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Yesterday</option>
//             </select>
//             {selectedDate !== 'all' && (
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 max={new Date().toISOString().split('T')[0]}
//               />
//             )}
//           </div>
          
//           <div className="export-buttons">
//             <button
//               onClick={exportToExcel}
//               disabled={exporting || filteredDeliveries.length === 0}
//               className="export-btn excel-btn"
//             >
//               <FileSpreadsheet size={16} />
//               {exporting ? 'Exporting...' : 'Export Excel'}
//             </button>
            
//             <button
//               onClick={exportToPDF}
//               disabled={exporting || filteredDeliveries.length === 0}
//               className="export-btn pdf-btn"
//             >
//               <FileText size={16} />
//               {exporting ? 'Exporting...' : 'Export PDF'}
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <div className="delivery-stats">
//         <div className="stat-card">
//           <h3>Total Orders</h3>
//           <div className="stat-value">{stats.total}</div>
//         </div>
//         <div className="stat-card">
//           <h3>Delivered</h3>
//           <div className="stat-value">{stats.delivered}</div>
//         </div>
//         <div className="stat-card">
//           <h3>In Progress</h3>
//           <div className="stat-value">{stats.inProgress}</div>
//         </div>
//         <div className="stat-card">
//           <h3>Pending</h3>
//           <div className="stat-value">{stats.pending}</div>
//         </div>
//         <div className="stat-card revenue">
//           <h3>Revenue</h3>
//           <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
//         </div>
//       </div>
      
//       <div className="delivery-controls">
//         <div className="search-container">
//           <Search className="search-icon" size={18} />
//           <input 
//             type="text"
//             placeholder="Search by order ID, customer name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//         </div>
        
//         <div className="filter-tabs">
//           <button 
//             className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
//             onClick={() => setActiveTab('all')}
//           >
//             All
//           </button>
//           <button 
//             className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
//             onClick={() => setActiveTab('pending')}
//           >
//             Pending
//           </button>
//           <button 
//             className={`filter-tab ${activeTab === 'assigned' ? 'active' : ''}`}
//             onClick={() => setActiveTab('assigned')}
//           >
//             Assigned
//           </button>
//           <button 
//             className={`filter-tab ${activeTab === 'in_progress' ? 'active' : ''}`}
//             onClick={() => setActiveTab('in_progress')}
//           >
//             In Progress
//           </button>
//           <button 
//             className={`filter-tab ${activeTab === 'delivered' ? 'active' : ''}`}
//             onClick={() => setActiveTab('delivered')}
//           >
//             Delivered
//           </button>
//           <button 
//             className={`filter-tab ${activeTab === 'failed' ? 'active' : ''}`}
//             onClick={() => setActiveTab('failed')}
//           >
//             Failed
//           </button>
//         </div>
//       </div>
      
//       {filteredDeliveries.length === 0 ? (
//         <div className="no-deliveries">
//           <Package size={48} />
//           <h3>No Deliveries Found</h3>
//           <p>
//             {selectedDate === 'all' 
//               ? "There are no deliveries for your shop yet." 
//               : "There are no deliveries matching your criteria for the selected date."
//             }
//           </p>
//           {selectedDate !== 'all' && (
//             <button onClick={() => setSelectedDate('all')}>
//               View All Time
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="delivery-list">
//           {filteredDeliveries.map(delivery => (
//             <div key={delivery.id} className={`delivery-card ${delivery.status}`}>
//               <div className="delivery-header">
//                 <div className="delivery-id">
//                   <Truck size={16} />
//                   <span>{delivery.orderId}</span>
//                 </div>
//                 <div className={`delivery-status ${delivery.status}`}>
//                   {getStatusIcon(delivery.status)}
//                   <span>{getStatusText(delivery.status)}</span>
//                 </div>
//               </div>
              
//               <div className="delivery-content">
//                 <div className="delivery-customer">
//                   <h4>Customer Details</h4>
//                   <div className="customer-name">
//                     <User size={16} />
//                     <span>{delivery.customerName}</span>
//                   </div>
//                   <div className="customer-address">
//                     <MapPin size={16} />
//                     <span>{delivery.customerAddress}</span>
//                   </div>
//                   <div className="customer-phone">
//                     <Phone size={16} />
//                     <span>{delivery.customerPhone}</span>
//                   </div>
//                 </div>
                
//                 <div className="delivery-items">
//                   <h4>Order Items ({delivery.itemCount})</h4>
//                   <ul className="items-list">
//                     {delivery.items.map((item, index) => (
//                       <li key={index} className="item">
//                         <div className="item-name">{item.name}</div>
//                         <div className="item-quantity">x{item.quantity}</div>
//                         <div className="item-price">{formatCurrency(item.price)}</div>
//                       </li>
//                     ))}
//                   </ul>
//                   <div className="order-total">
//                     <span>Total:</span>
//                     <span>{formatCurrency(delivery.totalAmount)}</span>
//                   </div>
//                 </div>
                
//                 <div className="delivery-info">
//                   <h4>Delivery Details</h4>
//                   <div className="delivery-time">
//                     <Clock size={16} />
//                     <div>
//                       <div>Order Time: {formatDate(delivery.orderDate)}</div>
//                       {delivery.estimatedDelivery && (
//                         <div>Est. Delivery: {formatDate(delivery.estimatedDelivery)}</div>
//                       )}
//                     </div>
//                   </div>
                  
//                   {delivery.deliveryPerson ? (
//                     <div className="delivery-person">
//                       <h5>Delivery Agent</h5>
//                       <div className="person-name">{delivery.deliveryPerson.name}</div>
//                       <div className="person-phone">
//                         <Phone size={14} />
//                         <span>{delivery.deliveryPerson.phone}</span>
//                       </div>
//                       <div className="person-rating">
//                         Rating: {delivery.deliveryPerson.rating} ★
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="no-delivery-person">
//                       <p>No delivery agent assigned yet</p>
//                     </div>
//                   )}
                  
//                   {delivery.deliveryNotes && (
//                     <div className="delivery-notes">
//                       <h5>Notes</h5>
//                       <p>{delivery.deliveryNotes}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Delivery;






import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, startAt, endAt } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  Calendar,
  Search,
  CheckCircle,
  AlertTriangle,
  Package,
  FileText,
  FileSpreadsheet,
  Navigation,
  Eye
} from 'lucide-react';
import './Delivery.css';

const Delivery = () => {
  const { currentUser } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shopId, setShopId] = useState(null);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (!currentUser) return;
      
      try {
        const db = getDatabase();
        const shopsRef = ref(db, 'shops');
        
        onValue(shopsRef, (snapshot) => {
          if (snapshot.exists()) {
            const shops = snapshot.val();
            
            // Find the shop that matches the current user's email
            let foundShopId = null;
            
            Object.entries(shops).forEach(([id, shop]) => {
              if (shop.email === currentUser.email) {
                foundShopId = id;
              }
            });
            
            if (foundShopId) {
              setShopId(foundShopId);
              fetchDeliveries(foundShopId);
            } else {
              setError("Shop not found for this vendor");
              setLoading(false);
            }
          } else {
            setError("No shops found in database");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError("Failed to load vendor data");
        setLoading(false);
      }
    };

    fetchVendorInfo();
  }, [currentUser]);

  const fetchDeliveries = (vendorId) => {
    try {
      const db = getDatabase();
      const ordersRef = ref(db, 'orders');
      
      // Fetch all orders without date filtering initially
      onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const ordersArray = [];
          
          Object.keys(ordersData).forEach(key => {
            const order = ordersData[key];
            
            // Only include orders for this vendor - check multiple possible vendor ID fields
            const isVendorMatch = (
              (order.vendor && order.vendor.id === vendorId) ||
              (order.vendor && order.vendor.shopId === vendorId) ||
              (order.shopId === vendorId) ||
              (order.vendorId === vendorId)
            );
            
            if (isVendorMatch) {
              // Calculate the total price directly from items
              let calculatedTotal = 0;
              if (order.items && Array.isArray(order.items)) {
                calculatedTotal = order.items.reduce((sum, item) => {
                  return sum + (item.price || 0) * (item.quantity || 1);
                }, 0);
              } else if (order.totalAmount) {
                calculatedTotal = order.totalAmount;
              }
              
              // Convert order to delivery format with correct pricing
              const deliveryStatus = getDeliveryStatus(order.status);
              
              // Get delivery person details
              const deliveryPerson = order.delivery || order.deliveryPerson || null;
              
              const deliveryData = {
                id: key,
                orderId: `ORD-${key.substring(0, 5)}`,
                customerName: order.customer?.fullName || 'Unknown Customer',
                customerAddress: order.customer?.address || 'Address not provided',
                customerPhone: order.customer?.phone || 'Phone not provided',
                items: order.items || [],
                itemCount: order.items?.length || 0,
                totalAmount: calculatedTotal, // Use the calculated total
                status: deliveryStatus,
                orderStatus: order.status,
                timestamp: order.orderDate ? new Date(order.orderDate).getTime() : Date.now(),
                orderDate: order.orderDate || new Date().toISOString(),
                estimatedDelivery: order.estimatedDelivery,
                deliveryPerson: deliveryPerson,
                deliveryNotes: order.deliveryNotes || '',
                shopName: order.vendor?.name || 'Your Shop',
                shopAddress: order.vendor?.address || '',
                delivery: order.delivery || null
              };
              
              ordersArray.push(deliveryData);
            }
          });
          
          // Sort by date (newest first)
          ordersArray.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          
          setAllDeliveries(ordersArray);
          setDeliveries(ordersArray); // Initially show all
          setLoading(false);
        } else {
          setDeliveries([]);
          setAllDeliveries([]);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError("Failed to load deliveries");
      setLoading(false);
      
      // For development/demo purposes, use mock data
      if (process.env.NODE_ENV === 'development') {
        const mockData = getMockDeliveries();
        setDeliveries(mockData);
        setAllDeliveries(mockData);
        setLoading(false);
      }
    }
  };

  // Apply date filtering when selectedDate changes
  useEffect(() => {
    if (selectedDate === 'all') {
      setDeliveries(allDeliveries);
    } else {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const filteredByDate = allDeliveries.filter(delivery => {
        const orderDate = new Date(delivery.orderDate);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
      
      setDeliveries(filteredByDate);
    }
  }, [selectedDate, allDeliveries]);

  // Convert order status to delivery status
  const getDeliveryStatus = (orderStatus) => {
    switch (orderStatus) {
      case 'cancelled': return 'failed';
      case 'delivered': return 'delivered';
      case 'out_for_delivery': return 'in_progress';
      case 'processing':
      case 'prepared': return 'assigned';
      default: return 'pending';
    }
  };

  // Get mock deliveries for development/demo
  const getMockDeliveries = () => {
    return [
      {
        id: 'del1',
        orderId: 'ORD-12345',
        customerName: 'Ananya Desai',
        customerAddress: '123 Brigade Road, Bengaluru, Karnataka',
        customerPhone: '9876543210',
        items: [
          { name: 'Large Mutton-Cuts', quantity: 1, price: 950 },
          { name: 'Fish and Seafood', quantity: 1, price: 950 }
        ],
        itemCount: 2,
        totalAmount: 1900,
        status: 'delivered',
        orderStatus: 'delivered',
        timestamp: Date.now() - 3600000,
        orderDate: new Date(Date.now() - 3600000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 1800000).toISOString(),
        deliveryPerson: {
          name: 'Rahul Kumar',
          phone: '9988776655',
          rating: 4.8
        },
        delivery: {
          partnerName: 'Rahul Kumar',
          trackingId: 'CRN80949505',
          partnerPhone: '9988776655'
        },
        deliveryNotes: 'Leave at door',
        shopName: 'Sri Ramakrishna Hotel',
        shopAddress: '262, Subedar Chatram Rd, RK Puram, Gandhi Nagar, Bengaluru'
      },
      {
        id: 'del2',
        orderId: 'ORD-67890',
        customerName: 'Raj Mehta',
        customerAddress: '456 MG Road, Bengaluru, Karnataka',
        customerPhone: '8765432109',
        items: [
          { name: 'Large Mutton-Cuts', quantity: 2, price: 950 }
        ],
        itemCount: 1,
        totalAmount: 1900,
        status: 'in_progress',
        orderStatus: 'out_for_delivery',
        timestamp: Date.now() - 7200000,
        orderDate: new Date(Date.now() - 7200000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 900000).toISOString(),
        deliveryPerson: {
          name: 'Priya Singh',
          phone: '8877665544',
          rating: 4.9
        },
        delivery: {
          partnerName: 'Priya Singh',
          trackingId: 'CRN70949506',
          partnerPhone: '8877665544'
        },
        deliveryNotes: 'Call upon arrival',
        shopName: 'Sri Ramakrishna Hotel',
        shopAddress: '262, Subedar Chatram Rd, RK Puram, Gandhi Nagar, Bengaluru'
      },
      {
        id: 'del3',
        orderId: 'ORD-24680',
        customerName: 'Suresh Patel',
        customerAddress: '789 Residency Road, Bengaluru, Karnataka',
        customerPhone: '7654321098',
        items: [
          { name: 'Fish and Seafood', quantity: 1, price: 950 },
          { name: 'Chicken', quantity: 1, price: 450 }
        ],
        itemCount: 2,
        totalAmount: 1400,
        status: 'assigned',
        orderStatus: 'processing',
        timestamp: Date.now() - 1800000,
        orderDate: new Date(Date.now() - 1800000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 3600000).toISOString(),
        deliveryPerson: null,
        delivery: null,
        deliveryNotes: '',
        shopName: 'Sri Ramakrishna Hotel',
        shopAddress: '262, Subedar Chatram Rd, RK Puram, Gandhi Nagar, Bengaluru'
      }
    ];
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'delivered': return 'Delivered';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="status-icon pending" size={16} />;
      case 'assigned': return <User className="status-icon assigned" size={16} />;
      case 'in_progress': return <Truck className="status-icon in-progress" size={16} />;
      case 'delivered': return <CheckCircle className="status-icon delivered" size={16} />;
      case 'failed': return <AlertTriangle className="status-icon failed" size={16} />;
      default: return <Clock className="status-icon" size={16} />;
    }
  };

  // Filter deliveries based on active tab and search term
  const getFilteredDeliveries = () => {
    return deliveries.filter(delivery => {
      // Filter by tab
      if (activeTab !== 'all' && delivery.status !== activeTab) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && 
          !delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !delivery.customerPhone.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const filteredDeliveries = getFilteredDeliveries();

  // Get daily stats - now based on filtered deliveries
  const getDailyStats = () => {
    const total = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;
    const inProgress = deliveries.filter(d => d.status === 'in_progress').length;
    const pending = deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length;
    const failed = deliveries.filter(d => d.status === 'failed').length;
    
    const totalRevenue = deliveries
      .filter(d => d.status === 'delivered')
      .reduce((sum, d) => sum + d.totalAmount, 0);
    
    return { total, delivered, inProgress, pending, failed, totalRevenue };
  };

  const stats = getDailyStats();

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      // Load XLSX library dynamically
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      
      const XLSX = window.XLSX;
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet data
      const summaryData = [
        ['Delivery Report Summary'],
        [''],
        ['Period:', selectedDate === 'all' ? 'All Time' : formatDate(selectedDate)],
        ['Generated:', new Date().toLocaleDateString()],
        ['Shop:', filteredDeliveries[0]?.shopName || 'Your Shop'],
        [''],
        ['Statistics:'],
        ['Total Orders', stats.total],
        ['Delivered', stats.delivered],
        ['In Progress', stats.inProgress],
        ['Pending', stats.pending],
        ['Failed', stats.failed],
        ['Total Revenue', stats.totalRevenue],
        ['']
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Deliveries sheet data
      const deliveriesData = [
        [
          'Order ID',
          'Customer Name',
          'Customer Phone',
          'Customer Address',
          'Status',
          'Order Date',
          'Items',
          'Item Count',
          'Total Amount',
          'Delivery Person',
          'Delivery Phone',
          'Tracking ID',
          'Delivery Notes',
          'Shop Name'
        ]
      ];
      
      filteredDeliveries.forEach(delivery => {
        const itemsText = delivery.items.map(item => 
          `${item.name} (x${item.quantity}) - ${formatCurrency(item.price * (item.quantity || 1))}`
        ).join('; ');
        
        const deliveryPartnerName = delivery.delivery?.partnerName || 
                                    delivery.deliveryPerson?.name || 
                                    'Not Assigned';
        
        const deliveryPartnerPhone = delivery.delivery?.partnerPhone || 
                                     delivery.deliveryPerson?.phone || 
                                     'N/A';
        
        const trackingId = delivery.delivery?.trackingId || 'N/A';
        
        deliveriesData.push([
          delivery.orderId,
          delivery.customerName,
          delivery.customerPhone,
          delivery.customerAddress,
          getStatusText(delivery.status),
          formatDate(delivery.orderDate),
          itemsText,
          delivery.itemCount,
          delivery.totalAmount,
          deliveryPartnerName,
          deliveryPartnerPhone,
          trackingId,
          delivery.deliveryNotes || 'None',
          delivery.shopName
        ]);
      });
      
      const deliveriesSheet = XLSX.utils.aoa_to_sheet(deliveriesData);
      XLSX.utils.book_append_sheet(workbook, deliveriesSheet, 'Deliveries');
      
      // Download file
      const fileName = `delivery-report-${selectedDate === 'all' ? 'all-time' : selectedDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF function
  const exportToPDF = () => {
    try {
      setExporting(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Delivery Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            
            .summary {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin-bottom: 30px;
            }
            
            .stat-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            
            .stat-card h3 {
              margin: 0 0 10px 0;
              color: #666;
              font-size: 14px;
            }
            
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .revenue .stat-value {
              color: #16a34a;
            }
            
            .deliveries-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            
            .deliveries-table th,
            .deliveries-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            .deliveries-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            
            .status {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
            }
            
            .status.delivered { background-color: #dcfce7; color: #166534; }
            .status.in_progress { background-color: #dbeafe; color: #1e40af; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.assigned { background-color: #e0e7ff; color: #3730a3; }
            .status.failed { background-color: #fecaca; color: #dc2626; }
            
            .items-cell {
              max-width: 200px;
              word-wrap: break-word;
            }
            
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Delivery Report</h1>
            <p><strong>${filteredDeliveries[0]?.shopName || 'Your Shop'}</strong></p>
            <p>Period: ${selectedDate === 'all' ? 'All Time' : formatDate(selectedDate)}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <div class="stat-card">
              <h3>Total Orders</h3>
              <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-card">
              <h3>Delivered</h3>
              <div class="stat-value">${stats.delivered}</div>
            </div>
         
          </div>
          
          <table class="deliveries-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Delivery Person</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDeliveries.map(delivery => {
                const deliveryPartnerName = delivery.delivery?.partnerName || 
                                         delivery.deliveryPerson?.name || 
                                         'Not Assigned';
                                         
                return `
                <tr>
                  <td>${delivery.orderId}</td>
                  <td>${delivery.customerName}</td>
                  <td>${delivery.customerPhone}</td>
                  <td><span class="status ${delivery.status}">${getStatusText(delivery.status)}</span></td>
                  <td>${formatDate(delivery.orderDate)}</td>
                  <td class="items-cell">
                    ${delivery.items.map(item => 
                      `${item.name} (x${item.quantity})`
                    ).join(', ')}
                  </td>
                  <td>${formatCurrency(delivery.totalAmount)}</td>
                  <td>${deliveryPartnerName}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Handle delivery details view
  const handleViewDeliveryDetails = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
      setSelectedDelivery(delivery);
    }
  };

  // Back to deliveries list
  const handleBackToList = () => {
    setSelectedDelivery(null);
  };

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-page">
        <div className="error-container">
          <AlertTriangle size={32} />
          <h3>Error Loading Deliveries</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Delivery details view
  if (selectedDelivery) {
    const delivery = selectedDelivery;
    
    return (
      <div className="delivery-page">
        <div className="delivery-detail-header">
          <button onClick={handleBackToList} className="back-button">
            ← Back to Deliveries
          </button>
          <h2>Delivery Details - {delivery.orderId}</h2>
          <div className={`delivery-status-badge ${delivery.status}`}>
            {getStatusIcon(delivery.status)}
            <span>{getStatusText(delivery.status)}</span>
          </div>
        </div>
        
        <div className="delivery-detail-container">
          <div className="delivery-detail-grid">
            {/* Customer Information */}
            <div className="detail-card">
              <h3><User size={20} /> Customer Information</h3>
              <div className="detail-content">
                <p><strong>Name:</strong> {delivery.customerName}</p>
             
                <p><strong>Address:</strong> {delivery.customerAddress}</p>
                <p><strong>Order Date:</strong> {formatDate(delivery.orderDate)}</p>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="detail-card">
              <h3><Package size={20} /> Order Items</h3>
              <div className="items-detail-list">
                {delivery.items.map((item, index) => (
                  <div key={index} className="item-detail-row">
                    <div className="item-detail-name">{item.name}</div>
                    <div className="item-detail-quantity">x{item.quantity}</div>
                    <div className="item-detail-price">{formatCurrency(item.price * (item.quantity || 1))}</div>
                  </div>
                ))}
                <div className="item-detail-total">
                  <span>Total:</span>
                  <span>{formatCurrency(delivery.totalAmount)}</span>
                </div>
              </div>
            </div>
            
            {/* Delivery Information */}
            <div className="detail-card">
              <h3><Truck size={20} /> Delivery Information</h3>
              <div className="detail-content">
                {(delivery.delivery || delivery.deliveryPerson) ? (
                  <>
                    <p>
                      <strong>Delivery Agent:</strong> {
                        delivery.delivery?.partnerName || 
                        delivery.deliveryPerson?.name || 
                        'Not Assigned'
                      }
                    </p>
                    {(delivery.delivery?.partnerPhone || delivery.deliveryPerson?.phone) && (
                      <p>
                        <strong>Phone:</strong> {
                          delivery.delivery?.partnerPhone || 
                          delivery.deliveryPerson?.phone
                        }
                      </p>
                    )}
                    {delivery.delivery?.trackingId && (
                      <p><strong>Tracking ID:</strong> {delivery.delivery.trackingId}</p>
                    )}
                    {delivery.estimatedDelivery && (
                      <p><strong>Est. Delivery:</strong> {formatDate(delivery.estimatedDelivery)}</p>
                    )}
                    {delivery.deliveryNotes && (
                      <p><strong>Delivery Notes:</strong> {delivery.deliveryNotes}</p>
                    )}
                  </>
                ) : (
                  <div className="no-delivery-info">
                    <p>No delivery agent has been assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h2>Order Deliveries</h2>
        <div className="delivery-header-controls">
          <div className="delivery-date-picker">
            <Calendar size={20} />
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value={new Date().toISOString().split('T')[0]}>Today</option>
              <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Yesterday</option>
            </select>
            {selectedDate !== 'all' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            )}
          </div>
          
          <div className="export-buttons">
            <button
              onClick={exportToExcel}
              disabled={exporting || filteredDeliveries.length === 0}
              className="export-btn excel-btn"
            >
              <FileSpreadsheet size={16} />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
            
            <button
              onClick={exportToPDF}
              disabled={exporting || filteredDeliveries.length === 0}
              className="export-btn pdf-btn"
            >
              <FileText size={16} />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="delivery-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Delivered</h3>
          <div className="stat-value">{stats.delivered}</div>
        </div>
       
      </div>
      
      <div className="delivery-controls">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input 
            type="text"
            placeholder="Search by order ID, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned
          </button>
          <button 
            className={`filter-tab ${activeTab === 'in_progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={`filter-tab ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            Delivered
          </button>
          <button 
            className={`filter-tab ${activeTab === 'failed' ? 'active' : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            Failed
          </button>
        </div>
      </div>
      
      {filteredDeliveries.length === 0 ? (
        <div className="no-deliveries">
          <Package size={48} />
          <h3>No Deliveries Found</h3>
          <p>
            {selectedDate === 'all' 
              ? "There are no deliveries for your shop yet." 
              : "There are no deliveries matching your criteria for the selected date."
            }
          </p>
          {selectedDate !== 'all' && (
            <button onClick={() => setSelectedDate('all')}>
              View All Time
            </button>
          )}
        </div>
      ) : (
        <div className="delivery-list">
          {filteredDeliveries.map(delivery => (
            <div key={delivery.id} className={`delivery-card ${delivery.status}`}>
              <div className="delivery-header">
                <div className="delivery-id">
                  <Package size={16} />
                  <span>{delivery.orderId}</span>
                </div>
                <div className={`delivery-status ${delivery.status}`}>
                  {getStatusIcon(delivery.status)}
                  <span>{getStatusText(delivery.status)}</span>
                </div>
              </div>
              
              <div className="delivery-content">
                <div className="delivery-customer">
                  <h4>Customer Details</h4>
                  <div className="customer-name">
                    <User size={16} />
                    <span>{delivery.customerName}</span>
                  </div>
                  <div className="customer-address">
                    <MapPin size={16} />
                    <span>{delivery.customerAddress}</span>
                  </div>
               
                </div>
                
                <div className="delivery-items">
                  <h4>Order Items ({delivery.itemCount})</h4>
                  <ul className="items-list">
                    {delivery.items.map((item, index) => (
                      <li key={index} className="item">
                        <div className="item-name">{item.name}</div>
                        <div className="item-quantity">x{item.quantity || 1}</div>
                      </li>
                    ))}
                  </ul>
                 
                </div>
                
                <div className="delivery-info">
                  <h4>Delivery Details</h4>
                  <div className="delivery-time">
                    <Clock size={16} />
                    <div>
                      <div>Order Time: {formatDate(delivery.orderDate)}</div>
                      {delivery.estimatedDelivery && (
                        <div>Est. Delivery: {formatDate(delivery.estimatedDelivery)}</div>
                      )}
                    </div>
                  </div>
                  
                  {(delivery.delivery || delivery.deliveryPerson) ? (
                    <div className="delivery-person">
                      <h5>Delivery Agent</h5>
                      <div className="person-name">
                        {delivery.delivery?.partnerName || delivery.deliveryPerson?.name}
                      </div>
                      <div className="person-phone">
                        <Phone size={14} />
                        <span>
                          {delivery.delivery?.partnerPhone || delivery.deliveryPerson?.phone}
                        </span>
                      </div>
                      {delivery.delivery?.trackingId && (
                        <div className="tracking-id">
                          <strong>Tracking ID:</strong> {delivery.delivery.trackingId}
                        </div>
                      )}
                      {delivery.deliveryPerson?.rating && (
                        <div className="person-rating">
                          Rating: {delivery.deliveryPerson.rating} ★
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-delivery-person">
                      <p>No delivery agent assigned yet</p>
                    </div>
                  )}
                  
                  {delivery.deliveryNotes && (
                    <div className="delivery-notes">
                      <h5>Notes</h5>
                      <p>{delivery.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* <div className="delivery-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDeliveryDetails(delivery.id)}
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Delivery;