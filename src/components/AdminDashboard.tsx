import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Users,
  Shield,
  GraduationCap,
  BookOpen,
  UserPlus,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userService, classService } from "../services/api";
import apiClient from "../services/api";
import { toast } from "sonner";

interface AdminData {
  name: string;
  email: string;
}

interface AdminDashboardProps {
  adminData: AdminData;
  onLogout: () => void;
}

type Role = "student" | "teacher" | "admin" | "unknown";

interface User {
  id: number | string;
  username: string;
  email: string;
  name: string;
  lastname?: string;
  role: Role;
}

const BASE_URL = "https://kumoapp.duckdns.org:62483";
const USERS_URL = `${BASE_URL}/users`;
const STUDENTS_URL = `${BASE_URL}/users/students`;

export function AdminDashboard({ adminData, onLogout }: AdminDashboardProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]); // Todos los usuarios para la tabla
  const [students, setStudents] = useState<User[]>([]); // Solo estudiantes para el selector
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Estados para modales de creación
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  // Estados para formularios
  const [teacherForm, setTeacherForm] = useState({
    email: "",
    name: "",
    lastname: "",
    username: "",
    password: "",
  });

  const [studentForm, setStudentForm] = useState({
    email: "",
    name: "",
    lastname: "",
    username: "",
    password: "",
  });

  const [classes, setClasses] = useState<any[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsersAndStudents() {
      try {
        setLoading(true);
        setErr(null);

        // Cargar todos los usuarios para la tabla
        const usersResponse = await fetch(USERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersJson = await usersResponse.json();
        const rawUsers = usersJson?.body ?? usersJson ?? [];
        // Mapear el rol del backend (mayúsculas) al formato del frontend (minúsculas)
        const usersList: User[] = rawUsers.map((u: any) => ({
          ...u,
          role: u.role?.toLowerCase() || "unknown",
        }));
        if (!cancelled) setUsers(usersList);

        // Cargar solo estudiantes para el selector de asignación
        const studentsResponse = await fetch(STUDENTS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const studentsJson = await studentsResponse.json();
        const studentsList: User[] = studentsJson?.body ?? studentsJson ?? [];
        if (!cancelled) setStudents(studentsList);

        // Cargar todas las clases
        const classesResponse = await apiClient.get("/classes/");
        const classesList: any[] =
          classesResponse?.data?.body ?? classesResponse?.data ?? [];
        if (!cancelled) setClasses(classesList);
      } catch (e: any) {
        if (!cancelled) setErr("No se pudieron cargar los datos");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) loadUsersAndStudents();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Cargar clases y todos los usuarios

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      students: users.filter((u) => u.role === "student").length,
      teachers: users.filter((u) => u.role === "teacher").length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users],
  );

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "student":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Estudiante
          </Badge>
        );
      case "teacher":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Profesor
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Administrador
          </Badge>
        );
      case "unknown":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Sistema
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {role}
          </Badge>
        );
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "student":
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "teacher":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "unknown":
        return <Users className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir envíos múltiples
    if (formLoading) return;

    setFormError(null);
    setFormLoading(true);

    try {
      console.log("[AdminDashboard] Creando profesor:", {
        ...teacherForm,
        classes: [],
      });

      const response = await userService.createTeacher({
        ...teacherForm,
        classes: [],
      });
      console.log("[AdminDashboard] Respuesta del servidor:", response);

      if (response.ok || response.code === 201 || response.code === 200) {
        // Resetear formulario
        setTeacherForm({
          email: "",
          name: "",
          lastname: "",
          username: "",
          password: "",
        });
        setShowTeacherForm(false);

        // Mostrar mensaje de éxito
        toast.success(
          `Profesor ${teacherForm.name} ${teacherForm.lastname} creado exitosamente`,
          {
            duration: 4000,
          },
        );

        // Recargar lista de usuarios
        const r = await fetch(USERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        const list: User[] = j?.body ?? j ?? [];
        setUsers(list);
      } else {
        setFormError(response.error || "Error al crear profesor");
      }
    } catch (error: any) {
      console.error("Error creating teacher:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      if (
        errorMessage?.includes("Unique constraint") ||
        errorMessage?.includes("email")
      ) {
        setFormError(
          "Este email ya está registrado. Por favor usa otro email.",
        );
      } else if (errorMessage?.includes("username")) {
        setFormError(
          "Este nombre de usuario ya está en uso. Por favor usa otro.",
        );
      } else {
        setFormError(
          errorMessage ||
            "Error al crear profesor. Por favor verifica los datos.",
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir envíos múltiples
    if (formLoading) return;

    setFormError(null);
    setFormLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      console.log(
        "[AdminDashboard] Token en localStorage:",
        token ? `${token.substring(0, 20)}...` : "NO TOKEN",
      );
      console.log("[AdminDashboard] Creando estudiante:", {
        ...studentForm,
        classes: [],
      });

      const response = await userService.createStudent({
        ...studentForm,
        classes: [],
      });
      console.log("[AdminDashboard] Respuesta del servidor:", response);

      if (response.ok || response.code === 201 || response.code === 200) {
        // Resetear formulario
        setStudentForm({
          email: "",
          name: "",
          lastname: "",
          username: "",
          password: "",
        });
        setShowStudentForm(false);

        // Mostrar mensaje de éxito
        toast.success(
          `Estudiante ${studentForm.name} ${studentForm.lastname} creado exitosamente`,
          {
            duration: 4000,
          },
        );

        // Recargar lista de usuarios
        const r = await fetch(USERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        const list: User[] = j?.body ?? j ?? [];
        setUsers(list);
      } else {
        setFormError(response.error || "Error al crear estudiante");
      }
    } catch (error: any) {
      console.error("[AdminDashboard] Error creating student:", error);
      console.error("[AdminDashboard] Error response:", error?.response);
      console.error("[AdminDashboard] Error data:", error?.response?.data);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      if (
        errorMessage?.includes("Unique constraint") ||
        errorMessage?.includes("email")
      ) {
        setFormError(
          "Este email ya está registrado. Por favor usa otro email.",
        );
      } else if (errorMessage?.includes("username")) {
        setFormError(
          "Este nombre de usuario ya está en uso. Por favor usa otro.",
        );
      } else {
        setFormError(
          errorMessage ||
            "Error al crear estudiante. Por favor verifica los datos.",
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Panel de Administración</h1>
                  <p className="text-sm text-gray-600">
                    Bienvenido, {adminData.name}
                  </p>
                </div>
              </div>
            </div>
            <ProfileDropdown
              userName={adminData.name}
              userEmail={adminData.email}
              userType="admin"
              onLogout={onLogout}
              onSettings={() => console.log("Abrir configuración")}
              onProfile={() => console.log("Abrir perfil")}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Usuarios
                  </p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowTeacherForm(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Crear Profesor
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Agregar nuevo docente
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowStudentForm(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Crear Estudiante
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Agregar nuevo alumno
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Todos los Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando usuarios...</p>
            ) : err ? (
              <p className="text-sm text-red-600">{err}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {user.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {user.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            {getRoleBadge(user.role)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Clases */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Todas las Clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando clases...</p>
            ) : err ? (
              <p className="text-sm text-red-600">{err}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Profesor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {classItem.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {classItem.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {classItem.teacher
                            ? `${classItem.teacher.name} ${classItem.teacher.lastname}`
                            : "Sin profesor asignado"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para crear profesor */}
      {showTeacherForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Crear Profesor
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTeacherForm(false);
                  setFormError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email *</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    required
                    value={teacherForm.email}
                    onChange={(e) =>
                      setTeacherForm({ ...teacherForm, email: e.target.value })
                    }
                    placeholder="profesor@utec.edu.pe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Nombre *</Label>
                  <Input
                    id="teacher-name"
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) =>
                      setTeacherForm({ ...teacherForm, name: e.target.value })
                    }
                    placeholder="Juan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-lastname">Apellido *</Label>
                  <Input
                    id="teacher-lastname"
                    type="text"
                    required
                    value={teacherForm.lastname}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        lastname: e.target.value,
                      })
                    }
                    placeholder="Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-username">Usuario *</Label>
                  <Input
                    id="teacher-username"
                    type="text"
                    required
                    value={teacherForm.username}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        username: e.target.value,
                      })
                    }
                    placeholder="jperez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Contraseña *</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    required
                    value={teacherForm.password}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowTeacherForm(false);
                      setFormError(null);
                    }}
                    disabled={formLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-black"
                    disabled={formLoading}
                  >
                    {formLoading ? "Creando..." : "Crear Profesor"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para crear estudiante */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Crear Estudiante
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowStudentForm(false);
                  setFormError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="student-email">Email *</Label>
                  <Input
                    id="student-email"
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, email: e.target.value })
                    }
                    placeholder="estudiante@utec.edu.pe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-name">Nombre *</Label>
                  <Input
                    id="student-name"
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, name: e.target.value })
                    }
                    placeholder="María"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-lastname">Apellido *</Label>
                  <Input
                    id="student-lastname"
                    type="text"
                    required
                    value={studentForm.lastname}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        lastname: e.target.value,
                      })
                    }
                    placeholder="González"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-username">Usuario *</Label>
                  <Input
                    id="student-username"
                    type="text"
                    required
                    value={studentForm.username}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        username: e.target.value,
                      })
                    }
                    placeholder="mgonzalez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password">Contraseña *</Label>
                  <Input
                    id="student-password"
                    type="password"
                    required
                    value={studentForm.password}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowStudentForm(false);
                      setFormError(null);
                    }}
                    disabled={formLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-black"
                    disabled={formLoading}
                  >
                    {formLoading ? "Creando..." : "Crear Estudiante"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
