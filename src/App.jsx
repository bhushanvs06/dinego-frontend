import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import WaiterTest from './components/WaiterTest';
import SuperadminTest from './components/SuperadminTest';
import HomePage from './components/user/Home'
import CartPage from './components/user/Cart'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/waiter-test" element={<WaiterTest />} />
        <Route path="/superadmin-test" element={<SuperadminTest />} />
        <Route path="/user-dashboard/home" element={<HomePage />} />
        <Route path="/user-dashboard/cart" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
