import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CUSTOMER_URL } from "../utils/env";

/**
 * TableQRCode component
 * @param {number} tableId - The ID of the table that you want to generate the QR code for
 * @returns {React.ReactElement} The QR code component
 */
/**
 * This component generates a QR code that links to the order page for the given table ID.
 * It also renders the table ID and the full URL of the order page below the QR code.
 * There is a button to copy the URL to the clipboard.
 */
export default function TableQRCode({ tableId }) {
  if (!tableId)
    return <p className="text-center text-red-500">ไม่พบหมายเลขโต๊ะ</p>;

  const url = `${CUSTOMER_URL}/order/table/${tableId}`;

  return (
    <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
      <div className="p-4 bg-gray-50 rounded-lg">
        <QRCodeCanvas value={url} size={200} />
      </div>

      <p className="mt-4 text-lg font-semibold text-gray-800">โต๊ะ {tableId}</p>

      <p className="text-sm text-gray-500 break-words max-w-[250px]">{url}</p>

      {/* ปุ่มคัดลอกลิงก์ */}
      <button
        className="mt-3 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        onClick={() => {
          navigator.clipboard.writeText(url);
          alert("คัดลอกลิงก์เรียบร้อย");
        }}
      >
        คัดลอกลิงก์
      </button>
    </div>
  );
}
