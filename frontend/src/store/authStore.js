import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        try {
          const d = jwtDecode(token);
          return d.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },
      isSuperUser: () => get().user?.role === 'SUPER_USER',
    }),
    { name: 'ad-manager-auth' }
  )
);

export default useAuthStore;
