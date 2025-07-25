// client/app/stores/designStore.js
import { create } from 'zustand';

/**
 * 设计存储：管理 Fabric.js 画布的设计状态、T恤颜色、当前活动对象等。
 */
export const DesignStore = create((set, get) => ({
  // 当前 Fabric.js 画布的 JSON 序列化数据
  canvas: null,  
  setCanvas: (canvas) => {
    set({ canvas });
  },

  designId: null,
  setDesignId: (id) => {
    set({ designId: id });
  },
  // 当前选择的 T 恤颜色，默认为白色
  tshirtColor: 'white', // 'white', 'black', 'pink'
  setTshirtColor: (color) => {
    set({ tshirtColor: color });
  },
  isEditing: true,
  setIsEditing: (flag) => {
    set({ isEditing: flag });
  },

  name: "Untitled Design",
  setName: (value) => {
    set({name: value});
  },

  /**
   * 保存当前设计（模拟，实际应调用后端API）
   * @returns {Promise<boolean>} - 保存是否成功
   */
  saveDesign: async () => {
    // 实际应用中，这里会调用后端 API 将 canvasJson 和 tshirtColor 保存到数据库
    // 例如：await fetch('/api/editor/save-design', { method: 'POST', body: JSON.stringify(get().canvasJson) });
    console.log('保存设计数据:', get().canvasJson);
    console.log('T恤颜色:', get().tshirtColor);
    // 模拟保存成功
    return true;
  },
}));

