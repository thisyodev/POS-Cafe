import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: "POS" },
    { to: "/orders", label: "Orders" },
    { to: "/report/daily-sales", label: "Reports" },
    { to: "/table-qrcode", label: "QR Tables" },
  ];

  const handleLogout = () => {
    if (window.confirm("ต้องการออกจากระบบหรือไม่?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md flex flex-col">
        <div className="p-4 text-xl font-bold text-purple-600">POS-Cafe</div>
        <nav className="flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2 rounded hover:bg-purple-100 ${
                location.pathname === link.to
                  ? "bg-purple-200 font-semibold"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-700">
            {getPageTitle(location.pathname)}
          </h1>
          <span className="text-sm text-gray-500">
            พนักงาน: {user?.username || "Admin"}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(path) {
  if (path === "/") return "POS (หน้าร้าน)";
  if (path.startsWith("/orders")) return "จัดการออเดอร์";
  if (path.startsWith("/report")) return "รายงานยอดขาย";
  if (path.startsWith("/table-qrcode")) return "QR Code โต๊ะ";
  return "POS-Cafe";
}
