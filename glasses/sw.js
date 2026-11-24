const V='glass-v12';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon.svg','a-bg.js','a-neon.js','a-traffic.js','a-chill.js','a-library.js','a-v4.js','neon3d.js'])).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url),own=u.origin===location.origin;
 if(!own&&!u.hostname.includes('jsdelivr'))return;
 e.respondWith(caches.open(V).then(async c=>{
  const hit=await c.match(r);
  const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
  return own?(net.then(res=>res||hit)):(hit||net)
 }))
});
