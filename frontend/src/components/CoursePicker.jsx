import { useEffect, useState } from 'react';
import { listCourses, createCourse } from '../api/courses';

export default function CoursePicker({ value, onChange, allowNone=true }) {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [newName, setNewName] = useState('');

  const load = async () => {
    setLoading(true);
    const rows = await listCourses();
    setCourses(rows);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    const c = await createCourse({ name });
    setNewName('');
    await load();
    onChange?.(c._id || c.id);
  };

  return (
    <div className="hstack" style={{gap:8, flexWrap:'wrap'}}>
      <select className="input" value={value || ''} onChange={e=>onChange?.(e.target.value || null)} disabled={loading}>
        {allowNone && <option value="">No course</option>}
        {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
      </select>
      <input className="input" placeholder="New course name" value={newName} onChange={e=>setNewName(e.target.value)} />
      <button className="btn" onClick={add}>＋Create</button>
    </div>
  );
}
