import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react"; // Import icons

const STATUS_ORDER = ["pending", "preparing", "served", "paid", "canceled"];

export default function OrderDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile filter menu

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

  useEffect(() => {
    loadOrders();
    // Refresh orders every 5 seconds
    const t = setInterval(loadOrders, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    return filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const handleAdvance = async (order) => {
    const to = nextStatus(order.status);
    if (!to) return;
    try {
      await api.put(`/api/order/${order.id}/status`, { status: to });
      loadOrders(); // Reload orders after status update
    } catch (e) {
      console.error("advance status error", e);
      alert("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`ยกเลิกออเดอร์ #${order.id} นี้หรือไม่?`)) return;
    try {
      await api.put(`/api/order/${order.id}/status`, { status: "canceled" });
      loadOrders(); // Reload orders after cancellation
    } catch (e) {
      console.error("cancel error", e);
      alert("ยกเลิกไม่สำเร็จ");
    }
  };

  const handlePrint = (order) => {
    window.open(
      `${api.defaults.baseURL}/api/order/receipt/${order.id}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1 text-center lg:text-left">
          ออเดอร์หน้าร้าน
        </h1>
        {/* Hamburger menu button for mobile */}
        <button
          className="lg:hidden text-gray-700 hover:text-gray-900 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
        >
          {menuOpen ? <CloseIcon size={28} /> : <MenuIcon size={28} />}
        </button>
      </header>

      {/* Mobile Filter Menu (Hamburger) */}
      <div
        className={`lg:hidden bg-white border-b overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-screen opacity-100 py-3" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-4">
          <FilterArea
            filter={filter}
            onChange={(f) => {
              setFilter(f);
              setMenuOpen(false); // Close menu after selection
            }}
          />
        </div>
      </div>

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:flex lg:gap-6">
        {/* Sidebar filters for desktop */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ตัวกรองสถานะ
            </h2>
            <FilterArea filter={filter} onChange={setFilter} />
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          {/* Loading & error messages */}
          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
                <span className="text-lg text-gray-600 font-medium">
                  กำลังโหลดออเดอร์...
                </span>
              </div>
            </div>
          )}
          {err && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-base"
              role="alert"
            >
              <p className="font-medium">เกิดข้อผิดพลาด!</p>
              <p>{err}</p>
            </div>
          )}

          {/* Orders Display */}
          {/* Desktop Table */}
          {!loading && filtered.length > 0 && (
            <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      รหัสออเดอร์
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      โต๊ะ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      ยอดรวม
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      สถานะ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-base text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => navigate(`/orders/${o.id}`)}
                      >
                        #{o.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800">
                        {o.table_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-base font-semibold text-gray-900">
                        ฿{Number(o.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {statusBadge(o.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        {nextStatus(o.status) && (
                          <button
                            onClick={() => handleAdvance(o)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                          >
                            {statusAdvanceLabel(o.status)}
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(o)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => handlePrint(o)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                        >
                          ใบเสร็จ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && filtered.length > 0 && (
            <div className="lg:hidden space-y-4">
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
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && <EmptyState filter={filter} />}
        </section>
      </main>
    </div>
  );
}

// Filter panel component
function FilterArea({ filter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
      <FilterButton
        label="ทั้งหมด"
        active={filter === "all"}
        onClick={() => onChange("all")}
      />
      {STATUS_ORDER.map((s) => (
        <FilterButton
          key={s}
          label={statusLabel(s)}
          active={filter === s}
          onClick={() => onChange(s)}
        />
      ))}
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        active
          ? "bg-amber-500 text-white shadow-md scale-105 focus:ring-amber-500"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

// Order Card component for mobile
function OrderCard({ order, onAdvance, onCancel, onPrint, onViewDetails }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 -ml-1"
        >
          ออเดอร์ #{order.id}
        </button>
        {statusBadge(order.status)}
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm text-gray-600 block">โต๊ะ:</span>{" "}
            <span className="text-2xl font-bold text-gray-900">
              {order.table_number}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">ยอดรวม</div>
            <div className="text-2xl font-extrabold text-gray-900">
              ฿{Number(order.total).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {nextStatus(order.status) && (
            <button
              onClick={() => onAdvance(order)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              {statusAdvanceLabel(order.status)}
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onCancel(order)}
              className="py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => onPrint(order)}
              className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              ใบเสร็จ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State component (reusable)
function EmptyState({ filter }) {
  const message =
    filter === "all"
      ? "ยังไม่มีออเดอร์ในระบบ"
      : `ไม่มีออเดอร์ที่มีสถานะ "${statusLabel(filter)}"`;
  return (
    <div className="p-8 bg-white shadow-sm rounded-lg text-center border border-gray-200">
      <div className="text-gray-400 text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีออเดอร์</h3>
      <p className="text-gray-500 text-base">{message}</p>
    </div>
  );
}

// Utility functions
function nextStatus(s) {
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
    "inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border";
  const map = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    preparing: "bg-blue-100 text-blue-800 border-blue-200",
    served: "bg-green-100 text-green-800 border-green-200",
    paid: "bg-gray-100 text-gray-800 border-gray-200",
    canceled: "bg-red-100 text-red-800 border-red-200",
  };
  const emojiMap = {
    pending: "🕐",
    preparing: "👨‍🍳",
    served: "✅",
    paid: "💰",
    canceled: "❌",
  };
  return (
    <span className={`${base} ${map[s] || ""}`}>
      {emojiMap[s]} {statusLabel(s)}
    </span>
  );
}
