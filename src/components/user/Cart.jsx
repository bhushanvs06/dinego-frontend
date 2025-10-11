import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; // Using Canvas for better rendering reliability
import { Home, Clock, Mic, ShoppingCart, User } from "lucide-react";
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

  const gstRate = 0.05; // 5% GST

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const email = localStorage.getItem('email');
    try {
      const response = await fetch(`http://localhost:5000/api/user/cart?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      const formatted = data.map(item => ({
        name: item.itemName,
        price: item.rate,
        quantity: item.qty,
        type: 'veg'
      }));
      setCart(formatted);
    } catch (err) {
      setError('Failed to fetch cart: ' + err.message);
    }
  };

  const totalCost = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalWithGst = totalCost + totalCost * gstRate;

  // Toggle special waiter service
  const handleSpecial = () => {
    setSpecial(!special);
    setOtp("");
    setShowQR(false);
  };

  const handleCheckout = async (paymentMethod) => {
    setError('');
    setSuccess('');
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    if (special && !table) {
      setError('Please enter table number');
      return;
    }
    const email = localStorage.getItem('email');
    const ordertype = special ? 'on table' : 'take away';
    const tableno = special ? table : '';
    try {
      const response = await fetch('http://localhost:5000/api/user/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, ordertype, tableno, paymentMethod })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to place order');
      setOtp(data.otp || '');
      if (data.otp) setShowQR(true);
      setCart([]);
      if (!special || paymentMethod !== 'UPI') {
        setSuccess(`Order placed successfully! Order ID: ${data.order_id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="cart-page">
      {/* Header */}
      <header className="header">
        <h1>DineGo</h1>
      </header>

      <h2>Your Cart</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {cart.length === 0 && !showQR && <p>No items in cart.</p>}

      {cart.length > 0 && (
        <div className="cart-items">
          {cart.map((item, idx) => (
            <div key={idx} className="cart-item">
              <p>
                {item.name} x {item.quantity} = ₹{item.price * item.quantity}
              </p>
            </div>
          ))}

          {/* Cost Section */}
          <div className="cost">
            <p>Total: ₹{totalCost.toFixed(2)}</p>
            <p>Total with GST (5%): ₹{totalWithGst.toFixed(2)}</p>
          </div>

          {/* Service Options */}
          <div className="service-options">
            <label>
              <input
                type="checkbox"
                checked={special}
                onChange={handleSpecial}
              />{" "}
              Special Waiter Service
            </label>

            {special && (
              <input
                type="number"
                placeholder="Enter Table Number"
                value={table}
                onChange={(e) => setTable(e.target.value)}
              />
            )}
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            {!special && (
              <>
                <button onClick={() => handleCheckout('Cash')}>Cash</button>
                <button onClick={() => handleCheckout('UPI')}>UPI</button>
              </>
            )}

            {special && !showQR && (
              <button onClick={() => handleCheckout('UPI')}>Pay Online & Generate OTP</button>
            )}
          </div>
        </div>
      )}
      {special && showQR && otp && (
        <div className="otp-section" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid black', textAlign: 'center' }}>
          <p>Your OTP: {otp}</p>
          <QRCodeCanvas 
            value={otp.toString()} 
            size={128} 
            fgColor="#000000" 
            bgColor="#FFFFFF" 
          />
        </div>
      )}

      {/* ---------- Bottom Navigation ---------- */}
      <nav className="bottom-nav">
        <button
          onClick={() => {
            setActiveTab("home");
            navigate("/user-dashboard");
          }}
          className={activeTab === "home" ? "active" : ""}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("orders");
            navigate("/user-dashboard/orders");
          }}
          className={activeTab === "orders" ? "active" : ""}
        >
          <Clock size={22} />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab("mic")}
          className={activeTab === "mic" ? "active mic" : "mic"}
        >
          <Mic size={24} />
        </button>

        <button
          onClick={() => {
            setActiveTab("cart");
            navigate("/user-dashboard/cart");
          }}
          className={activeTab === "cart" ? "active" : ""}
        >
          <ShoppingCart size={22} />
          <span>Cart</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("account");
            navigate("/user-dashboard/account");
          }}
          className={activeTab === "account" ? "active" : ""}
        >
          <User size={22} />
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default CartPage;