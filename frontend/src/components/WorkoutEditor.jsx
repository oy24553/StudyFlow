import { useState } from 'react';
import client from '../api/client';

const TEMPLATES = {
  push: [
    { name:'Bench Press', bodyPart:'chest', sets:[{reps:8,weightKg:40,rpe:7},{reps:8,weightKg:40,rpe:7},{reps:8,weightKg:40,rpe:7}] },
    { name:'Overhead Press', bodyPart:'shoulders', sets:[{reps:8,weightKg:25,rpe:7},{reps:8,weightKg:25,rpe:7}] },
    { name:'Triceps Pushdown', bodyPart:'arms', sets:[{reps:12,weightKg:15,rpe:7},{reps:12,weightKg:15,rpe:7}] },
  ],
  pull: [
    { name:'Barbell Row', bodyPart:'back', sets:[{reps:8,weightKg:50,rpe:7},{reps:8,weightKg:50,rpe:7},{reps:8,weightKg:50,rpe:7}] },
    { name:'Lat Pulldown', bodyPart:'back', sets:[{reps:10,weightKg:40,rpe:7},{reps:10,weightKg:40,rpe:7}] },
    { name:'Biceps Curl', bodyPart:'arms', sets:[{reps:12,weightKg:12,rpe:7},{reps:12,weightKg:12,rpe:7}] },
  ],
  legs: [
    { name:'Back Squat', bodyPart:'legs', sets:[{reps:5,weightKg:60,rpe:7},{reps:5,weightKg:60,rpe:7},{reps:5,weightKg:60,rpe:7}] },
    { name:'Romanian Deadlift', bodyPart:'hamstrings', sets:[{reps:8,weightKg:50,rpe:7},{reps:8,weightKg:50,rpe:7}] },
    { name:'Leg Extension', bodyPart:'quads', sets:[{reps:12,weightKg:35,rpe:7},{reps:12,weightKg:35,rpe:7}] },
  ],
};

export default function WorkoutEditor(){
  const [workoutId, setWorkoutId] = useState(null);
  const [focus, setFocus] = useState('other');
  const [name, setName] = useState('Bench Press');
  const [bodyPart, setBodyPart] = useState('chest');
  const [rows, setRows] = useState([{ reps: 8, weightKg: 40, rpe: 7.5 }]);
  const [saving, setSaving] = useState(false);
  const addRow = () => setRows(r => [...r, { ...r[r.length-1] }]);
  const updateRow = (i, k, v) => setRows(r => r.map((row, idx) => idx===i? { ...row, [k]: v } : row));
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  const ensureWorkout = async () => {
    if (workoutId) return workoutId;
    const { data } = await client.post('/workouts', { date:new Date().toISOString(), focus, notes:'' });
    const wid = data?.data?._id || data?.data?.id; setWorkoutId(wid); return wid;
  };

  const saveThisExercise = async () => {
    if (!name.trim() || !rows.length) return alert('请完善动作与组数');
    setSaving(true);
    try {
      const wid = await ensureWorkout();
      await client.post(`/workouts/${wid}/exercises`, { name, bodyPart, sets: rows });
      alert('已保存本动作');
      // 清空动作，保留训练
      setName(''); setBodyPart(''); setRows([{ reps: 8, weightKg: 20, rpe: 7 }]);
    } catch (e) { console.error(e); alert('保存失败'); }
    finally { setSaving(false); }
  };

  const applyQuickTemplate = (key) => {
    if (!TEMPLATES[key]) return;
    setFocus(key);
    const first = TEMPLATES[key][0];
    setName(first.name);
    setBodyPart(first.bodyPart);
    setRows(first.sets);
  };

  const addAllFromTemplate = async (key) => {
    if (!TEMPLATES[key]) return;
    if (!confirm('将模板中的所有动作一次性保存到当前训练？')) return;
    const wid = await ensureWorkout();
    for (const ex of TEMPLATES[key]) {
      await client.post(`/workouts/${wid}/exercises`, ex);
    }
    alert('模板动作已加入当前训练');
  };

  return (
    <div className="card vstack">
      <div className="hstack" style={{justifyContent:'space-between', gap:8, flexWrap:'wrap'}}>
        <div className="hstack" style={{gap:8}}>
          <label className="hstack" style={{gap:6}}>
            <span className="label">训练类型</span>
            <select className="input" value={focus} onChange={e=>setFocus(e.target.value)}>
              <option value="push">push</option>
              <option value="pull">pull</option>
              <option value="legs">legs</option>
              <option value="upper">upper</option>
              <option value="lower">lower</option>
              <option value="full">full</option>
              <option value="other">other</option>
            </select>
          </label>
          <label className="hstack" style={{gap:6}}>
            <span className="label">快速模板</span>
            <select className="input" onChange={e=>applyQuickTemplate(e.target.value)} defaultValue="">
              <option value="" disabled>选择一个模板</option>
              <option value="push">Push（胸肩三头）</option>
              <option value="pull">Pull（背二头）</option>
              <option value="legs">Legs（腿/臀/腘绳）</option>
            </select>
          </label>
          <button className="btn" onClick={()=>addAllFromTemplate(focus)} disabled={!TEMPLATES[focus]}>一键加入模板动作</button>
        </div>
        <div className="label">{workoutId ? `训练ID：${workoutId}` : '保存时自动创建训练'}</div>
      </div>

      <div className="hstack" style={{gap:8, flexWrap:'wrap'}}>
        <label className="hstack" style={{gap:6}}><span className="label">动作</span>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="动作名" />
        </label>
        <label className="hstack" style={{gap:6}}><span className="label">部位</span>
          <input className="input" value={bodyPart} onChange={e=>setBodyPart(e.target.value)} placeholder="chest/back/legs..." />
        </label>
      </div>

      <table className="table">
        <thead><tr><th>组</th><th>次数</th><th>重量(kg)</th><th>RPE</th><th></th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td>{i+1}</td>
              <td><input className="input" type="number" value={r.reps} onChange={e=>updateRow(i,'reps',+e.target.value)} /></td>
              <td><input className="input" type="number" value={r.weightKg} onChange={e=>updateRow(i,'weightKg',+e.target.value)} /></td>
              <td><input className="input" type="number" step="0.5" value={r.rpe} onChange={e=>updateRow(i,'rpe',+e.target.value)} /></td>
              <td><button className="btn" onClick={()=>removeRow(i)}>删</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="hstack" style={{gap:8}}>
        <button className="btn" onClick={addRow}>复制上一组</button>
        <button className="btn" onClick={saveThisExercise} disabled={saving}>{saving?'保存中…':'保存本动作'}</button>
      </div>
    </div>
  );
}
