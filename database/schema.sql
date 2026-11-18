-- ============================================================================
-- GOT - ESQUEMA DE BASE DE DATOS COMPLETO (POSTGRESQL / SUPABASE)
-- Version: 2.1 (PWA Offline-First & Drag & Drop Calendar)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS Y TIPOS
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_gender AS ENUM ('male', 'female', 'other', 'unspecified');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE equipment_type AS ENUM (
        'barbell',      -- Barra
        'dumbbell',     -- Mancuernas
        'cable',        -- Poleas / Máquinas
        'machine',      -- Máquinas guiadas
        'bodyweight',   -- Peso corporal
        'kettlebell',   -- Pesa rusa
        'bands',        -- Bandas
        'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status AS ENUM ('planned', 'completed', 'skipped');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 2. PERFILES DE USUARIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    gender user_gender DEFAULT 'male',
    monthly_km_goal NUMERIC(5, 2) DEFAULT 30.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. GRUPOS MUSCULARES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.muscle_groups (
    id TEXT PRIMARY KEY, -- 'chest', 'back', 'shoulders', 'biceps', 'triceps', etc.
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    subtitle_es TEXT,
    body_view TEXT NOT NULL CHECK (body_view IN ('front', 'back', 'both')),
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. EJERCICIOS (ESTÁNDAR Y CREADOS POR EL USUARIO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    primary_muscle_id TEXT NOT NULL REFERENCES public.muscle_groups(id) ON DELETE RESTRICT,
    secondary_muscle_ids TEXT[] DEFAULT '{}',
    equipment equipment_type NOT NULL DEFAULT 'barbell',
    equipment_label TEXT NOT NULL,
    difficulty_level experience_level DEFAULT 'beginner',
    execution_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    tips TEXT,
    video_url TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. RUTINAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color_hex TEXT DEFAULT '#A5C978',
    is_active BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT DEFAULT 3,
    target_reps INT DEFAULT 10,
    target_rest_seconds INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 6. CALENDARIO DE PLANIFICACIÓN (DRAG & DROP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.calendar_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    status schedule_status DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 7. SESIONES Y SERIES DE ENTRENAMIENTO (REGISTRO EN VIVO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
    routine_name_snapshot TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    total_volume_kg NUMERIC(8, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    exercise_name_snapshot TEXT NOT NULL,
    set_number INT NOT NULL,
    reps INT NOT NULL CHECK (reps >= 0),
    weight_kg NUMERIC(6, 2) NOT NULL CHECK (weight_kg >= 0),
    is_pr BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT true,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 8. RÉCORDS PERSONALES (PRs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    record_value NUMERIC(6, 2) NOT NULL,
    reps_at_record INT,
    achieved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_exercise_pr UNIQUE (user_id, exercise_id)
);

-- ============================================================================
-- 9. MARCAS CORPORALES Y CONTROL MENSUAL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
    arm_left_cm NUMERIC(4, 1) CHECK (arm_left_cm > 0),
    arm_right_cm NUMERIC(4, 1) CHECK (arm_right_cm > 0),
    km_run_accumulated NUMERIC(6, 2) DEFAULT 0.00,
    satisfaction INT NOT NULL CHECK (satisfaction BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 10. SEGURIDAD Y ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Public or user exercises" ON public.exercises FOR SELECT USING (is_custom = false OR created_by_user_id = auth.uid());
CREATE POLICY "User create exercises" ON public.exercises FOR INSERT WITH CHECK (created_by_user_id = auth.uid());
CREATE POLICY "Users own routines" ON public.routines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own schedules" ON public.calendar_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own metrics" ON public.body_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own PRs" ON public.personal_records FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 11. DATOS SEMILLA MUSCULARES
-- ============================================================================
INSERT INTO public.muscle_groups (id, name_es, name_en, subtitle_es, body_view, order_index) VALUES
('chest', 'Pecho', 'Chest', 'Pectoral mayor, superior e inferior', 'front', 1),
('shoulders', 'Hombros', 'Shoulders', 'Deltoides anterior, lateral y posterior', 'front', 2),
('biceps', 'Bíceps', 'Biceps', 'Cabeza larga, corta y braquial', 'front', 3),
('triceps', 'Tríceps', 'Triceps', 'Cabeza larga, lateral y medial', 'back', 4),
('forearms', 'Antebrazos', 'Forearms', 'Flexores, extensores y agarre', 'front', 5),
('abs', 'Abdomen', 'Abs', 'Recto abdominal, oblicuos y core', 'front', 6),
('traps', 'Trapecios', 'Traps', 'Fibras superiores y medias', 'front', 7),
('back', 'Espalda', 'Back', 'Dorsal ancho y romboides', 'back', 8),
('lower_back', 'Espalda Baja', 'Lower Back', 'Erectores espinales y lumbares', 'back', 9),
('glutes', 'Glúteos', 'Glutes', 'Glúteo mayor y medio', 'back', 10),
('quads', 'Cuádriceps', 'Quadriceps', 'Vasto lateral, medial y recto', 'front', 11),
('adductors', 'Aductores', 'Adductors', 'Cara interna del muslo', 'front', 12),
('hamstrings', 'Isquiotibiales', 'Hamstrings', 'Bíceps femoral y semitendinoso', 'back', 13),
('calves', 'Gemelos', 'Calves', 'Gastrocnemio y sóleo', 'back', 14)
ON CONFLICT (id) DO NOTHING;
