'use client'; // 标记为客户端组件

import { useEffect, useRef, useState} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import FunctionPanel from './components/sidebar/FunctionPanel';
import CanvasArea from './components/canvas/CanvasArea';
import PropertiesPanel from './components/properties/PropertiesPanel';
import { DesignStore } from '@/app/stores/designStore'; // 假设 @/app/stores 路径已配置
import { use } from 'react'; //用于同步读取promise的结果

/**
 * 编辑器主页面
 * 协调布局，渲染 FunctionPanel、CanvasArea 和 PropertiesPanel。
 * @param {object} props - 页面属性
 * @param {object} props.params - 路由参数，包含 designId
 */
export default function EditorPage({ params }) {
    const resolvedParams = use(params);
    const designId = resolvedParams.designId;
    const router = useRouter();
      const [canvasInstance, setCanvasInstance] = useState(null);
    const {
      canvas,
      setCanvas,
      setDesignId
    } = DesignStore();

  useEffect(() => {
    // 如果没有 designId，生成一个新的并重定向
    if (!designId || designId === 'new') {
      const newDesignId = uuidv4();
      router.replace(`/editor/${newDesignId}`); // 使用 replace 避免在历史记录中留下 'new'
      setDesignId(newDesignId);
    } else {
      // 实际应用中，这里会根据 designId 从后端加载设计数据
      // 模拟加载：
      console.log(`尝试加载设计 ID: ${designId}`);
      // const loadedDesign = await fetch(`/api/editor/${designId}`).then(res => res.json());
      // if (loadedDesign) {
      //   setCanvasJson(loadedDesign.designData);
      //   useDesignStore.getState().setTshirtColor(loadedDesign.tshirtColor || 'white');
      // }
    }
  }, [designId, router, setCanvas]);




  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      {/* 左侧功能区 */}
      <div className="w-1/5 bg-white shadow-lg p-4 rounded-xl m-4">
        <FunctionPanel canvasInstance={canvasInstance} />
      </div>

      {/* 中间画布区 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <CanvasArea ref={(ref) => setCanvasInstance(ref)} />
      </div>

      {/* 右侧属性区 */}
      <div className="w-1/5 bg-white shadow-lg p-4 rounded-xl m-4">
        <PropertiesPanel designId={designId} />
      </div>
    </div>
  );
}