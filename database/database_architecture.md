# Fitmate - Arquitectura y Estructura de Base de Datos v2.1

Documento técnico de especificación para **fitmate: Your Gym Buddy**, aplicación móvil PWA Offline-First con PostgreSQL / Supabase.

---

## 1. Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    auth_users ||--|| profiles : "identidad"
    profiles ||--o{ exercises : "crea_custom"
    profiles ||--o{ routines : "diseña"
    profiles ||--o{ calendar_schedules : "planifica"
    profiles ||--o{ workout_sessions : "ejecuta"
    profiles ||--o{ personal_records : "registra"
    profiles ||--o{ body_metrics : "monitorea"

    muscle_groups ||--o{ exercises : "clasifica"

    routines ||--o{ routine_exercises : "contiene"
    exercises ||--o{ routine_exercises : "referencia"

    routines ||--o{ calendar_schedules : "agenda_dia"
    routines ||--o{ workout_sessions : "instancia"

    workout_sessions ||--o{ workout_sets : "compuesto_por"
    exercises ||--o{ workout_sets : "ejecutado"
    workout_sets ||--o| personal_records : "genera_pr"

    profiles {
        uuid id PK
        string email UK
        string full_name
        string username UK
        string avatar_url
        enum gender
        numeric monthly_km_goal
        timestamp created_at
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
        string video_url
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
        timestamp created_at
    }

    calendar_schedules {
        uuid id PK
        uuid user_id FK
        uuid routine_id FK
        date scheduled_date
        enum status
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
        numeric total_volume_kg
        timestamp created_at
    }

    workout_sets {
        uuid id PK
        uuid workout_session_id FK
        uuid exercise_id FK
        string exercise_name_snapshot
        int set_number
        int reps
        numeric weight_kg
        boolean is_pr
        boolean is_completed
        timestamp completed_at
        timestamp created_at
    }

    personal_records {
        uuid id PK
        uuid user_id FK
        uuid exercise_id FK
        numeric record_value
        int reps_at_record
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
        numeric km_run_accumulated
        int satisfaction
        text notes
        timestamp created_at
    }
```

---

## 2. Los 5 Módulos y su Mapeo de Datos

1. **Módulo 1: Explorador Anatómico (MuscleWiki + Creador de Ejercicios)**
   - Tablas: `muscle_groups` y `exercises`.
   - Soporte para ejercicios precargados del sistema y ejercicios personalizados creados por el usuario (`is_custom = true`).

2. **Módulo 2: Gestor de Rutinas & Registro de Entrenamiento en Vivo**
   - Tablas: `routines`, `routine_exercises`, `workout_sessions`, `workout_sets`, `personal_records`.
   - Permite crear, clonar, editar y eliminar rutinas.
   - Live Tracking registra pesos, repeticiones y detecta automáticamente nuevos récords (PRs).

3. **Módulo 3: Calendario de Planificación (Drag & Drop)**
   - Tabla: `calendar_schedules`.
   - Agendamiento semanal y mensual con arrastrar y soltar, vinculando una rutina a fechas `scheduled_date` con estados `planned` y `completed`.

4. **Módulo 4: Marcas Corporales & Rendimiento Físico**
   - Tabla: `body_metrics`.
   - Registra peso corporal con decimales, asimetría de brazos (`arm_left_cm` y `arm_right_cm`), acumulador de running mensual y satisfacción (escala 1 a 10).

5. **Módulo 5: Dashboard de Progreso & Analítica**
   - Agrega KPIs en tiempo real y genera curvas temporales mediante Chart.js.
