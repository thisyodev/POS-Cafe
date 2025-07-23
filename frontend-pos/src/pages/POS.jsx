import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import MenuCard from "../components/MenuCard";
import AddMenuModal from "../components/AddMenuModal";
import api from "../services/api";
// ปิด warning react-hooks/exhaustive-deps ชั่วคราวในไฟล์นี้
/* eslint-disable react-hooks/exhaustive-deps */

export default function POS() {
  // เมนูจาก backend
  const [menus, setMenus] = useState([]);

  // ช่องค้นหา
  const [search, setSearch] = useState("");

  // ตะกร้า: [{id, name, price, imageUrl, qty}]
  const [cart, setCart] = useState([]);

  // Modal เพิ่มเมนู
  const [showAdd, setShowAdd] = useState(false);

  // การโหลด & error
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // วิธีชำระเงิน: cash | qr
  const [payMethod, setPayMethod] = useState("cash");

  // เก็บ orderId ล่าสุดหลังชำระเงิน
  const [lastOrderId, setLastOrderId] = useState(null);

  // โหลดเมนูจาก backend
  const loadMenus = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const params = search.trim() ? { q: search.trim() } : undefined;
      const res = await api.get(`/api/menu`, { params });
      setMenus(res.data);
    } catch (err) {
      console.error("loadMenus error", err);
      setErrMsg("โหลดเมนูไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก
  useEffect(() => {
    loadMenus();
  }, []);

  // กรองเมนูฝั่ง client
  const filteredMenus = useMemo(() => {
    if (!search) return menus;
    const lower = search.toLowerCase();
    return menus.filter((m) => m.name.toLowerCase().includes(lower));
  }, [menus, search]);

  // เพิ่มสินค้าในตะกร้า
  const addToCart = (menu) => {
    setCart((c) => {
      const exist = c.find((i) => i.id === menu.id);
      if (exist) {
        return c.map((i) => (i.id === menu.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { ...menu, qty: 1 }];
    });
  };

  // เพิ่ม/ลดจำนวน
  const increaseQty = (item) => {
    setCart((c) =>
      c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
    );
  };
  const decreaseQty = (item) => {
    setCart((c) =>
      c
        .map((i) =>
          i.id === item.id ? { ...i, qty: Math.max(i.qty - 1, 0) } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  // ลบสินค้าออกจากตะกร้า
  const removeItem = (id) => {
    setCart((c) => c.filter((i) => i.id !== id));
  };

  // ยอดรวม
  const cartTotal = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );

  // ชำระเงิน
  const checkout = async () => {
    if (cart.length === 0) return;

    try {
      const res = await api.post(`/api/order/checkout`, {
        tableNumber: "Walk-in",
        items: cart.map((i) => ({
          menu_id: i.id,
          quantity: i.qty,
          price: Number(i.price) || 0, // ป้องกัน price เป็น string
        })),
        total: Number(cartTotal),
      });

      alert("ชำระเงินสำเร็จ");
      setCart([]);

      const orderId = res.data.orderId;
      window.open(`${API_URL}/api/order/receipt/${orderId}`, "_blank");
    } catch (err) {
      console.error("checkout error", err);
      alert("ชำระเงินล้มเหลว");
    }
  };


  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left: Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-4">
          <input
            type="text"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={loadMenus}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            ค้นหา / โหลดใหม่
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            + เพิ่มเมนู
          </button>
        </div>

        {loading && <p>กำลังโหลดเมนู...</p>}
        {errMsg && <p className="text-red-600">{errMsg}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredMenus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} onAdd={() => addToCart(menu)} />
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-2">ตะกร้า</h2>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 && (
            <p className="text-gray-500 text-sm">ยังไม่มีสินค้า</p>
          )}
          <ul className="space-y-2">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center gap-2 text-sm"
              >
                <span className="truncate flex-1">{item.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => decreaseQty(item)}
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => increaseQty(item)}
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    +
                  </button>
                  <span className="w-16 text-right">
                    {(item.price * item.qty).toFixed(2)} ฿
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    title="ลบออก"
                  >
                    x
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment method */}
        <div className="mt-4 border-t pt-4 space-y-2">
          <div>
            <label className="font-semibold block mb-1">วิธีชำระเงิน:</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value="cash"
                  checked={payMethod === "cash"}
                  onChange={() => setPayMethod("cash")}
                />
                เงินสด
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value="qr"
                  checked={payMethod === "qr"}
                  onChange={() => setPayMethod("qr")}
                />
                QR PromptPay
              </label>
            </div>
          </div>

          <div className="flex justify-between font-semibold text-lg">
            <span>รวม</span>
            <span>{cartTotal.toFixed(2)} ฿</span>
          </div>
          <button
            disabled={cart.length === 0}
            className="mt-2 w-full py-2 rounded bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
            onClick={checkout}
          >
            ชำระเงิน
          </button>

          {/* ปุ่มพิมพ์ใบเสร็จล่าสุด */}
          {lastOrderId && (
            <button
              className="mt-2 w-full py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() =>
                window.open(
                  `${API_URL}/api/order/receipt/${lastOrderId}`,
                  "_blank"
                )
              }
            >
              พิมพ์ใบเสร็จล่าสุด
            </button>
          )}
        </div>
      </div>

      {/* Modal เพิ่มเมนู */}
      <AddMenuModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={loadMenus}
      />
    </div>
  );
}
