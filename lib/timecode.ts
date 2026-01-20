export function secondsToTimecode(seconds: number, fps: number): string {
  const totalFrames = Math.floor(seconds * fps);
  const h = Math.floor(totalFrames / (fps * 3600));
  const m = Math.floor((totalFrames % (fps * 3600)) / (fps * 60));
  const s = Math.floor((totalFrames % (fps * 60)) / fps);
  const f = totalFrames % fps;
  return [h, m, s, f].map(n => String(n).padStart(2, '0')).join(':');
}

export function timecodeToSeconds(timecode: string, fps: number): number {
  const [h, m, s, f] = timecode.split(':').map(Number);
  return (h * 3600) + (m * 60) + s + (f / fps);
}

export function frameToSeconds(frame: number, fps: number): number {
  return frame / fps;
}

export function secondsToFrame(seconds: number, fps: number): number {
  return Math.floor(seconds * fps);
}
