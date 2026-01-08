import { create } from 'zustand'

export interface User {
 id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string | null;
}

interface AuthStoreInterface {
  token: string | null
  authenticated: boolean
  user: User | null
  setAuthentication: (val: boolean) => void
  login: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStoreInterface>((set) => ({
  token: null,
  authenticated: false,
  user: null,
  setAuthentication: (val) => set({ authenticated: val }),
  login: (token, user) => set({ token, user}),
  setUser: (user) => set({ user }),
  logout: () => set({ token: null, user: null, authenticated: false }),
}))