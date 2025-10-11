import React, { useState, useEffect } from 'react';
import './Superadmin.css'; // Import CSS

const API_KEY = 'aea9dbb9c4c2f0048ae00eed7cb8ecd5'; // Replace with your actual API key from https://api.imgbb.com/

const categories = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'LunchSpecials', label: 'Lunch Specials' },
  { value: 'SnacksFastFood', label: 'Snacks & Fast Food' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Desserts', label: 'Desserts' }
];

const SuperadminTest = () => {
  const [activeTab, setActiveTab] = useState('universal'); // Default to first tab
  const [universalItems, setUniversalItems] = useState([]);
  const [dailyItems, setDailyItems] = useState([]);
  const [dailySelections, setDailySelections] = useState(new Set());
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newSelectedCategory, setNewSelectedCategory] = useState(categories[0].value);
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editSelectedCategory, setEditSelectedCategory] = useState('');
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [editItemImage, setEditItemImage] = useState(null);
  const [editItemImageUrl, setEditItemImageUrl] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiters, setSelectedWaiters] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New states for staff management
  const [newSuperadminEmail, setNewSuperadminEmail] = useState('');
  const [newSuperadminPassword, setNewSuperadminPassword] = useState('');
  const [newWaiterEmail, setNewWaiterEmail] = useState('');
  const [newWaiterPassword, setNewWaiterPassword] = useState('');
  const [superadmins, setSuperadmins] = useState([]);

  // Fetch universal and daily items on mount
  useEffect(() => {
    fetchUniversalItems();
    fetchDailyItems();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchPendingOrders();
      fetchWaiters();
    }
    if (activeTab === 'staff') {
      fetchWaiters();
      fetchSuperadmins();
    }
  }, [activeTab]);

  useEffect(() => {
    if (dailyItems.length > 0 && universalItems.length > 0) {
      const selections = new Set();
      dailyItems.forEach(d => {
        const u = universalItems.find(u => u.name === d.name && u.category === d.category);
        if (u) selections.add(u._id);
      });
      setDailySelections(selections);
    }
  }, [dailyItems, universalItems]);

  const fetchUniversalItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setUniversalItems(data);
    } catch (err) {
      setError('Failed to fetch universal items');
    }
  };

  const fetchDailyItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/daily-items');
      const data = await response.json();
      setDailyItems(data);
    } catch (err) {
      setError('Failed to fetch daily items');
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pending-orders');
      const data = await response.json();
      setPendingOrders(data);
    } catch (err) {
      setError('Failed to fetch pending orders');
    }
  };

  const fetchWaiters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/waiters');
      const data = await response.json();
      setWaiters(data);
    } catch (err) {
      setError('Failed to fetch waiters');
    }
  };

  const fetchSuperadmins = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/superadmins');
      const data = await response.json();
      setSuperadmins(data);
    } catch (err) {
      setError('Failed to fetch superadmins');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      let category = newSelectedCategory === 'Custom' ? newCustomCategory : newSelectedCategory;
      if (!category) throw new Error('Category required');
      let imageUrl = null;
      if (newItemImage) {
        const formDataImg = new FormData();
        formDataImg.append('image', newItemImage);
        const responseImg = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
          method: 'POST',
          body: formDataImg,
        });
        const dataImg = await responseImg.json();
        if (!dataImg.success) throw new Error('Failed to upload image to ImgBB');
        imageUrl = dataImg.data.url;
      }

      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName, price: newItemPrice, category, image: imageUrl }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      setSuccess('Item added');
      setNewItemName('');
      setNewItemPrice('');
      setNewSelectedCategory(categories[0].value);
      setNewCustomCategory('');
      setNewItemImage(null);
      fetchUniversalItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditItem = (item) => {
    setEditItemId(item._id);
    setEditItemName(item.name);
    setEditItemPrice(item.price);
    const cat = categories.find(c => c.value === item.category);
    if (cat) {
      setEditSelectedCategory(item.category);
      setEditCustomCategory('');
    } else {
      setEditSelectedCategory('Custom');
      setEditCustomCategory(item.category);
    }
    setEditItemImageUrl(item.image || '');
    setEditItemImage(null);
  };

  const handleUpdateItem = async (e, isDaily = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      let category = editSelectedCategory === 'Custom' ? editCustomCategory : editSelectedCategory;
      if (!category) throw new Error('Category required');
      let image = editItemImageUrl;
      if (editItemImage) {
        const formDataImg = new FormData();
        formDataImg.append('image', editItemImage);
        const responseImg = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
          method: 'POST',
          body: formDataImg,
        });
        const dataImg = await responseImg.json();
        if (!dataImg.success) throw new Error('Failed to upload image to ImgBB');
        image = dataImg.data.url;
      }

      const url = isDaily ? `http://localhost:5000/api/daily-items/${editItemId}` : `http://localhost:5000/api/items/${editItemId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editItemName, price: editItemPrice, category, image }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      setSuccess('Item updated');
      setEditItemId(null);
      if (isDaily) {
        fetchDailyItems();
      } else {
        fetchUniversalItems();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (id, isDaily = false) => {
    setError('');
    setSuccess('');
    try {
      const url = isDaily ? `http://localhost:5000/api/daily-items/${id}` : `http://localhost:5000/api/items/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setSuccess('Item deleted');
      if (isDaily) {
        fetchDailyItems();
      } else {
        fetchUniversalItems();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleDaily = (id) => {
    setDailySelections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSaveDaily = async () => {
    setError('');
    setSuccess('');
    try {
      const selectedIds = Array.from(dailySelections);
      const response = await fetch('http://localhost:5000/api/set-daily-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds }),
      });
      if (!response.ok) throw new Error('Failed to save daily items');
      setSuccess('Daily items saved');
      fetchDailyItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignOrder = async (order_id, waiterEmail) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/assign-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, waiterEmail }),
      });
      if (!response.ok) throw new Error('Failed to assign order');
      setSuccess('Order assigned');
      fetchPendingOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  // New handlers for adding staff
  const handleAddSuperadmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/superadmins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newSuperadminEmail, password: newSuperadminPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add superadmin');
      }
      setSuccess('Superadmin added');
      setNewSuperadminEmail('');
      setNewSuperadminPassword('');
      fetchSuperadmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddWaiter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/waiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newWaiterEmail, password: newWaiterPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add waiter');
      }
      setSuccess('Waiter added');
      setNewWaiterEmail('');
      setNewWaiterPassword('');
      fetchWaiters();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="superadmin-container">
      <div className="sidebar">
        <button
          className={`tab-button ${activeTab === 'universal' ? 'active' : ''}`}
          onClick={() => setActiveTab('universal')}
        >
          Universal Items
        </button>
        <button
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Today's Items
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Manage Staff
        </button>
      </div>
      <div className="main-content">
        {activeTab === 'universal' && (
          <div className="tab-content">
            <h2>Manage Universal Items</h2>
            <form onSubmit={handleAddItem} className="add-form">
              <input
                type="text"
                placeholder="Item Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
              />
              <select
                value={newSelectedCategory}
                onChange={(e) => setNewSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                <option value="Custom">Custom</option>
              </select>
              {newSelectedCategory === 'Custom' && (
                <input
                  type="text"
                  placeholder="Custom Category"
                  value={newCustomCategory}
                  onChange={(e) => setNewCustomCategory(e.target.value)}
                  required
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewItemImage(e.target.files[0])}
              />
              <button type="submit">Add Item</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <ul className="item-list">
              {universalItems.map((item) => (
                <li key={item._id}>
                  {editItemId === item._id ? (
                    <form onSubmit={(e) => handleUpdateItem(e)} className="edit-form">
                      <input
                        type="text"
                        value={editItemName}
                        onChange={(e) => setEditItemName(e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
                        required
                      />
                      <select
                        value={editSelectedCategory}
                        onChange={(e) => setEditSelectedCategory(e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                        <option value="Custom">Custom</option>
                      </select>
                      {editSelectedCategory === 'Custom' && (
                        <input
                          type="text"
                          placeholder="Custom Category"
                          value={editCustomCategory}
                          onChange={(e) => setEditCustomCategory(e.target.value)}
                          required
                        />
                      )}
                      {editItemImageUrl && <img src={editItemImageUrl} alt="Current" style={{ width: '50px', height: '50px' }} />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditItemImage(e.target.files[0])}
                      />
                      <button type="submit">Update</button>
                      <button type="button" onClick={() => setEditItemId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />}
                      {item.category}: {item.name} - ₹{item.price}
                      <button onClick={() => handleEditItem(item)}>Edit</button>
                      <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'daily' && (
          <div className="tab-content">
            <h2>Manage Today's Items</h2>
            <h3>Select from Universal Items</h3>
            <ul className="item-list">
              {universalItems.map((item) => (
                <li key={item._id}>
                  <input
                    type="checkbox"
                    checked={dailySelections.has(item._id)}
                    onChange={() => handleToggleDaily(item._id)}
                  />
                  {item.category}: {item.name} - ₹{item.price}
                </li>
              ))}
            </ul>
            <button onClick={handleSaveDaily}>Save Today's Items</button>
            <h3>Current Today's Items</h3>
            <ul className="item-list">
              {dailyItems.map((item) => (
                <li key={item._id}>
                  {editItemId === item._id ? (
                    <form onSubmit={(e) => handleUpdateItem(e, true)} className="edit-form">
                      <input
                        type="text"
                        value={editItemName}
                        onChange={(e) => setEditItemName(e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
                        required
                      />
                      <select
                        value={editSelectedCategory}
                        onChange={(e) => setEditSelectedCategory(e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                        <option value="Custom">Custom</option>
                      </select>
                      {editSelectedCategory === 'Custom' && (
                        <input
                          type="text"
                          placeholder="Custom Category"
                          value={editCustomCategory}
                          onChange={(e) => setEditCustomCategory(e.target.value)}
                          required
                        />
                      )}
                      {editItemImageUrl && <img src={editItemImageUrl} alt="Current" style={{ width: '50px', height: '50px' }} />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditItemImage(e.target.files[0])}
                      />
                      <button type="submit">Update</button>
                      <button type="button" onClick={() => setEditItemId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />}
                      {item.category}: {item.name} - ₹{item.price}
                      <button onClick={() => handleEditItem(item)}>Edit</button>
                      <button onClick={() => handleDeleteItem(item._id, true)}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>Pending Orders</h2>
            <ul className="order-list">
              {pendingOrders.map((order) => (
                <li key={order.order_id}>
                  <p><strong>User:</strong> {order.userName} ({order.userEmail})</p>
                  <p><strong>Order ID:</strong> {order.order_id}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Table No:</strong> {order.tableno}</p>
                  <p><strong>Order Type:</strong> {order.ordertype}</p>
                  <p><strong>Total Bill:</strong> ₹{order.totalBill}</p>
                  <p><strong>Date:</strong> {order.date}</p>
                  <p><strong>Time:</strong> {order.time}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                  <p><strong>OTP:</strong> {order.otp}</p>
                  <p><strong>Items:</strong></p>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.itemName} - Rate: ₹{item.rate}, Qty: {item.qty}, Total: ₹{item.total}
                      </li>
                    ))}
                  </ul>
                  {order.ordertype === 'on table' && (
                    <>
                      {order.waiterEmail ? (
                        <p><strong>Assigned to:</strong> {order.waiterEmail}</p>
                      ) : (
                        <div>
                          <select
                            value={selectedWaiters[order.order_id] || ''}
                            onChange={(e) => setSelectedWaiters({ ...selectedWaiters, [order.order_id]: e.target.value })}
                          >
                            <option value="">Select Waiter</option>
                            {waiters.map((waiter) => (
                              <option key={waiter._id} value={waiter.email}>
                                {waiter.email}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignOrder(order.order_id, selectedWaiters[order.order_id])}
                            disabled={!selectedWaiters[order.order_id]}
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        )}
        {activeTab === 'staff' && (
          <div className="tab-content">
            <h2>Manage Staff</h2>
            <h3>Add Superadmin</h3>
            <form onSubmit={handleAddSuperadmin} className="add-form">
              <input
                type="email"
                placeholder="Superadmin Email"
                value={newSuperadminEmail}
                onChange={(e) => setNewSuperadminEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newSuperadminPassword}
                onChange={(e) => setNewSuperadminPassword(e.target.value)}
                required
              />
              <button type="submit">Add Superadmin</button>
            </form>

            <h3>Existing Superadmins</h3>
            <ul className="item-list">
              {superadmins.map((admin) => (
                <li key={admin._id}>
                  {admin.email}
                </li>
              ))}
            </ul>

            <h3>Add Waiter</h3>
            <form onSubmit={handleAddWaiter} className="add-form">
              <input
                type="email"
                placeholder="Waiter Email"
                value={newWaiterEmail}
                onChange={(e) => setNewWaiterEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newWaiterPassword}
                onChange={(e) => setNewWaiterPassword(e.target.value)}
                required
              />
              <button type="submit">Add Waiter</button>
            </form>

            <h3>Existing Waiters</h3>
            <ul className="item-list">
              {waiters.map((waiter) => (
                <li key={waiter._id}>
                  {waiter.email}
                </li>
              ))}
            </ul>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminTest;