// 格式可能有点问题
export async function saveDesign(designData, designId, designName){
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}/save`, {
    method: "POST",
    body: {
      ...designData,
      designId,
      designName,
    },
  });
}

// 获取设计
export async function getDesignByID(designId){
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`, {
    method: "GET",
  });
}