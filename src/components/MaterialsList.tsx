import React, { useState, useEffect } from "react";
import { materialService } from "../services/api";
import { MaterialInfo } from "../types/material";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MaterialsListProps {
  classId: string | number;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ classId }) => {
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [classId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialService.getMaterialInfoFromClass(classId);
      console.log("[MaterialsList] Response:", response);

      // Handle different response formats
      if (response?.body && Array.isArray(response.body)) {
        setMaterials(response.body);
      } else if (Array.isArray(response)) {
        setMaterials(response);
      } else {
        setMaterials([]);
      }
    } catch (error: any) {
      console.error("[MaterialsList] Error loading materials:", error);
      toast.error(
        error.response?.data?.message || "No se pudieron cargar los materiales",
      );
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId: number, materialName: string) => {
    try {
      setDownloadingId(materialId);

      // Get the material (PDF) from the backend
      const response = await materialService.getMaterial(materialId);

      // Create a blob from the response
      const blob = new Blob([response], { type: "application/pdf" });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = materialName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Se descargó ${materialName}`);
    } catch (error: any) {
      console.error("[MaterialsList] Error downloading material:", error);
      toast.error(
        error.response?.data?.message || "No se pudo descargar el material",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Materiales de Clase
        </CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay materiales disponibles para esta clase
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Subido el {formatDate(material.uploadedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material.id, material.name)}
                  disabled={downloadingId === material.id}
                  className="ml-4"
                >
                  {downloadingId === material.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsList;
