import React from "react";

export default function MenuCard({ menu, onAdd, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex flex-col border border-gray-100 ${className}`}
    >
      <div className="relative overflow-hidden rounded-lg mb-3">
        <img
          src={
            menu.imageUrl || `https://picsum.photos/300/200?random=${menu.id}`
          }
          alt={menu.name}
          className="h-32 sm:h-40 w-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x200/E0E0E0/616161?text=${menu.name.substring(
              0,
              5
            )}`;
          }}
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs font-medium text-gray-700">
            {menu.category || "เครื่องดื่ม"}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">
          {menu.name}
        </h3>
        {menu.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {menu.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1 mb-3 text-xs">
          {menu.temperature !== "Both" && menu.temperature && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {menu.temperature === "Hot" ? "☕ ร้อน" : "🧊 เย็น"}
            </span>
          )}
          {menu.size && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {menu.size}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto pt-2">
        <span className="text-xl font-bold text-purple-600">
          {parseFloat(menu.price || 0).toFixed(2)} ฿
        </span>
        <button
          onClick={onAdd}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          + เพิ่ม
        </button>
      </div>
    </div>
  );
}
