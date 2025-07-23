import axios, { AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URI}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
