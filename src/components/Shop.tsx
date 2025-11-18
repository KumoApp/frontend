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
import {
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  Package,
  Coins,
} from "lucide-react";
import { shopService } from "../services/api";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:3000";

interface ShopItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  type?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
}

interface ShopProps {
  onBack: () => void;
  classId: string;
  kumoSoles: number;
  onPurchase?: (newBalance?: number) => void;
}

export function Shop({ onBack, classId, kumoSoles, onPurchase }: ShopProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Debug: monitorear cambios en selectedItem
  useEffect(() => {
    console.log("[Shop] selectedItem cambió:", selectedItem);
    console.log("[Shop] !!selectedItem (open prop):", !!selectedItem);
  }, [selectedItem]);

  useEffect(() => {
    loadShopItems();
  }, []);

  async function loadShopItems() {
    try {
      setLoading(true);
      setError(null);
      const response = await shopService.getShopItems();
      console.log("Shop items loaded:", response);

      // Manejar diferentes formatos de respuesta
      const list = Array.isArray(response)
        ? response
        : (response?.body ?? response?.data ?? []);

      setItems(
        list.map((item: any) => ({
          id: item.id,
          name: item.name || "Item sin nombre",
          description: item.description,
          price: item.price || 0,
          type: item.type,
          imageUrl: item.imageUrl,
          category: item.category,
          stock: item.stock,
        })),
      );
    } catch (e: any) {
      console.error("Error cargando items de la tienda:", e);
      setError("No se pudieron cargar los items de la tienda.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!selectedItem) {
      console.warn("[Shop] handlePurchase: No hay item seleccionado");
      return;
    }

    console.log("[Shop] Iniciando compra...");
    console.log("[Shop] Item seleccionado:", selectedItem);
    console.log("[Shop] Class ID:", classId);
    console.log("[Shop] KumoSoles actuales:", kumoSoles);
    console.log("[Shop] Precio del item:", selectedItem.price);

    setPurchasing(true);
    try {
      console.log(
        `[Shop] Llamando a shopService.purchaseShopItem(${classId}, ${Number(selectedItem.id)})`,
      );

      const response = await shopService.purchaseShopItem(
        classId,
        Number(selectedItem.id),
      );

      console.log("[Shop] ✅ Compra exitosa - Respuesta completa:", response);
      console.log("[Shop] Tipo de respuesta:", typeof response);
      console.log("[Shop] Keys de respuesta:", Object.keys(response || {}));

      // Calcular nuevo balance
      const newBalance =
        response?.newBalance ??
        response?.body?.newBalance ??
        kumoSoles - selectedItem.price;

      console.log("[Shop] Nuevo balance calculado:", newBalance);
      console.log("[Shop] response?.newBalance:", response?.newBalance);
      console.log(
        "[Shop] response?.body?.newBalance:",
        response?.body?.newBalance,
      );
      console.log(
        "[Shop] Fallback (kumoSoles - precio):",
        kumoSoles - selectedItem.price,
      );

      if (onPurchase) {
        console.log("[Shop] Llamando a callback onPurchase con:", newBalance);
        onPurchase(newBalance);
      } else {
        console.warn("[Shop] No hay callback onPurchase disponible");
      }

      toast.success(`¡Compraste ${selectedItem.name}!`);
      setSelectedItem(null);

      // Recargar items para actualizar stock si es necesario
      console.log("[Shop] Recargando items de la tienda...");
      loadShopItems();
    } catch (err: any) {
      console.error("[Shop] ❌ Error en la compra:", err);
      console.error("[Shop] Error completo:", {
        message: err?.message,
        response: err?.response,
        responseData: err?.response?.data,
        responseStatus: err?.response?.status,
        responseHeaders: err?.response?.headers,
      });

      const message =
        err?.response?.data?.message || err?.message || "Error desconocido";
      console.error("[Shop] Mensaje de error extraído:", message);

      toast.error("Error al comprar el item", { description: message });
    } finally {
      console.log("[Shop] Finalizando compra, setPurchasing(false)");
      setPurchasing(false);
    }
  }

  const getItemIcon = (category?: string) => {
    if (!category) return "🎁";
    const lower = category.toLowerCase();
    if (lower.includes("cloth") || lower.includes("ropa")) return "👕";
    if (lower.includes("accessory") || lower.includes("accesorio")) return "🎩";
    if (lower.includes("food") || lower.includes("comida")) return "🍖";
    if (lower.includes("toy") || lower.includes("juguete")) return "🎾";
    return "��";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Tus KumoSoles</p>
                <p className="text-xl font-bold text-primary">{kumoSoles}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Tienda de Items
            </CardTitle>
            <CardDescription>
              Compra items para personalizar y mejorar tu mascota
            </CardDescription>
          </CardHeader>
        </Card>

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
              Cargando items...
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const canAfford = kumoSoles >= item.price;
              const outOfStock = item.stock !== undefined && item.stock <= 0;

              return (
                <Card
                  key={item.id}
                  className={`bg-white/90 backdrop-blur transition-all hover:shadow-lg ${
                    !canAfford || outOfStock ? "opacity-60" : "cursor-pointer"
                  }`}
                  onClick={() =>
                    canAfford && !outOfStock && setSelectedItem(item)
                  }
                >
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">
                        {item.imageUrl ? (
                          <img
                            src={`${API_BASE_URL}/${item.imageUrl}`}
                            alt={item.name}
                            className="w-20 h-20 mx-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          getItemIcon(item.category)
                        )}
                      </div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Precio
                        </span>
                        <Badge
                          variant={canAfford ? "default" : "secondary"}
                          className="gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          {item.price}
                        </Badge>
                      </div>

                      {item.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Categoría
                          </span>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                      )}

                      {item.stock !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Stock
                          </span>
                          <Badge
                            variant={
                              item.stock > 0 ? "secondary" : "destructive"
                            }
                          >
                            {item.stock} disponible{item.stock !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full mt-4"
                      disabled={!canAfford || outOfStock}
                      onClick={() => {
                        console.log(
                          "[Shop] Click en botón Comprar del item:",
                          item,
                        );
                        console.log("[Shop] canAfford:", canAfford);
                        console.log("[Shop] outOfStock:", outOfStock);
                        if (canAfford && !outOfStock) {
                          console.log(
                            "[Shop] Abriendo diálogo de confirmación...",
                          );
                          setSelectedItem(item);
                        } else {
                          console.warn(
                            "[Shop] No se puede comprar - canAfford:",
                            canAfford,
                            "outOfStock:",
                            outOfStock,
                          );
                        }
                      }}
                    >
                      {outOfStock
                        ? "Sin stock"
                        : !canAfford
                          ? "No tienes suficientes KumoSoles"
                          : "Comprar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

            {items.length === 0 && !loading && (
              <Card className="col-span-full bg-white/90 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No hay items disponibles en la tienda
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Diálogo de confirmación de compra - Modal personalizado */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => {
              console.log("[Shop] Click en overlay");
              setSelectedItem(null);
            }}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => {
                console.log("[Shop] Click en modal content");
                e.stopPropagation();
              }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold">Confirmar compra</h2>
                <p className="text-sm text-gray-600">
                  ¿Estás seguro que quieres comprar este item?
                </p>
              </div>

              <div className="py-4">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">
                    {selectedItem.imageUrl ? (
                      <img
                        src={`${API_BASE_URL}/${selectedItem.imageUrl}`}
                        alt={selectedItem.name}
                        className="w-20 h-20 mx-auto object-contain"
                      />
                    ) : (
                      getItemIcon(selectedItem.category)
                    )}
                  </div>
                  <h3 className="font-bold text-xl">{selectedItem.name}</h3>
                  {selectedItem.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedItem.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Precio:</span>
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      {selectedItem.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo actual:</span>
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      {kumoSoles}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2">
                    <span>Saldo después:</span>
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      {kumoSoles - selectedItem.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[Shop] Click en Cancelar");
                    setSelectedItem(null);
                  }}
                  disabled={purchasing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    console.log("[Shop] Click en Confirmar compra");
                    handlePurchase();
                  }}
                  disabled={purchasing}
                >
                  {purchasing ? "Comprando..." : "Confirmar compra"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
