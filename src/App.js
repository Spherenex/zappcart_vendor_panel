

// // src/App.js (updated)
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { NotificationsProvider } from './contexts/NotificationsContext'; // Add this
// import Login from './components/auth/Login';
// import Dashboard from './components/dashboard/Dashboard';
// import Orders from './pages/Orders';
// import Inventory from './pages/Inventory';
// import Payments from './pages/Payments';
// import Delivery from './pages/Delivery';
// import Products from './pages/Products';
// import Profile from './pages/Profile';
// import Support from './pages/Support';
// import Notifications from './pages/Notifications'; // Add this
// import './App.css';

// // Protected Route component
// const ProtectedRoute = ({ children }) => {
//   const { currentUser } = useAuth();
  
//   if (!currentUser) {
//     return <Navigate to="/" />;
//   }
  
//   return children;
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <NotificationsProvider> {/* Add this */}
//           <Routes>
//             <Route path="/" element={<Login />} />
            
//             <Route 
//               path="/dashboard" 
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             >
//               <Route index element={<Navigate to="/dashboard/orders" />} />
//               <Route path="orders" element={<Orders />} />
//               {/* <Route path="inventory" element={<Inventory />} /> */}
//               <Route path="payments" element={<Payments />} />
//               <Route path="delivery" element={<Delivery />} />
//               <Route path="products" element={<Products />} />
//               <Route path="profile" element={<Profile />} />
//               <Route path="support" element={<Support />} />
//               <Route path="notifications" element={<Notifications />} /> {/* Add this */}
//             </Route>
            
//             {/* Catch all undefined routes */}
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </NotificationsProvider>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;



// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VendorNotificationsProvider } from './contexts/VendorNotificationsContext'; // Updated import
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Delivery from './pages/Delivery';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Notifications from './pages/Notifications'; // Updated import
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <VendorNotificationsProvider> {/* Updated provider */}
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/orders" />} />
              <Route path="orders" element={<Orders />} />
              {/* <Route path="inventory" element={<Inventory />} /> */}
              <Route path="payments" element={<Payments />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="products" element={<Products />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<Support />} />
              <Route path="notifications" element={<Notifications />} /> {/* Updated component */}
            </Route>
            
            {/* Catch all undefined routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </VendorNotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;