import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (socket) return socket;

  socket = io(import.meta.env?.VITE_WS_URL || undefined, {
    autoConnect: false,
    transports: ['websocket'],
    auth: {
      token: localStorage.getItem('token') || '',
    },
  });

  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.error('socket connect_error', err?.message || err);
  });

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  s.auth = { token: localStorage.getItem('token') || '' };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}

