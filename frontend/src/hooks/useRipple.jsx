import { useEffect, useRef } from 'react';
export default function useRipple() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    function click(e) {
      const r = document.createElement('span');
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.className = 'ripple-effect';
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left - size / 2}px`;
      r.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }
    el.addEventListener('click', click);
    return () => el.removeEventListener('click', click);
  }, []);
  return ref;
}
