// import React, { useState, useEffect } from 'react';
// import { db, auth } from '../services/firebase'; // Import from your firebase config file
// import { ref, push, set, onValue, query, orderByChild, limitToLast } from 'firebase/database';
// import './Support.css';

// const Support = () => {
//   // Form states
//   const [requestType, setRequestType] = useState('packaging');
//   const [requestDetails, setRequestDetails] = useState('');
//   const [orderNumber, setOrderNumber] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
  
//   // UI states
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState({ show: false, type: '', message: '' });
//   const [recentRequests, setRecentRequests] = useState([]);
//   const [user, setUser] = useState(null);

//   // Request type options from the images
//   const requestTypes = [
//     { id: 'packaging', label: 'Request to Zappcart (Packaging, Clothes, etc.)', 
//       description: 'Request packaging materials, clothes, or other supplies' },
//     { id: 'schedule', label: 'Vendor Schedule', 
//       description: 'Mark off holidays or non-working days' },
//     { id: 'payment', label: 'Payment Section', 
//       description: 'General payment related inquiries' },
//     { id: 'payment_query', label: 'Raise Payment Query', 
//       description: 'Submit disputes or questions on a specific order' },
//   ];

//   // Listen for auth state changes
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         fetchRecentRequests(currentUser.uid);
//       }
//     });
    
//     return () => unsubscribe();
//   }, []);

//   // Fetch recent requests for the current vendor
//   const fetchRecentRequests = (vendorId) => {
//     const requestsRef = query(
//       ref(db, 'support_requests'),
//       orderByChild('vendorId'),
//       limitToLast(5)
//     );
    
//     onValue(requestsRef, (snapshot) => {
//       const requests = [];
//       snapshot.forEach((childSnapshot) => {
//         const request = {
//           id: childSnapshot.key,
//           ...childSnapshot.val()
//         };
//         if (request.vendorId === vendorId) {
//           requests.push(request);
//         }
//       });
//       setRecentRequests(requests.reverse());
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async () => {
//     // Validate form
//     if (!requestDetails.trim()) {
//       setNotification({
//         show: true,
//         type: 'error',
//         message: 'Please provide request details'
//       });
//       return;
//     }
    
//     if (requestType === 'payment_query' && !orderNumber.trim()) {
//       setNotification({
//         show: true,
//         type: 'error',
//         message: 'Please provide an order number'
//       });
//       return;
//     }
    
//     if (requestType === 'schedule' && (!startDate || !endDate)) {
//       setNotification({
//         show: true,
//         type: 'error',
//         message: 'Please select both start and end dates'
//       });
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Create request object
//       const requestData = {
//         type: requestType,
//         details: requestDetails,
//         createdAt: new Date().toISOString(),
//         status: 'pending',
//         vendorId: user ? user.uid : 'guest'
//       };
      
//       // Add conditional fields
//       if (requestType === 'payment_query') {
//         requestData.orderNumber = orderNumber;
//       }
      
//       if (requestType === 'schedule') {
//         requestData.startDate = startDate;
//         requestData.endDate = endDate;
//       }
      
//       // Create a new entry in Firebase
//       const newRequestRef = push(ref(db, 'support_requests'));
//       await set(newRequestRef, requestData);
      
//       // Show success notification
//       setNotification({
//         show: true,
//         type: 'success',
//         message: 'Your request has been submitted successfully!'
//       });
      
//       // Reset form
//       resetForm();
//     } catch (error) {
//       console.error("Error submitting request:", error);
//       setNotification({
//         show: true,
//         type: 'error',
//         message: `Error: ${error.message}`
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Reset form after submission
//   const resetForm = () => {
//     setRequestType('packaging');
//     setRequestDetails('');
//     setOrderNumber('');
//     setStartDate('');
//     setEndDate('');
    
//     // Clear notification after 5 seconds
//     setTimeout(() => {
//       setNotification({ show: false, type: '', message: '' });
//     }, 5000);
//   };

//   // Get status badge class
//   const getStatusBadgeClass = (status) => {
//     switch(status) {
//       case 'pending': return 'status-pending';
//       case 'in-progress': return 'status-in-progress';
//       case 'completed': return 'status-completed';
//       case 'rejected': return 'status-rejected';
//       default: return 'status-pending';
//     }
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   return (
//     <div className="support-container">
//       <div className="support-header">
//         <h1>Vendor Support Center</h1>
//         <p>Submit your requests or queries to our support team</p>
//       </div>
      
//       {notification.show && (
//         <div className={`notification ${notification.type}`}>
//           <span>{notification.message}</span>
//           <button 
//             className="close-notification" 
//             onClick={() => setNotification({ show: false, type: '', message: '' })}
//           >
//             &times;
//           </button>
//         </div>
//       )}
      
//       <div className="support-content">
//         <div className="support-form-container">
//           <h2>New Support Request</h2>
          
//           <div className="form-group">
//             <label htmlFor="requestType">Request Type</label>
//             <select 
//               id="requestType" 
//               value={requestType} 
//               onChange={(e) => setRequestType(e.target.value)}
//               className="select-input"
//             >
//               {requestTypes.map(type => (
//                 <option key={type.id} value={type.id}>{type.label}</option>
//               ))}
//             </select>
//             <p className="field-description">
//               {requestTypes.find(type => type.id === requestType)?.description}
//             </p>
//           </div>
          
//           {/* Conditional fields based on request type */}
//           {requestType === 'payment_query' && (
//             <div className="form-group">
//               <label htmlFor="orderNumber">Order Number</label>
//               <input
//                 type="text"
//                 id="orderNumber"
//                 value={orderNumber}
//                 onChange={(e) => setOrderNumber(e.target.value)}
//                 placeholder="Enter the order number for your query"
//                 className="text-input"
//               />
//             </div>
//           )}
          
//           {requestType === 'schedule' && (
//             <div className="date-fields">
//               <div className="form-group">
//                 <label htmlFor="startDate">Start Date</label>
//                 <input
//                   type="date"
//                   id="startDate"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="date-input"
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="endDate">End Date</label>
//                 <input
//                   type="date"
//                   id="endDate"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   className="date-input"
//                 />
//               </div>
//             </div>
//           )}
          
//           <div className="form-group">
//             <label htmlFor="requestDetails">Request Details</label>
//             <textarea
//               id="requestDetails"
//               value={requestDetails}
//               onChange={(e) => setRequestDetails(e.target.value)}
//               placeholder="Please provide detailed information about your request"
//               rows={5}
//               className="textarea-input"
//             ></textarea>
//           </div>
          
//           <button 
//             onClick={handleSubmit} 
//             className="submit-button"
//             disabled={loading}
//           >
//             {loading ? (
//               <div className="loader-container">
//                 <div className="loader"></div>
//                 <span>Submitting...</span>
//               </div>
//             ) : (
//               'Submit Request'
//             )}
//           </button>
//         </div>
        
//         <div className="recent-requests-container">
//           <h2>Recent Requests</h2>
          
//           {recentRequests.length > 0 ? (
//             <div className="requests-list">
//               {recentRequests.map((request) => (
//                 <div key={request.id} className="request-card">
//                   <div className="request-header">
//                     <span className="request-type">
//                       {requestTypes.find(t => t.id === request.type)?.label || request.type}
//                     </span>
//                     <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
//                       {request.status}
//                     </span>
//                   </div>
                  
//                   <div className="request-body">
//                     <p className="request-details">{request.details}</p>
                    
//                     {request.orderNumber && (
//                       <p className="request-meta">
//                         <strong>Order:</strong> {request.orderNumber}
//                       </p>
//                     )}
                    
//                     {request.startDate && request.endDate && (
//                       <p className="request-meta">
//                         <strong>Period:</strong> {formatDate(request.startDate)} to {formatDate(request.endDate)}
//                       </p>
//                     )}
                    
//                     <p className="request-date">
//                       Submitted on {formatDate(request.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="no-requests">
//               <p>No recent requests found</p>
//               <p className="no-requests-sub">Your submitted requests will appear here</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Support;


import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase'; // Import from your firebase config file
import { ref, push, set, onValue, query, orderByChild, limitToLast, get } from 'firebase/database';
import './Support.css';

const Support = () => {
  // Form states
  const [requestType, setRequestType] = useState('packaging');
  const [requestDetails, setRequestDetails] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [shopName, setShopName] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [recentRequests, setRecentRequests] = useState([]);
  const [user, setUser] = useState(null);

  // Request type options from the images
  const requestTypes = [
    { id: 'packaging', label: 'Request to Zappcart (Packaging, Clothes, etc.)', 
      description: 'Request packaging materials, clothes, or other supplies' },
    { id: 'schedule', label: 'Vendor Schedule', 
      description: 'Mark off holidays or non-working days' },
    { id: 'payment', label: 'Payment Section', 
      description: 'General payment related inquiries' },
    { id: 'payment_query', label: 'Raise Payment Query', 
      description: 'Submit disputes or questions on a specific order' },
  ];

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchRecentRequests(currentUser.uid);
        fetchShopDetails(currentUser.uid);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch shop details for the current vendor
  const fetchShopDetails = async (vendorId) => {
    try {
      const shopRef = ref(db, `shops/${vendorId}`);
      const snapshot = await get(shopRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Pre-fill the form with existing shop details if available
        setVendorName(data.owner || '');
        setShopName(data.name || '');
      }
    } catch (error) {
      console.error("Error fetching shop details:", error);
    }
  };

  // Fetch recent requests for the current vendor
  const fetchRecentRequests = (vendorId) => {
    const requestsRef = query(
      ref(db, 'support_requests'),
      orderByChild('vendorId'),
      limitToLast(5)
    );
    
    onValue(requestsRef, (snapshot) => {
      const requests = [];
      snapshot.forEach((childSnapshot) => {
        const request = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        if (request.vendorId === vendorId) {
          requests.push(request);
        }
      });
      setRecentRequests(requests.reverse());
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!requestDetails.trim()) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please provide request details'
      });
      return;
    }
    
    if (requestType === 'payment_query' && !orderNumber.trim()) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please provide an order number'
      });
      return;
    }
    
    if (requestType === 'schedule' && (!startDate || !endDate)) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please select both start and end dates'
      });
      return;
    }
    
    if (!vendorName.trim()) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please enter your name'
      });
      return;
    }
    
    if (!shopName.trim()) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please enter your shop name'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create request object
      const requestData = {
        type: requestType,
        details: requestDetails,
        createdAt: new Date().toISOString(),
        status: 'pending',
        vendorId: user ? user.uid : 'guest',
        vendorName: vendorName.trim(),
        shopName: shopName.trim()
      };
      
      // Add conditional fields
      if (requestType === 'payment_query') {
        requestData.orderNumber = orderNumber;
      }
      
      if (requestType === 'schedule') {
        requestData.startDate = startDate;
        requestData.endDate = endDate;
      }
      
      // Create a new entry in Firebase
      const newRequestRef = push(ref(db, 'support_requests'));
      await set(newRequestRef, requestData);
      
      // Update shop details in Firebase with the provided name and shop name
      if (user) {
        const shopRef = ref(db, `shops/${user.uid}`);
        const shopSnapshot = await get(shopRef);
        
        if (shopSnapshot.exists()) {
          // Update existing shop record
          const currentData = shopSnapshot.val();
          await set(shopRef, {
            ...currentData,
            owner: vendorName.trim(),
            name: shopName.trim()
          });
        } else {
          // Create new shop record
          await set(shopRef, {
            owner: vendorName.trim(),
            name: shopName.trim(),
            createdAt: new Date().toISOString()
          });
        }
      }
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Your request has been submitted successfully!'
      });
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error submitting request:", error);
      setNotification({
        show: true,
        type: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form after submission
  const resetForm = () => {
    setRequestType('packaging');
    setRequestDetails('');
    setOrderNumber('');
    setStartDate('');
    setEndDate('');
    // Don't reset vendor name and shop name to improve user experience
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="support-container">
      <div className="support-header">
        <h1>Vendor Support Center</h1>
        <p>Submit your requests or queries to our support team</p>
      </div>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="close-notification" 
            onClick={() => setNotification({ show: false, type: '', message: '' })}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="support-content">
        <div className="support-form-container">
          <h2>New Support Request</h2>
          
          {/* Vendor and Shop Name Fields */}
          <div className="vendor-info-fields">
            <div className="form-group">
              <label htmlFor="vendorName">Your Name</label>
              <input
                type="text"
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Enter your name"
                className="text-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="shopName">Shop Name</label>
              <input
                type="text"
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter your shop name"
                className="text-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="requestType">Request Type</label>
            <select 
              id="requestType" 
              value={requestType} 
              onChange={(e) => setRequestType(e.target.value)}
              className="select-input"
            >
              {requestTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <p className="field-description">
              {requestTypes.find(type => type.id === requestType)?.description}
            </p>
          </div>
          
          {/* Conditional fields based on request type */}
          {requestType === 'payment_query' && (
            <div className="form-group">
              <label htmlFor="orderNumber">Order Number</label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter the order number for your query"
                className="text-input"
              />
            </div>
          )}
          
          {requestType === 'schedule' && (
            <div className="date-fields">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="requestDetails">Request Details</label>
            <textarea
              id="requestDetails"
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              placeholder="Please provide detailed information about your request"
              rows={5}
              className="textarea-input"
            ></textarea>
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
        
        <div className="recent-requests-container">
          <h2>Recent Requests</h2>
          
          {recentRequests.length > 0 ? (
            <div className="requests-list">
              {recentRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <span className="request-type">
                      {requestTypes.find(t => t.id === request.type)?.label || request.type}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="request-body">
                    <p className="request-details">{request.details}</p>
                    
                    {request.orderNumber && (
                      <p className="request-meta">
                        <strong>Order:</strong> {request.orderNumber}
                      </p>
                    )}
                    
                    {request.startDate && request.endDate && (
                      <p className="request-meta">
                        <strong>Period:</strong> {formatDate(request.startDate)} to {formatDate(request.endDate)}
                      </p>
                    )}
                    
                    {request.adminComment && (
                      <div className={`admin-response ${request.status === 'approved' ? 'approved-response' : request.status === 'rejected' ? 'rejected-response' : ''}`}>
                        <p className="admin-response-title">
                          Admin Response:
                        </p>
                        <p className="admin-response-text">{request.adminComment}</p>
                      </div>
                    )}
                    
                    <p className="request-date">
                      Submitted on {formatDate(request.createdAt)}
                      {request.updatedAt && request.status !== 'pending' && (
                        <span> • {request.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDate(request.updatedAt)}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-requests">
              <p>No recent requests found</p>
              <p className="no-requests-sub">Your submitted requests will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;