'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, MessageSquare, Check, Clock } from 'lucide-react';
import { storage } from '@/lib/storage';
import { generateResolveXML } from '@/lib/xml';
import { secondsToTimecode } from '@/lib/timecode';
import type { Project, Comment } from '@/types';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const p = storage.getProject(params.id as string);
    if (!p) router.push('/');
    else setProject(p);
  }, [params.id, router]);

  const handleAddComment = () => {
    if (!project || !comment.trim() || !userName.trim()) return;
    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      timecode: secondsToTimecode(currentTime, project.framerate),
      frameNumber: Math.floor(currentTime * project.framerate),
      author: userName,
      text: comment,
      status: 'unresolved',
      createdAt: new Date().toISOString()
    };
    storage.addComment(project.id, newComment);
    setProject(storage.getProject(project.id));
    setComment('');
  };

  const toggleStatus = (cId: string) => {
    if (!project) return;
    const c = project.comments.find(x => x.id === cId);
    if (!c) return;
    const newStatus = c.status === 'resolved' ? 'unresolved' : 'resolved';
    storage.updateComment(project.id, cId, {status: newStatus});
    setProject(storage.getProject(project.id));
  };

  const exportXML = () => {
    if (!project) return;
    const xml = generateResolveXML(project);
    const blob = new Blob([xml], {type: 'application/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g,'_')}_resolve.xml`;
    a.click();
  };

  if (!project) return <div className="p-8">Loading...</div>;

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    return url;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-400 hover:text-white inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />Назад
          </Link>
          <button onClick={exportXML} className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export XML для DaVinci
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-400 mb-8">{project.description}</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                src={getEmbedUrl(project.videoUrl)}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Добавить комментарий
              </h3>
              <input
                className="input mb-2"
                placeholder="Ваше имя"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
              <textarea
                className="input mb-2"
                rows={3}
                placeholder="Ваш комментарий..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button onClick={handleAddComment} className="btn-primary">Добавить</button>
            </div>
          </div>

          <div>
            <div className="card">
              <h3 className="font-semibold mb-4">Комментарии ({project.comments.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {project.comments.map(c => (
                  <div key={c.id} className="p-3 bg-gray-800 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm">
                        <div className="font-medium">{c.author}</div>
                        <div className="text-gray-500">{c.timecode}</div>
                      </div>
                      <button onClick={() => toggleStatus(c.id)} className="text-xs">
                        {c.status === 'resolved' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
