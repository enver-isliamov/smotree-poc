// app/page.tsx
// Home page - Project list

import Link from 'next/link';
import { Plus, Video, Clock, MessageSquare } from 'lucide-react';

// Mock projects for demo
const projects = [
  {
    id: '1',
    name: 'Рекламный ролик Q1 2026',
    description: 'Корпоративная реклама для весенней кампании',
    createdAt: '2026-01-15T10:00:00Z',
    createdBy: 'Иван Петров',
    videoFilename: 'commercial_v3.mp4',
    videoDuration: 120,
    commentCount: 42,
    unresolvedCount: 15
  },
  {
    id: '2',
    name: 'Презентационное видео',
    description: 'Видео для инвесторской презентации',
    createdAt: '2026-01-18T14:30:00Z',
    createdBy: 'Мария Сидорова',
    videoFilename: 'presentation.mov',
    videoDuration: 180,
    commentCount: 28,
    unresolvedCount: 8
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">SmoTree</h1>
              <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                PoC
              </span>
            </div>
            
            <Link
              href="/projects/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Новый проект</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Проекты</h2>
          <p className="text-gray-400">
            Управляйте видеопроектами и комментариями
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block group"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition">
                {/* Project Name */}
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition">
                  {project.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Video className="w-4 h-4 mr-2" />
                    <span>{project.videoFilename}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{Math.floor(project.videoDuration / 60)} мин</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>{project.commentCount} комментариев</span>
                    </div>
                    
                    {project.unresolvedCount > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded">
                        {project.unresolvedCount} не решены
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                  <div>Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}</div>
                  <div>Автор: {project.createdBy}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State (if no projects) */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Нет проектов
            </h3>
            <p className="text-gray-500 mb-6">
              Создайте первый проект для начала работы
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Создать проект</span>
            </Link>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Загрузка видео
            </h3>
            <p className="text-gray-400 text-sm">
              Поддержка локальных файлов, Яндекс.Диск и YouTube
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Комментарии в реальном времени
            </h3>
            <p className="text-gray-400 text-sm">
              Совместная работа над видео с точным позиционированием
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Экспорт в DaVinci Resolve
            </h3>
            <p className="text-gray-400 text-sm">
              Автоматическое создание маркеров на таймлинии
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2026 SmoTree. Proof of Concept
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-gray-300 transition">
                Документация
              </a>
              <a href="#" className="hover:text-gray-300 transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
