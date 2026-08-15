import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, CheckCircle, Clock, Key, LogOut, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Waiter.css";

const WaiterTest = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [scanningOrderId, setScanningOrderId] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [activeNav, setActiveNav] = useState("orders"); // 'orders' | 'profile'
  const [alertInfo, setAlertInfo] = useState({ show: false, message: "", type: "" });

  const waiterEmail = localStorage.getItem('waiterEmail') || 'waiter@cafe.com';
  const waiterName = localStorage.getItem('waiterName') || 'Waiter';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const mappedOrders = data.map(order => ({
        id: order.order_id,
        username: order.userName || order.userEmail || "Customer",
        userphone: order.userPhone,
        items: order.items?.map(item => `${item.qty}× ${item.itemName}`).join(', ') || "No items",
        date: order.date,
        time: order.time,
        verified: order.status === 'pending' ? 'Pending' : 'Served',
        otp: order.otp,
        tableno: order.tableno,
        waiterEmail: order.waiterEmail
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    let scanner;
    const onScanSuccess = async (decodedText) => {
      const currentOrder = orders.find(o => o.id === scanningOrderId);
      if (currentOrder && String(currentOrder.otp) === String(decodedText).trim()) {
        await markOrderServed(scanningOrderId);
      } else {
        setAlertInfo({
          show: true,
          message: "Failed: OTP does not match.",
          type: "error",
        });
      }
      handleCloseScanner();
    };

    if (scanningOrderId) {
      scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { qrbox: { width: 220, height: 220 }, fps: 10 },
        false
      );
      scanner.render(onScanSuccess, () => {});
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [scanningOrderId, orders]);

  const markOrderServed = async (orderId) => {
    try {
      const updateResponse = await fetch(`${API_URL}/api/update-order-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: 'completed' })
      });
      if (!updateResponse.ok) throw new Error('Failed to update order status');

      setAlertInfo({
        show: true,
        message: "✅ Order Served & Verified!",
        type: "success",
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, verified: "Served" } : o));
    } catch (error) {
      setAlertInfo({
        show: true,
        message: "Failed: Unable to update order status.",
        type: "error",
      });
    }
  };

  const handleManualOTP = async (order) => {
    const inputOtp = prompt(`Enter 6-digit OTP for Order #${order.id}:`);
    if (!inputOtp) return;
    if (String(order.otp).trim() === String(inputOtp).trim()) {
      await markOrderServed(order.id);
    } else {
      setAlertInfo({
        show: true,
        message: "❌ Failed: Invalid OTP entered.",
        type: "error",
      });
    }
  };

  const handleQRScan = (id) => setScanningOrderId(id);
  const handleCloseScanner = () => setScanningOrderId(null);
  const handleCloseAlert = () => setAlertInfo({ show: false, message: '', type: '' });

  // Only show orders assigned to this waiter OR unassigned table orders
  const assignedOrders = orders.filter(o => !o.waiterEmail || o.waiterEmail.toLowerCase() === waiterEmail.toLowerCase());

  const filteredOrders = assignedOrders.filter(o => {
    if (filter === 'pending') return o.verified === 'Pending';
    if (filter === 'served') return o.verified === 'Served';
    return true;
  });

  const totalCount = assignedOrders.length;
  const pendingCount = assignedOrders.filter(o => o.verified === 'Pending').length;
  const servedCount = assignedOrders.filter(o => o.verified === 'Served').length;

  return (
    <div className="waiter-container">
      {/* Header */}
      <header className="waiter-header">
        <div className="waiter-header-brand">
          <h1>👨‍🍳 {waiterName}</h1>
          <p>Logged in as: <strong style={{ color: '#c084fc' }}>{waiterEmail}</strong></p>
        </div>

        <div className="waiter-stats">
          <div className="stat-pill">
            <span className="num">{totalCount}</span>
            <span className="lbl">Assigned</span>
          </div>
          <div className="stat-pill">
            <span className="num" style={{ color: '#f59e0b' }}>{pendingCount}</span>
            <span className="lbl">Pending</span>
          </div>
          <div className="stat-pill">
            <span className="num" style={{ color: '#22c55e' }}>{servedCount}</span>
            <span className="lbl">Served</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => { localStorage.removeItem('waiterEmail'); navigate('/login'); }}
          style={{ height: '36px', alignSelf: 'center' }}
        >
          Logout
        </button>
      </header>

      {activeNav === 'profile' ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-600), var(--purple-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              👨‍🍳
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{waiterName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--purple-400)', fontWeight: 600 }}>{waiterEmail}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e' }}>{servedCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Served</div>
            </div>
          </div>

          <button
            onClick={() => { localStorage.removeItem('waiterEmail'); navigate('/login'); }}
            style={{
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={18} /> Sign Out / Logout
          </button>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['pending', 'served', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '999px',
                  border: filter === f ? 'none' : '1px solid var(--border)',
                  background: filter === f ? 'linear-gradient(135deg, var(--purple-600), var(--purple-700))' : 'var(--bg-card)',
                  color: filter === f ? 'white' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'pending' ? pendingCount : f === 'served' ? servedCount : totalCount})
              </button>
            ))}
          </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2.5rem' }}>📋</span>
          <p style={{ marginTop: '0.5rem' }}>No {filter} orders assigned to you</p>
        </div>
      ) : (
        <div className="waiter-order-grid">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`waiter-card ${order.verified === "Served" ? "served" : "pending"}`}
            >
              <div className="waiter-card-header">
                <span className="waiter-order-id">{order.id}</span>
                <span className={`waiter-status-badge ${order.verified === "Served" ? "served" : "pending"}`}>
                  <span className="status-dot" />
                  {order.verified}
                </span>
              </div>

            <div className="waiter-card-body">
              <div className="waiter-info-row">
                <span>Customer</span>
                <span>{order.username}</span>
              </div>
              {order.userphone && (
                <div className="waiter-info-row" style={{ alignItems: 'center' }}>
                  <span>Phone</span>
                  <a
                    href={`tel:${order.userphone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.7rem',
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: '#4ade80',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <PhoneCall size={13} /> Call {order.userphone}
                  </a>
                </div>
              )}
              {order.tableno && (
                <div className="waiter-info-row">
                  <span>Table</span>
                  <span style={{ color: '#c084fc', fontWeight: 700 }}>#{order.tableno}</span>
                </div>
              )}
              <div className="waiter-info-row">
                <span>Time</span>
                <span>{order.date} · {order.time}</span>
              </div>
              <div className="waiter-items-box">
                {order.items}
              </div>
            </div>

            {order.verified === 'Pending' && (
              <div className="waiter-card-actions">
                <button className="scan-qr-btn" onClick={() => handleQRScan(order.id)}>
                  <QrCode size={16} /> Scan QR
                </button>
                <button className="manual-otp-btn" onClick={() => handleManualOTP(order)}>
                  <Key size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Enter OTP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
      </>
      )}

      {/* QR Scanner Modal */}
      {scanningOrderId && (
        <div className="qr-modal-backdrop">
          <div className="qr-modal-box">
            <h3 className="qr-modal-title">Scan Customer QR Code</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID: {scanningOrderId}</p>
            <div id="qr-reader-container"></div>
            <button className="close-scanner-btn" onClick={handleCloseScanner}>Cancel</button>
          </div>
        </div>
      )}

      {/* Alert Overlay */}
      {alertInfo.show && (
        <div className="qr-modal-backdrop">
          <div className={`custom-alert-box ${alertInfo.type}`}>
            <span className="alert-icon">{alertInfo.type === 'success' ? '🎉' : '⚠️'}</span>
            <p className="alert-msg">{alertInfo.message}</p>
            <button className="alert-confirm-btn" onClick={handleCloseAlert}>OK</button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="waiter-bottom-nav">
        <button
          className={`waiter-nav-btn ${activeNav === "orders" ? "active" : ""}`}
          onClick={() => setActiveNav("orders")}
        >
          <Clock size={20} />
          <span>Live Orders</span>
        </button>

        <button
          className={`waiter-nav-btn ${activeNav === "profile" ? "active" : ""}`}
          onClick={() => setActiveNav("profile")}
        >
          <LogOut size={20} />
          <span>My Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default WaiterTest;