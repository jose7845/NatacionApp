-- Fix: permitir INSERT en training_results cuando el entrenamiento es tuyo (RLS explícito)
-- Ejecutar en Supabase SQL Editor si "Guardar" no persiste filas.

-- En PostgreSQL: DROP POLICY va aparte (no dentro de ALTER TABLE)
DROP POLICY IF EXISTS "Users can manage own training results" ON public.training_results;
DROP POLICY IF EXISTS "Coaches can read all training results" ON public.training_results;
DROP POLICY IF EXISTS "Anyone can read training results" ON public.training_results;
DROP POLICY IF EXISTS "Anyone can insert training results" ON public.training_results;
DROP POLICY IF EXISTS "Users can delete own results" ON public.training_results;
DROP POLICY IF EXISTS "training_results_select_own_or_coach" ON public.training_results;
DROP POLICY IF EXISTS "training_results_insert_own_training" ON public.training_results;
DROP POLICY IF EXISTS "training_results_delete_own_or_coach" ON public.training_results;
DROP POLICY IF EXISTS "training_results_delete_own" ON public.training_results;

CREATE POLICY "training_results_select_own_or_coach"
  ON public.training_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainings t
      WHERE t.id = training_results.training_id
      AND (
        t.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
      )
    )
  );

CREATE POLICY "training_results_insert_own_training"
  ON public.training_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trainings t
      WHERE t.id = training_results.training_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "training_results_delete_own_or_coach"
  ON public.training_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trainings t
      WHERE t.id = training_results.training_id AND t.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
  );

-- Más precisión para el tiempo (evita rechazos por decimales)
ALTER TABLE public.training_results
  ALTER COLUMN time TYPE numeric(12, 3);
