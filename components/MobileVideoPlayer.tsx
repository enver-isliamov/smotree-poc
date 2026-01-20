'use client';
import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { secondsToTimecode, secondsToFrame } from '@/lib/timecode';
import type { Comment } from '@/types';

interface MobileVideoPlayerProps {
  videoUrl: string;
  framerate: number;
  comments: Comment[];
  onTimeUpdate?: (time: number, frame: number) => void;
  onTimelineClick?: (time: number) => void;
  onPause?: () => void;
}

export default function MobileVideoPlayer({
  videoUrl,
  framerate,
  comments,
  onTimeUpdate,
  onTimelineClick,
  onPause,
}: MobileVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout>();

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
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

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
  }, [framerate, onTimeUpdate, onPause]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleVideoClick = () => {
    setShowControls(true);
    togglePlay();
  };

  const handleVideoTouch = (e: React.TouchEvent) => {
    setShowControls(true);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }

    onTimelineClick?.(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTimecode = secondsToTimecode(currentTime, framerate);
  const currentFrame = secondsToFrame(currentTime, framerate);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden touch-none select-none"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        playsInline
        onClick={handleVideoClick}
        onTouchStart={handleVideoTouch}
      />

      {/* Timecode Overlay - ALWAYS VISIBLE */}
      <div className="absolute top-4 right-4 bg-black/80 px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-white font-mono text-sm md:text-base font-semibold">
          {currentTimecode}
        </div>
        <div className="text-gray-400 text-xs text-center mt-0.5">
          Frame {currentFrame}
        </div>
      </div>

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Center Play/Pause */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 md:w-24 md:h-24 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
            >
              <Play className="w-10 h-10 md:w-12 md:h-12 text-black ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Timeline - LARGE for touch */}
          <div className="relative">
            <div
              onClick={handleTimelineClick}
              onTouchStart={handleTimelineClick}
              className="relative h-12 md:h-10 bg-white/20 rounded-full cursor-pointer backdrop-blur-sm group"
            >
              {/* Progress */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />

              {/* Comment Markers */}
              {comments.map((comment) => {
                const startPos = duration > 0 ? (comment.startTime / duration) * 100 : 0;
                const isRange = comment.endTime !== undefined;
                const endPos = isRange && duration > 0 ? (comment.endTime! / duration) * 100 : startPos;

                if (isRange) {
                  // Range marker - полоска
                  return (
                    <div
                      key={comment.id}
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-red-500/60 to-red-500/40 border-l-2 border-r-2 border-red-500"
                      style={{
                        left: `${startPos}%`,
                        width: `${endPos - startPos}%`,
                      }}
                      title={`${comment.author}: ${comment.text.substring(0, 50)}...`}
                    />
                  );
                } else {
                  // Point marker - кружок
                  return (
                    <div
                      key={comment.id}
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full ${
                        comment.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'
                      } border-2 border-white shadow-lg`}
                      style={{ left: `${startPos}%`, transform: 'translate(-50%, -50%)' }}
                      title={`${comment.author}: ${comment.text.substring(0, 50)}...`}
                    />
                  );
                }
              })}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 md:w-5 md:h-5" />
                ) : (
                  <Play className="w-6 h-6 md:w-5 md:h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 md:w-5 md:h-5" />
                ) : (
                  <Volume2 className="w-6 h-6 md:w-5 md:h-5" />
                )}
              </button>

              <div className="text-sm md:text-xs text-gray-300 font-mono ml-2">
                {framerate} FPS
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition"
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6 md:w-5 md:h-5" />
              ) : (
                <Maximize className="w-6 h-6 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
