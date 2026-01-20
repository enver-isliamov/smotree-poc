'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, MessageSquare } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import CommentThread from '@/components/CommentThread';
import NamePrompt from '@/components/NamePrompt';
import { storageManager } from '@/lib/storage-manager';
import { secondsToTimecode, secondsToFrame } from '@/lib/timecode';
import { generateResolveXML } from '@/lib/xml-export';
import type { Project, Comment } from '@/types';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentTime, setCommentTime] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const p = storageManager.getProject(params.id as string);
    if (!p) {
      router.push('/');
    } else {
      setProject(p);
    }
  }, [params.id, router]);

  // Real-time sync using BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel(`smotree_project_${params.id}`);
    
    channel.onmessage = (event) => {
      if (event.data.type === 'comment_added' || event.data.type === 'comment_updated') {
        const updated = storageManager.getProject(params.id as string);
        if (updated) setProject(updated);
      }
    };

    return () => channel.close();
  }, [params.id]);

  const handleAddComment = () => {
    if (!project || !commentText.trim() || !userName) return;

    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      author: userName,
      text: commentText.trim(),
      timecode: secondsToTimecode(commentTime, project.framerate),
      frameNumber: secondsToFrame(commentTime, project.framerate),
      timestamp: commentTime,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...project,
      comments: [...project.comments, newComment],
    };

    storageManager.saveProject(updated);
    setProject(updated);

    // Broadcast to other tabs
    const channel = new BroadcastChannel(`smotree_project_${project.id}`);
    channel.postMessage({ type: 'comment_added', comment: newComment });
    channel.close();

    setCommentText('');
    setShowCommentForm(false);
  };

  const handleToggleStatus = (commentId: string) => {
    if (!project) return;

    const updated: Project = {
      ...project,
      comments: project.comments.map(c =>
        c.id === commentId
          ? { ...c, status: (c.status === 'open' ? 'resolved' : 'open') as 'open' | 'resolved' }
          : c
      ),
    };

    storageManager.saveProject(updated);
    setProject(updated);

    // Broadcast
    const channel = new BroadcastChannel(`smotree_project_${project.id}`);
    channel.postMessage({ type: 'comment_updated' });
    channel.close();
  };

  const handleCommentClick = (comment: Comment) => {
    // This will be handled by VideoPlayer
  };

  const handleTimelineClick = (time: number) => {
    setCommentTime(time);
    setShowCommentForm(true);
  };

  const handleExportXML = () => {
    if (!project) return;
    
    const xml = generateResolveXML(project);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_resolve.xml`;
    a.click();
  };

  const handleShare = () => {
    if (!project) return;
    const shareUrl = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <>
      <NamePrompt onComplete={setUserName} />
      
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Link>
            
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleShare} className="btn-secondary text-sm">
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </button>
              <button onClick={handleExportXML} className="btn-primary text-sm">
                <Download className="w-4 h-4 mr-2" />
                Export XML
              </button>
            </div>
          </div>

          {/* Project info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-400">{project.description}</p>
            )}
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video player - 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <VideoPlayer
                videoUrl={project.videoUrl}
                framerate={project.framerate}
                comments={project.comments}
                onTimelineClick={handleTimelineClick}
              />

              {/* Add comment form */}
              {showCommentForm && userName && (
                <div className="card animate-fade-in">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Новый комментарий
                  </h3>
                  <div className="mb-2 text-sm text-gray-400 font-mono">
                    {secondsToTimecode(commentTime, project.framerate)}
                  </div>
                  <textarea
                    className="input mb-3"
                    rows={3}
                    placeholder="Ваш комментарий..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddComment} className="btn-primary flex-1">
                      Добавить комментарий
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentText('');
                      }}
                      className="btn-secondary"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Comments sidebar - 1 column */}
            <div>
              <CommentThread
                comments={project.comments}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          ✓ Ссылка скопирована!
        </div>
      )}
    </>
  );
}
