import { Download, FileText, MoreVertical, Share2, Star, Trash2 } from 'lucide-react';
export function FileCard({ file, onShare, onDelete }) {
  return <article className="file-card glass-panel">
    <div className="file-icon"><FileText size={28} /></div>
    <div className="file-meta"><h3>{file.name}</h3><p>{file.mimeType} • {formatBytes(file.size)}</p><div>{file.tags?.slice(0, 3).map((t) => <span className="tag" key={t}>{t}</span>)}</div></div>
    <div className="file-actions"><button className="icon-button" aria-label="Favorite"><Star size={17} /></button><a className="icon-button" aria-label="Download" href={`/api/files/${file._id}/download`}><Download size={17} /></a><button className="icon-button" aria-label="Share" onClick={() => onShare(file)}><Share2 size={17} /></button><button className="icon-button danger" aria-label="Delete" onClick={() => onDelete(file._id)}><Trash2 size={17} /></button><button className="icon-button" aria-label="More"><MoreVertical size={17} /></button></div>
  </article>;
}
function formatBytes(bytes = 0) { if (!bytes) return '0 B'; const units = ['B','KB','MB','GB']; const i = Math.floor(Math.log(bytes) / Math.log(1024)); return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`; }
