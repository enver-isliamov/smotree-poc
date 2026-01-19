// lib/xml-generator.ts
// Generate DaVinci Resolve compatible XML (FCPXML format)

import { Project, Comment } from '@/types';
import { js2xml } from 'xml-js';

interface XMLGeneratorOptions {
  includeResolved?: boolean;
  colorScheme?: {
    unresolved: string;
    resolved: string;
    in_progress: string;
  };
}

/**
 * Generate FCPXML for DaVinci Resolve import
 */
export function generateResolveXML(
  project: Project,
  comments: Comment[],
  options: XMLGeneratorOptions = {}
): string {
  const {
    includeResolved = true,
    colorScheme = {
      unresolved: 'red',
      resolved: 'green',
      in_progress: 'yellow'
    }
  } = options;

  // Filter comments based on options
  const filteredComments = comments.filter(comment => 
    includeResolved || comment.status !== 'resolved'
  );

  // Sort by frame number
  const sortedComments = [...filteredComments].sort((a, b) => 
    a.frameNumber - b.frameNumber
  );

  // Build markers array
  const markers = sortedComments.map(comment => ({
    comment: [comment.text],
    in: [comment.frameNumber],
    out: [comment.frameNumber + 1],
    name: [`SmoTree - ${comment.author}`],
    color: [colorScheme[comment.status]],
    metadata: [{
      smoTreeCommentId: [comment.id],
      smoTreeAuthor: [comment.author],
      smoTreeTimestamp: [comment.createdAt],
      smoTreeStatus: [comment.status],
      smoTreeParentId: comment.parentId ? [comment.parentId] : undefined
    }]
  }));

  // Build FCPXML structure
  const xmlObject = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    xmeml: {
      _attributes: {
        version: '5'
      },
      sequence: [{
        _attributes: {
          id: 'sequence-1'
        },
        name: [`SmoTree_Export_${project.name}`],
        rate: [{
          timebase: [project.videoFramerate || 25],
          ntsc: ['FALSE']
        }],
        timecode: [{
          rate: [{
            timebase: [project.videoFramerate || 25],
            ntsc: ['FALSE']
          }],
          string: ['00:00:00:00']
        }],
        media: [{
          video: [{
            track: [{
              clipitem: [{
                _attributes: {
                  id: 'clipitem-1'
                },
                name: [project.videoFilename || project.name],
                start: [0],
                end: [Math.floor((project.videoDuration || 0) * (project.videoFramerate || 25))],
                in: [0],
                out: [Math.floor((project.videoDuration || 0) * (project.videoFramerate || 25))],
                marker: markers.length > 0 ? markers : undefined
              }]
            }]
          }]
        }]
      }]
    }
  };

  // Convert to XML string
  const xml = js2xml(xmlObject, {
    compact: true,
    ignoreComment: true,
    spaces: 2
  });

  return xml;
}

/**
 * Generate EDL format (legacy, limited to ASCII)
 */
export function generateEDL(
  project: Project,
  comments: Comment[]
): string {
  const lines: string[] = [];
  
  lines.push(`TITLE: SmoTree Export - ${project.name}`);
  lines.push('FCM: NON-DROP FRAME');
  lines.push('');

  comments.forEach((comment, index) => {
    const eventNum = (index + 1).toString().padStart(3, '0');
    const timecode = comment.timecode;
    
    lines.push(`${eventNum}  AX       V     C        ${timecode} ${timecode} ${timecode} ${timecode}`);
    lines.push(`* FROM CLIP NAME: ${project.videoFilename || project.name}`);
    
    // Truncate comment to 255 chars for EDL
    const truncatedComment = comment.text.substring(0, 255);
    lines.push(`* COMMENT: ${comment.author} - ${truncatedComment}`);
    
    const color = comment.status === 'resolved' ? 'GREEN' : 
                  comment.status === 'in_progress' ? 'YELLOW' : 'RED';
    lines.push(`* MARKER: ${timecode} ${color}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Generate CSV format
 */
export function generateCSV(
  project: Project,
  comments: Comment[]
): string {
  const lines: string[] = [];
  
  // Header
  lines.push('CommentID;ParentID;Timecode;Author;Text;Status;CreatedAt');
  
  // Data rows
  comments.forEach(comment => {
    const row = [
      comment.id,
      comment.parentId || '',
      comment.timecode,
      comment.author,
      `"${comment.text.replace(/"/g, '""')}"`, // Escape quotes
      comment.status,
      comment.createdAt
    ].join(';');
    
    lines.push(row);
  });

  return lines.join('\n');
}

/**
 * Get export filename
 */
export function getExportFilename(
  project: Project,
  format: 'xml' | 'edl' | 'csv'
): string {
  const sanitized = project.name.replace(/[^a-z0-9]/gi, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `SmoTree_${sanitized}_${timestamp}.${format}`;
}
