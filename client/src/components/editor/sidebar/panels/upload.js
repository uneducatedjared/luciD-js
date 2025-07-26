import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload } from "lucide-react";

function UploadPanel() {
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userUploads, setUserUploads] = useState([]);


    const handleFileUpload = async (e) => {
    console.log(e.target.files);
    const file = e.target.files[0];

    setIsUploading(true);

    try {
      const result = await uploadFileWithAuth(file);

      setUserUploads((prev) => [result?.data, ...prev]);

      console.log(result);
    } catch (e) {
      console.error("Error while uploading the file");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };
    return(
        <div className="flex gap-2">
          <Label
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white
          rounded-md cursor-pointer h-12 font-medium transition-colors ${
            isUploading ? "opacity-70 cursor-not-allowed" : ""
          }
          `}
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
    )
}

export default UploadPanel;
