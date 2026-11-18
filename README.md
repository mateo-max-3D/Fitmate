# 🏋️‍♂️ Fitmate - Your Gym Buddy (v2.0)

> Aplicación web moderna para entrenamiento en el gimnasio, registro de cargas, seguimiento corporal bilateral y análisis de progreso, construida con **React**, **Tailwind CSS**, **Chart.js** y **Supabase**.

---

## 📸 Identidad Visual & Captura de Pantalla

Fitmate cuenta con un diseño ergonómico para uso móvil en el gimnasio con paleta oscura de alto contraste:
* **Carbon**: `#17251F` (Fondo principal)
* **Carbon Card**: `#1e2e28` (Tarjetas de contenido)
* **Moss**: `#A5C978` (Acentos de energía y récord personal)
* **Forest**: `#344B35` (Contornos y paneles secundarios)
* **Cream**: `#F5F0E6` (Tipografía principal)

El logo oficial de **Fitmate** (`Logo Fitmate.jpg` / `assets/logo.jpg`) preside la pantalla de autenticación y la barra superior de la aplicación.

---

## 🚀 Características Principales

### 1. 🔐 Autenticación Flexible (Supabase + Modo Offline)
- **Supabase Auth**: Soporte para inicio de sesión y registro de cuentas seguras con email y contraseña.
- **Modo Invitado / Offline Instantáneo**: Ingreso en 1 clic para entrenar sin demoras o cuando no hay señal WiFi en el gimnasio.
- **Perfil de Atleta**: Modal de perfil con resumen de récords, kilómetros acumulados y controles físicos.

### 2. 🗺️ Explorador Muscular Anatómico (Estilo MuscleWiki)
- **Cuerpo Masculino Interactivo en SVG**: Vistas frontal y dorsal con giro rápido.
- **Zonas musculares clicables**: Pecho, hombros, bíceps, tríceps, antebrazos, abdomen/core, trapecios, dorsales, lumbares, glúteos, cuádriceps, aductores, isquiotibiales y gemelos con efecto de iluminación neón Moss.
- **Filtros por equipamiento**: Barra, Mancuernas, Poleas/Máquinas, Peso Corporal.
- **Biblioteca técnica**: Pasos detallados y *Tip Fitmate* para cada ejercicio, con botón de 1 toque para añadirlo a la rutina activa.

### 3. ⚡ Entrenar & Detección Automática de Récords (PRs)
- **Control de Rutinas**: Selector de rutinas activas (Empuje, Tirón, Piernas) y creador de nuevas rutinas personalizadas.
- **Tablas de Series**: Repeticiones, peso en kg y botón de serie lista.
- **Detección Automática de Récords**: Si superás tu peso máximo anterior, la app detecta tu nuevo récord con animación de confeti y trofeo.
- **Cronómetro de Descanso Integrado**: Al marcar una serie como completada, se inicia automáticamente el temporizador de descanso con alerta auditiva sintetizada (Web Audio API) y presets de 1m, 1m30 y 2m.

### 4. 📏 Seguimiento Corporal Bilateral & Emocional
- **Medición de Brazos por Separado**: Monitoreo de brazo izquierdo vs. derecho (cm) para detectar y corregir asimetrías.
- **Control Mensual de Running**: Barra de progreso hacia la meta mensual de kilómetros (ej. 30 km).
- **Control de Peso y Notas Personales**: Registro cronológico de variaciones en kg.
- **Slider de Satisfacción (1 al 10)**: Frases motivacionales dinámicas basadas en tu nivel de satisfacción con los avances.

### 5. 📊 Dashboard Analítico (Chart.js)
- **4 Tarjetas KPI**: Peso actual vs control anterior, total de PRs, km mensuales y satisfacción.
- **Gráfico 1**: Evolución de cargas máximas por ejercicio (Press de banca, Sentadilla, Remo).
- **Gráfico 2**: Simetría bilateral de brazos (Izquierdo vs. Derecho).
- **Gráfico 3**: Curva de evolución de peso corporal.

---

## 🗄️ Estructura de Base de Datos (Supabase / PostgreSQL)

La arquitectura de datos completa y optimizada para producción se encuentra en el directorio [`database/`](file:///c:/Users/coura/OneDrive/Desktop/Fitmate%20App/database/):

1. **[`database/schema.sql`](file:///c:/Users/coura/OneDrive/Desktop/Fitmate%20App/database/schema.sql)**:
   - Script SQL ejecutable en el editor de Supabase.
   - 10 tablas relacionales: `profiles`, `user_settings`, `muscle_groups`, `exercises`, `routines`, `routine_exercises`, `workout_sessions`, `workout_sets`, `personal_records`, `body_metrics`, `running_logs`, `offline_sync_log`.
   - **Triggers automáticos**:
     - Actualización automática de `updated_at`.
     - Hook de registro de nuevo usuario que inicializa perfil y rutinas básicas.
     - Detección automática de Récords Personales (PRs).
   - Políticas completas de seguridad **Row Level Security (RLS)**.
   - Datos semilla con los 14 grupos musculares y ejercicios iniciales.

2. **[`database/database_architecture.md`](file:///c:/Users/coura/OneDrive/Desktop/Fitmate%20App/database/database_architecture.md)**:
   - Diagrama Entidad-Relación (ERD) en formato Mermaid.
   - Diccionario de datos y justificación técnica.

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- Node.js v18+ y npm instalados.

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/mateo-max-3D/Fitmate.git
   cd Fitmate
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Configurar Supabase:
   Crear un archivo `.env` basado en `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
   *(También podés ingresar tus credenciales directamente desde el botón "Offline listo / Supabase" en la app)*.

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir en el navegador en `http://localhost:3000`.

5. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 📦 Estructura del Código Fuente

```
Fitmate/
├── assets/
│   └── logo.jpg               # Logo oficial de Fitmate
├── public/
│   └── assets/logo.jpg        # Archivos estáticos
├── database/
│   ├── schema.sql             # Esquema SQL de producción para Supabase
│   └── database_architecture.md # Documentación del modelo de datos & ERD
├── src/
│   ├── components/
│   │   ├── auth/              # Pantalla de Login / Registro con Logo
│   │   ├── layout/            # Header, Drawer de Cronómetro y Navbar
│   │   ├── modals/            # Modales de Perfil, Rutinas y Sync
│   │   ├── modules/           # Módulos: Explorar, Entrenar, Cuerpo, Progreso
│   │   ├── svg/               # AnatomicalBody SVG interactivo frente/dorso
│   │   └── ui/                # Toast y componentes reutilizables
│   ├── context/
│   │   └── FitmateContext.jsx # Estado global y persistencia
│   ├── data/
│   │   └── muscleDatabase.js  # Catálogo anatómico y ejercicios
│   ├── lib/
│   │   └── supabase.js        # Cliente Supabase y utilidades offline
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 👨‍💻 Autor y Repositorio
* **Repositorio**: [https://github.com/mateo-max-3D/Fitmate.git](https://github.com/mateo-max-3D/Fitmate.git)
* **Desarrollado para**: Fitmate App
