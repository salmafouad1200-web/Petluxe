import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token and user exist in local storage on startup
    const storedToken = localStorage.getItem('petluxe_token');
    const storedUser = localStorage.getItem('petluxe_user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('petluxe_token');
        localStorage.removeItem('petluxe_user');
        setLoading(false);
        return;
      }
      // Proactively fetch updated user profile from backend
      api.get('/profile')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('petluxe_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/login', { email, password });
      const { user: loggedUser, access_token } = response.data;
      
      localStorage.setItem('petluxe_token', access_token);
      localStorage.setItem('petluxe_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      toast.success('Connexion réussie ! Content de vous revoir.');
      return loggedUser;
    } catch (err) {
      console.error('[AuthContext] Login error details:', err);
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : (err.response?.data?.message || err.message || 'Erreur d\'authentification');
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const response = await api.post('/register', formData);
      const { user: registeredUser, access_token } = response.data;
      
      localStorage.setItem('petluxe_token', access_token);
      localStorage.setItem('petluxe_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      toast.success('Bienvenue sur PetLuxe !');
      return registeredUser;
    } catch (err) {
      console.error('[AuthContext] Register error details:', err);
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : (err.response?.data?.message || err.message || 'Erreur d\'inscription');
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const updateProfile = async (formData) => {
    setError(null);
    try {
      const response = await api.post('/profile', formData);
      const { user: updatedUser } = response.data;
      
      localStorage.setItem('petluxe_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profil mis à jour avec succès !');
      return updatedUser;
    } catch (err) {
      console.error('[AuthContext] Update profile error details:', err);
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : (err.response?.data?.message || err.message || 'Erreur de mise à jour');
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      // Logged out on backend or token already destroyed
    } finally {
      localStorage.removeItem('petluxe_token');
      localStorage.removeItem('petluxe_user');
      setUser(null);
      toast.success('Vous avez été déconnecté.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
