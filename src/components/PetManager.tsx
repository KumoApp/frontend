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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ArrowLeft, Heart, Zap, TrendingUp, Apple, Plus } from "lucide-react";
import { petsService } from "../services/api";
import { Pet, CreatePetData } from "../types/pet";
import { Progress } from "./ui/progress";
import { PetAvatar } from "./PetAvatar";

interface PetManagerProps {
  onBack: () => void;
  classId: string;
}

const PET_TYPES = [
  { value: "CAT", label: "Gato", emoji: "🐱" },
  { value: "DOG", label: "Perro", emoji: "🐕" },
  { value: "BIRD", label: "Pájaro", emoji: "🐦" },
  { value: "TURTLE", label: "Tortuga", emoji: "🐢" },
  { value: "RABBIT", label: "Conejo", emoji: "🐰" },
  { value: "DUCK", label: "Pato", emoji: "🦆" },
  { value: "HAMSTER", label: "Hámster", emoji: "🐹" },
  { value: "UNICORN", label: "Unicornio", emoji: "🦄" },
];

export function PetManager({ onBack, classId }: PetManagerProps) {
  const [myPet, setMyPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form para crear mascota
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState("DOG");

  useEffect(() => {
    loadMyPet();
  }, [classId]);

  async function loadMyPet() {
    try {
      setLoading(true);
      setError(null);
      const response = await petsService.getOwnPet(classId);
      const petData = response?.body ?? response?.data ?? response;

      if (petData && petData.id) {
        setMyPet({
          id: petData.id,
          name: petData.name || "Mascota",
          type: petData.type || "DOG",
          level: petData.level ?? 1,
          experience: petData.experience ?? 0,
          hunger: petData.hunger ?? 100,
          happiness: petData.happiness ?? 100,
          health: petData.health ?? 100,
          imageUrl: petData.imageUrl,
          color: petData.color,
          equippedItems: petData.equippedItems || [],
          classId: petData.classId,
          ownerId: petData.ownerId,
        });
      } else {
        setMyPet(null);
      }
    } catch (e: any) {
      console.error("Error cargando mascota:", e);
      // Si el error es 404, significa que no tiene mascota
      if (e?.response?.status === 404 || e?.message?.includes("404")) {
        setMyPet(null);
      } else {
        setError("No se pudo cargar tu mascota.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePet() {
    console.log("[PetManager] handleCreatePet iniciado");
    console.log("[PetManager] newPetName:", newPetName);
    console.log("[PetManager] newPetType:", newPetType);
    console.log("[PetManager] classId:", classId);

    if (!newPetName.trim()) {
      console.log("[PetManager] ❌ Nombre vacío");
      alert("Por favor ingresa un nombre para tu mascota");
      return;
    }

    console.log("[PetManager] ✅ Nombre válido, iniciando creación...");
    setCreating(true);
    try {
      const petData: CreatePetData = {
        name: newPetName.trim(),
        type: newPetType,
      };

      console.log("[PetManager] Datos a enviar:", petData);
      console.log("[PetManager] Llamando a petsService.createPet...");

      const response = await petsService.createPet(classId, petData);

      console.log("[PetManager] ✅ Mascota creada exitosamente");
      console.log("[PetManager] Respuesta:", response);

      setShowCreateDialog(false);
      setNewPetName("");
      setNewPetType("DOG");

      console.log("[PetManager] Recargando mascota...");
      // Recargar mascota
      await loadMyPet();
      console.log("[PetManager] ✅ Mascota recargada");
    } catch (err: any) {
      console.error("[PetManager] ❌ Error creando mascota:", err);
      console.error(
        "[PetManager] Error completo:",
        JSON.stringify(err, null, 2),
      );
      console.error("[PetManager] Error response:", err?.response);
      console.error("[PetManager] Error response data:", err?.response?.data);
      alert(
        "Error al crear mascota: " +
          (err?.response?.data?.message || err.message || "Error desconocido"),
      );
    } finally {
      console.log("[PetManager] setCreating(false)");
      setCreating(false);
    }
  }

  const getPetEmoji = (type: string) => {
    const petType = PET_TYPES.find((pt) => pt.value === type);
    return petType?.emoji || "🐾";
  };

  const getStatColor = (value: number, isHunger: boolean = false) => {
    // Para hambre: 0% = verde (sin hambre), 100% = rojo (mucha hambre)
    // Para otras stats: 0% = rojo (mal), 100% = verde (bien)
    const effectiveValue = isHunger ? 100 - value : value;

    if (effectiveValue >= 70) return "bg-green-500";
    if (effectiveValue >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  console.log("[PetManager] Render - showCreateDialog:", showCreateDialog);
  console.log("[PetManager] Render - myPet:", myPet);
  console.log("[PetManager] Render - loading:", loading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
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
              Cargando tu mascota...
            </CardContent>
          </Card>
        ) : myPet ? (
          <>
            {/* Tarjeta principal de la mascota */}
            <Card className="bg-white/90 backdrop-blur mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{myPet.name}</CardTitle>
                    <CardDescription>
                      {PET_TYPES.find((pt) => pt.value === myPet.type)?.label ||
                        myPet.type}
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <PetAvatar
                      petType={myPet.type}
                      petImageUrl={myPet.imageUrl}
                      equippedItems={myPet.equippedItems}
                      size="lg"
                    />
                    <Badge variant="secondary" className="mt-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Nivel {myPet.level || 1}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Estadísticas */}
                  {myPet.health !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          Salud
                        </span>
                        <span>{myPet.health}%</span>
                      </div>
                      <Progress
                        value={myPet.health}
                        className={`h-2 ${getStatColor(myPet.health)}`}
                      />
                    </div>
                  )}

                  {myPet.hunger !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <Apple className="h-4 w-4 text-orange-500" />
                          Hambre
                        </span>
                        <span>{myPet.hunger}%</span>
                      </div>
                      <Progress
                        value={myPet.hunger}
                        className={`h-2 ${getStatColor(myPet.hunger, true)}`}
                      />
                    </div>
                  )}

                  {myPet.happiness !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Felicidad
                        </span>
                        <span>{myPet.happiness}%</span>
                      </div>
                      <Progress
                        value={myPet.happiness}
                        className={`h-2 ${getStatColor(myPet.happiness)}`}
                      />
                    </div>
                  )}

                  {myPet.experience !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Experiencia
                        </span>
                        <span>{myPet.experience} XP</span>
                      </div>
                      <Progress
                        value={myPet.experience % 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Información */}
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground text-center">
                      💡 Visita tu inventario para alimentar a tu mascota con
                      items de comida
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items equipados */}
            {myPet.equippedItems && myPet.equippedItems.length > 0 && (
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Items Equipados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {myPet.equippedItems.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className="justify-center p-2"
                      >
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : !showCreateDialog ? (
          // No tiene mascota - mostrar botón para crear
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold mb-2">No tienes una mascota</h2>
              <p className="text-muted-foreground mb-6">
                Crea tu primera mascota para comenzar tu aventura
              </p>
              <Button
                onClick={() => {
                  console.log(
                    '[PetManager] Botón "Crear Mi Mascota" presionado',
                  );
                  console.log(
                    "[PetManager] showCreateDialog antes:",
                    showCreateDialog,
                  );
                  setShowCreateDialog(true);
                  console.log(
                    "[PetManager] setShowCreateDialog(true) ejecutado",
                  );
                }}
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Mi Mascota
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Formulario de crear mascota
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle>Crear tu mascota</CardTitle>
              <CardDescription>
                Elige un nombre y tipo para tu nueva mascota
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pet-name-input">Nombre</Label>
                <Input
                  id="pet-name-input"
                  placeholder="Ej: Shupa"
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pet-type-select">Tipo de mascota</Label>
                <Select value={newPetType} onValueChange={setNewPetType}>
                  <SelectTrigger id="pet-type-select" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.emoji}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-6xl mb-2">{getPetEmoji(newPetType)}</div>
                <p className="font-medium">{newPetName || "Tu mascota"}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewPetName("");
                    setNewPetType("DOG");
                  }}
                  disabled={creating}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePet}
                  disabled={creating || !newPetName.trim()}
                  className="flex-1"
                >
                  {creating ? "Creando..." : "Crear Mascota"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
