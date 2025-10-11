import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Clock, Mic, ShoppingCart, User } from "lucide-react";
import "./Home.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState({});
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) {
      navigate('/login');
      return;
    }
    fetchMenu();
    fetchCart();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/daily-items');
      const data = await response.json();
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({
          name: item.name,
          price: item.price,
          type: item.itemType,
          image: item.image
        });
        return acc;
      }, {});
      setMenu(grouped);
    } catch (err) {
      setError('Failed to fetch menu');
    }
  };

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

  const updateBackendCart = async (newCart) => {
    const email = localStorage.getItem('email');
    const backendCart = newCart.map(item => ({
      itemName: item.name,
      rate: item.price,
      qty: item.quantity,
      total: item.price * item.quantity
    }));
    try {
      const response = await fetch('http://localhost:5000/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, cart: backendCart })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update cart');
      }
    } catch (err) {
      setError('Failed to update cart: ' + err.message);
    }
  };

  // Add to cart
  const addToCart = (item) => {
    setError('');
    const existing = cart.find((i) => i.name === item.name);
    let newCart;
    if (existing) {
      newCart = cart.map((i) =>
        i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newCart = [...cart, { ...item, quantity: 1 }];
    }
    setCart(newCart);
    updateBackendCart(newCart);
  };

  // Increase quantity
  const increaseQty = (item) => {
    setError('');
    const newCart = cart.map((i) =>
      i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
    );
    setCart(newCart);
    updateBackendCart(newCart);
  };

  // Decrease quantity
  const decreaseQty = (item) => {
    setError('');
    const newCart = cart
      .map((i) =>
        i.name === item.name ? { ...i, quantity: i.quantity - 1 } : i
      )
      .filter((i) => i.quantity > 0);
    setCart(newCart);
    updateBackendCart(newCart);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('token'); // If token is also stored
    navigate('/login');
  };

  // Navigate to cart page
  const handleViewCart = () => {
    navigate("/user-dashboard/cart");
  };

  // Voice Order
  const handleVoiceOrder = () => {
    setActiveTab("mic");

    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("User said:", transcript);

        try {
          // Send transcript to your backend (which uses Sarvam API)
          const response = await fetch("http://localhost:5000/api/voiceorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: transcript }),
          });
         
          // Check for non-OK response from server (e.g., the 500 error from failed JSON parsing)
          if (!response.ok) {
              const errorData = await response.json();
              console.error("Server voice order error:", errorData);
              alert(errorData.error || "Server error occurred during voice processing.");
              setIsListening(false);
              return;
          }

          const data = await response.json();

          if (data.items && data.items.length > 0) {
            // The AI returns objects like {name: "Poha", quantity: 1, price: 35}
            const itemsFromAI = data.items;
            const updatedCartItems = [];

            itemsFromAI.forEach((itemFromAI) => {
              let foundItem = null;

              // Find the corresponding item object in the local menu data
              const allMenuItems = Object.values(menu).flat();
              const localItem = allMenuItems.find(
                (menuItem) => menuItem.name.toLowerCase() === itemFromAI.name.toLowerCase()
              );

              if (localItem) {
                // Use local menu data (price, type) but override quantity with AI's inferred quantity
                foundItem = {
                  ...localItem,
                  quantity: itemFromAI.quantity && typeof itemFromAI.quantity === 'number' && itemFromAI.quantity > 0 ? itemFromAI.quantity : 1,
                };
              }

              if (foundItem) {
                updatedCartItems.push(foundItem);
              }
            });

            if (updatedCartItems.length > 0) {
              // Merge matched items with existing cart: add new items, or add quantity to existing items
              const finalCart = [...cart];
             
              updatedCartItems.forEach((item) => {
                const existingIndex = finalCart.findIndex((i) => i.name === item.name);
                if (existingIndex === -1) {
                  // Item is new, add it to the cart
                  finalCart.push(item);
                } else {
                  // Item exists, increase its quantity by the amount determined by the AI
                  finalCart[existingIndex].quantity += item.quantity;
                }
              });

              setCart(finalCart);
              updateBackendCart(finalCart);
              navigate("/user-dashboard/cart");
            } else {
              alert("The AI couldn't find any matching food items from your voice command.");
            }
          } else {
            alert("Could not understand your order.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Voice order failed. Try again!");
        }

        setIsListening(false);
      };

      recognitionRef.current.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }

    recognitionRef.current.start();
  };

  // Filtered menu based on search
  const filteredMenu = Object.entries(menu).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  return (
    <div className="home">
      <header className="header">
        <h1>DineGo</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search your food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      {Object.entries(filteredMenu).map(([category, items]) => (
        <section className="section" key={category}>
          <h2>{category.replace(/([A-Z])/g, " $1").trim()}</h2>
          <div className="grid">
            {items.map((item, index) => {
              const inCart = cart.find((i) => i.name === item.name);
              return (
                <div className="card" key={index}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: 'auto', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />}
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <span className={`type ${item.type}`}>{item.type.toUpperCase()}</span>
                  </div>
                  {!inCart ? (
                    <button className="add-button" onClick={() => addToCart(item)}>Add to Cart</button>
                  ) : (
                    <div className="qty-controls">
                      <button onClick={() => decreaseQty(item)}>-</button>
                      <span>{inCart.quantity}</span>
                      <button onClick={() => increaseQty(item)}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {cart.length > 0 && (
        <div className="bottom-cart">
          <p>{cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) added</p>
          <button onClick={handleViewCart}>View Cart</button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          onClick={() => {
            setActiveTab("home");
            navigate("/home");
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
          onClick={handleVoiceOrder}
          className={activeTab === "mic" ? "active mic" : "mic"}
        >
          <Mic size={24} color={isListening ? "red" : "white"} />
        </button>

        <button
          onClick={handleViewCart}
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

export default HomePage;