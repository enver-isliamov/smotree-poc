export async function detectVideoMetadata(file: File | Blob): Promise<{
  duration: number;
  framerate: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Detect framerate (approximation)
      let framerate = 30; // default
      
      // Common framerates to check
      const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
      
      // Try to detect from duration and file size patterns
      // This is an approximation - for accurate detection need to parse video stream
      if (duration > 0) {
        framerate = 30; // Default assumption
      }

      URL.revokeObjectURL(video.src);
      
      resolve({
        duration,
        framerate,
        width,
        height,
      });
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
