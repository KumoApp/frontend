import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ArrowLeft, Users, Trophy, Star, Loader2 } from "lucide-react";
import { petsService, classService } from "../services/api";
import { PetAvatar } from "./PetAvatar";

interface EquippedItem {
  id: number;
  name: string;
  imageUrl?: string;
  category?: string;
  type?: string;
}

interface Pet {
  id: number;
  name: string;
  type: string;
  happiness: number;
  level: number;
  imageUrl?: string;
  equippedItems?: EquippedItem[];
  ownerId?: number; // ID del estudiante dueño
  student?: number;
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

interface Student {
  id: number;
  email: string;
  name: string;
  lastname: string;
  username: string;
  level: number;
  experience: number;
  coins: number;
  streak: number;
}

export function ClassroomPets({ onBack, classId }: ClassroomPetsProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>("");
  const [studentsMap, setStudentsMap] = useState<Map<number, Student>>(
    new Map(),
  );

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

      // Crear un mapa de estudiantes por ID
      if (classData?.students && Array.isArray(classData.students)) {
        const map = new Map<number, Student>();
        classData.students.forEach((student: Student) => {
          map.set(student.id, student);
        });
        setStudentsMap(map);
        console.log("[ClassroomPets] Estudiantes mapeados:", map);
      }

      // Obtener mascotas de la clase
      const response = await petsService.getAllPetsFromClass(classId);
      console.log("[ClassroomPets] Respuesta:", response);

      const list = Array.isArray(response)
        ? response
        : (response?.body ?? response?.data ?? []);

      console.log("[ClassroomPets] Lista de mascotas:", list);

      // Procesar mascotas y extraer el ownerId del objeto student
      const petsWithOwners = list.map((pet: any) => {
        console.log(`[ClassroomPets] Procesando pet ${pet.id}:`, pet);

        // El endpoint devuelve pet.student como objeto completo con { id, name, lastname, ... }
        let ownerId = null;

        if (pet.student && typeof pet.student === "object" && pet.student.id) {
          ownerId = pet.student.id;
          console.log(
            `[ClassroomPets] ✅ Pet ${pet.id} (${pet.name}) - ownerId desde pet.student.id: ${ownerId}`,
          );
        } else if (typeof pet.student === "number") {
          ownerId = pet.student;
          console.log(
            `[ClassroomPets] ✅ Pet ${pet.id} (${pet.name}) - ownerId desde pet.student: ${ownerId}`,
          );
        } else if (typeof pet.ownerId === "number") {
          ownerId = pet.ownerId;
          console.log(
            `[ClassroomPets] ✅ Pet ${pet.id} (${pet.name}) - ownerId desde pet.ownerId: ${ownerId}`,
          );
        }

        console.log(
          `[ClassroomPets] Pet ${pet.id} (${pet.name}) -> ownerId final: ${ownerId}`,
        );

        return {
          ...pet,
          ownerId: ownerId,
        };
      });

      /* OLD CODE - comentado
      const petsWithOwners = list.map((pet: any) => {
        console.log(`[ClassroomPets] ========== PROCESANDO MASCOTA ==========`);
        console.log(
          `[ClassroomPets] Objeto completo:`,
          JSON.stringify(pet, null, 2),
        );
        console.log(
          `[ClassroomPets] pet.ownerId:`,
          pet.ownerId,
          typeof pet.ownerId,
        );
        console.log(
          `[ClassroomPets] pet.studentId:`,
          pet.studentId,
          typeof pet.studentId,
        );
        console.log(
          `[ClassroomPets] pet.student:`,
          pet.student,
          typeof pet.student,
        );
        console.log(
          `[ClassroomPets] pet.userId:`,
          pet.userId,
          typeof pet.userId,
        );
        console.log(`[ClassroomPets] pet.owner:`, pet.owner);
        console.log(`[ClassroomPets] Todas las keys:`, Object.keys(pet));

        // Obtener el ownerId de diferentes posibles ubicaciones
        let ownerId = null;

        // Intentar diferentes propiedades
        if (typeof pet.ownerId === "number") {
          ownerId = pet.ownerId;
          console.log(`[ClassroomPets] ✅ Usando pet.ownerId:`, ownerId);
        } else if (typeof pet.studentId === "number") {
          ownerId = pet.studentId;
          console.log(`[ClassroomPets] ✅ Usando pet.studentId:`, ownerId);
        } else if (typeof pet.userId === "number") {
          ownerId = pet.userId;
          console.log(`[ClassroomPets] ✅ Usando pet.userId:`, ownerId);
        } else if (typeof pet.student === "number") {
          ownerId = pet.student;
          console.log(`[ClassroomPets] ✅ Usando pet.student:`, ownerId);
        } else if (pet.owner && typeof pet.owner.id === "number") {
          ownerId = pet.owner.id;
          console.log(`[ClassroomPets] ✅ Usando pet.owner.id:`, ownerId);
        } else if (pet.owner && typeof pet.owner === "number") {
          ownerId = pet.owner;
          console.log(`[ClassroomPets] ✅ Usando pet.owner:`, ownerId);
        }

        console.log(`[ClassroomPets] ownerId FINAL detectado:`, ownerId);
        console.log(
          `[ClassroomPets] ==========================================`,
        );

        return {
          ...pet,
          ownerId: ownerId,
        };
      });
      */

      console.log(
        "[ClassroomPets] Mascotas con owners procesadas:",
        petsWithOwners,
      );
      setPets(petsWithOwners);
    } catch (e: any) {
      console.error("[ClassroomPets] Error cargando mascotas:", e);
      setError("No se pudieron cargar las mascotas del salón.");
    } finally {
      setLoading(false);
    }
  }

  const getPetIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "CAT":
        return "🐱";
      case "DOG":
        return "🐕";
      case "BIRD":
        return "🐦";
      case "TURTLE":
        return "🐢";
      case "RABBIT":
        return "🐰";
      case "DUCK":
        return "🦆";
      case "HAMSTER":
        return "🐹";
      case "UNICORN":
        return "🦄";
      default:
        return "🐾";
    }
  };

  const getPetTypeName = (type: string) => {
    switch (type.toUpperCase()) {
      case "CAT":
        return "Gato";
      case "DOG":
        return "Perro";
      case "BIRD":
        return "Pájaro";
      case "TURTLE":
        return "Tortuga";
      case "RABBIT":
        return "Conejo";
      case "DUCK":
        return "Pato";
      case "HAMSTER":
        return "Hámster";
      case "UNICORN":
        return "Unicornio";
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
    console.log(
      "[ClassroomPets] getOwnerName para pet:",
      pet.id,
      "ownerId:",
      pet.ownerId,
    );

    // Si tiene ownerId, buscar en el mapa de estudiantes
    if (pet.ownerId && studentsMap.has(pet.ownerId)) {
      const student = studentsMap.get(pet.ownerId)!;
      const fullName = student.lastname
        ? `${student.name} ${student.lastname}`
        : student.name;
      console.log("[ClassroomPets] Nombre encontrado:", fullName);
      return fullName;
    }

    // Intentar con el objeto owner del pet
    if (pet.owner && pet.owner.name) {
      const { name, lastname } = pet.owner;
      return lastname ? `${name} ${lastname}` : name;
    }

    // Fallback
    console.warn(
      "[ClassroomPets] No se encontró nombre para pet:",
      pet.id,
      "ownerId:",
      pet.ownerId,
    );
    if (pet.ownerId) {
      return `Estudiante #${pet.ownerId}`;
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
                        <div className="relative mb-2 flex justify-center">
                          <PetAvatar
                            petType={pet.type}
                            petImageUrl={pet.imageUrl}
                            equippedItems={pet.equippedItems}
                            size="lg"
                          />
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
                      <div className="mb-2 flex justify-center">
                        <PetAvatar
                          petType={pet.type}
                          petImageUrl={pet.imageUrl}
                          equippedItems={pet.equippedItems}
                          size="lg"
                        />
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
