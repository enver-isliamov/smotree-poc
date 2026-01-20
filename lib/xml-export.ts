// Simple XML generator without external dependencies
import { Project } from '@/types';

export function generateResolveXML(project: Project): string {
  const markers = project.comments.map(comment => {
    const color = comment.status === 'resolved' ? 'green' : 
                  comment.status === 'in_progress' ? 'yellow' : 'red';
    
    return `    <marker>
      <comment>${escapeXml(comment.text)}</comment>
      <in>${comment.frameNumber}</in>
      <out>${comment.frameNumber + 1}</out>
      <name>SmoTree - ${escapeXml(comment.author)}</name>
      <color>${color}</color>
    </marker>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="5">
  <sequence>
    <name>${escapeXml(project.name)}</name>
    <rate>
      <timebase>${project.framerate}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <timecode>
      <rate>
        <timebase>${project.framerate}</timebase>
        <ntsc>FALSE</ntsc>
      </rate>
      <string>00:00:00:00</string>
    </timecode>
    <media>
      <video>
        <track>
          <clipitem>
            <name>${escapeXml(project.name)}</name>
            <start>0</start>
            <end>${Math.floor(project.duration * project.framerate)}</end>
${markers}
          </clipitem>
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
