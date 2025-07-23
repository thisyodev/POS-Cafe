import React, { useState } from "react";
import { createMenu } from "../api";

export default function AddMenuModal({ isOpen, onClose, onAdded }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMenu({
        name,
        price: parseFloat(price || 0),
        image,
      });
      setName("");
      setPrice("");
      setImage("");
      onAdded?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("เพิ่มเมนูไม่สำเร็จ");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4">เพิ่มเมนูใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อเมนู</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Latte"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ราคา (บาท)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              URL รูป (ไม่ใส่ = random)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://....jpg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
