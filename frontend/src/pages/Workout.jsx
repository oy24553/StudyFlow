import { useEffect, useState } from 'react';
import WorkoutEditor from '../components/WorkoutEditor';
import { listWorkouts } from '../api/workouts';

export default function Workout() {
    const [rows, setRows] = useState([]);

    const load = async () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 14);
        const data = await listWorkouts({ from: from.toISOString(), to: to.toISOString() });
        setRows(data);
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="vstack">
            <WorkoutEditor />
            <div className="card">
                <div className="label">最近训练（14天）</div>
                <table className="table">
                    <thead><tr><th>日期</th><th>类型</th><th>备注</th></tr></thead>
                    <tbody>
                        {rows.map(w => (
                            <tr key={w._id || w.id}>
                                <td>{formatD(w.date)}</td>
                                <td>{w.focus}</td>
                                <td>{w.notes || '-'}</td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td colSpan="3">暂无训练记录</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatD(dt) {
    return new Date(dt).toLocaleDateString();
}
