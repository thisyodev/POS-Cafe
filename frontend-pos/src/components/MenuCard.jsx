import React from "react";

export default function MenuCard({ menu, onAdd }) {
    return (
      <div className="bg-white rounded shadow p-3 flex flex-col">
        <img
          src={menu.imageUrl}
          alt={menu.name}
          className="h-40 object-cover rounded mb-2"
        />
        <h3 className="font-semibold text-lg">{menu.name}</h3>
        <p className="text-sm text-gray-600">{menu.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-purple-700 font-bold">
            {parseFloat(menu.price).toFixed(2)} ฿
          </span>
          <button
            onClick={onAdd}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            เพิ่ม
          </button>
        </div>
        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
          <span className="px-1 border rounded">{menu.category}</span>
          {menu.temperature !== "Both" && (
            <span>{menu.temperature === "Hot" ? "☕ ร้อน" : "❄️ เย็น"}</span>
          )}
          <span>Size: {menu.size}</span>
        </div>
      </div>
    );
}
