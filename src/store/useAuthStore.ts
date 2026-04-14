import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Database } from '@/integrations/supabase/types';

type Staff = Database['public']['Tables']['staff']['Row'];

interface AuthState {
  currentStaff: Staff | null;
  login: (staff: Staff) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentStaff: null,
      login: (staff) => set({ currentStaff: staff }),
      logout: () => set({ currentStaff: null }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
