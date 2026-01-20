'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, MessageSquare } from 'lucide-react';
import MobileVideoPlayer from '@/components/MobileVideoPlayer';
import VoiceCommentForm from '@/components/VoiceCommentForm';
import FloatingActionButton from '@/components/FloatingActionButton';
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
  const [commentStartTime, setCommentStartTime] = useState(0);
  const [commentEndTime, setCommentEndTime] = useState<number | undefined>();
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const p = storageManager.getProject(params.id as string);
    if (!p) {
      router.push('/');
    } else {
      setProject(p);
    }
  }, [params.id, router]);

  const handleAddComment = (text: string, isVoice: boolean) => {
    if (!project || !userName) return;

    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      author: userName,
      text: text,
      timecode: secondsToTimecode(commentStartTime, project.framerate),
      endTimecode: commentEndTime ? secondsToTimecode(commentEndTime, project.framerate) : undefined,
      frameNumber: secondsToFrame(commentStartTime, project.framerate),
      startTime: commentStartTime,
      endTime: commentEndTime,
      status: 'open' as const,
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

    // Broadcast
    const channel = new BroadcastChannel(`smotree_project_${project.id}`);
    channel.postMessage({ type: 'comment_added' });
    channel.close();
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

  const handleRangeModeToggle = () => {
    if (!isRangeMode) {
      setCommentStartTime(currentTime);
      setCommentEndTime(undefined);
    }
    setIsRangeMode(!isRangeMode);
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
    alert('Ссылка скопирована!');
  };

  if (!project) return <div className="p-8">Загрузка...</div>;

  return (
    <>
      <NamePrompt onComplete={setUserName} />
      
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-gray-400">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex gap-2">
              <button onClick={handleShare} className="btn-touch bg-gray-800 rounded-lg">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={handleExportXML} className="btn-touch bg-blue-600 rounded-lg">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
          {project.description && <p className="text-gray-400 mb-6 text-sm">{project.description}</p>}

          {/* Video Player */}
          <MobileVideoPlayer
            videoUrl={project.videoUrl}
            framerate={project.framerate}
            comments={project.comments}
            onTimeUpdate={(time, frame) => setCurrentTime(time)}
            onPause={() => setIsPaused(true)}
          />

          {/* Comments List */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Комментарии ({project.comments.length})
            </h3>
            {project.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">{comment.author}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {comment.endTimecode ? `${comment.timecode} → ${comment.endTimecode}` : comment.timecode}
                  </div>
                </div>
                <p className="text-sm text-gray-300">{comment.text}</p>
                {comment.isVoiceInput && (
                  <div className="mt-2 text-xs text-purple-400">🎤 Голосовой ввод</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAB */}
        {isPaused && userName && (
          <FloatingActionButton
            onClick={handleFABClick}
            onRangeMode={handleRangeModeToggle}
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
      </div>
    </>
  );
}
