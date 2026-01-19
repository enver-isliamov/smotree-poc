// lib/storage.ts
import { Project, Comment } from '@/types';

const PROJECTS_KEY = 'smotree_projects';

export const storage = {
  // Get all projects
  getProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get single project
  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  },

  // Save project
  saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  // Delete project
  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  // Add comment
  addComment(projectId: string, comment: Comment): void {
    const project = this.getProject(projectId);
    if (!project) return;
    
    project.comments.push(comment);
    this.saveProject(project);
  },

  // Update comment
  updateComment(projectId: string, commentId: string, updates: Partial<Comment>): void {
    const project = this.getProject(projectId);
    if (!project) return;
    
    const commentIndex = project.comments.findIndex(c => c.id === commentId);
    if (commentIndex >= 0) {
      project.comments[commentIndex] = {
        ...project.comments[commentIndex],
        ...updates
      };
      this.saveProject(project);
    }
  },

  // Delete comment
  deleteComment(projectId: string, commentId: string): void {
    const project = this.getProject(projectId);
    if (!project) return;
    
    project.comments = project.comments.filter(c => c.id !== commentId);
    this.saveProject(project);
  },

  // Export all data
  exportData(): string {
    return JSON.stringify(this.getProjects(), null, 2);
  },

  // Import data
  importData(jsonString: string): void {
    try {
      const projects = JSON.parse(jsonString);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      throw new Error('Invalid JSON data');
    }
  },

  // Clear all
  clearAll(): void {
    localStorage.removeItem(PROJECTS_KEY);
  }
};
