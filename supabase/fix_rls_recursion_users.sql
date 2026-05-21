-- ============================================================
-- Fix: "recursión infinita en la política para usuarios"
-- Causa: policies que hacen EXISTS (SELECT ... FROM public.users)
--        mientras se evalúa otra policy sobre users → bucle.
-- Solución: función SECURITY DEFINER que lee users sin pasar RLS.
-- Ejecutar TODO este archivo en Supabase → SQL Editor → Run.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT u.role = 'coach' FROM public.users u WHERE u.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_coach() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_coach() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach() TO service_role;

-- Tabla users: coaches pueden leer perfiles (sin subquery recursiva)
DROP POLICY IF EXISTS "Coaches can read all profiles" ON public.users;
CREATE POLICY "Coaches can read all profiles"
  ON public.users FOR SELECT
  USING (public.is_coach());

-- Tabla trainings
DROP POLICY IF EXISTS "Coaches can read all trainings" ON public.trainings;
CREATE POLICY "Coaches can read all trainings"
  ON public.trainings FOR SELECT
  USING (public.is_coach());

-- Tabla training_results (si ya aplicaste el otro fix)
DROP POLICY IF EXISTS "training_results_select_own_or_coach" ON public.training_results;
CREATE POLICY "training_results_select_own_or_coach"
  ON public.training_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainings t
      WHERE t.id = training_results.training_id
      AND (t.user_id = auth.uid() OR public.is_coach())
    )
  );

DROP POLICY IF EXISTS "training_results_delete_own_or_coach" ON public.training_results;
CREATE POLICY "training_results_delete_own_or_coach"
  ON public.training_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trainings t
      WHERE t.id = training_results.training_id AND t.user_id = auth.uid()
    )
    OR public.is_coach()
  );
