export interface Project {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  videoType: 'youtube' | 'file' | 'url';
  framerate: number;
  duration: number;
  createdAt: string;
  createdBy: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  timecode: string;
  frameNumber: number;
  author: string;
  text: string;
  status: 'unresolved' | 'resolved' | 'in_progress';
  createdAt: string;
}
