// axiosConfig.ts (or .tsx)
import axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

export default axiosInstance;
