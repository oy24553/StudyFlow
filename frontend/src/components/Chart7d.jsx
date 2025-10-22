import { useEffect, useState } from 'react';
import client from '../api/client';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import Skeleton from './Skeleton';

export default function Chart7d() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const fetchData = async () => {
        try {
            setErr(null);
            setLoading(true);
            const res = await client.get('/stats/study-7d');
            const rows = (res.data?.data || []).map(d => ({
                day: d._id,                   // e.g., '2025-10-05'
                mins: Math.round(d.total || 0)
            }));
            setData(rows);
        } catch (e) {
            console.error(e);
            setErr('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const fn = () => fetchData();
        window.addEventListener('study-updated', fn);
        return () => window.removeEventListener('study-updated', fn);
    }, []);

    if (loading) return <div>Loading chart…</div>;
    if (err) return <div>{err}</div>;
    if (loading) return <div className="card"><Skeleton height={220} radius={12} /></div>;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={minsFmt} />
                    <Tooltip formatter={(v) => minsFmt(v)} labelFormatter={(l) => `Date: ${l}`} />
                    <Line type="monotone" dataKey="mins" isAnimationActive animationDuration={600} animationBegin={0} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function minsFmt(m) {
    const h = Math.floor((m || 0) / 60);
    const mm = Math.round((m || 0) % 60);
    return h ? `${h}h ${mm}m` : `${mm}m`;
}
