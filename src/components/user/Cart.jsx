import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Home, Clock, Mic, ShoppingCart, User, ArrowLeft, Loader2 } from "lucide-react";
import { API_URL } from "../../config";
import "./Cart.css";

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [special, setSpecial] = useState(false);
  const [table, setTable] = useState("");
  const [otp, setOtp] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState("cart");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paying, setPaying] = useState(false); // loading state for Razorpay
  const [showCashModal, setShowCashModal] = useState(false); // Pay on counter modal
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  const gstRate = 0.05;

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) { navigate("/login"); return; }
    fetchCart();
    fetchCanteenStatus();
    fetchWalletBalance(email);
  }, []);

  const fetchWalletBalance = async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/user/wallet?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setWalletBalance(data.wallet || 0);
    } catch { /* silence */ }
  };

  const handlePayWithWallet = async () => {
    const email = localStorage.getItem("email");
    setError(""); setSuccess(""); setPaying(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ordertype: special ? "on table" : "take away",
          tableno: special ? table : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Wallet payment failed");

      setCart([]);
      setWalletBalance(data.remainingWallet || 0);
      setOtp(data.otp || "");
      if (data.otp) {
        setShowQR(true);
      } else {
        setSuccess(`✅ Order placed using Wallet Credits! Order ID: ${data.order_id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const fetchCanteenStatus = async () => {
    try {
      const r = await fetch(`${API_URL}/api/canteen-status`);
      const data = await r.json();
      setAcceptingOrders(data.acceptingOrders);
    } catch { /* silence */ }
  };

  const fetchCart = async () => {
    const email = localStorage.getItem("email");
    try {
      const r = await fetch(`${API_URL}/api/user/cart?email=${encodeURIComponent(email)}`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setCart(data.map((i) => ({ name: i.itemName, price: i.rate, quantity: i.qty, type: "veg" })));
    } catch { setError("Failed to fetch cart"); }
  };

  const syncCart = async (newCart) => {
    const email = localStorage.getItem("email");
    if (!email) return;
    try {
      await fetch(`${API_URL}/api/user/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cart: newCart.map((i) => ({ itemName: i.name, rate: i.price, qty: i.quantity, total: i.price * i.quantity })) }),
      });
    } catch { /* silence */ }
  };

  const handleIncreaseQty = (itemName) => {
    const newCart = cart.map((i) => (i.name === itemName ? { ...i, quantity: i.quantity + 1 } : i));
    setCart(newCart);
    syncCart(newCart);
  };

  const handleDecreaseQty = (itemName) => {
    const newCart = cart
      .map((i) => (i.name === itemName ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    setCart(newCart);
    syncCart(newCart);
  };

  const handleRemoveItem = (itemName) => {
    const newCart = cart.filter((i) => i.name !== itemName);
    setCart(newCart);
    syncCart(newCart);
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const gst = subtotal * gstRate;
  const waiterCharge = special ? 20 : 0;
  const total = subtotal + gst + waiterCharge;

  // ── Cash checkout (direct, no payment gateway) ───────────
  const handleCashCheckout = async () => {
    setError(""); setSuccess("");
    if (cart.length === 0) { setError("Cart is empty"); return; }
    const email = localStorage.getItem("email");
    try {
      const r = await fetch(`${API_URL}/api/user/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ordertype: "take away", tableno: "", paymentMethod: "Cash" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to place order");
      setCart([]);
      setSuccess(`✅ Order placed! ID: ${data.order_id}`);
    } catch (err) { setError(err.message); }
  };

  // ── Razorpay UPI checkout ─────────────────────────────────
  const handleRazorpayCheckout = async () => {
    setError(""); setSuccess("");
    if (cart.length === 0) { setError("Cart is empty"); return; }
    if (special && !table) { setError("Please enter your table number"); return; }

    // Check Razorpay SDK loaded
    if (typeof window.Razorpay === "undefined") {
      setError("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    const email = localStorage.getItem("email");
    setPaying(true);

    try {
      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to create payment order");

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,                          // rzp_test_...
        amount: orderData.amount,                      // in paise
        currency: orderData.currency,
        name: "DineGo",
        description: special ? `Table ${table} – Waiter Service` : "Take Away Order",
        order_id: orderData.orderId,
        prefill: { email },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setError("Payment cancelled. Your cart is still saved.");
          },
        },
        handler: async (response) => {
          // Step 3: Verify signature on backend & place canteen order
          try {
            const verifyRes = await fetch(`${API_URL}/api/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email,
                ordertype: special ? "on table" : "take away",
                tableno: special ? table : "",
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) throw new Error(verifyData.message || "Payment verification failed");

            // Payment verified → order placed
            setCart([]);
            setOtp(verifyData.otp || "");
            if (verifyData.otp) {
              setShowQR(true);
            } else {
              setSuccess(`✅ Payment successful! Order ID: ${verifyData.order_id}`);
            }
          } catch (err) {
            setError("Payment received but order placement failed: " + err.message);
          } finally {
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setPaying(false);
        setError(`❌ Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      setPaying(false);
      setError(err.message);
    }
  };

  return (
    <div className="cart-page">
      {/* Header */}
      <header className="cart-header">
        <button className="back-btn" onClick={() => navigate("/user-dashboard")} id="back-btn">
          <ArrowLeft size={16} />
        </button>
        <span className="cart-header-brand">🍽 DineGo</span>
        <span className="cart-header-title">My Cart</span>
      </header>

      <div className="cart-content">
        {error && <div className="cart-error">{error}</div>}

        {/* Animated Payment Success Modal */}
        {success && (
          <div className="payment-success-overlay">
            <div className="payment-success-modal">
              <div className="success-checkmark-circle">
                <span className="success-checkmark">✓</span>
              </div>
              <h3 className="success-modal-title">Order Confirmed!</h3>
              <p className="success-modal-msg">{success}</p>
              <div className="success-actions">
                <button className="view-orders-btn" onClick={() => navigate("/user-dashboard/orders")}>
                  View My Orders →
                </button>
                <button className="done-btn" onClick={() => setSuccess("")}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {!acceptingOrders && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#fca5a5', marginBottom: '1rem', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171' }}>🔴 Store Currently Closed</h4>
            <p style={{ fontSize: '0.82rem', marginTop: '0.2rem', opacity: 0.9 }}>
              The canteen is currently not accepting new orders. Please check back later!
            </p>
          </div>
        )}

        {cart.length === 0 && !showQR ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
            <button className="browse-btn" onClick={() => navigate("/user-dashboard")} id="browse-menu-btn">
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            {cart.length > 0 && (
              <div className="cart-items-list">
                {cart.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    <div className="cart-item-left">
                      <div className="cart-item-icon">🍴</div>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-unit">₹{item.price} each</span>
                      </div>
                    </div>

                    <div className="cart-item-right" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="qty-stepper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.35rem', gap: '0.4rem' }}>
                        <button
                          className="qty-btn"
                          onClick={() => handleDecreaseQty(item.name)}
                          title="Remove unit"
                          style={{ background: 'none', border: 'none', color: '#f87171', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1 }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => handleIncreaseQty(item.name)}
                          title="Add unit"
                          style={{ background: 'none', border: 'none', color: '#4ade80', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1 }}
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-total" style={{ fontWeight: 800, minWidth: '50px', textAlign: 'right' }}>
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bill Summary */}
            {cart.length > 0 && (
              <div className="bill-card">
                <div className="bill-header">Bill Summary</div>
                <div className="bill-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="bill-row">
                  <span>GST <span className="gst-badge">5%</span></span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                {special && (
                  <div className="bill-row" style={{ color: '#c084fc', fontWeight: 600 }}>
                    <span>Waiter Service Charge <span className="gst-badge" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)' }}>Table Service</span></span>
                    <span>₹20.00</span>
                  </div>
                )}
                <div className="bill-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Waiter Service Toggle */}
            {cart.length > 0 && (
              <div className="service-card">
                <div className="service-toggle" onClick={() => { setSpecial(!special); setOtp(""); setShowQR(false); }}>
                  <div className="service-toggle-left">
                    <div className="service-icon">👨‍🍳</div>
                    <div className="service-text">
                      <span className="service-title">Waiter Service</span>
                      <span className="service-subtitle">Deliver to your table</span>
                    </div>
                  </div>
                  <div className={`toggle-switch${special ? " on" : ""}`}>
                    <div className="toggle-knob" />
                  </div>
                </div>

                {special && (
                  <div className="table-input-wrapper">
                    <span>🪑</span>
                    <input
                      className="table-input"
                      type="number"
                      placeholder="Enter your table number"
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      id="table-number"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Payment Buttons */}
            {cart.length > 0 && !showQR && (
              <div className="payment-section">
                <span className="payment-label">Choose Payment</span>

                {/* Wallet Balance & Payment Option */}
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>💳 Wallet Credit Balance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: walletBalance >= total ? '#4ade80' : '#c084fc', fontFamily: 'Outfit, sans-serif' }}>
                      ₹{walletBalance.toFixed(2)}
                    </span>
                  </div>
                  {walletBalance >= total ? (
                    <button
                      className="pay-btn"
                      onClick={handlePayWithWallet}
                      disabled={paying || !acceptingOrders}
                      style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', width: 'auto', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 700 }}
                    >
                      Pay via Wallet (₹{total.toFixed(2)})
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {walletBalance > 0 ? `(₹${(total - walletBalance).toFixed(2)} more needed)` : ''}
                    </span>
                  )}
                </div>

                {/* Razorpay notice */}
                <div className="razorpay-notice">
                  <span className="razorpay-badge">🔒 Secured by Razorpay</span>
                  <span className="razorpay-mode"></span>
                </div>

                <div className="payment-btns">
                  {/* Cash – no payment gateway */}
                  {!special && (
                    <button
                      className="pay-btn"
                      onClick={() => setShowCashModal(true)}
                      id="pay-cash"
                      disabled={paying || !acceptingOrders}
                    >
                      {acceptingOrders ? "💵 Cash (Pay at Counter)" : "🔒 Store Closed"}
                    </button>
                  )}

                  {/* UPI / Online – Razorpay */}
                  <button
                    className={`pay-btn primary${paying ? " loading" : ""}`}
                    onClick={handleRazorpayCheckout}
                    id="pay-razorpay"
                    disabled={paying || !acceptingOrders}
                    style={{ flex: special ? 1 : undefined }}
                  >
                    {!acceptingOrders ? (
                      "🔒 Store Closed"
                    ) : paying ? (
                      <><Loader2 size={16} className="spin-icon" /> Processing…</>
                    ) : (
                      special ? "📱 Pay & Get OTP" : "📱 Pay Online"
                    )}
                  </button>
                </div>

                {/* Test card hint */}
                
              </div>
            )}
          </>
        )}

        {/* Razorpay Loading Overlay */}
        {paying && (
          <div className="payment-success-overlay">
            <div className="rzp-loading-box">
              <div className="rzp-spin-ring">
                <div className="rzp-inner-icon">🔒</div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '1rem', color: 'white' }}>Razorpay Secure</h3>
              <p style={{ fontSize: '0.82rem', color: '#c084fc', fontWeight: 600 }}>Opening Payment Gateway…</p>
            </div>
          </div>
        )}

        {/* Animated Payment Success Modal Overlay */}
        {success && (
          <div className="payment-success-overlay">
            <div className="payment-success-modal">
              <div className="success-aura-wrap">
                <div className="aura-ring a1"></div>
                <div className="aura-ring a2"></div>
                <div className="success-checkmark-circle">
                  <svg className="checkmark-svg" viewBox="0 0 52 52">
                    <circle className="checkmark-circle-path" cx="26" cy="26" r="23" fill="none" />
                    <path className="checkmark-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
              </div>

              <h3 className="success-modal-title">Payment Verified! 🎉</h3>
              <div className="success-modal-msg">
                {success}
              </div>

              <div className="success-actions">
                <button
                  className="view-orders-btn"
                  onClick={() => { setSuccess(""); navigate("/user-dashboard/orders"); }}
                >
                  View My Orders →
                </button>
                <button className="done-btn" onClick={() => setSuccess("")}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cash Pay on Counter Confirmation Modal */}
        {showCashModal && (
          <div className="payment-success-overlay">
            <div className="payment-success-modal" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <div className="success-checkmark-circle" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)', fontSize: '2rem' }}>
                💵
              </div>
              <h3 className="success-modal-title">Pay on Counter</h3>
              <div className="success-modal-msg" style={{ color: '#fde68a', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                Total Payable: <strong>₹{total.toFixed(2)}</strong>
                <p style={{ marginTop: '0.4rem', fontSize: '0.78rem', opacity: 0.9 }}>
                  Please pay Cash directly at the canteen counter when collecting your food.
                </p>
              </div>
              <div className="success-actions">
                <button
                  className="view-orders-btn"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}
                  onClick={() => {
                    setShowCashModal(false);
                    handleCashCheckout();
                  }}
                >
                  ✓ Confirm & Place Order
                </button>
                <button className="done-btn" onClick={() => setShowCashModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP / QR after successful waiter-service Razorpay payment */}
        {special && showQR && otp && (
          <div className="otp-card">
            <p className="otp-title">Show this OTP to your waiter</p>
            <p className="otp-value">{otp}</p>
            <QRCodeCanvas value={otp.toString()} size={140} fgColor="#7e22ce" bgColor="#FFFFFF" />
            <p className="otp-hint">Scan the QR code or share the 6-digit OTP</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-btn${activeTab === "home" ? " active" : ""}`} onClick={() => { setActiveTab("home"); navigate("/user-dashboard"); }}>
          <Home size={20} /><span>Home</span>
        </button>
        <button className={`nav-btn${activeTab === "orders" ? " active" : ""}`} onClick={() => { setActiveTab("orders"); navigate("/user-dashboard/orders"); }}>
          <Clock size={20} /><span>Orders</span>
        </button>
        <div className="mic-nav-wrapper">
          <button className="nav-btn mic-btn" onClick={() => navigate("/user-dashboard")} title="Voice Order">
            <Mic size={22} />
          </button>
          <span className="mic-nav-label">Voice</span>
        </div>
        <button className={`nav-btn${activeTab === "cart" ? " active" : ""}`} onClick={() => { setActiveTab("cart"); navigate("/user-dashboard/cart"); }}>
          <ShoppingCart size={20} /><span>Cart</span>
        </button>
        <button className={`nav-btn${activeTab === "account" ? " active" : ""}`} onClick={() => { setActiveTab("account"); navigate("/user-dashboard/account"); }}>
          <User size={20} /><span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default CartPage;