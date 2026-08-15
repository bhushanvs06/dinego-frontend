// src/components/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { value: 'user', label: 'Customer' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'superadmin', label: 'Admin' },
];

import { API_URL } from '../config';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (r) => {
    setRole(r);
    setIsSignup(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Authentication failed');

      if (role === 'user') localStorage.setItem('email', email);
      if (role === 'waiter') {
        localStorage.setItem('waiterEmail', email);
        if (data.name) localStorage.setItem('waiterName', data.name);
      }
      if (role === 'superadmin') localStorage.setItem('adminEmail', email);

      setSuccess(`Welcome back!`);

      setTimeout(() => {
        if (role === 'waiter') navigate('/waiter-test');
        else if (role === 'superadmin') navigate('/superadmin-test');
        else navigate('/user-dashboard');
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>🍽 DineGo</h1>
          <p>Your smart canteen companion</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs">
          {ROLES.map((r) => (
            <button
              key={r.value}
              className={`role-tab${role === r.value ? ' active' : ''}`}
              type="button"
              onClick={() => handleRoleChange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {role === 'user' && isSignup && (
            <>
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Bhushan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  id="signup-name"
                />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  id="signup-phone"
                />
              </div>
            </>
          )}

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <button className="login-submit" type="submit" id="login-submit" disabled={loading}>
            {loading ? 'Please wait…' : (role === 'user' && isSignup ? 'Create Account' : 'Sign In')}
          </button>

          {role === 'user' && (
            <div className="auth-toggle">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <span onClick={() => { setIsSignup(!isSignup); setError(''); }}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;