import React from "react";
import { Plus, Star, Clock } from "lucide-react";

export default function MenuItemCard({ menu, onAdd, isAdding = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <img
          src={menu.imageUrl || "/no-image.png"}
          alt={menu.name}
          className="h-32 sm:h-36 md:h-40 w-full object-cover"
          loading="lazy"
        />

        {/* Rating Badge */}
        {menu.rating && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {menu.rating}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1">
          {menu.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg sm:text-xl font-bold text-green-600">
            ฿{Number(menu.price).toFixed(0)}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            5-10 นาที
          </span>
        </div>

        <button
          onClick={onAdd}
          disabled={isAdding}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
        </button>
      </div>
    </div>
  );
}
