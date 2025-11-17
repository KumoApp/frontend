import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ArrowLeft, Users, Trophy, Star, Loader2 } from "lucide-react";
import { petsService, classService } from "../services/api";

interface Pet {
  id: number;
  name: string;
  type: string;
  happiness: number;
  level: number;
  student?: number; // ID del estudiante dueño
  owner?: {
    id: number;
    name: string;
    lastname?: string;
  };
}

interface ClassroomPetsProps {
  onBack: () => void;
  classId: string;
}

export function ClassroomPets({ onBack, classId }: ClassroomPetsProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>("");

  useEffect(() => {
    loadClassroomData();
  }, [classId]);

  async function loadClassroomData() {
    try {
      setLoading(true);
      setError(null);
      console.log(`[ClassroomPets] Cargando datos de la clase ${classId}`);

      // Obtener información de la clase
      const classResponse = await classService.getClass(classId);
      console.log("[ClassroomPets] Información de clase:", classResponse);

      const classData =
        classResponse?.body ?? classResponse?.data ?? classResponse;
      if (classData?.name) {
        setClassName(classData.name);
      }

      // Obtener mascotas de la clase
      const response = await petsService.getAllPetsFromClass(classId);
      console.log("[ClassroomPets] Respuesta:", response);

      const list = Array.isArray(response)
        ? response
        : (response?.body ?? response?.data ?? []);

      console.log("[ClassroomPets] Lista de mascotas:", list);

      // Log de cada mascota para ver la estructura del owner
      list.forEach((pet: any, index: number) => {
        console.log(`[ClassroomPets] Mascota ${index}:`, {
          id: pet.id,
          name: pet.name,
          owner: pet.owner,
          ownerId: pet.ownerId,
          user: pet.user,
          completo: pet,
        });
      });

      setPets(list);
    } catch (e: any) {
      console.error("[ClassroomPets] Error cargando mascotas:", e);
      setError("No se pudieron cargar las mascotas del salón.");
    } finally {
      setLoading(false);
    }
  }

  const getPetIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "DOG":
        return "🐕";
      case "CAT":
        return "🐱";
      case "RABBIT":
        return "🐰";
      case "BIRD":
        return "🐦";
      case "HAMSTER":
        return "🐹";
      case "FISH":
        return "🐟";
      default:
        return "🐾";
    }
  };

  const getPetTypeName = (type: string) => {
    switch (type.toUpperCase()) {
      case "DOG":
        return "Perro";
      case "CAT":
        return "Gato";
      case "RABBIT":
        return "Conejo";
      case "BIRD":
        return "Pájaro";
      case "HAMSTER":
        return "Hámster";
      case "FISH":
        return "Pez";
      default:
        return type;
    }
  };

  const getHappinessColor = (happiness: number) => {
    if (happiness >= 80) return "text-green-500";
    if (happiness >= 50) return "text-yellow-500";
    if (happiness >= 30) return "text-orange-500";
    return "text-red-500";
  };

  const getOwnerName = (pet: Pet) => {
    if (pet.owner) {
      const { name, lastname } = pet.owner;
      return lastname ? `${name} ${lastname}` : name;
    }
    if (pet.student) {
      return `Estudiante #${pet.student}`;
    }
    return "Sin dueño";
  };

  // Ordenar mascotas por nivel (mayor a menor)
  const sortedPets = [...pets].sort((a, b) => b.level - a.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Mascotas del Salón{className && ` - ${className}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total de mascotas: {pets.length}
              </p>
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
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground">Cargando mascotas...</p>
            </CardContent>
          </Card>
        ) : pets.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                No hay mascotas en esta clase
              </p>
              <p className="text-sm text-muted-foreground">
                Los estudiantes pueden crear sus mascotas desde su dashboard
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 3 Highlight */}
            {sortedPets.length >= 3 && (
              <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Trophy className="h-5 w-5" />
                    Top 3 Mascotas por Nivel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {sortedPets.slice(0, 3).map((pet, index) => (
                      <div key={pet.id} className="text-center">
                        <div className="relative mb-2">
                          <div className="text-6xl mb-2">
                            {getPetIcon(pet.type)}
                          </div>
                          <div className="absolute -top-2 -right-2">
                            {index === 0 && (
                              <Trophy className="h-6 w-6 text-yellow-500" />
                            )}
                            {index === 1 && (
                              <Star className="h-6 w-6 text-gray-400" />
                            )}
                            {index === 2 && (
                              <Star className="h-6 w-6 text-orange-500" />
                            )}
                          </div>
                        </div>
                        <p className="font-bold text-lg">{pet.name}</p>
                        <p className="text-sm text-gray-600">
                          {getOwnerName(pet)}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Badge
                            variant={index === 0 ? "default" : "secondary"}
                          >
                            Nivel {pet.level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Pets Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedPets.map((pet, index) => (
                <Card
                  key={pet.id}
                  className="bg-white/90 backdrop-blur hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    {/* Owner Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getOwnerName(pet)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {getOwnerName(pet)}
                        </p>
                        <p className="text-xs text-gray-600">Dueño</p>
                      </div>
                      {index < 3 && (
                        <div>
                          {index === 0 && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                          {index === 1 && (
                            <Star className="h-4 w-4 text-gray-400" />
                          )}
                          {index === 2 && (
                            <Star className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pet Display */}
                    <div className="text-center mb-3">
                      <div className="text-6xl mb-2">
                        {getPetIcon(pet.type)}
                      </div>
                      <h3 className="font-bold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getPetTypeName(pet.type)}
                      </p>
                    </div>

                    {/* Pet Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nivel:</span>
                        <Badge variant="outline">Nivel {pet.level}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Felicidad:</span>
                        <span
                          className={`font-medium ${getHappinessColor(pet.happiness || 0)}`}
                        >
                          {pet.happiness || 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
