export function secondsToTimecode(seconds: number, fps: number): string {
  const frames = Math.floor(seconds * fps);
  return frameToTimecode(frames, fps);
}

export function frameToTimecode(frame: number, fps: number): string {
  const h = Math.floor(frame / (fps * 3600));
  const m = Math.floor((frame % (fps * 3600)) / (fps * 60));
  const s = Math.floor((frame % (fps * 60)) / fps);
  const f = frame % fps;
  return [h,m,s,f].map(n => String(n).padStart(2,'0')).join(':');
}

export function timecodeToSeconds(tc: string, fps: number): number {
  const [h,m,s,f] = tc.split(':').map(Number);
  return (h*3600 + m*60 + s) + (f/fps);
}
