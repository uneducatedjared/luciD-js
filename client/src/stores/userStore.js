'use client';
import { create } from 'zustand';

// 初始状态不尝试读取localStorage（避免服务器端错误）
const initialState = { token: null };

export const userStore = create((set) => ({
  ...initialState,
  // 在登录/登出时才访问localStorage
  login: (newToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
    set({ token: newToken });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ token: null });
  },
  // 添加一个初始化方法，在客户端挂载后调用
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      set({ token });
    }
  }
}));