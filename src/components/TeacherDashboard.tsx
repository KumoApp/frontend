import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProfileDropdown } from './ProfileDropdown';
import { QuizHistory } from './QuizHistory';
import { 
  Users, 
  Upload, 
  FileText, 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  Calendar,
  BookOpen,
  MessageCircle,
  Download,
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react';

interface TeacherData {
  name: string;
  email: string;
  classes: string[];
}

interface TeacherDashboardProps {
  teacherData: TeacherData;
  onLogout: () => void;
}

interface StudentPerformance {
  id: string;
  name: string;
  class: string;
  level: number;
  kumoSoles: number;
  streak: number;
  lastQuizScore: number;
  avgScore: number;
  activeDays: number;
  status: 'active' | 'inactive' | 'struggling';
}

interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'ppt' | 'doc';
  uploadDate: Date;
  class: string;
  downloads: number;
  size: string;
}

export function TeacherDashboard({ teacherData, onLogout }: TeacherDashboardProps) {
  const [selectedClass, setSelectedClass] = useState(teacherData.classes[0]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewingStudentHistory, setViewingStudentHistory] = useState<string | null>(null);

  // Mock data for student performance
  const studentsPerformance: StudentPerformance[] = [
    {
      id: '1',
      name: 'Ana García',
      class: 'Matemáticas 10A',
      level: 8,
      kumoSoles: 1250,
      streak: 5,
      lastQuizScore: 85,
      avgScore: 82,
      activeDays: 12,
      status: 'active'
    },
    {
      id: '2',
      name: 'Carlos Mendoza',
      class: 'Matemáticas 10A',
      level: 12,
      kumoSoles: 2100,
      streak: 12,
      lastQuizScore: 95,
      avgScore: 91,
      activeDays: 18,
      status: 'active'
    },
    {
      id: '3',
      name: 'María López',
      class: 'Matemáticas 10A',
      level: 10,
      kumoSoles: 1850,
      streak: 8,
      lastQuizScore: 78,
      avgScore: 85,
      activeDays: 15,
      status: 'active'
    },
    {
      id: '4',
      name: 'Diego Ruiz',
      class: 'Matemáticas 10A',
      level: 7,
      kumoSoles: 980,
      streak: 3,
      lastQuizScore: 65,
      avgScore: 68,
      activeDays: 8,
      status: 'struggling'
    },
    {
      id: '5',
      name: 'Isabella Morales',
      class: 'Matemáticas 10A',
      level: 8,
      kumoSoles: 1180,
      streak: 0,
      lastQuizScore: 45,
      avgScore: 72,
      activeDays: 3,
      status: 'inactive'
    }
  ];

  // Mock data for materials
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      name: 'Introducción al Álgebra',
      type: 'pdf',
      uploadDate: new Date('2024-01-15'),
      class: 'Matemáticas 10A',
      downloads: 24,
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Ecuaciones Cuadráticas',
      type: 'ppt',
      uploadDate: new Date('2024-01-20'),
      class: 'Matemáticas 10A',
      downloads: 18,
      size: '5.1 MB'
    },
    {
      id: '3',
      name: 'Ejercicios Prácticos',
      type: 'pdf',
      uploadDate: new Date('2024-01-25'),
      class: 'Matemáticas 10A',
      downloads: 32,
      size: '1.8 MB'
    }
  ]);

  const handleFileUpload = (event: React.FormEvent) => {
    event.preventDefault();
    setUploadingFile(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newMaterial: Material = {
        id: Date.now().toString(),
        name: 'Nuevo Material de Clase',
        type: 'pdf',
        uploadDate: new Date(),
        class: selectedClass,
        downloads: 0,
        size: '3.2 MB'
      };
      setMaterials(prev => [newMaterial, ...prev]);
      setUploadingFile(false);
    }, 2000);
  };

  const getStatusBadge = (status: StudentPerformance['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'struggling':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Necesita apoyo</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactivo</Badge>;
      default:
        return null;
    }
  };

  const getFileIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'ppt':
        return '📊';
      case 'doc':
        return '📝';
      default:
        return '📄';
    }
  };

  // Calculate class statistics
  const classStats = studentsPerformance.reduce(
    (acc, student) => ({
      totalStudents: acc.totalStudents + 1,
      activeStudents: acc.activeStudents + (student.status === 'active' ? 1 : 0),
      avgScore: acc.avgScore + student.avgScore,
      totalKumoSoles: acc.totalKumoSoles + student.kumoSoles
    }),
    { totalStudents: 0, activeStudents: 0, avgScore: 0, totalKumoSoles: 0 }
  );

  classStats.avgScore = classStats.avgScore / classStats.totalStudents;

  // If viewing student history, show that component
  if (viewingStudentHistory) {
    const student = studentsPerformance.find(s => s.id === viewingStudentHistory);
    return (
      <QuizHistory 
        onBack={() => setViewingStudentHistory(null)} 
        studentName={student?.name}
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
                <div className="flex items-center justify-center">
                  <img 
                    src="/src/assets/kumo_logo.svg" 
                    alt="Kumo Logo" 
                    className="h-8 w-auto"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Panel de Profesor</h1>
                  <p className="text-sm text-gray-600">Bienvenido, {teacherData.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacherData.classes.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ProfileDropdown
                userName={teacherData.name}
                userEmail={teacherData.email}
                userType="teacher"
                onLogout={onLogout}
                onSettings={() => {
                  // TODO: Implementar configuración
                  console.log('Abrir configuración');
                }}
                onProfile={() => {
                  // TODO: Implementar perfil
                  console.log('Abrir perfil');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="text-2xl font-bold">{classStats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {classStats.activeStudents} activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Promedio General</p>
                  <p className="text-2xl font-bold">{Math.round(classStats.avgScore)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Progress value={classStats.avgScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KumoSoles Total</p>
                  <p className="text-2xl font-bold">{classStats.totalKumoSoles.toLocaleString()}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Muy activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Material Subido</p>
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

        {/* Main Content Tabs */}
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

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Desempeño de Estudiantes - {selectedClass}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>KumoSoles</TableHead>
                        <TableHead>Racha</TableHead>
                        <TableHead>Último Quiz</TableHead>
                        <TableHead>Promedio</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsPerformance.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(student.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{student.level}</span>
                              <Star className="h-4 w-4 text-yellow-500" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-yellow-600">
                            {student.kumoSoles.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>{student.streak}</span>
                              {student.streak >= 3 && (
                                <Badge variant="secondary" className="text-xs">x1.25</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              student.lastQuizScore >= 80 ? 'text-green-600' :
                              student.lastQuizScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {student.lastQuizScore}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{student.avgScore}%</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setViewingStudentHistory(student.id)}
                                title="Ver historial de quizzes"
                              >
                                <History className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" title="Ver detalles">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" title="Enviar mensaje">
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
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
                      <Label htmlFor="material-title">Título del Material</Label>
                      <Input id="material-title" placeholder="Ej: Introducción al Cálculo" required />
                    </div>
                    <div>
                      <Label htmlFor="material-description">Descripción</Label>
                      <Textarea id="material-description" placeholder="Breve descripción del contenido..." />
                    </div>
                    <div>
                      <Label htmlFor="material-class">Clase</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherData.classes.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="file-upload">Archivo</Label>
                      <Input id="file-upload" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={uploadingFile}>
                      {uploadingFile ? 'Subiendo...' : 'Subir Material'}
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
                      Material Subido
                    </span>
                    <Badge variant="secondary">{materials.length} archivos</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(material.type)}</span>
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{material.class}</span>
                              <span>{material.uploadDate.toLocaleDateString()}</span>
                              <span>{material.size}</span>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progreso de la Clase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Estudiantes Activos</span>
                        <span>{Math.round((classStats.activeStudents / classStats.totalStudents) * 100)}%</span>
                      </div>
                      <Progress value={(classStats.activeStudents / classStats.totalStudents) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Promedio de Quizzes</span>
                        <span>{Math.round(classStats.avgScore)}%</span>
                      </div>
                      <Progress value={classStats.avgScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Engagement</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="text-sm">
                        <p><strong>Carlos Mendoza</strong> completó quiz con 95%</p>
                        <p className="text-muted-foreground">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <div className="text-sm">
                        <p><strong>Ana García</strong> hizo 5 preguntas al chatbot</p>
                        <p className="text-muted-foreground">Hace 3 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <div className="text-sm">
                        <p><strong>Diego Ruiz</strong> necesita ayuda (puntuación baja)</p>
                        <p className="text-muted-foreground">Hace 1 día</p>
                      </div>
                    </div>
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