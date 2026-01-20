'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, MessageSquare, CheckCircle, Edit2, Trash2, Archive } from 'lucide-react';
import MobileVideoPlayer from '@/components/MobileVideoPlayer';
import VoiceCommentForm from '@/components/VoiceCommentForm';
import FloatingActionButton from '@/components/FloatingActionButton';
import NamePrompt from '@/components/NamePrompt';
import { storageManager } from '@/lib/storage-manager';
import { secondsToTimecode, secondsToFrame } from '@/lib/timecode';
import { generateResolveXML } from '@/lib/xml-export';
import { getUserPermissions, canEditComment } from '@/lib/permissions';
import type { Project, Comment } from '@/types';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentStartTime, setCommentStartTime] = useState(0);
  const [commentEndTime, setCommentEndTime] = useState<number | undefined>();
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const p = storageManager.getProject(params.id as string);
    if (!p) {
      router.push('/');
    } else {
      setProject(p);
    }
  }, [params.id, router]);

  // Real-time sync
  useEffect(() => {
    const channel = new BroadcastChannel(`smotree_project_${params.id}`);
    channel.onmessage = () => {
      const updated = storageManager.getProject(params.id as string);
      if (updated) setProject(updated);
    };
    return () => channel.close();
  }, [params.id]);

  const permissions = project && userName ? getUserPermissions(project, userName) : null;
  const isCreator = project && userName ? project.createdBy === userName : false;

  const handleAddComment = (text: string, isVoice: boolean) => {
    if (!project || !userName) return;

    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      author: userName,
      authorRole: isCreator ? 'admin' : 'reviewer',
      text: text,
      timecode: secondsToTimecode(commentStartTime, project.framerate),
      endTimecode: commentEndTime ? secondsToTimecode(commentEndTime, project.framerate) : undefined,
      frameNumber: secondsToFrame(commentStartTime, project.framerate),
      startTime: commentStartTime,
      endTime: commentEndTime,
      status: 'open',
      createdAt: new Date().toISOString(),
      isVoiceInput: isVoice,
    };

    const updated: Project = {
      ...project,
      comments: [...project.comments, newComment],
    };

    storageManager.saveProject(updated);
    setProject(updated);
    setShowCommentForm(false);
    setCommentEndTime(undefined);
    setIsRangeMode(false);

    broadcast();
  };

  const handleEditComment = (commentId: string, newText: string) => {
    if (!project || !userName) return;

    const updated: Project = {
      ...project,
      comments: project.comments.map(c =>
        c.id === commentId ? { ...c, text: newText } : c
      ),
    };

    storageManager.saveProject(updated);
    setProject(updated);
    setEditingCommentId(null);
    broadcast();
  };

  const handleDeleteComment = (commentId: string) => {
    if (!project || !permissions?.canDeleteComments) return;
    
    if (!confirm('Удалить комментарий?')) return;

    const updated: Project = {
      ...project,
      comments: project.comments.filter(c => c.id !== commentId),
    };

    storageManager.saveProject(updated);
    setProject(updated);
    broadcast();
  };

  const handleToggleStatus = (commentId: string) => {
    if (!project || !isCreator) return;

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
    broadcast();
  };

  const handleFABClick = () => {
    if (isRangeMode && !commentEndTime) {
      setCommentEndTime(currentTime);
      setShowCommentForm(true);
    } else {
      setCommentStartTime(currentTime);
      setCommentEndTime(undefined);
      setShowCommentForm(true);
    }
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

  const broadcast = () => {
    if (!project) return;
    const channel = new BroadcastChannel(`smotree_project_${project.id}`);
    channel.postMessage({ type: 'update' });
    channel.close();
  };

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const openComments = project.comments.filter(c => c.status === 'open').length;
  const resolvedComments = project.comments.filter(c => c.status === 'resolved').length;

  return (
    <>
      <NamePrompt onComplete={setUserName} />
      
      <div className="min-h-screen pb-32 md:pb-8 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Назад</span>
            </Link>
            
            <div className="flex items-center gap-2">
              {isCreator && (
                <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                  Создатель
                </div>
              )}
              <button
                onClick={handleShare}
                className="btn-touch bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                title="Поделиться"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportXML}
                className="btn-touch bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                title="Export XML"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project Info Card */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 mb-6 shadow-xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-gray-400 mb-4">{project.description}</p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  <span className="font-semibold text-white">{project.comments.length}</span>
                  <span className="text-gray-400 ml-1">комментариев</span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm text-red-400 font-medium">{openComments} открыто</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400 font-medium">{resolvedComments} решено</span>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="mb-6 shadow-2xl">
            <MobileVideoPlayer
              videoUrl={project.videoUrl}
              framerate={project.framerate}
              comments={project.comments}
              onTimeUpdate={(time) => setCurrentTime(time)}
              onPause={() => setIsPaused(true)}
            />
          </div>

          {/* Comments Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Комментарии
              </h3>
              {isCreator && openComments > 0 && (
                <div className="text-sm text-gray-400">
                  {openComments} требуют внимания
                </div>
              )}
            </div>

            <div className="space-y-3">
              {project.comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg mb-2">Нет комментариев</p>
                  <p className="text-sm">Поставьте видео на паузу и добавьте первый комментарий</p>
                </div>
              ) : (
                project.comments
                  .sort((a, b) => a.startTime - b.startTime)
                  .map((comment) => {
                    const canEdit = canEditComment(
                      comment.author,
                      userName || '',
                      isCreator,
                      comment.status
                    );
                    const isEditing = editingCommentId === comment.id;

                    return (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg border transition-all ${
                          comment.status === 'resolved'
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">{comment.author}</span>
                              {comment.authorRole === 'admin' && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                  Создатель
                                </span>
                              )}
                              {comment.isVoiceInput && (
                                <span className="text-purple-400" title="Голосовой ввод">🎤</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {comment.endTimecode
                                ? `${comment.timecode} → ${comment.endTimecode}`
                                : comment.timecode}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Status toggle (только для создателя) */}
                            {isCreator && (
                              <button
                                onClick={() => handleToggleStatus(comment.id)}
                                className={`btn-touch rounded-lg transition ${
                                  comment.status === 'resolved'
                                    ? 'text-green-500 hover:bg-green-500/10'
                                    : 'text-yellow-500 hover:bg-yellow-500/10'
                                }`}
                                title={comment.status === 'resolved' ? 'Открыть снова' : 'Отметить как решено'}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}

                            {/* Edit (автор может редактировать открытые) */}
                            {canEdit && comment.status === 'open' && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditText(comment.text);
                                }}
                                className="btn-touch text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                                title="Редактировать"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete (только создатель) */}
                            {permissions?.canDeleteComments && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="btn-touch text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comment text */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(comment.id, editText)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                        )}

                        {/* Status badge */}
                        {comment.status === 'resolved' && (
                          <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Принято в работу
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* FAB */}
        {isPaused && userName && (
          <FloatingActionButton
            onClick={handleFABClick}
            onRangeMode={() => {
              if (!isRangeMode) {
                setCommentStartTime(currentTime);
                setCommentEndTime(undefined);
              }
              setIsRangeMode(!isRangeMode);
            }}
            show={true}
            isRangeMode={isRangeMode}
          />
        )}

        {/* Voice Comment Form */}
        {showCommentForm && userName && (
          <div className="fixed inset-x-0 bottom-0 z-50">
            <VoiceCommentForm
              startTime={commentStartTime}
              endTime={commentEndTime}
              framerate={project.framerate}
              userName={userName}
              onSubmit={handleAddComment}
              onCancel={() => {
                setShowCommentForm(false);
                setCommentEndTime(undefined);
                setIsRangeMode(false);
              }}
            />
          </div>
        )}

        {/* Share Success Modal */}
        {showShareModal && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Ссылка скопирована!
          </div>
        )}
      </div>
    </>
  );
}
