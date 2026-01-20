'use client';
import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { secondsToTimecode, secondsToFrame } from '@/lib/timecode';
import type { Comment } from '@/types';

interface VideoPlayerProps {
  videoUrl: string;
  framerate: number;
  comments: Comment[];
  onTimeUpdate?: (time: number, frame: number) => void;
  onTimelineClick?: (time: number) => void;
}

export default function VideoPlayer({
  videoUrl,
  framerate,
  comments,
  onTimeUpdate,
  onTimelineClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const frame = secondsToFrame(video.currentTime, framerate);
      onTimeUpdate?.(video.currentTime, frame);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [framerate, onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
      video.pause();
      setIsPlaying(false);
    }

    onTimelineClick?.(newTime);
  };

  const handleMarkerClick = (comment: Comment) => {
    const video = videoRef.current;
    if (!video) return;
    
    const time = comment.timestamp;
    video.currentTime = time;
    video.pause();
    setIsPlaying(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTimecode = secondsToTimecode(currentTime, framerate);
  const durationTimecode = secondsToTimecode(duration, framerate);
  const currentFrame = secondsToFrame(currentTime, framerate);

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Video */}
      <div className="relative aspect-video bg-black group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onClick={togglePlay}
        />
        
        {/* Play overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition"
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-black ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Timeline */}
        <div className="relative">
          <div
            onClick={handleTimelineClick}
            className="timeline group"
          >
            <div className="timeline-progress" style={{ width: `${progress}%` }} />
            
            {/* Comment markers */}
            {comments.map((comment) => {
              const markerPos = duration > 0 ? (comment.timestamp / duration) * 100 : 0;
              return (
                <button
                  key={comment.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkerClick(comment);
                  }}
                  className={`timeline-marker ${comment.status}`}
                  style={{ left: `${markerPos}%` }}
                  title={`${comment.author}: ${comment.text.substring(0, 50)}...`}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-blue-400 transition">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button onClick={toggleMute} className="hover:text-blue-400 transition">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            <div className="font-mono text-gray-400">
              {currentTimecode} / {durationTimecode}
            </div>
            
            <div className="text-gray-500">
              Frame {currentFrame}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-gray-500">
              {framerate} FPS
            </div>
            
            <button onClick={toggleFullscreen} className="hover:text-blue-400 transition">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
