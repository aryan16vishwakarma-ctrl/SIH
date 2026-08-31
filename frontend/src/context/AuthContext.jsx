import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerFarmer as apiRegisterFarmer, registerBuyer as apiRegisterBuyer } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kc_token') || null);
  const [role, setRole] = useState(localStorage.getItem('kc_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('kc_user');
    const savedToken = localStorage.getItem('kc_token');
    const savedRole = localStorage.getItem('kc_role');

    if (savedUser && savedToken && savedRole) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    const userInfo = { id: data.user_id, name: data.name, phone: data.phone };

    setUser(userInfo);
    setToken(data.access_token);
    setRole(data.role);

    localStorage.setItem('kc_token', data.access_token);
    localStorage.setItem('kc_role', data.role);
    localStorage.setItem('kc_user', JSON.stringify(userInfo));

    return data;
  };

  const registerFarmer = async (farmerData) => {
    return await apiRegisterFarmer(farmerData);
  };

  const registerBuyer = async (buyerData) => {
    return await apiRegisterBuyer(buyerData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_role');
    localStorage.removeItem('kc_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, registerFarmer, registerBuyer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
