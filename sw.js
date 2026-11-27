const CACHE='treinoapp-4.0.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./supabase.min.js','./css/app.css','./js/catalogo.js','./js/midia.js','./js/app.js','./avaliacao.js','./modelos.js','./fonts/anton.woff2','./fonts/barlow-400.woff2','./fonts/barlow-600.woff2','./fonts/barlow-700.woff2','./fonts/barlow-condensed-700i.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('treinoapp-')||k.startsWith('treino-')||k.startsWith('treinov4-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  const nav=e.request.mode==='navigate';
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true})||(nav?await c.match('./index.html'):null);
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r});
    if(nav&&hit){ // rede primeiro (até 3 s) para pegar atualizações; senão usa o cache
      return Promise.race([net,new Promise((_,rej)=>setTimeout(rej,3000))]).catch(()=>hit);
    }
    return hit||net.catch(()=>hit);
  }));
});
