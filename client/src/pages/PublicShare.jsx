import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Eye, FileText, LockKeyhole } from 'lucide-react';
import { api } from '../lib/api.js';

export function PublicShare() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const previewUrlRef = useRef('');
  const [state, setState] = useState({ loading: true, data: null, error: null, busy: false });

  useEffect(() => {
    api.get(`/shares/public/${token}`)
      .then((res) => setState({ loading: false, data: res.data, error: null, busy: false }))
      .catch((error) => setState({ loading: false, data: null, error: error.response?.data?.message || 'Share unavailable', busy: false }));
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); };
  }, [token]);

  const file = state.data?.file;
  const canDownload = ['download', 'edit', 'admin'].includes(state.data?.permission);
  const canInlinePreview = useMemo(() => {
    const type = file?.mimeType || '';
    return type.startsWith('image/') || type === 'application/pdf' || type.startsWith('text/');
  }, [file]);

  async function fetchFile(action) {
    setState((s) => ({ ...s, error: null, busy: true }));
    try {
      const res = await api.post(`/shares/public/${token}`, { password, action }, { responseType: 'blob' });
      if (action === 'download') {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file?.originalName || file?.name || 'vaultshare-file';
        a.click();
        URL.revokeObjectURL(url);
      } else if ((file?.mimeType || '').startsWith('text/')) {
        setPreviewText(await res.data.text());
      } else {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const nextUrl = URL.createObjectURL(res.data);
        previewUrlRef.current = nextUrl;
        setPreviewUrl(nextUrl);
      }
      setState((s) => ({ ...s, busy: false }));
    } catch (error) {
      setState((s) => ({ ...s, busy: false, error: error.response?.data?.message || `${action === 'download' ? 'Download' : 'Preview'} failed` }));
    }
  }

  return <main className="auth-page"><section className="auth-card glass-panel public-share-card">
    <div className="brand"><span className="brand-mark"><LockKeyhole size={18} /></span><span>VaultShare</span></div>
    {state.loading && <p>Checking secure share...</p>}
    {state.error && <div className="form-error">{state.error}</div>}
    {file && <>
      <div className="file-icon large"><FileText size={36} /></div>
      <h1>{file.name}</h1>
      <p>{file.mimeType} - {Math.round((file.size || 0) / 1024)} KB</p>
      <p className="field-hint">Permission: {state.data.permission}. {canDownload ? 'This link allows download.' : 'This link is view-only, so download is blocked.'}</p>
      {state.data.requiresPassword && <p className="field-hint">The share owner protected this link with a password. Enter the password they gave you.</p>}
      <input placeholder={state.data.requiresPassword ? 'Share password from owner' : 'No password needed unless owner set one'} value={password} onChange={(e) => setPassword(e.target.value)} />
      {canInlinePreview ? <button className="button primary" onClick={() => fetchFile('preview')} disabled={state.busy}><Eye size={16} /> {state.busy ? 'Opening...' : 'View file'}</button> : <div className="empty compact"><strong>Preview not available</strong><span>This file type can be shared, but the browser cannot preview it inline.</span></div>}
      {canDownload && <button className="button ghost" onClick={() => fetchFile('download')} disabled={state.busy}><Download size={16} /> Download secure file</button>}
      {previewUrl && file.mimeType.startsWith('image/') && <img className="share-preview-image" src={previewUrl} alt={file.name} />}
      {previewUrl && file.mimeType === 'application/pdf' && <iframe className="share-preview-frame" src={previewUrl} title={file.name} />}
      {previewText && <pre className="share-preview-text">{previewText}</pre>}
    </>}
  </section></main>;
}