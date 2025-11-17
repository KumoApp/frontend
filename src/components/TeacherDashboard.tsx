import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ProfileDropdown } from "./ProfileDropdown";
import { QuizHistory } from "./QuizHistory";
import {
  Users,
  Upload,
  FileText,
  BarChart3,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  Eye,
  Download,
  Star,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { materialService } from "../services/api";
import { Material as MaterialType } from "../types/material";

interface TeacherData {
  name: string;
  email: string;
  classes: string[]; // fallback si API falla
}

interface TeacherDashboardProps {
  teacherData: TeacherData;
  onLogout: () => void;
}

interface ApiStudent {
  id: number | string;
  email: string;
  name: string;
  lastname?: string;
  username?: string;
}

interface ApiClassDetail {
  id: number | string;
  name: string;
  subject?: string;
  students: ApiStudent[];
  teacher?: {
    id: number | string;
    email: string;
    name: string;
    lastname?: string;
    username?: string;
  };
}

interface Material {
  id: string;
  name: string;
  type: "pdf" | "ppt" | "doc";
  uploadDate: Date;
  class: string;
  downloads: number;
  size: string;
}

type ClassInfo = {
  id: string;
  name: string;
  subject?: string;
  teacher?: string;
  color: string;
};

const BASE = "http://localhost:3000";
// Cambia este listado si tu backend usa otro path para "clases del docente"
const CLASSES_LIST_URL = `${BASE}/classes/`;

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

export function TeacherDashboard({
  teacherData,
  onLogout,
}: TeacherDashboardProps) {
  const { token } = useAuth();

  // Estados de clases y selección
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);

  // Detalle de la clase seleccionada (para estudiantes)
  const [classDetail, setClassDetail] = useState<ApiClassDetail | null>(null);
  const [classDetailLoading, setClassDetailLoading] = useState(false);
  const [classDetailError, setClassDetailError] = useState<string | null>(null);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewingStudentHistory, setViewingStudentHistory] = useState<
    string | null
  >(null);

  // Crear nueva clase
  const [createName, setCreateName] = useState("");
  const [createSubject, setCreateSubject] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    [token],
  );

  // 1) Cargar lista de clases del docente
  useEffect(() => {
    let cancelled = false;
    async function loadTeacherClasses() {
      try {
        setClassesLoading(true);
        setClassesError(null);
        const resp = await fetch(CLASSES_LIST_URL, { headers });
        if (!resp.ok) {
          let detail = "";
          try {
            const j = await resp.json();
            detail = j?.message || j?.error || "";
          } catch {}
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
          setClasses([]);
          setSelectedClass(null);
          setClassesError("No se pudieron cargar tus clases desde la API.");
          console.error("Error listando clases del docente:", e);
        }
      } finally {
        if (!cancelled) setClassesLoading(false);
      }
    }
    if (token) loadTeacherClasses();
    return () => {
      cancelled = true;
    };
  }, [headers, token, teacherData.classes]);

  // 2) Cargar detalle de la clase seleccionada con GET /classes/{id} (incluye students)
  useEffect(() => {
    let cancelled = false;
    async function loadClassDetail(id: string) {
      try {
        setClassDetailLoading(true);
        setClassDetailError(null);
        const resp = await fetch(`${BASE}/classes/${id}`, { headers });
        if (!resp.ok) {
          let detail = "";
          try {
            const j = await resp.json();
            detail = j?.message || j?.error || "";
          } catch {}
          throw new Error(
            `HTTP ${resp.status} ${resp.statusText}${detail ? ` - ${detail}` : ""}`,
          );
        }
        const json = await resp.json();
        const body: ApiClassDetail = (json?.body ?? json) as ApiClassDetail;
        if (!cancelled) setClassDetail(body);
      } catch (e: any) {
        if (!cancelled) {
          setClassDetail(null);
          setClassDetailError(
            "No se pudo cargar el detalle de la clase (students).",
          );
          console.error("Error GET /classes/{id}:", e);
        }
      } finally {
        if (!cancelled) setClassDetailLoading(false);
      }
    }
    if (selectedClass?.id) loadClassDetail(selectedClass.id);
    else {
      setClassDetail(null);
      setClassDetailError(null);
    }
    return () => {
      cancelled = true;
    };
  }, [headers, selectedClass?.id]);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    const payload: any = {
      name: createName.trim(),
      students: [] as Array<string | number>,
    };
    if (createSubject.trim()) payload.subject = createSubject.trim();
    if (!payload.name) {
      setCreateError("El nombre de la clase es obligatorio.");
      return;
    }
    try {
      setCreatingClass(true);
      const resp = await fetch(`${BASE}/classes/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const ct = resp.headers.get("content-type") || "";
      if (!resp.ok) {
        let detail = "";
        try {
          if (ct.includes("application/json")) {
            const errJson = await resp.json();
            detail =
              errJson?.message || errJson?.error || JSON.stringify(errJson);
          } else {
            detail = (await resp.text()).slice(0, 140);
          }
        } catch {}
        throw new Error(
          `HTTP ${resp.status} ${resp.statusText}${detail ? ` - ${detail}` : ""}`,
        );
      }
      const json = ct.includes("application/json") ? await resp.json() : null;
      const created = (json?.body ?? json) || {};
      setCreateSuccess("Clase creada correctamente.");
      setCreateName("");
      setCreateSubject("");

      // Refrescar lista de clases
      try {
        const listResp = await fetch(CLASSES_LIST_URL, { headers });
        if (listResp.ok) {
          const listJson = await listResp.json();
          const list = (listJson?.body ?? listJson ?? []) as Array<{
            id: string | number;
            name: string;
            subject?: string;
            teacher?: any;
          }>;
          const mapped: ClassInfo[] = list.map((c) => {
            const idStr = String(c.id);
            const teacherName =
              typeof c.teacher === "string"
                ? c.teacher
                : (c.teacher?.name ?? "");
            return {
              id: idStr,
              name: c.name,
              subject: c.subject,
              teacher: teacherName,
              color: colorFromId(idStr),
            };
          });
          setClasses(mapped);
          const createdId = created?.id ? String(created.id) : null;
          const toSelect = createdId
            ? mapped.find((c) => c.id === createdId)
            : mapped.find((c) => c.name === payload.name);
          if (toSelect) setSelectedClass(toSelect);
        }
      } catch {}
    } catch (err: any) {
      setCreateError(err?.message || "No se pudo crear la clase.");
    } finally {
      setCreatingClass(false);
    }
  }

  // ====== Materiales ======
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Cargar materiales de la clase seleccionada
  useEffect(() => {
    let cancelled = false;
    async function loadMaterials() {
      if (!selectedClass) {
        setMaterials([]);
        return;
      }
      try {
        setMaterialsLoading(true);
        setMaterialsError(null);
        const response = await materialService.getMaterialInfoFromClass(
          selectedClass.id,
        );
        const list = Array.isArray(response)
          ? response
          : (response?.body ?? response?.data ?? []);
        if (!cancelled) {
          setMaterials(
            list.map((m: any) => ({
              id: m.id,
              name: m.name || "Material sin nombre",
              type: m.type || "unknown",
              uploadDate: m.uploadDate || m.createdAt,
              classId: selectedClass.id,
              url: m.url,
              size: m.size,
              downloads: m.downloads || 0,
            })),
          );
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Error cargando materiales:", e);
          setMaterialsError("No se pudieron cargar los materiales.");
          setMaterials([]);
        }
      } finally {
        if (!cancelled) setMaterialsLoading(false);
      }
    }
    loadMaterials();
    return () => {
      cancelled = true;
    };
  }, [selectedClass?.id]);

  const handleFileUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFile || !selectedClass) return;

    setUploadingFile(true);
    try {
      const response = await materialService.uploadMaterialToClass(
        selectedClass.id,
        uploadFile,
      );
      console.log("Material subido:", response);

      // Recargar materiales
      const materialsResponse = await materialService.getMaterialInfoFromClass(
        selectedClass.id,
      );
      const list = Array.isArray(materialsResponse)
        ? materialsResponse
        : (materialsResponse?.body ?? materialsResponse?.data ?? []);
      setMaterials(
        list.map((m: any) => ({
          id: m.id,
          name: m.name || "Material sin nombre",
          type: m.type || "unknown",
          uploadDate: m.uploadDate || m.createdAt,
          classId: selectedClass.id,
          url: m.url,
          size: m.size,
          downloads: m.downloads || 0,
        })),
      );

      setUploadFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Error subiendo material:", err);
      alert(
        "Error al subir el archivo: " + (err.message || "Error desconocido"),
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileIcon = (type: Material["type"]) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "ppt":
        return "📊";
      case "doc":
        return "📝";
      default:
        return "📄";
    }
  };

  // === Datos derivados a partir del detalle (students) ===
  const students: ApiStudent[] = classDetail?.students ?? [];

  // Si no tienes métricas todavía, muestro placeholders “—”
  // Si luego tu API trae nivel/racha/promedios, mapea aquí.
  const totalStudents = students.length;

  // Materials ya están filtrados por selectedClass en el useEffect, no necesitamos filtrar de nuevo

  if (viewingStudentHistory && students.length > 0) {
    const st = students.find((s) => String(s.id) === viewingStudentHistory);
    if (!selectedClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setViewingStudentHistory(null)}
            >
              Volver
            </Button>
            <Card className="mt-6">
              <CardContent className="p-6">
                Selecciona una clase para ver el historial de quizzes del
                estudiante.
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <QuizHistory
        onBack={() => setViewingStudentHistory(null)}
        classId={selectedClass.id}
        studentName={st ? `${st.name} ${st.lastname ?? ""}`.trim() : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-xl">🐱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Panel de Profesor</h1>
                  <p className="text-sm text-gray-600">
                    Bienvenido, {teacherData.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={selectedClass?.id}
                onValueChange={(value) => {
                  const found = classes.find((c) => c.id === value);
                  if (found) setSelectedClass(found);
                }}
                disabled={classesLoading || classes.length === 0}
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
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="font-medium">
                          {c.name}{" "}
                          <span className="text-xs opacity-70">
                            (ID: {c.id})
                          </span>
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ProfileDropdown
                userName={teacherData.name}
                userEmail={teacherData.email}
                userType="teacher"
                onLogout={onLogout}
                onSettings={() => console.log("Abrir configuración")}
                onProfile={() => console.log("Abrir perfil")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Crear nueva clase */}
        <Card className="bg-white/90 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Crear nueva clase</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateClass}
              className="grid md:grid-cols-3 gap-3 items-end"
            >
              <div>
                <Label htmlFor="class-name">Nombre</Label>
                <Input
                  id="class-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Ej. Matemática 1"
                />
              </div>
              <div>
                <Label htmlFor="class-subject">Materia (opcional)</Label>
                <Input
                  id="class-subject"
                  value={createSubject}
                  onChange={(e) => setCreateSubject(e.target.value)}
                  placeholder="Ej. Álgebra"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creatingClass}>
                  {creatingClass ? "Creando…" : "Crear clase"}
                </Button>
                {createSuccess && (
                  <span className="text-sm text-green-600 self-center">
                    {createSuccess}
                  </span>
                )}
                {createError && (
                  <span className="text-sm text-red-600 self-center">
                    {createError}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        {/* Banner de error si falla /classes/{id} */}
        {classDetailError && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{classDetailError}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {totalStudents} total
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Material Subido
                  </p>
                  <p className="text-2xl font-bold">{materials.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {materials.reduce((acc, m) => acc + m.downloads, 0)} descargas
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Material de Clase
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          {/* Students Tab: usa students de GET /classes/{id} */}
          <TabsContent value="students">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedClass
                    ? `Estudiantes — ${selectedClass.name} (ID: ${selectedClass.id})`
                    : "Estudiantes — —"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classDetailLoading ? (
                  <div className="text-sm text-muted-foreground p-2">
                    Cargando estudiantes…
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estudiante</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Usuario</TableHead>
                          {/* Campos de “desempeño” con placeholders hasta que tu API los provea */}
                          <TableHead>Nivel</TableHead>
                          <TableHead>KumoSoles</TableHead>
                          <TableHead>Racha</TableHead>
                          <TableHead>Último Quiz</TableHead>
                          <TableHead>Promedio</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((st) => {
                          const fullName =
                            `${st.name} ${st.lastname ?? ""}`.trim();
                          return (
                            <TableRow key={String(st.id)}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {fullName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {st.email}
                              </TableCell>
                              <TableCell className="text-sm">
                                {st.username ?? "—"}
                              </TableCell>

                              {/* Placeholders de desempeño */}
                              <TableCell className="text-sm">—</TableCell>
                              <TableCell className="text-sm">—</TableCell>
                              <TableCell className="text-sm">—</TableCell>
                              <TableCell className="text-sm">
                                <span className="font-medium text-muted-foreground">
                                  —
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">—</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setViewingStudentHistory(String(st.id))
                                    }
                                    title="Ver historial de quizzes"
                                  >
                                    <History className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Ver detalles"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Enviar mensaje"
                                  >
                                    <Users className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {students.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className="text-center text-sm text-muted-foreground"
                            >
                              No hay estudiantes en esta clase.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab (demo local) */}
          <TabsContent value="materials">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Upload Form */}
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Subir Material
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="material-title">
                        Título del Material
                      </Label>
                      <Input
                        id="material-title"
                        placeholder="Ej: Introducción al Cálculo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="material-description">Descripción</Label>
                      <Textarea
                        id="material-description"
                        placeholder="Breve descripción del contenido..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="material-class">Clase</Label>
                      <Select
                        value={selectedClass?.id}
                        onValueChange={(value) => {
                          const c = classes.find((x) => x.id === value);
                          if (c) setSelectedClass(c);
                        }}
                        disabled={classesLoading || classes.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona clase" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: c.color }}
                                />
                                <span className="font-medium">
                                  {c.name}{" "}
                                  <span className="text-xs opacity-70">
                                    (ID: {c.id})
                                  </span>
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="file-upload">Archivo PDF</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === "application/pdf") {
                            setUploadFile(file);
                          } else if (file) {
                            alert("Por favor selecciona solo archivos PDF");
                            e.target.value = "";
                            setUploadFile(null);
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Solo archivos PDF
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={uploadingFile || !selectedClass}
                    >
                      {uploadingFile ? "Subiendo..." : "Subir Material"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Materials List */}
              <Card className="lg:col-span-2 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Material Subido{" "}
                      {selectedClass ? `— ${selectedClass.name}` : ""}
                    </span>
                    <Badge variant="secondary">
                      {materials.length} archivos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFileIcon(material.type)}
                          </span>
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{selectedClass?.name || "Sin clase"}</span>
                              <span>
                                {material.uploadDate
                                  ? new Date(
                                      material.uploadDate,
                                    ).toLocaleDateString()
                                  : "—"}
                              </span>
                              <span>{material.size || "—"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {material.downloads}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {materials.length === 0 && (
                      <div className="text-sm text-muted-foreground p-2">
                        No hay materiales para esta clase.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab (placeholders) */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progreso de la Clase —{" "}
                    {selectedClass
                      ? `${selectedClass.name} (ID: ${selectedClass.id})`
                      : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Las métricas de análisis se mostrarán cuando estén
                      disponibles desde el backend.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad Reciente —{" "}
                    {selectedClass ? selectedClass.name : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      La actividad reciente se mostrará cuando esté disponible
                      desde el backend.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
