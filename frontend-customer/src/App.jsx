import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerOrderPage from "./pages/CustomerOrderPage";
import OrderStatusPage from "./pages/OrderStatusPage";

function HomePage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">ยินดีต้อนรับสู่ร้านคาเฟ่</h1>
      <p className="mb-4">กรุณาสแกน QR โต้ะเพื่อสั่งอาหาร</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/table/:tableId" element={<CustomerOrderPage />} />
        <Route path="/order/:orderId/status" element={<OrderStatusPage />} />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </Router>
  );
}
