// lib/timecode.ts
// Timecode utilities for frame-accurate positioning

/**
 * Convert seconds to timecode string (HH:MM:SS:FF)
 */
export function secondsToTimecode(seconds: number, framerate: number): string {
  const totalFrames = Math.floor(seconds * framerate);
  return frameToTimecode(totalFrames, framerate);
}

/**
 * Convert frame number to timecode string (HH:MM:SS:FF)
 */
export function frameToTimecode(frame: number, framerate: number): string {
  const hours = Math.floor(frame / (framerate * 3600));
  const minutes = Math.floor((frame % (framerate * 3600)) / (framerate * 60));
  const seconds = Math.floor((frame % (framerate * 60)) / framerate);
  const frames = frame % framerate;

  return [hours, minutes, seconds, frames]
    .map(n => n.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Convert timecode string to frame number
 */
export function timecodeToFrame(timecode: string, framerate: number): number {
  const parts = timecode.split(':');
  
  if (parts.length !== 4) {
    throw new Error(`Invalid timecode format: ${timecode}`);
  }

  const [hours, minutes, seconds, frames] = parts.map(p => parseInt(p, 10));

  if (frames >= framerate) {
    throw new Error(`Invalid frame number ${frames} for framerate ${framerate}`);
  }

  return (hours * 3600 + minutes * 60 + seconds) * framerate + frames;
}

/**
 * Convert timecode to seconds
 */
export function timecodeToSeconds(timecode: string, framerate: number): number {
  const frame = timecodeToFrame(timecode, framerate);
  return frame / framerate;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get frame number from current video time
 */
export function getCurrentFrame(currentTime: number, framerate: number): number {
  return Math.floor(currentTime * framerate);
}

/**
 * Get video time from frame number
 */
export function getTimeFromFrame(frame: number, framerate: number): number {
  return frame / framerate;
}

/**
 * Parse framerate from video metadata
 * Common framerates: 23.976, 24, 25, 29.97, 30, 50, 59.94, 60
 */
export function normalizeFramerate(fps: number): number {
  // Round to nearest common framerate
  const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
  
  return commonRates.reduce((prev, curr) => 
    Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev
  );
}
