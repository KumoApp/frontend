import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ProfileDropdown } from './ProfileDropdown';
import { Users, Shield, GraduationCap, BookOpen } from 'lucide-react';

interface AdminData {
  name: string;
  email: string;
}

interface AdminDashboardProps {
  adminData: AdminData;
  onLogout: () => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
}

export function AdminDashboard({ adminData, onLogout }: AdminDashboardProps) {
  // Mock data para usuarios
  const [users] = useState<User[]>([
    {
      id: '1',
      username: 'ana.garcia',
      email: 'ana.garcia@kumo.edu',
      name: 'Ana García',
      role: 'student'
    },
    {
      id: '2',
      username: 'carlos.mendoza',
      email: 'carlos.mendoza@kumo.edu',
      name: 'Carlos Mendoza',
      role: 'student'
    },
    {
      id: '3',
      username: 'maria.lopez',
      email: 'maria.lopez@kumo.edu',
      name: 'María López',
      role: 'student'
    },
    {
      id: '4',
      username: 'diego.ruiz',
      email: 'diego.ruiz@kumo.edu',
      name: 'Diego Ruiz',
      role: 'student'
    },
    {
      id: '5',
      username: 'isabella.morales',
      email: 'isabella.morales@kumo.edu',
      name: 'Isabella Morales',
      role: 'student'
    },
    {
      id: '6',
      username: 'prof.martinez',
      email: 'prof.martinez@kumo.edu',
      name: 'Prof. Martínez',
      role: 'teacher'
    },
    {
      id: '7',
      username: 'prof.silva',
      email: 'prof.silva@kumo.edu',
      name: 'Prof. Silva',
      role: 'teacher'
    },
    {
      id: '8',
      username: 'admin',
      email: 'admin@kumo.edu',
      name: 'Administrador',
      role: 'admin'
    }
  ]);

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'student':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Estudiante</Badge>;
      case 'teacher':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Profesor</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Administrador</Badge>;
      default:
        return null;
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'teacher':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  // Estadísticas
  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length
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
                  <p className="text-sm text-gray-600">Bienvenido, {adminData.name}</p>
                </div>
              </div>
            </div>
            <ProfileDropdown
              userName={adminData.name}
              userEmail={adminData.email}
              userType="admin"
              onLogout={onLogout}
              onSettings={() => {
                console.log('Abrir configuración');
              }}
              onProfile={() => {
                console.log('Abrir perfil');
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="text-2xl font-bold">{stats.students}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profesores</p>
                  <p className="text-2xl font-bold">{stats.teachers}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Usuarios */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Todos los Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.name}
                      </TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
