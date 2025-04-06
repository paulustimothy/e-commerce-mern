import {create} from "zustand";
import axiosInstance from "../lib/axios";
import {toast} from "react-hot-toast";  

export const useUserStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({name, email, password, confirmPassword}) => {
        set({loading: true})

        if(password !== confirmPassword) {
            set({loading: false})
            return toast.error("Passwords do not match")
        }

        try {
            const res = await axiosInstance.post("/auth/signup", {name, email, password});
            set({user: res.data, loading: false})
            toast.success("Account created successfully")
        } catch (error) {
            set({loading: false})
            toast.error(error.response.data.message || "Something went wrong")
        }
    },

    login: async ({emailOrName, password}) => {
        set({loading: true})

        try {
            const res = await axiosInstance.post("/auth/login", {
                email: emailOrName,
                name: emailOrName,
                password,
            })
            set({user: res.data.user, loading: false})
            toast.success("Login successful")
        } catch (error) {
            set({loading: false})
            toast.error(error.response.data.message || "Something went wrong")
        }
    },
    
    checkAuth: async () => {
        set({checkingAuth: true})
        try {
            const res = await axiosInstance.get("/auth/profile")
            set({user: res.data, checkingAuth: false})
        } catch {
            set({user: null, checkingAuth: false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({user: null})
            toast.success("Logged out successfully")
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong")
        }   
    }

    //TODO implement axios interceptor to refresh token
}))
