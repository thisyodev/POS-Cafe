import React, { useState } from "react";
import TableQRCode from "../components/TableQRCode";

export default function TableQRCodePage() {
  const [tableId, setTableId] = useState(1);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">สร้าง QR Code สำหรับโต๊ะ</h1>
      <label className="block mb-2 text-sm font-medium">หมายเลขโต๊ะ:</label>
      <input
        type="number"
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
        className="border rounded p-2 w-full mb-4"
        min="1"
      />
      <TableQRCode tableId={tableId} />
    </div>
  );
}
