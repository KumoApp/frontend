import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageCircle, BookOpen, Trophy, Sparkles, Users, Gift, History } from 'lucide-react';
import { ChatBot } from './ChatBot';
import { QuizModal } from './QuizModal';
import { PetCustomization } from './PetCustomization';
import { ClassroomPets } from './ClassroomPets';
import { ProfileDropdown } from './ProfileDropdown';
import { QuizHistory } from './QuizHistory';

interface StudentData {
  name: string;
  kumoSoles: number;
  streak: number;
  level: number;
  petName: string;
  petColor: string;
  petAccessories: string[];
}

interface StudentDashboardProps {
  onLogout: () => void;
  userData?: {
    name: string;
    email: string;
    class: string;
  };
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  color: string;
}

export function StudentDashboard({ onLogout, userData }: StudentDashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'quiz' | 'customize' | 'classroom' | 'history'>('dashboard');
  const [studentData, setStudentData] = useState<StudentData>({
    name: userData?.name || 'Ana García',
    kumoSoles: 1250,
    streak: 5,
    level: 8,
    petName: 'Kumo',
    petColor: '#8DBCC7',
    petAccessories: ['gafas', 'sombrero']
  });

  // Clases de ejemplo (asegúrate de que el id coincida con tu classId real)
  const [classes] = useState<ClassInfo[]>([
    { id: '1', name: 'Matemáticas 10A', teacher: 'Prof. Martínez', color: '#8DBCC7' },
    { id: '2', name: 'Historia Universal', teacher: 'Prof. Silva', color: '#A4CCD9' },
    { id: '3', name: 'Química Básica', teacher: 'Prof. Gómez', color: '#C4E1E6' },
    { id: '4', name: 'Literatura Española', teacher: 'Prof. Torres', color: '#EBFFD8' }
  ]);

  const [selectedClass, setSelectedClass] = useState<ClassInfo>(classes[0]);

  const todayQuizCompleted = false;
  const streakMultiplier = studentData.streak >= 3 ? 1.25 : 1;

  const handleQuizComplete = (score: number) => {
    const baseReward = 100;
    const reward = Math.floor(baseReward * (score / 100) * streakMultiplier);
    setStudentData(prev => ({
      ...prev,
      kumoSoles: prev.kumoSoles + reward,
      streak: prev.streak + 1
    }));
  };

  const handlePetCustomization = (newColor: string, newAccessories: string[]) => {
    setStudentData(prev => ({
      ...prev,
      petColor: newColor,
      petAccessories: newAccessories
    }));
  };

  if (activeView === 'chat') {
    return (
      <ChatBot
        onBack={() => setActiveView('dashboard')}
        selectedClass={selectedClass}
        classes={classes}
        onClassChange={setSelectedClass}
      />
    );
  }

  if (activeView === 'customize') {
    return (
      <PetCustomization
        onBack={() => setActiveView('dashboard')}
        studentData={studentData}
        onCustomize={handlePetCustomization}
      />
    );
  }

  if (activeView === 'classroom') {
    return <ClassroomPets onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'history') {
    return <QuizHistory onBack={() => setActiveView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">¡Hola, {studentData.name}! 👋</h1>
              <p className="text-gray-600">¿Listo para aprender algo nuevo hoy?</p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={selectedClass.id}
                onValueChange={(value) => {
                  const classInfo = classes.find(c => c.id === value);
                  if (classInfo) setSelectedClass(classInfo);
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classInfo) => (
                    <SelectItem key={classInfo.id} value={classInfo.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: classInfo.color }} />
                        {classInfo.name}
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
                onSettings={() => console.log('Abrir configuración')}
                onProfile={() => console.log('Abrir perfil')}
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
              <p className="text-2xl font-bold text-primary">{studentData.kumoSoles}</p>
              <p className="text-sm text-gray-600">KumoSoles</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-orange-500" />
                {streakMultiplier > 1 && (
                  <Badge variant="secondary" className="ml-1 text-xs">x{streakMultiplier}</Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-primary">{studentData.streak}</p>
              <p className="text-sm text-gray-600">Días seguidos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{studentData.level}</p>
              <p className="text-sm text-gray-600">Nivel</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: studentData.petColor }}>
                <span className="text-white text-xl">🐱</span>
              </div>
              <p className="text-sm font-medium">{studentData.petName}</p>
              <p className="text-xs text-gray-600">Tu mascota</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Button onClick={() => setActiveView('chat')} className="h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90">
            <MessageCircle className="h-8 w-8" />
            <span>Pregunta al Chat</span>
          </Button>

          <Button onClick={() => setActiveView('quiz')} variant="secondary" className="h-24 flex flex-col gap-2">
            <BookOpen className="h-8 w-8" />
            <span>Quiz Diario</span>
          </Button>

          <Button onClick={() => setActiveView('history')} variant="outline" className="h-24 flex flex-col gap-2">
            <History className="h-8 w-8" />
            <span>Historial de Quizzes</span>
          </Button>

          <Button onClick={() => setActiveView('customize')} variant="outline" className="h-24 flex flex-col gap-2">
            <Gift className="h-8 w-8" />
            <span>Personalizar Mascota</span>
          </Button>

          <Button onClick={() => setActiveView('classroom')} variant="outline" className="h-24 flex flex-col gap-2">
            <Users className="h-8 w-8" />
            <span>Mascotas del Salón</span>
          </Button>
        </div>

        {/* Progreso + Actividad: mantenemos igual */}
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

        {/* (Ejemplo) Historial y Quiz modal */}
        {activeView === 'quiz' && (
          <QuizModal onClose={() => setActiveView('dashboard')} onComplete={handleQuizComplete} streakMultiplier={streakMultiplier} />
        )}
      </div>
    </div>
  );
}
