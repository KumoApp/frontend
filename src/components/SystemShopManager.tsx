import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ProfileDropdown } from "./ProfileDropdown";
import {
  Package,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { shopService, CreateShopItemRequest } from "../services/api";

interface SystemShopManagerProps {
  onLogout: () => void;
}

export function SystemShopManager({ onLogout }: SystemShopManagerProps) {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // Form state
  const [formData, setFormData] = useState<CreateShopItemRequest>({
    name: "",
    description: "",
    price: 0,
    type: "",
    category: "",
    stock: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setMessage({
          type: "error",
          text: "Por favor selecciona un archivo de imagen válido",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "La imagen no debe superar 5MB" });
        return;
      }

      setImageFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });

    // Validaciones
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "El nombre es obligatorio" });
      return;
    }

    if (formData.price <= 0) {
      setMessage({ type: "error", text: "El precio debe ser mayor a 0" });
      return;
    }

    if (!imageFile) {
      setMessage({ type: "error", text: "La imagen es obligatoria" });
      return;
    }

    try {
      setIsLoading(true);

      // Crear el item usando el token actual (que debería ser del usuario system)
      const response = await shopService.createShopItem(
        formData,
        imageFile,
        token!,
      );

      console.log("[SystemShopManager] Item creado:", response);

      setMessage({
        type: "success",
        text: `Item "${formData.name}" creado exitosamente`,
      });

      // Limpiar el formulario
      setFormData({
        name: "",
        description: "",
        price: 0,
        type: "",
        category: "",
        stock: 0,
      });
      handleRemoveImage();
    } catch (error: any) {
      console.error("[SystemShopManager] Error al crear item:", error);
      console.error("[SystemShopManager] Error response:", error?.response);
      console.error("[SystemShopManager] Error data:", error?.response?.data);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.data?.body &&
          JSON.stringify(error.response.data.body)) ||
        error?.message ||
        "Error al crear el item";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      type: "",
      category: "",
      stock: 0,
    });
    handleRemoveImage();
    setMessage({ type: null, text: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Sistema - Tienda</h1>
                  <p className="text-sm text-gray-600">
                    Gestor de Items de Tienda
                  </p>
                </div>
              </div>
            </div>
            <ProfileDropdown
              userName={user?.name || "System"}
              userEmail={user?.email || "system@kumoapp.com"}
              userType="admin"
              onLogout={onLogout}
              onSettings={() => console.log("Abrir configuración")}
              onProfile={() => console.log("Abrir perfil")}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Message Banner */}
        {message.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
            role="alert"
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Form Card */}
        <Card className="bg-white/95 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Plus className="h-6 w-6" />
              Crear Nuevo Item de Tienda
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Completa el formulario para agregar un nuevo item a la tienda
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Nombre del Item <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Sombrero mágico"
                  required
                  disabled={isLoading}
                  className="text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe el item..."
                  disabled={isLoading}
                  rows={3}
                  className="text-base resize-none"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-semibold">
                    Precio (Kumosoles) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    value={formData.price || ""}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                    disabled={isLoading}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-base font-semibold">
                    Stock Disponible
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock || ""}
                    onChange={handleInputChange}
                    placeholder="0 = ilimitado"
                    disabled={isLoading}
                    className="text-base"
                  />
                </div>
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-base font-semibold">
                    Tipo
                  </Label>
                  <Input
                    id="type"
                    name="type"
                    type="text"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Ej: Accesorio, Comida"
                    disabled={isLoading}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-semibold">
                    Categoría
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Ej: Ropa, Consumible"
                    disabled={isLoading}
                    className="text-base"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-base font-semibold">
                  Imagen del Item <span className="text-red-500">*</span>
                </Label>

                {imagePreview ? (
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {imageFile?.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            {(imageFile!.size / 1024).toFixed(2)} KB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Remover imagen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-base font-medium text-gray-700 mb-1">
                        Haz clic para subir una imagen
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </label>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Los campos marcados con{" "}
                      <span className="text-red-500">*</span> son obligatorios
                    </li>
                    <li>Stock = 0 significa stock ilimitado</li>
                    <li>El precio debe ser mayor a 0</li>
                    <li>La imagen es obligatoria (máx. 5MB)</li>
                  </ul>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Item
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
