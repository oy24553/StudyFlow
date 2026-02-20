export async function notify(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    try {
      await Notification.requestPermission();
    } catch {
      // noop (permission prompt can fail in some browsers)
    }
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
