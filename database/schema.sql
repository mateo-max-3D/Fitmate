-- ============================================================================
-- FITMATE - ESQUEMA DE BASE DE DATOS COMPLETO (POSTGRESQL / SUPABASE)
-- Version: 2.0 (Producción)
-- Soporta: Multi-usuario, Autenticación Supabase, Offline Sync, Detección de PRs,
--          Historial Corporal (Brazos I/D, Running, Satisfacción), Catálogo Muscular
-- ============================================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS Y TIPOS PERSONALIZADOS
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
        'bodyweight',   -- Peso corporal / Calistenia
        'kettlebell',   -- Pesa rusa
        'bands',        -- Bandas elásticas
        'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE set_type_enum AS ENUM (
        'warmup',       -- Calentamiento
        'normal',       -- Serie efectiva
        'dropset',      -- Drop set
        'failure',      -- Al fallo
        'amrap'         -- As Many Reps As Possible
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'canceled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 2. TABLA DE PERFILES DE USUARIO (Vinculada a auth.users de Supabase)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    gender user_gender DEFAULT 'male',
    birth_date DATE,
    height_cm NUMERIC(5, 2),
    target_weight_kg NUMERIC(5, 2),
    monthly_km_goal NUMERIC(5, 2) DEFAULT 30.00,
    experience experience_level DEFAULT 'intermediate',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configuración de preferencias del usuario
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'mi')),
    default_rest_seconds INT DEFAULT 90 CHECK (default_rest_seconds > 0),
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    auto_start_timer BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. CATÁLOGO ANATÓMICO Y GRUPOS MUSCULARES (ESTILO MUSCLEWIKI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.muscle_groups (
    id TEXT PRIMARY KEY, -- 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', etc.
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    subtitle_es TEXT,
    body_view TEXT NOT NULL CHECK (body_view IN ('front', 'back', 'both')),
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. BIBLIOTECA DE EJERCICIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    primary_muscle_id TEXT NOT NULL REFERENCES public.muscle_groups(id) ON DELETE RESTRICT,
    secondary_muscle_ids TEXT[] DEFAULT '{}',
    equipment equipment_type NOT NULL DEFAULT 'barbell',
    equipment_label TEXT NOT NULL, -- 'Barra', 'Mancuernas', 'Polea / Máq.', 'Peso Corporal'
    difficulty_level experience_level DEFAULT 'beginner',
    execution_steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array con los pasos 1, 2, 3...
    tips TEXT,
    media_url TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. RUTINAS Y PLANTILLAS DE ENTRENAMIENTO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color_hex TEXT DEFAULT '#A5C978',
    is_active BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ejercicios que componen cada rutina
CREATE TABLE IF NOT EXISTS public.routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT DEFAULT 3,
    target_reps INT DEFAULT 10,
    target_rest_seconds INT DEFAULT 90,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 6. SESIONES DE ENTRENAMIENTO EJECUTADAS (WORKOUT LOGS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
    routine_name_snapshot TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    perceived_exertion_rpe INT CHECK (perceived_exertion_rpe BETWEEN 1 AND 10),
    total_volume_kg NUMERIC(8, 2) DEFAULT 0.00,
    total_reps_count INT DEFAULT 0,
    session_notes TEXT,
    status session_status DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Series individuales dentro de la sesión
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    exercise_name_snapshot TEXT NOT NULL,
    set_number INT NOT NULL,
    set_type set_type_enum DEFAULT 'normal',
    reps INT NOT NULL CHECK (reps >= 0),
    weight_kg NUMERIC(6, 2) NOT NULL CHECK (weight_kg >= 0),
    rpe NUMERIC(3, 1) CHECK (rpe BETWEEN 1 AND 10),
    rest_taken_seconds INT,
    is_pr BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT true,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 7. RÉCORDS PERSONALES (PRs / PERSONAL RECORDS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL DEFAULT 'max_weight' CHECK (record_type IN ('max_weight', 'estimated_1rm', 'max_reps', 'max_volume')),
    record_value NUMERIC(6, 2) NOT NULL,
    reps_at_record INT,
    workout_set_id UUID REFERENCES public.workout_sets(id) ON DELETE SET NULL,
    achieved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_exercise_record_type UNIQUE (user_id, exercise_id, record_type)
);

-- ============================================================================
-- 8. SEGUIMIENTO CORPORAL (MEDIDAS, BRAZOS I/D, SATISFACCIÓN Y FÍSICO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
    arm_left_cm NUMERIC(4, 1) CHECK (arm_left_cm > 0),
    arm_right_cm NUMERIC(4, 1) CHECK (arm_right_cm > 0),
    chest_cm NUMERIC(5, 1),
    waist_cm NUMERIC(5, 1),
    hips_cm NUMERIC(5, 1),
    thigh_left_cm NUMERIC(4, 1),
    thigh_right_cm NUMERIC(4, 1),
    calf_left_cm NUMERIC(4, 1),
    calf_right_cm NUMERIC(4, 1),
    body_fat_pct NUMERIC(4, 1),
    km_run_accumulated NUMERIC(6, 2) DEFAULT 0.00,
    satisfaction INT NOT NULL CHECK (satisfaction BETWEEN 1 AND 10),
    satisfaction_quote TEXT,
    notes TEXT,
    front_photo_url TEXT,
    side_photo_url TEXT,
    back_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 9. REGISTRO ESPECÍFICO DE ACTIVIDADES DE RUNNING / CARDIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.running_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    distance_km NUMERIC(6, 2) NOT NULL CHECK (distance_km > 0),
    duration_seconds INT NOT NULL CHECK (duration_seconds > 0),
    pace_min_km TEXT,
    elevation_gain_m INT,
    calories_kcal INT,
    terrain_type TEXT DEFAULT 'asphalt' CHECK (terrain_type IN ('treadmill', 'asphalt', 'trail', 'track', 'other')),
    perceived_effort_rpe INT CHECK (perceived_effort_rpe BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 10. SINCRONIZACIÓN OFFLINE-FIRST (COLA DE CAMBIOS OFFLINE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.offline_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_device_id TEXT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    payload JSONB NOT NULL,
    client_created_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 11. ÍNDICES DE ALTO RENDIMIENTO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON public.exercises(primary_muscle_id);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_routines_user ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON public.workout_sets(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON public.workout_sets(exercise_id, weight_kg DESC);
CREATE INDEX IF NOT EXISTS idx_prs_user_exercise ON public.personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON public.body_metrics(user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_running_logs_user_date ON public.running_logs(user_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_user_synced ON public.offline_sync_log(user_id, synced_at);

-- ============================================================================
-- 12. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ============================================================================

-- A. Función para actualizar la columna updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_body_metrics_updated_at
    BEFORE UPDATE ON public.body_metrics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Función para detectar y actualizar Récords Personales (PRs) automáticamente
CREATE OR REPLACE FUNCTION public.check_and_update_personal_record()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_current_pr NUMERIC(6, 2);
BEGIN
    -- Obtener el user_id de la sesión
    SELECT user_id INTO v_user_id
    FROM public.workout_sessions
    WHERE id = NEW.workout_session_id;

    IF v_user_id IS NOT NULL AND NEW.is_completed = true AND NEW.weight_kg > 0 THEN
        -- Buscar récord actual para este usuario y ejercicio
        SELECT record_value INTO v_current_pr
        FROM public.personal_records
        WHERE user_id = v_user_id 
          AND exercise_id = NEW.exercise_id 
          AND record_type = 'max_weight';

        IF v_current_pr IS NULL THEN
            -- Primer récord registrado
            INSERT INTO public.personal_records (
                user_id, exercise_id, record_type, record_value, reps_at_record, workout_set_id, achieved_at
            ) VALUES (
                v_user_id, NEW.exercise_id, 'max_weight', NEW.weight_kg, NEW.reps, NEW.id, NEW.completed_at
            );
            NEW.is_pr = true;
        ELSIF NEW.weight_kg > v_current_pr THEN
            -- Nuevo récord superado
            UPDATE public.personal_records
            SET record_value = NEW.weight_kg,
                reps_at_record = NEW.reps,
                workout_set_id = NEW.id,
                achieved_at = NEW.completed_at
            WHERE user_id = v_user_id 
              AND exercise_id = NEW.exercise_id 
              AND record_type = 'max_weight';
            NEW.is_pr = true;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_detect_pr
    BEFORE INSERT OR UPDATE OF weight_kg, is_completed ON public.workout_sets
    FOR EACH ROW EXECUTE FUNCTION public.check_and_update_personal_record();

-- C. Hook automático cuando un usuario se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_push_id UUID := gen_random_uuid();
    v_pull_id UUID := gen_random_uuid();
    v_legs_id UUID := gen_random_uuid();
BEGIN
    -- 1. Crear perfil público
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- 2. Crear configuración por defecto
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    -- 3. Crear rutinas básicas de bienvenida (Empuje, Tirón, Piernas)
    INSERT INTO public.routines (id, user_id, name, description, is_active)
    VALUES 
        (v_push_id, NEW.id, 'Empuje (Pecho, Hombro, Tríceps)', 'Foco en pectoral mayor, deltoides y tríceps', true),
        (v_pull_id, NEW.id, 'Tirón (Espalda, Bíceps, Post.)', 'Foco en dorsales, trapecios y bíceps', false),
        (v_legs_id, NEW.id, 'Piernas & Core Completo', 'Foco en cuádriceps, isquios, gemelos y abdomen', false);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ============================================================================
-- 13. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_log ENABLE ROW LEVEL SECURITY;

-- Reglas para perfiles
CREATE POLICY "Users can view and edit their own profile" 
    ON public.profiles FOR ALL 
    USING (auth.uid() = id);

-- Reglas para configuración de usuario
CREATE POLICY "Users can view and edit their settings" 
    ON public.user_settings FOR ALL 
    USING (auth.uid() = user_id);

-- Catálogo de músculos: visible por todos los usuarios autenticados
CREATE POLICY "Muscle groups are viewable by all users" 
    ON public.muscle_groups FOR SELECT 
    TO authenticated, anon 
    USING (true);

-- Biblioteca de ejercicios: los estándar son públicos, los custom solo del creador
CREATE POLICY "Exercises are viewable by everyone if public, or by owner" 
    ON public.exercises FOR SELECT 
    TO authenticated, anon 
    USING (is_custom = false OR created_by_user_id = auth.uid());

CREATE POLICY "Users can create their own custom exercises" 
    ON public.exercises FOR INSERT 
    TO authenticated 
    WITH CHECK (created_by_user_id = auth.uid());

-- Rutinas
CREATE POLICY "Users can manage their own routines" 
    ON public.routines FOR ALL 
    USING (auth.uid() = user_id);

-- Ejercicios de rutinas
CREATE POLICY "Users can manage their own routine exercises" 
    ON public.routine_exercises FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.routines 
            WHERE routines.id = routine_exercises.routine_id 
              AND routines.user_id = auth.uid()
        )
    );

-- Sesiones y series
CREATE POLICY "Users can manage their own workout sessions" 
    ON public.workout_sessions FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout sets" 
    ON public.workout_sets FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions 
            WHERE workout_sessions.id = workout_sets.workout_session_id 
              AND workout_sessions.user_id = auth.uid()
        )
    );

-- Récords personales (PRs)
CREATE POLICY "Users can view and manage their own PRs" 
    ON public.personal_records FOR ALL 
    USING (auth.uid() = user_id);

-- Métricas corporales (peso, brazos I/D, fotos, satisfacción)
CREATE POLICY "Users can view and edit their body metrics" 
    ON public.body_metrics FOR ALL 
    USING (auth.uid() = user_id);

-- Running logs
CREATE POLICY "Users can manage their running logs" 
    ON public.running_logs FOR ALL 
    USING (auth.uid() = user_id);

-- Sync log
CREATE POLICY "Users can manage their sync logs" 
    ON public.offline_sync_log FOR ALL 
    USING (auth.uid() = user_id);

-- ============================================================================
-- 14. DATOS SEMILLA (GRUPOS MUSCULARES Y EJERCICIOS BASE)
-- ============================================================================
INSERT INTO public.muscle_groups (id, name_es, name_en, subtitle_es, body_view, order_index) VALUES
('chest', 'Pecho', 'Chest', 'Pectoral mayor, superior e inferior', 'front', 1),
('shoulders', 'Hombros', 'Shoulders', 'Deltoides anterior, lateral y posterior', 'front', 2),
('biceps', 'Bíceps', 'Biceps', 'Cabeza larga, corta y braquial', 'front', 3),
('triceps', 'Tríceps', 'Triceps', 'Cabeza larga, lateral y medial', 'back', 4),
('forearms', 'Antebrazos', 'Forearms', 'Flexores, extensores y fuerza de agarre', 'front', 5),
('abs', 'Abdomen', 'Abs / Core', 'Recto abdominal, oblicuos y core profundo', 'front', 6),
('traps', 'Trapecios', 'Traps', 'Fibras superiores y medias', 'front', 7),
('back', 'Espalda (Dorsales)', 'Back / Lats', 'Dorsal ancho, redondo mayor y romboides', 'back', 8),
('lower_back', 'Espalda Baja (Lumbares)', 'Lower Back', 'Erectores espinales y cadena posterior', 'back', 9),
('glutes', 'Glúteos', 'Glutes', 'Glúteo mayor, medio y menor', 'back', 10),
('quads', 'Cuádriceps', 'Quadriceps', 'Vasto lateral, medial, intermedio y recto femoral', 'front', 11),
('adductors', 'Aductores', 'Adductors', 'Cara interna del muslo y estabilidad de cadera', 'front', 12),
('hamstrings', 'Isquiotibiales', 'Hamstrings', 'Bíceps femoral, semitendinoso y semimembranoso', 'back', 13),
('calves', 'Gemelos', 'Calves', 'Gastrocnemio y sóleo', 'back', 14)
ON CONFLICT (id) DO NOTHING;

-- Ejercicios base iniciales
INSERT INTO public.exercises (slug, name, primary_muscle_id, equipment, equipment_label, difficulty_level, execution_steps, tips) VALUES
('bench-press', 'Press de Banca Plano', 'chest', 'barbell', 'Barra', 'intermediate', '["Acostate con los ojos debajo de la barra y los pies firmes en el piso.", "Retraé los omóplatos y agarrá la barra un poco más ancho que tus hombros.", "Bajá la barra de forma controlada hasta tocar el pecho medio y empujá con fuerza."]'::jsonb, 'Mantené los codos a unos 45° respecto al torso para cuidar tus hombros.'),
('incline-dumbbell-press', 'Press Inclinado con Mancuernas', 'chest', 'dumbbell', 'Mancuernas', 'intermediate', '["Ajustá el banco a 30° o 45° de inclinación.", "Subí las mancuernas alineadas con la parte superior de tu pecho.", "Bajá estirando bien el pectoral y volvé a subir sin chocar las pesas arriba."]'::jsonb, 'Enfocate en empujar con la parte alta del pecho sin despegar la espalda.'),
('cable-crossover', 'Cruce en Polea Alta (Crossover)', 'chest', 'cable', 'Polea / Máq.', 'beginner', '["Colocá las poleas en la posición más alta y da un paso adelante.", "Con los codos levemente flexionados, juntá las manos frente a tu abdomen.", "Volvé despacio sintiendo el estiramiento completo."]'::jsonb, 'Apretá el pecho 1 segundo al juntar las manos para máxima congestión.'),
('push-ups', 'Flexiones de Brazos (Push-Ups)', 'chest', 'bodyweight', 'Peso Corporal', 'beginner', '["Apoyá las manos al ancho de hombros y mantené el cuerpo en línea recta.", "Bajá el pecho hasta casi rozar el suelo.", "Empujá el piso hasta extender los brazos por completo."]'::jsonb, 'Apretá glúteos y abdomen para que no caiga la cadera.'),
('military-press', 'Press Militar con Barra', 'shoulders', 'barbell', 'Barra', 'intermediate', '["De pie, apoyá la barra sobre la parte frontal de tus hombros.", "Apretá abdomen y glúteos, y empujá la barra verticalmente sobre tu cabeza.", "Bajá con control hasta la clavícula."]'::jsonb, 'Meté la cabeza ligeramente hacia adelante apenas la barra pasa tu frente.'),
('lateral-raises', 'Vuelos Laterales con Mancuernas', 'shoulders', 'dumbbell', 'Mancuernas', 'beginner', '["Parate derecho con una mancuerna a cada lado.", "Elevá los brazos hacia los costados hasta formar una T con tu cuerpo.", "Bajá lentamente sin dejar caer el peso."]'::jsonb, 'Liderá el movimiento con los codos, no con las muñecas.'),
('barbell-curl', 'Curl con Barra Recta o EZ', 'biceps', 'barbell', 'Barra', 'beginner', '["De pie con los codos pegados a los costados del torso.", "Flexioná los codos subiendo la barra sin balancear la espalda.", "Bajá en 2 o 3 segundos."]'::jsonb, 'Mantené las muñecas firmes y neutras durante todo el recorrido.'),
('tricep-rope-pushdown', 'Extensiones en Polea con Soga', 'triceps', 'cable', 'Polea / Máq.', 'beginner', '["Fijá los codos a los costados de tu cuerpo.", "Empujá la soga hacia abajo abriendo las puntas al final del recorrido.", "Subí solo hasta que los antebrazos queden paralelos al piso."]'::jsonb, 'No muevas los hombros; el único movimiento ocurre en el codo.'),
('barbell-squat', 'Sentadilla Libre con Barra', 'quads', 'barbell', 'Barra', 'advanced', '["Barra apoyada sobre los trapecios, pies al ancho de hombros.", "Bajá controladamente rompiendo el paralelo de 90° con espalda firme.", "Subí empujando fuerte con toda la planta del pie."]'::jsonb, 'Alineá siempre tus rodillas con la dirección de la punta de tus pies.'),
('romanian-deadlift', 'Peso Muerto Rumano con Barra', 'hamstrings', 'barbell', 'Barra', 'intermediate', '["Con rodillas semi-flexionadas fijas, llevá la cadera hacia atrás.", "Bajá la barra pegada a los muslos hasta sentir un estiramiento profundo atrás.", "Subí empujando la cadera hacia adelante."]'::jsonb, 'El movimiento termina cuando tu cadera deja de ir hacia atrás.'),
('standing-calf-raise', 'Elevación de Talones de Pie', 'calves', 'cable', 'Polea / Máq.', 'beginner', '["Apoyá la punta de los pies en el escalón y dejá caer los talones abajo.", "Subí lo más alto posible en puntas de pie y sostené 1 segundo."]'::jsonb, 'Hacé una pausa abajo para eliminar el rebote del tendón de Aquiles.')
ON CONFLICT (slug) DO NOTHING;
