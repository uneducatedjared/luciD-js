// export const initializeFabric = async (canvasEl, containerEl) => {
//   try {
//     const { Canvas, FabricImage } = await import("fabric");

//     const canvas = new Canvas(canvasEl, {
//       preserveObjectStacking: true,
//       isDrawingMode: false,
//       renderOnAddRemove: true,
//     });
//     FabricImage.fromURL(
//       "https://ts3.tc.mm.bing.net/th/id/OIP-C.fXqK6uxwqQ0f_NiTvFr_LAAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
//       (img) => {
//         img.set({
//           left: 100,
//           top: 100,
//         });
//         canvas.add(img);
//       }
//     );
//     canvas.renderAll()
//     return canvas;
//   } catch (e) {
//     console.error("Failed to load fabric", e);
//     return null;
//   }
// };


export const initializeFabric = async (canvasEl, containerEl) => {
  try {
    const { Canvas, PencilBrush } = await import("fabric");

    const canvas = new Canvas(canvasEl, {
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

export const centerCanvas = (canvas) => {
  if (!canvas || !canvas.wrapperEl) return;

  const canvasWrapper = canvas.wrapperEl;

  canvasWrapper.style.width = `${canvas.width}px`;
  canvasWrapper.style.height = `${canvas.height}px`;

  canvasWrapper.style.position = "absolute";
  canvasWrapper.style.top = "50%";
  canvasWrapper.style.left = "50%";
  canvasWrapper.style.transform = "translate(-50%, -50%)";
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