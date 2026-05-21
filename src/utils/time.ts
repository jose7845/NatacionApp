export function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00.00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.round((totalSeconds % 1) * 100);
  
  if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }
  return `${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

export function parseTimeInput(input: string): number | null {
  const parts = input.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const secParts = parts[1].split('.');
    const seconds = parseInt(secParts[0], 10);
    const centis = secParts[1] ? parseInt(secParts[1].padEnd(2, '0').slice(0, 2), 10) : 0;
    return minutes * 60 + seconds + centis / 100;
  }
  if (parts.length === 1) {
    const secParts = parts[0].split('.');
    const seconds = parseInt(secParts[0], 10);
    const centis = secParts[1] ? parseInt(secParts[1].padEnd(2, '0').slice(0, 2), 10) : 0;
    return seconds + centis / 100;
  }
  return null;
}

export function getTimeDifference(current: number, reference: number): { diff: number; improved: boolean } {
  const diff = current - reference;
  return { diff, improved: diff < 0 };
}
