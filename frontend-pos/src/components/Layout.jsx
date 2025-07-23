import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "POS" },
    { to: "/orders", label: "Orders" },
    { to: "/report/daily-sales", label: "Reports" },
    { to: "/table-qrcode", label: "QR Tables" },
  ];

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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-700">
            {getPageTitle(location.pathname)}
          </h1>
          <span className="text-sm text-gray-500">พนักงาน: Admin</span>
        </header>

        {/* Content */}
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
