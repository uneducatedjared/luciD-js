export const initializeFabric = async (canvasEl, containerEl) => {
  try {
    const { Canvas, PencilBrush } = await import("fabric");

    // 设置固定的canvas尺寸
    const canvas = new Canvas(canvasEl, {
      width: 800,
      height: 600,
      preserveObjectStacking: true,
      isDrawingMode: false,
      renderOnAddRemove: true,
    });

    //drawing init
    const brush = new PencilBrush(canvas);
    brush.color = "#000000";
    brush.width = 5;
    canvas.freeDrawingBrush = brush;

    return canvas;
  } catch (e) {
    console.error("Failed to load fabric", e);
    return null;
  }
};

export const centerCanvas = (canvas, fixedWidth = 800, fixedHeight = 400) => {
  if (!canvas || !canvas.wrapperEl) return;
  const canvasWrapper = canvas.wrapperEl;
  canvasWrapper.style.width = `${fixedWidth}px`;
  canvasWrapper.style.height = `${fixedHeight}px`;
  canvasWrapper.style.position = "absolute";
  canvasWrapper.style.top = "50%";
  canvasWrapper.style.left = "50%";
  canvasWrapper.style.transform = "translate(-50%, -50%)";
  canvasWrapper.style.zIndex = "10"; // 确保在最上层
  canvasWrapper.style.visibility = "visible";
  canvasWrapper.style.display = "block";
  canvasWrapper.style.border = "1px solid red";
};

export const setBackgroundImage = async (canvas, tshirtColor) => {
  if (!canvas) {
    console.error("Canvas 不存在");
    return;
  }
  
  let imageUrl = '';
  switch(tshirtColor){
    case 'white':
      imageUrl = '/images/tshirt_base_white.png';
      break;
    case 'black':
      imageUrl = '/images/tshirt_base_black.png';
      break;
    case 'pink':
      imageUrl = '/images/tshirt_base_pink.png';
      break;
    default:
      console.log("未知的t-shirt颜色:", tshirtColor);
      return;
  }
  
  console.log("尝试加载背景图片:", imageUrl);
  console.log("Canvas尺寸:", canvas.width, "x", canvas.height);
  
  if (imageUrl) {
    try {
      const { FabricImage } = await import("fabric");
      
      // 创建图片对象并设置为背景
      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous' // 如果需要跨域访问
      }).then((img) => {
        // 调整图片尺寸以适应canvas（保持宽高比）
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        
        if (imgAspect > canvasAspect) {
          // 图片更宽，以高度为准
          img.scaleToHeight(canvas.height);
        } else {
          // 图片更高，以宽度为准
          img.scaleToWidth(canvas.width);
        }
        
        // 设置图片位置居中
        img.set({
          left: 0,
          top: 0,
          selectable: false, // 背景图片不可选择
          evented: false,    // 背景图片不响应事件
        });
        
        // 方法1：作为背景图片设置（修复版本兼容性）
        try {
            // 如果setBackgroundImage不存在，使用backgroundImage属性
            canvas.backgroundImage = img;
            canvas.renderAll();
            console.log("背景图片设置成功（使用backgroundImage属性）");

        } catch (bgError) {
          console.warn("方法1失败，使用方法2:", bgError);
          // 方法2：作为普通对象添加到最底层（居中显示）
          // 计算居中位置
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          img.set({
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
          });
          
          canvas.add(img);
          
          // 使用moveTo代替sendToBack
          if (typeof canvas.sendToBack === 'function') {
            canvas.sendToBack(img);
          } else {
            // 手动移动到最底层
            canvas.moveTo(img, 0);
          }
          
          canvas.renderAll();
          console.log("背景图片设置成功（作为底层对象）");
        }
        
      }).catch((error) => {
        console.error("加载图片失败:", error);
      });
      
    } catch (e) {
      console.error("设置背景图片失败:", e);
      throw e;
    }
  }
};

export const addImageToCanvas = async (canvas, imageUrl) => {
  if (!canvas) return null;

  try {
    const { Image: FabricImage } = await import("fabric");

    let imgObj = new Image();
    imgObj.crossOrigin = "Anonymous";
    imgObj.src = imageUrl;

    return new Promise((resolve, reject) => {
      imgObj.onload = () => {
        let image = new FabricImage(imgObj);
        image.set({
          id: `image-${Date.now()}`,
          top: 100,
          left: 100,
          padding: 10,
          cornorSize: 10,
        });

        const maxDimension = 400;

        if (image.width > maxDimension || image.height > maxDimension) {
          if (image.width > image.height) {
            const scale = maxDimension / image.width;
            image.scale(scale);
          } else {
            const scale = maxDimension / image.height;
            image.scale(scale);
          }
        }

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
        resolve(image);
      };

      imgObj.onerror = () => {
        reject(new Error("Failed to load image", imageUrl));
      };
    });
  } catch (error) {
    console.error("Error adding image");
    return null;
  }
};

export const customizeBoundingBox = (canvas) => {
  if (!canvas) return;

  try {
    canvas.on("object:added", (e) => {
      if (e.target) {
        e.target.set({
          borderColor: "#00ffe7",
          cornerColor: "#000000",
          cornerStrokeColor: "#00ffe7",
          cornerSize: 10,
          transparentCorners: false,
        });
      }
    });

    canvas.getObjects().forEach((obj) => {
      obj.set({
        borderColor: "#00ffe7",
        cornerColor: "#000000",
        cornerStrokeColor: "#00ffe7",
        cornerSize: 10,
        transparentCorners: false,
      });
    });

    canvas.renderAll();
  } catch (e) {
    console.error("Failed to customise bounding box", e);
  }
};