import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, refresh as apiRefresh } from '../api/authApi';
import { setAccessToken, registerAuthErrorCallback } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef(null);

  // Sync access token to memory reference and axios instance helper
  const updateAccessToken = (token) => {
    accessTokenRef.current = token;
    setAccessToken(token);
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await apiLogin(credentials);
      updateAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('voxel_active_session', 'true');
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await apiRegister(userData);
      updateAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('voxel_active_session', 'true');
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      updateAccessToken(null);
      setUser(null);
      localStorage.removeItem('voxel_active_session');
      setLoading(false);
    }
  };

  // Rehydrate session
  useEffect(() => {
    let active = true;

    // Handle token refresh failures (redirect or session clear)
    registerAuthErrorCallback(() => {
      if (active) {
        accessTokenRef.current = null;
        setUser(null);
        localStorage.removeItem('voxel_active_session');
        setLoading(false);
      }
    });

    const initAuth = async () => {
      if (localStorage.getItem('voxel_active_session') !== 'true') {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        // Proactively refresh first to get a token and avoid a 401 log on /me
        const refreshData = await apiRefresh();
        updateAccessToken(refreshData.accessToken);

        const currentUser = await getMe();
        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        console.log('Session rehydration failed or no session active.');
        localStorage.removeItem('voxel_active_session');
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
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
