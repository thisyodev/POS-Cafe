import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import POS from "./pages/POS";
import TableQRCodePage from "./pages/TableQRCodePage";
import OrderDashboard from "./pages/OrderDashboard";
import OrderDetail from "./pages/OrderDetail";
import DailySalesReport from "./pages/DailySalesReport";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login"; // เพิ่มหน้า Login

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* หน้า Login เข้าถึงได้เสมอ */}
          <Route path="/login" element={<Login />} />

          {/* หน้า POS สำหรับ Walk-in อาจไม่ต้องล็อก */}
          <Route path="/" element={<POS />} />
          <Route path="/table-qrcode" element={<TableQRCodePage />} />

          {/* Protected Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/daily-sales"
            element={
              <ProtectedRoute>
                <DailySalesReport />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<h1>404 - Not Found</h1>} />
        </Routes>
      </Layout>
    </Router>
  );
}
