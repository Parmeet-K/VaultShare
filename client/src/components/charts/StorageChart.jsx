import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
const colors = ['#14b8a6', '#f59e0b', '#ef4444', '#6366f1', '#22c55e'];

export function StorageChart({ data = [] }) {
  const source = data.map((d) => ({ name: d._id || 'unknown', value: d.bytes || 0 })).filter((d) => d.value > 0);
  if (!source.length) return <div className="empty chart-empty"><strong>No storage data yet</strong><span>Upload files to see your storage breakdown.</span></div>;
  return <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={source} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92}>{source.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>;
}