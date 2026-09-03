'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoadingAuth(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // NUEVO: Sistema de Presencia (Radar de usuarios online)
  useEffect(() => {
    let presenceChannel;
    
    if (user) {
      // Nos unimos al canal global de usuarios online
      presenceChannel = supabase.channel('online-users');
      
      presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Avisamos al servidor quiénes somos y que entramos
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