import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics } from '../store/slices/analyticsSlice.js';
import { activityLabel, lastThreeDays } from '../lib/labels.js';

export function Analytics() {
  const dispatch = useDispatch();
  const { storage, activity } = useSelector((s) => s.analytics);
  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);
  const data = storage.map((s) => ({ name: s._id || 'unknown', bytes: Math.round((s.bytes || 0) / 1024 / 1024) })).filter((s) => s.bytes > 0);
  const visibleActivity = lastThreeDays(activity).filter((a) => !a.action?.startsWith('auth.login'));
  return <div className="page-stack"><div className="page-heading"><div><h2>Analytics</h2><p>Storage, sharing, and access activity from the last 3 days.</p></div></div>
    <section className="glass-panel panel">{data.length ? <ResponsiveContainer width="100%" height={320}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="bytes" fill="#14b8a6" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer> : <div className="empty"><strong>No analytics yet</strong><span>Upload files to generate storage analytics.</span></div>}</section>
    <section className="table glass-panel"><div className="table-row head"><span>Activity</span><span>IP</span><span>Time</span></div>{visibleActivity.map((a) => <div className="table-row" key={a._id}><span>{activityLabel(a.action)}</span><span>{a.ip || 'Private'}</span><span>{new Date(a.createdAt).toLocaleString()}</span></div>)}{!visibleActivity.length && <div className="empty-row"><strong>No recent logs</strong><p>Recent file and share activity will appear here.</p></div>}</section>
  </div>;
}