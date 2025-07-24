import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import MenuCard from "../components/MenuCard";
import AddMenuModal from "../components/AddMenuModal";
import api, { API_URL } from "../services/api";

/* eslint-disable react-hooks/exhaustive-deps */

export default function POS() {
  // State Management
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [lastOrderId, setLastOrderId] = useState(null);

  // Mobile UI States
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeView, setActiveView] = useState("menu"); // menu | cart

  // Load menus from backend
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

  useEffect(() => {
    loadMenus();
  }, []);

  // Filter menus
  const filteredMenus = useMemo(() => {
    if (!search) return menus;
    const lower = search.toLowerCase();
    return menus.filter((m) => m.name.toLowerCase().includes(lower));
  }, [menus, search]);

  // Cart functions
  const addToCart = (menu) => {
    setCart((c) => {
      const exist = c.find((i) => i.id === menu.id);
      if (exist) {
        return c.map((i) => (i.id === menu.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { ...menu, qty: 1 }];
    });

    // Show success feedback
    const button = document.querySelector(`[data-menu-id="${menu.id}"]`);
    if (button) {
      button.classList.add("animate-pulse");
      setTimeout(() => button.classList.remove("animate-pulse"), 300);
    }
  };

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

  const removeItem = (id) => {
    setCart((c) => c.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setShowCart(false);
    setActiveView("menu");
  };

  // Calculations
  const cartTotal = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Checkout function
  const checkout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
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

      // Success animation
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-500";
      successDiv.textContent = "✅ ชำระเงินสำเร็จ!";
      document.body.appendChild(successDiv);

      setTimeout(() => {
        successDiv.style.transform = "translateX(100%)";
        setTimeout(() => document.body.removeChild(successDiv), 500);
      }, 2000);

      clearCart();

      const orderId = res.data.orderId;
      setLastOrderId(orderId);
      window.open(
        `${api.defaults.baseURL}/api/order/receipt/${orderId}`,
        "_blank"
      );
    } catch (err) {
      console.error("checkout error", err);
      alert("ชำระเงินล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Navigation Header */}
      <div className="lg:hidden bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">☕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">POS Cafe</h1>
                <p className="text-xs text-gray-500">Point of Sale System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setActiveView("menu")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeView === "menu"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📋 เมนู ({menus.length})
            </button>
            <button
              onClick={() => setActiveView("cart")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 relative ${
                activeView === "cart"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🛒 ตะกร้า ({cartItemsCount})
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="border-t bg-white px-4 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => {
                setShowAdd(true);
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md"
            >
              ➕ เพิ่มเมนูใหม่
            </button>
            <button
              onClick={() => {
                loadMenus();
                setShowMobileMenu(false);
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md"
            >
              🔄 รีเฟรชเมนู
            </button>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  clearCart();
                  setShowMobileMenu(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-md"
              >
                🗑️ ล้างตะกร้า
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white shadow-sm border-b">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">☕</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      POS Cafe System
                    </h1>
                    <p className="text-gray-600 mt-1">
                      จัดการออเดอร์และเมนูของร้านอย่างมืออาชีพ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-2xl">
                    <div className="text-sm text-gray-600">ยอดรวมวันนี้</div>
                    <div className="text-2xl font-bold text-purple-600">
                      ฿0.00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu View */}
          <div
            className={`${
              activeView === "menu" ? "block" : "hidden lg:block"
            } h-full`}
          >
            <div className="p-4 lg:p-8 h-full flex flex-col">
              {/* Search and Controls */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="🔍 ค้นหาเมนูที่ต้องการ..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 pr-12 focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-base bg-white shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {search ? (
                        <button
                          onClick={() => setSearch("")}
                          className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ✕
                        </button>
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-400"
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
                      )}
                    </div>
                  </div>

                  <div className="hidden lg:flex gap-3">
                    <button
                      onClick={loadMenus}
                      disabled={loading}
                      className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50 min-w-[140px] flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        "🔄 รีเฟรช"
                      )}
                    </button>
                    <button
                      onClick={() => setShowAdd(true)}
                      className="px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg min-w-[140px]"
                    >
                      ➕ เพิ่มเมนู
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border">
                    <span className="text-gray-600">เมนูทั้งหมด: </span>
                    <span className="font-semibold text-purple-600">
                      {menus.length}
                    </span>
                  </div>
                  {search && (
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border">
                      <span className="text-gray-600">ผลการค้นหา: </span>
                      <span className="font-semibold text-blue-600">
                        {filteredMenus.length}
                      </span>
                    </div>
                  )}
                  {cart.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-xl shadow-sm border border-purple-200">
                      <span className="text-purple-600 font-semibold">
                        ตะกร้า: {cartItemsCount} รายการ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-purple-800 font-semibold text-lg">
                        กำลังโหลดเมนู...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {errMsg && (
                <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-red-800 font-semibold">
                        เกิดข้อผิดพลาด
                      </p>
                      <p className="text-red-600">{errMsg}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 pb-20 lg:pb-6">
                  {filteredMenus.map((menu) => (
                    <div key={menu.id} data-menu-id={menu.id}>
                      <MenuCard
                        menu={menu}
                        onAdd={() => addToCart(menu)}
                        className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                      />
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredMenus.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6">🍽️</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      {search ? "ไม่พบเมนูที่ค้นหา" : "ยังไม่มีเมนู"}
                    </h3>
                    <p className="text-gray-500 text-lg mb-6">
                      {search
                        ? `ลองค้นหาด้วยคำอื่น หรือดูเมนูทั้งหมด`
                        : "เริ่มต้นโดยการเพิ่มเมนูแรกของคุณ"}
                    </p>
                    {search ? (
                      <button
                        onClick={() => setSearch("")}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                      >
                        ดูเมนูทั้งหมด
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAdd(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                      >
                        ➕ เพิ่มเมนูแรก
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden lg:flex w-80 xl:w-96 border-l bg-white flex-col shadow-2xl">
          <CartSection
            cart={cart}
            cartTotal={cartTotal}
            cartItemsCount={cartItemsCount}
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
            clearCart={clearCart}
            checkout={checkout}
            loading={loading}
            lastOrderId={lastOrderId}
          />
        </div>

        {/* Mobile Cart View */}
        <div
          className={`lg:hidden ${
            activeView === "cart" ? "block" : "hidden"
          } h-screen bg-white`}
        >
          <CartSection
            cart={cart}
            cartTotal={cartTotal}
            cartItemsCount={cartItemsCount}
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
            clearCart={clearCart}
            checkout={checkout}
            loading={loading}
            lastOrderId={lastOrderId}
            isMobile={true}
          />
        </div>
      </div>

      {/* Add Menu Modal */}
      <AddMenuModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={loadMenus}
      />

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        {activeView === "menu" && cart.length > 0 && (
          <button
            onClick={() => setActiveView("cart")}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center relative"
          >
            <svg
              className="w-8 h-8"
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
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {cartItemsCount > 99 ? "99+" : cartItemsCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/* Cart Section Component */
function CartSection({
  cart,
  cartTotal,
  cartItemsCount,
  payMethod,
  setPayMethod,
  increaseQty,
  decreaseQty,
  removeItem,
  clearCart,
  checkout,
  loading,
  lastOrderId,
  isMobile = false,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🛒 ตะกร้าสินค้า</h2>
            <p className="text-purple-100 mt-1">
              {cartItemsCount} รายการ • ฿{cartTotal.toFixed(2)}
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2 hover:bg-purple-700 rounded-xl transition-colors"
              title="ล้างตะกร้า"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-6">
              <svg
                className="w-20 h-20 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              ตะกร้าว่างเปล่า
            </h3>
            <p className="text-gray-500">เลือกเมนูเพื่อเริ่มสั่งออเดอร์</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 shadow-sm border hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800 flex-1 pr-3 text-base leading-snug">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition-all"
                    title="ลบออก"
                  >
                    <svg
                      className="w-5 h-5"
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQty(item)}
                      className="w-10 h-10 rounded-2xl bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-all text-lg font-bold text-gray-600 hover:text-red-600"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-gray-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => increaseQty(item)}
                      className="w-10 h-10 rounded-2xl bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 flex items-center justify-center transition-all text-lg font-bold text-gray-600 hover:text-green-600"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      ฿{item.price} × {item.qty}
                    </div>
                    <div className="font-bold text-xl text-purple-600">
                      ฿{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Section */}
      {cart.length > 0 && (
        <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-6 space-y-6">
          {/* Payment Method */}
          <div>
            <label className="block font-bold text-gray-700 mb-4 text-lg">
              💳 วิธีชำระเงิน
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  payMethod === "cash"
                    ? "border-green-400 bg-green-50 text-green-800 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value="cash"
                  checked={payMethod === "cash"}
                  onChange={() => setPayMethod("cash")}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💵</span>
                  <span className="font-semibold">เงินสด</span>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  payMethod === "qr"
                    ? "border-blue-400 bg-blue-50 text-blue-800 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value="qr"
                  checked={payMethod === "qr"}
                  onChange={() => setPayMethod("qr")}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <span className="font-semibold">QR Pay</span>
                </div>
              </label>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">รายการทั้งหมด</span>
              <span className="font-semibold">{cartItemsCount} รายการ</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">ยอดรวมก่อนภาษี</span>
              <span className="font-semibold">฿{cartTotal.toFixed(2)}</span>
            </div>
            <div className="border-t-2 border-dashed border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-800">
                  ยอดรวมทั้งหมด
                </span>
                <span className="text-3xl font-bold text-purple-600">
                  ฿{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            disabled={cart.length === 0 || loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-2xl relative overflow-hidden"
            onClick={checkout}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>กำลังดำเนินการ...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">💰</span>
                <span>ชำระเงิน ({cartItemsCount} รายการ)</span>
              </div>
            )}
            <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity"></div>
          </button>

          {/* Last Receipt Button */}
          {lastOrderId && (
            <button
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all font-semibold shadow-lg flex items-center justify-center gap-3"
              onClick={() =>
                window.open(
                  `${api.defaults.baseURL}/api/order/receipt/${lastOrderId}`,
                  "_blank"
                )
              }
            >
              <span className="text-xl">🧾</span>
              <span>พิมพ์ใบเสร็จล่าสุด</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
