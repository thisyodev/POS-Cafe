import React from "react";
import { ShoppingCart, Plus, Minus, Coffee } from "lucide-react";

export default function CartSummary({
  cart,
  updateQty,
  onCheckout,
  isVisible = true,
  onToggle = () => {},
}) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Mobile floating cart button
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        <button
          onClick={onToggle}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all duration-200"
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
        onClick={onToggle}
      />

      {/* Cart Content */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] sm:static sm:rounded-2xl sm:shadow-lg sm:max-h-none">
        {/* Handle for mobile */}
        <div className="flex justify-center pt-3 pb-2 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ตะกร้าของคุณ
            </h2>
            <button
              onClick={onToggle}
              className="sm:hidden text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                >
                  <img
                    src={item.imageUrl || "/no-image.png"}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-green-600 font-semibold text-sm">
                      ฿{Number(item.price).toFixed(0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="bg-white border border-gray-200 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>

                    <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="bg-white border border-gray-200 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      ฿{(item.price * item.qty).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total and Checkout */}
          {cart.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  ยอดรวม:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ฿{total.toFixed(0)}
                </span>
              </div>

              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 text-lg"
              >
                ชำระเงิน ({itemCount} รายการ)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
