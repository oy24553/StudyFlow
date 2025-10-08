let host;
export function showToast(text) {
  host ||= document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toasts' }));
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  host.appendChild(el);
  setTimeout(()=> el.classList.add('in'), 10);
  setTimeout(()=> { el.classList.remove('in'); setTimeout(()=> el.remove(), 300); }, 2200);
}
