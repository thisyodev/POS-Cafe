import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/api/order/${orderId}`);
      // รองรับ 2 รูปแบบ response: {order, items} หรือ flat
      if (res.data?.order && res.data?.items) {
        setOrder(res.data.order);
        setItems(res.data.items);
      } else {
        setOrder(res.data);
        setItems(res.data.items || []);
      }
    } catch (e) {
      console.error("load order error", e);
      setErr("โหลดออเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const updateStatus = async (status) => {
    try {
      await api.put(`/api/order/${orderId}/status`, { status });
      loadOrder();
    } catch (e) {
      console.error("update status error", e);
      alert("อัปเดตไม่สำเร็จ");
    }
  };

  const printReceipt = () => {
     window.open(
       `${api.defaults.baseURL}/api/order/receipt/${orderId}`,
       "_blank"
     );
  };

  const total =
    order?.total ??
    items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || i.quantity || 0),
      0
    );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">ออเดอร์ #{orderId}</h1>
        <Link
          to="/orders"
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          ← กลับ
        </Link>
      </div>

      {loading && <p>กำลังโหลด...</p>}
      {err && <p className="text-red-500">{err}</p>}

      {order && (
        <div className="mb-4 space-y-1">
          <p>โต๊ะ: {order.table_number}</p>
          <p>สถานะ: {statusLabel(order.status)}</p>
          <p>วันที่: {fmtDate(order.created_at)}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">รายการสินค้า</h2>
      <table className="w-full text-sm bg-white shadow rounded overflow-hidden mb-4">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">สินค้า</th>
            <th className="p-2 text-center">จำนวน</th>
            <th className="p-2 text-right">ราคา</th>
            <th className="p-2 text-right">รวม</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const qty = Number(it.qty ?? it.quantity ?? 0);
            const price = Number(it.price ?? 0);
            return (
              <tr key={it.id || it.menu_id} className="border-t">
                <td className="p-2">{it.name}</td>
                <td className="p-2 text-center">{qty}</td>
                <td className="p-2 text-right">{price.toFixed(2)}</td>
                <td className="p-2 text-right">{(qty * price).toFixed(2)}</td>
              </tr>
            );
          })}
          {items.length === 0 && !loading && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                ไม่มีรายการ
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="text-right font-bold text-lg mb-6">
        รวมทั้งหมด: {Number(total).toFixed(2)} ฿
      </div>

      {/* ปุ่มจัดการสถานะ */}
      {order && (
        <div className="flex flex-wrap gap-2">
          {nextStatus(order.status) && (
            <button
              onClick={() => updateStatus(nextStatus(order.status))}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {statusAdvanceLabel(order.status)}
            </button>
          )}
          <button
            onClick={() => updateStatus("canceled")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ยกเลิก
          </button>
          <button
            onClick={printReceipt}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            พิมพ์ใบเสร็จ
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

function statusLabel(s) {
  switch (s) {
    case "pending":
      return "รอรับ";
    case "preparing":
      return "กำลังทำ";
    case "served":
      return "เสิร์ฟแล้ว";
    case "paid":
      return "ชำระเงินแล้ว";
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

function fmtDate(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString();
}
