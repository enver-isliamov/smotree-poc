export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  videoUrl: string;
  videoType: 'local' | 'cloud';
  videoSize: number;
  fileName: string;
  duration: number;
  framerate: number;
  width: number;
  height: number;
  comments: Comment[];
  shareToken?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timecode: string;
  frameNumber: number;
  timestamp: number;
  status: 'open' | 'resolved';
  createdAt: string;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface VideoMetadata {
  duration: number;
  framerate: number;
  width: number;
  height: number;
}

export interface UserSession {
  name: string;
  joinedAt: string;
}
