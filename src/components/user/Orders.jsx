import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Clock, Mic, ShoppingCart, User, ChevronDown, ChevronUp } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { API_URL } from "../../config";
import "./Orders.css";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "status-pending" },
  completed: { label: "Completed", color: "status-completed" },
  cancelled: { label: "Cancelled", color: "status-cancelled" },
};

const OrderCard = ({ order, onCancelOrder }) => {
  const [expanded, setExpanded] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className={`order-card ${expanded ? "expanded" : ""}`}>
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-header-left">
          <div className="order-icon">🧾</div>
          <div className="order-meta">
            <span className="order-id">{order.order_id}</span>
            <span className="order-date">{order.date} · {order.time}</span>
          </div>
        </div>
        <div className="order-header-right">
          <span className={`order-status ${cfg.color}`}>{cfg.label}</span>
          <span className="order-total">₹{order.totalBill?.toFixed(2)}</span>
          <span className="expand-icon">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Sub Action Bar for Table Orders */}
      {order.ordertype === "on table" && order.otp && (
        <div className="order-action-bar">
          <span className="table-badge">🪑 Table #{order.tableno || 'N/A'}</span>
          <button
            className="show-otp-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowOtpModal(true);
            }}
          >
            📱 Show QR & OTP
          </button>
        </div>
      )}

      {expanded && (
        <div className="order-details">
          <div className="order-detail-row">
            <span>Type</span>
            <span className="capitalize">{order.ordertype}</span>
          </div>
          {order.tableno && (
            <div className="order-detail-row">
              <span>Table</span>
              <span style={{ color: '#c084fc', fontWeight: 700 }}>#{order.tableno}</span>
            </div>
          )}
          <div className="order-detail-row">
            <span>Payment</span>
            <span>{order.paymentMethod}</span>
          </div>
          {(order.waiterName || order.waiterEmail) && (
            <div className="order-detail-row">
              <span>Assigned Waiter</span>
              <span style={{ color: '#c084fc', fontWeight: 700 }}>
                👨‍🍳 {order.waiterName || order.waiterEmail}
              </span>
            </div>
          )}

          <div className="order-items-title">Items Ordered</div>
          <div className="order-items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item-row">
                <span className="order-item-name">
                  {item.itemName} <span className="order-item-qty">x{item.qty}</span>
                </span>
                <span className="order-item-price">Rs.{item.total}</span>
              </div>
            ))}
          </div>

          {order.ordertype === "on table" && order.otp && (
            <div className="order-otp-section" onClick={() => setShowOtpModal(true)} style={{ cursor: 'pointer' }}>
              <div className="order-otp-label">
                <span>📱 Tap to View Full Screen QR & OTP for Waiter</span>
              </div>
              <div className="order-otp-body">
                <div className="order-qr-wrap">
                  <QRCodeCanvas
                    value={order.otp.toString()}
                    size={100}
                    fgColor="#7e22ce"
                    bgColor="#FFFFFF"
                  />
                </div>
                <div className="order-otp-right">
                  <p className="order-otp-hint">OTP Code</p>
                  <p className="order-otp-value">{order.otp}</p>
                  <p className="order-otp-sub">Ask waiter to scan QR or enter this code</p>
                </div>
              </div>
            </div>
          )}
          {order.status === 'cancelled' && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
              <div style={{ padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>💸 Refunded to Wallet Credits</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>+₹{order.totalBill?.toFixed(2)}</span>
              </div>
            </div>
          )}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
              {!order.waiterName && !order.waiterEmail ? (
                <button
                  className="cancel-order-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelOrder(order.order_id, order.totalBill);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ❌ Cancel Order & Refund ₹{order.totalBill?.toFixed(2)} to Wallet
                </button>
              ) : (
                <div style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                  👨‍🍳 Order assigned to {order.waiterName || order.waiterEmail} (Preparation in progress - Cannot cancel)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show OTP & QR Modal */}
      {showOtpModal && (
        <div className="payment-success-overlay" onClick={() => setShowOtpModal(false)}>
          <div
            className="payment-success-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ border: '1px solid rgba(168, 85, 247, 0.4)', maxWidth: '340px' }}
          >
            <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🪑 Table #{order.tableno || 'N/A'} Service
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: '0.2rem 0' }}>Show to Waiter</h3>

            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '16px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.35)', margin: '0.4rem 0' }}>
              <QRCodeCanvas value={order.otp.toString()} size={160} fgColor="#7e22ce" bgColor="#FFFFFF" />
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.65rem 1.2rem', borderRadius: 'var(--radius-md)', width: '100%' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>6-Digit OTP Code</span>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '6px', color: '#c084fc', fontFamily: 'Outfit, sans-serif' }}>
                {order.otp}
              </span>
            </div>

            {(order.waiterName || order.waiterEmail) && (
              <p style={{ fontSize: '0.82rem', color: '#86efac', margin: 0 }}>
                👨‍🍳 Assigned Waiter: <strong>{order.waiterName || order.waiterEmail}</strong>
              </p>
            )}

            <button
              className="view-orders-btn"
              onClick={() => setShowOtpModal(false)}
              style={{ marginTop: '0.4rem' }}
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) { navigate("/login"); return; }
    fetchOrders(email);
  }, []);

  const [cancelTarget, setCancelTarget] = useState(null);

  const promptCancelOrder = (order_id, amount) => {
    setCancelTarget({ order_id, amount });
  };

  const confirmCancelOrder = async () => {
    if (!cancelTarget) return;
    const { order_id, amount } = cancelTarget;
    const email = localStorage.getItem("email");
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/user/cancel-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, order_id })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || `Order #${order_id} cancelled! ₹${amount?.toFixed(2)} refunded to your Wallet Credits.`);
        fetchOrders(email);
      } else {
        setError(data.message || 'Failed to cancel order');
      }
    } catch {
      setError('Server error cancelling order');
    } finally {
      setCancelTarget(null);
    }
  };

  const fetchOrders = async (email) => {
    try {
      const r = await fetch(`${API_URL}/api/user/orders?email=${encodeURIComponent(email)}`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="orders-page">
      {/* Header */}
      <header className="orders-header">
        <div className="orders-header-brand">
          <span>🍽</span>
          <span>DineGo</span>
        </div>
        <span className="orders-header-title">My Orders</span>
      </header>

      {/* Filter Pills */}
      <div className="filter-row">
        {["all", "pending", "completed", "cancelled"].map(f => (
          <button
            key={f}
            className={`filter-pill${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="orders-content">
        {loading && (
          <div className="orders-loading">
            <div className="spinner" />
            <p>Loading orders…</p>
          </div>
        )}
        {error && <div className="orders-error">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="orders-empty">
            <span>📦</span>
            <p>{filter === "all" ? "No orders yet" : `No ${filter} orders`}</p>
            <button className="browse-btn" onClick={() => navigate("/user-dashboard")} id="orders-browse-btn">
              Order Something
            </button>
          </div>
        )}

        <div className="orders-list">
          {filtered.map((order, idx) => (
            <OrderCard key={order.order_id || idx} order={order} onCancelOrder={promptCancelOrder} />
          ))}
        </div>
      </div>

      {/* In-App Order Cancellation Modal */}
      {cancelTarget && (
        <div className="payment-success-overlay">
          <div className="payment-success-modal" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', maxWidth: '380px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.8rem', color: '#f87171' }}>
              ⚠️
            </div>

            <h3 className="success-modal-title" style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
              Cancel Order & Refund?
            </h3>
            <p className="success-modal-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you sure you want to cancel <strong style={{ color: 'white' }}>Order #{cancelTarget.order_id}</strong>?<br />
              <span style={{ color: '#4ade80', fontWeight: 700 }}>₹{cancelTarget.amount?.toFixed(2)}</span> will be instantly refunded to your Wallet Credits.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                onClick={() => setCancelTarget(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                style={{ flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
              >
                Confirm & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/user-dashboard")}>
          <Home size={20} /><span>Home</span>
        </button>
        <button className="nav-btn active">
          <Clock size={20} /><span>Orders</span>
        </button>
        <div className="mic-nav-wrapper">
          <button className="nav-btn mic-btn" onClick={() => navigate("/user-dashboard")} title="Voice Order">
            <Mic size={22} />
          </button>
          <span className="mic-nav-label">Voice</span>
        </div>
        <button className="nav-btn" onClick={() => navigate("/user-dashboard/cart")}>
          <ShoppingCart size={20} /><span>Cart</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/user-dashboard/account")}>
          <User size={20} /><span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default OrdersPage;
