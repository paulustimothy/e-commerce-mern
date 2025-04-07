import {create} from "zustand";
import axiosInstance from "../lib/axios";
import {toast} from "react-hot-toast";  

export const useUserStore = create((set, get) => ({
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
    },

    refreshToken: async () => {
        // prevent multiple refresh requests
        if(get().checkingAuth) return;

        set({checkingAuth: true})
        try {
            const res = await axiosInstance.post("/auth/refresh-token")
            set({checkingAuth: false})
            return res.data;
        } catch (error) {
            set({user: null, checkingAuth: false})
            throw error;
        }
    }
}))
    // Axios interceptor to refresh token
    let refreshPromise = null;

    axiosInstance.interceptors.response.use(
        (response) => response,
     async (error) => {
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                //if refresh is already in progress, wait for it to finish
                if(refreshPromise){
                    await refreshPromise;
                    return axiosInstance(originalRequest);
                }

                //start a new refresh token request
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                //if refresh fails, redirect to login
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
     })
