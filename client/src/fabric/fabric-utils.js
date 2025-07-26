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
  
  if (imageUrl){
    try {
      const { Image: FabricImage } = await import("fabric");
      console.log("Fabric Image 类已加载");
      
      return new Promise((resolve, reject) => {
        console.log("开始调用 FabricImage.fromURL...");
        
        // 设置超时以避免无限等待
        const timeout = setTimeout(() => {
          console.error("图片加载超时");
          reject(new Error("图片加载超时"));
        }, 10000);
        
        FabricImage.fromURL(imageUrl, (img) => {
          clearTimeout(timeout);
          console.log("FabricImage.fromURL 回调被触发", img);
          
          if (img) {
            console.log("图片加载成功，原始尺寸:", img.width, "x", img.height);
            
            // 计算缩放比例以适应canvas
            const scaleX = canvas.width / img.width;
            const scaleY = canvas.height / img.height;
            const scale = Math.min(scaleX, scaleY); // 保持宽高比
            
            console.log("计算的缩放比例:", scale);
            
            canvas.setBackgroundImage(img, () => {
              console.log("背景图片设置完成，正在渲染...");
              canvas.renderAll();
              resolve();
            }, {
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: 'center',
              originY: 'center',
              scaleX: scale,
              scaleY: scale
            });
          } else {
            console.error("图片加载失败: img对象为空");
            reject(new Error("图片加载失败"));
          }
        }, (error) => {
          // 添加错误回调
          clearTimeout(timeout);
          console.error("FabricImage.fromURL 加载出错:", error);
          reject(error);
        });
        
        console.log("FabricImage.fromURL 调用完成，等待回调...");
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