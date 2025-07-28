import axios from 'axios';

// 保存设计
export async function saveDesign(designData, designId, designName) {
  const canvasData = designData.toJSON(["id", "filters"]);
  console.log(canvasData);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}/save`,
      {
        ...canvasData,
        designId,
        designName,
      }
    );
    return response;
  } catch (error) {
    console.error("Error saving design:", error);
    throw error; // Re-throw the error for further handling
  }
}

// 获取设计
export async function getDesignByID(designId) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching design by ID:", error);
    throw error; // Re-throw the error for further handling
  }
}