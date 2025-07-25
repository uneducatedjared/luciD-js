'use client';

import { useEffect, useRef, useCallback, forwardRef } from 'react';
import { initializeFabric } from '@/app/lib/fabric-utils'; // Assuming this correctly initializes Fabric.js and returns a canvas instance
import { DesignStore } from '@/app/stores/designStore';
import { Image as fabricImage } from 'fabric'
/**
 * 中间画布区组件 (Fabric.js 相关的逻辑和渲染)
 * 功能：初始化 Fabric.js 画布，渲染 T 恤模型和用户上传的图片。
 * 支持图片拖拽、缩小/放大、旋转。
 * 状态： useRef 获取 canvas 元素；useEffect 初始化 Fabric.js 实例并监听对象变化;
 * 从 Zustand store 获取设计数据，并将画布状态更新回 Zustand
 */
export default forwardRef(function CanvasArea(props, ref) {
  const canvasRef = useRef(null); // canvas DOM container
  const canvasContainerRef = useRef(null); // Parent container of the canvas
  const fabricCanvasRef = useRef(null); // Stores the Fabric.js instance
  const initAttemptedRef = useRef(false); // Prevents duplicate initialization

  // Destructure from Zustand store
  const { tshirtColor, setCanvas, updateCanvasJson } = DesignStore(); // Assuming updateCanvasJson is a new action to store the canvas JSON
  const addFabricObject = DesignStore((state) => state.addFabricObject);

  // T-shirt base image path mapping
  const tshirtImages = {
    white: '/images/tshirt_base_white.png',
    black: '/images/tshirt_base_black.png',
    pink: '/images/tshirt_base_pink.png',
  };

  // --- Utility Functions ---

  // Customizes Fabric.js bounding box controls (assuming this function is defined elsewhere)
  // You'll need to define this function, e.g., in fabric-utils.js or directly here.
  const customizeBoundingBox = useCallback((canvas) => {
    if (!canvas) return;
    // Example customization (replace with your actual logic)
    // fabric.Object.prototype.set({
    //   borderColor: '#3f51b5',
    //   cornerColor: '#3f51b5',
    //   cornerSize: 10,
    //   transparentCorners: false,
    // });
    console.log('Fabric.js bounding box customization applied.');
  }, []);

  // Sets canvas dimensions to match the container
  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && fabricCanvasRef.current) {
      const container = canvasContainerRef.current;
      const { width, height } = container.getBoundingClientRect();

      fabricCanvasRef.current.setWidth(width);
      fabricCanvasRef.current.setHeight(height);
      fabricCanvasRef.current.renderAll();
      console.log(`Canvas resized to: ${width}x${height}`);
    }
  }, []);

  // Handles all canvas modification events and updates the store
  const handleCanvasChange = useCallback((e) => {
    console.log('Canvas changed:', e.type);
    if (fabricCanvasRef.current) {
      const canvasJson = fabricCanvasRef.current.toJSON();
      updateCanvasJson(canvasJson); // Update the serialized JSON in the store
      console.log('Canvas data serialized and updated in store:', canvasJson);

      // Example: add new objects to the store based on event type
      if (e.type === 'object:added') {
        addFabricObject(e.target);
      }
      // You might also want to trigger a save or history update here
    }
  }, [addFabricObject, updateCanvasJson]); // Added updateCanvasJson to dependencies

  // --- Effects ---

  // Initialize Fabric.js canvas
  useEffect(() => {
    const initCanvas = async () => {
      // Prevent re-initialization on re-renders
      if (typeof window === 'undefined' || !canvasRef.current || initAttemptedRef.current) {
        return;
      }

      initAttemptedRef.current = true; // Mark initialization attempt

      try {
        // Initialize Fabric.js canvas using the utility function
        const fabricCanvas = await initializeFabric(
          canvasRef.current,
          canvasContainerRef.current
        );

        if (!fabricCanvas) {
          console.error("Failed to initialize Fabric.js canvas");
          initAttemptedRef.current = false; // Allow re-attempt if initialization failed
          return;
        }

        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas); // Store the Fabric.js instance in Zustand
        console.log("Canvas initialized and instance set in store.");

        // Expose Fabric.js instance to parent component via ref
        if (ref) {
          ref.current = fabricCanvasRef.current;
          console.log('Canvas instance exposed via forwarded ref:', fabricCanvasRef.current);
        } else {
          console.warn('Forwarded ref not provided to CanvasArea. Cannot expose canvas instance.');
        }

        // Apply custom styles for controls
        customizeBoundingBox(fabricCanvas);

        // Set up event listeners for canvas changes
        fabricCanvas.on("object:added", handleCanvasChange);
        fabricCanvas.on("object:modified", handleCanvasChange);
        fabricCanvas.on("object:removed", handleCanvasChange);
        fabricCanvas.on("path:created", handleCanvasChange);
        fabricCanvas.on("selection:updated", handleCanvasChange); // Good to track selection changes
        fabricCanvas.on("selection:cleared", handleCanvasChange); // And cleared selections

        // Initial resize
        resizeCanvas();

      } catch (e) {
        console.error("Failed to initialize canvas:", e);
        initAttemptedRef.current = false; // Allow re-attempt if initialization failed
      }
    };

    initCanvas();

    // Cleanup function for useEffect
    return () => {
      if (fabricCanvasRef.current) {
        // Remove all event listeners to prevent memory leaks
        fabricCanvasRef.current.off("object:added", handleCanvasChange);
        fabricCanvasRef.current.off("object:modified", handleCanvasChange);
        fabricCanvasRef.current.off("object:removed", handleCanvasChange);
        fabricCanvasRef.current.off("path:created", handleCanvasChange);
        fabricCanvasRef.current.off("selection:updated", handleCanvasChange);
        fabricCanvasRef.current.off("selection:cleared", handleCanvasChange);

        // Dispose of the Fabric.js canvas instance to free up resources
        fabricCanvasRef.current.dispose();
        console.log('Fabric.js canvas disposed on component unmount.');
      }
    };
  }, [ref, customizeBoundingBox, handleCanvasChange, resizeCanvas, setCanvas]); // Dependencies for initCanvas

  // Listen for window resize to adjust canvas dimensions
  useEffect(() => {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      console.log('ResizeObserver disconnected.');
    };
  }, [resizeCanvas]);

  // Listen for T-shirt color changes and update background image
  useEffect(() => {
    if (tshirtColor && fabricCanvasRef.current) {
      const imagePath = tshirtImages[tshirtColor];
      if (imagePath) {
        fabricImage.fromURL(imagePath, (img) => {
          if (!fabricCanvasRef.current) return;

          // Scale image to fit canvas, maintaining aspect ratio
          img.scaleToWidth(fabricCanvasRef.current.getWidth());
          img.scaleToHeight(fabricCanvasRef.current.getHeight());

          // Set as background image
          fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current), {
            scaleX: fabricCanvasRef.current.width / img.width,
            scaleY: fabricCanvasRef.current.height / img.height,
            originX: 'left',
            originY: 'top',
          });
          console.log(`T-shirt background updated to: ${imagePath}`);
        }, { crossOrigin: 'anonymous' }); // Add crossOrigin for images loaded from different domains
      }
    }
  }, [tshirtColor, tshirtImages]); // Dependencies for color change

  // --- Render ---

  return (
    <div
      className="my-element relative w-full h-full flex items-center justify-center bg-gray-200 rounded-xl shadow-inner overflow-hidden"
      ref={canvasContainerRef}
    >
      <canvas ref={canvasRef} className="border border-gray-300 rounded-lg shadow-md"></canvas>
    </div>
  );
});