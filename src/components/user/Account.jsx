import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Clock, Mic, ShoppingCart, User, LogOut, Wallet, Phone, Mail, ChevronRight } from "lucide-react";
import { API_URL } from "../../config";
import "./Account.css";

const AccountPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) { navigate("/login"); return; }
    fetchProfile(email);
  }, []);

  const fetchProfile = async (email) => {
    try {
      const r = await fetch(`${API_URL}/api/user/profile?email=${encodeURIComponent(email)}`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setProfile(data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="account-page">
      {/* Header */}
      <header className="account-header">
        <div className="account-header-brand">
          <span>🍽</span>
          <span>DineGo</span>
        </div>
        <span className="account-header-title">My Account</span>
      </header>

      <div className="account-content">
        {loading && (
          <div className="account-loading">
            <div className="spinner" />
            <p>Loading profile…</p>
          </div>
        )}
        {error && <div className="account-error">{error}</div>}

        {profile && (
          <>
            {/* Avatar + Name */}
            <div className="profile-hero">
              <div className="avatar">{initials}</div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-email">{profile.email}</div>
            </div>

            {/* Wallet Card */}
            <div className="wallet-card">
              <div className="wallet-left">
                <div className="wallet-icon"><Wallet size={20} /></div>
                <div className="wallet-text">
                  <span className="wallet-label">Wallet Balance</span>
                  <span className="wallet-amount">₹{profile.wallet?.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
              <span className="wallet-badge">🪙 Credits</span>
            </div>

            {/* Info Rows */}
            <div className="info-card">
              <div className="info-row">
                <div className="info-row-left">
                  <div className="info-icon"><Mail size={16} /></div>
                  <div className="info-text">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profile.email}</span>
                  </div>
                </div>
              </div>

              <div className="info-divider" />

              <div className="info-row">
                <div className="info-row-left">
                  <div className="info-icon"><Phone size={16} /></div>
                  <div className="info-text">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{profile.phone || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="info-card">
              <button className="quick-link" onClick={() => navigate("/user-dashboard/orders")} id="view-orders-btn">
                <div className="quick-link-left">
                  <span className="quick-link-icon">📦</span>
                  <span className="quick-link-label">My Orders</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>

              <div className="info-divider" />

              <button className="quick-link" onClick={() => navigate("/user-dashboard")} id="browse-menu-link">
                <div className="quick-link-left">
                  <span className="quick-link-icon">🍽</span>
                  <span className="quick-link-label">Browse Menu</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            </div>

            {/* Logout */}
            <button className="logout-full-btn" onClick={handleLogout} id="account-logout-btn">
              <LogOut size={16} />
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/user-dashboard")}>
          <Home size={20} /><span>Home</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/user-dashboard/orders")}>
          <Clock size={20} /><span>Orders</span>
        </button>
        <button className="nav-btn mic-btn" onClick={() => navigate("/user-dashboard")}>
          <Mic size={22} />
        </button>
        <button className="nav-btn" onClick={() => navigate("/user-dashboard/cart")}>
          <ShoppingCart size={20} /><span>Cart</span>
        </button>
        <button className="nav-btn active">
          <User size={20} /><span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default AccountPage;
