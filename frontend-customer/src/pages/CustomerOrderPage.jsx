import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Coffee, ShoppingCart } from "lucide-react";
import MenuItemCard from "../components/MenuItemCard";
import CartSummary from "../components/CartSummary";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function CustomerOrderPage() {
  const { tableId } = useParams();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [addingItems, setAddingItems] = useState(new Set());
  const navigate = useNavigate();

  // โหลดเมนู
  useEffect(() => {
    axios
      .get(`${API_URL}/api/menu`)
      .then((res) => {
        // แปลง price ทุกเมนูเป็น number
        const fixedMenus = res.data.map((menu) => ({
          ...menu,
          price: Number(menu.price) || 0,
        }));
        setMenus(fixedMenus);
      })
      .catch((err) => console.error("โหลดเมนูล้มเหลว", err));
  }, []);

  // เพิ่มสินค้าเข้าตะกร้าพร้อม animation
  const addToCart = (menu) => {
    setAddingItems((prev) => new Set([...prev, menu.id]));

    setTimeout(() => {
      setCart((prev) => {
        const exist = prev.find((item) => item.id === menu.id);
        if (exist) {
          return prev.map((item) =>
            item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
          );
        }
        return [...prev, { ...menu, qty: 1 }];
      });

      setAddingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(menu.id);
        return newSet;
      });
    }, 300);
  };

  // อัปเดตจำนวนสินค้าในตะกร้า
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(qty, 0) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Checkout
  const checkout = async () => {
    try {
      const orderData = {
        tableNumber: tableId,
        total: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
        items: cart.map((i) => ({
          menu_id: i.id,
          quantity: i.qty,
          price: i.price,
        })),
      };

      const res = await axios.post(`${API_URL}/api/order`, orderData);
      alert("สั่งออเดอร์สำเร็จ! 🎉");
      setCart([]);
      setCartVisible(false);
      navigate(`/order/${res.data.orderId}/status`);
    } catch (err) {
      console.error("สั่งออเดอร์ไม่สำเร็จ", err);
      alert("เกิดข้อผิดพลาดในการสั่งออเดอร์");
    }
  };

  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Coffee className="w-8 h-8 text-orange-500" />
                สั่งอาหารสำหรับโต๊ะ {tableId}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                เลือกเมนูที่คุณต้องการ
              </p>
            </div>

            {/* Desktop Cart Toggle */}
            <button
              onClick={() => setCartVisible(!cartVisible)}
              className="hidden sm:flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              ตะกร้า ({itemCount})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {menus.map((menu) => (
                <MenuItemCard
                  key={menu.id}
                  menu={menu}
                  onAdd={() => addToCart(menu)}
                  isAdding={addingItems.has(menu.id)}
                />
              ))}
            </div>

            {/* Spacer for mobile fixed cart */}
            <div className="h-24 sm:hidden" />
          </div>

          {/* Desktop Cart */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <CartSummary
                cart={cart}
                updateQty={updateQty}
                onCheckout={checkout}
                isVisible={true}
                onToggle={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Cart */}
      <div className="lg:hidden">
        <CartSummary
          cart={cart}
          updateQty={updateQty}
          onCheckout={checkout}
          isVisible={cartVisible}
          onToggle={() => setCartVisible(!cartVisible)}
        />
      </div>
    </div>
  );
}
