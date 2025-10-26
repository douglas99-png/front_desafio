import React, { createContext, useContext, useState, useEffect } from "react";

// Criação do contexto
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("user");
      }
    }
        setLoading(false); 
  }, []);

  // Função de login
  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Função que verifica permissões
  const has = (permission) => {
    if (!user || !user.authorities) return false;
    return user.authorities.some(
      (p) => p.toUpperCase() === permission.toUpperCase()
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, has }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
