import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link2, QrCode, ShieldCheck, Trash2 } from 'lucide-react';
import { fetchShares, revokeShare } from '../store/slices/shareSlice.js';

export function SharedFiles() {
  const dispatch = useDispatch();
  const shares = useSelector((s) => s.sharing.items);
  useEffect(() => { dispatch(fetchShares()); }, [dispatch]);
  return <div className="page-stack"><div className="page-heading"><div><h2>Shared Files</h2><p>Manage signed links, expiry, passwords, permissions, and revocation.</p></div></div>
    <div className="table glass-panel"><div className="table-row shares-row head"><span>File</span><span>Permission</span><span>Status</span><span>Downloads</span><span>Action</span></div>{shares.map((share) => <div className="table-row shares-row" key={share._id}><span><Link2 size={16} /> {share.file?.name || 'Secure file'}</span><span>{share.permission}</span><span>{share.disabledAt ? 'Revoked' : 'Active'}</span><span>{share.downloads || 0}</span><span>{share.disabledAt ? 'Done' : <button className="icon-button danger" aria-label="Revoke share" onClick={() => dispatch(revokeShare(share._id))}><Trash2 size={16} /></button>}</span></div>)}{shares.length === 0 && <div className="empty-row"><QrCode /><strong>No shares yet</strong><p>Create a link from My Files.</p></div>}</div>
    <section className="security-strip glass-panel"><ShieldCheck /><span>Revoking a share immediately disables that public link.</span></section>
  </div>;
}