'use client';
import { useState, useCallback } from 'react';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { indexedDB } from '@/lib/indexeddb';
import { detectVideoMetadata, formatFileSize } from '@/lib/video-metadata';

interface VideoUploadResult {
  videoUrl: string;
  videoType: 'local';
  fileName: string;
  videoSize: number;
  duration: number;
  framerate: number;
  width: number;
  height: number;
}

export default function VideoUploader({ 
  onUpload 
}: { 
  onUpload: (data: VideoUploadResult) => void 
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Пожалуйста, выберите видеофайл');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      // Detect metadata
      const metadata = await detectVideoMetadata(file);

      // Save to IndexedDB
      const videoId = 'video_' + Date.now();
      await indexedDB.saveVideo(videoId, file, file.name);

      clearInterval(progressInterval);
      setProgress(100);

      // Create object URL for playback
      const videoUrl = URL.createObjectURL(file);

      // Return result
      onUpload({
        videoUrl,
        videoType: 'local',
        fileName: file.name,
        videoSize: file.size,
        duration: metadata.duration,
        framerate: metadata.framerate,
        width: metadata.width,
        height: metadata.height,
      });

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Ошибка загрузки видео');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (uploading) {
    return (
      <div className="border-2 border-gray-700 rounded-lg p-12 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <div className="mb-2">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-gray-400">Загрузка... {progress}%</p>
      </div>
    );
  }

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          block border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500'}
        `}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-500'}`} />
        <p className="text-lg mb-2">
          {dragActive ? 'Отпустите файл' : 'Перетащите видео или нажмите для выбора'}
        </p>
        <p className="text-sm text-gray-500">
          Поддержка: MP4, MOV, AVI, WebM • Любой размер
        </p>
      </label>
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400">
          <X className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}
