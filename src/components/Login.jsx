// src/components/Login.jsx
import React, { useState } from 'react';
import './Login.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // Default to normal user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For signup
  const [phone, setPhone] = useState(''); // For signup
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup for users
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggedInRole, setLoggedInRole] = useState(null); // To simulate loading test component

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setIsSignup(false); // Reset signup mode when changing role
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      let body = { email, password };

      if (role === 'user') {
        if (isSignup) {
          endpoint = '/api/signup';
          body = { name, email, password, phone };
        } else {
          endpoint = '/api/login/user';
        }
      } else if (role === 'waiter') {
        endpoint = '/api/login/waiter';
      } else if (role === 'superadmin') {
        endpoint = '/api/login/superadmin';
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login/Signup failed');
      }

      if (role === 'user') {
        localStorage.setItem('email', email);
      }

      setSuccess(`Logged in as ${role}`);
      setLoggedInRole(role); // Simulate loading the test component
    } catch (err) {
      setError(err.message);
    }
  };

  // Test components rendered conditionally for simplicity (without router)
  if (loggedInRole === 'waiter') {
    navigate("/waiter-test");
  }

  if (loggedInRole === 'superadmin') {
     navigate("/superadmin-test");
  }

  if (loggedInRole === 'user') {
    navigate("/user-dashboard");
  }

  return (
    <div className="login-container">
      <h2 className="login-title">Login / Signup</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Role:</label>
          <select className="form-select" value={role} onChange={handleRoleChange}>
            <option value="user">Normal User</option>
            <option value="waiter">Waiter</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>

        {role === 'user' && (
          <div className="form-group">
            <button className="switch-button" type="button" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Switch to Login' : 'Switch to Signup'}
            </button>
          </div>
        )}

        {role === 'user' && isSignup && (
          <>
            <div className="form-group">
              <label className="form-label">Name:</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone:</label>
              <input
                className="form-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password:</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button className="submit-button" type="submit">{role === 'user' && isSignup ? 'Signup' : 'Login'}</button>
      </form>
    </div>
  );
};

export default Login;