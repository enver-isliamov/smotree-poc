// types/index.ts
// Core data types for SmoTree

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  videoUrl?: string;
  videoFilename?: string;
  videoDuration?: number;
  videoFramerate?: number;
  videoResolution?: {
    width: number;
    height: number;
  };
}

export interface Comment {
  id: string;
  projectId: string;
  timecode: string;
  frameNumber: number;
  author: string;
  text: string;
  status: 'unresolved' | 'resolved' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For replies
}

export interface User {
  name: string;
  role: 'admin' | 'reviewer';
  joinedAt: string;
}

export interface ExportData {
  project: Project;
  comments: Comment[];
  format: 'xml' | 'edl' | 'csv';
}

// Video metadata extracted from file
export interface VideoMetadata {
  duration: number;
  framerate: number;
  width: number;
  height: number;
  codec?: string;
  bitrate?: number;
}

// Timeline state
export interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  framerate: number;
}
