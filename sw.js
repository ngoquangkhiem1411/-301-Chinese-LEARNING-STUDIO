/* 301 Chinese Studio V17 — offline cache for PWA deployment. */
const CACHE_NAME='chinese301-studio-v17-20261112';
const CORE=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('chinese301-studio-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).then(response=>{
     if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy)))}
     return response;
   }).catch(async()=> (await caches.match(req))||(await caches.match('./index.html'))||Response.error()));
 }else{
   event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
     if(response.ok&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)))}
     return response;
   })));
 }
});
