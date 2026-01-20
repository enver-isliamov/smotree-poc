// Permissions system for SmoTree
import type { Project } from '@/types';

export interface UserPermissions {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canDeleteComments: boolean;
  canEditOwnComments: boolean;
  canAddComments: boolean;
  canArchiveProject: boolean;
}

export function getUserPermissions(
  project: Project,
  currentUserName: string
): UserPermissions {
  const isCreator = project.createdBy === currentUserName;

  return {
    // Создатель может всё
    canEditProject: isCreator,
    canDeleteProject: isCreator,
    canDeleteComments: isCreator,
    canArchiveProject: isCreator,
    
    // Все могут добавлять и редактировать свои комментарии
    canEditOwnComments: true,
    canAddComments: true,
  };
}

export function canEditComment(
  commentAuthor: string,
  currentUserName: string,
  isProjectCreator: boolean,
  commentStatus: 'open' | 'resolved'
): boolean {
  // Создатель может редактировать всегда
  if (isProjectCreator) return true;
  
  // Автор может редактировать свои открытые комментарии
  if (commentAuthor === currentUserName && commentStatus === 'open') {
    return true;
  }
  
  return false;
}

export function canDeleteComment(
  currentUserName: string,
  projectCreator: string
): boolean {
  return currentUserName === projectCreator;
}
