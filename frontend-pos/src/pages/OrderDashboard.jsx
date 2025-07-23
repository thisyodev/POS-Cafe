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
    <div className="p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">ออเดอร์หน้าร้าน</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {loading && <p>กำลังโหลด...</p>}
      {err && <p className="text-red-500">{err}</p>}

      {/* ตารางออเดอร์ */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">โต๊ะ</th>
              <th className="p-2 text-right">ยอด</th>
              <th className="p-2 text-center">สถานะ</th>
              <th className="p-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t hover:bg-yellow-50">
                <td
                  className="p-2 cursor-pointer text-blue-600 underline"
                  onClick={() => navigate(`/orders/${o.id}`)}
                >
                  {o.id}
                </td>
                <td className="p-2">โต๊ะ {o.table_number}</td>
                <td className="p-2 text-right">
                  {Number(o.total).toFixed(2)} ฿
                </td>
                <td className="p-2 text-center">{statusBadge(o.status)}</td>
                <td className="p-2 text-center space-x-1">
                  {nextStatus(o.status) && (
                    <button
                      onClick={() => handleAdvance(o)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {statusAdvanceLabel(o.status)}
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(o)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => handlePrint(o)}
                    className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    ใบเสร็จ
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  ไม่มีออเดอร์
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- UI Helpers ---------- */

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1 rounded-full text-sm " +
        (active
          ? "bg-amber-500 text-white shadow"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300")
      }
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
  const base = "px-2 py-0.5 rounded-full text-xs font-semibold";
  switch (s) {
    case "pending":
      return (
        <span className={`${base} bg-yellow-200 text-yellow-800`}>รอรับ</span>
      );
    case "preparing":
      return (
        <span className={`${base} bg-blue-200 text-blue-800`}>กำลังทำ</span>
      );
    case "served":
      return (
        <span className={`${base} bg-green-200 text-green-800`}>
          เสิร์ฟแล้ว
        </span>
      );
    case "paid":
      return (
        <span className={`${base} bg-gray-300 text-gray-800`}>จ่ายแล้ว</span>
      );
    case "canceled":
      return <span className={`${base} bg-red-200 text-red-800`}>ยกเลิก</span>;
    default:
      return s;
  }
}
