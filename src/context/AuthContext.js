// bana banaya format for client side

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // ✅ Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      router.push("/error");
    } else {
      router.push("/");
    }
  };

  // Login
  const login = async (formData) => {
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      router.push("/error");
    } else {
      router.push("/dashboard");
    }
  };

  // Signup
  const signup = async (formData) => {
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
      router.push("/error");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    
    <AuthContext.Provider value={{ user, supabase, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}