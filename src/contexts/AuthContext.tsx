import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isEmailUnconfirmed: boolean;
  pendingEmail: string;
  pendingUserId: string;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; needsConfirmation: boolean; userId?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  confirmEmail: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsEmailUnconfirmed(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });

    if (!error) {
      setIsEmailUnconfirmed(true);
      setPendingEmail(email);
      setPendingPassword(password);
      if (data.user) {
        setPendingUserId(data.user.id);
      }
      return { error: null, needsConfirmation: true, userId: data.user?.id };
    }

    return { error, needsConfirmation: false };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && error.message.toLowerCase().includes('email not confirmed')) {
      setIsEmailUnconfirmed(true);
      setPendingEmail(email);
      setPendingPassword(password);
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  };

  const confirmEmail = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      const response = await fetch(`${supabaseUrl}/functions/v1/auth-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ user_id: pendingUserId, email: pendingEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to confirm email' };
      }

      setIsEmailUnconfirmed(false);
      setPendingEmail('');
      setPendingUserId('');

      if (pendingPassword) {
        const { error } = await supabase.auth.signInWithPassword({
          email: pendingEmail,
          password: pendingPassword,
        });
        setPendingPassword('');
        if (error) {
          return { error: 'Email confirmed but sign in failed. Please sign in manually.' };
        }
      }

      return { error: null };
    } catch {
      return { error: 'Failed to confirm email' };
    }
  };

  const signOut = async () => {
    setIsEmailUnconfirmed(false);
    setPendingEmail('');
    setPendingUserId('');
    setPendingPassword('');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isEmailUnconfirmed,
        pendingEmail,
        pendingUserId,
        signUp,
        signIn,
        resendConfirmation,
        confirmEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
