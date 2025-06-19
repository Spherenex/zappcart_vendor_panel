import React from 'react';
import './PageStyles.css';

const Inventory = () => {
  return (
    <div className="page">
      <h2>Inventory Management</h2>
      
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">🗃️</div>
          <p>Inventory management coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default Inventory;