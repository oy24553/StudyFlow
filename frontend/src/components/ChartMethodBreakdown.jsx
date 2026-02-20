import { useEffect, useState } from 'react';
import { getMethodBreakdown } from '../api/stats';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const LABEL = {
  deep: 'Deep',
  pomodoro: 'Pomodoro',
  review: 'Review',
};

export default function ChartMethodBreakdown({ days = 30 }) {
  const [data, setData] = useState([]);

  const load = async () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const rows = await getMethodBreakdown({ from: from.toISOString(), to: to.toISOString() });
    setData(rows.map((r) => ({ method: LABEL[r.method] || r.method, mins: r.mins })));
  };

  useEffect(() => {
    load();
    const fn = () => load();
    window.addEventListener('study-updated', fn);
    return () => window.removeEventListener('study-updated', fn);
  }, [days]);

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="method" />
          <YAxis tickFormatter={minsFmt} />
          <Tooltip formatter={(v) => minsFmt(v)} />
          <Bar dataKey="mins" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function minsFmt(m) {
  const mm = Math.round(m || 0);
  const h = Math.floor(mm / 60);
  const rest = mm % 60;
  return h ? `${h}h ${rest}m` : `${rest}m`;
}

