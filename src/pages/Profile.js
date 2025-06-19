// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { getDatabase, ref, get, set, update } from 'firebase/database';
// import './PageStyles.css';

// const Profile = () => {
//   const { currentUser } = useAuth();
//   const [vendorProfile, setVendorProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [shopId, setShopId] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [editableProfile, setEditableProfile] = useState({});
  
//   // States for categories from Firebase
//   const [categories, setCategories] = useState([]);
//   const [selectedCategories, setSelectedCategories] = useState({});
  
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState('');
//   const [profileSaveMessage, setProfileSaveMessage] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!currentUser) return;
      
//       const db = getDatabase();
//       setLoading(true);
      
//       try {
//         // Fetch categories first
//         const categoriesRef = ref(db, 'categories');
//         const categoriesSnapshot = await get(categoriesRef);
        
//         let formattedCategories = [];
//         if (categoriesSnapshot.exists()) {
//           const categoriesData = categoriesSnapshot.val();
//           formattedCategories = Object.entries(categoriesData).map(([id, category]) => ({
//             id,
//             ...category
//           }));
//           setCategories(formattedCategories);
//         }
        
//         // Fetch vendor profile
//         const shopsRef = ref(db, 'shops');
//         const shopsSnapshot = await get(shopsRef);
        
//         if (shopsSnapshot.exists()) {
//           const shops = shopsSnapshot.val();
          
//           // Find the shop that matches the current user's email
//           let foundShopId = null;
//           let foundShop = null;
          
//           Object.entries(shops).forEach(([id, shop]) => {
//             if (shop.email === currentUser.email) {
//               foundShopId = id;
//               foundShop = shop;
//             }
//           });
          
//           if (foundShop) {
//             setShopId(foundShopId);
//             const profileData = {
//               name: foundShop.name || '',
//               vendorId: foundShopId,
//               email: foundShop.email || '',
//               phone: foundShop.phone || '',
//               address: foundShop.address || '',
//               category: foundShop.category || '',
//               joinDate: foundShop.joinDate || '',
//               operatingHours: foundShop.operatingHours || '',
//               rating: foundShop.rating || 0,
//             };
            
//             setVendorProfile(profileData);
//             setEditableProfile(profileData);
            
//             // Handle selected categories properly
//             let categoriesState = {};
            
//             // Initialize all categories to false first
//             formattedCategories.forEach(category => {
//               categoriesState[category.id] = false;
//             });
            
//             // Then apply saved selections if they exist
//             if (foundShop.selectedCategories) {
//               // Merge saved selections with initialized state
//               categoriesState = {
//                 ...categoriesState,
//                 ...foundShop.selectedCategories
//               };
//             }
            
//             setSelectedCategories(categoriesState);
//           }
//         }
        
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [currentUser]);
  
//   const handleCategoryChange = (categoryId) => {
//     setSelectedCategories({
//       ...selectedCategories,
//       [categoryId]: !selectedCategories[categoryId]
//     });
//   };
  
//   const toggleEditMode = () => {
//     if (editMode) {
//       // Exiting edit mode without saving
//       setEditableProfile(vendorProfile);
//     }
//     setEditMode(!editMode);
//     setProfileSaveMessage('');
//   };
  
//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setEditableProfile({
//       ...editableProfile,
//       [name]: value
//     });
//   };
  
//   const saveProfile = async () => {
//     if (!shopId) return;
    
//     setIsSaving(true);
//     setProfileSaveMessage('');
    
//     const db = getDatabase();
//     const shopRef = ref(db, `shops/${shopId}`);
    
//     try {
//       // Update only the editable fields in Firebase
//       const updatedData = {
//         name: editableProfile.name,
//         phone: editableProfile.phone,
//         address: editableProfile.address,
//         category: editableProfile.category,
//         operatingHours: editableProfile.operatingHours,
//       };
      
//       await update(shopRef, updatedData);
      
//       // Update local state with new values
//       setVendorProfile({
//         ...vendorProfile,
//         ...updatedData
//       });
      
//       setProfileSaveMessage('Profile updated successfully!');
//       setEditMode(false);
      
//       setTimeout(() => setProfileSaveMessage(''), 3000);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       setProfileSaveMessage('Failed to update profile. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };
  
//   const saveCategories = async () => {
//     if (!shopId) return;
    
//     setIsSaving(true);
//     setSaveMessage('');
    
//     const db = getDatabase();
//     const selectedCategoriesRef = ref(db, `shops/${shopId}/selectedCategories`);
    
//     try {
//       await set(selectedCategoriesRef, selectedCategories);
//       setSaveMessage('Category selections saved successfully!');
//       setTimeout(() => setSaveMessage(''), 3000);
//     } catch (error) {
//       console.error("Error saving category selections:", error);
//       setSaveMessage('Failed to save. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };
  
//   if (loading) {
//     return <div className="page">Loading vendor profile...</div>;
//   }
  
//   if (!vendorProfile) {
//     return <div className="page">No vendor profile found. Please contact support.</div>;
//   }
  
//   return (
//     <div className="page">
//       <h2>Vendor Profile</h2>
      
//       <div className="profile-container">
//         <div className="profile-header">
//           <div className="profile-avatar">
//             {vendorProfile.name.charAt(0)}
//           </div>
//           <div className="profile-header-info">
//             {editMode ? (
//               <input
//                 type="text"
//                 name="name"
//                 value={editableProfile.name}
//                 onChange={handleProfileChange}
//                 className="edit-name-input"
//                 placeholder="Business Name"
//               />
//             ) : (
//               <h3>{vendorProfile.name}</h3>
//             )}
//             <p className="vendor-id">Vendor ID: {vendorProfile.vendorId}</p>
//             <div className="vendor-rating">
//               <span className="rating-value">{vendorProfile.rating}</span>
//               <span className="rating-stars">
//                 {'★'.repeat(Math.floor(vendorProfile.rating))}
//                 {'☆'.repeat(5 - Math.floor(vendorProfile.rating))}
//               </span>
//               <span className="rating-label">Vendor Rating</span>
//             </div>
//           </div>
//         </div>
        
//         {profileSaveMessage && (
//           <div className={`profile-save-message ${profileSaveMessage.includes('success') ? 'success' : 'error'}`}>
//             {profileSaveMessage}
//           </div>
//         )}
        
//         <div className="profile-sections">
//           <div className="profile-section">
//             <h4>Contact Information</h4>
//             <div className="profile-info-item">
//               <span className="info-label">Email:</span>
//               <span className="info-value">{vendorProfile.email}</span>
//               <span className="edit-note">(Email cannot be changed)</span>
//             </div>
//             <div className="profile-info-item">
//               <span className="info-label">Phone:</span>
//               {editMode ? (
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editableProfile.phone}
//                   onChange={handleProfileChange}
//                   className="edit-input"
//                   placeholder="Phone Number"
//                 />
//               ) : (
//                 <span className="info-value">{vendorProfile.phone}</span>
//               )}
//             </div>
//             <div className="profile-info-item">
//               <span className="info-label">Address:</span>
//               {editMode ? (
//                 <textarea
//                   name="address"
//                   value={editableProfile.address}
//                   onChange={handleProfileChange}
//                   className="edit-textarea"
//                   placeholder="Business Address"
//                   rows={3}
//                 />
//               ) : (
//                 <span className="info-value">{vendorProfile.address}</span>
//               )}
//             </div>
//           </div>
          
//           <div className="profile-section">
//             <h4>Business Information</h4>
//             <div className="profile-info-item">
//               <span className="info-label">Category:</span>
//               {editMode ? (
//                 <input
//                   type="text"
//                   name="category"
//                   value={editableProfile.category}
//                   onChange={handleProfileChange}
//                   className="edit-input"
//                   placeholder="Business Category"
//                 />
//               ) : (
//                 <span className="info-value">{vendorProfile.category}</span>
//               )}
//             </div>
//             <div className="profile-info-item">
//               <span className="info-label">Joined:</span>
//               <span className="info-value">
//                 {new Date(vendorProfile.joinDate).toLocaleDateString()}
//               </span>
//               <span className="edit-note">(Cannot be changed)</span>
//             </div>
//             <div className="profile-info-item">
//               <span className="info-label">Operating Hours:</span>
//               {editMode ? (
//                 <input
//                   type="text"
//                   name="operatingHours"
//                   value={editableProfile.operatingHours}
//                   onChange={handleProfileChange}
//                   className="edit-input"
//                   placeholder="e.g. 8:00 AM - 9:00 PM"
//                 />
//               ) : (
//                 <span className="info-value">{editableProfile.operatingHours || "Not specified"}</span>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="profile-actions">
//           {editMode ? (
//             <>
//               <button 
//                 className="btn btn-primary" 
//                 onClick={saveProfile}
//                 disabled={isSaving}
//               >
//                 {isSaving ? 'Saving...' : 'Save Changes'}
//               </button>
//               <button 
//                 className="btn btn-outline" 
//                 onClick={toggleEditMode}
//               >
//                 Cancel
//               </button>
//             </>
//           ) : (
//             <>
//               <button 
//                 className="btn btn-primary" 
//                 onClick={toggleEditMode}
//               >
//                 Edit Profile
//               </button>
//               <button className="btn btn-outline">Change Password</button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import { sendPasswordResetEmail } from 'firebase/auth'; // Added import for password reset
import { auth } from '../services/firebase'; // Import auth directly from firebase config
import './PageStyles.css';

const Profile = () => {
  const { currentUser } = useAuth(); // Remove auth from here since we're importing it directly
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  
  // States for categories from Firebase
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  
  // Add these states for password reset functionality
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [passwordResetError, setPasswordResetError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      const db = getDatabase();
      setLoading(true);
      
      try {
        // Fetch categories first
        const categoriesRef = ref(db, 'categories');
        const categoriesSnapshot = await get(categoriesRef);
        
        let formattedCategories = [];
        if (categoriesSnapshot.exists()) {
          const categoriesData = categoriesSnapshot.val();
          formattedCategories = Object.entries(categoriesData).map(([id, category]) => ({
            id,
            ...category
          }));
          setCategories(formattedCategories);
        }
        
        // Fetch vendor profile
        const shopsRef = ref(db, 'shops');
        const shopsSnapshot = await get(shopsRef);
        
        if (shopsSnapshot.exists()) {
          const shops = shopsSnapshot.val();
          
          // Find the shop that matches the current user's email
          let foundShopId = null;
          let foundShop = null;
          
          Object.entries(shops).forEach(([id, shop]) => {
            if (shop.email === currentUser.email) {
              foundShopId = id;
              foundShop = shop;
            }
          });
          
          if (foundShop) {
            setShopId(foundShopId);
            const profileData = {
              name: foundShop.name || '',
              vendorId: foundShopId,
              email: foundShop.email || '',
              phone: foundShop.phone || '',
              address: foundShop.address || '',
              category: foundShop.category || '',
              joinDate: foundShop.joinDate || '',
              operatingHours: foundShop.operatingHours || '',
              rating: foundShop.rating || 0,
            };
            
            setVendorProfile(profileData);
            setEditableProfile(profileData);
            
            // Handle selected categories properly
            let categoriesState = {};
            
            // Initialize all categories to false first
            formattedCategories.forEach(category => {
              categoriesState[category.id] = false;
            });
            
            // Then apply saved selections if they exist
            if (foundShop.selectedCategories) {
              // Merge saved selections with initialized state
              categoriesState = {
                ...categoriesState,
                ...foundShop.selectedCategories
              };
            }
            
            setSelectedCategories(categoriesState);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories({
      ...selectedCategories,
      [categoryId]: !selectedCategories[categoryId]
    });
  };
  
  const toggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode without saving
      setEditableProfile(vendorProfile);
    }
    setEditMode(!editMode);
    setProfileSaveMessage('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile({
      ...editableProfile,
      [name]: value
    });
  };
  
  const saveProfile = async () => {
    if (!shopId) return;
    
    setIsSaving(true);
    setProfileSaveMessage('');
    
    const db = getDatabase();
    const shopRef = ref(db, `shops/${shopId}`);
    
    try {
      // Update only the editable fields in Firebase
      const updatedData = {
        name: editableProfile.name,
        phone: editableProfile.phone,
        address: editableProfile.address,
        category: editableProfile.category,
        operatingHours: editableProfile.operatingHours,
      };
      
      await update(shopRef, updatedData);
      
      // Update local state with new values
      setVendorProfile({
        ...vendorProfile,
        ...updatedData
      });
      
      setProfileSaveMessage('Profile updated successfully!');
      setEditMode(false);
      
      setTimeout(() => setProfileSaveMessage(''), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveCategories = async () => {
    if (!shopId) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    const db = getDatabase();
    const selectedCategoriesRef = ref(db, `shops/${shopId}/selectedCategories`);
    
    try {
      await set(selectedCategoriesRef, selectedCategories);
      setSaveMessage('Category selections saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error("Error saving category selections:", error);
      setSaveMessage('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add the password reset handler
  const handlePasswordReset = async () => {
    if (!vendorProfile || !vendorProfile.email) return;
    
    // Confirm before sending reset email
    const confirmed = window.confirm(
      `We will send a password reset email to ${vendorProfile.email}. Continue?`
    );
    
    if (!confirmed) return;
    
    setIsResettingPassword(true);
    setPasswordResetMessage('');
    setPasswordResetError('');
    
    try {
      await sendPasswordResetEmail(auth, vendorProfile.email);
      setPasswordResetMessage(`Password reset email sent to ${vendorProfile.email}. Please check your inbox and spam folder.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setPasswordResetMessage(''), 5000);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setPasswordResetError('No account found with this email address');
      } else {
        setPasswordResetError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  if (loading) {
    return <div className="page">Loading vendor profile...</div>;
  }
  
  if (!vendorProfile) {
    return <div className="page">No vendor profile found. Please contact support.</div>;
  }
  
  return (
    <div className="page">
      <h2>Vendor Profile</h2>
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {vendorProfile.name.charAt(0)}
          </div>
          <div className="profile-header-info">
            {editMode ? (
              <input
                type="text"
                name="name"
                value={editableProfile.name}
                onChange={handleProfileChange}
                className="edit-name-input"
                placeholder="Business Name"
              />
            ) : (
              <h3>{vendorProfile.name}</h3>
            )}
            <p className="vendor-id">Vendor ID: {vendorProfile.vendorId}</p>
            <div className="vendor-rating">
              <span className="rating-value">{vendorProfile.rating}</span>
              <span className="rating-stars">
                {'★'.repeat(Math.floor(vendorProfile.rating))}
                {'☆'.repeat(5 - Math.floor(vendorProfile.rating))}
              </span>
              <span className="rating-label">Vendor Rating</span>
            </div>
          </div>
        </div>
        
        {/* Profile save message */}
        {profileSaveMessage && (
          <div className={`profile-save-message ${profileSaveMessage.includes('success') ? 'success' : 'error'}`}>
            {profileSaveMessage}
          </div>
        )}
        
        {/* Password reset messages */}
        {passwordResetMessage && (
          <div className="profile-save-message success">
            {passwordResetMessage}
          </div>
        )}
        
        {passwordResetError && (
          <div className="profile-save-message error">
            {passwordResetError}
          </div>
        )}
        
        <div className="profile-sections">
          <div className="profile-section">
            <h4>Contact Information</h4>
            <div className="profile-info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{vendorProfile.email}</span>
              <span className="edit-note">(Email cannot be changed)</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Phone:</span>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={editableProfile.phone}
                  onChange={handleProfileChange}
                  className="edit-input"
                  placeholder="Phone Number"
                />
              ) : (
                <span className="info-value">{vendorProfile.phone}</span>
              )}
            </div>
            <div className="profile-info-item">
              <span className="info-label">Address:</span>
              {editMode ? (
                <textarea
                  name="address"
                  value={editableProfile.address}
                  onChange={handleProfileChange}
                  className="edit-textarea"
                  placeholder="Business Address"
                  rows={3}
                />
              ) : (
                <span className="info-value">{vendorProfile.address}</span>
              )}
            </div>
          </div>
          
          <div className="profile-section">
            <h4>Business Information</h4>
            <div className="profile-info-item">
              <span className="info-label">Category:</span>
              {editMode ? (
                <input
                  type="text"
                  name="category"
                  value={editableProfile.category}
                  onChange={handleProfileChange}
                  className="edit-input"
                  placeholder="Business Category"
                />
              ) : (
                <span className="info-value">{vendorProfile.category}</span>
              )}
            </div>
            <div className="profile-info-item">
              <span className="info-label">Joined:</span>
              <span className="info-value">
                {new Date(vendorProfile.joinDate).toLocaleDateString()}
              </span>
              <span className="edit-note">(Cannot be changed)</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Operating Hours:</span>
              {editMode ? (
                <input
                  type="text"
                  name="operatingHours"
                  value={editableProfile.operatingHours}
                  onChange={handleProfileChange}
                  className="edit-input"
                  placeholder="e.g. 8:00 AM - 9:00 PM"
                />
              ) : (
                <span className="info-value">{vendorProfile.operatingHours || "Not specified"}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          {editMode ? (
            <>
              <button 
                className="btn btn-primary" 
                onClick={saveProfile}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={toggleEditMode}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-primary" 
                onClick={toggleEditMode}
              >
                Edit Profile
              </button>
              <button 
                className="btn btn-outline"
                onClick={handlePasswordReset}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? 'Sending Email...' : 'Change Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;