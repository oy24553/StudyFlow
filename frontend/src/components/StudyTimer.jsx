import { useEffect, useRef, useState } from 'react';
import client from '../api/client';
import CoursePicker from './CoursePicker';
import { notify } from '../utils/notify';
import { ding } from '../utils/ding';
import { showToast } from '../components/Toast';



export default function StudyTimer() {
  // Shared
  const [courseId, setCourseId] = useState(localStorage.getItem('lastCourseId') || '');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('normal'); // 'normal' | 'pomodoro'
  const onCourseChange = (id) => { setCourseId(id || ''); localStorage.setItem('lastCourseId', id || ''); };

  // Standard timer
  const [running, setRunning] = useState(false);
  const startRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  // Pomodoro
  const [pRunning, setPRunning] = useState(false);
  const [phase, setPhase] = useState('focus'); // 'focus'|'break'|'long'
  const [round, setRound] = useState(0);       // number of completed focus rounds
  const [remain, setRemain] = useState(25 * 60); // remaining seconds in current phase
  const pStartRef = useRef(null);

  // Config (you can change defaults)
  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [longEvery, setLongEvery] = useState(4);

  // ===== Standard timer =====
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
      notify('Study logged', 'This session has been saved');
      ding(2);
      const mins = Math.round((new Date() - startRef.current) / 60000);
      showToast(`Logged ${mins} minutes${courseId ? ' · course linked' : ''}`);
    } catch (e) { console.error(e); alert('Save failed'); }
  };

  // ===== Pomodoro timer =====
  useEffect(() => {
    if (!pRunning) return;
    const id = setInterval(() => setRemain(r => r > 0 ? r - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [pRunning]);

  // Phase end: switch phase & record focus segment
  useEffect(() => {
    if (!pRunning || remain > 0) return;
    if (phase === 'focus') {
      // Save one focus segment
      const startAt = pStartRef.current.toISOString();
      const endAt = new Date().toISOString();
      client.post('/study-sessions', {
        startAt, endAt, method: 'pomodoro', courseId: courseId || null, notes: notes.trim() || ''
      }).then(() => {
        window.dispatchEvent(new Event('study-updated'));
        notify('Focus completed 🎯', 'Take a break and prepare for the next round');
        ding(3);
        // if (confetti) confetti({ particleCount: 70, spread: 60, origin: { y: .2 } });
      }).catch(console.error);

      const newRound = round + 1;
      setRound(newRound);

      // Enter break or long break
      if (newRound % longEvery === 0) {
        setPhase('long'); setRemain(longBreakMins * 60);
      } else {
        setPhase('break'); setRemain(breakMins * 60);
      }
      pStartRef.current = new Date();
    } else {
      notify('Break over ⏰', 'Start the next focus session');
      ding(1);
      // Break finished -> next focus segment
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
    setRemain(0); // trigger the phase switch logic above
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
      {/* Course / Notes */}
      <div className="hstack" style={{ gap: 12, flexWrap: 'wrap' }}>
        <label className="vstack" style={{ minWidth: 240 }}>
          <span className="label">Course</span>
          <CoursePicker value={courseId} onChange={onCourseChange} allowNone />
        </label>
        <label className="vstack">
          <span className="label">Mode</span>
          <select className="input" value={mode} onChange={e => setMode(e.target.value)}>
            <option value="normal">Standard timer</option>
            <option value="pomodoro">Pomodoro</option>
          </select>
        </label>
        <label className="vstack" style={{ flex: 1, minWidth: 240 }}>
          <span className="label">Notes</span>
          <input className="input" placeholder="Study notes / reflections (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
      </div>

      {/* Pomodoro config */}
      {mode === 'pomodoro' && (
        <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
          <label className="hstack" style={{ gap: 6 }}><span className="label">Focus</span>
            <input className="input" style={{ width: 80 }} type="number" min="1" value={focusMins} onChange={e => setFocusMins(+e.target.value || 25)} /> min
          </label>
          <label className="hstack" style={{ gap: 6 }}><span className="label">Break</span>
            <input className="input" style={{ width: 80 }} type="number" min="1" value={breakMins} onChange={e => setBreakMins(+e.target.value || 5)} /> min
          </label>
          <label className="hstack" style={{ gap: 6 }}><span className="label">Long break</span>
            <input className="input" style={{ width: 80 }} type="number" min="1" value={longBreakMins} onChange={e => setLongBreakMins(+e.target.value || 15)} /> min
          </label>
          <label className="hstack" style={{ gap: 6 }}><span className="label">Long break every</span>
            <input className="input" style={{ width: 60 }} type="number" min="1" value={longEvery} onChange={e => setLongEvery(+e.target.value || 4)} />
            <span className="label">rounds</span>
          </label>
        </div>
      )}

      {/* Timer display */}
      {mode === 'normal' ? (
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div className="vstack"><span className="label">Study timer</span><div className="timer">{mm}:{ss}</div></div>
          {!running
            ? <button className="btn btn-primary" onClick={startNormal}>Start study</button>
            : <button className="btn btn-primary" onClick={stopNormal}>Stop and save</button>}
        </div>
      ) : (
        <div className="hstack" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="hstack" style={{ gap: 16, alignItems: 'center' }}>
            <div className="ring" style={{ '--pct': `${pct}%` }}><div className="ring-num">{rMM}:{rSS}</div></div>
            <div className="vstack">
              <div className="label">Current phase</div>
              <div style={{ fontWeight: 700 }}>{phase === 'focus' ? 'Focus' : phase === 'break' ? 'Break' : 'Long break'}</div>
              <div className="label">Pomodoros completed: {round}</div>
            </div>
          </div>
          <div className="hstack" style={{ gap: 8 }}>
            {!pRunning
              ? <button className="btn btn-primary" onClick={startPomodoro}>Start Pomodoro</button>
              : <>
                <button className="btn" onClick={skipPomodoro}>Skip current</button>
                <button className="btn btn-danger" onClick={stopPomodoro}>Stop</button>
              </>
            }
          </div>
        </div>
      )}
    </div>
  );
}
