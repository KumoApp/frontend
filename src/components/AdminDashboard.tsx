import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import apiClient from '../services/api';

type BackendUser = {
  id: number;
  username: string;
  email: string;
  name?: string;
  lastname?: string;
  role?: string;         // tu DTO actual no lo trae; lo hacemos opcional
  created_at?: string;   // opcional si tu API no lo expone
};

type ApiResponse<T> = {
  code: number;
  message: string;
  body: T;
};

export function AdminDashboard() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        // OJO: ajusta la ruta si montas con prefijo: p.ej. '/api/users'
        const res = await apiClient.get<ApiResponse<BackendUser[]>>('/users', {
          signal: ac.signal,
        });

        // Tu backend: { code, message, body: [...] }
        const userData = res.data?.body ?? [];
        setUsers(Array.isArray(userData) ? userData : []);
      } catch (err: any) {
        // Si es aborto, no hacemos nada
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;

        // Manejo de 401/403 -> forzar logout (token inválido o sin rol)
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setError('No autorizado. Por favor inicia sesión nuevamente.');
          logout();
          return;
        }

        // Otros errores
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Error al cargar usuarios';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <Button onClick={logout} variant="destructive">
            Cerrar Sesión
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Cargando usuarios...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                {error}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No hay usuarios para mostrar
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {u.name || u.lastname ? `${u.name ?? ''} ${u.lastname ?? ''}`.trim() : '—'}
                      </TableCell>
                      <TableCell>{u.role ?? '—'}</TableCell>
                      <TableCell>
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
