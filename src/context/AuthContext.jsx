import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, currentUser = null) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error al obtener perfil:', error);
      }

      const activeProfile = profileData
        ? {
            ...profileData,
            role: profileData.role || 'vendedor',
          }
        : { id: userId, role: 'vendedor' };

      setProfile(activeProfile);

      // Verificación especial para cuentas de Google u OAuth:
      // Si el rol es 'pendiente', verificamos si ya se le notificó al admin. 
      // Si no, invocamos la Edge Function 'new_user' para asegurar que llegue el correo.
      if (activeProfile.role === 'pendiente' && (currentUser || user)) {
        const targetUser = currentUser || user;
        const notificationKey = `google_alert_sent_${userId}`;
        
        // Revisamos si el proveedor o el origen fue Google (o si no se ha enviado el flag local)
        const isGoogleUser = targetUser?.app_metadata?.provider === 'google' || targetUser?.identities?.some(id => id.provider === 'google');
        
        if (isGoogleUser && !localStorage.getItem(notificationKey)) {
          try {
            await supabase.functions.invoke('send-notification', {
              body: {
                type: 'new_user',
                payload: {
                  usuarioNombre: activeProfile.full_name || targetUser.email,
                  usuarioEmail: targetUser.email
                }
              }
            });
            localStorage.setItem(notificationKey, 'true');
          } catch (notifErr) {
            console.error('Error enviando notificación de nuevo usuario Google:', notifErr);
          }
        }
      }

      return activeProfile;
    } catch (err) {
      console.error('Error en fetchProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      await fetchProfile(data.user.id, data.user);
    }

    setLoading(false);
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error cerrando sesión en Supabase:', err);
    } finally {
      setUser(null);
      setProfile(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signOut, fetchProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}