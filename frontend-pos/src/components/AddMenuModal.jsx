import { useState } from "react";
import { createMenu } from "../api";

export default function AddMenuModal({ isOpen, onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    imageUrl: "",
    description: "",
    category: "เครื่องดื่ม",
    temperature: "Both",
    size: "Regular",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      imageUrl: "",
      description: "",
      category: "เครื่องดื่ม",
      temperature: "Both",
      size: "Regular",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const menuData = {
        name: formData.name,
        price: parseFloat(formData.price || 0),
        imageUrl:
          formData.imageUrl ||
          `https://picsum.photos/300/200?random=${Date.now()}`,
        description: formData.description,
        category: formData.category,
        temperature: formData.temperature,
        size: formData.size,
      };

      // สมมติว่ามี createMenu function
      await api.post("/api/menu", menuData);

      resetForm();
      onAdded?.();
      onClose();
    } catch (err) {
      console.error("Error creating menu:", err);
      alert("เพิ่มเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">เพิ่มเมนูใหม่</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
              disabled={loading}
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ชื่อเมนู *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              placeholder="เช่น Americano, Latte, Cappuccino"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ราคา (บาท) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              required
              placeholder="60.00"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              rows="3"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="รายละเอียดเมนู..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                หมวดหมู่
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                disabled={loading}
              >
                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                <option value="กาแฟ">กาแฟ</option>
                <option value="ชา">ชา</option>
                <option value="เค้ก">เค้ก</option>
                <option value="ขนม">ขนม</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                อุณหภูมิ
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={formData.temperature}
                onChange={(e) =>
                  handleInputChange("temperature", e.target.value)
                }
                disabled={loading}
              >
                <option value="Both">ทั้งร้อน/เย็น</option>
                <option value="Hot">ร้อนเท่านั้น</option>
                <option value="Cold">เย็นเท่านั้น</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ขนาด
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={formData.size}
              onChange={(e) => handleInputChange("size", e.target.value)}
              disabled={loading}
            >
              <option value="Small">Small</option>
              <option value="Regular">Regular</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL รูปภาพ
              <span className="text-gray-500 font-normal">
                (ไม่ใส่ = สุ่มรูปอัตโนมัติ)
              </span>
            </label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังบันทึก...
                </>
              ) : (
                "+ เพิ่มเมนู"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
