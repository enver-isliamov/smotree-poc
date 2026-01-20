export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  createdByRole: 'admin' | 'reviewer';
  videoUrl: string;
  videoType: 'local' | 'cloud';
  videoSize: number;
  fileName: string;
  duration: number;
  framerate: number;
  width: number;
  height: number;
  comments: Comment[];
  shareToken: string;
}

export interface Comment {
  id: string;
  author: string;
  authorRole?: 'admin' | 'reviewer';
  text: string;
  timecode: string;
  endTimecode?: string;
  frameNumber: number;
  startTime: number;
  endTime?: number;
  status: 'open' | 'resolved';
  createdAt: string;
  isVoiceInput?: boolean;
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
