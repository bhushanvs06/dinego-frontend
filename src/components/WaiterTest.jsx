import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./Waiter.css";

const WaiterTest = () => {
  const [orders, setOrders] = useState([]);
  const [scanningOrderId, setScanningOrderId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    type: "", // This will be 'success' or 'error'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        const mappedOrders = data.map(order => ({
          id: order.order_id,
          username: order.userName,
          items: order.items.map(item => `${item.qty} ${item.itemName}`).join(', '),
          date: order.date,
          time: order.time,
          verified: order.status === 'pending' ? 'Pending' : 'Served',
          otp: order.otp
        }));
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let scanner;

    const onScanSuccess = async (decodedText, decodedResult) => {
      const currentOrder = orders.find(o => o.id === scanningOrderId);
      if (currentOrder && String(currentOrder.otp) === decodedText) {
        try {
          const updateResponse = await fetch('http://localhost:5000/api/update-order-status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: scanningOrderId, status: 'completed' })
          });
          if (!updateResponse.ok) {
            throw new Error('Failed to update order status');
          }
          setAlertInfo({
            show: true,
            message: "Successful: OTP Matched!",
            type: "success",
          });
          const updatedOrders = orders.map((o) =>
            o.id === scanningOrderId ? { ...o, verified: "Served" } : o
          );
          setOrders(updatedOrders);
        } catch (error) {
          setAlertInfo({
            show: true,
            message: "Failed: Unable to update order status.",
            type: "error",
          });
        }
      } else {
        setAlertInfo({
          show: true,
          message: "Failed: OTP does not match.",
          type: "error",
        });
      }
      handleCloseScanner(); // Close the QR scanner
    };

    const onScanError = (errorMessage) => {};

    if (scanningOrderId) {
      scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { qrbox: { width: 250, height: 250 }, fps: 5 },
        false
      );
      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [scanningOrderId, orders]);

  const handleQRScan = (id) => setScanningOrderId(id);
  const handleCloseScanner = () => setScanningOrderId(null);
  const handleCloseAlert = () => setAlertInfo({ show: false, message: '', type: '' });

  return (
    <div className="waiter-container">
      <h1 className="waiter-title">Waiter Panel</h1>
      <h2 className="order-list-title">Order List</h2>

      <div className="order-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-details">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Username:</strong> {order.username}</p>
              <p><strong>Items:</strong> {order.items}</p>
              <p><strong>Date:</strong> {order.date}</p>
              <p><strong>Time:</strong> {order.time}</p>
              <p><strong>Verified:</strong>{" "}
                <span className={`status ${order.verified === "Served" ? "served" : "pending"}`}>
                  {order.verified}
                </span>
              </p>
            </div>
            <button className="qr-btn" onClick={() => handleQRScan(order.id)}>
              QR Scan
            </button>
          </div>
        ))}
      </div>

      {scanningOrderId && (
        <div className="qr-modal">
          <div className="qr-modal-content">
            <h3>Scan QR for Order ID: {scanningOrderId}</h3>
            <div id="qr-reader-container"></div>
            <button className="close-btn" onClick={handleCloseScanner}>Close Scanner</button>
          </div>
        </div>
      )}

      {alertInfo.show && (
        <div className="custom-alert-overlay">
          <div className={`custom-alert-box ${alertInfo.type}`}>
            <p>{alertInfo.message}</p>
            <button onClick={handleCloseAlert}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterTest;