import React, { useState, useRef } from "react";
import { materialService } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, File, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadMaterialProps {
  classId: string | number;
  onUploadSuccess?: () => void;
}

const UploadMaterial: React.FC<UploadMaterialProps> = ({
  classId,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (only PDF)
      if (file.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo PDF para subir");
      return;
    }

    try {
      setUploading(true);
      console.log("[UploadMaterial] Uploading file:", selectedFile.name);

      const response = await materialService.uploadMaterialToClass(
        classId,
        selectedFile,
      );

      console.log("[UploadMaterial] Upload response:", response);

      toast.success(`${selectedFile.name} se ha subido correctamente`);

      // Clear the selected file
      handleRemoveFile();

      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error("[UploadMaterial] Error uploading material:", error);
      toast.error(
        error.response?.data?.message || "No se pudo subir el material",
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Material
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-foreground"
          >
            Seleccionar archivo PDF
          </label>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <File className="mr-2 h-4 w-4" />
            Seleccionar archivo PDF
          </Button>
        </div>

        {selectedFile && (
          <div className="p-4 border rounded-lg bg-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <File className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={uploading}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir Material
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Solo archivos PDF. Tamaño máximo: 10MB
        </p>
      </CardContent>
    </Card>
  );
};

export default UploadMaterial;
