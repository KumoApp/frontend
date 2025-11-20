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
import { ArrowLeft, Package, Check, X, Utensils } from "lucide-react";
import { inventoryService, petsService } from "../services/api";
import { toast } from "sonner";

const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL ?? "http://localhost:3000";

interface InventoryItem {
  id: string | number;
  itemId?: string | number;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  imageUrl?: string;
  quantity?: number;
  equipped?: boolean;
  acquiredDate?: string;
}

interface InventoryProps {
  onBack: () => void;
  classId: string;
  petId?: string | number;
}

export function Inventory({ onBack, classId, petId }: InventoryProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myPetId, setMyPetId] = useState<string | number | null>(petId || null);
  const [actionLoading, setActionLoading] = useState<string | number | null>(
    null,
  );

  useEffect(() => {
    loadInventory();
    if (!petId) {
      loadMyPet();
    }
  }, [classId]);

  async function loadMyPet() {
    try {
      const response = await petsService.getOwnPet(classId);
      console.log("[Inventory] Mi mascota:", response);
      const pet = response?.body || response?.data || response;
      if (pet?.id) {
        setMyPetId(pet.id);
      }
    } catch (e) {
      console.error("[Inventory] Error cargando mascota:", e);
    }
  }

  async function loadInventory() {
    try {
      setLoading(true);
      setError(null);

      // Cargar inventario y mascota en paralelo
      const [inventoryResponse, petResponse] = await Promise.all([
        inventoryService.getOwnItemsInClass(classId),
        myPetId ? petsService.getPet(myPetId) : Promise.resolve(null),
      ]);

      console.log("[Inventory] ========== RAW RESPONSE ==========");
      console.log("[Inventory] Inventory Response:", inventoryResponse);
      console.log("[Inventory] Pet Response:", petResponse);

      const list = Array.isArray(inventoryResponse)
        ? inventoryResponse
        : (inventoryResponse?.body ?? inventoryResponse?.data ?? []);

      // Extraer IDs de items equipados de la mascota
      const pet = petResponse?.body || petResponse?.data || petResponse;
      const equippedItemIds = new Set<number>();

      if (pet && pet.equippedItems && Array.isArray(pet.equippedItems)) {
        // El backend devuelve un array de items equipados
        pet.equippedItems.forEach((equippedItem: any) => {
          if (equippedItem.id) {
            equippedItemIds.add(Number(equippedItem.id));
          }
        });

        console.log("[Inventory] Equipped items from pet:", pet.equippedItems);
        console.log(
          "[Inventory] Equipped item IDs:",
          Array.from(equippedItemIds),
        );
      }

      console.log("[Inventory] Items list:", list);
      console.log("[Inventory] ====================================");

      setItems(
        list.map((item: any) => {
          const itemId = item.itemId || item.id;
          const isEquipped = equippedItemIds.has(Number(itemId));

          console.log(`[Inventory] Processing item ${item.name}:`, {
            itemId,
            isEquipped,
            fromBackend: item.equipped,
          });

          return {
            id: item.id,
            itemId: itemId,
            name: item.name || "Item sin nombre",
            description: item.description,
            type: item.type,
            category: item.category,
            imageUrl: item.imageUrl,
            quantity: item.quantity ?? 1,
            equipped: isEquipped,
            acquiredDate: item.acquiredDate || item.createdAt,
          };
        }),
      );
    } catch (e: any) {
      console.error("Error cargando inventario:", e);
      setError("No se pudo cargar tu inventario.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEquipItem(item: InventoryItem) {
    if (!myPetId) {
      toast.error("No se encontró tu mascota");
      return;
    }

    console.log("[Inventory] Equipando item:", item);
    setActionLoading(item.id);

    try {
      const response = await petsService.equipItem(myPetId, {
        itemId: Number(item.itemId || item.id),
      });
      console.log("[Inventory] ✅ Item equipado:", response);
      toast.success(`¡${item.name} equipado!`);

      // Recargar inventario
      await loadInventory();
    } catch (err: any) {
      console.error("[Inventory] ❌ Error equipando item:", err);
      const message =
        err?.response?.data?.message || err?.message || "Error al equipar item";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnequipItem(item: InventoryItem) {
    if (!myPetId) {
      toast.error("No se encontró tu mascota");
      return;
    }

    console.log("[Inventory] Desequipando item:", item);
    setActionLoading(item.id);

    try {
      // Determinar el slotType basado en la categoría/tipo del item
      let slotType = "ACCESSORY"; // Por defecto
      const cat = (item.category || item.type || "").toUpperCase();

      if (cat.includes("CLOTH") || cat.includes("ROPA")) {
        slotType = "CLOTHING";
      } else if (cat.includes("ACCESSORY") || cat.includes("ACCESORIO")) {
        slotType = "ACCESSORY";
      } else if (cat.includes("TOY") || cat.includes("JUGUETE")) {
        slotType = "TOY";
      }

      const response = await petsService.unequipItem(myPetId, slotType);
      console.log("[Inventory] ✅ Item desequipado:", response);
      toast.success(`${item.name} desequipado`);

      // Recargar inventario
      await loadInventory();
    } catch (err: any) {
      console.error("[Inventory] ❌ Error desequipando item:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al desequipar item";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFeedPet(item: InventoryItem) {
    if (!myPetId) {
      toast.error("No se encontró tu mascota");
      return;
    }

    console.log("[Inventory] Alimentando mascota con:", item);
    setActionLoading(item.id);

    try {
      const response = await petsService.feedPet(
        myPetId,
        Number(item.itemId || item.id),
      );
      console.log("[Inventory] ✅ Mascota alimentada:", response);
      toast.success(`¡Tu mascota disfrutó ${item.name}!`);

      // Recargar inventario
      await loadInventory();
    } catch (err: any) {
      console.error("[Inventory] ❌ Error alimentando mascota:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al alimentar mascota";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }

  const getItemIcon = (type?: string, category?: string) => {
    const cat = category || type || "";
    if (!cat) return "📦";
    const lower = cat.toLowerCase();
    if (lower.includes("cloth") || lower.includes("ropa")) return "👕";
    if (lower.includes("accessory") || lower.includes("accesorio")) return "🎩";
    if (lower.includes("food") || lower.includes("comida")) return "🍖";
    if (lower.includes("toy") || lower.includes("juguete")) return "🎾";
    return "📦";
  };

  const isFood = (item: InventoryItem) => {
    const cat = (item.category || item.type || "").toLowerCase();
    return cat.includes("food") || cat.includes("comida");
  };

  const isAccessory = (item: InventoryItem) => {
    const cat = (item.category || item.type || "").toLowerCase();
    return (
      cat.includes("accessory") ||
      cat.includes("accesorio") ||
      cat.includes("cloth") ||
      cat.includes("ropa") ||
      cat.includes("toy") ||
      cat.includes("juguete")
    );
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
                                src={
                                  item.imageUrl.startsWith("http")
                                    ? item.imageUrl
                                    : `${API_BASE_URL}/${item.imageUrl}`
                                }
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = getItemIcon(
                                      item.type,
                                      item.category,
                                    );
                                  }
                                }}
                              />
                            ) : (
                              getItemIcon(item.type, item.category)
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
                              {(item.type || item.category) && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category || item.type}
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => handleUnequipItem(item)}
                              disabled={actionLoading === item.id}
                            >
                              <X className="h-3 w-3 mr-1" />
                              {actionLoading === item.id
                                ? "Desequipando..."
                                : "Desequipar"}
                            </Button>
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
                                src={
                                  item.imageUrl.startsWith("http")
                                    ? item.imageUrl
                                    : `${API_BASE_URL}/${item.imageUrl}`
                                }
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = getItemIcon(
                                      item.type,
                                      item.category,
                                    );
                                  }
                                }}
                              />
                            ) : (
                              getItemIcon(item.type, item.category)
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
                              {(item.type || item.category) && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category || item.type}
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
                            {/* Botones de acción */}
                            <div className="flex gap-2 mt-3">
                              {isAccessory(item) &&
                                (item.equipped ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleUnequipItem(item)}
                                    disabled={
                                      actionLoading === item.id || !myPetId
                                    }
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    {actionLoading === item.id
                                      ? "Desequipando..."
                                      : "Desequipar"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="flex-1"
                                    onClick={() => handleEquipItem(item)}
                                    disabled={
                                      actionLoading === item.id || !myPetId
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    {actionLoading === item.id
                                      ? "Equipando..."
                                      : "Equipar"}
                                  </Button>
                                ))}
                              {isFood(item) && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="flex-1"
                                  onClick={() => handleFeedPet(item)}
                                  disabled={
                                    actionLoading === item.id || !myPetId
                                  }
                                >
                                  <Utensils className="h-3 w-3 mr-1" />
                                  {actionLoading === item.id
                                    ? "Alimentando..."
                                    : "Alimentar"}
                                </Button>
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
