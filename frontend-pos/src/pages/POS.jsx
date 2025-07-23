import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import MenuCard from "../components/MenuCard";
import AddMenuModal from "../components/AddMenuModal";
import api, { API_URL } from "../services/api";
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

  // สำหรับ mobile: แสดง/ซ่อนตะกร้า
  const [showCart, setShowCart] = useState(false);

  // สำหรับ mobile menu toggle
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

    // แสดงตะกร้าอัตโนมัติบนมือถือเมื่อเพิ่มสินค้า
    if (window.innerWidth < 1024) {
      setShowCart(true);
    }
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

  // จำนวนรายการในตะกร้า
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // ชำระเงิน
  const checkout = async () => {
    if (cart.length === 0) return;

    try {
      const res = await api.post(`/api/order/checkout`, {
        tableNumber: "Walk-in",
        items: cart.map((i) => ({
          menu_id: i.id,
          quantity: i.qty,
          price: Number(i.price) || 0,
        })),
        total: Number(cartTotal),
      });

      alert("ชำระเงินสำเร็จ");
      setCart([]);
      setShowCart(false); // ซ่อนตะกร้าหลังชำระเงิน

      const orderId = res.data.orderId;
      window.open(
        `${api.defaults.baseURL}/api/order/receipt/${orderId}`,
        "_blank"
      );
    } catch (err) {
      console.error("checkout error", err);
      alert("ชำระเงินล้มเหลว");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800">POS Cafe</h1>
          </div>

          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="border-t bg-white p-4 space-y-3">
            <button
              onClick={() => {
                setShowAdd(true);
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
            >
              + เพิ่มเมนูใหม่
            </button>
            <button
              onClick={() => {
                loadMenus();
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              รีเฟรชเมนู
            </button>
          </div>
        )}
      </div>

      {/* Left: Menu Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              POS Cafe System
            </h1>
            <p className="text-gray-600">จัดการออเดอร์และเมนูของร้าน</p>
          </div>

          {/* Search and Actions */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาเมนู..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="hidden lg:flex gap-3">
                <button
                  onClick={loadMenus}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium min-w-[120px]"
                >
                  รีเฟรช
                </button>
                <button
                  onClick={() => setShowAdd(true)}
                  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium min-w-[120px]"
                >
                  + เพิ่มเมนู
                </button>
              </div>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-blue-800 font-medium">กำลังโหลดเมนู...</p>
              </div>
            </div>
          )}

          {errMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{errMsg}</p>
            </div>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAdd={() => addToCart(menu)}
                className="transform hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>

          {filteredMenus.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">ไม่พบเมนูที่ค้นหา</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart Section - Desktop */}
      <div className="hidden lg:flex w-80 xl:w-96 border-l bg-white flex-col shadow-lg">
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <h2 className="text-2xl font-bold">ตะกร้าสินค้า</h2>
          <p className="text-purple-200 mt-1">
            {cartItemsCount} รายการ • {cartTotal.toFixed(2)} ฿
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
              <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
              <p className="text-sm text-gray-400 mt-1">
                เลือกเมนูเพื่เริ่มสั่งออเดอร์
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-800 flex-1 pr-2">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      title="ลบออก"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => increaseQty(item)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-purple-600">
                      {(item.price * item.qty).toFixed(2)} ฿
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="border-t p-6 bg-gray-50">
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-3">
              วิธีชำระเงิน:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="cash"
                  checked={payMethod === "cash"}
                  onChange={() => setPayMethod("cash")}
                  className="text-purple-600"
                />
                <span>เงินสด</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="qr"
                  checked={payMethod === "qr"}
                  onChange={() => setPayMethod("qr")}
                  className="text-purple-600"
                />
                <span>QR Pay</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
            <span>รวมทั้งหมด</span>
            <span className="text-purple-600">{cartTotal.toFixed(2)} ฿</span>
          </div>

          <button
            disabled={cart.length === 0}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 disabled:hover:scale-100"
            onClick={checkout}
          >
            ชำระเงิน {cartItemsCount > 0 && `(${cartItemsCount} รายการ)`}
          </button>

          {lastOrderId && (
            <button
              className="mt-3 w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
              onClick={() =>
                window.open(
                  `${api.defaults.baseURL}/api/order/receipt/${lastOrderId}`,
                  "_blank"
                )
              }
            >
              พิมพ์ใบเสร็จล่าสุด
            </button>
          )}
        </div>
      </div>

      {/* Mobile Cart Modal */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl">
            <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">ตะกร้าสินค้า</h2>
                <p className="text-purple-200 text-sm">
                  {cartItemsCount} รายการ • {cartTotal.toFixed(2)} ฿
                </p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-300 mb-4">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm flex-1 pr-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQty(item)}
                            className="w-7 h-7 rounded-full bg-white border hover:bg-gray-50 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => increaseQty(item)}
                            className="w-7 h-7 rounded-full bg-white border hover:bg-gray-50 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-purple-600 text-sm">
                          {(item.price * item.qty).toFixed(2)} ฿
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Payment Section */}
            <div className="border-t p-4 bg-gray-50">
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">
                  วิธีชำระเงิน:
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-white transition-colors flex-1 text-sm">
                    <input
                      type="radio"
                      name="method"
                      value="cash"
                      checked={payMethod === "cash"}
                      onChange={() => setPayMethod("cash")}
                      className="text-purple-600"
                    />
                    <span>เงินสด</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-white transition-colors flex-1 text-sm">
                    <input
                      type="radio"
                      name="method"
                      value="qr"
                      checked={payMethod === "qr"}
                      onChange={() => setPayMethod("qr")}
                      className="text-purple-600"
                    />
                    <span>QR</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-gray-800 mb-3">
                <span>รวมทั้งหมด</span>
                <span className="text-purple-600">
                  {cartTotal.toFixed(2)} ฿
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-purple-800 transition-all"
                onClick={checkout}
              >
                ชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มเมนู */}
      <AddMenuModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={loadMenus}
      />
    </div>
  );
}
