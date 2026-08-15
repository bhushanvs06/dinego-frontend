import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Clock, Mic, ShoppingCart, User, Search, LogOut } from "lucide-react";
import { API_URL } from "../../config";
import "./Home.css";

const CATEGORY_EMOJI = {
  Breakfast: "🌅",
  LunchSpecials: "🍱",
  SnacksFastFood: "🍔",
  Beverages: "🥤",
  Desserts: "🍰",
};

const ComboSlider = ({ banners, onAddCombo }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeBanners = banners.filter(b => b.active !== false);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIdx];

  return (
    <div className="zomato-combo-slider">
      <div className="combo-banner-slide" key={current._id || currentIdx}>
        {current.image ? (
          <img
            src={current.image}
            alt={current.title}
            className="combo-banner-bg"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"; }}
          />
        ) : (
          <div className="combo-banner-bg-fallback" />
        )}
        <div className="combo-banner-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <span className="combo-tag-pill">{current.tag || "🔥 SPECIAL COMBO"}</span>
            {current.comboItems && current.comboItems.length > 0 && (
              <button
                className="add-combo-btn"
                onClick={() => onAddCombo(current)}
              >
                🛒 Add Combo {current.price ? `@ ₹${current.price}` : ''}
              </button>
            )}
          </div>
          <h3 className="combo-title">{current.title}</h3>
          {current.subtitle && <p className="combo-sub">{current.subtitle}</p>}
        </div>
      </div>

      {activeBanners.length > 1 && (
        <div className="combo-dots">
          {activeBanners.map((_, i) => (
            <span
              key={i}
              className={`combo-dot ${i === currentIdx ? "active" : ""}`}
              onClick={() => setCurrentIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState({});
  const [banners, setBanners] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) { navigate("/login"); return; }
    fetchMenu();
    fetchCart();
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/banners`);
      const data = await res.json();
      setBanners(data);
    } catch { /* silence */ }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${API_URL}/api/daily-items`);
      const data = await response.json();
      const grouped = data.reduce((acc, item) => {
        const cat = item.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({ name: item.name, price: item.price, type: item.itemType, image: item.image });
        return acc;
      }, {});
      setMenu(grouped);
    } catch { setError("Failed to load menu"); }
  };

  const fetchCart = async () => {
    const email = localStorage.getItem("email");
    if (!email) return;
    try {
      const r = await fetch(`${API_URL}/api/user/cart?email=${encodeURIComponent(email)}`);
      if (!r.ok) return;
      const data = await r.json();
      setCart(data.map((i) => ({ name: i.itemName, price: i.rate, quantity: i.qty, type: "veg" })));
    } catch { /* silence */ }
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

  const addToCart = (item) => {
    setError("");
    const existing = cart.find((i) => i.name === item.name);
    const newCart = existing
      ? cart.map((i) => (i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i))
      : [...cart, { ...item, quantity: 1 }];
    setCart(newCart);
    syncCart(newCart);
  };

  const increaseQty = (item) => {
    const newCart = cart.map((i) => (i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i));
    setCart(newCart);
    syncCart(newCart);
  };

  const decreaseQty = (item) => {
    const newCart = cart
      .map((i) => (i.name === item.name ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    setCart(newCart);
    syncCart(newCart);
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleVoiceOrder = () => {
    setActiveTab("mic");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    // Toggle off if already listening
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    // Create fresh instance per request to prevent browser loop bugs
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      finalTranscript = currentTranscript;
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const textToProcess = finalTranscript.trim();
      if (!textToProcess) return;

      console.log("Speaking completed. Processing transcript:", textToProcess);

      try {
        const response = await fetch(`${API_URL}/api/voiceorder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: textToProcess }),
        });
        if (!response.ok) {
          const e = await response.json();
          alert(e.error || "Server error processing voice order.");
          return;
        }
        const data = await response.json();
        let itemsAddedCount = 0;

        if (data.items && data.items.length > 0) {
          const allMenuItems = Object.values(menu).flat();
          const finalCart = [...cart];
          data.items.forEach((ai) => {
            const local = allMenuItems.find((m) => m.name.toLowerCase() === ai.name.toLowerCase());
            if (local) {
              const idx = finalCart.findIndex((i) => i.name === local.name);
              const qty = ai.quantity > 0 ? ai.quantity : 1;
              if (idx === -1) finalCart.push({ ...local, quantity: qty });
              else finalCart[idx].quantity += qty;
              itemsAddedCount++;
            }
          });

          if (itemsAddedCount > 0) {
            setCart(finalCart);
            await syncCart(finalCart);
            navigate("/user-dashboard/cart");
          } else {
            alert(`No matching menu items found for: "${textToProcess}"`);
          }
        } else {
          alert(`No matching items found for: "${textToProcess}"`);
        }
      } catch (err) {
        console.error("Voice order error:", err);
        alert("Voice order failed. Please try again!");
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const activeBanners = (banners || []).filter(b => b && b.active !== false);

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredMenu = Object.entries(menu).reduce((acc, [cat, items]) => {
    if (selectedCategory !== "All" && cat !== selectedCategory) return acc;
    const filtered = items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  const handleAddCombo = async (banner) => {
    const comboName = banner.title;
    const comboPrice = Number(banner.price) || (banner.comboItems ? banner.comboItems.reduce((s, i) => s + (Number(i.rate) * (i.qty || 1)), 0) : 0);
    if (!comboPrice) return;

    let newCart = [...cart];
    const existing = newCart.find(i => i.name === comboName);
    if (existing) {
      existing.quantity += 1;
    } else {
      newCart.push({ name: comboName, price: comboPrice, quantity: 1, type: 'veg' });
    }
    setCart(newCart);
    await syncCart(newCart);
  };

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCartPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <img src="/logo.png" alt="DineGo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          <h1>DineGo</h1>
        </div>
        <button className="logout-button" onClick={handleLogout} id="logout-btn">
          <LogOut size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Logout
        </button>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search dishes, snacks, drinks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-input"
          />
          <button
            className={`search-mic-btn${isListening ? ' listening' : ''}`}
            onClick={handleVoiceOrder}
            title="Voice Search & Order"
          >
            <Mic size={16} />
          </button>
        </div>
      </div>

      {/* Zomato-Style Featured Promotional Combo Slider */}
      <ComboSlider banners={banners} onAddCombo={handleAddCombo} />

      {/* Category Filter Chips Bar */}
      {Object.keys(menu).length > 0 && (
        <div className="customer-category-bar">
          <button
            className={`cat-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Items ({Object.values(menu).flat().length + activeBanners.length})
          </button>
          {activeBanners.length > 0 && (
            <button
              className={`cat-chip ${selectedCategory === 'Combos' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Combos')}
            >
              <span>🔥</span>
              <span>Special Combos ({activeBanners.length})</span>
            </button>
          )}
          {Object.entries(menu).map(([cat, items]) => (
            <button
              key={cat}
              className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{CATEGORY_EMOJI[cat] || '🍴'}</span>
              <span>{cat.replace(/([A-Z])/g, " $1").trim()} ({items.length})</span>
            </button>
          ))}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {/* Menu & Combos */}
      <div className="menu-content">
        {/* Combos Section (shown on 'Combos' tab or 'All' tab) */}
        {(selectedCategory === 'Combos' || selectedCategory === 'All') && activeBanners.length > 0 && (
          <section className="section" key="Combos">
            <div className="section-header">
              <span style={{ fontSize: '1.2rem' }}>🔥</span>
              <span className="section-title">Special Combo Packs</span>
              <span className="section-count">{activeBanners.length} combos</span>
            </div>

            <div className="grid">
              {(expandedCategories['Combos'] ? activeBanners : activeBanners.slice(0, 4)).map((banner, index) => {
                const inCart = cart.find((i) => i.name === banner.title);
                return (
                  <div className="card combo-card-item" key={banner._id || index}>
                    <div className="card-image-wrapper">
                      {banner.image ? (
                        <img src={banner.image} alt={banner.title} loading="lazy" />
                      ) : (
                        <div className="card-image-placeholder">🎠</div>
                      )}
                      <div className="card-badge veg" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                        {banner.tag || "SPECIAL COMBO"}
                      </div>
                    </div>

                    <div className="card-body">
                      <span className="card-name">{banner.title}</span>
                      <span className="combo-card-sub">{banner.subtitle}</span>
                      {!inCart ? (
                        <button className="add-button combo-add-btn" onClick={() => handleAddCombo(banner)}>
                          🛒 Add Combo {banner.price ? `@ ₹${banner.price}` : ''}
                        </button>
                      ) : (
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => decreaseQty({ name: banner.title })}>−</button>
                          <span className="qty-value">{inCart.quantity}</span>
                          <button className="qty-btn" onClick={() => increaseQty({ name: banner.title })}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeBanners.length > 4 && (
              <button
                className="show-more-btn"
                onClick={() => toggleCategoryExpand('Combos')}
              >
                {expandedCategories['Combos'] ? '▲ Show Less' : `▼ Show More (${activeBanners.length - 4} more combos)`}
              </button>
            )}
          </section>
        )}

        {/* Regular Menu Categories */}
        {selectedCategory !== 'Combos' && Object.keys(filteredMenu).length === 0 && activeBanners.length === 0 ? (
          <div className="empty-state">
            <span>🍽</span>
            <p>{searchQuery ? "No items found for your search" : "No menu items available"}</p>
          </div>
        ) : (
          selectedCategory !== 'Combos' && Object.entries(filteredMenu).map(([category, items]) => {
            const isExpanded = expandedCategories[category];
            const visibleItems = isExpanded ? items : items.slice(0, 4);
            const hasMore = items.length > 4;

            return (
              <section className="section" key={category}>
                <div className="section-header">
                  <span style={{ fontSize: '1.2rem' }}>{CATEGORY_EMOJI[category] || '🍴'}</span>
                  <span className="section-title">{category.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="section-count">{items.length} items</span>
                </div>

                <div className="grid">
                  {visibleItems.map((item, index) => {
                    const inCart = cart.find((i) => i.name === item.name);
                    return (
                      <div className="card" key={index}>
                        <div className="card-image-wrapper">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"; }}
                            />
                          ) : (
                            <div className="card-image-placeholder">
                              {CATEGORY_EMOJI[category] || "🍴"}
                            </div>
                          )}
                          <div className={`card-badge ${item.type === 'veg' ? 'veg' : 'nonveg'}`}>
                            <span className="veg-dot" />
                            {item.type === 'veg' ? 'VEG' : 'NON-VEG'}
                          </div>
                        </div>

                        <div className="card-body">
                          <span className="card-name">{item.name}</span>
                          <span className="card-price">₹{item.price}</span>
                          {!inCart ? (
                            <button className="add-button" onClick={() => addToCart(item)}>
                              + Add
                            </button>
                          ) : (
                            <div className="qty-controls">
                              <button className="qty-btn" onClick={() => decreaseQty(item)}>−</button>
                              <span className="qty-value">{inCart.quantity}</span>
                              <button className="qty-btn" onClick={() => increaseQty(item)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <button
                    className="show-more-btn"
                    onClick={() => toggleCategoryExpand(category)}
                  >
                    {isExpanded ? '▲ Show Less' : `▼ Show More (${items.length - 4} more items)`}
                  </button>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Voice Listening Modal */}
      {isListening && (
        <div className="voice-listening-overlay">
          <div className="voice-listening-modal">
            <div className="voice-mic-ripple-wrap">
              <div className="ripple-ring r1"></div>
              <div className="ripple-ring r2"></div>
              <div className="ripple-ring r3"></div>
              <div className="voice-mic-circle">
                <Mic size={36} color="white" className="mic-glow-icon" />
              </div>
            </div>

            <div className="wave-bars">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>

            <h3 className="listening-title">Listening to your order…</h3>
            <p className="listening-sub">Speak naturally e.g. <em>"Add 2 Masala Dosa and 1 Cold Coffee"</em></p>
            <button className="cancel-voice-btn" onClick={handleVoiceOrder}>
              ✓ Done Speaking / Stop
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="bottom-cart">
          <div className="bottom-cart-info">
            <span className="bottom-cart-count">{totalCartItems} item{totalCartItems > 1 ? 's' : ''} in cart</span>
            <span className="bottom-cart-total">₹{totalCartPrice.toFixed(0)}</span>
          </div>
          <button className="view-cart-btn" onClick={() => navigate("/user-dashboard/cart")} id="view-cart-btn">
            View Cart →
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-btn${activeTab === 'home' ? ' active' : ''}`} onClick={() => { setActiveTab('home'); navigate('/user-dashboard'); }}>
          <Home size={20} className="nav-icon" />
          <span>Home</span>
        </button>
        <button className={`nav-btn${activeTab === 'orders' ? ' active' : ''}`} onClick={() => { setActiveTab('orders'); navigate('/user-dashboard/orders'); }}>
          <Clock size={20} className="nav-icon" />
          <span>Orders</span>
        </button>
        <div className="mic-nav-wrapper">
          <button className={`nav-btn mic-btn${isListening ? ' listening' : ''}`} onClick={handleVoiceOrder} id="mic-btn" title="Voice Order">
            <Mic size={22} />
          </button>
          <span className="mic-nav-label">Voice</span>
        </div>
        <button className={`nav-btn${activeTab === 'cart' ? ' active' : ''}`} onClick={() => { setActiveTab('cart'); navigate('/user-dashboard/cart'); }}>
          <ShoppingCart size={20} className="nav-icon" />
          <span>Cart</span>
        </button>
        <button className={`nav-btn${activeTab === 'account' ? ' active' : ''}`} onClick={() => { setActiveTab('account'); navigate('/user-dashboard/account'); }}>
          <User size={20} className="nav-icon" />
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default HomePage;