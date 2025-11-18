import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  MessageCircle,
  BookOpen,
  Trophy,
  Sparkles,
  Users,
  Gift,
  History,
  Package,
} from "lucide-react";

import { ChatBot } from "./ChatBot";
import { QuizModal } from "./QuizModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { QuizHistory } from "./QuizHistory";
import { Shop } from "./Shop";
import { Inventory } from "./Inventory";
import { PetManager } from "./PetManager";
import { ClassroomPets } from "./ClassroomPets";
import { useAuth } from "../contexts/AuthContext";
import { userService, UserInClassData } from "../services/api";

export interface ClassInfo {
  id: string;
  name: string;
  subject?: string;
  teacher?: string;
  color: string;
}

interface StudentData {
  name: string;
  kumoSoles: number;
  streak: number;
  level: number;
  petName: string;
}

interface StudentDashboardProps {
  onLogout: () => void;
  userData?: {
    name: string;
    email: string;
  };
}

const BASE = "http://localhost:3000";

// genera color estable por id
function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 80%)`;
}

export function StudentDashboard({
  onLogout,
  userData,
}: StudentDashboardProps) {
  const { token } = useAuth();

  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "chat"
    | "quiz"
    | "customize"
    | "history"
    | "shop"
    | "inventory"
    | "pet-manager"
    | "classroom"
  >("dashboard");

  const [studentData, setStudentData] = useState<StudentData>({
    name: userData?.name || "Estudiante",
    kumoSoles: 0,
    streak: 0,
    level: 1,
    petName: "",
  });

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`, // Token del estudiante
      "Content-Type": "application/json",
    }),
    [token],
  );

  // Cargar SOLO las clases donde está el estudiante -> GET /classes/
  useEffect(() => {
    let cancelled = false;
    async function loadMyClasses() {
      try {
        setClassesLoading(true);
        setClassesError(null);

        const resp = await fetch(`${BASE}/classes/`, { headers });

        if (!resp.ok) {
          let detail = "";
          try {
            const errJson = await resp.json();
            detail = errJson?.message || JSON.stringify(errJson);
          } catch {
            /* ignore */
          }
          throw new Error(
            `HTTP ${resp.status} ${resp.statusText}${detail ? ` - ${detail}` : ""}`,
          );
        }

        const json = await resp.json();
        const list = (json?.body ?? json ?? []) as Array<{
          id: number | string;
          name: string;
          subject?: string;
          teacher?: { name?: string } | string;
        }>;

        const mapped: ClassInfo[] = list.map((c) => {
          const idStr = String(c.id);
          const teacherName =
            typeof c.teacher === "string" ? c.teacher : (c.teacher?.name ?? "");
          return {
            id: idStr,
            name: c.name,
            subject: c.subject,
            teacher: teacherName,
            color: colorFromId(idStr),
          };
        });

        if (!cancelled) {
          setClasses(mapped);
          if (mapped.length > 0) setSelectedClass(mapped[0]);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Error cargando /classes/:", e);
          setClassesError(
            "No se pudieron cargar tus clases. Revisa el token de estudiante o los permisos.",
          );
        }
      } finally {
        if (!cancelled) setClassesLoading(false);
      }
    }
    if (token) loadMyClasses();
    return () => {
      cancelled = true;
    };
  }, [headers, token]);

  // Cargar datos del estudiante en la clase seleccionada
  useEffect(() => {
    console.log(
      "[StudentDashboard] useEffect para cargar datos - selectedClass:",
      selectedClass,
    );

    let cancelled = false;
    async function loadStudentDataInClass() {
      if (!selectedClass) {
        console.log(
          "[StudentDashboard] No hay clase seleccionada, saliendo...",
        );
        return;
      }

      try {
        console.log(
          `[StudentDashboard] Iniciando carga de datos para clase ${selectedClass.id}`,
        );
        console.log(
          "[StudentDashboard] Llamando a userService.getMyDataInClass...",
        );

        const response = await userService.getMyDataInClass(selectedClass.id);

        console.log("[StudentDashboard] Respuesta completa:", response);
        console.log("[StudentDashboard] response.body:", response.body);

        const data: UserInClassData = response.body || response;

        console.log("[StudentDashboard] Datos extraídos:", {
          coins: data.coins,
          level: data.level,
          streak: data.streak,
          name: data.name,
          lastname: data.lastname,
        });

        if (!cancelled) {
          const newData = {
            name:
              data.name && data.lastname
                ? `${data.name} ${data.lastname}`
                : userData?.name || "Estudiante",
            kumoSoles: data.coins || 0,
            streak: data.streak || 0,
            level: data.level || 1,
          };

          console.log(
            "[StudentDashboard] Actualizando studentData con:",
            newData,
          );

          setStudentData((prev) => ({
            ...prev,
            ...newData,
          }));

          console.log(
            "[StudentDashboard] ✅ Datos del estudiante actualizados correctamente",
          );
        } else {
          console.log(
            "[StudentDashboard] ⚠️ Actualización cancelada (componente desmontado)",
          );
        }
      } catch (e: any) {
        console.error(
          "[StudentDashboard] ❌ Error cargando datos del estudiante en clase:",
          e,
        );
        console.error("[StudentDashboard] Error stack:", e.stack);
        console.error("[StudentDashboard] Error message:", e.message);
      }
    }

    if (selectedClass) {
      console.log("[StudentDashboard] Ejecutando loadStudentDataInClass()...");
      loadStudentDataInClass();
    } else {
      console.log(
        "[StudentDashboard] No se ejecuta loadStudentDataInClass (no hay clase seleccionada)",
      );
    }

    return () => {
      console.log("[StudentDashboard] Limpiando useEffect");
      cancelled = true;
    };
  }, [selectedClass, userData?.name]);

  const streakMultiplier = studentData.streak >= 3 ? 1.25 : 1;

  const handleQuizComplete = async (score: number) => {
    const baseReward = 100;
    const reward = Math.floor(baseReward * (score / 100) * streakMultiplier);

    // Actualizar localmente primero
    setStudentData((prev) => ({
      ...prev,
      kumoSoles: prev.kumoSoles + reward,
      streak: prev.streak + 1,
    }));

    // Recargar datos del backend después de un pequeño delay
    if (selectedClass) {
      setTimeout(async () => {
        try {
          const response = await userService.getMyDataInClass(selectedClass.id);
          const data: UserInClassData = response.body || response;
          setStudentData((prev) => ({
            ...prev,
            kumoSoles: data.coins || prev.kumoSoles,
            streak: data.streak || prev.streak,
            level: data.level || prev.level,
          }));
        } catch (e) {
          console.error("Error recargando datos después del quiz:", e);
        }
      }, 1000);
    }
  };

  const handlePurchaseComplete = async (newBalance?: number) => {
    // Si la tienda nos da el nuevo balance, lo usamos
    if (newBalance !== undefined) {
      setStudentData((prev) => ({ ...prev, kumoSoles: newBalance }));
    }

    // Recargar datos del backend para asegurar sincronización
    if (selectedClass) {
      try {
        const response = await userService.getMyDataInClass(selectedClass.id);
        const data: UserInClassData = response.body || response;
        setStudentData((prev) => ({
          ...prev,
          kumoSoles: data.coins || prev.kumoSoles,
          level: data.level || prev.level,
        }));
      } catch (e) {
        console.error("Error recargando datos después de compra:", e);
      }
    }
  };

  // Vistas secundarias
  if (activeView === "chat") {
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                {classesLoading
                  ? "Cargando clases…"
                  : "Selecciona una clase para abrir el chat."}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <ChatBot
        onBack={() => setActiveView("dashboard")}
        selectedClass={selectedClass}
        classes={classes}
        onClassChange={setSelectedClass}
      />
    );
  }

  if (activeView === "history") {
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                {classesLoading
                  ? "Cargando clases…"
                  : "Selecciona una clase para ver el historial de quizzes."}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <QuizHistory
        onBack={() => setActiveView("dashboard")}
        classId={selectedClass.id}
        studentName={studentData.name}
      />
    );
  }

  if (activeView === "shop") {
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                Selecciona una clase para acceder a la tienda.
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <Shop
        onBack={() => setActiveView("dashboard")}
        classId={selectedClass.id}
        kumoSoles={studentData.kumoSoles}
        onPurchase={handlePurchaseComplete}
      />
    );
  }

  if (activeView === "inventory") {
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                Selecciona una clase para ver tu inventario.
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <Inventory
        onBack={() => setActiveView("dashboard")}
        classId={selectedClass.id}
      />
    );
  }

  if (activeView === "pet-manager") {
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                Selecciona una clase para gestionar tu mascota.
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <PetManager
        onBack={() => setActiveView("dashboard")}
        classId={selectedClass.id}
      />
    );
  }

  if (activeView === "classroom") {
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                Selecciona una clase para ver las mascotas del salón.
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <ClassroomPets
        onBack={() => setActiveView("dashboard")}
        classId={selectedClass.id}
      />
    );
  }

  // Vista principal (dashboard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                ¡Hola, {studentData.name}! 👋
              </h1>
              <p className="text-gray-600">
                ¿Listo para aprender algo nuevo hoy?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={selectedClass?.id}
                onValueChange={(value) => {
                  const classInfo = classes.find((c) => c.id === value);
                  if (classInfo) setSelectedClass(classInfo);
                }}
                disabled={
                  classesLoading || !!classesError || classes.length === 0
                }
              >
                <SelectTrigger className="w-72">
                  <SelectValue
                    placeholder={
                      classesLoading
                        ? "Cargando…"
                        : classesError || "Selecciona clase"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classInfo) => (
                    <SelectItem key={classInfo.id} value={classInfo.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: classInfo.color }}
                        />
                        <span className="font-medium">
                          {classInfo.name}{" "}
                          <span className="text-xs opacity-70">
                            (ID: {classInfo.id})
                          </span>
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ProfileDropdown
                userName={studentData.name}
                userEmail={userData?.email}
                userType="student"
                onLogout={onLogout}
                onSettings={() => console.log("Abrir configuración")}
                onProfile={() => console.log("Abrir perfil")}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {studentData.kumoSoles}
              </p>
              <p className="text-sm text-gray-600">KumoSoles</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-orange-500" />
                {streakMultiplier > 1 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    x{streakMultiplier}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-primary">
                {studentData.streak}
              </p>
              <p className="text-sm text-gray-600">Días seguidos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {studentData.level}
              </p>
              <p className="text-sm text-gray-600">Nivel</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-primary">
                <span className="text-white text-xl">🐱</span>
              </div>
              <p className="text-sm font-medium">{studentData.petName}</p>
              <p className="text-xs text-gray-600">Tu mascota</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <Button
            onClick={() => setActiveView("chat")}
            className="h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90"
            disabled={!selectedClass}
            title={
              !selectedClass ? "Selecciona una clase primero" : "Abrir chat"
            }
          >
            <MessageCircle className="h-8 w-8" />
            <span>Pregunta al Chat</span>
          </Button>

          <Button
            onClick={() => {
              if (!selectedClass) {
                alert("Primero selecciona una clase en el selector superior.");
                return;
              }
              setActiveView("quiz");
            }}
            variant="secondary"
            className="h-24 flex flex-col gap-2"
            disabled={!selectedClass}
            title={
              !selectedClass
                ? "Selecciona una clase primero"
                : "Abrir quiz diario"
            }
          >
            <BookOpen className="h-8 w-8" />
            <span>Quiz Diario</span>
          </Button>

          <Button
            onClick={() => setActiveView("history")}
            variant="outline"
            className="h-24 flex flex-col gap-2"
          >
            <History className="h-8 w-8" />
            <span>Historial de Quizzes</span>
          </Button>
          <Button
            onClick={() => setActiveView("shop")}
            variant="outline"
            className="h-24 flex flex-col gap-2"
            disabled={!selectedClass}
            title={
              !selectedClass ? "Selecciona una clase primero" : "Abrir tienda"
            }
          >
            <Gift className="h-8 w-8" />
            <span>Tienda</span>
          </Button>

          <Button
            onClick={() => setActiveView("inventory")}
            variant="outline"
            className="h-24 flex flex-col gap-2"
            disabled={!selectedClass}
            title={
              !selectedClass ? "Selecciona una clase primero" : "Ver inventario"
            }
          >
            <Package className="h-8 w-8" />
            <span>Inventario</span>
          </Button>

          <Button
            onClick={() => setActiveView("pet-manager")}
            variant="outline"
            className="h-24 flex flex-col gap-2"
            disabled={!selectedClass}
            title={
              !selectedClass
                ? "Selecciona una clase primero"
                : "Gestionar mascota"
            }
          >
            <Sparkles className="h-8 w-8" />
            <span>Mi Mascota</span>
          </Button>

          <Button
            onClick={() => setActiveView("classroom")}
            variant="outline"
            className="h-24 flex flex-col gap-2"
            disabled={!selectedClass}
            title={
              !selectedClass
                ? "Selecciona una clase primero"
                : "Ver mascotas del salón"
            }
          >
            <Users className="h-8 w-8" />
            <span>Mascotas del Salón</span>
          </Button>
        </div>

        {/* Progreso + Actividad */}
        <Card className="bg-white/90 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Tu Progreso Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Quizzes completados</span>
                  <span>5/7</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso hacia el siguiente nivel</span>
                  <span>650/800 XP</span>
                </div>
                <Progress value={81} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal del Quiz Diario (pasa classId desde el selector superior) */}
        {activeView === "quiz" && selectedClass && (
          <QuizModal
            classId={selectedClass.id} // <- AQUÍ se cablea el ID del selector superior
            onClose={() => setActiveView("dashboard")}
            onComplete={handleQuizComplete}
            streakMultiplier={streakMultiplier}
          />
        )}

        {classesError && (
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-red-600 text-sm">
              {classesError}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
