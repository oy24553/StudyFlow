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

      // 只有在选择了具体课程时才带上 course 参数；“未分配”走前端过滤
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

  // 监听“学习已更新”（StudyTimer/StudyForm 成功保存后触发）→ 自动刷新
  useEffect(() => {
    const fn = () => load();
    window.addEventListener('study-updated', fn);
    return () => window.removeEventListener('study-updated', fn);
  }, []);

  const remove = async (id) => {
    if (!confirm('确定删除该会话？')) return;
    await deleteStudySession(id);
    window.dispatchEvent(new Event('study-updated')); // 让仪表盘/其他图表同步刷新
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
        { label: '开始', value: r => fmtDT(r.startAt) },
        { label: '结束', value: r => r.endAt ? fmtDT(r.endAt) : '' },
        { label: '课程', value: r => nameById.get(String(r.courseId)) || '未分配' },
        { label: '方式', value: r => r.method || '' },
        { label: '备注', value: r => r.notes || '' },
        { label: '时长(分钟)', value: r => Math.round(durationMins(r)) }
      ]
    );
  };

  return (
    <div className="vstack">
      {/* 快速添加 */}
      <div className="card">
        <div className="hstack" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="label">快速添加学习会话</div>
          <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
            <select className="input" value={range} onChange={e => setRange(e.target.value)}>
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
            </select>

            <select
              className="input"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
            >
              <option value="all">全部课程</option>
              {courses.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
              <option value="uncat">未分配</option>
            </select>

            <button className="btn" onClick={load} disabled={loading}>
              {loading ? '刷新中…' : '刷新'}
            </button>
            <button className="btn" onClick={onExport} disabled={!rows.length}>
              导出 CSV
            </button>
          </div>
        </div>

        <StudyForm />
      </div>

      {/* 列表 */}
      <div className="card">
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div className="label">
            学习会话列表（{rows.length} 条，合计 {fmtMins(totalMins)}）
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>开始</th>
              <th>结束</th>
              <th>课程</th>
              <th>方式</th>
              <th>备注</th>
              <th>时长</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s._id || s.id}>
                <td>{fmtDT(s.startAt)}</td>
                <td>{s.endAt ? fmtDT(s.endAt) : '-'}</td>
                <td>{nameById.get(String(s.courseId)) || '未分配'}</td>
                <td>{s.method || '-'}</td>
                <td>{s.notes || '-'}</td>
                <td>{fmtMins(durationMins(s))}</td>
                <td>
                  <button className="btn" onClick={() => remove(s._id || s.id)}>删除</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="7">暂无数据</td>
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
