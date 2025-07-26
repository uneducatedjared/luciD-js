"use client";
import { debounce } from "lodash";
import { create } from "zustand";


/**
 * 设计存储：管理 Fabric.js 画布的设计状态、T恤颜色、当前活动对象以及自动保存
 */
export const designStore = create((set, get) => ({
  // 当前 Fabric.js 画布的 JSON 序列化数据
  canvas: null,  
  setCanvas: (canvas) => set({ canvas }),

  designId: null,
  setDesignId: (id) => set({ designId: id }),

  tshirtColor: 'white', // 'white', 'black', 'pink'
  setTshirtColor: (color) => set({ tshirtColor: color }),

  isEditing: true,
  setIsEditing: (flag) => set({ isEditing: flag }),

  name: "Untitled Design",
  setName: (value) => set({name: value}),

  saveToServer: async () => {
    const designId = get().designId;
    const canvas = get().canvas;

    if (!canvas || !designId) {
      console.log("No design ID Available or canvas instance is not available");
      return null;
    }

    try {
      const savedDesign = await saveCanvasState(canvas, designId, get().name);

      set({
        saveStatus: "Saved",
        isModified: false,
      });

      return savedDesign;
    } catch (e) {
      set({ saveStatus: "Error" });
      return null;
    }
  },

  debouncedSaveToServer: debounce(() => {
    get().saveToServer();
  }, 500),
}));

