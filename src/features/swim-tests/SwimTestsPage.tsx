import { useEffect, useState } from 'react';
import { useTrainingStore } from '@/store/training-store';
import { Card } from '@/components/ui/Card';
import { STYLE_LABELS, TYPE_LABELS } from '@/lib/swim-tests-data';
import type { SwimStyle } from '@/types';
import { ListChecks, Filter } from 'lucide-react';

const STYLE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'freestyle', label: 'Libre' },
  { value: 'backstroke', label: 'Espalda' },
  { value: 'breaststroke', label: 'Pecho' },
  { value: 'butterfly', label: 'Mariposa' },
  { value: 'medley', label: 'Combinado' },
];

const STYLE_COLORS: Record<string, string> = {
  freestyle: 'bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
  backstroke: 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  breaststroke: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  butterfly: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  medley: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
};

export function SwimTestsPage() {
  const { swimTests, fetchSwimTests } = useTrainingStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSwimTests();
  }, []);

  const filtered = filter === 'all' ? swimTests : swimTests.filter((t) => t.style === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Pruebas de natación</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Pruebas oficiales según normativa FINA</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={18} className="text-gray-400 flex-shrink-0" />
        {STYLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((test) => (
          <Card key={test.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${STYLE_COLORS[test.style] || 'bg-gray-100'}`}>
                  <ListChecks size={20} />
                </div>
                <div>
                  <p className="font-bold">{test.name}</p>
                  <p className="text-sm text-gray-500">{test.distance}m · {STYLE_LABELS[test.style]}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${test.type === 'relay' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600' : 'bg-sky-100 dark:bg-sky-500/10 text-sky-600'}`}>
                {TYPE_LABELS[test.type]}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
