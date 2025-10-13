import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Settings, User, LogOut, Bell, HelpCircle } from 'lucide-react';

interface ProfileDropdownProps {
  userName: string;
  userEmail?: string;
  userType: 'student' | 'teacher';
  onLogout: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
}

export function ProfileDropdown({ 
  userName, 
  userEmail, 
  userType, 
  onLogout, 
  onSettings, 
  onProfile 
}: ProfileDropdownProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative h-12 w-12 rounded-full cursor-pointer hover:bg-gray-100 transition-colors p-0 border-0 bg-transparent">
          <Avatar className="h-12 w-12 border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <AvatarFallback className="bg-primary text-white text-sm font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {userType === 'student' ? 'Estudiante' : 'Profesor'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onProfile}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onSettings}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notificaciones</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Ayuda</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}