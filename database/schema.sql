-- ============================================================
--  GOT - Your Gym Buddy | Supabase SQL Schema v2.1
--  Pegar completo en el SQL Editor de Supabase y ejecutar.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- búsquedas de texto eficientes

-- ─────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_gender       AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE experience_level  AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE equipment_type    AS ENUM ('barbell', 'dumbbell', 'cable_machine', 'bodyweight', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE schedule_status   AS ENUM ('planned', 'completed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. HELPER FUNCTION: updated_at automático
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. TABLE: profiles  (creado automáticamente al registrarse)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  gender          user_gender DEFAULT 'male',
  birth_date      DATE,
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  experience      experience_level DEFAULT 'beginner',
  goal            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-crear perfil cuando se registra un usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- ─────────────────────────────────────────────────────────────
-- 4. TABLE: muscle_groups
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.muscle_groups (
  id          SERIAL        PRIMARY KEY,
  name        TEXT          NOT NULL UNIQUE,
  name_es     TEXT          NOT NULL,
  view        TEXT          NOT NULL CHECK (view IN ('front', 'back', 'both')),
  svg_id      TEXT          NOT NULL,  -- id del path SVG en AnatomicalBody.jsx
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. TABLE: exercises
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercises (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID          REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT          NOT NULL,
  muscle_group_id     INT           REFERENCES public.muscle_groups(id),
  secondary_muscles   TEXT[],
  equipment           equipment_type NOT NULL DEFAULT 'other',
  instructions        TEXT,
  video_url           TEXT,
  is_custom           BOOLEAN       NOT NULL DEFAULT FALSE,
  is_public           BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_exercises_updated_at ON public.exercises;
CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 6. TABLE: routines
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routines (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  description TEXT,
  color       TEXT          DEFAULT '#344B35',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_routines_updated_at ON public.routines;
CREATE TRIGGER trg_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 7. TABLE: routine_exercises  (ejercicios dentro de una rutina)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id      UUID    NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id     UUID    NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sort_order      INT     NOT NULL DEFAULT 0,
  sets_target     INT     NOT NULL DEFAULT 3,
  reps_target     INT     NOT NULL DEFAULT 10,
  weight_target   NUMERIC(6,2),
  rest_seconds    INT     NOT NULL DEFAULT 90,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. TABLE: calendar_schedules
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_schedules (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id  UUID          REFERENCES public.routines(id) ON DELETE SET NULL,
  scheduled_date  DATE      NOT NULL,
  status      schedule_status NOT NULL DEFAULT 'planned',
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_calendar_updated_at ON public.calendar_schedules;
CREATE TRIGGER trg_calendar_updated_at
  BEFORE UPDATE ON public.calendar_schedules
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 9. TABLE: workout_sessions  (cabecera de cada entrenamiento)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id      UUID        REFERENCES public.routines(id) ON DELETE SET NULL,
  routine_name    TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_min    INT,
  notes           TEXT,
  total_volume_kg NUMERIC(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 10. TABLE: workout_sets  (cada serie registrada)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID        NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id     UUID        NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  exercise_name   TEXT        NOT NULL,
  set_number      INT         NOT NULL,
  weight_kg       NUMERIC(6,2) NOT NULL DEFAULT 0,
  reps            INT         NOT NULL DEFAULT 0,
  is_completed    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_pr           BOOLEAN     NOT NULL DEFAULT FALSE,
  rpe             INT         CHECK (rpe BETWEEN 1 AND 10),
  notes           TEXT,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 11. TABLE: personal_records
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.personal_records (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id     UUID        NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  exercise_name   TEXT        NOT NULL,
  max_weight_kg   NUMERIC(6,2) NOT NULL DEFAULT 0,
  max_reps        INT         NOT NULL DEFAULT 0,
  max_volume_kg   NUMERIC(10,2) NOT NULL DEFAULT 0, -- weight * reps (1RM proxy)
  achieved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, exercise_id)
);

DROP TRIGGER IF EXISTS trg_pr_updated_at ON public.personal_records;
CREATE TRIGGER trg_pr_updated_at
  BEFORE UPDATE ON public.personal_records
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Función: detectar nuevo PR al insertar una serie
CREATE OR REPLACE FUNCTION check_and_update_personal_record()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
  v_volume  NUMERIC;
  v_pr      public.personal_records%ROWTYPE;
  v_is_new_pr BOOLEAN := FALSE;
BEGIN
  IF NOT NEW.is_completed THEN RETURN NEW; END IF;

  SELECT user_id INTO v_user_id
  FROM public.workout_sessions
  WHERE id = NEW.session_id;

  v_volume := NEW.weight_kg * NEW.reps;

  SELECT * INTO v_pr
  FROM public.personal_records
  WHERE user_id = v_user_id AND exercise_id = NEW.exercise_id;

  IF v_pr IS NULL THEN
    INSERT INTO public.personal_records
      (user_id, exercise_id, exercise_name, max_weight_kg, max_reps, max_volume_kg, achieved_at)
    VALUES
      (v_user_id, NEW.exercise_id, NEW.exercise_name, NEW.weight_kg, NEW.reps, v_volume, NOW());
    v_is_new_pr := TRUE;
  ELSE
    IF NEW.weight_kg > v_pr.max_weight_kg OR NEW.reps > v_pr.max_reps OR v_volume > v_pr.max_volume_kg THEN
      UPDATE public.personal_records SET
        max_weight_kg = GREATEST(max_weight_kg, NEW.weight_kg),
        max_reps      = GREATEST(max_reps,      NEW.reps),
        max_volume_kg = GREATEST(max_volume_kg, v_volume),
        achieved_at   = NOW()
      WHERE user_id = v_user_id AND exercise_id = NEW.exercise_id;
      v_is_new_pr := TRUE;
    END IF;
  END IF;

  IF v_is_new_pr THEN
    NEW.is_pr := TRUE;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_pr ON public.workout_sets;
CREATE TRIGGER trg_check_pr
  BEFORE INSERT ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION check_and_update_personal_record();

-- ─────────────────────────────────────────────────────────────
-- 12. TABLE: body_metrics
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
  weight_kg         NUMERIC(5,1),
  body_fat_pct      NUMERIC(4,1),
  muscle_mass_kg    NUMERIC(5,1),
  chest_cm          NUMERIC(5,1),
  waist_cm          NUMERIC(5,1),
  hips_cm           NUMERIC(5,1),
  arm_left_cm       NUMERIC(5,1),
  arm_right_cm      NUMERIC(5,1),
  thigh_left_cm     NUMERIC(5,1),
  thigh_right_cm    NUMERIC(5,1),
  calf_left_cm      NUMERIC(5,1),
  calf_right_cm     NUMERIC(5,1),
  running_km        NUMERIC(6,2),
  running_min       INT,
  satisfaction      INT         CHECK (satisfaction BETWEEN 1 AND 5),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_body_metrics_updated_at ON public.body_metrics;
CREATE TRIGGER trg_body_metrics_updated_at
  BEFORE UPDATE ON public.body_metrics
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 13. INDEXES (performance)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exercises_user       ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle     ON public.exercises(muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_name_trgm  ON public.exercises USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_routines_user        ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_re_routine           ON public.routine_exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_re_exercise          ON public.routine_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_date   ON public.calendar_schedules(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user        ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started     ON public.workout_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sets_session         ON public.workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise        ON public.workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_pr_user              ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_body_user_date       ON public.body_metrics(user_id, recorded_date DESC);

-- ─────────────────────────────────────────────────────────────
-- 14. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics       ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles: own row"    ON public.profiles;
CREATE POLICY "profiles: own row"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- muscle_groups (todos pueden leer, nadie puede escribir desde cliente)
DROP POLICY IF EXISTS "muscle_groups: public read" ON public.muscle_groups;
CREATE POLICY "muscle_groups: public read"
  ON public.muscle_groups FOR SELECT
  USING (TRUE);

-- exercises (el usuario ve los propios + los públicos)
DROP POLICY IF EXISTS "exercises: select" ON public.exercises;
CREATE POLICY "exercises: select"
  ON public.exercises FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE OR user_id IS NULL);

DROP POLICY IF EXISTS "exercises: insert" ON public.exercises;
CREATE POLICY "exercises: insert"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "exercises: update" ON public.exercises;
CREATE POLICY "exercises: update"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "exercises: delete" ON public.exercises;
CREATE POLICY "exercises: delete"
  ON public.exercises FOR DELETE
  USING (auth.uid() = user_id);

-- routines
DROP POLICY IF EXISTS "routines: own" ON public.routines;
CREATE POLICY "routines: own"
  ON public.routines FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- routine_exercises
DROP POLICY IF EXISTS "re: via routine" ON public.routine_exercises;
CREATE POLICY "re: via routine"
  ON public.routine_exercises FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.routines r
    WHERE r.id = routine_id AND r.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.routines r
    WHERE r.id = routine_id AND r.user_id = auth.uid()
  ));

-- calendar_schedules
DROP POLICY IF EXISTS "calendar: own" ON public.calendar_schedules;
CREATE POLICY "calendar: own"
  ON public.calendar_schedules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workout_sessions
DROP POLICY IF EXISTS "sessions: own" ON public.workout_sessions;
CREATE POLICY "sessions: own"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workout_sets
DROP POLICY IF EXISTS "sets: via session" ON public.workout_sets;
CREATE POLICY "sets: via session"
  ON public.workout_sets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.workout_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workout_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

-- personal_records
DROP POLICY IF EXISTS "pr: own" ON public.personal_records;
CREATE POLICY "pr: own"
  ON public.personal_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- body_metrics
DROP POLICY IF EXISTS "body: own" ON public.body_metrics;
CREATE POLICY "body: own"
  ON public.body_metrics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 15. SEED DATA: muscle_groups (14 grupos musculares)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.muscle_groups (name, name_es, view, svg_id) VALUES
  ('chest',          'Pecho',           'front', 'chest'),
  ('shoulders',      'Hombros',         'front', 'shoulders'),
  ('biceps',         'Bíceps',          'front', 'biceps'),
  ('forearms',       'Antebrazos',      'front', 'forearms'),
  ('abs',            'Abdomen/Oblicuos','front', 'abs'),
  ('quads',          'Cuádriceps',      'front', 'quads'),
  ('adductors',      'Aductores',       'front', 'adductors'),
  ('calves',         'Gemelos',         'both',  'calves'),
  ('traps',          'Trapecios',       'back',  'traps'),
  ('lats',           'Espalda/Dorsales','back',  'lats'),
  ('triceps',        'Tríceps',         'back',  'triceps'),
  ('lower_back',     'Lumbares',        'back',  'lower_back'),
  ('glutes',         'Glúteos',         'back',  'glutes'),
  ('hamstrings',     'Isquiotibiales',  'back',  'hamstrings')
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ✅ Fin del script — GOT v2.1 — Your Gym Buddy
-- ─────────────────────────────────────────────────────────────
