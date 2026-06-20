import { supabase, isSupabaseConfigured } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
}

export const auth = {
  // Check if user is signed in
  async getUser(): Promise<AdminUser | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User'
        };
      }
      return null;
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nomichi_admin_session');
      if (stored) {
        return JSON.parse(stored) as AdminUser;
      }
    }
    return null;
  },

  // Sign in
  async signIn(email: string, password: string): Promise<{ user: AdminUser | null; error: Error | null }> {
    let supabaseError: Error | null = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const admin: AdminUser = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Admin User'
          };
          return { user: admin, error: null };
        }
        supabaseError = error;
      } catch (err: any) {
        supabaseError = err;
      }
    }

    // Mock mode authentication
    if (email === 'admin@thenomichi.com' && password === 'password123') {
      const admin: AdminUser = {
        id: 'user-1', // maps to Siddharth Sen in profiles seed
        email: 'siddharth@thenomichi.com',
        full_name: 'Siddharth Sen'
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nomichi_admin_session', JSON.stringify(admin));
      }
      console.warn('[Supabase Auth Fallback] Logged in using mock admin credentials.');
      return { user: admin, error: null };
    } else if (email !== 'admin@thenomichi.com' && email.endsWith('@thenomichi.com') && password.length >= 6) {
      // Allow other team members
      const name = email.split('@')[0];
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      const admin: AdminUser = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        full_name: `${capitalized} User`
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nomichi_admin_session', JSON.stringify(admin));
      }
      console.warn('[Supabase Auth Fallback] Logged in using mock team credentials.');
      return { user: admin, error: null };
    }

    return { 
      user: null, 
      error: supabaseError || new Error('Invalid email or password. Use email ending in @thenomichi.com (e.g. admin@thenomichi.com) and password (at least 6 chars) or admin@thenomichi.com / password123.') 
    };
  },

  // Sign out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nomichi_admin_session');
    }
  }
};
