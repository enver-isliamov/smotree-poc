'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VideoUploader from '@/components/VideoUploader';
import NamePrompt from '@/components/NamePrompt';
import { storageManager } from '@/lib/storage-manager';
import type { Project } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [videoData, setVideoData] = useState<any>(null);

  const handleSubmit = () => {
    if (!formData.name || !videoData || !userName) return;

    const project: Project = {
      id: 'proj_' + Date.now(),
      name: formData.name,
      description: formData.description,
      createdAt: new Date().toISOString(),
      createdBy: userName,
      createdByRole: 'admin',
      videoUrl: videoData.videoUrl,
      videoType: videoData.videoType,
      videoSize: videoData.videoSize,
      fileName: videoData.fileName,
      duration: videoData.duration,
      framerate: videoData.framerate,
      width: videoData.width,
      height: videoData.height,
      comments: [],
      shareToken: storageManager.generateShareToken(),
    };

    storageManager.saveProject(project);
    router.push(`/project/${project.id}`);
  };

  return (
    <>
      <NamePrompt onComplete={setUserName} />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к проектам
          </Link>

          <h1 className="text-3xl font-bold mb-8">Новый проект</h1>

          <div className="space-y-6">
            {/* Project info */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Информация о проекте</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Название проекта *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Рекламный ролик Q1 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Корпоративная реклама для весенней кампании"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Video upload */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Видеофайл</h2>
              {videoData ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-400">✓ Видео загружено</p>
                      <p className="text-sm text-gray-400 mt-1">{videoData.fileName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {videoData.width}x{videoData.height} • {videoData.framerate} FPS • {Math.round(videoData.duration)}s
                      </p>
                    </div>
                    <button
                      onClick={() => setVideoData(null)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ) : (
                <VideoUploader onUpload={setVideoData} />
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !videoData}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать проект
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
