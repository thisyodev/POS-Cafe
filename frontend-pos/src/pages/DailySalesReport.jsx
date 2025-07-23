import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";


export default function DailySalesReport() {
  const [report, setReport] = useState(null);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // โหลดรายงานยอดขาย
        const resReport = await api.get(`/api/report/daily-sales`);
        setReport(resReport.data);

        // โหลดออเดอร์ล่าสุด 5 รายการ
        const resOrders = await axios.get(`/api/order?limit=5`);
        setLatestOrders(resOrders.data || []);
      } catch (e) {
        console.error(e);
        setErr("ไม่สามารถโหลดข้อมูลรายงานได้");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-6 text-center">กำลังโหลด...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Dashboard Summary */}
      <h1 className="text-2xl font-bold mb-4 text-center">
        สรุปยอดวันนี้ & รายงานยอดขาย
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-600">ยอดขายรวม</p>
          <p className="text-2xl font-bold text-green-700">
            {Number(report.totalSales).toFixed(2)} ฿
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-600">จำนวนออเดอร์</p>
          <p className="text-2xl font-bold text-blue-700">
            {report.totalOrders}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-600">วันที่</p>
          <p className="text-lg font-semibold">{report.reportDate}</p>
        </div>
      </div>

      {/* Top Menus */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">เมนูขายดี 5 อันดับ</h2>
        <ul className="space-y-2">
          {report.topMenus.map((menu, idx) => (
            <li key={idx} className="flex justify-between">
              <span>
                {idx + 1}. {menu.name}
              </span>
              <span className="text-gray-700">{menu.qty} ชิ้น</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Latest Orders */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-bold mb-4">ออเดอร์ล่าสุด</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">โต๊ะ</th>
              <th className="p-2 text-right">ยอด</th>
              <th className="p-2 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {latestOrders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{o.id}</td>
                <td className="p-2">โต๊ะ {o.table_number}</td>
                <td className="p-2 text-right">
                  {Number(o.total).toFixed(2)} ฿
                </td>
                <td className="p-2 text-center">{statusBadge(o.status)}</td>
              </tr>
            ))}
            {latestOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  ไม่มีออเดอร์ล่าสุด
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- UI Helper ---------- */
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
