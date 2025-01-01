import { toast } from "sonner";
import { create } from "zustand";
import { User } from "@prisma/client";

import useFileStore from "./fileStore";
import useEditorStore from "./editorStore";

import { axiosInstance } from "@/hooks/useAxios";
import { fetchFolders } from "@/actions/fileActions";

interface AuthState {
  currentUser: User | null;
  registerModal: boolean;
  loginModal: boolean;
  loading: boolean;

  getUser: () => void;
  updateToken: (token: string) => void;
  login: (email?: string, password?: string) => void;
  logout: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  registerModal: false,
  loginModal: false,
  loading: true,

  updateToken: async (token) => {
    localStorage.setItem("auth", token);
    get().getUser();
  },
  getUser: async () => {
    set({ loading: true });
    const token = localStorage.getItem("auth");

    if (!token) {
      set({ loading: false });

      return;
    }
    try {
      const { data: currentUser } = await axiosInstance.get("users/me");
      const folders = await fetchFolders();
      const {data: editorSettings} = await axiosInstance.get("editor-settings");

      useFileStore.setState({ folderStructure: folders });
      useEditorStore.getState().setEditorSettings(editorSettings);
      set({ currentUser: currentUser, loading: false });
    } catch (error) {
      toast.error(
        "Kullanıcı verileri alınırken bir hata oluştu, lütfen tekrar giriş yapın."
      );
      get().logout();
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    try {
      const { data } = await axiosInstance.post("users/login", {
        email: email ?? "testuser@example.com",
        password: password ?? "password123",
      });

      if (data.message) {
        toast.success(data.message);
      }

      if (data.token) {
        get().updateToken(data.token);
      }
    } catch (error) {
      console.error("Auth Login Error: ", error);
    }
  },
  logout: () => {
    localStorage.removeItem("auth");
    toast.success("Başarıyla çıkış yapıldı.");
    set({ currentUser: null });
  },
  openRegisterModal: () => set({ registerModal: true, loginModal: false }),
  closeRegisterModal: () => set({ registerModal: false }),
  openLoginModal: () => set({ loginModal: true, registerModal: false }),
  closeLoginModal: () => set({ loginModal: false }),
}));
