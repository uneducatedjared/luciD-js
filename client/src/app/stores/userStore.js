// client/app/stores/userStore.js
import { create } from 'zustand';

/**
 * 用户存储：管理用户认证信息。
 */
export const UserStore = create((set, get) => ({
  // 用户是否已登录
  isLoggedIn: false,
  // 用户信息对象
  user: null, // { userId: string, username: string, email: string, userType: string }

  /**
   * 设置用户登录状态和用户信息
   * @param {object} userData - 用户数据
   */
  login: (userData) => set({ isLoggedIn: true, user: userData }),

  /**
   * 清除用户登录状态
   */
  logout: () => set({ isLoggedIn: false, user: null }),

  /**
   * 检查用户是否已登录（模拟，实际应验证token）
   * @returns {boolean}
   */
  checkAuth: () => {
    // 实际应用中，这里会检查 localStorage/cookies 中的 token 并验证
    // return !!localStorage.getItem('authToken');
    return get().isLoggedIn; // 暂时直接返回当前状态
  },
}));

