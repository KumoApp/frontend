# 🐱 Kumo - Plataforma Educativa Gamificada

[🌐 Ver la app desplegada](https://kumoapp.github.io/frontend/)

Una plataforma educativa innovadora que transforma el aprendizaje en una experiencia interactiva y divertida mediante la gamificación con mascotas virtuales.

## ✨ Características Principales

### 🎮 Sistema de Gamificación
- **Mascotas Virtuales**: Cada estudiante tiene su propia mascota que crece y evoluciona según su desempeño académico
- **Sistema de Monedas (KumoSoles)**: Gana monedas completando quizzes y actividades
- **Sistema de Rachas**: Multiplica tus recompensas manteniendo una racha diaria de actividad
- **Niveles y Experiencia**: Progresa a través de niveles completando quizzes y actividades

### 📚 Gestión Académica

#### Para Estudiantes
- **Quizzes Diarios**: 
  - Quiz automático generado diariamente por clase
  - Sistema de respuestas múltiples (A, B, C, D)
  - Feedback inmediato con respuestas correctas e incorrectas
  - Recompensas en KumoSoles basadas en el desempeño
  - Prevención de respuestas duplicadas
  
- **Historial de Quizzes**:
  - Visualización de todos los quizzes completados
  - Detalles de respuestas correctas vs incorrectas
  - Seguimiento de progreso por clase

- **Tienda Virtual**:
  - Compra de accesorios para tu mascota
  - Fondos personalizados
  - Comida para alimentar a tu mascota
  - Sistema de inventario personal

- **Gestión de Mascota**:
  - Alimenta a tu mascota con items comprados
  - Equipa accesorios y personaliza la apariencia
  - Sistema de hambre y felicidad
  - Visualización de estadísticas (nivel, experiencia, monedas)

- **Material de Clase**:
  - Acceso a materiales subidos por profesores
  - Descarga de documentos (PDF, PPT, DOC)
  - Organización por clases

#### Para Profesores
- **Gestión de Quizzes**:
  - Habilitar/deshabilitar quizzes automáticos diarios
  - Crear quizzes manuales bajo demanda
  - Configuración por clase

- **Gestión de Clases**:
  - Crear nuevas clases con nombre y materia
  - Añadir estudiantes a clases existentes
  - Visualizar lista de estudiantes por clase

- **Seguimiento de Estudiantes**:
  - Ver historial de quizzes de cada estudiante
  - Monitorear desempeño individual
  - Estadísticas de la clase

- **Material Educativo**:
  - Subir archivos y documentos a clases
  - Gestión de materiales por clase
  - Soporte para múltiples formatos de archivo

#### Para Administradores
- **Gestión de Usuarios**:
  - Crear profesores, estudiantes y administradores
  - Visualizar todos los usuarios del sistema
  - Ver roles y permisos de cada usuario
  - Tabla completa con ID, username, email, nombre y rol

- **Gestión de Clases**:
  - Ver todas las clases del sistema
  - Asignar profesores a clases
  - Monitorear estructura académica

- **Sistema de Items (Modo Sistema)**:
  - Crear nuevos items para la tienda
  - Subir imágenes de items
  - Configurar precios y tipos (FOOD, ACCESSORY, BACKGROUND)
  - Gestión del catálogo completo

### 🎨 Interfaz de Usuario

- **Diseño Moderno**: 
  - UI limpia y atractiva con Tailwind CSS
  - Componentes reutilizables con shadcn/ui
  - Animaciones y transiciones suaves
  - Diseño responsive para móviles y desktop

- **Experiencia Visual**:
  - Sistema de avatares personalizados
  - Badges de rol con códigos de color
  - Indicadores visuales de progreso
  - Modales informativos y notificaciones

- **Navegación Intuitiva**:
  - Dashboard personalizado por rol
  - Menú de perfil con opciones rápidas
  - Tabs para organizar contenido
  - Breadcrumbs y navegación clara

### 🔐 Sistema de Autenticación

- **Login Seguro**:
  - Autenticación basada en JWT tokens
  - Validación de credenciales
  - Gestión de sesiones
  - Protección de rutas por rol

- **Roles de Usuario**:
  - **STUDENT**: Acceso a quizzes, tienda, mascota e inventario
  - **TEACHER**: Gestión de clases, quizzes y materiales
  - **ADMIN**: Control total del sistema
  - **SYSTEM**: Gestión de items de tienda

### 📊 Características Técnicas

- **Framework**: React 18 con TypeScript
- **Estilizado**: Tailwind CSS + shadcn/ui components
- **Estado**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router DOM
- **HTTP Client**: Axios con interceptores
- **Gestión de Formularios**: Formularios controlados con validación
- **Notificaciones**: Sistema de toast con Sonner
- **Iconos**: Lucide React

## 🚀 Instalación

### Prerequisitos
```bash
Node.js >= 16.x
npm >= 8.x
```

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
API_BASE_URL=http://localhost:3000
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base de shadcn/ui
│   │   ├── AdminDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── QuizModal.tsx
│   │   ├── QuizHistory.tsx
│   │   ├── Shop.tsx
│   │   ├── Inventory.tsx
│   │   ├── ClassroomPets.tsx
│   │   └── SystemShopManager.tsx
│   ├── contexts/           # Context API
│   │   └── AuthContext.tsx
│   ├── services/           # Servicios API
│   │   ├── api.ts
│   │   └── systemAuth.ts
│   ├── types/              # TypeScript types
│   │   └── auth.ts
│   └── App.tsx             # Componente principal
├── public/                 # Archivos estáticos
└── package.json
```

## 🎯 Flujos de Usuario

### Flujo de Estudiante
1. Login → Dashboard
2. Ver mascota y estadísticas
3. Completar quiz diario → Ganar KumoSoles
4. Comprar items en la tienda
5. Equipar/alimentar mascota
6. Ver historial de quizzes

### Flujo de Profesor
1. Login → Dashboard
2. Seleccionar clase
3. Gestionar quizzes (crear/habilitar/deshabilitar automáticos)
4. Subir material de clase
5. Ver desempeño de estudiantes
6. Crear nuevas clases

### Flujo de Administrador
1. Login → Dashboard
2. Crear usuarios (profesores/estudiantes)
3. Ver todos los usuarios y roles
4. Gestionar clases del sistema
5. Monitorear actividad general

### Flujo de Sistema
1. Login con credenciales de sistema
2. Crear items para la tienda
3. Subir imágenes de items
4. Configurar precios y tipos
5. Administrar catálogo

## 🛠️ Servicios API Implementados

### Authentication Service
- `login()` - Iniciar sesión
- `checkToken()` - Validar token

### User Service
- `getAllUsers()` - Obtener todos los usuarios
- `getAllStudents()` - Obtener estudiantes
- `createTeacher()` - Crear profesor
- `createStudent()` - Crear estudiante
- `createAdmin()` - Crear administrador
- `getMyDataInClass()` - Datos del usuario en clase específica

### Class Service
- `getMyClasses()` - Obtener mis clases
- `getAllClasses()` - Obtener todas las clases
- `createClass()` - Crear clase
- `getClass()` - Obtener detalle de clase
- `addStudentToClass()` - Añadir estudiante a clase

### Quiz Service
- `getQuizzesFromClass()` - Obtener quizzes de una clase
- `getQuizInfoById()` - Detalle de quiz específico
- `getDailyQuiz()` - Obtener quiz diario
- `getAllOwnAnswers()` - Historial de respuestas
- `getOwnAnswer()` - Respuesta específica
- `answerDailyQuiz()` - Responder quiz diario
- `enableAutomaticDailyQuiz()` - Habilitar quiz automático
- `disableAutomaticDailyQuiz()` - Deshabilitar quiz automático
- `createDailyQuiz()` - Crear quiz manual

### Material Service
- `getMaterialInfoFromClass()` - Materiales de una clase
- `getMaterial()` - Obtener material específico
- `uploadMaterialToClass()` - Subir material a clase

### Shop Service
- `getShopItems()` - Obtener items de tienda
- `getShopItem()` - Detalle de item
- `purchaseShopItem()` - Comprar item
- `createShopItem()` - Crear item (sistema)

### Inventory Service
- `getOwnItemsInClass()` - Inventario personal por clase

### Pets Service
- `getAllPetsFromClass()` - Mascotas de una clase
- `getPet()` - Detalle de mascota
- `getOwnPet()` - Mi mascota en clase
- `getOwnPets()` - Todas mis mascotas
- `createPet()` - Crear mascota
- `equipItem()` - Equipar accesorio
- `feedPet()` - Alimentar mascota
- `unequipItem()` - Desequipar accesorio

## 🎨 Componentes Principales

### Dashboard Components
- **AdminDashboard**: Panel de control para administradores
- **TeacherDashboard**: Panel para profesores con gestión de clases y quizzes
- **StudentDashboard**: Panel para estudiantes con mascota y quizzes

### Feature Components
- **QuizModal**: Modal interactivo para responder quizzes
- **QuizHistory**: Historial detallado de quizzes completados
- **Shop**: Tienda virtual con items categorizados
- **Inventory**: Inventario personal del estudiante
- **ClassroomPets**: Visualización de mascotas de la clase
- **MaterialsList**: Lista de materiales de clase
- **UploadMaterial**: Componente para subir archivos
- **SystemShopManager**: Gestión de items de tienda (sistema)

### UI Components (shadcn/ui)
- Button, Card, Input, Label, Badge
- Table, Tabs, Select, Progress
- Avatar, Textarea, Modal/Dialog

## 🔒 Seguridad

- **JWT Authentication**: Tokens almacenados en localStorage
- **Protected Routes**: Rutas protegidas por rol
- **API Interceptors**: Headers automáticos con token
- **Validación de Formularios**: Validación client-side
- **Manejo de Errores**: Feedback claro de errores

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1280px - 1920px)
- ✅ Tablet (768px - 1280px)
- ✅ Mobile (320px - 768px)

## 🐛 Manejo de Errores

- Validación de respuestas del backend
- Mensajes de error informativos
- Logging detallado en consola
- Fallbacks para datos faltantes
- Prevención de duplicación de requests

## 🚧 Futuras Mejoras

- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat entre estudiantes y profesores
- [ ] Leaderboards globales y por clase
- [ ] Achievements y logros
- [ ] Sistema de clanes/grupos
- [ ] Minijuegos educativos
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de un proyecto académico de UTEC.

## 📧 Contacto

Para preguntas o sugerencias, contacta al equipo de desarrollo.

---

Hecho con ❤️ por el equipo de Kumo
