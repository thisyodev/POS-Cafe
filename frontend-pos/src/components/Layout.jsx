import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const navLinks = [
    { to: "/", label: "POS" },
    { to: "/orders", label: "Orders" },
    { to: "/report/daily-sales", label: "Reports" },
    { to: "/table-qrcode", label: "QR Tables" },
  ];

  // Placeholder for user data. In a real app, this would come from authentication context.
  const user = { username: "Admin" }; // Simplified for demonstration

  // Function to determine page title based on path
  const getPageTitle = (path) => {
    if (path === "/") return "POS (หน้าร้าน)";
    if (path.startsWith("/orders")) return "จัดการออเดอร์";
    if (path.startsWith("/report")) return "รายงานยอดขาย";
    if (path.startsWith("/table-qrcode")) return "QR Code โต๊ะ";
    return "POS-Cafe";
  };

  // Simplified logout for demonstration, without window.confirm
  const handleLogout = () => {
    // In a real application, you would handle actual logout logic here
    // e.g., clearing tokens, redirecting to login page.
    // For this example, we'll just log a message.
    console.log("User logged out (simulated)");
    // navigate("/login"); // Uncomment in a real app
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 font-inter antialiased">
      {/* Mobile Header (visible on small screens) */}
      <header className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-200"
            aria-label="Toggle sidebar"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
        <span className="text-sm text-gray-600">
          พนักงาน: {user?.username || "Admin"}
        </span>
      </header>

      {/* Sidebar (hidden on mobile by default, toggled by button) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-purple-700 to-indigo-800 text-white shadow-xl
        transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0
        transition-transform duration-300 ease-in-out lg:relative lg:flex lg:flex-col`}
      >
        {/* Close button for mobile */}
        <div className="p-4 flex justify-end lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-purple-100 hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Close sidebar"
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

        <div className="p-6 text-center border-b border-purple-600/50">
          <h2 className="text-3xl font-extrabold tracking-tight">POS-Cafe</h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click for mobile
              className={`flex items-center gap-3 p-3 rounded-xl text-lg font-medium transition-all duration-200
                ${
                  location.pathname === link.to ||
                  (link.to !== "/" && location.pathname.startsWith(link.to))
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }
                focus:outline-none focus:ring-2 focus:ring-purple-300`}
            >
              {link.label === "POS" && (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
              )}
              {link.label === "Orders" && (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  ></path>
                </svg>
              )}
              {link.label === "Reports" && (
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
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  ></path>
                </svg>
              )}
              {link.label === "QR Tables" && (
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
                    d="M12 4.354V4a2 2 0 100 4m-3 12h6m-6 0H6a2 2 0 01-2-2V6a2 2 0 012-2h2m0 10v-2m0 0h.01M12 12h4.354a2 2 0 100 4m-3-4H12m0 0V9a2 2 0 100 4"
                  ></path>
                </svg>
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header (visible on larger screens) */}
        <header className="hidden lg:flex bg-white shadow-sm p-6 items-center justify-between border-b">
          <h1 className="text-3xl font-bold text-gray-800">
            {getPageTitle(location.pathname)}
          </h1>
          <span className="text-lg text-gray-600">
            พนักงาน: {user?.username || "Admin"}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
