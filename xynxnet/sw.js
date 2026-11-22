/* XYNXNET service worker - app shell passthrough with offline fallback */
self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(clients.claim())});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){return r}).catch(function(){return caches.match(e.request)}));
});

/* v3: web push */
self.addEventListener('push',function(e){
  var d={};
  try{d=e.data.json()}catch(_){try{d={body:e.data.text()}}catch(__){}}
  var title=d.title||'XYNXNET';
  var opts={
    body:d.body||'',
    icon:'https://yklwqghinvyhylsdrihp.supabase.co/storage/v1/object/public/media/1001/icon-192.png',
    badge:'https://yklwqghinvyhylsdrihp.supabase.co/storage/v1/object/public/media/1001/icon-192.png',
    tag:d.tag||('xy-'+(d.kind||'note')),
    renotify:!!d.renotify,
    data:{url:d.url||'./'}
  };
  e.waitUntil(self.registration.showNotification(title,opts));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var target=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){
      if(list[i].url.indexOf('xynxnet')>-1&&'focus' in list[i]){list[i].navigate(target);return list[i].focus()}
    }
    return clients.openWindow(target);
  }));
});
