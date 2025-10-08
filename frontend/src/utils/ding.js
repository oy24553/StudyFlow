export function ding(times = 1) {
  if (!('AudioContext' in window)) return;
  const ctx = new AudioContext();
  let when = ctx.currentTime;
  for (let i = 0; i < times; i++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.3, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start(when);
    o.stop(when + 0.26);
    when += 0.32;
  }
}
