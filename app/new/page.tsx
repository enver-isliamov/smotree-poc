'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState({name: '', desc: '', url: '', author: '', fps: '25'});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = {
      id: 'proj_' + Date.now(),
      name: form.name,
      description: form.desc,
      videoUrl: form.url,
      videoType: 'url' as const,
      framerate: Number(form.fps),
      duration: 0,
      createdAt: new Date().toISOString(),
      createdBy: form.author,
      comments: []
    };
    storage.saveProject(project);
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-6 inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />Назад
        </Link>
        <h1 className="text-3xl font-bold mb-8">Новый проект</h1>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block mb-2">Название *</label>
            <input required className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block mb-2">Описание</label>
            <textarea className="input" rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
          </div>
          <div>
            <label className="block mb-2">Ваше имя *</label>
            <input required className="input" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
          </div>
          <div>
            <label className="block mb-2">URL видео (YouTube/Vimeo/прямая ссылка) *</label>
            <input required type="url" className="input" placeholder="https://youtube.com/watch?v=..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
          </div>
          <div>
            <label className="block mb-2">FPS</label>
            <input type="number" className="input" value={form.fps} onChange={e => setForm({...form, fps: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary w-full">Создать проект</button>
        </form>
        <style jsx global>{`
          .input {
            @apply w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none;
          }
        `}</style>
      </div>
    </div>
  );
}
