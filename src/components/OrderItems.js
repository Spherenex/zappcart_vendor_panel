import React from 'react';
import { Package } from 'lucide-react';
import './OrderItems.css';

const OrderItems = ({ items, subtotal, deliveryCharge, tax, totalAmount, formatCurrency }) => {
  // If formatCurrency isn't provided, define a default implementation
  const formatPrice = formatCurrency || ((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    //   minimumFractionDigits: 2
    }).format(amount);
  });

  // Calculate total without tax
  const totalWithoutTax = (subtotal || 0) + (deliveryCharge || 0);

  // Format price without the currency symbol and code
  const formatPriceValue = (amount) => {
    if (!amount) return '0';
    return amount;
  };

  return (
    <div className="order-items-card">
      <div className="order-items-header">
        <div className="header-title">
          <Package size={18} className="icon-blue" />
          <span>Order Items</span>
        </div>
        <div className="items-count">{items?.length || 0} items</div>
      </div>

      <div className="order-items-list">
        {items?.map((item, idx) => (
          <div key={item.id || idx} className="order-item">
            {item.image && (
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
            )}
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-qty-price">
                <div className="item-qty">Qty: {item.quantity}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="order-summary">
        <div className="summary-row">
          <div className="summary-label">Subtotal :</div>
          <div className="summary-value">₹{formatPriceValue(subtotal)}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Delivery Fee :</div>
          <div className="summary-value">₹{formatPriceValue(deliveryCharge)}</div>
        </div>
        <div className="summary-row total">
          <div className="summary-label">Total :</div>
          <div className="summary-value">₹{formatPriceValue(totalWithoutTax)}</div>
        </div>
      </div> */}
    </div>
  );
};

export default OrderItems;