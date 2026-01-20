import { Project } from '@/types';

export function generateResolveXML(project: Project): string {
  const markers = project.comments.map(comment => {
    const color = comment.status === 'resolved' ? 'green' : 'red';
    return `    <marker>
      <comment>${escapeXml(comment.text)}</comment>
      <in>${comment.frameNumber}</in>
      <out>${comment.frameNumber + 1}</out>
      <n>SmoTree - ${escapeXml(comment.author)}</n>
      <color>${color}</color>
    </marker>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="5">
  <sequence>
    <n>${escapeXml(project.name)}</n>
    <rate>
      <timebase>${project.framerate}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <track>
          <clipitem>
            <n>${escapeXml(project.fileName)}</n>
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
