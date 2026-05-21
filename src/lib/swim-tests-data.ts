import type { SwimTest } from '@/types';

export const OFFICIAL_SWIM_TESTS: Omit<SwimTest, 'id'>[] = [
  // Freestyle
  { name: '50m Libre', distance: 50, style: 'freestyle', type: 'individual' },
  { name: '100m Libre', distance: 100, style: 'freestyle', type: 'individual' },
  { name: '200m Libre', distance: 200, style: 'freestyle', type: 'individual' },
  { name: '400m Libre', distance: 400, style: 'freestyle', type: 'individual' },
  { name: '800m Libre', distance: 800, style: 'freestyle', type: 'individual' },
  { name: '1500m Libre', distance: 1500, style: 'freestyle', type: 'individual' },
  // Backstroke
  { name: '50m Espalda', distance: 50, style: 'backstroke', type: 'individual' },
  { name: '100m Espalda', distance: 100, style: 'backstroke', type: 'individual' },
  { name: '200m Espalda', distance: 200, style: 'backstroke', type: 'individual' },
  // Breaststroke
  { name: '50m Pecho', distance: 50, style: 'breaststroke', type: 'individual' },
  { name: '100m Pecho', distance: 100, style: 'breaststroke', type: 'individual' },
  { name: '200m Pecho', distance: 200, style: 'breaststroke', type: 'individual' },
  // Butterfly
  { name: '50m Mariposa', distance: 50, style: 'butterfly', type: 'individual' },
  { name: '100m Mariposa', distance: 100, style: 'butterfly', type: 'individual' },
  { name: '200m Mariposa', distance: 200, style: 'butterfly', type: 'individual' },
  // Medley
  { name: '200m Combinado', distance: 200, style: 'medley', type: 'individual' },
  { name: '400m Combinado', distance: 400, style: 'medley', type: 'individual' },
  // Relays
  { name: '4x100m Libre', distance: 400, style: 'freestyle', type: 'relay' },
  { name: '4x200m Libre', distance: 800, style: 'freestyle', type: 'relay' },
  { name: '4x100m Combinado', distance: 400, style: 'medley', type: 'relay' },
];

export const STYLE_LABELS: Record<string, string> = {
  freestyle: 'Libre',
  backstroke: 'Espalda',
  breaststroke: 'Pecho',
  butterfly: 'Mariposa',
  medley: 'Combinado',
};

export const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  relay: 'Posta',
};
