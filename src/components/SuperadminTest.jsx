import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './Superadmin.css';

const API_KEY = 'aea9dbb9c4c2f0048ae00eed7cb8ecd5';

const FOOD_IMAGE_PRESETS = [
  { name: 'Dosa', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
  { name: 'Samosa / Chai', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
  { name: 'Thali Feast', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80' },
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
  { name: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
  { name: 'Cold Coffee', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80' },
  { name: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
  { name: 'Sandwich', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80' },
  { name: 'Brownie', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80' },
  { name: 'Ice Cream', url: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=600&q=80' },
  { name: 'Pasta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80' },
  { name: 'Juice / Shake', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80' }
];

const categories = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'LunchSpecials', label: 'Lunch Specials' },
  { value: 'SnacksFastFood', label: 'Snacks & Fast Food' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Desserts', label: 'Desserts' }
];

const SuperadminTest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('universal');
  const [universalItems, setUniversalItems] = useState([]);
  const [dailyItems, setDailyItems] = useState([]);
  const [dailySelections, setDailySelections] = useState(new Set());
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newSelectedCategory, setNewSelectedCategory] = useState(categories[0].value);
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState(null);
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('');
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

  const [newSuperadminEmail, setNewSuperadminEmail] = useState('');
  const [newSuperadminPassword, setNewSuperadminPassword] = useState('');
  const [newWaiterName, setNewWaiterName] = useState('');
  const [newWaiterEmail, setNewWaiterEmail] = useState('');
  const [newWaiterPassword, setNewWaiterPassword] = useState('');
  const [superadmins, setSuperadmins] = useState([]);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Banner State
  const [banners, setBanners] = useState([]);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerTag, setNewBannerTag] = useState("🔥 TODAY'S COMBO");
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [selectedComboItemIds, setSelectedComboItemIds] = useState([]);
  const [newBannerPrice, setNewBannerPrice] = useState('');
  const [newBannerDiscount, setNewBannerDiscount] = useState('0');
  const [showComboItemModal, setShowComboItemModal] = useState(false);
  const [comboModalCategory, setComboModalCategory] = useState('All');

  const getComboOriginalPrice = (itemIds) => {
    return universalItems
      .filter(i => itemIds.includes(i._id))
      .reduce((s, i) => s + (Number(i.price) || 0), 0);
  };

  const getInternetFoodImage = (name = '', category = '') => {
    const text = (name + " " + category).toLowerCase();
    if (text.includes('dosa')) return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80';
    if (text.includes('samosa') || text.includes('chai') || text.includes('tea')) return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80';
    if (text.includes('thali') || text.includes('meal') || text.includes('rice') || text.includes('paneer') || text.includes('curry')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
    if (text.includes('burger') || text.includes('fries')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80';
    if (text.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80';
    if (text.includes('coffee')) return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80';
    if (text.includes('biryani') || text.includes('pulao')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80';
    if (text.includes('sandwich') || text.includes('toast')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80';
    if (text.includes('brownie') || text.includes('cake') || text.includes('pastry')) return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80';
    if (text.includes('ice cream') || text.includes('kulfi')) return 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=600&q=80';
    if (text.includes('pasta') || text.includes('noodle')) return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80';
    if (text.includes('juice') || text.includes('shake') || text.includes('drink') || text.includes('lassi')) return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80';
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
  };

  const getAutoComboImage = (items) => {
    const itemWithImage = items.find(i => i.image && i.image.trim().length > 0);
    if (itemWithImage) return itemWithImage.image;

    const namesCombined = items.map(i => i.name.toLowerCase()).join(" ");
    return getInternetFoodImage(namesCombined, '');
  };

  const handleToggleComboItem = (item) => {
    let nextIds;
    if (selectedComboItemIds.includes(item._id)) {
      nextIds = selectedComboItemIds.filter(id => id !== item._id);
    } else {
      nextIds = [...selectedComboItemIds, item._id];
    }
    setSelectedComboItemIds(nextIds);

    const selectedItems = universalItems.filter(i => nextIds.includes(i._id));
    if (selectedItems.length > 0) {
      const titleStr = selectedItems.map(i => i.name).join(" + ");
      const origPrice = getComboOriginalPrice(nextIds);
      const currentDisc = Number(newBannerDiscount) || 0;
      const finalPrice = Math.round(origPrice * (1 - currentDisc / 100));

      setNewBannerTitle(titleStr);
      setNewBannerPrice(finalPrice.toString());

      // AUTOMATIC IMAGE SELECTION FOR COMBOS
      const autoImg = getAutoComboImage(selectedItems);
      setNewBannerImageUrl(autoImg);

      if (currentDisc > 0) {
        setNewBannerSubtitle(`Combo Offer @ ₹${finalPrice} (${currentDisc}% OFF, Save ₹${origPrice - finalPrice})`);
      } else {
        setNewBannerSubtitle(`Combo Package @ ₹${finalPrice}`);
      }
    } else {
      setNewBannerTitle('');
      setNewBannerPrice('');
      setNewBannerDiscount('0');
      setNewBannerSubtitle('');
      setNewBannerImageUrl('');
    }
  };

  const handleFinalPriceChange = (val) => {
    setNewBannerPrice(val);
    const origPrice = getComboOriginalPrice(selectedComboItemIds);
    const fp = Number(val);
    if (origPrice > 0 && !isNaN(fp) && fp >= 0) {
      const disc = Math.max(0, Math.round(((origPrice - fp) / origPrice) * 100));
      setNewBannerDiscount(disc.toString());
      if (disc > 0) {
        setNewBannerSubtitle(`Combo Offer @ ₹${fp} (${disc}% OFF, Save ₹${origPrice - fp})`);
      } else {
        setNewBannerSubtitle(`Combo Package @ ₹${fp}`);
      }
    }
  };

  const handleDiscountPercentChange = (val) => {
    setNewBannerDiscount(val);
    const origPrice = getComboOriginalPrice(selectedComboItemIds);
    const disc = Number(val);
    if (origPrice > 0 && !isNaN(disc) && disc >= 0) {
      const fp = Math.round(origPrice * (1 - disc / 100));
      setNewBannerPrice(fp.toString());
      if (disc > 0) {
        setNewBannerSubtitle(`Combo Offer @ ₹${fp} (${disc}% OFF, Save ₹${origPrice - fp})`);
      } else {
        setNewBannerSubtitle(`Combo Package @ ₹${fp}`);
      }
    }
  };

  const uniqueCategories = ['All', ...Array.from(new Set([
    ...categories.map(c => c.value),
    ...universalItems.map(i => i.category).filter(Boolean)
  ]))];

  const handleSelectAllCategory = (catName) => {
    const idsToSelect = universalItems
      .filter(i => catName === 'All' || i.category === catName)
      .map(i => i._id);
    setDailySelections(prev => {
      const next = new Set(prev);
      idsToSelect.forEach(id => next.add(id));
      return next;
    });
  };

  const handleDeselectAllCategory = (catName) => {
    const idsToRemove = new Set(universalItems
      .filter(i => catName === 'All' || i.category === catName)
      .map(i => i._id));
    setDailySelections(prev => {
      const next = new Set();
      prev.forEach(id => {
        if (!idsToRemove.has(id)) next.add(id);
      });
      return next;
    });
  };

  // Fetch universal items, daily items, staff, and status on mount
  useEffect(() => {
    fetchUniversalItems();
    fetchDailyItems();
    fetchCanteenStatus();
    fetchWaiters();
    fetchSuperadmins();
  }, []);

  const fetchCanteenStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/canteen-status`);
      const data = await res.json();
      setAcceptingOrders(data.acceptingOrders);
    } catch { /* silence */ }
  };

  const toggleCanteenStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/canteen-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptingOrders: !acceptingOrders })
      });
      const data = await res.json();
      if (res.ok) {
        setAcceptingOrders(data.acceptingOrders);
        setSuccess(`Canteen order status updated: ${data.acceptingOrders ? 'Accepting Orders 🟢' : 'Stopped Receiving Orders 🔴'}`);
      }
    } catch {
      setError('Failed to update store order reception status');
    }
  };

  const [adminCancelTarget, setAdminCancelTarget] = useState(null);

  const promptAdminCancelOrder = (order) => {
    setAdminCancelTarget(order);
  };

  const confirmAdminCancelOrder = async () => {
    if (!adminCancelTarget) return;
    const { order_id, totalBill, userName } = adminCancelTarget;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/cancel-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, userEmail: adminCancelTarget.userEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || `Order #${order_id} cancelled! ₹${totalBill} refunded to customer wallet.`);
        fetchAllOrders();
      } else {
        setError(data.message || 'Failed to cancel order');
      }
    } catch {
      setError('Server error cancelling order');
    } finally {
      setAdminCancelTarget(null);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/banners`);
      const data = await res.json();
      setBanners(data);
    } catch { /* silence */ }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      let image = newBannerImageUrl || '';
      if (newBannerImage) {
        const formDataImg = new FormData();
        formDataImg.append('image', newBannerImage);
        const responseImg = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
          method: 'POST',
          body: formDataImg,
        });
        const dataImg = await responseImg.json();
        if (dataImg.success) image = dataImg.data.url;
      }

      const selectedItems = universalItems.filter(i => selectedComboItemIds.includes(i._id));
      const comboItems = selectedItems.map(i => ({ itemName: i.name, rate: Number(i.price), qty: 1 }));

      const res = await fetch(`${API_URL}/api/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBannerTitle,
          subtitle: newBannerSubtitle,
          tag: newBannerTag,
          image,
          price: Number(newBannerPrice) || undefined,
          comboItems
        })
      });
      if (!res.ok) throw new Error('Failed to create banner');
      setSuccess('Promotional combo banner created!');
      setNewBannerTitle(''); setNewBannerSubtitle(''); setNewBannerPrice(''); setNewBannerDiscount('0'); setSelectedComboItemIds([]); setNewBannerImage(null); setNewBannerImageUrl('');
      fetchBanners();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this combo banner?')) return;
    try {
      await fetch(`${API_URL}/api/banners/${id}`, { method: 'DELETE' });
      setSuccess('Banner deleted');
      fetchBanners();
    } catch { setError('Failed to delete banner'); }
  };

  const handleToggleBanner = async (banner) => {
    try {
      await fetch(`${API_URL}/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active })
      });
      fetchBanners();
    } catch { setError('Failed to update banner status'); }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAllOrders();
      fetchWaiters();
    }
    if (activeTab === 'staff') {
      fetchWaiters();
      fetchSuperadmins();
    }
    if (activeTab === 'banners') {
      fetchBanners();
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
      const response = await fetch(`${API_URL}/api/items`);
      const data = await response.json();
      setUniversalItems(data);
    } catch (err) {
      setError('Failed to fetch universal items');
    }
  };

  const fetchDailyItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/daily-items`);
      const data = await response.json();
      setDailyItems(data);
    } catch (err) {
      setError('Failed to fetch daily items');
    }
  };

  const [ordersFilter, setOrdersFilter] = useState('all');

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`);
      const data = await response.json();
      setPendingOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const fetchWaiters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/waiters`);
      const data = await response.json();
      setWaiters(data);
    } catch (err) {
      setError('Failed to fetch waiters');
    }
  };

  const fetchSuperadmins = async () => {
    try {
      const response = await fetch(`${API_URL}/api/superadmins`);
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
      let imageUrl = newItemImageUrl || null;
      if (newItemImage) {
        const formDataImg = new FormData();
        formDataImg.append('image', newItemImage);
        const responseImg = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
          method: 'POST',
          body: formDataImg,
        });
        const dataImg = await responseImg.json();
        if (dataImg.success) imageUrl = dataImg.data.url;
      }

      if (!imageUrl) {
        imageUrl = getInternetFoodImage(newItemName, category);
      }

      const response = await fetch(`${API_URL}/api/items`, {
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
      setNewItemImageUrl('');
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

      const url = isDaily ? `${API_URL}/api/daily-items/${editItemId}` : `${API_URL}/api/items/${editItemId}`;
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
      const url = isDaily ? `${API_URL}/api/daily-items/${id}` : `${API_URL}/api/items/${id}`;
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
      const response = await fetch(`${API_URL}/api/set-daily-items`, {
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
      const response = await fetch(`${API_URL}/api/assign-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, waiterEmail }),
      });
      if (!response.ok) throw new Error('Failed to assign order');
      setSuccess('Order assigned to waiter!');
      fetchAllOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSuperadmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/api/superadmins`, {
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
      const response = await fetch(`${API_URL}/api/waiters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWaiterName, email: newWaiterEmail, password: newWaiterPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add waiter');
      }
      setSuccess('Waiter added');
      setNewWaiterName('');
      setNewWaiterEmail('');
      setNewWaiterPassword('');
      fetchWaiters();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSuperadmin = async (id) => {
    if (!window.confirm("Remove this superadmin?")) return;
    try {
      const res = await fetch(`${API_URL}/api/superadmins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSuccess("Superadmin removed");
      fetchSuperadmins();
    } catch { setError("Failed to remove superadmin"); }
  };

  const handleEditSuperadmin = async (admin) => {
    const email = prompt("Edit Superadmin Email:", admin.email);
    if (!email) return;
    const password = prompt("Edit Password (leave blank to keep unchanged):");
    try {
      const res = await fetch(`${API_URL}/api/superadmins/${admin._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || undefined })
      });
      if (!res.ok) throw new Error();
      setSuccess("Superadmin updated");
      fetchSuperadmins();
    } catch { setError("Failed to update superadmin"); }
  };

  const handleDeleteWaiter = async (id) => {
    if (!window.confirm("Remove this waiter?")) return;
    try {
      const res = await fetch(`${API_URL}/api/waiters/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSuccess("Waiter removed");
      fetchWaiters();
    } catch { setError("Failed to remove waiter"); }
  };

  const handleEditWaiter = async (waiter) => {
    const name = prompt("Edit Waiter Name:", waiter.name || "");
    const email = prompt("Edit Waiter Email:", waiter.email);
    if (!email) return;
    const password = prompt("Edit Password (leave blank to keep unchanged):");
    try {
      const res = await fetch(`${API_URL}/api/waiters/${waiter._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, email, password: password || undefined })
      });
      if (!res.ok) throw new Error();
      setSuccess("Waiter updated");
      fetchWaiters();
    } catch { setError("Failed to update waiter"); }
  };

  return (
    <div className="superadmin-container">
      {/* Sidebar */}
      <div className="superadmin-sidebar">
        <div className="superadmin-brand">
          <h1>🛡 Superadmin Hub</h1>
          <p>DineGo Management Center</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`admin-nav-btn ${activeTab === 'universal' ? 'active' : ''}`}
            onClick={() => setActiveTab('universal')}
          >
            📋 Universal Menu
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            📅 Today's Menu
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🧾 Live Orders
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            👥 Staff Management
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            🎠 Combo Banners
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="superadmin-main">
        {/* Top Bar */}
        <div className="admin-top-bar">
          <div className="admin-top-title">
            <h2>
              {activeTab === 'universal' && '📋 Universal Menu Registry'}
              {activeTab === 'daily' && "📅 Today's Active Menu"}
              {activeTab === 'orders' && '🧾 Live Orders & Waiter Assignment'}
              {activeTab === 'staff' && '👥 Canteen Staff & Admin Management'}
              {activeTab === 'banners' && '🎠 Promotional Combo Slider Management'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Canteen Status Toggle */}
            <button
              onClick={toggleCanteenStatus}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '999px',
                border: acceptingOrders ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                background: acceptingOrders ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: acceptingOrders ? '#4ade80' : '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Click to toggle store order reception"
            >
              {acceptingOrders ? '🟢 Accepting Orders' : '🔴 Store Closed (Pause Orders)'}
            </button>

            {error && <span className="error">{error}</span>}
            {success && <span className="success">{success}</span>}
            <button
              className="action-btn delete"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={() => { localStorage.removeItem('adminEmail'); navigate('/login'); }}
            >
              Logout 🚪
            </button>
          </div>
        </div>

        {/* Tab 1: Universal Menu */}
        {activeTab === 'universal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="admin-form-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Add New Universal Item</h3>
              <form onSubmit={handleAddItem} className="form-grid">
                <input
                  className="admin-input"
                  type="text"
                  placeholder="Item Name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                />
                <input
                  className="admin-input"
                  type="number"
                  placeholder="Price (₹)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  required
                />
                <select
                  className="admin-select"
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
                    className="admin-input"
                    type="text"
                    placeholder="Custom Category"
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                    required
                  />
                )}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
                    🖼️ Item Image Manager (Choose Preset, Paste URL, or Upload File)
                  </label>

                  {/* Preset Food Image Gallery */}
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Quick 1-Click HD Food Image Presets:
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                      {FOOD_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => { setNewItemImageUrl(preset.url); setNewItemImage(null); }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '999px',
                            border: newItemImageUrl === preset.url ? 'none' : '1px solid var(--border)',
                            background: newItemImageUrl === preset.url ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-card)',
                            color: newItemImageUrl === preset.url ? 'white' : 'var(--text-muted)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      className="admin-input"
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={newItemImageUrl}
                      onChange={(e) => setNewItemImageUrl(e.target.value)}
                      style={{ flex: 2, minWidth: '200px' }}
                    />
                    <input
                      className="admin-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => { setNewItemImage(e.target.files[0]); setNewItemImageUrl(''); }}
                      style={{ flex: 1, minWidth: '160px' }}
                    />
                  </div>

                  {newItemImageUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                      <img src={newItemImageUrl} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>Selected Preset / URL active</span>
                    </div>
                  )}
                </div>

                <button className="admin-submit-btn" type="submit" style={{ gridColumn: '1 / -1' }}>
                  + Add Item to Universal Menu
                </button>
              </form>
            </div>

            {/* Category Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    border: categoryFilter === cat ? 'none' : '1px solid var(--border)',
                    background: categoryFilter === cat ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-card)',
                    color: categoryFilter === cat ? 'white' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat} ({cat === 'All' ? universalItems.length : universalItems.filter(i => i.category === cat).length})
                </button>
              ))}
            </div>

            <div className="admin-grid">
              {universalItems
                .filter(item => categoryFilter === 'All' || item.category === categoryFilter)
                .map((item) => (
                  <div key={item._id} className="admin-item-card">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="admin-card-img" />
                    ) : (
                      <div className="admin-card-img-placeholder">🍴</div>
                    )}

                    <div className="admin-card-body">
                      <span className="admin-card-name">{item.name}</span>
                      <div className="admin-card-meta">
                        <span className="admin-card-price">₹{item.price}</span>
                        <span className="admin-card-cat">{item.category}</span>
                      </div>

                      <div className="admin-card-actions">
                        <button className="action-btn edit" onClick={() => handleEditItem(item)}>Edit</button>
                        <button className="action-btn delete" onClick={() => handleDeleteItem(item._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Daily Items */}
        {activeTab === 'daily' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="admin-form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select Today's Active Menu</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tap items or use category quick buttons to toggle availability today</p>
                </div>
                <button className="admin-submit-btn" onClick={handleSaveDaily}>
                  💾 Save Active Menu ({dailySelections.size} Selected)
                </button>
              </div>

              {/* Category Filter & Quick Selection Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
                    {uniqueCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        style={{
                          padding: '0.4rem 0.9rem',
                          borderRadius: '999px',
                          border: categoryFilter === cat ? 'none' : '1px solid var(--border)',
                          background: categoryFilter === cat ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-secondary)',
                          color: categoryFilter === cat ? 'white' : 'var(--text-muted)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cat} ({cat === 'All' ? universalItems.length : universalItems.filter(i => i.category === cat).length})
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="action-btn edit"
                      onClick={() => handleSelectAllCategory(categoryFilter)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      ⚡ Select All {categoryFilter === 'All' ? '' : categoryFilter}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeselectAllCategory(categoryFilter)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      ✕ Deselect All
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-grid" style={{ marginTop: '0.75rem' }}>
                {universalItems
                  .filter(item => categoryFilter === 'All' || item.category === categoryFilter)
                  .map((item) => {
                    const isSelected = dailySelections.has(item._id);
                    return (
                    <div
                      key={item._id}
                      className="admin-item-card"
                      onClick={() => handleToggleDaily(item._id)}
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? '#a855f7' : 'var(--border)',
                        boxShadow: isSelected ? '0 0 16px rgba(168, 85, 247, 0.25)' : 'none'
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="admin-card-img" />
                      ) : (
                        <div className="admin-card-img-placeholder">🍴</div>
                      )}

                      <div className="admin-card-body">
                        <span className="admin-card-name">{item.name}</span>
                        <div className="admin-card-meta">
                          <span className="admin-card-price">₹{item.price}</span>
                          <span className="admin-card-cat">{item.category}</span>
                        </div>

                        <button
                          className="action-btn"
                          style={{
                            marginTop: '0.5rem',
                            background: isSelected ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(168, 85, 247, 0.1)',
                            color: isSelected ? 'white' : 'var(--purple-400)',
                            border: isSelected ? 'none' : '1px solid rgba(168, 85, 247, 0.3)'
                          }}
                        >
                          {isSelected ? '✓ Active Today' : '+ Add to Today'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'pending', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrdersFilter(f)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    border: ordersFilter === f ? 'none' : '1px solid var(--border)',
                    background: ordersFilter === f ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-card)',
                    color: ordersFilter === f ? 'white' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} (
                  {f === 'all' ? pendingOrders.length : pendingOrders.filter(o => o.status === f).length}
                  )
                </button>
              ))}
            </div>

            <div className="admin-grid">
              {pendingOrders
                .filter(order => ordersFilter === 'all' || order.status === ordersFilter)
                .map((order) => (
                  <div key={order.order_id} className="admin-item-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{order.order_id}</span>
                      <span className="admin-card-cat" style={{ textTransform: 'uppercase' }}>{order.status}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Customer: {order.userName} ({order.userEmail}) {order.userPhone && `· 📞 ${order.userPhone}`}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Type: {order.ordertype} {order.tableno && `(Table #${order.tableno})`}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date & Time: {order.date} · {order.time}</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-400)', marginTop: '0.2rem' }}>Total: ₹{order.totalBill}</p>

                    {/* Order items */}
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.4rem', fontSize: '0.78rem' }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx}>{it.qty}× {it.itemName} (₹{it.total})</div>
                      ))}
                    </div>

                    {order.ordertype === 'on table' && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        {order.waiterEmail ? (
                          <p style={{ fontSize: '0.8rem', color: '#86efac' }}>Assigned Waiter: {order.waiterEmail}</p>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                              className="admin-select"
                              style={{ fontSize: '0.78rem' }}
                              value={selectedWaiters[order.order_id] || ''}
                              onChange={(e) => setSelectedWaiters({ ...selectedWaiters, [order.order_id]: e.target.value })}
                            >
                              <option value="">Assign Waiter</option>
                              {waiters.map((w) => (
                                <option key={w._id} value={w.email}>{w.name ? `${w.name} (${w.email})` : w.email}</option>
                              ))}
                            </select>
                            <button
                              className="action-btn edit"
                              onClick={() => handleAssignOrder(order.order_id, selectedWaiters[order.order_id])}
                              disabled={!selectedWaiters[order.order_id]}
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {order.status === 'cancelled' ? (
                      <div style={{ marginTop: '0.6rem', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.78rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>💸 Refunded to Customer Wallet</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>+₹{order.totalBill}</span>
                      </div>
                    ) : (
                      <button
                        className="action-btn delete"
                        onClick={() => promptAdminCancelOrder(order)}
                        style={{ marginTop: '0.6rem', width: '100%', padding: '0.45rem', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        🚫 Cancel Order & Refund to Wallet
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* In-App Superadmin Cancellation Modal */}
            {adminCancelTarget && (
              <div className="payment-success-overlay" style={{ zIndex: 9999 }}>
                <div className="payment-success-modal" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', maxWidth: '400px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.8rem', color: '#f87171' }}>
                    🚫
                  </div>

                  <h3 className="success-modal-title" style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                    Cancel Order & Refund Customer?
                  </h3>
                  <p className="success-modal-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    Are you sure you want to cancel <strong style={{ color: 'white' }}>Order #{adminCancelTarget.order_id}</strong> for <strong style={{ color: '#c084fc' }}>{adminCancelTarget.userName || adminCancelTarget.userEmail}</strong>?<br />
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>₹{adminCancelTarget.totalBill}</span> will be refunded directly to customer's Wallet Balance.
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                    <button
                      onClick={() => setAdminCancelTarget(null)}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={confirmAdminCancelOrder}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                    >
                      Cancel & Refund
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Staff Management */}
        {activeTab === 'staff' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Superadmin Accounts List */}
            <div className="admin-form-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>🛡 Active Superadmins ({superadmins.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {superadmins.map(sa => (
                  <div key={sa._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{sa.email}</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="action-btn edit" onClick={() => handleEditSuperadmin(sa)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDeleteSuperadmin(sa._id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--purple-400)', marginTop: '0.5rem' }}>Add New Superadmin</h4>
              <form onSubmit={handleAddSuperadmin} className="form-grid" style={{ marginTop: '0.4rem' }}>
                <input
                  className="admin-input"
                  type="email"
                  placeholder="Superadmin Email"
                  value={newSuperadminEmail}
                  onChange={(e) => setNewSuperadminEmail(e.target.value)}
                  required
                />
                <input
                  className="admin-input"
                  type="password"
                  placeholder="Password"
                  value={newSuperadminPassword}
                  onChange={(e) => setNewSuperadminPassword(e.target.value)}
                  required
                />
                <button className="admin-submit-btn" type="submit">Add Superadmin</button>
              </form>
            </div>

            {/* Waiter Accounts List */}
            <div className="admin-form-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>👨‍🍳 Active Waiters ({waiters.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {waiters.map(w => (
                  <div key={w._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', display: 'block' }}>{w.name || 'Waiter'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{w.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="action-btn edit" onClick={() => handleEditWaiter(w)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDeleteWaiter(w._id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--purple-400)', marginTop: '0.5rem' }}>Add New Waiter</h4>
              <form onSubmit={handleAddWaiter} className="form-grid" style={{ marginTop: '0.4rem' }}>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="Waiter Full Name (e.g. Ramesh Kumar)"
                  value={newWaiterName}
                  onChange={(e) => setNewWaiterName(e.target.value)}
                  required
                />
                <input
                  className="admin-input"
                  type="email"
                  placeholder="Waiter Email"
                  value={newWaiterEmail}
                  onChange={(e) => setNewWaiterEmail(e.target.value)}
                  required
                />
                <input
                  className="admin-input"
                  type="password"
                  placeholder="Password"
                  value={newWaiterPassword}
                  onChange={(e) => setNewWaiterPassword(e.target.value)}
                  required
                />
                <button className="admin-submit-btn" type="submit">Add Waiter</button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Banners & Combos */}
        {activeTab === 'banners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="admin-form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Create Promotional Combo Banner</h3>
                <button
                  type="button"
                  className="admin-submit-btn"
                  onClick={() => setShowComboItemModal(true)}
                  style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                >
                  ➕ Select Combo Items ({selectedComboItemIds.length} Selected)
                </button>
              </div>

              {/* Selected Combo Items Pills */}
              {selectedComboItemIds.length > 0 && (
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  {universalItems.filter(i => selectedComboItemIds.includes(i._id)).map((item) => (
                    <span
                      key={item._id}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {item.name} (₹{item.price})
                      <button
                        type="button"
                        onClick={() => handleToggleComboItem(item)}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <div style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem', color: '#c084fc', fontWeight: 700 }}>
                    Combined Original Value: ₹{getComboOriginalPrice(selectedComboItemIds)}
                  </div>
                </div>
              )}

              <form onSubmit={handleAddBanner} className="form-grid">
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Banner Title</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="e.g. Masala Dosa + Cold Coffee"
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Badge Tag</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="e.g. 🔥 TODAY'S COMBO"
                    value={newBannerTag}
                    onChange={(e) => setNewBannerTag(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Discount Percentage (% - Default 0%)
                  </label>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={newBannerDiscount}
                    onChange={(e) => handleDiscountPercentChange(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Final Offer Price (₹ - Auto Calculates Discount %)
                  </label>
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="e.g. 120"
                    value={newBannerPrice}
                    onChange={(e) => handleFinalPriceChange(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Generated Subtitle Offer Text</label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="e.g. Combo Offer @ ₹120 (15% OFF, Save ₹20)"
                    value={newBannerSubtitle}
                    onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
                    🖼️ Banner Image Manager (Choose Preset, Paste URL, or Upload File)
                  </label>

                  {/* Preset Food Image Gallery */}
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Quick 1-Click HD Food Artwork Presets:
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                      {FOOD_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => { setNewBannerImageUrl(preset.url); setNewBannerImage(null); }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '999px',
                            border: newBannerImageUrl === preset.url ? 'none' : '1px solid var(--border)',
                            background: newBannerImageUrl === preset.url ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-card)',
                            color: newBannerImageUrl === preset.url ? 'white' : 'var(--text-muted)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      className="admin-input"
                      type="url"
                      placeholder="Or paste banner image URL (https://...)"
                      value={newBannerImageUrl}
                      onChange={(e) => setNewBannerImageUrl(e.target.value)}
                      style={{ flex: 2, minWidth: '200px' }}
                    />
                    <input
                      className="admin-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => { setNewBannerImage(e.target.files[0]); setNewBannerImageUrl(''); }}
                      style={{ flex: 1, minWidth: '160px' }}
                    />
                  </div>

                  {newBannerImageUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                      <img src={newBannerImageUrl} alt="Preview" style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>Selected Preset / URL active</span>
                    </div>
                  )}
                </div>

                <button className="admin-submit-btn" type="submit" style={{ gridColumn: '1 / -1' }}>
                  + Create Promotional Combo Banner
                </button>
              </form>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Combo Banners ({banners.length})</h3>
            <div className="admin-grid">
              {banners.map((b) => (
                <div key={b._id} className="admin-item-card" style={{ padding: '0.75rem' }}>
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="admin-card-img" style={{ height: '140px', objectFit: 'cover' }} />
                  ) : (
                    <div className="admin-card-img-placeholder" style={{ height: '140px' }}>🎠</div>
                  )}

                  <div className="admin-card-body" style={{ marginTop: '0.5rem' }}>
                    <span className="admin-card-cat" style={{ alignSelf: 'flex-start', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                      {b.tag || "SPECIAL COMBO"}
                    </span>
                    <span className="admin-card-name" style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '0.2rem' }}>{b.title}</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.subtitle}</p>

                    <div className="admin-card-actions" style={{ marginTop: '0.75rem' }}>
                      <button
                        className="action-btn edit"
                        onClick={() => handleToggleBanner(b)}
                        style={{ background: b.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: b.active ? '#4ade80' : '#fca5a5' }}
                      >
                        {b.active ? '🟢 Active' : '🔴 Hidden'}
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteBanner(b._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Item Glassmorphic Modal Popup */}
      {editItemId && (
        <div className="payment-success-overlay" onClick={() => setEditItemId(null)}>
          <div className="payment-success-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'left', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>✏️ Edit Menu Item</h3>
              <button
                type="button"
                onClick={() => setEditItemId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleUpdateItem(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Item Name</label>
                <input
                  className="admin-input"
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Price (₹)</label>
                <input
                  className="admin-input"
                  type="number"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Category</label>
                <select
                  className="admin-select"
                  value={editSelectedCategory}
                  onChange={(e) => setEditSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {editSelectedCategory === 'Custom' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Custom Category Name</label>
                  <input
                    className="admin-input"
                    type="text"
                    value={editCustomCategory}
                    onChange={(e) => setEditCustomCategory(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Update Image (Optional)</label>
                <input
                  className="admin-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditItemImage(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="submit" className="view-orders-btn" style={{ flex: 1 }}>
                  💾 Save Changes
                </button>
                <button type="button" className="done-btn" onClick={() => setEditItemId(null)} style={{ width: 'auto', padding: '0.75rem 1.2rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Combo Item Picker Pop-up Modal */}
      {showComboItemModal && (
        <div className="payment-success-overlay" onClick={() => setShowComboItemModal(false)}>
          <div
            className="payment-success-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', width: '92%', textAlign: 'left', alignItems: 'stretch' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>🍔 Select Items for Combo</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose items from your menu categories below</p>
              </div>
              <button
                type="button"
                onClick={() => setShowComboItemModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Category Sort Chips inside Modal */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setComboModalCategory(cat)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '999px',
                    border: comboModalCategory === cat ? 'none' : '1px solid var(--border)',
                    background: comboModalCategory === cat ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-card)',
                    color: comboModalCategory === cat ? 'white' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat} ({cat === 'All' ? universalItems.length : universalItems.filter(i => i.category === cat).length})
                </button>
              ))}
            </div>

            {/* Items Grid inside Modal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {universalItems
                .filter(item => comboModalCategory === 'All' || item.category === comboModalCategory)
                .map((item) => {
                  const isSelected = selectedComboItemIds.includes(item._id);
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleToggleComboItem(item)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1px solid #a855f7' : '1px solid var(--border)',
                        background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 800 }}>₹{item.price}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? '#4ade80' : 'var(--text-muted)' }}>
                          {isSelected ? '✓ Added' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {selectedComboItemIds.length} items selected (₹{getComboOriginalPrice(selectedComboItemIds)})
              </span>
              <button
                type="button"
                className="view-orders-btn"
                onClick={() => setShowComboItemModal(false)}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.82rem' }}
              >
                Done Selecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminTest;