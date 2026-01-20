'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Plus, Download, Upload } from 'lucide-react';
import { storage } from '@/lib/storage';
import type { Project } from '@/types';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const handleExport = () => {
    const data = storage.exportData();
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
        storage.importData(ev.target?.result as string);
        setProjects(storage.getProjects());
        alert('Проекты импортированы!');
      } catch {
        alert('Ошибка импорта');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Video className="w-10 h-10 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">SmoTree</h1>
              <p className="text-gray-400 text-sm">Video Review Platform</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </button>
            <label className="btn-secondary cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <Link href="/new" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Новый проект
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/project/${p.id}`} className="card hover:border-blue-500">
              <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>
              <div className="text-sm text-gray-500">
                <div>Комментариев: {p.comments.length}</div>
                <div>Автор: {p.createdBy}</div>
              </div>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl mb-2">Нет проектов</h3>
            <Link href="/new" className="btn-primary inline-flex items-center mt-4">
              <Plus className="w-5 h-5 mr-2" />
              Создать первый проект
            </Link>
          </div>
        )}

        <style jsx global>{`
          .btn-primary {
            @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center transition;
          }
          .btn-secondary {
            @apply px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center transition;
          }
          .card {
            @apply bg-gray-900 border border-gray-800 rounded-lg p-6 transition;
          }
        `}</style>
      </div>
    </div>
  );
}
