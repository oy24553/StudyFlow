import { useEffect, useMemo, useState } from 'react';
import { listStudySessions, deleteStudySession } from '../api/studySessions';
import { listCourses } from '../api/courses';
import { exportCsv } from '../utils/exportCsv';
import StudyForm from '../components/StudyForm';

export default function Study() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [range, setRange] = useState('7d');           // 7d | 30d
  const [filterCourse, setFilterCourse] = useState('all'); // all | courseId | uncat
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - (range === '30d' ? 30 : 7));

      // Only include course param when a specific course is selected; handle "Unassigned" via frontend filtering
      const params = { from: from.toISOString(), to: to.toISOString() };
      if (filterCourse !== 'all' && filterCourse !== 'uncat') params.course = filterCourse;

      const [sessions, cs] = await Promise.all([
        listStudySessions(params),
        listCourses()
      ]);

      let list = sessions;
      if (filterCourse === 'uncat') {
        list = sessions.filter(s => !s.courseId);
      }
      setRows(list);
      setCourses(cs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range, filterCourse]);

  // Listen for "study-updated" (emitted after StudyTimer/StudyForm saves) → auto refresh
  useEffect(() => {
    const fn = () => load();
    window.addEventListener('study-updated', fn);
    return () => window.removeEventListener('study-updated', fn);
  }, []);

  const remove = async (id) => {
    if (!confirm('Delete this session?')) return;
    await deleteStudySession(id);
    window.dispatchEvent(new Event('study-updated')); // Keep dashboard/other charts in sync
    load();
  };

  const nameById = useMemo(
    () => new Map(courses.map(c => [String(c._id || c.id), c.name])),
    [courses]
  );

  const totalMins = useMemo(
    () => rows.reduce((sum, r) => sum + durationMins(r), 0),
    [rows]
  );

  const onExport = () => {
    exportCsv(
      `study_${range}${filterCourse !== 'all' ? '_' + filterCourse : ''}.csv`,
      rows,
      [
        { label: 'Start', value: r => fmtDT(r.startAt) },
        { label: 'End', value: r => r.endAt ? fmtDT(r.endAt) : '' },
        { label: 'Course', value: r => nameById.get(String(r.courseId)) || 'Unassigned' },
        { label: 'Method', value: r => r.method || '' },
        { label: 'Notes', value: r => r.notes || '' },
        { label: 'Duration (min)', value: r => Math.round(durationMins(r)) }
      ]
    );
  };

  return (
    <div className="vstack">
      {/* Quick add */}
      <div className="card">
        <div className="hstack" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="label">Quickly add study session</div>
          <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
            <select className="input" value={range} onChange={e => setRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>

            <select
              className="input"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
            >
              <option value="all">All courses</option>
              {courses.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
              <option value="uncat">Unassigned</option>
            </select>

            <button className="btn" onClick={load} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button className="btn" onClick={onExport} disabled={!rows.length}>
              Export CSV
            </button>
          </div>
        </div>

        <StudyForm />
      </div>

      {/* List */}
      <div className="card">
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div className="label">Study sessions ({rows.length} items, total {fmtMins(totalMins)})</div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Course</th>
              <th>Method</th>
              <th>Notes</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s._id || s.id}>
                <td>{fmtDT(s.startAt)}</td>
                <td>{s.endAt ? fmtDT(s.endAt) : '-'}</td>
                <td>{nameById.get(String(s.courseId)) || 'Unassigned'}</td>
                <td>{s.method || '-'}</td>
                <td>{s.notes || '-'}</td>
                <td>{fmtMins(durationMins(s))}</td>
                <td>
                  <button className="btn" onClick={() => remove(s._id || s.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="7">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function fmtDT(dt) {
  return new Date(dt).toLocaleString();
}

function durationMins(r) {
  if (!r.endAt || !r.startAt) return 0;
  const ms = new Date(r.endAt) - new Date(r.startAt);
  return Math.max(0, ms / 60000);
}

function fmtMins(m) {
  const mm = Math.round(m);
  const h = Math.floor(mm / 60);
  const rest = mm % 60;
  return h ? `${h}h ${rest}m` : `${rest}m`;
}
