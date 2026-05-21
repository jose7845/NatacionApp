import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  pendingConfirmation: boolean;
  pendingEmail: string | null;
  signUp: (email: string, password: string, name: string, role: 'swimmer' | 'coach') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearPending: () => void;
}

async function ensureProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, string> }): Promise<User> {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (existing) return existing as User;

  const meta = authUser.user_metadata || {};
  const profile = {
    id: authUser.id,
    email: authUser.email || '',
    name: meta.name || 'Usuario',
    role: meta.role || 'swimmer',
  };

  const { data: created } = await supabase
    .from('users')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (created) return created as User;

  return { ...profile, created_at: new Date().toISOString() } as User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  pendingConfirmation: false,
  pendingEmail: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = await ensureProfile(session.user);
        set({ user, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null });
      } else if (session?.user && !get().user) {
        const user = await ensureProfile(session.user);
        set({ user });
      }
    });
  },

  signUp: async (email, password, name, role) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo crear el usuario');

      if (data.session) {
        const user = await ensureProfile(data.user);
        set({ user, loading: false });
      } else {
        set({ loading: false, pendingConfirmation: true, pendingEmail: email });
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Tu email aún no fue confirmado. Revisá tu casilla de correo (incluyendo spam) y hacé clic en el enlace de confirmación.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email o contraseña incorrectos.');
        }
        throw error;
      }

      const user = await ensureProfile(data.user);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  clearPending: () => set({ pendingConfirmation: false, pendingEmail: null }),
}));
