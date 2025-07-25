'use client';

import { useState, useRef, useEffect} from 'react';
import { DesignStore } from '@/app/stores/designStore';
import { useRouter } from 'next/navigation';
import { addImageToCanvas } from '@/app/lib/fabric-utils.js';
/**
 * 左侧功能区组件
 * 功能：用户拖拽/放置或点击选择图片。FunctionPanel.js 使用 useState 管理选定的文件、清除画布、保存设计。
 * 状态：使用useState管理文件选择和上传进度，调用zustand store方法添加图片到画布
 * @param {object} props - 组件属性
 * @param {string} props.designId - 当前设计ID (Note: designId is not used in this component, consider removing if truly unused)
 */
export default function FunctionPanel({ canvasInstance }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    const canvasReady = !!canvasInstance && typeof canvasInstance.add === 'function';
    setIsCanvasReady(canvasReady);
    console.log('Canvas readiness changed:', canvasReady);
  }, [canvasInstance]);
  console.log('FunctionPanel props:', { canvasInstance, canvasInstanceAdd: canvasInstance?.add });
  const fileInputRef = useRef(null);
  const { clearDesign, saveDesign, canvas} = DesignStore();
  const router = useRouter(); // router is imported but not used in the provided code, consider removing if not needed.

  /**
   * 处理文件选择
   * @param {Event} event - 文件输入事件
   */
  const handleFileChange = (event) => {
    console.log('File input changed:', event);
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      handleAddImageToCanvas(file);
      console.log('Image file selected:', file);
    } else {
      setSelectedFile(null);
      alert('请选择一个图片文件。');
      console.log('Invalid file selected:', file);
    }
  };

  /**
   * 将选定的图片添加到 Fabric.js 画布
   * @param {File} imageFile - 图片文件
   */
  const handleAddImageToCanvas = (imageFile) => {
    if (!canvasInstance || typeof canvasInstance.add !== 'function') {
        console.error('Invalid Fabric canvas instance:', canvasInstance);
        return;
      }
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      addImageToCanvas(canvasInstance, imageUrl);
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white rounded-xl shadow-lg"> {/* Added padding, background, rounded corners, and shadow */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">设计工具</h2> {/* Increased font size, weight, and added text-center */}

      {/* 图片上传区 */}
      <div
        className={`group relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-300 ease-in-out
                   flex flex-col items-center justify-center min-h-[150px] ${!isCanvasReady ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'}`} // Added disabled state styles
      >
        <label htmlFor="file-upload" className="block w-full h-full cursor-pointer">
          <svg
            className={`mx-auto h-16 w-16 transition-colors duration-300 ${!isCanvasReady ? 'text-gray-400' : 'text-gray-400 group-hover:text-blue-600'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L40 32"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className={`mt-4 text-lg font-medium transition-colors duration-300 ${!isCanvasReady ? 'text-gray-500' : 'text-gray-700 group-hover:text-blue-800'}`}>
            {(!canvasInstance || typeof canvasInstance.add !== 'function') ? '画布加载中...' : (selectedFile ? selectedFile.name : '拖拽或点击上传图片')}
          </p>
          {!isCanvasReady ? null : (selectedFile && (
            <p className="text-sm text-gray-500 mt-1">已选择: {selectedFile.name}</p>
          ))}
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept="image/*"
            disabled={!isCanvasReady}
          />
        </label>
      </div>
    </div>
  );
}