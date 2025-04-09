import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useOrderStore = create((set) => ({
    orders: [],
    loading: false,
    currentOrder: null,

    getAllOrders: async () => {
        set({loading: true});
        try {
            const res = await axiosInstance.get("/orders");
            set({orders: res.data.orders, loading: false});
        } catch (error) {
            set({loading: false});
            console.log("Error getting all orders", error.message);
        }
    },

    getOrderById: async (orderId) => {
        set({loading: true});
        try {
            const res = await axiosInstance.get(`/orders/${orderId}`);
            set({currentOrder: res.data.order, loading: false});
        } catch (error) {
            set({loading: false});
            console.log("Error getting order by id", error.message);
        }
    }
}))
