import { useState } from 'react';
import client from '../api/client';

export default function WorkoutEditor() {
    const [workoutId, setWorkoutId] = useState(null);
    const [focus, setFocus] = useState('other');     // push/pull/legs/upper/lower/full/other
    const [name, setName] = useState('Bench Press'); // 动作名
    const [bodyPart, setBodyPart] = useState('chest');
    const [rows, setRows] = useState([{ reps: 8, weightKg: 40, rpe: 7.5 }]);
    const [saving, setSaving] = useState(false);

    const addRow = () => setRows(r => [...r, { ...r[r.length - 1] }]);
    const updateRow = (i, k, v) =>
        setRows(r => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
    const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

    const ensureWorkout = async () => {
        if (workoutId) return workoutId;
        // 创建一次 Workout（日期默认当前）
        const { data } = await client.post('/workouts', {
            date: new Date().toISOString(),
            focus,
            notes: ''
        });
        const wid = data?.data?._id || data?.data?.id; // 兼容 _id/id
        setWorkoutId(wid);
        return wid;
    };

    const saveThisExercise = async () => {
        if (!name.trim()) return alert('请输入动作名称');
        if (!rows.length) return alert('请至少填写一组');

        setSaving(true);
        try {
            const wid = await ensureWorkout();
            await client.post(`/workouts/${wid}/exercises`, {
                name,
                bodyPart,
                sets: rows
            });
            alert('已保存本动作到当前训练');
            // 保存成功后，默认再添加一个空动作让你继续录
            setName(''); setBodyPart(''); setRows([{ reps: 8, weightKg: 20, rpe: 7 }]);
        } catch (e) {
            console.error(e);
            alert('保存失败，请检查后端路由是否就绪');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card">
            <div className="vstack">
                <div className="hstack" style={{ justifyContent: 'space-between' }}>
                    <div className="hstack" style={{ gap: 8 }}>
                        <label className="hstack" style={{ gap: 6 }}>
                            <span className="label">训练类型</span>
                            <select className="input" value={focus} onChange={e => setFocus(e.target.value)}>
                                <option value="push">push</option>
                                <option value="pull">pull</option>
                                <option value="legs">legs</option>
                                <option value="upper">upper</option>
                                <option value="lower">lower</option>
                                <option value="full">full</option>
                                <option value="other">other</option>
                            </select>
                        </label>
                        <label className="hstack" style={{ gap: 6 }}>
                            <span className="label">动作</span>
                            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="动作名，如 Bench Press" />
                        </label>
                        <label className="hstack" style={{ gap: 6 }}>
                            <span className="label">部位</span>
                            <input className="input" value={bodyPart} onChange={e => setBodyPart(e.target.value)} placeholder="chest/back/legs..." />
                        </label>
                    </div>

                    <div className="hstack" style={{ gap: 8 }}>
                        <button className="btn" onClick={addRow}>复制上一组</button>
                        <button className="btn" onClick={saveThisExercise} disabled={saving}>
                            {saving ? '保存中…' : '保存本动作'}
                        </button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr><th>组</th><th>次数</th><th>重量(kg)</th><th>RPE</th><th></th></tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>
                                    <input className="input" type="number" value={r.reps}
                                        onChange={e => updateRow(i, 'reps', +e.target.value)} />
                                </td>
                                <td>
                                    <input className="input" type="number" value={r.weightKg}
                                        onChange={e => updateRow(i, 'weightKg', +e.target.value)} />
                                </td>
                                <td>
                                    <input className="input" type="number" step="0.5" value={r.rpe}
                                        onChange={e => updateRow(i, 'rpe', +e.target.value)} />
                                </td>
                                <td><button className="btn" onClick={() => removeRow(i)}>删</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="label">
                    {workoutId ? `当前训练ID：${workoutId}` : '保存第一个动作时会自动创建训练'}
                </div>
            </div>
        </div>
    );
}
