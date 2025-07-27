import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addImageToCanvas } from "@/fabric/fabric-utils"; //export const addImageToCanvas = async (canvas, imageUrl) => {
import { useState, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import { designStore } from '@/stores/designStore';

function UploadPanel() {
    const { canvas } = designStore(); //用户画布
    const [isUploading, setIsUploading] = useState(false); //上传状态
    const [isLoading, setIsLoading] = useState(false); // 数据是否加载中
    const [userUploads, setUserUploads] = useState([]); // 用户上传数据

    // 组件挂载时加载用户上传的图片
    useEffect(() => {
        loadUserUploads();
    }, []);

    // 模拟加载用户上传的图片数据
    const loadUserUploads = async () => {
        setIsLoading(true);
        try {
            // 这里可以替换为实际的API调用
            // const response = await fetch('/api/user-uploads');
            // const data = await response.json();
            
            // 暂时使用本地存储模拟
            const savedUploads = localStorage.getItem('userUploads');
            if (savedUploads) {
                setUserUploads(JSON.parse(savedUploads));
            }
        } catch (error) {
            console.error('Failed to load user uploads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 处理文件上传
    const handleFileUpload = async (e) => {
        console.log(e.target.files);
        const file = e.target.files[0];
        
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // 验证文件大小（5MB限制）
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        
        try {
            // 创建文件URL用于预览和存储
            const imageUrl = URL.createObjectURL(file);
            
            // 创建新的图片数据对象
            const newImageData = {
                _id: Date.now().toString(), // 简单的ID生成
                name: file.name,
                url: imageUrl,
                uploadTime: new Date(),
                size: file.size
            };

            // 更新用户上传列表
            const updatedUploads = [...userUploads, newImageData];
            setUserUploads(updatedUploads);
            
            // 保存到本地存储（在实际应用中应该上传到服务器）
            localStorage.setItem('userUploads', JSON.stringify(updatedUploads));
            
            // 可选：自动添加到画布
            if (canvas) {
                await addImageToCanvas(canvas, imageUrl);
            }
            
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            // 重置input值，允许重复上传同一文件
            e.target.value = '';
        }
    };

    // 处理添加图片到画布
    const handleAddImage = async (imageUrl) => {
        if (!canvas) {
            alert('Canvas not initialized');
            return;
        }

        try {
            await addImageToCanvas(canvas, imageUrl);
        } catch (error) {
            console.error('Failed to add image to canvas:', error);
            alert('Failed to add image to canvas');
        }
    };

    // 删除上传的图片
    const handleDeleteImage = (imageId) => {
        const updatedUploads = userUploads.filter(img => img._id !== imageId);
        setUserUploads(updatedUploads);
        localStorage.setItem('userUploads', JSON.stringify(updatedUploads));
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <Label
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white
                        rounded-md cursor-pointer h-12 font-medium transition-colors ${
                            isUploading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        <Upload className="w-5 h-5" />
                        <span>{isUploading ? "Uploading..." : "Upload Files"}</span>
                        <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </Label>
                </div>
                
                <div className="mt-5">
                    <h4 className="text-sm text-gray-500 mb-5">Your Uploads</h4>
                    {isLoading ? (
                        <div className="border p-6 flex rounded-md items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <p className="font-bold text-sm">Loading your uploads...</p>
                        </div>
                    ) : userUploads.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {userUploads.map((imageData) => (
                                <div
                                    className="aspect-square bg-gray-50 rounded-md overflow-hidden hover:opacity-85 transition-opacity relative group cursor-pointer"
                                    key={imageData._id}
                                    onClick={() => handleAddImage(imageData.url)}
                                >
                                    <img
                                        src={imageData.url}
                                        alt={imageData.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* 删除按钮 */}
                                    <button
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteImage(imageData._id);
                                        }}
                                        title="Delete image"
                                    >
                                        ×
                                    </button>
                                    {/* 图片信息 */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="truncate">{imageData.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No uploads yet</p>
                            <p className="text-sm">Upload images to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UploadPanel;