




// import React, { useState, useEffect } from 'react';
// import { getDatabase, ref, onValue, update, get } from 'firebase/database';
// import { useAuth } from '../contexts/AuthContext';
// import './Products.css';

// const Products = () => {
//   const { currentUser } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [shopId, setShopId] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState({});
//   const [items, setItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [activeSection, setActiveSection] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [itemsStock, setItemsStock] = useState({});
  
//   // New states for vendor pricing (read-only)
//   const [vendorPrices, setVendorPrices] = useState({});
//   const [basePrices, setBasePrices] = useState({});

//   // Category display names mapping
//   const categoryDisplayNames = {
//     'chicken': 'Chicken',
//     'mutton': 'Mutton', 
//     'liver-more': 'Liver & More',
//     'fish-seafood': 'Fish & Seafood',
//     'combos': 'Combos',
//     'eggs': 'Eggs',
//     'goat': 'Goat',
//     'prawns-crabs': 'Prawns & Crabs'
//   };

//   // Section display names
//   const sectionDisplayNames = {
//     'all': 'All Items',
//     'bestsellers': 'Bestsellers',
//     'match-day': 'Match Day Essentials',
//     'premium-fish': 'Premium Fish & Seafood'
//   };

//   useEffect(() => {
//     const db = getDatabase();
    
//     const fetchVendorData = async () => {
//       if (!currentUser) return;
      
//       try {
//         // Find shop ID for current vendor
//         const shopsRef = ref(db, 'shops');
//         const shopsSnapshot = await get(shopsRef);
        
//         if (shopsSnapshot.exists()) {
//           const shops = shopsSnapshot.val();
          
//           // Find the shop that matches the current user's email
//           let foundShopId = null;
          
//           Object.entries(shops).forEach(([id, shop]) => {
//             if (shop.email === currentUser.email) {
//               foundShopId = id;
              
//               // Set selected categories if they exist
//               if (shop.selectedCategories) {
//                 setSelectedCategories(shop.selectedCategories);
//               }

//               // Set items stock status if it exists
//               if (shop.itemsStock) {
//                 setItemsStock(shop.itemsStock);
//               }
              
//               // Set vendor prices if they exist (read-only)
//               if (shop.vendorPrices) {
//                 setVendorPrices(shop.vendorPrices);
//               }
              
//               // Set base prices if they exist (read-only)
//               if (shop.basePrices) {
//                 setBasePrices(shop.basePrices);
//               }
//             }
//           });
          
//           if (foundShopId) {
//             setShopId(foundShopId);
//           } else {
//             setError("Shop not found for this vendor");
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching vendor data:", err);
//         setError("Failed to load vendor data");
//       }
//     };

//     // Fetch all items
//     const fetchItems = () => {
//       const itemsRef = ref(db, 'items');
      
//       onValue(itemsRef, (snapshot) => {
//         try {
//           if (snapshot.exists()) {
//             const itemsData = [];
//             const processedIds = new Set(); // To track processed items and prevent duplicates
            
//             snapshot.forEach((childSnapshot) => {
//               const item = {
//                 id: childSnapshot.key,
//                 ...childSnapshot.val(),
//                 inStock: true // Default value
//               };
              
//               // Add item to the array only if we haven't processed an item with the same ID
//               if (!processedIds.has(item.id)) {
//                 itemsData.push(item);
//                 processedIds.add(item.id);
//               }
//             });
            
//             console.log(`Fetched ${itemsData.length} unique items`);
//             setItems(itemsData);
//           } else {
//             setItems([]);
//           }
//         } catch (err) {
//           console.error("Error processing items:", err);
//           setError("Failed to load items");
//         } finally {
//           setLoading(false);
//         }
//       }, (err) => {
//         console.error("Error fetching items:", err);
//         setError("Failed to load items");
//         setLoading(false);
//       });
//     };

//     fetchVendorData().then(fetchItems);

//     // Cleanup
//     return () => {
//       const itemsRef = ref(db, 'items');
//       onValue(itemsRef, () => {}, { onlyOnce: true });
//     };
//   }, [currentUser]);

//   // Filter items whenever selectedCategories, items, activeSection, or searchTerm changes
//   useEffect(() => {
//     if (items.length === 0 || Object.keys(selectedCategories).length === 0) {
//       setFilteredItems([]);
//       return;
//     }

//     // Get array of selected category keys (where value is true)
//     const selectedCategoryKeys = Object.entries(selectedCategories)
//       .filter(([_, isSelected]) => isSelected === true)
//       .map(([key]) => key);

//     console.log("Selected category keys:", selectedCategoryKeys);

//     // Create a Map to store filtered items by ID to prevent duplicates
//     const filteredItemsMap = new Map();

//     // Filter items based on selected categories and active section - EXPANDED LOGIC FOR ALL SECTIONS
//     items.forEach(item => {
//       // Skip if we already added this item
//       if (filteredItemsMap.has(item.id)) return;
      
//       // Apply the stock status from itemsStock if available
//       if (itemsStock[item.id]) {
//         item.inStock = itemsStock[item.id].inStock;
//       }

//       // Check if item belongs to selected category - EXPANDED LOGIC FOR ALL SECTIONS
//       let belongsToSelectedCategory = false;
      
//       // Method 1: Direct displayCategory match
//       if (item.displayCategory) {
//         belongsToSelectedCategory = selectedCategoryKeys.includes(item.displayCategory);
//       }
      
//       // Method 2: Category name matching (for all sections)
//       if (!belongsToSelectedCategory && item.category) {
//         for (const catKey of selectedCategoryKeys) {
//           const expectedCategoryName = categoryDisplayNames[catKey];
          
//           // Direct category name match
//           if (item.category === expectedCategoryName) {
//             belongsToSelectedCategory = true;
//             break;
//           }
          
//           // Special section mappings
//           if (catKey === 'fish-seafood') {
//             if (item.category === "Premium fish & seafood selection" || 
//                 item.category === "Fish & Seafood" ||
//                 item.category.toLowerCase().includes('fish') ||
//                 item.category.toLowerCase().includes('seafood')) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'liver-more') {
//             if (item.category === "Liver & More" ||
//                 item.category.toLowerCase().includes('liver')) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'chicken') {
//             if (item.category.toLowerCase().includes('chicken') ||
//                 item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('chicken')) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'mutton') {
//             if (item.category.toLowerCase().includes('mutton') ||
//                 item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('mutton')) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'goat') {
//             if (item.category.toLowerCase().includes('goat') ||
//                 item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('goat')) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'eggs') {
//             if (item.category.toLowerCase().includes('egg') ||
//                 item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('egg')) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'combos') {
//             if (item.category.toLowerCase().includes('combo') ||
//                 item.category === "Match Day Essentials") {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
          
//           if (catKey === 'prawns-crabs') {
//             if (item.category.toLowerCase().includes('prawn') ||
//                 item.category.toLowerCase().includes('crab') ||
//                 item.category === "Premium fish & seafood selection") {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
//         }
//       }
      
//       // Method 3: Check item name/description for category keywords (fallback)
//       if (!belongsToSelectedCategory) {
//         for (const catKey of selectedCategoryKeys) {
//           const categoryName = categoryDisplayNames[catKey];
//           if (categoryName && item.name) {
//             const itemNameLower = item.name.toLowerCase();
//             const categoryLower = categoryName.toLowerCase();
            
//             // Check if item name contains category keywords
//             if (itemNameLower.includes(categoryLower.split(' ')[0]) ||
//                 (catKey === 'fish-seafood' && (itemNameLower.includes('fish') || itemNameLower.includes('seafood'))) ||
//                 (catKey === 'prawns-crabs' && (itemNameLower.includes('prawn') || itemNameLower.includes('crab'))) ||
//                 (catKey === 'liver-more' && itemNameLower.includes('liver'))) {
//               belongsToSelectedCategory = true;
//               break;
//             }
//           }
//         }
//       }

//       // If the item doesn't belong to any selected category, skip it
//       if (!belongsToSelectedCategory) return;

//       // Handle section filtering
//       if (activeSection !== 'all') {
//         // Special section filters
//         if (activeSection === 'bestsellers') {
//           if (item.category !== 'Bestsellers' && item.featured !== true) return;
//         } 
//         else if (activeSection === 'match-day') {
//           if (item.category !== 'Match Day Essentials') return;
//         } 
//         else if (activeSection === 'premium-fish') {
//           if (item.category !== 'Premium fish & seafood selection') return;
//         }
//         // Category tab filtering
//         else if (categoryDisplayNames[activeSection]) {
//           // For direct category tabs (chicken, mutton, etc.)
//           const matchesCategory = (
//             // Direct match on displayCategory
//             item.displayCategory === activeSection || 
//             // Direct match on category name
//             item.category === categoryDisplayNames[activeSection] ||
//             // Special case for shop by categories
//             (item.category === 'Shop by categories' && item.displayCategory === activeSection)
//           );
          
//           if (!matchesCategory) return;
//         }
//       }

//       // Apply search filter
//       if (searchTerm) {
//         const searchLower = searchTerm.toLowerCase();
//         const nameMatch = item.name && item.name.toLowerCase().includes(searchLower);
//         const descMatch = item.description && item.description.toLowerCase().includes(searchLower);
        
//         if (!nameMatch && !descMatch) return;
//       }

//       // If we got here, the item passed all filters - add it to our Map
//       filteredItemsMap.set(item.id, item);
//     });

//     // Convert the Map values back to an array
//     const filtered = Array.from(filteredItemsMap.values());
//     console.log(`Filtered to ${filtered.length} unique items for section "${activeSection}"`);
//     setFilteredItems(filtered);
//   }, [selectedCategories, items, activeSection, searchTerm, itemsStock]);

//   // Stock management function (only functionality vendors can use)
//   const toggleItemAvailability = (itemId) => {
//     // Update local state first for immediate UI feedback
//     setFilteredItems(prevItems => 
//       prevItems.map(item => 
//         item.id === itemId ? { ...item, inStock: !item.inStock } : item
//       )
//     );

//     // Update itemsStock state
//     setItemsStock(prev => ({
//       ...prev,
//       [itemId]: { inStock: !filteredItems.find(item => item.id === itemId).inStock }
//     }));

//     // Update in Firebase
//     if (shopId) {
//       const db = getDatabase();
//       const stockRef = ref(db, `shops/${shopId}/itemsStock/${itemId}`);
//       update(stockRef, { inStock: !filteredItems.find(item => item.id === itemId).inStock });
//     }
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//     const getDisplayPrice = (item) => {
//     const vendorPrice = vendorPrices[item.id]?.price;
//     return vendorPrice || getBaseCost(item.id);
//   };

//   // Helper function to format weight consistently
//   const formatWeight = (weight) => {
//     if (!weight) return '';
    
//     // If weight already has units, return as is
//     if (weight.toString().toLowerCase().includes('g') || 
//         weight.toString().toLowerCase().includes('kg') ||
//         weight.toString().toLowerCase().includes('ml') ||
//         weight.toString().toLowerCase().includes('l')) {
//       return weight;
//     }
    
//     // If it's just a number, add 'g' unit
//     const numericWeight = parseFloat(weight);
//     if (!isNaN(numericWeight)) {
//       return `${numericWeight}g`;
//     }
    
//     // Fallback: add 'g' to whatever we have
//     return `${weight}g`;
//   };

//   const getBaseCost = (itemId) => {
//     // Check if admin has set a custom base price, otherwise use original item price
//     const customBasePrice = basePrices[itemId]?.price;
//     if (customBasePrice) return customBasePrice;
    
//     // Find the item from filteredItems or items array
//     const item = filteredItems.find(item => item.id === itemId) || items.find(item => item.id === itemId);
//     return item?.price || 0;
//   };

//   const getProfitMargin = (item) => {
//     const sellingPrice = getDisplayPrice(item);
//     const baseCost = getBaseCost(item.id);
//     return Math.max(0, sellingPrice - baseCost);
//   };

//   // Get available section tabs based on vendor's selected categories and available items
//   const getAvailableSections = () => {
//     // Start with "All Items"
//     const sections = [{ id: 'all', name: 'All Items' }];
    
//     // Only show tabs for categories that are selected and have items
//     const selectedCategoryKeys = Object.entries(selectedCategories)
//       .filter(([_, isSelected]) => isSelected === true)
//       .map(([key]) => key);
    
//     // Special sections
//     const hasBestsellers = items.some(item => 
//       (item.category === 'Bestsellers' || item.featured === true) && 
//       selectedCategoryKeys.some(key => {
//         // Check if this item would be included in our filtered results
//         if (item.displayCategory === key) return true;
//         if (item.category === categoryDisplayNames[key]) return true;
//         return false;
//       })
//     );
    
//     const hasMatchDay = items.some(item => 
//       item.category === 'Match Day Essentials' && 
//       selectedCategoryKeys.some(key => {
//         if (item.displayCategory === key) return true;
//         if (item.category === categoryDisplayNames[key]) return true;
//         return false;
//       })
//     );
    
//     const hasPremiumFish = items.some(item => 
//       item.category === 'Premium fish & seafood selection' && 
//       selectedCategoryKeys.some(key => {
//         if (key === 'fish-seafood') return true;
//         if (item.displayCategory === key) return true;
//         return false;
//       })
//     );
    
//     // Add special sections
//     if (hasBestsellers) {
//       sections.push({ id: 'bestsellers', name: 'Bestsellers' });
//     }
    
//     if (hasMatchDay) {
//       sections.push({ id: 'match-day', name: 'Match Day Essentials' });
//     }
    
//     if (hasPremiumFish) {
//       sections.push({ id: 'premium-fish', name: 'Premium Fish & Seafood' });
//     }
    
//     // Add category tabs
//     selectedCategoryKeys.forEach(key => {
//       // Only add if there are items in this category
//       const hasItems = items.some(item => 
//         item.displayCategory === key || 
//         item.category === categoryDisplayNames[key] ||
//         (item.category === 'Shop by categories' && item.displayCategory === key)
//       );
      
//       if (hasItems && categoryDisplayNames[key]) {
//         sections.push({ id: key, name: categoryDisplayNames[key] });
//       }
//     });
    
//     return sections;
//   };

//   if (loading) {
//     return (
//       <div className="products-page">
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading your products...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="products-page">
//         <div className="error-message">
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()}>Try Again</button>
//         </div>
//       </div>
//     );
//   }

//   const availableSections = getAvailableSections();

//   return (
//     <div className="products-page">
//       <div className="products-header">
//         <h2>Your Product Catalog</h2>
        
//         <div className="vendor-info">
//           <div className="stock-legend">
//             <span className="in-stock-dot"></span> <span>In Stock</span>
//             <span className="out-of-stock-dot"></span> <span>Out of Stock</span>
//           </div>
          
//           <div className="products-count">
//             <span className="count-badge">{filteredItems.length} Products Available</span>
//           </div>
//         </div>
        
//         <div className="products-search">
//           <input
//             type="text"
//             placeholder="Search your products..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//         </div>
//       </div>

//       {availableSections.length > 1 && (
//         <div className="category-tabs">
//           {availableSections.map(section => (
//             <button
//               key={section.id}
//               className={`category-tab ${activeSection === section.id ? 'active' : ''}`}
//               onClick={() => setActiveSection(section.id)}
//             >
//               {section.name}
//             </button>
//           ))}
//         </div>
//       )}

//       {filteredItems.length === 0 ? (
//         <div className="no-products">
//           <div className="empty-icon">📦</div>
//           <p>No products available in your catalog.</p>
//           <p className="empty-suggestion">Contact your administrator to assign product categories to your shop.</p>
//         </div>
//       ) : (
//         <div className="products-grid">
//           {filteredItems.map(item => (
//             <div key={item.id} className={`product-card ${!item.inStock ? 'out-of-stock' : ''}`}>
//               <div className="product-image">
//                 {item.image ? (
//                   <img src={item.image} alt={item.name} onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'} />
//                 ) : (
//                   <div className="no-image">No Image</div>
//                 )}
//                 {!item.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
//               </div>
              
//               <div className="product-content">
//                 <h3 className="product-name">{item.name}</h3>
//                 <p className="product-category">{item.category}</p>
                
//                 <div className="price-info">
//                   <div className="selling-price">
//                     <span className="price-label">Selling Price:</span>
//                     <span className="price-value">₹{getDisplayPrice(item)}</span>
//                   </div>
                  
//                   <div className="profit-margin">
//                     <span className="profit-label">Your Profit:</span>
//                     <span className="profit-value">₹{getProfitMargin(item)}</span>
//                   </div>
                  
//                   {item.weight && (
//                     <div className="weight-display">
//                       Weight: {formatWeight(item.weight)}
//                     </div>
//                   )}
//                 </div>
                
//                 <button 
//                   className={`stock-button ${item.inStock ? 'in-stock' : 'out-of-stock'}`}
//                   onClick={() => toggleItemAvailability(item.id)}
//                 >
//                   {item.inStock ? 'MARK OUT OF STOCK' : 'MARK IN STOCK'}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Products;



import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import './Products.css';

const Products = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeSection, setActiveSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsStock, setItemsStock] = useState({});
  
  // States for vendor pricing (read-only)
  const [vendorPrices, setVendorPrices] = useState({});
  const [basePrices, setBasePrices] = useState({});
  const [sellingPrices, setSellingPrices] = useState({});

  // Category display names mapping
  const categoryDisplayNames = {
    'chicken': 'Chicken',
    'mutton': 'Mutton', 
    'liver-more': 'Liver & More',
    'fish-seafood': 'Fish & Seafood',
    'combos': 'Combos',
    'eggs': 'Eggs',
    'goat': 'Goat',
    'prawns-crabs': 'Prawns & Crabs'
  };

  // Section display names
  const sectionDisplayNames = {
    'all': 'All Items',
    'bestsellers': 'Bestsellers',
    'match-day': 'Match Day Essentials',
    'premium-fish': 'Premium Fish & Seafood'
  };

  useEffect(() => {
    const db = getDatabase();
    
    const fetchVendorData = async () => {
      if (!currentUser) return;
      
      try {
        // Find shop ID for current vendor
        const shopsRef = ref(db, 'shops');
        const shopsSnapshot = await get(shopsRef);
        
        if (shopsSnapshot.exists()) {
          const shops = shopsSnapshot.val();
          
          // Find the shop that matches the current user's email
          let foundShopId = null;
          let foundShopItemsStock = {};
          
          Object.entries(shops).forEach(([id, shop]) => {
            if (shop.email === currentUser.email) {
              foundShopId = id;
              
              // Set selected categories if they exist
              if (shop.selectedCategories) {
                setSelectedCategories(shop.selectedCategories);
              }

              // Set items stock status if it exists
              if (shop.itemsStock) {
                setItemsStock(shop.itemsStock);
                foundShopItemsStock = shop.itemsStock;
              }
              
              // Set vendor prices if they exist (read-only)
              if (shop.vendorPrices) {
                setVendorPrices(shop.vendorPrices);
              }
              
              // Set base prices if they exist (read-only)
              if (shop.basePrices) {
                setBasePrices(shop.basePrices);
              }
              
              // Set selling prices if they exist (read-only)
              if (shop.sellingPrices) {
                setSellingPrices(shop.sellingPrices);
              }
            }
          });
          
          if (foundShopId) {
            setShopId(foundShopId);
            return { shopId: foundShopId, itemsStock: foundShopItemsStock };
          } else {
            setError("Shop not found for this vendor");
            return null;
          }
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError("Failed to load vendor data");
        return null;
      }
    };

    // Fetch all items and ensure all have stock status
    const fetchItemsAndInitializeStock = async (shopData) => {
      if (!shopData || !shopData.shopId) {
        setLoading(false);
        return;
      }
      
      const itemsRef = ref(db, 'items');
      
      onValue(itemsRef, async (snapshot) => {
        try {
          if (snapshot.exists()) {
            const itemsData = [];
            const processedIds = new Set(); // To track processed items and prevent duplicates
            const existingStockStatus = shopData.itemsStock || {};
            const updatedStockStatus = { ...existingStockStatus };
            let needsStockUpdate = false;
            
            snapshot.forEach((childSnapshot) => {
              const itemId = childSnapshot.key;
              const itemData = childSnapshot.val();
              
              // Apply existing stock status or default to true (in stock)
              const inStock = existingStockStatus[itemId] 
                ? existingStockStatus[itemId].inStock 
                : true;
              
              // Create item object with stock status
              const item = {
                id: itemId,
                ...itemData,
                inStock: inStock
              };
              
              // Check if we need to add this item to the database stock status
              if (!existingStockStatus[itemId]) {
                updatedStockStatus[itemId] = { inStock: true };
                needsStockUpdate = true;
              }
              
              // Add item to the array only if we haven't processed an item with the same ID
              if (!processedIds.has(item.id)) {
                itemsData.push(item);
                processedIds.add(item.id);
              }
            });
            
            console.log(`Fetched ${itemsData.length} unique items`);
            setItems(itemsData);
            
            // Update the database with stock status for all items if needed
            if (needsStockUpdate) {
              try {
                console.log("Initializing stock status for all items in database");
                const stockRef = ref(db, `shops/${shopData.shopId}/itemsStock`);
                await update(stockRef, updatedStockStatus);
                setItemsStock(updatedStockStatus);
              } catch (updateErr) {
                console.error("Error initializing stock status:", updateErr);
              }
            }
          } else {
            setItems([]);
          }
        } catch (err) {
          console.error("Error processing items:", err);
          setError("Failed to load items");
        } finally {
          setLoading(false);
        }
      }, (err) => {
        console.error("Error fetching items:", err);
        setError("Failed to load items");
        setLoading(false);
      });
    };

    const initializeApp = async () => {
      const shopData = await fetchVendorData();
      await fetchItemsAndInitializeStock(shopData);
    };

    initializeApp();

    // Cleanup
    return () => {
      const itemsRef = ref(db, 'items');
      onValue(itemsRef, () => {}, { onlyOnce: true });
    };
  }, [currentUser]);

  // Filter items whenever selectedCategories, items, activeSection, or searchTerm changes
  useEffect(() => {
    if (items.length === 0 || Object.keys(selectedCategories).length === 0) {
      setFilteredItems([]);
      return;
    }

    // Get array of selected category keys (where value is true)
    const selectedCategoryKeys = Object.entries(selectedCategories)
      .filter(([_, isSelected]) => isSelected === true)
      .map(([key]) => key);

    console.log("Selected category keys:", selectedCategoryKeys);

    // Create a Map to store filtered items by ID to prevent duplicates
    const filteredItemsMap = new Map();

    // Filter items based on selected categories and active section - EXPANDED LOGIC FOR ALL SECTIONS
    items.forEach(item => {
      // Skip if we already added this item
      if (filteredItemsMap.has(item.id)) return;
      
      // Apply the stock status from itemsStock if available
      if (itemsStock[item.id]) {
        item.inStock = itemsStock[item.id].inStock;
      }

      // Check if item belongs to selected category - EXPANDED LOGIC FOR ALL SECTIONS
      let belongsToSelectedCategory = false;
      
      // Method 1: Direct displayCategory match
      if (item.displayCategory) {
        belongsToSelectedCategory = selectedCategoryKeys.includes(item.displayCategory);
      }
      
      // Method 2: Category name matching (for all sections)
      if (!belongsToSelectedCategory && item.category) {
        for (const catKey of selectedCategoryKeys) {
          const expectedCategoryName = categoryDisplayNames[catKey];
          
          // Direct category name match
          if (item.category === expectedCategoryName) {
            belongsToSelectedCategory = true;
            break;
          }
          
          // Special section mappings
          if (catKey === 'fish-seafood') {
            if (item.category === "Premium fish & seafood selection" || 
                item.category === "Fish & Seafood" ||
                item.category.toLowerCase().includes('fish') ||
                item.category.toLowerCase().includes('seafood')) {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'liver-more') {
            if (item.category === "Liver & More" ||
                item.category.toLowerCase().includes('liver')) {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'chicken') {
            if (item.category.toLowerCase().includes('chicken') ||
                item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('chicken')) {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'mutton') {
            if (item.category.toLowerCase().includes('mutton') ||
                item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('mutton')) {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'goat') {
            if (item.category.toLowerCase().includes('goat') ||
                item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('goat')) {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'eggs') {
            if (item.category.toLowerCase().includes('egg') ||
                item.category === "Bestsellers" && item.name && item.name.toLowerCase().includes('egg')) {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'combos') {
            if (item.category.toLowerCase().includes('combo') ||
                item.category === "Match Day Essentials") {
              belongsToSelectedCategory = true;
              break;
            }
          }
          
          if (catKey === 'prawns-crabs') {
            if (item.category.toLowerCase().includes('prawn') ||
                item.category.toLowerCase().includes('crab') ||
                item.category === "Premium fish & seafood selection") {
              belongsToSelectedCategory = true;
              break;
            }
          }
        }
      }
      
      // Method 3: Check item name/description for category keywords (fallback)
      if (!belongsToSelectedCategory) {
        for (const catKey of selectedCategoryKeys) {
          const categoryName = categoryDisplayNames[catKey];
          if (categoryName && item.name) {
            const itemNameLower = item.name.toLowerCase();
            const categoryLower = categoryName.toLowerCase();
            
            // Check if item name contains category keywords
            if (itemNameLower.includes(categoryLower.split(' ')[0]) ||
                (catKey === 'fish-seafood' && (itemNameLower.includes('fish') || itemNameLower.includes('seafood'))) ||
                (catKey === 'prawns-crabs' && (itemNameLower.includes('prawn') || itemNameLower.includes('crab'))) ||
                (catKey === 'liver-more' && itemNameLower.includes('liver'))) {
              belongsToSelectedCategory = true;
              break;
            }
          }
        }
      }

      // If the item doesn't belong to any selected category, skip it
      if (!belongsToSelectedCategory) return;

      // Handle section filtering
      if (activeSection !== 'all') {
        // Special section filters
        if (activeSection === 'bestsellers') {
          if (item.category !== 'Bestsellers' && item.featured !== true) return;
        } 
        else if (activeSection === 'match-day') {
          if (item.category !== 'Match Day Essentials') return;
        } 
        else if (activeSection === 'premium-fish') {
          if (item.category !== 'Premium fish & seafood selection') return;
        }
        // Category tab filtering
        else if (categoryDisplayNames[activeSection]) {
          // For direct category tabs (chicken, mutton, etc.)
          const matchesCategory = (
            // Direct match on displayCategory
            item.displayCategory === activeSection || 
            // Direct match on category name
            item.category === categoryDisplayNames[activeSection] ||
            // Special case for shop by categories
            (item.category === 'Shop by categories' && item.displayCategory === activeSection)
          );
          
          if (!matchesCategory) return;
        }
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = item.name && item.name.toLowerCase().includes(searchLower);
        const descMatch = item.description && item.description.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !descMatch) return;
      }

      // If we got here, the item passed all filters - add it to our Map
      filteredItemsMap.set(item.id, item);
    });

    // Convert the Map values back to an array
    const filtered = Array.from(filteredItemsMap.values());
    console.log(`Filtered to ${filtered.length} unique items for section "${activeSection}"`);
    setFilteredItems(filtered);
  }, [selectedCategories, items, activeSection, searchTerm, itemsStock]);

  // Stock management function (only functionality vendors can use)
  const toggleItemAvailability = async (itemId) => {
    // Get the current stock status
    const currentItem = filteredItems.find(item => item.id === itemId);
    if (!currentItem) return;
    
    const newStockStatus = !currentItem.inStock;
    
    // Update local state first for immediate UI feedback
    setFilteredItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, inStock: newStockStatus } : item
      )
    );

    // Update itemsStock state
    setItemsStock(prev => ({
      ...prev,
      [itemId]: { inStock: newStockStatus }
    }));

    // Update in Firebase
    if (shopId) {
      try {
        const db = getDatabase();
        const stockRef = ref(db, `shops/${shopId}/itemsStock/${itemId}`);
        await update(stockRef, { inStock: newStockStatus });
        console.log(`Item ${itemId} stock updated to ${newStockStatus ? 'in stock' : 'out of stock'}`);
      } catch (error) {
        console.error("Error updating stock status:", error);
        // Revert the local state if the update fails
        setFilteredItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId ? { ...item, inStock: currentItem.inStock } : item
          )
        );
        setItemsStock(prev => ({
          ...prev,
          [itemId]: { inStock: currentItem.inStock }
        }));
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get vendor price for an item
  const getVendorPrice = (item) => {
    // First check if there's a custom vendor price
    const customVendorPrice = vendorPrices[item.id]?.price;
    if (customVendorPrice !== undefined) return customVendorPrice;
    
    // If no custom price, use the item's vendorPrice field if available
    if (item.vendorPrice !== undefined) return item.vendorPrice;
    
    // Fall back to item.price if nothing else is available
    return item.price || 0;
  };

  // Helper function to format weight consistently
  const formatWeight = (weight) => {
    if (!weight) return '';
    
    // If weight already has units, return as is
    if (weight.toString().toLowerCase().includes('g') || 
        weight.toString().toLowerCase().includes('kg') ||
        weight.toString().toLowerCase().includes('ml') ||
        weight.toString().toLowerCase().includes('l')) {
      return weight;
    }
    
    // If it's just a number, add 'g' unit
    const numericWeight = parseFloat(weight);
    if (!isNaN(numericWeight)) {
      return `${numericWeight}g`;
    }
    
    // Fallback: add 'g' to whatever we have
    return `${weight}g`;
  };

  // Get available section tabs based on vendor's selected categories and available items
  const getAvailableSections = () => {
    // Start with "All Items"
    const sections = [{ id: 'all', name: 'All Items' }];
    
    // Only show tabs for categories that are selected and have items
    const selectedCategoryKeys = Object.entries(selectedCategories)
      .filter(([_, isSelected]) => isSelected === true)
      .map(([key]) => key);
    
    // Special sections
    const hasBestsellers = items.some(item => 
      (item.category === 'Bestsellers' || item.featured === true) && 
      selectedCategoryKeys.some(key => {
        // Check if this item would be included in our filtered results
        if (item.displayCategory === key) return true;
        if (item.category === categoryDisplayNames[key]) return true;
        return false;
      })
    );
    
    const hasMatchDay = items.some(item => 
      item.category === 'Match Day Essentials' && 
      selectedCategoryKeys.some(key => {
        if (item.displayCategory === key) return true;
        if (item.category === categoryDisplayNames[key]) return true;
        return false;
      })
    );
    
    const hasPremiumFish = items.some(item => 
      item.category === 'Premium fish & seafood selection' && 
      selectedCategoryKeys.some(key => {
        if (key === 'fish-seafood') return true;
        if (item.displayCategory === key) return true;
        return false;
      })
    );
    
    // Add special sections
    if (hasBestsellers) {
      sections.push({ id: 'bestsellers', name: 'Bestsellers' });
    }
    
    if (hasMatchDay) {
      sections.push({ id: 'match-day', name: 'Match Day Essentials' });
    }
    
    if (hasPremiumFish) {
      sections.push({ id: 'premium-fish', name: 'Premium Fish & Seafood' });
    }
    
    // Add category tabs
    selectedCategoryKeys.forEach(key => {
      // Only add if there are items in this category
      const hasItems = items.some(item => 
        item.displayCategory === key || 
        item.category === categoryDisplayNames[key] ||
        (item.category === 'Shop by categories' && item.displayCategory === key)
      );
      
      if (hasItems && categoryDisplayNames[key]) {
        sections.push({ id: key, name: categoryDisplayNames[key] });
      }
    });
    
    return sections;
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  const availableSections = getAvailableSections();

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Your Product Catalog</h2>
        
        <div className="vendor-info">
          <div className="stock-legend">
            <span className="in-stock-dot"></span> <span>In Stock</span>
            <span className="out-of-stock-dot"></span> <span>Out of Stock</span>
          </div>
          
          <div className="products-count">
            <span className="count-badge">{filteredItems.length} Products Available</span>
          </div>
        </div>
        
        <div className="products-search">
          <input
            type="text"
            placeholder="Search your products..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {availableSections.length > 1 && (
        <div className="category-tabs">
          {availableSections.map(section => (
            <button
              key={section.id}
              className={`category-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.name}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="no-products">
          <div className="empty-icon">📦</div>
          <p>No products available in your catalog.</p>
          <p className="empty-suggestion">Contact your administrator to assign product categories to your shop.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredItems.map(item => (
            <div key={item.id} className={`product-card ${!item.inStock ? 'out-of-stock' : ''}`}>
              <div className="product-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                {!item.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
              </div>
              
              <div className="product-content">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-category">{item.category}</p>
                
                <div className="price-info">
                  <div className="selling-price">
                    <span className="price-label">Vendor Price:</span>
                    <span className="price-value">₹{getVendorPrice(item)}</span>
                  </div>
                  
                  {item.weight && (
                    <div className="weight-display">
                      Weight: {formatWeight(item.weight)}
                    </div>
                  )}
                </div>
                
                <button 
                  className={`stock-button ${item.inStock ? 'in-stock' : 'out-of-stock'}`}
                  onClick={() => toggleItemAvailability(item.id)}
                >
                  {item.inStock ? 'MARK OUT OF STOCK' : 'MARK IN STOCK'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;