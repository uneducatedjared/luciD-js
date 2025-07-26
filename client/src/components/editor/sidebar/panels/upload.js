import { Input } from "@/components/ui/input";

function FunctionPanel() {
return(
              <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
);
}

export default FunctionPanel