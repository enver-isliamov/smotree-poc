'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Plus, Download, Upload, Share2 } from 'lucide-react';
import { storageManager } from '@/lib/storage-manager';
import { formatFileSize, formatDuration } from '@/lib/video-metadata';
import NamePrompt from '@/components/NamePrompt';
import type { Project } from '@/types';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setProjects(storageManager.getAllProjects());
  }, []);

  const handleExportAll = () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smotree-backup-${Date.now()}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        imported.forEach((p: Project) => storageManager.saveProject(p));
        setProjects(storageManager.getAllProjects());
        alert('Проекты импортированы!');
      } catch {
        alert('Ошибка импорта');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <NamePrompt onComplete={setUserName} />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Video className="w-10 h-10 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold">SmoTree Pro</h1>
                <p className="text-gray-400 text-sm">Professional Video Review</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleExportAll} className="btn-secondary text-sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </button>
              <label className="btn-secondary text-sm cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <Link href="/new" className="btn-primary text-sm">
                <Plus className="w-5 h-5 mr-2" />
                Новый проект
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`} className="card hover:border-blue-500 transition group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg group-hover:text-blue-400 transition">
                      {project.name}
                    </h3>
                    {project.videoType === 'local' && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Local</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Комментариев:</span>
                      <span className="text-white">{project.comments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Длительность:</span>
                      <span className="text-white">{formatDuration(project.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FPS:</span>
                      <span className="text-white">{project.framerate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Размер:</span>
                      <span className="text-white">{formatFileSize(project.videoSize)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                    Создал: {project.createdBy}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Video className="w-20 h-20 text-gray-700 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Нет проектов</h2>
              <p className="text-gray-400 mb-8">Создайте первый проект для начала работы</p>
              <Link href="/new" className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Создать проект
              </Link>
            </div>
          )}

          {/* Feature Cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="card border-blue-500/20">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Smart Storage</h3>
              <p className="text-sm text-gray-400">
                Автоматический выбор: IndexedDB для малых файлов, Cloud для больших
              </p>
            </div>
            <div className="card border-purple-500/20">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Easy Sharing</h3>
              <p className="text-sm text-gray-400">
                Делитесь ссылками, коллеги оставляют комментарии в реальном времени
              </p>
            </div>
            <div className="card border-green-500/20">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">DaVinci Integration</h3>
              <p className="text-sm text-gray-400">
                Экспорт XML с маркерами напрямую в DaVinci Resolve
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
