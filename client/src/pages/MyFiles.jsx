import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid2X2, List, Plus } from 'lucide-react';
import { deleteFile, fetchFiles, setView, uploadFiles } from '../store/slices/fileSlice.js';
import { createShare } from '../store/slices/shareSlice.js';
import { FileCard } from '../components/files/FileCard.jsx';
import { UploadDropzone } from '../components/files/UploadDropzone.jsx';
import { Modal } from '../components/ui/Modal.jsx';

export function MyFiles() {
  const dispatch = useDispatch();
  const { items, view, progress, error } = useSelector((s) => s.files);
  const latest = useSelector((s) => s.sharing.latest);
  const [shareFile, setShareFile] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { dispatch(fetchFiles()); }, [dispatch]);
  function onDrop(files) { dispatch(uploadFiles({ files })); }
  async function share(e) {
    e.preventDefault();
    setCopied(false);
    await dispatch(createShare({ fileId: shareFile._id, permission: e.currentTarget.permission.value, expiresAt: e.currentTarget.expiresAt.value || undefined, password: e.currentTarget.password.value || undefined })).unwrap();
  }
  async function copyLink() { if (!latest?.url) return; await navigator.clipboard.writeText(latest.url); setCopied(true); }
  return <div className="page-stack"><div className="page-heading"><div><h2>My Files</h2><p>Upload, preview, share, and manage encrypted files.</p></div><div className="segmented"><button onClick={() => dispatch(setView('grid'))} className={view === 'grid' ? 'active' : ''}><Grid2X2 size={16} /></button><button onClick={() => dispatch(setView('list'))} className={view === 'list' ? 'active' : ''}><List size={16} /></button></div></div>
    <UploadDropzone onFiles={onDrop} progress={progress} />{error && <div className="form-error">{error}</div>}
    <div className={`files ${view}`}>{items.map((file) => <FileCard key={file._id} file={file} onShare={(f) => { setShareFile(f); setCopied(false); }} onDelete={(id) => dispatch(deleteFile(id))} />)}</div>
    {items.length === 0 && <div className="empty glass-panel"><Plus size={30} /><strong>No files yet</strong><span>Drop your first document above to encrypt and save it.</span></div>}
    {shareFile && <Modal title={`Share ${shareFile.name}`} onClose={() => setShareFile(null)}><form className="share-form" onSubmit={share}><select name="permission"><option value="view">View only</option><option value="download">Download</option><option value="edit">Edit</option><option value="admin">Admin</option></select><input name="expiresAt" type="datetime-local" /><input name="password" placeholder="Optional share password" /><button className="button primary">Create signed link</button>{latest?.url && <div className="share-result"><input readOnly value={latest.url} /><button type="button" className="button ghost" onClick={copyLink}>{copied ? 'Copied' : 'Copy link'}</button><a className="button ghost" href={latest.url} target="_blank" rel="noreferrer">Open</a></div>}</form></Modal>}
  </div>;
}