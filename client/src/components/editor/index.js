'use client';

import Header from './header';
import Sidebar from './sidebar'; 
import Canvas from './canvas';
import Properties from './properties';
import { getDesignByID } from "@/services/design-service";
import { designStore } from "@/stores/designStore";
import { useParams} from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function MainEditor() {
  const params = useParams();
  const designId = params?.designId

  const [isloading, setIsLoading] = useState(!!designId); // 非空是true，空是false
  const [loadAttempted, setLoadAttempted] = useState(false); // 是否尝试过加载数据
  const [error, setError] = useState(null); // 存储错误信息

  const {
    canvas,
    tshirtColor,
    setTshirtColor,
    setDesignId,
    setIsEditing,
    setName,
    resetStore
  } = designStore();

  // 重置canvas, 组件重新挂载的时候执行
  useEffect(() => {
    resetStore();
    if(designId) setDesignId(designId);
    return () => {
      resetStore();
    };
  }, []);

  // 加载设计
  const loadDesign = useCallback( async ()=> {
    if (!canvas || !designId || loadAttempted) return; // 避免重复加载

    try{
      setIsLoading(true);
      setLoadAttempted(true);

      const response = await getDesignByID(designId);
      const design = response.data;

      // 如果有数据，加载数据
      if(design){
        //update name
        setName(design.name);

        // 加载数据
        try{
          if(design.canvas){
            canvas.clear();
            if (design.tshirtColor){
              canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
              switch(design.tshirtColor){
                case 'white':
                  imageUrl = '/images/tshirt_base_white.png';
                  break;
                case 'black':
                  imageUrl = '/images/tshirt_base_black.png';
                  break;
                case 'pink':
                  imageUrl = '/images/tshirt_base_pink.png';
                  break;
              }
              if (imageUrl){
                Fabric.Image.fromURL(imageUrl, function(img){
                  canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas),{
                     left: canvas.width / 2, // 鼠标x轴坐标
                     top: canvas.height / 2, // 鼠标y轴坐标
                     originX: 'center',
                     originY: 'center',
                  });
                });
              }
            }
          }
          canvas.renderAll();
        }
        catch(e){
          console.log("加载数据失败", e);
          setError("failed to load design");
        }
      }
      // 如果没数据，初始化空白页面
      else{
        console.log("数据库无数据");
        setName("未命名设计");
        canvas.clear();
        canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        switch(tshirtColor){
          default:
            imageUrl = '/images/tshirt_base_white.png';
            break;
        }
        if (imageUrl){
          Fabric.Image.fromURL(imageUrl, function(img){
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas),{
              left: canvas.width / 2, 
              top: canvas.height / 2,
              originX: 'center',
              originY: 'center',
            });
          });
        }
        canvas.renderAll();
      }
    } catch(e){
      console.log("画布初始化失败", e);
      setError("failed to load design");
    } finally {
      setIsLoading(false);
    }
  }, [canvas, designId, loadAttempted, setDesignId])
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> 
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center justify-center">
            <Canvas />
          </main>
        </div>
        <Properties />
      </div>
    </div>
  );
}