'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    // getUser() valida el token con el servidor (más seguro que getSession())
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(user ?? null);
        setLoadingAuth(false);
      }
    };

    initAuth();

    // Escucha cambios de sesión (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        // Si aún estaba cargando, terminar el loading
        setLoadingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sistema de Presencia (Radar de usuarios online)
  useEffect(() => {
    let presenceChannel;

    if (user) {
      presenceChannel = supabase.channel('online-users');

      presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            email: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });
    }

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);