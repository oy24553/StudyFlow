import { useEffect, useState } from 'react';
import client from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';


export default function Chart7d() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const res = await client.get('/stats/study-7d');
                const rows = res.data.data.map(d => ({ day: d._id, mins: Math.round(d.total) }));
                setData(rows);
            } catch (e) { setErr('加载失败'); }
            finally { setLoading(false); }
        })();
    }, []);


    if (loading) return <div className="card">图表加载中…</div>;
    if (err) return <div className="card">{err}</div>;


    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="mins" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}