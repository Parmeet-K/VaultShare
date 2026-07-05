import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Download, Files, Share2 } from 'lucide-react';
import { fetchAnalytics } from '../store/slices/analyticsSlice.js';
import { MetricCard } from '../components/ui/MetricCard.jsx';
import { StorageChart } from '../components/charts/StorageChart.jsx';
import { activityLabel, lastThreeDays } from '../lib/labels.js';

export function Dashboard() {
  const dispatch = useDispatch();
  const { stats, activity, storage } = useSelector((s) => s.analytics);
  const recent = lastThreeDays(activity).filter((a) => !a.action?.startsWith('auth.login')).slice(0, 8);
  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);
  return <div className="page-grid">
    <section className="metrics-row">
      <MetricCard label="Encrypted files" value={stats.files || 0} detail="Protected files" icon={Files} />
      <MetricCard label="Active shares" value={stats.shares || 0} detail="Secure links" icon={Share2} />
      <MetricCard label="Downloads" value={stats.downloads || 0} detail="Allowed downloads" icon={Download} />
      <MetricCard label="Risk events" value={stats.riskEvents || 0} detail="Security alerts" icon={Activity} />
    </section>
    <section className="two-column">
      <article className="glass-panel panel"><h2>Storage analytics</h2><StorageChart data={storage} /></article>
      <article className="glass-panel panel"><h2>Recent activity</h2><p className="panel-subtitle">Last 3 days, newest first</p>{recent.length ? <div className="timeline">{recent.map((a) => <p key={a._id}><span />{activityLabel(a.action)}<small>{new Date(a.createdAt).toLocaleString()}</small></p>)}</div> : <div className="empty compact"><strong>No recent activity</strong><span>Upload or share a file to see activity here.</span></div>}</article>
    </section>
  </div>;
}