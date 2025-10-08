import { useEffect, useRef, useState } from 'react';
import client from '../api/client';
import CoursePicker from './CoursePicker';
import { notify } from '../utils/notify';
import { ding } from '../utils/ding';
import { showToast } from '../components/Toast';



export default function StudyTimer() {
  // 共用
  const [courseId, setCourseId] = useState(localStorage.getItem('lastCourseId') || '');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('normal'); // 'normal' | 'pomodoro'
  const onCourseChange = (id) => { setCourseId(id || ''); localStorage.setItem('lastCourseId', id || ''); };

  // 普通计时
  const [running, setRunning] = useState(false);
  const startRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  // 番茄
  const [pRunning, setPRunning] = useState(false);
  const [phase, setPhase] = useState('focus'); // 'focus'|'break'|'long'
  const [round, setRound] = useState(0);       // 已完成专注段数
  const [remain, setRemain] = useState(25 * 60); // 当前阶段剩余秒
  const pStartRef = useRef(null);

  // 配置（可改默认）
  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [longEvery, setLongEvery] = useState(4);

  // ===== 普通计时 =====
  useEffect(() => { let id; if (running) { id = setInterval(() => setSeconds(s => s + 1), 1000); } return () => clearInterval(id); }, [running]);
  const startNormal = () => { startRef.current = new Date(); setSeconds(0); setRunning(true); };
  const stopNormal = async () => {
    setRunning(false);
    const payload = {
      startAt: startRef.current.toISOString(),
      endAt: new Date().toISOString(),
      method: 'deep',
      notes: notes.trim() || '',
      courseId: courseId || null
    };
    try {
      await client.post('/study-sessions', payload);
      window.dispatchEvent(new Event('study-updated'));
      setNotes('');
      notify('已记录学习', '本次会话已保存');
      ding(2);
      const mins = Math.round((new Date() - startRef.current) / 60000);
      showToast(`已记录 ${mins} 分钟${courseId ? ' · 课程已关联' : ''}`);
    } catch (e) { console.error(e); alert('保存失败'); }
  };

  // ===== 番茄计时 =====
  useEffect(() => {
    if (!pRunning) return;
    const id = setInterval(() => setRemain(r => r > 0 ? r - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [pRunning]);

  // 阶段结束：切换阶段 & 写入专注段
  useEffect(() => {
    if (!pRunning || remain > 0) return;
    if (phase === 'focus') {
      // 保存一个专注段
      const startAt = pStartRef.current.toISOString();
      const endAt = new Date().toISOString();
      client.post('/study-sessions', {
        startAt, endAt, method: 'pomodoro', courseId: courseId || null, notes: notes.trim() || ''
      }).then(() => {
        window.dispatchEvent(new Event('study-updated'));
        notify('专注完成 🎯', '休息一下，准备下一段吧');
        ding(3);
        // if (confetti) confetti({ particleCount: 70, spread: 60, origin: { y: .2 } });
      }).catch(console.error);

      const newRound = round + 1;
      setRound(newRound);

      // 进入休息 or 长休
      if (newRound % longEvery === 0) {
        setPhase('long'); setRemain(longBreakMins * 60);
      } else {
        setPhase('break'); setRemain(breakMins * 60);
      }
      pStartRef.current = new Date();
    } else {
      notify('休息结束 ⏰', '进入下一段专注');
      ding(1);
      // 休息结束 -> 下一个专注段
      setPhase('focus');
      setRemain(focusMins * 60);
      pStartRef.current = new Date();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain, pRunning, phase]);

  const startPomodoro = () => {
    setRound(0);
    setPhase('focus');
    setRemain(focusMins * 60);
    pStartRef.current = new Date();
    setPRunning(true);
  };
  const stopPomodoro = () => { setPRunning(false); setRound(0); setPhase('focus'); setRemain(focusMins * 60); };
  const skipPomodoro = () => {
    if (!pRunning) return;
    setRemain(0); // 触发上面的阶段切换逻辑
  };

  // ===== UI =====
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const rMin = Math.floor(remain / 60), rSec = remain % 60;
  const rMM = String(rMin).padStart(2, '0'), rSS = String(rSec).padStart(2, '0');
  const totalPhase = (phase === 'focus' ? focusMins : phase === 'break' ? breakMins : longBreakMins) * 60;
  const pct = totalPhase ? Math.round((totalPhase - remain) / totalPhase * 100) : 0;

  return (
    <div className="card vstack" style={{ gap: 12 }}>
      {/* 课程/备注 */}
      <div className="hstack" style={{ gap: 12, flexWrap: 'wrap' }}>
        <label className="vstack" style={{ minWidth: 240 }}>
          <span className="label">课程</span>
          <CoursePicker value={courseId} onChange={onCourseChange} allowNone />
        </label>
        <label className="vstack">
          <span className="label">模式</span>
          <select className="input" value={mode} onChange={e => setMode(e.target.value)}>
            <option value="normal">普通计时</option>
            <option value="pomodoro">番茄计时</option>
          </select>
        </label>
        <label className="vstack" style={{ flex: 1, minWidth: 240 }}>
          <span className="label">备注</span>
          <input className="input" placeholder="学习要点 / 反思（可选）" value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
      </div>

      {/* 番茄配置 */}
      {mode === 'pomodoro' && (
        <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
          <label className="hstack" style={{ gap: 6 }}><span className="label">专注</span>
            <input className="input" style={{ width: 80 }} type="number" min="1" value={focusMins} onChange={e => setFocusMins(+e.target.value || 25)} /> 分
          </label>
          <label className="hstack" style={{ gap: 6 }}><span className="label">休息</span>
            <input className="input" style={{ width: 80 }} type="number" min="1" value={breakMins} onChange={e => setBreakMins(+e.target.value || 5)} /> 分
          </label>
          <label className="hstack" style={{ gap: 6 }}><span className="label">长休</span>
            <input className="input" style={{ width: 80 }} type="number" min="1" value={longBreakMins} onChange={e => setLongBreakMins(+e.target.value || 15)} /> 分
          </label>
          <label className="hstack" style={{ gap: 6 }}><span className="label">每</span>
            <input className="input" style={{ width: 60 }} type="number" min="1" value={longEvery} onChange={e => setLongEvery(+e.target.value || 4)} />
            <span className="label">轮长休</span>
          </label>
        </div>
      )}

      {/* 计时显示 */}
      {mode === 'normal' ? (
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div className="vstack"><span className="label">学习计时</span><div className="timer">{mm}:{ss}</div></div>
          {!running
            ? <button className="btn btn-primary" onClick={startNormal}>开始学习</button>
            : <button className="btn btn-primary" onClick={stopNormal}>结束并保存</button>}
        </div>
      ) : (
        <div className="hstack" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="hstack" style={{ gap: 16, alignItems: 'center' }}>
            <div className="ring" style={{ '--pct': `${pct}%` }}><div className="ring-num">{rMM}:{rSS}</div></div>
            <div className="vstack">
              <div className="label">当前阶段</div>
              <div style={{ fontWeight: 700 }}>{phase === 'focus' ? '专注' : phase === 'break' ? '休息' : '长休'}</div>
              <div className="label">已完成番茄：{round}</div>
            </div>
          </div>
          <div className="hstack" style={{ gap: 8 }}>
            {!pRunning
              ? <button className="btn btn-primary" onClick={startPomodoro}>开始番茄</button>
              : <>
                <button className="btn" onClick={skipPomodoro}>跳过当前</button>
                <button className="btn btn-danger" onClick={stopPomodoro}>停止</button>
              </>
            }
          </div>
        </div>
      )}
    </div>
  );
}
