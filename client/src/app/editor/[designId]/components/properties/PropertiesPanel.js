'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DesignStore } from '@/app/stores/designStore';
import { useRouter } from 'next/navigation';
import { UserStore } from '@/app/stores/userStore';
/**
 * 右侧属性区组件
 * 功能：显示 T 恤颜色选项（黑色、白色、暗红色）。
 * 提供下单按钮
 * 状态：使用 useState 管理当前选中的 T 恤颜色，并将该颜色更新到 Zustand design store 中。
 * CanvasArea.js 的 useEffect 监听 designStore.tshirtColor 的变化，并相应地更新加载的T恤底图。
 * 下单按钮点击后，触发导航到 /order/place-order 路由
 * @param {object} props - 组件属性
 * @param {string} props.designId - 当前设计ID
 */
export default function PropertiesPanel({ designId }) {
  const router = useRouter();
  const { tshirtColor, setTshirtColor, canvas, saveDesign } = DesignStore();
  /**
   * 处理颜色选择
   * @param {string} color - 选中的颜色
   */
  const handleColorChange = (color) => {
    setTshirtColor(color);
  };

  /**
   * 处理下单操作
   */
  const { isLoggedIn } = UserStore();

  const handlePlaceOrder = async () => {
    // 检查用户是否登录
    if (!isLoggedIn) {
      // 重定向到登录页面，并携带当前设计ID作为参数
      router.push(`/user/login?redirect=/editor/${designId}`);
      return;
    }

    if (!canvas) {
      alert('请先设计您的T恤！');
      return;
    }
    try {
      // 1. 保存当前设计到后端（如果尚未保存或需要更新）
      const saveSuccess = await saveDesign(); // 确保设计已保存
      if (!saveSuccess) {
        throw new Error('保存设计失败');
      }

      // 2. 使用uuid生成唯一订单ID
      const orderId = uuidv4();

      // 3. 导航到下单页面
      router.push(`/order/place-order/${orderId}?designId=${designId}`);
      
    } catch (error) {
      alert(`${error.message}，无法下单。请重试。`);
      console.error('下单失败:', error);
    }
  };

  const colors = [
    { name: '白色', value: 'white', hex: '#FFFFFF' },
    { name: '黑色', value: 'black', hex: '#2C2C2C' },
    { name: '粉色', value: 'pink', hex: '#FFC0CB' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">T恤属性</h2>
      {/* 颜色选择 */}
      <div className="flex flex-col space-y-3">
        <label className="text-lg font-medium text-gray-700">选择T恤颜色:</label>
        <div className="grid grid-cols-3 gap-4">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                ${tshirtColor === color.value ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400'}
              `}
            >
              <div
                className="w-12 h-12 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
              ></div>
              <span className="mt-2 text-sm font-medium text-gray-800">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 下单按钮 */}
      <div className="mt-auto">
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          立即下单
        </button>
      </div>
    </div>
  );
}
