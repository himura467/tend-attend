"use client";

import React, { createContext, useContext } from "react";

interface AuthContextValue {
  accountId: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  accountId: string | null;
  children: React.ReactNode;
}

export const AuthProvider = ({ accountId, children }: AuthProviderProps): React.JSX.Element => {
  return <AuthContext.Provider value={{ accountId }}>{children}</AuthContext.Provider>;
};
