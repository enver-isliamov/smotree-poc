import { indexedDB } from './indexeddb';
import { Project } from '@/types';

const MAX_LOCAL_SIZE = 50 * 1024 * 1024; // 50MB

export const storageManager = {
  // Determine best storage based on file size
  shouldUseLocal(fileSize: number): boolean {
    return fileSize < MAX_LOCAL_SIZE;
  },

  // Save project (localStorage for metadata)
  saveProject(project: Project) {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem('smotree_projects', JSON.stringify(projects));
    
    // Also save to IndexedDB for backup
    indexedDB.saveProject(project);
  },

  getProject(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  },

  getAllProjects(): Project[] {
    const data = localStorage.getItem('smotree_projects');
    return data ? JSON.parse(data) : [];
  },

  deleteProject(id: string) {
    const projects = this.getAllProjects().filter(p => p.id !== id);
    localStorage.setItem('smotree_projects', JSON.stringify(projects));
    indexedDB.deleteProject(id);
  },

  // User session
  setUserName(name: string) {
    localStorage.setItem('smotree_user_name', name);
  },

  getUserName(): string | null {
    return localStorage.getItem('smotree_user_name');
  },

  // Generate share token
  generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15);
  },
};
