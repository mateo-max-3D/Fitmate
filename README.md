# 🏋️‍♂️ fitmate - Your Gym Buddy. (v2.1)

> Aplicación móvil **Progressive Web App (PWA)** Offline-First para seguimiento y análisis de rendimiento físico en el gimnasio, construida con **React**, **Tailwind CSS**, **Chart.js** y **Supabase**.

---

## 📱 Enfoque Mobile-First & PWA Offline-First

* **Diseño Exclusivo para Teléfonos**: Viewport optimizado para uso táctil con una sola mano en el gimnasio.
* **100% Funcional sin Internet**: Todo se guarda primero de forma reactiva en `LocalStorage` / `IndexedDB`, permitiendo entrenar en sótanos o zonas sin cobertura.
* **Sincronización Automática con Supabase**: Al recuperar la conexión o configurar las credenciales, sincroniza datos de rutinas, sesiones y marcas en la nube.
* **Navegación Global por Menú Hamburguesa (Drawer)**: Sin barras inferiores. Encabezado limpio con el logo oficial de `fitmate`, temporizador de descanso, badge de sincronización y menú lateral deslizante con acceso a los 5 módulos principales.

---

## 🎨 Paleta Cromática & Identidad Visual

* **Fondo Principal (Carbón)**: `#17251F`
* **Elementos Secundarios & Tarjetas (Verde Bosque)**: `#344B35` / `#1e2e28`
* **Color Protagonista & Récords (Verde Musgo)**: `#A5C978`
* **Textos Principales (Crema)**: `#F5F0E6`
* **Tipografías**: `Plus Jakarta Sans` (encabezados) + `Inter` (cuerpo y números)

---

## 🚀 Los 5 Módulos Principales

### Módulo 1: Explorador Anatómico (MuscleWiki + Creador de Ejercicios)
* **Mapa Muscular Masculino Interactivo**: Silueta anatómica vectorial frontal y posterior. Al tocar un músculo (Pecho, Hombros, Bíceps, Tríceps, Espalda, Abdomen, Cuádriceps, Isquiotibiales, etc.), se ilumina en Verde Musgo y filtra los ejercicios.
* **Filtros por Equipamiento**: *Todos, Barra, Mancuernas, Polea / Máquina, Peso Corporal*.
* **Ficha de Ejercicio**: Nombre, músculos secundarios, instrucciones paso a paso, *Tip Fitmate* y botón para asignarlo a cualquiera de tus rutinas.
* **Botón `+ Crear ejercicio`**: Modal para crear ejercicios personalizados con nombre, músculo principal, secundarios, equipamiento, instrucciones y link a video de referencia.

### Módulo 2: Gestor de Rutinas y Registro en Vivo
* **Constructor y Editor**: Creá, editá, duplicá o eliminá rutinas (*Empuje, Tirón, Piernas*, o las que vos definas). Agregá y quitá ejercicios fijando series y repeticiones objetivo.
* **Registro de Sesión en Vivo (Live Workout)**:
  * Historial de referencia (*"Última vez: 60 kg x 10"*).
  * Carga rápida de peso (kg) y repeticiones por serie con checkbox de completado.
  * **Detección automática de Récord Personal (PR)**: Insignia visual en Verde Musgo con *"¡Nuevo récord!"* y animación de confeti al superar tu mejor marca.
  * **Cronómetro de descanso integrado**: Se dispara automáticamente al completar una serie, con alertas sonoras sintetizadas.
  * Botón *"Guardemos esta sesión"* para consolidar el entrenamiento.

### Módulo 3: Calendario de Planificación (Drag & Drop)
* **Vistas Semanal y Mensual**: Adaptadas para uso táctil.
* **Arrastrar y Soltar (Drag & Drop)**: Bandeja superior con tus rutinas. Arrastrá o tocá para agendar una rutina en cualquier día de la semana o mes.
* **Indicadores Visuales**: Diferenciación de días planificados, completados (en Verde Musgo con check) y días de descanso.
* Acceso directo para iniciar el entrenamiento al tocar la rutina agendada.

### Módulo 4: Marcas Corporales y Rendimiento Físico
* **Peso corporal (kg)** con decimales.
* **Medición bilateral de brazos**: Campos independientes para **Brazo Izquierdo (cm)** y **Brazo Derecho (cm)** para evaluar simetría.
* **Control Mensual de Running**: Kilómetros acumulados en el mes con barra de progreso frente a una meta mensual editable (ej. 30 km).
* **Slider de Satisfacción (1 al 10)**: Escala visual intuitiva con frases motivacionales dinámicas basadas en tu percepción física.
* Historial cronológico limpio para empezar a registrar hoy mismo.

### Módulo 5: Dashboard de Progreso y Analítica
* **4 Tarjetas KPI**: *Sesiones del mes, Volumen total levantado (kg), Récords batidos, Km corridos este mes*.
* **4 Gráficos Interactivos (Chart.js)**:
  1. **Evolución de Fuerza por Ejercicio**: Curva temporal del peso máximo levantado con selector de ejercicio.
  2. **Evolución de Peso Corporal**: Curva de tendencia ponderada en Verde Musgo.
  3. **Comparativa de Simetría de Brazos**: Doble línea comparando Brazo Izquierdo vs. Brazo Derecho en cm.
  4. **Running Mensual & Satisfacción**: Gráfico combinado para correlacionar kilómetros corridos con bienestar personal.

---

## 🗄️ Base de Datos Supabase (PostgreSQL)

El archivo [`database/schema.sql`](file:///c:/Users/coura/OneDrive/Desktop/Fitmate%20App/database/schema.sql) contiene el esquema completo listo para ejecutar en el SQL Editor de Supabase:
* Tablas: `profiles`, `exercises`, `routines`, `routine_exercises`, `calendar_schedules`, `workout_sessions`, `workout_sets`, `personal_records`, `body_metrics`.
* Políticas de seguridad activadas: **Row Level Security (RLS)**.
* Datos semilla para los 14 grupos musculares anatómicos.

---

## 💻 Instalación y Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local
npm run dev

# 3. Compilar PWA para producción
npm run build
```

El proyecto se encuentra versionado y listo en la rama `main`. Para sincronizarlo con el repositorio remoto de GitHub:
```bash
git push -u origin main
```
