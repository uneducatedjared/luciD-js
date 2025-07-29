'use client';
import { create } from 'zustand';

// 初始状态不尝试读取localStorage（避免服务器端错误）
const initialState = { token: null, userId: null};

export const userStore = create((set) => ({
  ...initialState,
  // 在登录/登出时才访问localStorage
  login: (newToken, userId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', userId);
    }
    set({ token: newToken, userId: userId});
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    set({ token: null, userId: null });
  },
  // 添加一个初始化方法，在客户端挂载后调用
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      set({ token: token, userId: userId });
    }
  }
}));