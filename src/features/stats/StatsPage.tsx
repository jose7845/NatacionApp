import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useTrainingStore } from '@/store/training-store';
import { useStats } from '@/hooks/useStats';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime, getTimeDifference } from '@/utils/time';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BarChart3, TrendingDown, TrendingUp, History } from 'lucide-react';

export function StatsPage() {
  const { user } = useAuthStore();
  const { trainings, fetchTrainings, fetchSwimTests, loading } = useTrainingStore();
  const { personalBests, getProgress, recentResults } = useStats(trainings);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTrainings(user.id);
      fetchSwimTests();
    }
  }, [user]);

  useEffect(() => {
    if (personalBests.length > 0 && !selectedTestId) {
      setSelectedTestId(personalBests[0].swim_test_id);
    }
  }, [personalBests, selectedTestId]);

  const selectedBest = personalBests.find((pb) => pb.swim_test_id === selectedTestId);
  const progressData = selectedTestId ? getProgress(selectedTestId).map((p) => ({
    date: format(new Date(p.date), 'dd/MM/yy', { locale: es }),
    tiempo: Number(p.time.toFixed(2)),
  })) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Estadísticas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analizá tu rendimiento detallado</p>
      </div>

      {personalBests.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={48} />}
          title="Sin datos de rendimiento"
          description="Registrá entrenamientos y tiempos para ver tus estadísticas"
        />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {personalBests.map((pb) => (
              <button
                key={pb.swim_test_id}
                onClick={() => setSelectedTestId(pb.swim_test_id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTestId === pb.swim_test_id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {pb.swim_test?.name}
              </button>
            ))}
          </div>

          {selectedBest && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <p className="text-xs text-gray-500 mb-1">Mejor tiempo</p>
                  <p className="text-2xl font-mono font-bold text-green-500">{formatTime(selectedBest.best_time)}</p>
                </Card>
                <Card>
                  <p className="text-xs text-gray-500 mb-1">Promedio</p>
                  <p className="text-2xl font-mono font-bold text-sky-500">{formatTime(selectedBest.average_time)}</p>
                </Card>
                <Card>
                  <p className="text-xs text-gray-500 mb-1">Último tiempo</p>
                  <p className="text-2xl font-mono font-bold">{formatTime(selectedBest.last_time)}</p>
                  {(() => {
                    const { diff, improved } = getTimeDifference(selectedBest.last_time, selectedBest.best_time);
                    if (diff === 0) return <p className="text-xs text-gray-400">= Mejor marca</p>;
                    return (
                      <p className={`text-xs flex items-center gap-1 ${improved ? 'text-green-500' : 'text-red-500'}`}>
                        {improved ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                        {improved ? '🟢' : '🔴'} {improved ? '' : '+'}{formatTime(Math.abs(diff))}
                      </p>
                    );
                  })()}
                </Card>
                <Card>
                  <p className="text-xs text-gray-500 mb-1">Intentos</p>
                  <p className="text-2xl font-bold">{selectedBest.total_attempts}</p>
                </Card>
              </div>

              {progressData.length > 1 ? (
                <Card>
                  <h2 className="text-lg font-bold mb-4">Progresión de tiempo</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => formatTime(v)} />
                        <Tooltip
                          formatter={(value) => [formatTime(Number(value)), 'Tiempo']}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                        />
                        <ReferenceLine y={selectedBest.best_time} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Mejor', fill: '#22c55e', fontSize: 12 }} />
                        <ReferenceLine y={selectedBest.average_time} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Promedio', fill: '#f59e0b', fontSize: 12 }} />
                        <Line type="monotone" dataKey="tiempo" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ) : (
                <Card>
                  <EmptyState
                    icon={<BarChart3 size={48} />}
                    title="Datos insuficientes"
                    description="Necesitás al menos 2 registros para ver el gráfico de progresión"
                  />
                </Card>
              )}

              <Card>
                <h2 className="text-lg font-bold mb-4">Comparación</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm font-medium">Último vs Mejor</span>
                    {(() => {
                      const { diff, improved } = getTimeDifference(selectedBest.last_time, selectedBest.best_time);
                      if (diff === 0) return <span className="font-mono text-green-500 font-bold">= Marca personal</span>;
                      return (
                        <span className={`font-mono font-bold ${improved ? 'text-green-500' : 'text-red-500'}`}>
                          {improved ? '🟢 -' : '🔴 +'}{formatTime(Math.abs(diff))}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm font-medium">Último vs Promedio</span>
                    {(() => {
                      const { diff, improved } = getTimeDifference(selectedBest.last_time, selectedBest.average_time);
                      if (diff === 0) return <span className="font-mono text-gray-400 font-bold">= Promedio</span>;
                      return (
                        <span className={`font-mono font-bold ${improved ? 'text-green-500' : 'text-red-500'}`}>
                          {improved ? '🟢 -' : '🔴 +'}{formatTime(Math.abs(diff))}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </Card>

              {recentResults.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <History size={20} className="text-sky-500" />
                    <h2 className="text-lg font-bold">Últimos tiempos (todas las pruebas)</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Comparado con tu mejor tiempo anterior en esa misma prueba (cronológico).
                  </p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {recentResults.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{row.swim_test?.name ?? 'Prueba'}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(row.trainingDate + 'T12:00:00'), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">{formatTime(row.time)}</p>
                          {row.vsPrior.isFirst ? (
                            <p className="text-xs text-sky-500">Primer registro</p>
                          ) : (
                            <p
                              className={`text-xs font-medium ${row.vsPrior.improved ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {row.vsPrior.improved ? '🟢 Mejoró' : '🔴 Empeoró'}{' '}
                              {formatTime(Math.abs(row.vsPrior.diff))} vs anterior MP
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
