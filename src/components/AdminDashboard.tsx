import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ProfileDropdown } from './ProfileDropdown';
import { Users, Shield, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminData {
  name: string;
  email: string;
}

interface AdminDashboardProps {
  adminData: AdminData;
  onLogout: () => void;
}

type Role = 'student' | 'teacher' | 'admin';

interface User {
  id: number | string;
  username: string;
  email: string;
  name: string;
  role: Role;
}

const BASE_URL = 'http://localhost:3000';
const USERS_URL = `${BASE_URL}/users`;

export function AdminDashboard({ adminData, onLogout }: AdminDashboardProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(USERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        const list: User[] = j?.body ?? j ?? [];
        if (!cancelled) setUsers(list);
      } catch (e: any) {
        if (!cancelled) setErr('No se pudieron cargar los usuarios');
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) loadUsers();
    return () => { cancelled = true; };
  }, [token]);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length
  }), [users]);

  const getRoleBadge = (role: Role) => {
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

  const getRoleIcon = (role: Role) => {
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
              onSettings={() => console.log('Abrir configuración')}
              onProfile={() => console.log('Abrir perfil')}
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
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
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
                                {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
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
      </div>
    </div>
  );
}
