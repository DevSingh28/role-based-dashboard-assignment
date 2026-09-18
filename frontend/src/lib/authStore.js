import { create } from "zustand";
import api from "./axios";

const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    setUser: (user) => {
        set({ user, loading: false });
    },

    checkAuth: async () => {
        try {
            const response = await api.get("/auth/me");
            set({ user: response.data.user, loading: false });
        } catch (error) {
            set({ user: null, loading: false });
        }
    },

    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        set({ user: response.data.user, loading: false });
        return response.data;
    },

    register: async (data) => {
        const response = await api.post("/auth/register", data);
        set({ user: response.data.user, loading: false });
        return response.data;
    },

    logout: async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            set({ user: null, loading: false });
        }
    },

    fetchInsights: async (region) => {
        const response = await api.get("/dashboard/insights", {
            params: region ? { region } : {}
        });
        return response.data.data;
    },

    fetchRevenue: async (region) => {
        const response = await api.get("/dashboard/revenue", {
            params: region ? { region } : {}
        });
        return response.data.data;
    }
}));

export default useAuthStore;