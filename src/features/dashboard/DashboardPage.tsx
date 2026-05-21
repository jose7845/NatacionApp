import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useTrainingStore } from '@/store/training-store';
import { useStats } from '@/hooks/useStats';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime, getTimeDifference } from '@/utils/time';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, Timer, Dumbbell, Activity, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { trainings, fetchTrainings, fetchAllTrainings, fetchSwimTests, loading } = useTrainingStore();
  const { personalBests, getProgress, recentTrainings } = useStats(trainings);
  const navigate = useNavigate();
  const isCoach = user?.role === 'coach';

  useEffect(() => {
    if (user) {
      if (isCoach) {
        fetchAllTrainings();
      } else {
        fetchTrainings(user.id);
      }
      fetchSwimTests();
    }
  }, [user]);

  const topBests = personalBests.slice(0, 6);
  const bestForChart = personalBests.length > 0 ? personalBests[0] : null;
  const chartData = bestForChart ? getProgress(bestForChart.swim_test_id).map((p) => ({
    date: format(new Date(p.date), 'dd/MM', { locale: es }),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isCoach ? `Panel de entrenador` : `¡Hola, ${user?.name}!`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isCoach ? 'Gestión de entrenamientos y nadadores' : 'Resumen de tu rendimiento'}
          </p>
        </div>
        {isCoach && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-500/10">
            <Users size={18} className="text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Entrenador</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center">
              <Dumbbell size={20} className="text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trainings.length}</p>
              <p className="text-xs text-gray-500">{isCoach ? 'Sesiones creadas' : 'Entrenamientos'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{personalBests.length}</p>
              <p className="text-xs text-gray-500">Marcas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
              <Timer size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trainings.reduce((acc, t) => acc + t.results.length, 0)}</p>
              <p className="text-xs text-gray-500">Tiempos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {personalBests.filter((pb) => {
                  const diff = getTimeDifference(pb.last_time, pb.best_time);
                  return diff.improved || diff.diff === 0;
                }).length}
              </p>
              <p className="text-xs text-gray-500">Mejorando</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isCoach && bestForChart && chartData.length > 1 ? (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-sky-500" />
              <h2 className="text-lg font-bold">Progreso - {bestForChart.swim_test?.name}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => formatTime(v)} />
                  <Tooltip
                    formatter={(value) => [formatTime(Number(value)), 'Tiempo']}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="tiempo" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : !isCoach ? (
          <Card>
            <EmptyState
              icon={<TrendingUp size={48} />}
              title="Sin datos de progreso"
              description="Registrá entrenamientos para ver tus gráficos de progreso"
            />
          </Card>
        ) : null}

        <Card className={isCoach && (!bestForChart || chartData.length <= 1) ? 'lg:col-span-2' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold">{isCoach ? 'Mejores marcas registradas' : 'Mejores marcas'}</h2>
          </div>
          {topBests.length > 0 ? (
            <div className="space-y-3">
              {topBests.map((pb) => {
                const { diff, improved } = getTimeDifference(pb.last_time, pb.best_time);
                return (
                  <div key={pb.swim_test_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium text-sm">{pb.swim_test?.name}</p>
                      <p className="text-xs text-gray-500">{pb.total_attempts} intentos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{formatTime(pb.best_time)}</p>
                      <p className={`text-xs font-medium ${improved ? 'text-green-500' : diff === 0 ? 'text-gray-400' : 'text-red-500'}`}>
                        {diff === 0 ? '= Mejor marca' : `${improved ? '-' : '+'} ${formatTime(Math.abs(diff))}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Trophy size={48} />}
              title="Sin marcas registradas"
              description={isCoach ? 'Los nadadores registrarán sus tiempos acá' : 'Empezá a registrar tiempos para ver tus mejores marcas'}
            />
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-sky-500" />
            <h2 className="text-lg font-bold">{isCoach ? 'Últimas sesiones' : 'Últimos entrenamientos'}</h2>
          </div>
          {recentTrainings.length > 0 && (
            <button onClick={() => navigate('/trainings')} className="text-sm text-sky-500 hover:text-sky-600 font-medium">
              Ver todos
            </button>
          )}
        </div>
        {recentTrainings.length > 0 ? (
          <div className="space-y-3">
            {recentTrainings.map((training) => (
              <div key={training.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <p className="font-medium">{format(new Date(training.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                  <p className="text-sm text-gray-500">{training.results.length} pruebas · {training.notes || 'Sin notas'}</p>
                </div>
                <div className="text-right">
                  {training.results.length > 0 && (
                    <p className="font-mono text-sm">{formatTime(training.results[0].time)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar size={48} />}
            title={isCoach ? 'Sin sesiones' : 'Sin entrenamientos'}
            description={isCoach ? 'Creá la primera sesión de entrenamiento' : 'Creá tu primer entrenamiento para empezar'}
          />
        )}
      </Card>
    </div>
  );
}
