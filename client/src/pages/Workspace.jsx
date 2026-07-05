import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FolderKanban, Plus, Users } from 'lucide-react';
import { FileCard } from '../components/files/FileCard.jsx';
import { UploadDropzone } from '../components/files/UploadDropzone.jsx';
import { createWorkspace, fetchWorkspaces, setActiveWorkspace } from '../store/slices/workspaceSlice.js';
import { deleteFile, fetchFiles, uploadFiles } from '../store/slices/fileSlice.js';

export function Workspace() {
  const dispatch = useDispatch();
  const { teams, active } = useSelector((s) => s.workspace);
  const { items, progress } = useSelector((s) => s.files);
  const [name, setName] = useState('');
  const activeTeam = active || teams[0] || null;
  useEffect(() => { dispatch(fetchWorkspaces()); }, [dispatch]);
  useEffect(() => { if (activeTeam?._id) dispatch(fetchFiles({ workspace: activeTeam._id })); }, [dispatch, activeTeam?._id]);
  async function submit(e) { e.preventDefault(); if (!name.trim()) return; const result = await dispatch(createWorkspace({ name })).unwrap(); dispatch(setActiveWorkspace(result.team)); setName(''); }
  function onDrop(files) { if (activeTeam?._id) dispatch(uploadFiles({ files, workspace: activeTeam._id })); }
  return <div className="page-stack"><div className="page-heading"><div><h2>Workspace</h2><p>Select a workspace, upload files to it, and manage its encrypted files.</p></div></div>
    <form className="inline-form glass-panel" onSubmit={submit}><input placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} /><button className="button primary"><Users size={16} /> Create workspace</button></form>
    <div className="workspace-grid">{teams.map((team) => <button className={`workspace-card glass-panel workspace-button ${activeTeam?._id === team._id ? 'active' : ''}`} key={team._id} onClick={() => dispatch(setActiveWorkspace(team))}><FolderKanban /><h3>{team.name}</h3><p>{team.members?.length || 1} collaborator{(team.members?.length || 1) === 1 ? '' : 's'}</p><div className="progress"><i style={{ width: `${Math.min(100, Math.round(((team.storageUsed || 0) / (team.storageLimit || 1)) * 100))}%` }} /></div><span>{Math.round((team.storageLimit || 0) / 1024 / 1024 / 1024)} GB capacity</span></button>)}</div>
    {!teams.length && <div className="empty glass-panel"><Plus size={30} /><strong>No workspaces yet</strong><span>Create one above.</span></div>}
    {activeTeam && <section className="glass-panel panel"><h2>{activeTeam.name} files</h2><UploadDropzone onFiles={onDrop} progress={progress} /><div className="files grid workspace-files">{items.map((file) => <FileCard key={file._id} file={file} onShare={() => {}} onDelete={(id) => dispatch(deleteFile(id))} />)}</div>{!items.length && <div className="empty compact"><strong>No files in this workspace</strong><span>Drop files above to add them.</span></div>}</section>}
  </div>;
}