import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  ArrowLeft,
  RefreshCw,
  Receipt,
  Timer,
} from "lucide-react";
import { getOrder } from "../api";

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getOrder(orderId);
        if (mounted) {
          setData(res.data);
          setLastUpdated(new Date());
          setErr("");
        }
      } catch (e) {
        console.error(e);
        if (mounted) setErr("โหลดสถานะออเดอร์ไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const status = data?.order?.status || "pending";
  const tableNumber = data?.order?.table_number || 1;
  const total = data?.order?.total || 0;
  const createdAt = data?.order?.created_at;

  // Status configuration
  const getStatusConfig = (currentStatus) => {
    const configs = {
      pending: {
        icon: <Clock className="w-12 h-12" />,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        text: "รอรับออเดอร์",
        description: "ร้านอาหารกำลังตรวจสอบออเดอร์ของคุณ",
        progress: 25,
      },
      preparing: {
        icon: <ChefHat className="w-12 h-12" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        text: "กำลังทำอาหาร",
        description: "เชฟกำลังปรุงอาหารสำหรับคุณ",
        progress: 50,
      },
      ready: {
        icon: <UtensilsCrossed className="w-12 h-12" />,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        text: "พร้อมเสิร์ฟ",
        description: "อาหารพร้อมแล้ว กำลังจัดส่งไปยังโต๊ะ",
        progress: 75,
      },
      served: {
        icon: <CheckCircle className="w-12 h-12" />,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        text: "เสิร์ฟแล้ว",
        description: "อาหารได้เสิร์ฟไปยังโต๊ะของคุณแล้ว",
        progress: 100,
      },
      paid: {
        icon: <Receipt className="w-12 h-12" />,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        text: "ชำระเงินแล้ว",
        description: "ขอบคุณที่ใช้บริการ",
        progress: 100,
      },
      canceled: {
        icon: <XCircle className="w-12 h-12" />,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        text: "ยกเลิกออเดอร์",
        description: "ออเดอร์ได้ถูกยกเลิกแล้ว",
        progress: 0,
      },
    };

    return configs[currentStatus] || configs.pending;
  };

  const statusConfig = getStatusConfig(status);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstimatedTime = () => {
    if (status === "served" || status === "paid") return null;
    if (status === "preparing") return "ประมาณ 15-20 นาที";
    if (status === "ready") return "ประมาณ 2-5 นาที";
    return "ประมาณ 20-25 นาที";
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <RefreshCw className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">กำลังโหลดสถานะออเดอร์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/order/table/${tableNumber}`}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                ออเดอร์ #{orderId}
              </h1>
              <p className="text-gray-600 text-sm">
                โต๊ะ {tableNumber} • {createdAt ? formatTime(createdAt) : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">อัปเดตล่าสุด</p>
              <p className="text-sm font-medium text-gray-700">
                {formatTime(lastUpdated.toISOString())}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{err}</p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div
          className={`bg-white rounded-3xl shadow-lg border-2 ${statusConfig.borderColor} p-6 sm:p-8 mb-6`}
        >
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>รอรับ</span>
              <span>กำลังทำ</span>
              <span>พร้อมเสิร์ฟ</span>
              <span>เสิร์ฟแล้ว</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  status === "canceled"
                    ? "bg-red-500"
                    : "bg-gradient-to-r from-orange-500 to-green-500"
                }`}
                style={{ width: `${statusConfig.progress}%` }}
              />
            </div>
          </div>

          {/* Status Icon and Text */}
          <div className="text-center mb-6">
            <div
              className={`${statusConfig.bgColor} ${statusConfig.color} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              {statusConfig.icon}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {statusConfig.text}
            </h2>

            <p className="text-gray-600 mb-4">{statusConfig.description}</p>

            {/* Estimated Time */}
            {getEstimatedTime() && (
              <div className="bg-gray-50 rounded-xl p-3 inline-flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  เวลาโดยประมาณ: {getEstimatedTime()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {data?.items?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              รายการอาหาร
            </h3>

            <div className="space-y-3">
              {data.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ฿{Number(item.price || 0).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      x{item.qty || item.quantity}
                    </span>
                    <p className="text-sm text-green-600 font-medium">
                      ฿
                      {(
                        (item.price || 0) * (item.qty || item.quantity || 1)
                      ).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  ยอดรวม:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ฿{Number(total).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to={`/order/table/${tableNumber}`}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับไปเมนู
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            รีเฟรช
          </button>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            🔄 อัปเดตอัตโนมัติทุก 5 วินาที
          </p>
        </div>
      </div>
    </div>
  );
}
