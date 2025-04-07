import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    availableCoupons: [],
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    getCartItems: async () => {
        try {
            const res = await axiosInstance.get("/cart");
            set({cart: res.data.cartItems});
            get().calculateTotals();
        } catch (error) {
            set({cart: []});
            toast.error("Failed to fetch cart items");
        }
    },
    //TODO learn about this
    addToCart: async (product) => {
        try {
            await axiosInstance.post("/cart", {productId: product._id});
            toast.success("Product added to cart");

            set((prevState) => {
                const existingProduct = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingProduct
                ? prevState.cart.map((item) => (item._id === product._id ? {...item, quantity: item.quantity + 1} : item))
                : [...prevState.cart, {...product, quantity: 1}];
                return {cart: newCart};
            })
            get().calculateTotals();

        } catch (error) {
            toast.error("Failed to add product to cart");
        }
    },

    getCoupon: async () => {
        try {
            const res = await axiosInstance.get("/coupons");
            set({availableCoupons: res.data.coupons});
        } catch (error) {
            console.log("Error getting coupons", error.message);
        }
    },

    applyCoupon: async (couponCode) => {
        try {
            const res = await axiosInstance.post("/coupons/validate", {couponCode});    
            set ({coupon: res.data, isCouponApplied: true});
            get().calculateTotals();
        } catch (error) {
            toast.error("Failed to apply coupon");
        }
    },

    removeCoupon: () => {
        set({coupon: null, isCouponApplied: false});
        get().calculateTotals();
    },

    calculateTotals: () => {
        const {cart,coupon} = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        if(coupon){
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({total, subtotal});
    },

    removeFromCart: async (productId) => {
        try {
            await axiosInstance.delete('/cart', {data: {productId}});
            set((prevState) => ({cart: prevState.cart.filter((item) => item._id !== productId)}));
            get().calculateTotals();
            toast.success("Product removed from cart");
        } catch (error) {
            toast.error("Failed to remove product from cart");
        }
    },
//TODO error clearCart
    clearCart: async () => {
        set({cart: [], total: 0, subtotal: 0, coupon: null});
    },

    updateQuantity: async (productId, quantity) => {
        if(quantity === 0){
            get().removeFromCart(productId);
            return;
        }

        await axiosInstance.put(`/cart/${productId}`, {quantity});
        set((prevState) => ({
            cart: prevState.cart.map((item) => (item._id === productId ? {...item, quantity} : item))
        }))
        get().calculateTotals();
    },
 }))
