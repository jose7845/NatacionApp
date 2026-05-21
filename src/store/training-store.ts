import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Training, TrainingResult, TrainingWithResults, SwimTest } from '@/types';

interface TrainingState {
  trainings: TrainingWithResults[];
  swimTests: SwimTest[];
  loading: boolean;
  fetchSwimTests: () => Promise<void>;
  fetchTrainings: (userId: string) => Promise<void>;
  fetchAllTrainings: () => Promise<void>;
  createTraining: (userId: string, date: string, notes?: string) => Promise<Training>;
  addResult: (trainingId: string, swimTestId: string, time: number) => Promise<TrainingResult>;
  deleteTraining: (trainingId: string) => Promise<void>;
  deleteResult: (resultId: string) => Promise<void>;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  trainings: [],
  swimTests: [],
  loading: false,

  fetchSwimTests: async () => {
    const { data, error } = await supabase.from('swim_tests').select('*').order('style').order('distance');
    if (error) console.error('Error fetching swim tests:', error);
    if (data) set({ swimTests: data });
  },

  fetchTrainings: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('trainings')
      .select('*, results:training_results(*, swim_test:swim_tests(*))')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching trainings:', error);
      set({ loading: false });
      return;
    }

    const sortedData = (data || []).map((t: any) => ({
      ...t,
      results: (t.results || []).sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }));

    set({ trainings: sortedData, loading: false });
  },

  fetchAllTrainings: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('trainings')
      .select('*, results:training_results(*, swim_test:swim_tests(*))')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching all trainings:', error);
      set({ loading: false });
      return;
    }

    const sortedData = (data || []).map((t: any) => ({
      ...t,
      results: (t.results || []).sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }));

    set({ trainings: sortedData, loading: false });
  },

  createTraining: async (userId, date, notes) => {
    const { data, error } = await supabase
      .from('trainings')
      .insert({ user_id: userId, date, notes })
      .select()
      .single();
    if (error) throw new Error(error.message || 'No se pudo crear el entrenamiento');
    const newTraining: TrainingWithResults = { ...data, results: [] };
    set((state) => ({ trainings: [newTraining, ...state.trainings] }));
    return data;
  },

  addResult: async (trainingId, swimTestId, time) => {
    const timeRounded = Math.round(Number(time) * 100) / 100;
    if (timeRounded <= 0) throw new Error('El tiempo debe ser mayor a 0');

    const { data, error } = await supabase
      .from('training_results')
      .insert({ training_id: trainingId, swim_test_id: swimTestId, time: timeRounded })
      .select('*, swim_test:swim_tests(*)')
      .single();
    if (error) throw new Error(error.message || 'No se pudo guardar el tiempo');

    set((state) => ({
      trainings: state.trainings.map((t) =>
        t.id === trainingId ? { ...t, results: [...t.results, data] } : t
      ),
    }));
    return data;
  },

  deleteTraining: async (trainingId) => {
    await supabase.from('training_results').delete().eq('training_id', trainingId);
    await supabase.from('trainings').delete().eq('id', trainingId);
    set((state) => ({ trainings: state.trainings.filter((t) => t.id !== trainingId) }));
  },

  deleteResult: async (resultId) => {
    await supabase.from('training_results').delete().eq('id', resultId);
    set((state) => ({
      trainings: state.trainings.map((t) => ({
        ...t,
        results: t.results.filter((r) => r.id !== resultId),
      })),
    }));
  },
}));
