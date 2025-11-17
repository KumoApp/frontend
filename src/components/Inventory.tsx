import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Package, Check } from "lucide-react";
import { inventoryService } from "../services/api";

interface InventoryItem {
  id: string | number;
  itemId?: string | number;
  name: string;
  description?: string;
  type?: string;
  imageUrl?: string;
  quantity?: number;
  equipped?: boolean;
  acquiredDate?: string;
}

interface InventoryProps {
  onBack: () => void;
  classId: string;
}

export function Inventory({ onBack, classId }: InventoryProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, [classId]);

  async function loadInventory() {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryService.getOwnItemsInClass(classId);
      console.log("Inventory loaded:", response);

      const list = Array.isArray(response)
        ? response
        : (response?.body ?? response?.data ?? []);

      setItems(
        list.map((item: any) => ({
          id: item.id,
          itemId: item.itemId || item.id,
          name: item.name || "Item sin nombre",
          description: item.description,
          type: item.type,
          imageUrl: item.imageUrl,
          quantity: item.quantity ?? 1,
          equipped: item.equipped ?? false,
          acquiredDate: item.acquiredDate || item.createdAt,
        })),
      );
    } catch (e: any) {
      console.error("Error cargando inventario:", e);
      setError("No se pudo cargar tu inventario.");
    } finally {
      setLoading(false);
    }
  }

  const getItemIcon = (type?: string) => {
    if (!type) return "📦";
    const lower = type.toLowerCase();
    if (lower.includes("cloth") || lower.includes("ropa")) return "👕";
    if (lower.includes("accessory") || lower.includes("accesorio")) return "🎩";
    if (lower.includes("food") || lower.includes("comida")) return "🍖";
    if (lower.includes("toy") || lower.includes("juguete")) return "🎾";
    return "📦";
  };

  const equippedItems = items.filter((item) => item.equipped);
  const unequippedItems = items.filter((item) => !item.equipped);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                Mi Inventario
              </CardTitle>
              <CardDescription>
                Tus items adquiridos en esta clase
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="p-4 text-red-600 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-8 text-center text-muted-foreground">
              Cargando inventario...
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Items equipados */}
            {equippedItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Items Equipados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equippedItems.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-white/90 backdrop-blur border-green-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              getItemIcon(item.type)
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-2 space-y-1">
                              {item.type && (
                                <Badge variant="outline" className="text-xs">
                                  {item.type}
                                </Badge>
                              )}
                              {item.quantity && item.quantity > 1 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs ml-1"
                                >
                                  x{item.quantity}
                                </Badge>
                              )}
                              <Badge
                                variant="default"
                                className="text-xs ml-1 bg-green-500"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Equipado
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Items no equipados */}
            {unequippedItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items en Inventario
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unequippedItems.map((item) => (
                    <Card key={item.id} className="bg-white/90 backdrop-blur">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              getItemIcon(item.type)
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-2 space-y-1">
                              {item.type && (
                                <Badge variant="outline" className="text-xs">
                                  {item.type}
                                </Badge>
                              )}
                              {item.quantity && item.quantity > 1 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs ml-1"
                                >
                                  x{item.quantity}
                                </Badge>
                              )}
                              {item.acquiredDate && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Adquirido:{" "}
                                  {new Date(
                                    item.acquiredDate,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && !loading && (
              <Card className="bg-white/90 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    Tu inventario está vacío
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visita la tienda para comprar items para tu mascota
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
