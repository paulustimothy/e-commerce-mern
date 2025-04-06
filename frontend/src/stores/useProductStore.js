import { create } from "zustand";
import {toast} from "react-hot-toast";
import axiosInstance from "../lib/axios";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,

    setProducts: (products) => set({products}),
    //TODO learn about this
    createProduct: async (productData) => {
        set({loading: true});
        try {
            const res = await axiosInstance.post("/products", productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false,
            }));
            toast.success("Product created successfully");
        } catch (error) {
            toast.error("Failed to create product");
            set({loading: false});
        }
    },

    getAllProducts: async () => {
        set({loading: true});
        try {
            const res = await axiosInstance.get("/products");
            set({products: res.data.products, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error("Failed to fetch products");
        }
    },

    getProductsByCategory: async (category) => {
        set({loading: true});
        try {
            const res = await axiosInstance.get(`/products/category/${category}`);
            set({products: res.data.products, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error("Failed to fetch products");
        }
    },

    deleteProduct: async (productId) => {
        set({loading: true});
        try {
            await axiosInstance.delete(`/products/${productId}`);
            set((prevState) => ({
                products: prevState.products.filter((product) => product._id !== productId),
                loading: false,
            }))
            toast.success("Product deleted successfully");
        } catch (error) {
            set({loading: false});
            toast.error("Failed to delete product");
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({loading: true});
        try {
            const res = await axiosInstance.patch(`/products/${productId}`);
            set((prevState) => ({
                products: prevState.products.map((product) => 
                    product._id === productId ? {...product, isFeatured: res.data.isFeatured}
                    : product
                ),
                loading: false,
            }))
        } catch (error) {
            set({loading: false});
            toast.error("Failed to update product");
        }
    },
})) 
