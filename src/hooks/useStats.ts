import { useMemo } from 'react';
import type { TrainingWithResults, PersonalBest, ProgressPoint } from '@/types';
import { getTimeDifference } from '@/utils/time';

export function useStats(trainings: TrainingWithResults[]) {
  const personalBests = useMemo((): PersonalBest[] => {
    const map = new Map<string, { times: { time: number; date: string }[]; swimTest: any }>();

    for (const training of trainings) {
      for (const result of training.results) {
        const key = result.swim_test_id;
        if (!map.has(key)) {
          map.set(key, { times: [], swimTest: result.swim_test });
        }
        map.get(key)!.times.push({ time: result.time, date: training.date });
      }
    }

    return Array.from(map.entries()).map(([swimTestId, { times, swimTest }]) => {
      const sorted = [...times].sort((a, b) => a.time - b.time);
      const sum = times.reduce((acc, t) => acc + t.time, 0);
      const lastByDate = [...times].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return {
        swim_test_id: swimTestId,
        swim_test: swimTest,
        best_time: sorted[0].time,
        average_time: sum / times.length,
        total_attempts: times.length,
        last_time: lastByDate[0].time,
        last_date: lastByDate[0].date,
      };
    });
  }, [trainings]);

  const getProgress = useMemo(() => {
    return (swimTestId: string): ProgressPoint[] => {
      const points: ProgressPoint[] = [];
      for (const training of trainings) {
        for (const result of training.results) {
          if (result.swim_test_id === swimTestId) {
            points.push({ date: training.date, time: result.time });
          }
        }
      }
      return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };
  }, [trainings]);

  const recentTrainings = useMemo(() => {
    return [...trainings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [trainings]);

  const recentResults = useMemo(() => {
    type Row = {
      id: string;
      swim_test_id: string;
      swim_test?: { name?: string };
      time: number;
      trainingDate: string;
      created_at: string;
      vsPrior: { improved: boolean; diff: number; isFirst: boolean };
    };
    const flat: { r: TrainingWithResults['results'][number]; trainingDate: string }[] = [];
    for (const t of trainings) {
      for (const r of t.results) {
        flat.push({ r, trainingDate: t.date });
      }
    }
    flat.sort((a, b) => new Date(b.r.created_at).getTime() - new Date(a.r.created_at).getTime());

    return flat.slice(0, 20).map(({ r, trainingDate }) => {
      const priorTimes = flat
        .filter(
          ({ r: other }) =>
            other.swim_test_id === r.swim_test_id &&
            new Date(other.created_at).getTime() < new Date(r.created_at).getTime()
        )
        .map(({ r: o }) => o.time);
      const priorMin = priorTimes.length > 0 ? Math.min(...priorTimes) : null;
      let vsPrior: Row['vsPrior'];
      if (priorMin == null) {
        vsPrior = { improved: true, diff: 0, isFirst: true };
      } else {
        const { diff, improved } = getTimeDifference(r.time, priorMin);
        vsPrior = { improved, diff, isFirst: false };
      }
      return {
        id: r.id,
        swim_test_id: r.swim_test_id,
        swim_test: r.swim_test,
        time: r.time,
        trainingDate,
        created_at: r.created_at,
        vsPrior,
      };
    });
  }, [trainings]);

  return { personalBests, getProgress, recentTrainings, recentResults };
}
