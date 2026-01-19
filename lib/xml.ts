import { Project } from '@/types';

export function generateResolveXML(project: Project): string {
  const markers = project.comments.map(c => `    <marker>
      <comment>${escapeXml(c.text)}</comment>
      <in>${c.frameNumber}</in>
      <out>${c.frameNumber + 1}</out>
      <name>SmoTree - ${escapeXml(c.author)}</name>
      <color>${c.status === 'resolved' ? 'green' : c.status === 'in_progress' ? 'yellow' : 'red'}</color>
    </marker>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="5">
  <sequence>
    <name>SmoTree_${escapeXml(project.name)}</name>
    <rate><timebase>${project.framerate}</timebase></rate>
    <media>
      <video>
        <track>
          <clipitem>
            <name>${escapeXml(project.name)}</name>
${markers}
          </clipitem>
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;
}

function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c] || c));
}
