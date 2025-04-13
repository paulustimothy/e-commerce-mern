import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV ? "http://localhost:5000/api" : "/api",
    withCredentials: true, // send cookies when cross-site requests
    headers: {
        'Content-Type': 'application/json'
    }
})

export default axiosInstance;