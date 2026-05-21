import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useTrainingStore } from '@/store/training-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime, parseTimeInput } from '@/utils/time';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, Dumbbell, Clock, ChevronDown, ChevronUp, Users } from 'lucide-react';

export function TrainingsPage() {
  const { user } = useAuthStore();
  const { trainings, swimTests, loading, fetchTrainings, fetchAllTrainings, fetchSwimTests, createTraining, addResult, deleteTraining, deleteResult } = useTrainingStore();
  
  const [showNewTraining, setShowNewTraining] = useState(false);
  const [showAddResult, setShowAddResult] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newNotes, setNewNotes] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleCreateTraining = async () => {
    if (!user || !newDate) return;
    setSaving(true);
    try {
      const training = await createTraining(user.id, newDate, newNotes || undefined);
      setShowNewTraining(false);
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      setNewNotes('');
      setExpandedTraining(training.id);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleAddResult = async () => {
    if (!showAddResult || !selectedTest || !timeInput) return;
    const time = parseTimeInput(timeInput);
    if (time === null || time <= 0) return;
    setSaving(true);
    try {
      await addResult(showAddResult, selectedTest, time);
      setShowAddResult(null);
      setSelectedTest('');
      setTimeInput('');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

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
          <h1 className="text-2xl md:text-3xl font-bold">Entrenamientos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isCoach ? 'Creá y gestioná sesiones de entrenamiento' : 'Tus sesiones de entrenamiento'}
          </p>
        </div>
        <Button onClick={() => setShowNewTraining(true)}>
          <Plus size={18} />
          {isCoach ? 'Nueva sesión' : 'Nuevo'}
        </Button>
      </div>

      {isCoach && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <Users size={18} className="text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Modo entrenador: creás sesiones y los nadadores registran sus tiempos
          </p>
        </div>
      )}

      {trainings.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={48} />}
          title="Sin entrenamientos"
          description={isCoach ? 'Creá la primera sesión de entrenamiento para tus nadadores' : 'No hay entrenamientos registrados todavía'}
          action={<Button onClick={() => setShowNewTraining(true)}><Plus size={18} /> {isCoach ? 'Crear sesión' : 'Crear entrenamiento'}</Button>}
        />
      ) : (
        <div className="space-y-4">
          {trainings.map((training) => (
            <Card key={training.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpandedTraining(expandedTraining === training.id ? null : training.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCoach ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-sky-100 dark:bg-sky-500/10'}`}>
                    <Dumbbell size={20} className={isCoach ? 'text-amber-500' : 'text-sky-500'} />
                  </div>
                  <div>
                    <p className="font-bold">{format(new Date(training.date), "EEEE d 'de' MMMM yyyy", { locale: es })}</p>
                    <p className="text-sm text-gray-500">{training.results.length} pruebas · {training.notes || 'Sin notas'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddResult(training.id)}>
                    <Plus size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTraining(training.id)}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  {expandedTraining === training.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedTraining === training.id && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                  {training.results.length > 0 ? (
                    <div className="space-y-2">
                      {training.results.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{result.swim_test?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold">{formatTime(result.time)}</span>
                            <button onClick={() => deleteResult(result.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Sin resultados registrados. Usá el cronómetro o agregá un tiempo manualmente.</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showNewTraining} onClose={() => setShowNewTraining(false)} title={isCoach ? 'Nueva sesión de entrenamiento' : 'Nuevo entrenamiento'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notas / Descripción</label>
            <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="input-field" rows={3} placeholder={isCoach ? 'Ej: Entrenamiento de velocidad - Series de 50m' : 'Ej: Entrenamiento de velocidad...'} />
          </div>
          <Button onClick={handleCreateTraining} loading={saving} className="w-full">
            Crear {isCoach ? 'sesión' : 'entrenamiento'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!showAddResult} onClose={() => setShowAddResult(null)} title="Agregar resultado">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prueba</label>
            <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="select-field">
              <option value="">Seleccionar prueba...</option>
              {swimTests.map((test) => (
                <option key={test.id} value={test.id}>{test.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tiempo (mm:ss.cc o ss.cc)</label>
            <input type="text" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="input-field font-mono" placeholder="Ej: 1:05.23 o 32.45" />
          </div>
          <Button onClick={handleAddResult} loading={saving} className="w-full" disabled={!selectedTest || !timeInput}>
            Guardar tiempo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
