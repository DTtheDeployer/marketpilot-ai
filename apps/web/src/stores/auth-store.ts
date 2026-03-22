"use client";

import { create } from "zustand";
import { api, type AuthUser } from "@/lib/api-client";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("marketpilot_token")
        : null;

    if (!token) {
      set({ initialized: true, user: null, token: null });
      return;
    }

    try {
      const res = await api.getMe();
      set({
        user: res.data,
        token,
        initialized: true,
      });
    } catch {
      // Token invalid — clear it
      localStorage.removeItem("marketpilot_token");
      localStorage.removeItem("marketpilot_user");
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.login(email, password);
      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  signup: async (email, password, name, referralCode) => {
    set({ loading: true });
    try {
      const res = await api.signup(email, password, name, referralCode);
      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    api.logout();
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const res = await api.getMe();
      set({ user: res.data });
    } catch {
      // Ignore — user will be redirected on 401
    }
  },
}));
