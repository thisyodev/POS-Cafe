import axios from "axios";

const API_URL =
    process.env.REACT_APP_API_URL ||
    (window?.location?.origin?.includes("localhost:3001")
        ? "http://localhost:5000"
        : "/");

const api = axios.create({ baseURL: API_URL });

// --- Menu ---
export const fetchMenus = () => api.get("/api/menu"); // [{id,name,price,imageUrl}...]

// --- Order ---
export const createOrder = ({ tableNumber, items, total }) =>
    api.post("/api/order", { tableNumber, items, total });

export const getOrder = (orderId) => api.get(`/api/order/${orderId}`); // ต้องมีใน backend

export default api;
