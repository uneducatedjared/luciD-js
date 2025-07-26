"use client"
import { useEffect, useRef } from "react";
import { initializeFabric, setBackgroundImage, customizeBoundingBox } from "@/fabric/fabric-utils";
import { designStore} from "@/stores/designStore";

export default function Canvas() {
  const canvasRef = useRef(null); // 用来操作底层canvas组件
  const canvasContainerRef = useRef(null); // 装载canvas的父组件
  const fabricCanvasRef = useRef(null); // 存储fabric js 本身
  const initAttemptedRef = useRef(false); // 检查画布是否被初始化过
  const { setCanvas, markAsModified} = designStore();

  // 和画布有关的useEffect
  useEffect(() => {
    // 1. 定义画布清理函数，提示用户如果未登录设计数据可能被清理
    const cleanUpCanvas = () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.off("object:added");
          fabricCanvasRef.current.off("object:modified");
          fabricCanvasRef.current.off("object:removed");
          fabricCanvasRef.current.off("path:created");
        } catch (e) {
          console.error("Error remvoing event listeners", e);
        }
        try {
          fabricCanvasRef.current.dispose();
        } catch (e) {
          console.error("Error disposing canvas", e);
        }
        fabricCanvasRef.current = null;
        setCanvas(null);
      }
    };

    // 初始化之前去除监听方法
    cleanUpCanvas();
    initAttemptedRef.current = false; // 准备初始化

    // 开始初始化
    const initcanvas = async() => {
      // 确保在浏览器环境
      if (
        typeof window === "undefined" || // 修复：这里应该是字符串比较
        !canvasRef.current ||
        initAttemptedRef.current
      ) {
        return;
      }
      initAttemptedRef.current = true;
      try {
        console.log("开始初始化Canvas...");
        const fabricCanvas = await initializeFabric(
          canvasRef.current,
          canvasContainerRef.current
        );
        if (!fabricCanvas) {
          console.error("Failed to initialize Fabric.js canvas");
          return;
        }
        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas); // 初始化fabrics的数据
        console.log("Canvas 初始化成功，尺寸:", fabricCanvas.width, "x", fabricCanvas.height);

        // 等待canvas完全准备好再设置背景
        setTimeout(async () => {
          try {
            console.log("开始设置背景图片...");
            await setBackgroundImage(fabricCanvas, 'white');
            console.log("背景设置成功");
            customizeBoundingBox(fabricCanvas);
          } catch (error) {
            console.error("设置背景图片时出错:", error);
          }
        }, 100);

        //set up event listeners
        const handleCanvasChange = () => {
          markAsModified();
        };
        fabricCanvas.on("object:added", handleCanvasChange);
        fabricCanvas.on("object:modified", handleCanvasChange);
        fabricCanvas.on("object:removed", handleCanvasChange);
        fabricCanvas.on("path:created", handleCanvasChange);
      } catch(e){
        console.log("canvas 初始化失败", e);
      }
    };
    
    // 稍微增加延迟确保DOM完全准备好
    const timer = setTimeout(() => {
      initcanvas();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanUpCanvas();
    };
  }, []) //仅在组件挂载时执行一次

    return (
    <div
      className="relative w-full h-[600px] overflow-auto flex items-center justify-center"
      ref={canvasContainerRef}
    >
      <canvas 
        ref={canvasRef} 
        style={{ border: '1px solid #ccc' }} // 添加边框便于调试
      />
    </div>
    )
}