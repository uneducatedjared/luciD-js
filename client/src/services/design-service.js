// 用来保存数据的一种方法
// export async function saveDesign(designData, designId = null) {
//   return fetchWithAuth(`/v1/designs`, {
//     method: "POST",
//     body: {
//       ...designData,
//       designId,
//     },
//   });
// }


export async function saveCanvasState(
  canvas,
  designId = null,
  title = "Untitled Design"
) {
  if (!canvas) return false;

  try {
    const canvasData = canvas.toJSON(["id", "filters"]);
    const designData = {
      name: title,
      canvasData: JSON.stringify(canvasData),
      width: canvas.width,
      height: canvas.height,
    };

    return saveDesign(designData, designId);
  } catch (error) {
    console.error("Error saving canvas state:", error);
    throw error;
  }
}
