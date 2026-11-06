// Admin panel service worker: push notifications only (no offline caching).
// Same handlers as ecom-store/public/push-sw.js, with the admin app's icon.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: event.data && event.data.text() }; }
  const title = data.title || 'New update';
  event.waitUntil(Promise.all([
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: data.icon || '/logo192.png',
      badge: '/logo192.png',
      tag: data.tag,          // a newer update for the same order replaces the older one
      renotify: Boolean(data.tag),
      data: { url: data.url || '/' }
    }),
    // Let open tabs refresh their bell straight away.
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => list.forEach(client => client.postMessage({ type: 'notifications:refresh' })))
  ]));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const open = list.find(c => new URL(c.url).origin === self.location.origin);
    if (open) return open.focus().then(c => c.navigate ? c.navigate(target) : c);
    return self.clients.openWindow(target);
  }));
});
