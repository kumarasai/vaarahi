import { create } from 'zustand';
import api from '../services/api';

const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, accessToken, refreshToken, loading: false });
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: errMsg, loading: false });
      return { success: false, message: errMsg };
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, accessToken, refreshToken, loading: false });
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      set({ error: errMsg, loading: false });
      return { success: false, message: errMsg };
    }
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  clearError: () => set({ error: null })
}));
