# NatacionApp 🏊

Plataforma profesional de entrenamiento para nadadores de pileta. Registrá entrenamientos, medí tiempos con cronómetro inteligente, analizá tu rendimiento y seguí tu progresión.

## Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS v4
- **Backend:** Supabase (Auth, Database, RLS)
- **Estado:** Zustand
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Fechas:** date-fns

## Requisitos Previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd NatacionApp
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://app.supabase.com)
2. Ir al **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
3. Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

4. Editar `.env` con las credenciales de tu proyecto Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Encontrás estas credenciales en **Settings > API** de tu proyecto Supabase.

### 3. Ejecutar

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar
│   └── ui/              # Button, Card, Modal, EmptyState
├── features/
│   ├── auth/            # LoginPage
│   ├── dashboard/       # DashboardPage
│   ├── trainings/       # TrainingsPage
│   ├── stopwatch/       # StopwatchPage
│   ├── stats/           # StatsPage
│   └── swim-tests/      # SwimTestsPage
├── hooks/               # useStopwatch, useStats
├── lib/                 # supabase client, swim-tests-data
├── store/               # Zustand stores (auth, theme, training)
├── types/               # TypeScript interfaces
└── utils/               # Utilidades (formateo de tiempos)
```

## Funcionalidades

### Autenticación
- Registro con roles (Nadador / Entrenador)
- Login con email y contraseña
- Sesiones persistentes

### Pruebas Oficiales FINA
- Libre: 50, 100, 200, 400, 800, 1500m
- Espalda: 50, 100, 200m
- Pecho: 50, 100, 200m
- Mariposa: 50, 100, 200m
- Combinado: 200, 400m
- Postas: 4x100 Libre, 4x200 Libre, 4x100 Combinado

### Entrenamientos
- Crear sesiones con fecha y notas
- Agregar múltiples resultados por sesión
- Visualizar historial completo

### Cronómetro Inteligente
- Precisión de centésimas de segundo
- Comparación automática vs mejor marca
- Indicadores visuales (🟢 mejoró / 🔴 empeoró)
- Guardado directo a entrenamiento

### Estadísticas
- Mejor tiempo histórico por prueba
- Promedio de tiempos
- Gráficos de progresión temporal
- Comparación último vs mejor / último vs promedio

### Dashboard
- Resumen de rendimiento
- Mejores marcas
- Gráficos de progreso
- Últimos entrenamientos

### UX/UI
- Modo oscuro por defecto
- Diseño responsive (mobile-first)
- Animaciones fluidas
- Navegación con sidebar

## Base de Datos

El esquema completo está en `supabase/schema.sql` e incluye:
- **users**: Perfil con roles (swimmer/coach)
- **swim_tests**: Pruebas oficiales FINA pre-cargadas
- **trainings**: Sesiones de entrenamiento
- **training_results**: Tiempos por prueba
- **RLS**: Seguridad a nivel de fila

## Despliegue

### Web (Vercel/Netlify)
```bash
npm run build
```

### PWA
La app incluye `manifest.json` para instalación como PWA.

### Capacitor (Mobile)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init NatacionApp com.natacionapp.app
npx cap add android
npx cap add ios
npm run build
npx cap sync
```

### Electron (Desktop)
```bash
npm install electron electron-builder --save-dev
```

## Licencia

MIT
