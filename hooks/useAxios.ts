"use client";

import axios from "axios";
import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const AxiosProvider = ({ children }: { children: React.ReactNode }) => {
  const { logout, getUser } = useAuthStore();
  const localStorageTokenKey = "auth";

  useEffect(() => {
    axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(localStorageTokenKey);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }

        return Promise.reject(error);
      }
    );

    getUser();
  }, []);

  return children;
};
