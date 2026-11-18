# Fitmate - Arquitectura y Estructura de Base de Datos

Documento técnico con la especificación completa del modelo de datos para **Fitmate: Your Gym Buddy**, diseñado para PostgreSQL y Supabase con soporte para arquitectura Offline-First.

---

## 1. Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    auth_users ||--|| profiles : "identidad"
    profiles ||--|| user_settings : "preferencias"
    profiles ||--o{ routines : "crea"
    profiles ||--o{ workout_sessions : "entrena"
    profiles ||--o{ personal_records : "registra"
    profiles ||--o{ body_metrics : "registra"
    profiles ||--o{ running_logs : "corre"
    profiles ||--o{ offline_sync_log : "sincroniza"
    profiles ||--o{ exercises : "crea_custom"

    muscle_groups ||--o{ exercises : "agrupa"

    routines ||--o{ routine_exercises : "contiene"
    exercises ||--o{ routine_exercises : "incluido_en"

    routines ||--o{ workout_sessions : "instancia"
    workout_sessions ||--o{ workout_sets : "contiene"
    exercises ||--o{ workout_sets : "ejecutado_en"
    workout_sets ||--o| personal_records : "genera_pr"

    workout_sessions ||--o{ running_logs : "puede_vincular"

    profiles {
        uuid id PK
        string email UK
        string full_name
        string username UK
        string avatar_url
        enum gender
        date birth_date
        numeric height_cm
        numeric target_weight_kg
        numeric monthly_km_goal
        enum experience
        timestamp created_at
        timestamp updated_at
    }

    user_settings {
        uuid user_id PK,FK
        string theme
        string weight_unit
        string distance_unit
        int default_rest_seconds
        boolean sound_enabled
        boolean vibration_enabled
        boolean auto_start_timer
        timestamp updated_at
    }

    muscle_groups {
        string id PK
        string name_es
        string name_en
        string subtitle_es
        string body_view
        int order_index
        timestamp created_at
    }

    exercises {
        uuid id PK
        string slug UK
        string name
        string primary_muscle_id FK
        string_array secondary_muscle_ids
        enum equipment
        string equipment_label
        enum difficulty_level
        jsonb execution_steps
        text tips
        string media_url
        boolean is_custom
        uuid created_by_user_id FK
        timestamp created_at
        timestamp updated_at
    }

    routines {
        uuid id PK
        uuid user_id FK
        string name
        string description
        string color_hex
        boolean is_active
        boolean is_archived
        int order_index
        timestamp created_at
        timestamp updated_at
    }

    routine_exercises {
        uuid id PK
        uuid routine_id FK
        uuid exercise_id FK
        int order_index
        int target_sets
        int target_reps
        int target_rest_seconds
        text notes
        timestamp created_at
    }

    workout_sessions {
        uuid id PK
        uuid user_id FK
        uuid routine_id FK
        string routine_name_snapshot
        timestamp started_at
        timestamp ended_at
        int duration_seconds
        int perceived_exertion_rpe
        numeric total_volume_kg
        int total_reps_count
        text session_notes
        enum status
        timestamp created_at
    }

    workout_sets {
        uuid id PK
        uuid workout_session_id FK
        uuid exercise_id FK
        string exercise_name_snapshot
        int set_number
        enum set_type
        int reps
        numeric weight_kg
        numeric rpe
        int rest_taken_seconds
        boolean is_pr
        boolean is_completed
        timestamp completed_at
        timestamp created_at
    }

    personal_records {
        uuid id PK
        uuid user_id FK
        uuid exercise_id FK
        string record_type
        numeric record_value
        int reps_at_record
        uuid workout_set_id FK
        timestamp achieved_at
        timestamp created_at
    }

    body_metrics {
        uuid id PK
        uuid user_id FK
        date recorded_date
        numeric weight_kg
        numeric arm_left_cm
        numeric arm_right_cm
        numeric chest_cm
        numeric waist_cm
        numeric hips_cm
        numeric thigh_left_cm
        numeric thigh_right_cm
        numeric calf_left_cm
        numeric calf_right_cm
        numeric body_fat_pct
        numeric km_run_accumulated
        int satisfaction
        string satisfaction_quote
        text notes
        string front_photo_url
        string side_photo_url
        string back_photo_url
        timestamp created_at
        timestamp updated_at
    }

    running_logs {
        uuid id PK
        uuid user_id FK
        uuid workout_session_id FK
        date run_date
        numeric distance_km
        int duration_seconds
        string pace_min_km
        int elevation_gain_m
        int calories_kcal
        string terrain_type
        int perceived_effort_rpe
        text notes
        timestamp created_at
    }

    offline_sync_log {
        uuid id PK
        uuid user_id FK
        string client_device_id
        string table_name
        string record_id
        string action
        jsonb payload
        timestamp client_created_at
        timestamp synced_at
    }
```

---

## 2. Diccionario de Datos y Módulos

### 2.1 Usuarios, Identidad y Configuración
* **`profiles`**: Almacena datos biométricos de referencia del atleta (altura, peso objetivo, meta mensual de kilómetros de running, nivel de experiencia). Se sincroniza de forma transparente con `auth.users` mediante triggers PL/pgSQL.
* **`user_settings`**: Guarda preferencias funcionales: tiempo de descanso por defecto del cronómetro (ej. 90s), unidades preferidas (`kg` o `lbs`, `km` o `mi`), alertas sonoras y hápticas.

### 2.2 Catálogo de Anatomía & Ejercicios (Estilo MuscleWiki)
* **`muscle_groups`**: Catálogo base para la visualización del mapa muscular anatómico interactivo (frente/espalda). Mapea zonas: Pecho, Deltoides, Bíceps, Tríceps, Antebrazos, Core/Abdomen, Trapecios, Dorsales, Lumbares, Glúteos, Cuádriceps, Aductores, Isquiotibiales y Gemelos.
* **`exercises`**: Catálogo completo de ejercicios que incluye tipo de equipamiento (Barra, Mancuerna, Polea/Máquina, Peso Corporal), niveles de dificultad, instrucciones paso a paso estructuradas en `jsonb` y el tip técnico exclusivo de Fitmate. Permite además a los usuarios crear sus propios ejercicios personalizados (`is_custom = true`).

### 2.3 Planificación y Rutinas
* **`routines`**: Plantillas creadas por el usuario o sugeridas (Empuje, Tirón, Piernas, Fullbody, etc.).
* **`routine_exercises`**: Lista ordenada de ejercicios configurados en cada rutina, con objetivos de series, repeticiones y tiempo de descanso previsto.

### 2.4 Registro de Entrenamientos y Detección Automática de Récords
* **`workout_sessions`**: Representa una sesión real ejecutada en el gimnasio, guardando duración exacta, RPE (esfuerzo percibido 1-10) y volumen total levantado.
* **`workout_sets`**: Cada serie completada con repeticiones, carga en kg, tipo de serie (calentamiento, efectiva, dropset, fallo) y si supuso un récord personal (`is_pr`).
* **`personal_records`**: Almacena el histórico y estado actual de récords máximos por ejercicio. **Se actualiza automáticamente vía trigger en la base de datos** al guardar una serie con mayor peso.

### 2.5 Seguimiento Corporal Integral (El diferencial de Fitmate)
* **`body_metrics`**:
  * **Peso corporal** con decimales.
  * **Medición bilateral de brazos** (`arm_left_cm` y `arm_right_cm`) para monitorear asimetrías musculares.
  * Medidas completas: Pecho, cintura, cadera, muslos y pantorrillas.
  * **Control mensual de running**: Kilómetros acumulados en el mes vs. objetivo.
  * **Calificación de satisfacción emocional/física (1 a 10)**: con frases motivacionales dinámicas basadas en el progreso.
  * Notas personales y URLs de fotos de progreso (frente, perfil, espalda).

### 2.6 Running y Actividad Aeróbica
* **`running_logs`**: Detalle de cada sesión de trote o carrera (distancia, duración, ritmo min/km, elevación, calorías y terreno).

### 2.7 Sincronización Offline-First
* **`offline_sync_log`**: Cola de mutaciones capturadas localmente en el móvil/navegador cuando el usuario entrena en sótanos o zonas sin cobertura WiFi en el gimnasio. Al recuperar la conexión, el cliente procesa la cola y la base de datos resuelve conflictos con marcas de tiempo `client_created_at`.

---

## 3. Seguridad y Row Level Security (RLS)

Todas las tablas de usuario tienen activado **Row Level Security (RLS)**:
1. `profiles`, `routines`, `workout_sessions`, `body_metrics`, etc. solo pueden ser consultadas o modificadas por el usuario autenticado (`auth.uid() = user_id`).
2. El catálogo de músculos y ejercicios base es de libre lectura (`SELECT`) para cualquier usuario conectado o anónimo en modo explorador.
3. Los triggers del sistema (`handle_new_user_signup`, `check_and_update_personal_record`) corren con permisos controlados `SECURITY DEFINER` para garantizar la integridad sin exponer datos a otros usuarios.
