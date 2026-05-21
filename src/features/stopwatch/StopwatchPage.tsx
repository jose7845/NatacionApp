import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useTrainingStore } from '@/store/training-store';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useStats } from '@/hooks/useStats';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTime, getTimeDifference } from '@/utils/time';
import { localDateKey, trainingDateKey } from '@/utils/date';
import { Play, Square, RotateCcw, Save, Timer, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';

export function StopwatchPage() {
  const { user } = useAuthStore();
  const { trainings, swimTests, fetchTrainings, fetchSwimTests, createTraining, addResult } = useTrainingStore();
  const { elapsedSeconds, isRunning, start, stop, reset } = useStopwatch();
  const { personalBests } = useStats(trainings);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTimes, setSavedTimes] = useState<{ test: string; time: number; improved?: boolean }[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTrainings(user.id);
      fetchSwimTests();
    }
  }, [user]);

  const currentBest = useMemo(() => {
    if (!selectedTestId) return null;
    return personalBests.find((pb) => pb.swim_test_id === selectedTestId) || null;
  }, [selectedTestId, personalBests]);

  const comparison = useMemo(() => {
    if (!currentBest || elapsedSeconds === 0) return null;
    return getTimeDifference(elapsedSeconds, currentBest.best_time);
  }, [currentBest, elapsedSeconds]);

  const handleSave = async () => {
    if (!user || !selectedTestId || elapsedSeconds <= 0) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const today = localDateKey();
      const existing = trainings.find((t) => trainingDateKey(t.date) === today);
      const todayTraining = existing ?? (await createTraining(user.id, today, 'Cronómetro'));
      const timeRounded = Math.round(elapsedSeconds * 100) / 100;

      const prevBest = currentBest?.best_time;
      const improvedVsBest = prevBest != null ? timeRounded < prevBest : true;

      await addResult(todayTraining.id, selectedTestId, timeRounded);
      await fetchTrainings(user.id);

      const testName = swimTests.find((t) => t.id === selectedTestId)?.name || '';
      setSavedTimes((prev) => [
        ...prev,
        {
          test: testName,
          time: timeRounded,
          improved: prevBest != null ? improvedVsBest : undefined,
        },
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar. Revisá permisos en Supabase (RLS).';
      setSaveError(msg);
      console.error('Error saving time:', err);
    }
    setSaving(false);
  };

  const displayTime = formatTime(elapsedSeconds);
  const selectedTest = swimTests.find((t) => t.id === selectedTestId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Cronómetro</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Medí tus tiempos con precisión</p>
      </div>

      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Prueba</label>
          <select
            value={selectedTestId}
            onChange={(e) => { setSelectedTestId(e.target.value); setSaved(false); }}
            className="select-field"
          >
            <option value="">Seleccionar prueba...</option>
            {swimTests.map((test) => (
              <option key={test.id} value={test.id}>{test.name}</option>
            ))}
          </select>
        </div>

        {currentBest && (
          <div className="mb-6 p-4 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20">
            <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">Mejor marca: <span className="font-mono font-bold">{formatTime(currentBest.best_time)}</span></p>
            <p className="text-xs text-sky-500/70 mt-1">Promedio: {formatTime(currentBest.average_time)} · {currentBest.total_attempts} intentos</p>
          </div>
        )}

        <div className="text-center py-8">
          <div className={`text-6xl md:text-8xl font-mono font-bold tracking-tight transition-colors ${isRunning ? 'text-sky-500' : 'text-gray-900 dark:text-white'}`}>
            {displayTime}
          </div>

          {!isRunning && elapsedSeconds > 0 && comparison && (
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${comparison.improved ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
              {comparison.improved ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
              {comparison.improved ? '-' : '+'}{formatTime(Math.abs(comparison.diff))} vs mejor marca
            </div>
          )}

          {saveError && (
            <div className="mt-4 mx-auto max-w-md p-3 rounded-xl text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300">
              {saveError}
            </div>
          )}
          {saved && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle size={18} />
              Guardado en Supabase. Mirá Estadísticas o Entrenamientos.
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          {!isRunning && elapsedSeconds === 0 && (
            <Button onClick={start} size="lg" className="min-w-[160px]">
              <Play size={20} />
              Iniciar
            </Button>
          )}
          {isRunning && (
            <Button onClick={stop} variant="danger" size="lg" className="min-w-[160px]">
              <Square size={20} />
              Detener
            </Button>
          )}
          {!isRunning && elapsedSeconds > 0 && (
            <>
              <Button onClick={start} size="lg">
                <Play size={20} />
                Continuar
              </Button>
              <Button onClick={reset} variant="secondary" size="lg">
                <RotateCcw size={20} />
                Reiniciar
              </Button>
              {selectedTestId && (
                <Button
                  onClick={handleSave}
                  variant={saved ? 'secondary' : 'primary'}
                  size="lg"
                  loading={saving}
                  disabled={saving}
                >
                  <Save size={20} />
                  Guardar tiempo
                </Button>
              )}
            </>
          )}
        </div>
      </Card>

      {selectedTest && currentBest && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Timer size={20} className="text-sky-500" />
            <h2 className="text-lg font-bold">Historial - {selectedTest.name}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10">
              <p className="text-xs text-gray-500 mb-1">Mejor</p>
              <p className="font-mono font-bold text-green-600 dark:text-green-400">{formatTime(currentBest.best_time)}</p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-500/10">
              <p className="text-xs text-gray-500 mb-1">Promedio</p>
              <p className="font-mono font-bold text-sky-600 dark:text-sky-400">{formatTime(currentBest.average_time)}</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10">
              <p className="text-xs text-gray-500 mb-1">Último</p>
              <p className="font-mono font-bold text-purple-600 dark:text-purple-400">{formatTime(currentBest.last_time)}</p>
            </div>
          </div>
        </Card>
      )}

      {savedTimes.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-500" />
            <h2 className="text-lg font-bold">Tiempos guardados hoy</h2>
          </div>
          <div className="space-y-2">
            {savedTimes.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-medium">{s.test}</span>
                <div className="text-right">
                  <span className="font-mono font-bold">{formatTime(s.time)}</span>
                  {s.improved === true && (
                    <span className="ml-2 text-xs text-green-500">Mejoró</span>
                  )}
                  {s.improved === false && (
                    <span className="ml-2 text-xs text-red-500">Empeoró</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
