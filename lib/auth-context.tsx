import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthUser {
  id: number;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyTempPasswordAndSetNew: (userId: number, tempPassword: string, newPassword: string) => Promise<void>;
  updatePhone: (userId: number, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("auth_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/trpc/auth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      const userData = { id: data.id, email: data.email };
      setUser(userData);
      await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, phone?: string) => {
    try {
      const response = await fetch("/api/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      const userData = { id: data.id, email: data.email };
      setUser(userData);
      await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("auth_user");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await fetch("/api/trpc/auth.requestPasswordReset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password reset request failed");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const verifyTempPasswordAndSetNew = async (
    userId: number,
    tempPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await fetch("/api/trpc/auth.verifyTempPasswordAndSetNew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tempPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password verification failed");
      }
    } catch (error) {
      console.error("Verify temp password error:", error);
      throw error;
    }
  };

  const updatePhone = async (userId: number, phone: string) => {
    try {
      const response = await fetch("/api/trpc/auth.updatePhone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Phone update failed");
      }

      if (user) {
        const updatedUser = { ...user, phone };
        setUser(updatedUser);
        await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update phone error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        verifyTempPasswordAndSetNew,
        updatePhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
