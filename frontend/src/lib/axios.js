import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.mode === "development" ? "http://localhost:5000/api/v1" : "/api",
    withCredentials: true, // send cookies when cross-site requests
})

export default axiosInstance;