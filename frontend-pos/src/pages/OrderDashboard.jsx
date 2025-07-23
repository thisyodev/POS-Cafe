import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_ORDER = ["pending", "preparing", "served", "paid", "canceled"];

export default function OrderDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/api/order`);
      setOrders(res.data || []);
    } catch (e) {
      console.error("loadOrders error", e);
      setErr("โหลดออเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก + poll ทุก 5 วิ
  useEffect(() => {
    loadOrders();
    const t = setInterval(loadOrders, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const nextStatus = (s) => {
    switch (s) {
      case "pending":
        return "preparing";
      case "preparing":
        return "served";
      case "served":
        return "paid";
      default:
        return null;
    }
  };

  const handleAdvance = async (order) => {
    const to = nextStatus(order.status);
    if (!to) return;
    try {
      await api.put(`/api/order/${order.id}/status`, {
        status: to,
      });
      loadOrders();
    } catch (e) {
      console.error("advance status error", e);
      alert("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`ยกเลิกออเดอร์ #${order.id}?`)) return;
    try {
      await api.put(`/api/order/${order.id}/status`, {
        status: "canceled",
      });
      loadOrders();
    } catch (e) {
      console.error("cancel error", e);
      alert("ยกเลิกไม่สำเร็จ");
    }
  };

  const handlePrint = (order) => {
    window.open(`/api/order/receipt/${order.id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3 sm:px-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            ออเดอร์หน้าร้าน
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="ทั้งหมด"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {STATUS_ORDER.map((s) => (
              <FilterButton
                key={s}
                label={statusLabel(s)}
                active={filter === s}
                onClick={() => setFilter(s)}
              />
            ))}
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              <span className="text-gray-600">กำลังโหลด...</span>
            </div>
          </div>
        )}

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {err}
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      โต๊ะ
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ยอดรวม
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="px-6 py-4 cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => navigate(`/orders/${o.id}`)}
                      >
                        #{o.id}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        โต๊ะ {o.table_number}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        ฿{Number(o.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {statusBadge(o.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          {nextStatus(o.status) && (
                            <button
                              onClick={() => handleAdvance(o)}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                            >
                              {statusAdvanceLabel(o.status)}
                            </button>
                          )}
                          <button
                            onClick={() => handleCancel(o)}
                            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => handlePrint(o)}
                            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                          >
                            ใบเสร็จ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filtered.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onAdvance={handleAdvance}
                onCancel={handleCancel}
                onPrint={handlePrint}
                onViewDetails={() => navigate(`/orders/${o.id}`)}
              />
            ))}
          </div>

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ไม่มีออเดอร์
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "ยังไม่มีออเดอร์ในระบบ"
                  : `ไม่มีออเดอร์ที่มีสถานะ "${statusLabel(filter)}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile Order Card Component ---------- */
function OrderCard({ order, onAdvance, onCancel, onPrint, onViewDetails }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
        >
          ออเดอร์ #{order.id}
        </button>
        {statusBadge(order.status)}
      </div>

      {/* Card Content */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            <span className="text-sm">โต๊ะ</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              {order.table_number}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">ยอดรวม</div>
            <div className="text-xl font-bold text-gray-900">
              ฿{Number(order.total).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {nextStatus(order.status) && (
            <button
              onClick={() => onAdvance(order)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-base"
            >
              {statusAdvanceLabel(order.status)}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCancel(order)}
              className="py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => onPrint(order)}
              className="py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ใบเสร็จ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Helpers ---------- */
function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-amber-500 text-white shadow-md transform scale-105"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  );
}

function statusLabel(s) {
  switch (s) {
    case "pending":
      return "รอรับ";
    case "preparing":
      return "กำลังทำ";
    case "served":
      return "เสิร์ฟแล้ว";
    case "paid":
      return "จ่ายแล้ว";
    case "canceled":
      return "ยกเลิก";
    default:
      return s;
  }
}

function statusAdvanceLabel(s) {
  switch (s) {
    case "pending":
      return "รับออเดอร์";
    case "preparing":
      return "เสิร์ฟ";
    case "served":
      return "ชำระเงิน";
    default:
      return "";
  }
}

function statusBadge(s) {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
  switch (s) {
    case "pending":
      return (
        <span
          className={`${base} bg-yellow-100 text-yellow-800 border border-yellow-200`}
        >
          🕐 รอรับ
        </span>
      );
    case "preparing":
      return (
        <span
          className={`${base} bg-blue-100 text-blue-800 border border-blue-200`}
        >
          👨‍🍳 กำลังทำ
        </span>
      );
    case "served":
      return (
        <span
          className={`${base} bg-green-100 text-green-800 border border-green-200`}
        >
          ✅ เสิร์ฟแล้ว
        </span>
      );
    case "paid":
      return (
        <span
          className={`${base} bg-gray-100 text-gray-800 border border-gray-200`}
        >
          💰 จ่ายแล้ว
        </span>
      );
    case "canceled":
      return (
        <span
          className={`${base} bg-red-100 text-red-800 border border-red-200`}
        >
          ❌ ยกเลิก
        </span>
      );
    default:
      return <span className={`${base} bg-gray-100 text-gray-800`}>{s}</span>;
  }
}
