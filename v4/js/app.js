const APP_VERSION='4.0.0-alpha.6';
/* ---------- tema (preferência do aparelho) ---------- */
const THEME_KEY='treino.theme';const MQ_DARK=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function themePref(){try{return localStorage.getItem(THEME_KEY)||'light'}catch(e){return'light'}}
function applyTheme(){const p=themePref(),t=p==='auto'?(MQ_DARK&&!MQ_DARK.matches?'light':'dark'):p;document.documentElement.dataset.theme=t;const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#f3f4f7':'#0e1014')}
applyTheme();if(MQ_DARK&&MQ_DARK.addEventListener)MQ_DARK.addEventListener('change',()=>{if(themePref()==='auto')applyTheme()});
const SB_URL='https://zmiupzagkipjyaabzihx.supabase.co',SB_KEY='sb_publishable_G8TxNzbpzE_llnFnk5cXQg_4tCRcPDe',MASTER_HISTORY=true;
const $=s=>document.querySelector(s);
let S=null,KEY=null,ME=null,SB=null,MANAGE=null,USERS=null,CUSTOM_CAT=[];
let CTX={lib:null,uid:''}; // biblioteca em edição (minha ou de outro usuário)

/* ---------- utils ---------- */
const clone=o=>JSON.parse(JSON.stringify(o));
const uid36=p=>(p||'')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function iso(d){const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)}
function pISO(s){const[y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function num(v){if(v==null)return null;v=String(v).replace(',','.').trim();if(v==='')return null;const n=parseFloat(v);return isNaN(n)?null:n}
function fkg(v){return v==null||v===''||isNaN(v)?'—':(Math.round(v*100)/100).toLocaleString('pt-BR')}
function fnum(v,d){return v==null||isNaN(v)?'—':(+v).toLocaleString('pt-BR',{maximumFractionDigits:d??1})}
function r2(v){return Math.round(v*100)/100}
function rstep(v,st){st=st||2.5;return r2(Math.round(v/st)*st)}
function range(s){const m=String(s||'').match(/(\d+)\D+(\d+)/);if(m)return[+m[1],+m[2]];const n=parseInt(s)||0;return[n,n]}
function e1rm(kg,r){return kg&&r?kg*(1+r/30):0}
function dshort(s){return pISO(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}
function dlong(s){return pISO(s).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}
function mmss(sec){sec=Math.max(0,Math.round(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0')}
function parseTime(t){if(t==null||t==='')return null;t=String(t).trim();if(/^\d+([.,]\d+)?$/.test(t))return Math.round(num(t)*60);const p=t.split(':').map(Number);if(p.some(isNaN))return null;return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+(p[1]||0)}
function pace(min,km){return min&&km?mmss(min*60/km)+'/km':'—'}
function isoToBR(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:''}
function brToISO(s){const m=String(s||'').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(!m)return null;const d=+m[1],mo=+m[2],y=+m[3];const t=new Date(y,mo-1,d);if(t.getFullYear()!==y||t.getMonth()!==mo-1||t.getDate()!==d)return null;return`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function maskDate(v){const d=String(v).replace(/\D/g,'').slice(0,8);return d.length>4?d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4):d.length>2?d.slice(0,2)+'/'+d.slice(2):d}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}

/* ---------- periodização ---------- */
const PHASE_COLORS=[['acu','Azul'],['int','Laranja'],['pk','Vermelho'],['dl','Verde'],['vio','Roxo'],['tea','Turquesa'],['yel','Amarelo']];
const MODES={inc:'Subir carga (× incremento/semana)',pct:'Subir % por semana',hold:'Manter carga',deload:'Deload (% do pico)'};
const PERIOD_TEMPLATES={
  hip12:{name:'Hipertrofia em blocos · 12 semanas',repeat:false,phases:[
    {name:'Acumulação',weeks:4,rir:'3–4',mode:'inc',step:1,hold:2,vol:1,color:'acu',focus:'Volume alto, técnica e progressão dupla'},
    {name:'Intensificação',weeks:4,rir:'1–2',mode:'inc',step:2,hold:0,vol:1,color:'int',focus:'Carga sobe mais rápido — PRs de repetição'},
    {name:'Peaking',weeks:3,rir:'0–1',mode:'inc',step:2,hold:0,vol:0.85,color:'pk',focus:'Cargas máximas nos compostos'},
    {name:'Deload',weeks:1,rir:'4–5',mode:'deload',step:60,hold:0,vol:0.5,color:'dl',focus:'Recuperação — metade das séries'}]},
  lin8:{name:'Linear · 8 semanas',repeat:false,phases:[
    {name:'Base',weeks:3,rir:'2–3',mode:'inc',step:1,hold:1,vol:1,color:'acu',focus:'Ajustar cargas e técnica'},
    {name:'Progressão',weeks:4,rir:'1–2',mode:'inc',step:1,hold:0,vol:1,color:'int',focus:'Subir carga toda semana'},
    {name:'Deload',weeks:1,rir:'4',mode:'deload',step:60,hold:0,vol:0.5,color:'dl',focus:'Recuperação'}]},
  ini4:{name:'Iniciante · 4 semanas',repeat:false,phases:[
    {name:'Adaptação',weeks:4,rir:'3',mode:'inc',step:1,hold:1,vol:1,color:'acu',focus:'Aprender os movimentos, sem chegar perto da falha'}]},
  for6:{name:'Força · 6 semanas',repeat:false,phases:[
    {name:'Volume',weeks:3,rir:'2',mode:'inc',step:1,hold:0,vol:1,color:'acu',focus:'Mais séries, carga moderada'},
    {name:'Intensidade',weeks:2,rir:'1',mode:'inc',step:2,hold:0,vol:0.8,color:'pk',focus:'Menos séries, carga alta'},
    {name:'Deload',weeks:1,rir:'4',mode:'deload',step:60,hold:0,vol:0.5,color:'dl',focus:'Recuperação'}]},
  ond9:{name:'Ondulatória (ondas) · 9 semanas',repeat:false,phases:[
    {name:'Onda 1',weeks:2,rir:'2',mode:'inc',step:1,hold:0,vol:1,color:'acu',focus:''},
    {name:'Recuo',weeks:1,rir:'3',mode:'pct',step:-5,hold:0,vol:0.8,color:'tea',focus:'Alivia um pouco antes da próxima onda'},
    {name:'Onda 2',weeks:2,rir:'1–2',mode:'inc',step:1.5,hold:0,vol:1,color:'int',focus:''},
    {name:'Recuo',weeks:1,rir:'3',mode:'pct',step:-5,hold:0,vol:0.8,color:'tea',focus:''},
    {name:'Onda 3',weeks:2,rir:'0–1',mode:'inc',step:2,hold:0,vol:1,color:'pk',focus:''},
    {name:'Deload',weeks:1,rir:'4',mode:'deload',step:60,hold:0,vol:0.5,color:'dl',focus:'Recuperação'}]},
  man4:{name:'Manutenção contínua · 4 semanas (repete)',repeat:true,phases:[
    {name:'Manutenção',weeks:4,rir:'2–3',mode:'hold',step:0,hold:0,vol:1,color:'tea',focus:'Manter força e massa, sem pressa'}]},
};
function weeksOf(p){return(p&&p.phases||[]).reduce((a,ph)=>a+(+ph.weeks||0),0)||1}
function phaseAt(p,w){let c=0;for(const ph of(p.phases||[])){c+=+ph.weeks||0;if(w<=c)return ph}return(p.phases||[])[p.phases.length-1]||{name:'—',rir:'—',vol:1,color:'acu',focus:''}}
function weekFocus(p,w){return(p.weekNotes&&p.weekNotes[w-1])||phaseAt(p,w).focus||''}
function genPlan(base,inc,p){const N=weeksOf(p);if(base==null)return Array(N).fill(null);let v=base,peak=base,w=0;const out=[];inc=inc||2.5;
  for(const ph of p.phases){for(let k=0;k<ph.weeks;k++){w++;
    if(ph.mode==='deload'){out.push(rstep(peak*(+ph.step||60)/100,inc));continue}
    if(w>1&&k>=(+ph.hold||0)){if(ph.mode==='inc')v+=inc*(+ph.step||0);else if(ph.mode==='pct')v=rstep(v*(1+(+ph.step||0)/100),inc)}
    v=Math.max(0,r2(v));out.push(v);peak=Math.max(peak,v)}}
  return out}
function fitPlans(p){const N=weeksOf(p);p.sessions.forEach(s=>s.exercises.forEach(e=>{if(!usesLoad(e))return;e.plan=e.plan||[];if(e.plan.length>N)e.plan.length=N;while(e.plan.length<N)e.plan.push(e.plan.length?e.plan[e.plan.length-1]:e.base??null)}));
  if(p.weekNotes){if(p.weekNotes.length>N)p.weekNotes.length=N}}
function recalcDeload(e,p){let w=0,peak=null;const N=weeksOf(p);for(const ph of p.phases)for(let k=0;k<ph.weeks;k++){w++;const v=e.plan[w-1];if(ph.mode!=='deload'&&v!=null)peak=Math.max(peak??0,v)}
  w=0;for(const ph of p.phases)for(let k=0;k<ph.weeks;k++){w++;if(ph.mode==='deload'&&peak!=null)e.plan[w-1]=rstep(peak*(+ph.step||60)/100,e.inc||2.5)}}
/* conjugados (bi-set/tri-set): item.link=true = executa junto com o PRÓXIMO, sem descanso entre eles */
function chainAt(list,i){const L=j=>!!(list[j]&&list[j].link&&j<list.length-1);let a=i;while(a>0&&L(a-1))a--;let b=i;while(L(b))b++;return{start:a,end:b,len:b-a+1,pos:i-a+1}}
function chainName(n){return n===2?'Bi-set':n===3?'Tri-set':'Circuito'}
function planEmpty(e){return !e.plan||e.plan.every(v=>v==null||v==='')}
function fillPlanFromLog(p,L){const out=[];if(!p||phaseAt(p,L.week).mode==='deload')return out;
  for(const x of L.exercises){if(x.kind!=='load')continue;const f=exIn(p,x.exId);if(!f)continue;const e=f.e;if(e.kind!=='load'||!planEmpty(e))continue;const top=topKg(x);if(!top)continue;
    const g=genPlan(top,e.inc,p),off=top-(g[L.week-1]??top);e.plan=g.map(v=>v==null?null:Math.max(0,r2(v+off)));e.base=e.plan[0];recalcDeload(e,p);out.push(e.name)}
  return out}
function shiftFuture(e,p,from,delta){const N=weeksOf(p);for(let w=Math.max(1,from);w<=N;w++){if(phaseAt(p,w).mode==='deload')continue;const v=e.plan[w-1];if(v!=null)e.plan[w-1]=Math.max(0,r2(v+delta))}recalcDeload(e,p)}

/* ---------- planos ---------- */
function usesLoad(e){return e.kind==='load'||e.kind==='bw'}
function newPlan(name,tplKey){const t=PERIOD_TEMPLATES[tplKey||'hip12'];return{id:uid36('p'),name:name||'Novo plano',created:Date.now(),repeat:!!t.repeat,phases:clone(t.phases),weekNotes:[],sessions:[],tips:[],nutrition:[]}}
function emptyLib(){return{v:3,plans:[],activeId:null}}
function LIB(){return CTX.lib||(S&&S.lib)||emptyLib()}
function planById(id,lib){return(lib||LIB()).plans.find(p=>p.id===id)||null}
function myActive(){const L=S&&S.lib;if(!L||!L.plans.length)return null;return L.plans.find(p=>p.id===L.activeId)||null}
function progOf(p){if(!S.prog[p.id])S.prog[p.id]={week:1};return S.prog[p.id]}
function curWeek(){const p=myActive();return p?progOf(p).week:1}
function clampW(w,p){return Math.min(weeksOf(p),Math.max(1,w))}
function setsFor(e,p,w){const v=+phaseAt(p,w).vol||1;return Math.max(1,Math.round((+e.sets||1)*v))}
function planFor(e,w){if(!e.plan||w<1)return null;const v=e.plan[w-1];return v==null||v===''?null:+v}
function sessIn(p,id){return p&&p.sessions.find(s=>s.id===id)}
function exIn(p,id){if(!p)return null;for(const s of p.sessions)for(const e of s.exercises)if(e.id===id)return{s,e};return null}
function findExAny(id){const p=myActive();return exIn(p,id)}
function defaultsFor(kind){switch(kind){
  case'bw':return{sets:3,reps:'8–12',rir:'RIR 2',rest:'90 s',restSec:90,inc:2.5};
  case'time':return{sets:3,reps:'30–45',rir:'',rest:'60 s',restSec:60,inc:2.5};
  case'cardio':return{sets:1,reps:'',rir:'',rest:'',restSec:0,cardio:{min:30,km:null,zone:'Zona 2'}};
  case'wod':return{sets:1,reps:'',rir:'',rest:'',restSec:0,wod:{format:'AMRAP',cap:12,desc:''}};
  default:return{sets:3,reps:'10–12',rir:'RIR 2',rest:'90 s',restSec:90,inc:2.5}}}
function makeItem(c,p){const d=defaultsFor(c.kind);const it=Object.assign({id:uid36('e'),cat:c.id,name:c.name,kind:c.kind,grp:c.grp||'',why:'',base:null},d);
  if(usesLoad(it))it.plan=Array(weeksOf(p)).fill(null);
  if(it.kind==='wod'){const n=c.name;if(/For Time|Fran|Grace|Helen|Murph|Karen|Diane|Annie|Isabel|Jackie|Chipper/i.test(n))it.wod.format='ForTime';if(/EMOM/.test(n))it.wod.format='EMOM';if(/RM|máxima/i.test(n))it.wod.format='MaxLoad';if(/Tabata/i.test(n)){it.wod.format='AMRAP';it.wod.cap=4}
    const m=n.match(/\((.*)\)/);if(m)it.wod.desc=m[1]}
  return it}

/* ---------- migração de formatos antigos (v1/v2 → v3) ---------- */
function isOldProgram(o){return o&&Array.isArray(o.sessions)&&Array.isArray(o.weeks)&&!o.plans}
function oldToPlan(o){const p={id:uid36('p'),name:o.name||'Meu programa',created:Date.now(),repeat:false,phases:[],weekNotes:(o.weeks||[]).map(w=>w.focus||''),sessions:[],tips:o.tips||[],nutrition:o.nutrition||[]};
  const names=(o.weeks||[]).map(w=>w.phase);const tpl=PERIOD_TEMPLATES.hip12;
  if(names.length===12&&names.join()==='Acumulação,Acumulação,Acumulação,Acumulação,Intensificação,Intensificação,Intensificação,Intensificação,Peaking,Peaking,Peaking,Deload')p.phases=clone(tpl.phases);
  else{let cur=null;(o.weeks||[]).forEach(w=>{if(!cur||cur.name!==w.phase){cur={name:w.phase||'Fase',weeks:0,rir:w.rir||'',mode:/deload/i.test(w.phase)?'deload':'inc',step:/deload/i.test(w.phase)?60:1,hold:0,vol:/deload/i.test(w.phase)?0.5:1,color:PHASE_COLORS[p.phases.length%PHASE_COLORS.length][0],focus:''};p.phases.push(cur)}cur.weeks++})}
  if(!p.phases.length)p.phases=clone(tpl.phases);
  p.sessions=(o.sessions||[]).map(s=>({id:s.id,name:s.name,groups:s.groups||'',duration:s.duration||'',notes:s.notes||'',cardio:s.cardio||'',exercises:(s.exercises||[]).map(e=>Object.assign({kind:'load',cat:null,grp:''},e))}));
  fitPlans(p);return p}
function libFrom(o){if(!o)return null;if(o.plans)return o;if(isOldProgram(o)){const p=oldToPlan(o);return{v:3,plans:[p],activeId:p.id}}return null}

/* ---------- estado local ---------- */
function freshSync(){return{progH:'',stateH:'',progEd:0,stateEd:0,progDirty:false,stateDirty:false,dirtyLogs:[],delLogs:[],lastPull:null,lastSync:null}}
function defaultState(){return{v:3,lib:emptyLib(),prog:{},settings:{sound:true,wake:true,warn5:true,autoPause:false,lastBackup:null,progEx:null},logs:[],active:null,_sync:freshSync()}}
function migrate(){const d=defaultState();
  if(S.program!==undefined||S.week!==undefined){ // estado v1/v2
    const lib=libFrom(S.program)||emptyLib();const p=lib.plans[0];S.lib=lib;S.prog={};if(p){S.prog[p.id]={week:S.week||1};(S.logs||[]).forEach(L=>{if(!L.planId){L.planId=p.id;L.planName=p.name}})}
    delete S.program;delete S.week;delete S.cycle;delete S.cycles}
  S.v=3;S.lib=S.lib||emptyLib();S.lib.plans=S.lib.plans||[];S.prog=S.prog||{};S.logs=S.logs||[];
  bodyOf(S);S.settings=Object.assign(d.settings,S.settings||{});S._sync=Object.assign(freshSync(),S._sync||{});
  if(S.lib.plans.length&&!planById(S.lib.activeId,S.lib))S.lib.activeId=S.lib.plans[0].id}
function activeKey(){return ME?'treino.active.'+ME.id:null}
function backupActive(){const k=activeKey();if(!k||!S)return;try{if(S.active)localStorage.setItem(k,JSON.stringify(S.active));else localStorage.removeItem(k)}catch(e){}}
function restoreActive(){const k=activeKey();if(!k||!S||S.active)return false;try{const b=JSON.parse(localStorage.getItem(k)||'null');if(b&&b.id&&!S.logs.some(L=>L.id===b.id)){S.active=b;return true}}catch(e){}return false}
function elapsedMs(A){return Math.max(0,(A.pausedAt||Date.now())-A.startedAt-(A.pausedMs||0))}
function load(){try{const r=localStorage.getItem(KEY);if(r){S=JSON.parse(r);migrate();if(restoreActive())dirty=true;return}}catch(e){console.warn(e)}S=defaultState();baseHashes();if(restoreActive())dirty=true}
let saveT,dirty=false;
function save(){dirty=true;backupActive();clearTimeout(saveT);saveT=setTimeout(saveNow,120)}
function saveNow(force){if(!KEY||!S||(!dirty&&!force))return;backupActive();try{detect();localStorage.setItem(KEY,JSON.stringify(S));dirty=false;syncSoon()}catch(e){toast('Erro ao salvar: '+e.message)}}
function commit(){dirty=true;saveNow()}
function reloadFromStorage(){if(!KEY||!S||dirty||S.active)return;try{const r=localStorage.getItem(KEY);if(r){S=JSON.parse(r);migrate();render()}}catch(e){}}
window.addEventListener('pagehide',()=>saveNow());
window.addEventListener('storage',e=>{if(e.key===KEY)reloadFromStorage()});
document.addEventListener('visibilitychange',()=>{const A=S&&S.active;
  if(document.hidden){if(A&&S.settings.autoPause&&!A.pausedAt){A.pausedAt=Date.now();A.autoPaused=true;dirty=true}saveNow()}
  else{if(A&&A.autoPaused&&A.pausedAt){A.pausedMs=(A.pausedMs||0)+(Date.now()-A.pausedAt);A.pausedAt=null;A.autoPaused=false;save()}reloadFromStorage();audio();wake();if(S)render()}});
const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent),STANDALONE=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;

/* ---------- registros ---------- */
function doneSets(x){return(x.sets||[]).filter(s=>s.done!==false&&(s.reps!=null||s.sec!=null))}
function topKg(x){const d=doneSets(x).filter(s=>s.kg!=null);return d.length?Math.max(...d.map(s=>s.kg||0)):null}
function logVolume(L){let v=0;L.exercises.forEach(x=>doneSets(x).forEach(s=>v+=(s.kg||0)*(s.reps||0)));return v}
function wodScore(w){if(!w)return'—';const rx=w.rx===false?' (adaptado)':w.rx?' Rx':'';
  switch(w.format){case'AMRAP':return`${w.rounds??0} rounds + ${w.reps??0} reps${rx}`;case'ForTime':return(w.capped?`Cap — ${w.reps??'?'} reps`:(w.time!=null?mmss(w.time):'—'))+rx;case'EMOM':return`${w.rounds??'—'} rounds concluídos${rx}`;case'MaxLoad':return`${fkg(w.kg)} kg${rx}`}return'—'}
function exSummary(x){if(x.kind==='cardio'&&x.cardio){const c=x.cardio;return[c.min!=null?fnum(c.min,0)+' min':null,c.km!=null?fnum(c.km,2)+' km':null,c.min&&c.km?pace(c.min,c.km):null,c.zone||null,c.kcal?c.kcal+' kcal':null].filter(Boolean).join(' · ')||'—'}
  if(x.kind==='wod')return wodScore(x.wod);
  if(x.kind==='time')return doneSets(x).map(s=>(s.kg?fkg(s.kg)+'kg ':'')+(s.sec??'?')+'s').join(' · ');
  return doneSets(x).map(s=>`${s.kg?fkg(s.kg):(x.kind==='bw'?'PC':'—')}×${s.reps}`).join(' · ')}
function exDone(x){return x.kind==='cardio'||x.kind==='wod'?!!x.done:(x.sets||[]).length>0&&x.sets.every(s=>s.done)}
function exHasData(x){return x.kind==='cardio'||x.kind==='wod'?!!x.done:doneSets(x).length>0}
function lastPerf(itemId,skipId){for(let i=S.logs.length-1;i>=0;i--){const L=S.logs[i];if(L.id===skipId)continue;const x=L.exercises.find(x=>x.exId===itemId);if(x&&exHasData(x))return{log:L,ex:x}}return null}
function doneThisWeek(p){const pr=progOf(p),w=pr.week,r=pr.round||1;return new Set(S.logs.filter(L=>L.planId===p.id&&L.week===w&&(L.round||1)===r).map(L=>L.sessionId))}
function nextSession(p){const d=doneThisWeek(p);return p.sessions.find(s=>!d.has(s.id))||null}
function sortLogs(){S.logs.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.startedAt||0)-(b.startedAt||0))}

/* ---------- sugestão de carga ---------- */
function suggest(ax,p,w){
  const f=exIn(p,ax.exId);if(!f)return null;const e=f.e;if(!usesLoad(e)||!exDone(ax))return null;const d=doneSets(ax);if(!d.length)return null;
  if(phaseAt(p,w).mode==='deload')return{type:'ok',msg:'Semana de deload: carga leve, foco em recuperação.'};
  const[lo,hi]=range(e.reps);const used=Math.max(...d.map(s=>s.kg||0));const pl=planFor(e,w),pn=planFor(e,w+1);const inc=e.inc||2.5;const N=weeksOf(p);
  if(e.kind==='bw'&&!used&&pl==null){if(d.every(s=>s.reps>=hi))return{type:'up',msg:`Topo da faixa (${hi} reps) em todas as séries. Na próxima: mais reps, mais lento, ou adicione lastro.`};return null}
  if(d.every(s=>s.reps>=hi)&&(pl==null||used>=pl)){
    if(pn==null||w>=N)return{type:'up',msg:`Topo da faixa (${hi} reps) em todas as séries. Na próxima, tente <b>${fkg(used+inc)} kg</b>.`};
    if(pn>=used+inc)return{type:'up',msg:`Topo da faixa (${hi} reps) em todas as séries. O plano já sobe para <b>${fkg(pn)} kg</b> na semana ${w+1}. 👍`};
    const delta=r2(used+inc-pn);return{type:'up',msg:`Topo da faixa (${hi} reps) em todas as séries — você está à frente do plano.`,act:{delta,from:w+1,label:`Subir plano: S${w+1} ${fkg(pn)} → ${fkg(pn+delta)} kg (e seguintes)`}}}
  if(d.some(s=>s.reps<lo)){
    if(pn!=null&&w<N&&pn>used){const delta=r2(used-pn);return{type:'down',msg:`Abaixo da faixa (${lo} reps) em alguma série. Melhor consolidar antes de subir.`,act:{delta,from:w+1,label:`Manter ${fkg(used)} kg na S${w+1} (ajusta as seguintes)`}}}
    return{type:'down',msg:`Abaixo da faixa (${lo} reps) em alguma série. Mantenha ${fkg(used)} kg até completar ${lo}+ reps em todas.`}}
  return{type:'ok',msg:`Dentro da faixa ${lo}–${hi}. Siga o plano${pn!=null&&w<N?` (S${w+1}: <b>${fkg(pn)} kg</b>)`:''} e busque mais reps.`}}
function allCatalog(){return CATALOG.concat(CUSTOM_CAT)}

/* ---------- ui helpers ---------- */
function hdr(t,sub,back,right){return`<div class="hd">${back?'<button class="bk" data-act="back" aria-label="Voltar">‹</button>':''}<div class="sp" style="min-width:0"><h1>${esc(t)}</h1>${sub?`<div class="mu sm">${sub}</div>`:''}</div>${right||''}</div>`}
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2800)}
function modal(title,body,btns){const m=$('#modal');m.innerHTML=`<div class="mbox"><h2>${title}</h2><div class="mbody">${body}</div><div class="mbtns">${btns.map((b,k)=>`<button class="btn ${b.cls||''}" data-mb="${k}">${b.label}</button>`).join('')}</div></div>`;m.hidden=false;
  m.onclick=ev=>{const k=ev.target.closest('[data-mb]');if(k){const b=btns[+k.dataset.mb];if(b.keep&&b.fn){b.fn();return}m.hidden=true;b.fn&&b.fn()}else if(ev.target===m)m.hidden=true}}
function confirmBox(title,body,ok,fn,danger){modal(title,body,[{label:'Cancelar'},{label:ok,cls:danger?'danger':'pri',fn}])}
function phPill(p,w){const ph=phaseAt(p,w);return`<span class="pill ph pc-${esc(ph.color||'acu')}">${esc(ph.name)}</span>`}
function weekbar(p,w){let k=0,h='';for(const ph of p.phases)for(let i=0;i<ph.weeks;i++){k++;h+=`<i class="pc-${esc(ph.color||'acu')} ${w&&k<w?'past':''} ${k===w?'cur':''}"></i>`}return`<div class="weekbar">${h}</div>`}
function diffTable(rows,cols){return`<table><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`}
function sel(name,opts,cur,attrs){return`<select ${attrs||''}>${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(v)===String(cur)?'selected':''}>${esc(l)}</option>`).join('')}</select>`}

/* ---------- router ---------- */
const V={tab:'hoje',stack:[]};
function go(view,params){V.stack.push({view,params:params||{}});render();scrollTo(0,0)}
function topV(){return V.stack[V.stack.length-1]}
function setCtx(){const t=topV(),u=t&&t.params&&t.params.uid;if(u==='__tpl'&&ME&&ME.role==='master'){tplPlans();CTX={lib:TPL.lib,uid:u,tpl:true};return}CTX=(u&&MANAGE&&MANAGE.uid===u)?{lib:MANAGE.lib,uid:u}:{lib:null,uid:''}}
function render(){const pv=window.AV&&AV.takeover();if(pv){$('#app').innerHTML=pv;return}if(ME&&SB&&ME.active!==false){try{bodyFromAv()}catch(e){}}document.body.classList.toggle('nologin',!ME);if(!ME){$('#app').innerHTML=viewLogin();return}if(ME.active===false){$('#app').innerHTML=viewDisabled();return}
  setCtx();const t=topV();let h;try{h=t?VIEWS[t.view](t.params):VIEWS[V.tab]()}catch(e){console.error(e);h=`<div class="card">Erro: ${esc(e.message)}</div>`}
  $('#app').innerHTML=h;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===V.tab))}
const VIEWS={},ACT={};
if(window.AV)AV.install({VIEWS,ACT});


/* ---------- mídia dos exercícios (v4) ---------- */
function _wkRefocus(i){const A=S.active;if(A&&A.focus===i&&A.exercises[i]&&exDone(A.exercises[i])){A.focus=null;save();render()}}
function midiaItem(e){if(!e||typeof MIDIA==='undefined')return null;let m=e.cat&&MIDIA[e.cat];if(!m){const c=CATALOG.find(x=>x.name===e.name);m=c&&MIDIA[c.id]}return m||null}
function midiaKey(e){if(e.cat&&typeof MIDIA!=='undefined'&&MIDIA[e.cat])return e.cat;const c=CATALOG.find(x=>x.name===e.name);return c?c.id:null}
function thumbHTML(e,sz){const k=midiaKey(e),u=k&&fotoDe(k,0);return u?`<img class="thumb" src="${u}" alt="" loading="lazy" style="width:${sz||48}px;height:${sz||48}px">`:''}
function midiaBlock(e){const m=midiaItem(e);if(!m)return'';const k=midiaKey(e);let h='';
  if(m.f){const n=Math.min(m.n||1,2);h+=`<div class="mfotos">${[0,1].slice(0,n).map(i=>`<figure><img src="${fotoDe(k,i)}" alt="${i?'Posição final':'Posição inicial'}" loading="lazy"><figcaption>${i?'2 · Fim':'1 · Início'}</figcaption></figure>`).join('')}</div>`}
  if((m.p&&m.p.length)||(m.s&&m.s.length))h+=`<div class="mmus">${(m.p||[]).map(x=>`<span class="chip on">${esc(x)}</span>`).join('')}${(m.s||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`;
  if(m.c&&m.c.length)h+=`<div class="card"><b>Como fazer</b><ol class="mpassos">${m.c.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${m.e&&m.e.length?`<b>Evite</b><ul class="mpassos">${m.e.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>`;
  if(m.f)h+=`<p class="mu xs" style="margin:2px 2px 10px">${esc(MIDIA_CREDITO)}</p>`;
  return h}
/* ---------- HOJE ---------- */
function itemTarget(e,p,w){const k=e.kind;
  if(k==='cardio'){const c=e.cardio||{};return[[c.min?c.min+' min':null,c.km?fnum(c.km,2)+' km':null].filter(Boolean).join(' · ')||'cardio',esc(c.zone||'')]}
  if(k==='wod'){const x=e.wod||{};return[esc(x.format==='ForTime'?'For Time':x.format==='MaxLoad'?'Carga máx.':x.format)+(x.cap&&x.format!=='MaxLoad'?` · cap ${x.cap} min`:''),'WOD']}
  const sets=setsFor(e,p,w),pl=planFor(e,w);
  if(k==='time')return[`${sets}×${esc(e.reps)}s`,pl!=null?fkg(pl)+' kg':''];
  if(k==='bw')return[`${sets}×${esc(e.reps)}`,pl?'+'+fkg(pl)+' kg':'<span class="mu">PC</span>'];
  return[`${sets}×${esc(e.reps)}`,pl!=null?fkg(pl)+' kg':'<span class="mu">livre</span>']}
VIEWS.hoje=function(){
  if(S.active)return viewWorkout();
  const p=myActive();
  let h=hdr(ME&&ME.name?'Olá, '+ME.name.split(' ')[0]:'Hoje',esc((t=>t.charAt(0).toUpperCase()+t.slice(1))(new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}))),false,`<div class="row" style="gap:6px">${syncBadge()}<button class="ib" data-act="go" data-v="ajuda" aria-label="Ajuda">?</button></div>`);
  if(!p)return h+firstSteps();
  if(!p.sessions.length)return h+`<div class="card hero"><h2>${p?'Seu plano ainda não tem treinos':'Nenhum plano ativo'}</h2><p class="mu sm">Crie um plano (ou adicione treinos a ele) na aba <b>Treinos</b>.${ME.role!=='master'?' O master também pode montar para você — aparece aqui automaticamente.':''}</p><button class="btn pri block" data-act="tab" data-t="treinos">Ir para Treinos</button><div style="height:8px"></div><button class="btn block" data-act="syncNow">Atualizar</button></div>`;
  const pr=progOf(p),w=pr.week,N=weeksOf(p);
  if(w>N)return h+`<div class="card hero"><h2>${esc(p.name)} concluído 🎉</h2><p class="mu sm">Você completou as ${N} semanas. O que vem agora?</p><button class="btn pri block" data-act="repeatPlan">Repetir com cargas atualizadas</button><div style="height:8px"></div><button class="btn block" data-act="go" data-v="planos">Escolher outro plano</button></div>`;
  const ph=phaseAt(p,w),done=doneThisWeek(p),nx=nextSession(p);
  if(nx){const fotos=nx.exercises.map(e=>{const k=midiaKey(e);return k&&fotoDe(k,0)}).filter(Boolean).slice(0,3);
    h+=`<div class="card today">${fotos.length?`<div class="tstrip" style="grid-template-columns:repeat(${fotos.length},minmax(0,1fr))">${fotos.map(u=>`<img src="${u}" alt="" loading="lazy">`).join('')}</div>`:''}<div class="tbody"><div class="eyb">${S.logs.some(L=>L.date===iso(new Date()))?'PRÓXIMO TREINO':'TREINO DE HOJE'}</div><div class="tname">${LETRA(p.sessions.indexOf(nx))} · ${esc(nx.name)}</div><div class="mu sm">${nx.exercises.length} exercício${nx.exercises.length===1?'':'s'}${nx.duration?' · '+esc(nx.duration):''}${nx.groups?' · '+esc(nx.groups):''}</div>
      <button class="btn pri block big" data-act="start" data-id="${nx.id}" style="margin-top:10px">▶ Começar treino</button><button class="lnk" data-act="go" data-v="session" data-id="${nx.id}" data-pid="${p.id}" style="align-self:center">Ver exercícios antes</button></div></div>`;
    if(!S.logs.length)h+=`<div class="banner">👟 <b>Primeiro treino?</b> Toque em <b>Começar treino</b>. O app mostra cada exercício com foto, você marca as séries e ele conta o descanso.</div>`}
  else h+=`<div class="card hero"><h2>Semana ${w} completa 🎉</h2><p class="mu sm">Todos os treinos da semana foram feitos. A próxima semana começa no próximo treino.</p></div>`;
  h+=`<div class="card"><div class="row"><b class="sp">Esta semana</b><span class="mu sm">${done.size} de ${p.sessions.length} feito${done.size===1?'':'s'}</span></div>
    <div class="wkt" style="grid-template-columns:repeat(${Math.min(p.sessions.length,6)},minmax(0,1fr))">${p.sessions.map((x,i)=>{const st=done.has(x.id)?'done':(nx&&x.id===nx.id?'now':'');return`<button class="${st}" data-act="go" data-v="session" data-id="${x.id}" data-pid="${p.id}" aria-label="${esc(x.name)}"><b>${LETRA(i)}</b><span>${st==='done'?'feito ✓':st==='now'?'hoje':'depois'}</span></button>`}).join('')}</div>
    ${done.size&&nx?`<div style="text-align:right;margin-top:6px"><button class="btn ghost smb" data-act="advWeek" style="color:var(--mu)">Encerrar semana ${w} ›</button></div>`:''}</div>`;
  {let k=0;const tot=weeksOf(p);h+=`<div class="card"><div class="row"><b class="sp">${esc(p.name)}</b><span class="mu sm">semana ${w} de ${tot}</span></div>
    <div class="phbar">${p.phases.map(f=>{const a=k;k+=f.weeks;const pct=w>k?100:w<=a?0:Math.round(100*(w-a-0.5)/f.weeks);return`<i class="pc-${esc(f.color||'acu')}" style="flex:${f.weeks}"><s style="width:${pct}%"></s></i>`}).join('')}</div>
    <p class="sm" style="margin:8px 0 0"><b class="phn pc-${esc(ph.color||'acu')}">Fase ${p.phases.indexOf(ph)+1} · ${esc(ph.name)}.</b> ${esc(weekFocus(p,w)||'')} ${esc(sobraTxt(ph.rir))}</p></div>`}
  {const B=bodyOf(),wk=weightAt(B),st=weekStreak(S.logs);
   h+=`<div class="grid2"><div class="card tile"><span class="mu xs">Sequência</span><b>${st} semana${st===1?'':'s'}</b><span class="mu xs">treinando sem falhar</span></div><button class="card tile" data-act="addWeight"><span class="mu xs">Peso corporal</span><b>${wk?fnum(wk,1)+' kg':'—'}</b><span class="ac xs b">+ Registrar hoje</span></button></div>`}
  return h};

/* ---------- TREINO EM ANDAMENTO ---------- */
function wkFocus(A){const n=A.exercises.length;if(A.focus!=null&&A.focus>=0&&A.focus<n)return A.focus;const k=A.exercises.findIndex(x=>!exDone(x));return k<0?n-1:k}
function setsGrid(ax,e,i,k){const[lo,hi]=range(e.reps);const adv=ADV();const cols=adv?'40px 1fr 1fr 1fr 52px':'40px 1fr 1fr 52px';
  if(k==='time')return`<div class="sg4 hd2" style="grid-template-columns:40px 1fr 1fr 52px"><span>Série</span><span>kg (opc.)</span><span>Segundos</span><span>Feita</span></div>${ax.sets.map((x,j)=>`<div class="sg4 ${x.done?'done':''}" style="grid-template-columns:40px 1fr 1fr 52px"><span class="n">${j+1}</span><input aria-label="Carga da série ${j+1}" data-wf="kg" data-i="${i}" data-j="${j}" inputmode="decimal" value="${x.kg??''}" placeholder="—"><input aria-label="Segundos da série ${j+1}" data-wf="sec" data-i="${i}" data-j="${j}" inputmode="numeric" value="${x.sec??''}" placeholder="${esc(e.reps||'')}"><button class="chk" data-act="setDone" data-i="${i}" data-j="${j}" aria-label="Série ${j+1} feita">✓</button></div>`).join('')}`;
  return`<div class="sg4 hd2" style="grid-template-columns:${cols}"><span>Série</span><span>${k==='bw'?'Lastro':'kg'}</span><span>Repetições</span>${adv?'<span>RIR</span>':''}<span>Feita</span></div>${ax.sets.map((x,j)=>`<div class="sg4 ${x.done?'done':''}" style="grid-template-columns:${cols}"><span class="n">${j+1}</span><input aria-label="Carga da série ${j+1}" data-wf="kg" data-i="${i}" data-j="${j}" inputmode="decimal" value="${x.kg??''}" placeholder="${k==='bw'?'0':'kg'}"><input aria-label="Repetições da série ${j+1}" data-wf="reps" data-i="${i}" data-j="${j}" inputmode="numeric" value="${x.reps??''}" placeholder="${lo===hi?lo:lo+'–'+hi}">${adv?`<input aria-label="RIR da série ${j+1}" data-wf="rir" data-i="${i}" data-j="${j}" inputmode="numeric" value="${x.rir??''}" placeholder="${esc(String(e.rir||'').replace(/RIR\s*/,''))}">`:''}<button class="chk" data-act="setDone" data-i="${i}" data-j="${j}" aria-label="Série ${j+1} feita">✓</button></div>`).join('')}`}
function restTxt(e){if(e.rest)return e.rest;const s=+e.restSec||0;if(!s)return'';const m=Math.floor(s/60),r=s%60;return m?(m+'min'+(r?String(r).padStart(2,'0'):'')):r+'s'}
function viewWorkout(){
  const A=S.active,p=planById(A.planId,S.lib)||myActive(),w=A.week,ph=p?phaseAt(p,w):{name:'',rir:''},N=p?weeksOf(p):w;
  const fi=wkFocus(A),fch=chainAt(A.exercises,fi),nDone=A.exercises.filter(exDone).length;
  let h=`<div class="wk-h"><div class="row"><div class="sp" style="min-width:0"><h1 style="font-size:22px">${esc(A.name)}</h1><div class="mu sm">Semana ${w} de ${N} · <span id="elapsed">${mmss(elapsedMs(A)/1000)}</span> · ${nDone} de ${A.exercises.length} exercícios${bmrOf(bodyOf(),A.date)?` · 🔥 <span id="kcal">${kcalTxt(workoutKcal(A,null,true))||'~0 kcal'}</span>`:''}${ADV()&&ph.rir?' · RIR '+esc(ph.rir):''}${A.pausedAt?' <b style="color:var(--warn)">pausado</b>':''}</div></div><button class="ib" data-act="pauseW" aria-label="${A.pausedAt?'Retomar':'Pausar'} cronômetro" style="width:44px;height:44px;font-size:18px;${A.pausedAt?'background:var(--warn);color:#201500':''}">${A.pausedAt?'▶':'⏸'}</button><button class="btn pri smb" data-act="finish">Finalizar</button></div></div>`;
  A.exercises.forEach((ax,i)=>{const f=p&&exIn(p,ax.exId),e=f?f.e:Object.assign({name:ax.name,cat:ax.cat,kind:ax.kind,reps:'',rir:'',rest:'',why:''},defaultsFor(ax.kind));
    const all=exDone(ax),k=ax.kind,pl=usesLoad(e)?planFor(e,w):null,ch=chainAt(A.exercises,i),inCh=ch.len>1;
    const open=i>=fch.start&&i<=fch.end;
    const sub=k==='cardio'?itemTarget(e,p,w).filter(Boolean).join(' · '):k==='wod'?itemTarget(e,p,w)[0]:`${ax.sets.length} séries de ${esc(String(e.reps||'').replace('-',' a ').replace('–',' a '))}${k==='time'?' s':''}${restTxt(e)?' · descanso '+esc(restTxt(e)):''}`;
    if(!open){const doneTxt=k==='cardio'||k==='wod'?'Feito':`Feito · ${doneSets(ax).length} série${doneSets(ax).length===1?'':'s'}${topKg(ax)!=null?' · '+fkg(topKg(ax))+' kg':''}`;
      h+=`<button class="card exc ${all?'exdone':''}" data-act="wkFocus" data-i="${i}">${thumbHTML(e,52)||`<span class="thumb ph" style="width:52px;height:52px">${KIND_ICON[k]||'🏋️'}</span>`}<span class="t"><b>${i+1}. ${esc(ax.name)}</b><span class="${all?'ok':'mu'} sm">${all?doneTxt:(inCh?'🔗 '+chainName(ch.len)+' · ':'')+sub}</span></span>${all?'<span class="ok b" aria-hidden="true">✓</span>':(i===fch.end+1?'<span class="mu xs">próximo</span>':'<span class="mu">›</span>')}</button>`;return}
    const lp=lastPerf(ax.exId,A.id);const k2=midiaKey(e),foto=k2&&fotoDe(k2,0);
    const right=k==='cardio'||k==='wod'||(k==='time'&&pl==null)?'':`<div class="kg">${k==='bw'?'Lastro':'Carga'}<b>${pl!=null?fkg(pl)+' kg':(k==='bw'?'corpo':'—')}</b></div>`;
    const link=f?`data-act="go" data-v="exercise" data-id="${e.id}" data-pid="${p.id}"`:'';
    h+=`<div class="card ex exon ${all?'exdone':''} ${inCh?'bs'+(ch.pos<ch.len?' bsn':'')+(ch.pos>1?' bsp':''):''}" id="ex${i}">${inCh?`<div class="bst">🔗 ${chainName(ch.len)} ${ch.pos}/${ch.len}${ch.pos<ch.len?' · sem descanso, siga para o próximo':' · descanse depois desta série'}</div>`:''}
      <div class="exh2">${foto?`<button class="demo" ${link} aria-label="Ver como fazer: ${esc(ax.name)}"><img src="${foto}" alt="" loading="lazy"><span class="play" aria-hidden="true">▶</span></button>`:''}<div class="t"><b class="nm">${i+1}. ${esc(ax.name)}</b><span class="mu sm">${sub}</span>${f?`<button class="lnk" ${link}>Como fazer ›</button>`:''}</div>${right}</div>
      ${lp?`<div class="last">Última vez (${dshort(lp.log.date)}): ${esc(exSummary(lp.ex))}</div>`:''}
      ${e.why?`<div class="why">${esc(e.why)}</div>`:''}${k==='load'&&p&&f&&planEmpty(e)?`<div class="mu xs" style="margin:4px 0 2px">Sem carga no plano: a carga que você usar hoje vira a base do plano ao finalizar.</div>`:''}`;
    const sg=p&&suggest(ax,p,w);
    if(sg)h+=`<div class="sug ${sg.type}">${sg.msg}${sg.act?(ax.applied?`<div class="ok b" style="margin-top:6px">✓ Plano ajustado</div>`:`<button class="btn smb block" data-act="applySug" data-i="${i}">${esc(sg.act.label)}</button>`):''}</div>`;
    if(k==='load'||k==='bw'||k==='time')h+=setsGrid(ax,e,i,k);
    else if(k==='cardio'){const c=ax.cardio,t=e.cardio||{};
      h+=`<div class="cf"><label>Minutos<input data-wc="min" data-i="${i}" inputmode="decimal" value="${c.min??''}" placeholder="${t.min??''}"></label><label>Distância (km)<input data-wc="km" data-i="${i}" inputmode="decimal" value="${c.km??''}" placeholder="${t.km??''}"></label>
        <label>Zona / FC média<input data-wc="zone" data-i="${i}" value="${esc(c.zone??'')}" placeholder="${esc(t.zone||'ex: Zona 2 / 135 bpm')}"></label><label>Calorias<input data-wc="kcal" data-i="${i}" inputmode="numeric" value="${c.kcal??''}" placeholder="opcional"></label></div>
        <div class="row sm" style="margin-top:8px"><span class="mu sp">Ritmo: <b id="pace${i}">${pace(c.min,c.km)}</b></span><button class="btn smb ${ax.done?'':'pri'}" data-act="xDone" data-i="${i}">${ax.done?'✓ Concluído':'Concluir'}</button></div>`}
    else if(k==='wod'){const x=ax.wod,t=e.wod||{};const F=t.format||'AMRAP';
      h+=`${t.desc?`<div class="wod">${esc(t.desc)}</div>`:''}<div class="cf">${
        F==='AMRAP'?`<label>Rounds<input data-ww="rounds" data-i="${i}" inputmode="numeric" value="${x.rounds??''}"></label><label>+ Reps<input data-ww="reps" data-i="${i}" inputmode="numeric" value="${x.reps??''}"></label>`:
        F==='ForTime'?`<label>Tempo (mm:ss)<input data-ww="time" data-i="${i}" value="${x.time!=null?mmss(x.time):''}" placeholder="ex: 6:42"></label><label>Estourou o cap?<select data-ww="capped" data-i="${i}"><option value="0" ${x.capped?'':'selected'}>Não</option><option value="1" ${x.capped?'selected':''}>Sim</option></select></label>${x.capped?`<label>Reps feitas<input data-ww="reps" data-i="${i}" inputmode="numeric" value="${x.reps??''}"></label>`:''}`:
        F==='EMOM'?`<label>Rounds concluídos<input data-ww="rounds" data-i="${i}" inputmode="numeric" value="${x.rounds??''}" placeholder="${t.cap||''}"></label>`:
        `<label>Carga (kg)<input data-ww="kg" data-i="${i}" inputmode="decimal" value="${x.kg??''}"></label>`}
        <label>Versão<select data-ww="rx" data-i="${i}"><option value="1" ${x.rx!==false?'selected':''}>Rx</option><option value="0" ${x.rx===false?'selected':''}>Adaptado</option></select></label></div>
        <div class="row" style="margin-top:8px">${t.cap&&F!=='MaxLoad'?`<button class="btn smb" data-act="wodTimer" data-i="${i}">▶ Cronômetro ${t.cap} min</button>`:''}<span class="sp"></span><button class="btn smb ${ax.done?'':'pri'}" data-act="xDone" data-i="${i}">${ax.done?'✓ Concluído':'Concluir'}</button></div>`}
    if(k!=='cardio'&&k!=='wod')h+=`<div class="row" style="margin-top:8px"><button class="btn ghost smb sp" data-act="addSet" data-i="${i}">+ Série</button>${ax.sets.length>1?`<button class="btn ghost smb sp" data-act="rmSet" data-i="${i}" style="color:var(--mu)">− Série</button>`:''}</div>`;
    h+=`</div>`});
  h+=`<label class="f"><span>Observações do treino</span><textarea id="wnote" rows="2" data-wnote="1">${esc(A.note||'')}</textarea></label>
    <button class="btn pri block" data-act="finish">Finalizar treino</button><div style="height:10px"></div><button class="btn block" data-act="discard" style="color:var(--bad)">Descartar treino</button>`;
  return h}
function startWorkout(id){const p=myActive();const s=sessIn(p,id);if(!s)return;const w=clampW(progOf(p).week,p);
  S.active={id:'L'+Date.now(),planId:p.id,planName:p.name,round:progOf(p).round||1,sessionId:id,name:s.name,date:iso(new Date()),week:w,startedAt:Date.now(),note:'',
    exercises:s.exercises.map((e,ei)=>{const lp=lastPerf(e.id);const ax={exId:e.id,cat:e.cat||null,name:e.name,kind:e.kind||'load',sets:[],open:false,done:false,link:!!e.link&&ei<s.exercises.length-1};
      if(ax.kind==='cardio')ax.cardio={min:null,km:null,zone:null,kcal:null};
      else if(ax.kind==='wod')ax.wod={format:(e.wod||{}).format||'AMRAP',rounds:null,reps:null,time:null,capped:false,kg:null,rx:true};
      else{const pl=planFor(e,w);const kg=pl??(lp?topKg(lp.ex):null);ax.sets=Array.from({length:setsFor(e,p,w)},()=>({kg:ax.kind==='bw'?(pl??null):kg,reps:null,rir:null,sec:null,done:false}))}
      return ax})};
  save();V.tab='hoje';V.stack=[];render();scrollTo(0,0);wake()}
function onWorkoutInput(t,commitKg){const A=S.active;if(!A)return;const d=t.dataset,i=+d.i,ax=A.exercises[i];if(!ax)return;
  if(d.wf){const j=+d.j,s=ax.sets[j];s[d.wf]=num(t.value);
    if(commitKg&&d.wf==='kg'){for(let k=j+1;k<ax.sets.length;k++){if(ax.sets[k].done)continue;ax.sets[k].kg=s.kg;const el=document.querySelector(`[data-wf="kg"][data-i="${i}"][data-j="${k}"]`);if(el)el.value=s.kg??''}}}
  else if(d.wc){ax.cardio[d.wc]=d.wc==='zone'?(t.value||null):num(t.value);const el=$('#pace'+i);if(el)el.textContent=pace(ax.cardio.min,ax.cardio.km)}
  else if(d.ww){const x=ax.wod;if(d.ww==='time')x.time=parseTime(t.value);else if(d.ww==='rx')x.rx=t.value==='1';else if(d.ww==='capped'){x.capped=t.value==='1';save();render();return}else x[d.ww]=num(t.value)}
  save()}
let AC=null,OUT=null;
function audio(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();
  if(!OUT){const c=AC.createDynamicsCompressor();c.threshold.value=-10;c.knee.value=0;c.ratio.value=4;c.attack.value=0.002;c.release.value=0.1;const g=AC.createGain();g.gain.value=1.6;c.connect(g);g.connect(AC.destination);OUT=c}}catch(e){}}
function tone(f,at,dur,vol){const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;o.connect(g);g.connect(OUT);
  g.gain.setValueAtTime(0.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+0.012);g.gain.setValueAtTime(vol,at+dur-0.04);g.gain.exponentialRampToValueAtTime(0.0001,at+dur);o.start(at);o.stop(at+dur+0.03)}
function beep(kind){if(!S||!S.settings.sound)return;audio();if(!AC||!OUT)return;try{const t=AC.currentTime+0.02;
  if(kind==='warn'){tone(1046,t,0.16,0.9);tone(1046,t+0.24,0.16,0.9)}            // aviso: faltam 5 s
  else{[0,0.22,0.44].forEach(d=>tone(1568,t+d,0.16,1));tone(2093,t+0.72,0.6,1)}  // fim do descanso
  }catch(e){}}
let T=null;
function persistTimer(){if(S&&S.active){S.active.timer=T?{end:T.end,total:T.total,label:T.label,sub:T.sub,mode:T.mode,fired:T.fired,warned:T.warned}:null;save()}}
function restoreTimer(){const t=S&&S.active&&S.active.timer;if(!t||T)return;const left=(t.end-Date.now())/1000;if(left<-90)return;T=Object.assign({},t);if(left<=0)T.fired=true;if(left<=5)T.warned=true}
function startTimer(sec,label,sub,mode){T={end:Date.now()+sec*1000,total:sec,label,sub,fired:false,warned:sec<=5,mode:mode||'rest'};persistTimer();tick()}
let kT=0;function tick(){const A=S&&S.active;const el=$('#elapsed');if(el&&A){el.textContent=mmss(elapsedMs(A)/1000);const kc=$('#kcal');if(kc&&Date.now()-kT>3000){kT=Date.now();kc.textContent=kcalTxt(workoutKcal(A,null,true))||'~0 kcal'}}
  const box=$('#timer');if(!T){box.hidden=true;return}box.hidden=false;const left=(T.end-Date.now())/1000;
  if(left<=5&&left>0&&!T.warned){T.warned=true;if(S.settings.warn5!==false)beep('warn');persistTimer()}
  if(left<=0&&!T.fired){T.fired=true;beep('end');if(navigator.vibrate)navigator.vibrate([300,120,300]);persistTimer()}
  box.classList.toggle('end',left<=0);box.classList.toggle('warn5',left>0&&left<=5);$('#tt').textContent=left>0?mmss(Math.ceil(left)):'+'+mmss(-left);
  $('#tlab').textContent=T.mode==='wod'?(left>0?'WOD em andamento':'Tempo!'):(left>0?(left<=5?'Prepare-se!':'Descanso'):'Bora! Próxima série');$('#tsub').textContent=T.sub||'';
  $('#tbar').style.width=Math.max(0,Math.min(100,100*left/T.total))+'%';if(left<-90){T=null;persistTimer()}}
setInterval(tick,250);
let WL=null;async function wake(){try{if(S&&S.settings.wake&&S.active&&'wakeLock'in navigator&&!document.hidden&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>WL=null)}if(WL&&(!S||!S.active||!S.settings.wake)){WL.release();WL=null}}catch(e){}}
function finishWorkout(){const A=S.active;
  const ex=A.exercises.filter(exHasData).map(x=>{const o={exId:x.exId,cat:x.cat,name:x.name,kind:x.kind};
    if(x.kind==='cardio'){o.cardio=x.cardio;o.done=true;o.sets=[]}else if(x.kind==='wod'){o.wod=x.wod;o.done=true;o.sets=[]}
    else o.sets=x.sets.filter(s=>s.done).map(s=>({kg:s.kg,reps:s.reps,rir:s.rir,sec:s.sec}));return o});
  const L={id:A.id,planId:A.planId,planName:A.planName,round:A.round||1,sessionId:A.sessionId,name:A.name,date:A.date,week:A.week,startedAt:A.startedAt,finishedAt:Date.now(),durationSec:Math.round(elapsedMs(A)/1000),note:A.note||'',exercises:ex};
  S.logs.push(L);markLog(L.id);sortLogs();S.active=null;T=null;let msg='Treino salvo 💪';
  const p=planById(L.planId,S.lib);
  const filled=fillPlanFromLog(p,L);
  if(p&&p.id===S.lib.activeId){const pr=progOf(p),N=weeksOf(p);
    if(pr.week<=N&&p.sessions.every(s=>doneThisWeek(p).has(s.id))){pr.week++;
      if(pr.week>N){if(p.repeat){pr.week=1;pr.round=(pr.round||1)+1;msg=`Bloco concluído! 🎉 ${p.name} recomeça na semana 1`}else msg=`Semana ${N} concluída — plano completo! 🎉`}
      else msg=`Semana ${pr.week-1} concluída! 🎉 Agora: semana ${pr.week} · ${phaseAt(p,pr.week).name}`}}
  const kc=workoutKcal(L);if(kc&&kc.total)msg+=' · '+kcalTxt(kc);
  if(filled.length)msg+=` · Carga do plano definida para ${filled.length} exercício${filled.length>1?'s':''}`;
  commit();wake();V.stack=[];render();scrollTo(0,0);toast(msg)}

/* ---------- PLANOS ---------- */
function U(){return CTX.uid||''}
function ua(){return`data-uid="${U()}"`}
function whoName(){return CTX.tpl?'Modelos':CTX.uid&&MANAGE?MANAGE.name:''}
VIEWS.planos=function(){const lib=LIB(),u=U(),own=!u;
  let h=u?hdr('Planos de '+esc(whoName()),'Alterações são salvas na conta dele automaticamente',true):hdr('Planos de treino','Em andamento, próximos e finalizados',!!topV(),syncBadge());
  if(u)h+=`<div class="banner">✏️ Você está editando os planos de <b>${esc(whoName())}</b>.</div>`;
  const act=planById(lib.activeId,lib);
  h+=`<h3>Em andamento</h3>`;
  if(act){const N=weeksOf(act);const w=own?progOf(act).week:0;
    h+=`<div class="card hero tap" data-act="go" data-v="plan" data-id="${act.id}" ${ua()}><div class="row"><div class="sp"><h2>${esc(act.name)}</h2><div class="mu sm">${N} semanas · ${act.sessions.length} treinos/semana${act.repeat?' · repete':''}${own?` · semana ${Math.min(w,N)}${w>N?' (concluído)':''}`:''}</div></div>${own&&w<=N?phPill(act,w):''}</div>${weekbar(act,own?w:0)}</div>`}
  else h+=`<div class="card mu sm">Nenhum plano em andamento.</div>`;
  const others=lib.plans.filter(p=>p!==act),isDone=p=>own&&S.prog[p.id]&&S.prog[p.id].week>weeksOf(p);
  const row=p=>{const pr=own&&S.prog[p.id];return`<div class="li tap" data-act="go" data-v="plan" data-id="${p.id}" ${ua()}><span class="kd">📋</span><div class="t"><b>${esc(p.name)}</b><span class="mu sm">${weeksOf(p)} semanas · ${p.sessions.length} treinos${pr&&pr.week>weeksOf(p)?' · concluído':pr&&pr.week>1?' · parado na semana '+pr.week:''}</span></div><span class="mu">›</span></div>`};
  const nxt=others.filter(p=>!isDone(p)),fin=others.filter(isDone);
  h+=`<h3>Próximos</h3>${nxt.length?`<div class="card" style="padding:4px 14px">${nxt.map(row).join('')}</div>`:'<div class="card mu sm">Nenhum plano aguardando. Crie um novo para deixar na fila.</div>'}`;
  if(fin.length)h+=`<h3>Finalizados</h3><div class="card" style="padding:4px 14px">${fin.map(row).join('')}</div>`;
  h+=`<div style="height:12px"></div><button class="btn pri block" data-act="go" data-v="montar" ${ua()}>Montar em 3 perguntas</button><div style="height:8px"></div><button class="btn block" data-act="newPlan" ${ua()}>+ Novo plano (avançado)</button>`;
  return h};
VIEWS.plan=function({id}){const p=planById(id);if(!p)return hdr('Plano','',true)+'<div class="empty">Não encontrado</div>';
  const lib=LIB(),own=!U(),isAct=lib.activeId===p.id,N=weeksOf(p),w=own?progOf(p).week:0;
  let h=hdr(p.name,p.tpl?`Modelo · ${tplLabel(p)}`:`${N} semanas · ${p.sessions.length} treinos/semana${isAct?' · <b class="ok">ativo</b>':''}`,true);
  const isTpl=!!CTX.tpl;if(isTpl)h+=`<div class="banner">🧩 <b>Modelo pronto.</b> As mudanças valem para os próximos planos criados a partir dele; planos já criados não mudam.${p.tpl&&p.tpl.custom?' <button class="btn ghost smb" data-act="tplReset" data-pid="'+p.id+'">Restaurar original</button>':''}</div>`;
  if(!isTpl)h+=`<div class="row wrap" style="margin-bottom:6px">${isAct?'':`<button class="btn pri smb" data-act="activatePlan" data-pid="${p.id}" ${ua()}>Tornar ativo</button>`}<button class="btn smb" data-act="dupPlan" data-pid="${p.id}" ${ua()}>Duplicar</button><button class="btn smb" data-act="delPlan" data-pid="${p.id}" ${ua()} style="color:var(--bad)">Excluir</button></div>`;
  h+=`<div class="card"><label class="f" style="margin-top:0"><span>Nome do plano</span><input data-plf="name" data-pid="${p.id}" value="${esc(p.name)}"></label>
    ${p.tpl?'':`<div class="sw"><span>Repetir automaticamente ao terminar<div class="mu xs">Bom para planos de manutenção contínua</div></span><input type="checkbox" data-plf="repeat" data-pid="${p.id}" ${p.repeat?'checked':''}></div>`}</div>`;
  h+=`<h3>Treinos da semana (sequência)</h3><p class="mu sm" style="margin:-4px 0 0">A semana avança quando todos forem feitos. Para treinar 3×/semana, deixe 3 treinos.</p><div class="card" style="padding:4px 14px">${p.sessions.length?'':'<div class="li mu sm">Nenhum treino ainda.</div>'}${p.sessions.map((s,i,a)=>`<div class="li"><span class="pill" style="min-width:30px;text-align:center">${i+1}</span><div class="t tap" data-act="go" data-v="session" data-id="${s.id}" data-pid="${p.id}" ${ua()}><b>${esc(s.name)}</b><span class="mu sm">${esc(s.groups||'')}${s.groups?' · ':''}${s.exercises.length} exerc.</span></div><button class="ib" data-act="moveSess" data-pid="${p.id}" data-i="${i}" data-d="-1" ${i?'':'disabled style="opacity:.3"'}>↑</button><button class="ib" data-act="moveSess" data-pid="${p.id}" data-i="${i}" data-d="1" ${i<a.length-1?'':'disabled style="opacity:.3"'}>↓</button></div>`).join('')}</div>
    <button class="btn block" data-act="addSess" data-pid="${p.id}" ${ua()}>+ Adicionar treino</button>`;
  if(isTpl)return h;if(!ADV())h+=`<details style="margin-top:14px"><summary>⚙️ Opções avançadas: fases e progressão de cargas</summary>`;let k=0;h+=`<h3>Periodização — ${N} semanas</h3><div class="card" style="padding:8px 10px"><table><tr><th>Sem</th><th>Fase</th><th>RIR</th><th>Séries</th></tr>${p.phases.map(ph=>Array.from({length:ph.weeks},()=>{k++;return`<tr class="pc-${esc(ph.color)} ${k===w?'cur':''}"><td><b>${k}</b></td><td><span class="ph-dot"></span>${esc(ph.name)}${weekFocus(p,k)?`<div class="mu xs">${esc(weekFocus(p,k))}</div>`:''}</td><td>${esc(ph.rir||'—')}</td><td>${Math.round((+ph.vol||1)*100)}%</td></tr>`}).join('')).join('')}</table>
    <div style="height:8px"></div><button class="btn block" data-act="go" data-v="phases" data-id="${p.id}" ${ua()}>Editar periodização</button></div>`;
  h+=`<h3>Progressão de cargas</h3><div class="card"><p class="sm mu" style="margin-top:0">O gerador recalcula as cargas de todas as semanas a partir da <b>carga-base</b> de cada exercício, seguindo as regras de cada fase.</p><button class="btn block" data-act="genAll" data-pid="${p.id}" ${ua()}>Regerar progressão de todos</button>
    ${own&&isAct?`<div style="height:8px"></div><button class="btn block" data-act="repeatPlan">Novo ciclo com cargas atualizadas</button>`:''}</div>`;
  if(!ADV())h+=`</details>`;if(p.tips&&p.tips.length)h+=`<details><summary>⚠️ Erros a evitar</summary>${p.tips.map(t=>`<p><b>${esc(t[0])}</b><br>${esc(t[1])}</p>`).join('')}</details>`;
  if(p.nutrition&&p.nutrition.length)h+=`<details><summary>🍽️ Nutrição & suplementação</summary>${p.nutrition.map(t=>`<p><b>${esc(t[0])}</b><br>${esc(t[1])}</p>`).join('')}</details>`;
  return h};
VIEWS.phases=function({id}){const p=planById(id);if(!p)return hdr('Periodização','',true);const N=weeksOf(p);
  let h=hdr('Periodização',`${esc(p.name)} · <b>${N} semanas</b>`,true);
  h+=`<div class="card"><div class="row"><select id="tplSel" class="sp">${Object.entries(PERIOD_TEMPLATES).map(([k,t])=>`<option value="${k}">${esc(t.name)}</option>`).join('')}</select><button class="btn smb" data-act="applyTpl" data-pid="${p.id}" ${ua()}>Aplicar</button></div><p class="mu xs" style="margin:6px 0 0">Aplicar um modelo substitui as fases abaixo (os treinos e exercícios continuam).</p></div>`;
  p.phases.forEach((ph,i)=>{const a=`data-pid="${p.id}" data-k="${i}"`;
    h+=`<div class="card phase pc-${esc(ph.color)}"><div class="row"><b class="sp">Fase ${i+1}</b><button class="ib" data-act="movePh" ${a} data-d="-1" ${i?'':'disabled style="opacity:.3"'}>↑</button><button class="ib" data-act="movePh" ${a} data-d="1" ${i<p.phases.length-1?'':'disabled style="opacity:.3"'}>↓</button><button class="ib" data-act="delPh" ${a} style="color:var(--bad)">✕</button></div>
      <div class="grid2"><label class="f"><span>Nome</span><input data-phf="name" ${a} value="${esc(ph.name)}"></label><label class="f"><span>Semanas</span><input data-phf="weeks" ${a} inputmode="numeric" value="${ph.weeks}"></label></div>
      <label class="f"><span>Carga</span>${sel('',Object.entries(MODES),ph.mode,`data-phf="mode" ${a}`)}</label>
      <div class="grid3">${ph.mode==='hold'?'':`<label class="f"><span>${ph.mode==='inc'?'Incrementos/sem':ph.mode==='pct'?'% por semana':'% do pico'}</span><input data-phf="step" ${a} inputmode="decimal" value="${ph.step}"></label>`}${ph.mode==='inc'||ph.mode==='pct'?`<label class="f"><span>Sem. sem subir</span><input data-phf="hold" ${a} inputmode="numeric" value="${ph.hold||0}"></label>`:''}<label class="f"><span>Volume</span>${sel('',[[1,'100%'],[0.9,'90%'],[0.85,'85%'],[0.8,'80%'],[0.75,'75%'],[0.6,'60%'],[0.5,'50%'],[1.25,'125%']],ph.vol,`data-phf="vol" ${a}`)}</label></div>
      <div class="grid2"><label class="f"><span>RIR alvo</span><input data-phf="rir" ${a} value="${esc(ph.rir||'')}"></label><label class="f"><span>Cor</span>${sel('',PHASE_COLORS,ph.color,`data-phf="color" ${a}`)}</label></div>
      <label class="f"><span>Foco / objetivo</span><input data-phf="focus" ${a} value="${esc(ph.focus||'')}"></label></div>`});
  h+=`<button class="btn block" data-act="addPh" data-pid="${p.id}" ${ua()}>+ Adicionar fase</button><div style="height:8px"></div><button class="btn pri block" data-act="genAll" data-pid="${p.id}" ${ua()}>Regerar cargas com esta periodização</button>`;
  return h};
const LETRA=i=>String.fromCharCode(65+i);
function chainLabel(n){return n===2?'Em dupla, sem descanso entre os dois':n===3?'Em trio, sem descanso entre eles':`Em sequência de ${n}, sem descanso entre eles`}
function exTargetTxt(e,p,w){const[x,y]=itemTarget(e,p,w);const yy=String(y||'').replace(/<[^>]+>/g,'').trim();return String(x||'').replace(/(\d)\s*×\s*/,'$1 × ').replace(/(\d)\s*[-–]\s*(\d)/g,'$1 a $2')+(yy&&yy!=='livre'?' · '+(yy==='PC'?'peso do corpo':yy):'')}
VIEWS.session=function({id,pid}){const p=planById(pid),s=sessIn(p,id);if(!s)return hdr('Treino','',true)+'<div class="empty">Não encontrado</div>';
  const own=!U(),lib=LIB(),isAct=own&&lib.activeId===p.id,w=own?clampW(progOf(p).week,p):1,N=weeksOf(p),idx=p.sessions.indexOf(s);
  const nx=isAct&&nextSession(p),isNext=nx&&nx.id===s.id,done=isAct&&doneThisWeek(p).has(s.id);
  let h=hdr(s.name,`Treino ${LETRA(idx)}${isNext?' · <b class="ac">próximo</b>':done?' · <span class="ok">feito esta semana ✓</span>':''}`,true,`<button class="btn smb" data-act="go" data-v="sessedit" data-id="${s.id}" data-pid="${p.id}" ${ua()}>Editar</button>`);
  h+=`<div class="stat3"><div><span>Exercícios</span><b>${s.exercises.length}</b></div><div><span>Duração</span><b>${esc(s.duration||'—')}</b></div><div><span>Semana</span><b>${own?Math.min(w,N)+' de '+N:N}</b></div></div>`;
  if(isAct&&s.exercises.length)h+=`<button class="btn pri block big" data-act="start" data-id="${s.id}" style="margin-top:12px">▶ ${S.active&&S.active.sessionId===s.id?'Continuar treino':'Começar treino'}</button>`;
  if(!s.exercises.length)h+=`<div class="card hero" style="margin-top:12px"><h2>Treino vazio</h2><p class="mu sm">Toque em Editar para adicionar exercícios.</p><button class="btn pri block" data-act="go" data-v="sessedit" data-id="${s.id}" data-pid="${p.id}" ${ua()}>Editar treino</button></div>`;
  else{h+=`<div class="card list">`;let i=0;const X=s.exercises;
    while(i<X.length){const ch=chainAt(X,i);
      const row=(e,small)=>{const k=midiaKey(e),u=k&&fotoDe(k,0);return`<button class="li2" data-act="go" data-v="exercise" data-id="${e.id}" data-pid="${p.id}" ${ua()}>${u?`<img class="thumb" src="${u}" alt="" loading="lazy" style="width:${small?44:52}px;height:${small?44:52}px">`:`<span class="thumb ph" style="width:${small?44:52}px;height:${small?44:52}px">${KIND_ICON[e.kind]||'🏋️'}</span>`}<span class="t"><b>${esc(e.name)}</b><span class="mu sm">${exTargetTxt(e,p,w)}</span></span><span class="mu">›</span></button>`};
      if(ch.len>1){h+=`<div class="grp"><div class="gl">${chainLabel(ch.len)}</div>${X.slice(ch.start,ch.end+1).map(e=>row(e,true)).join('')}</div>`;i=ch.end+1}
      else{h+=row(X[i]);i++}}
    h+=`</div>`}
  if(s.cardio)h+=`<p class="mu sm">Cardio do dia: ${esc(s.cardio)}</p>`;
  if(s.notes)h+=`<p class="mu sm">Notas: ${esc(s.notes)}</p>`;
  return h};
const SE={open:''};
const REST_OPTS=[[30,'30 s'],[45,'45 s'],[60,'1min'],[75,'1min15'],[90,'1min30'],[120,'2min'],[150,'2min30'],[180,'3min'],[240,'4min']];
VIEWS.sessedit=function({id,pid}){const p=planById(pid),s=sessIn(p,id);if(!s)return hdr('Treino','',true)+'<div class="empty">Não encontrado</div>';
  const a=`data-sid="${s.id}" data-pid="${p.id}"`,w=U()?1:clampW(progOf(p).week,p),X=s.exercises;
  let h=hdr('Editar '+(s.name||'treino'),'Salva automaticamente',true,`<button class="btn pri smb" data-act="back">Concluir</button>`);
  h+=`<label class="f" style="margin-top:0"><span>Nome do treino</span><input data-pf="name" ${a} value="${esc(s.name)}"></label>`;
  if(X.length)h+=`<p class="mu sm" style="margin:10px 2px 4px">Segure o ☰ e arraste para mudar a ordem. Toque no exercício para ajustar.</p>`;
  h+=`<div class="card list" id="selist" ${a}>${X.length?'':'<div class="li mu sm">Nenhum exercício ainda.</div>'}`;
  X.forEach((e,i)=>{const ch=chainAt(X,i),open=SE.open===e.id,k=midiaKey(e),u=k&&fotoDe(k,0),ea=`data-eid="${e.id}" data-pid="${p.id}"`;
    if(i){const lk=X[i-1].link;h+=lk?`<div class="lk on">${chainLabel(chainAt(X,i-1).len).split(',')[0]} · <button class="lnkm" data-act="linkEx" ${a} data-i="${i-1}">separar</button></div>`:`<div class="lk"><button class="lnkm" data-act="linkEx" ${a} data-i="${i-1}">+ juntar em dupla</button></div>`}
    h+=`<div class="eitem ${open?'open':''} ${ch.len>1?'inch':''}" data-i="${i}"><div class="erow"><span class="drag" data-drag="${i}" role="button" aria-label="Arrastar ${esc(e.name)} para mudar a ordem" title="Arraste para mudar a ordem">☰</span><button class="li2" data-act="seOpen" data-eid="${e.id}">${u?`<img class="thumb" src="${u}" alt="" loading="lazy" style="width:44px;height:44px">`:`<span class="thumb ph" style="width:44px;height:44px">${KIND_ICON[e.kind]||'🏋️'}</span>`}<span class="t"><b>${esc(e.name)}</b><span class="mu sm">${exTargetTxt(e,p,w)}</span></span><span class="mu">${open?'▴':'▾'}</span></button></div>`;
    if(open){
      if(e.kind==='load'||e.kind==='bw'||e.kind==='time'){const rs=+e.restSec||90;const opts=REST_OPTS.some(o=>o[0]===rs)?REST_OPTS:REST_OPTS.concat([[rs,restTxt({restSec:rs})]]);
        h+=`<div class="grid3"><div class="f"><span>Séries</span><div class="step"><button class="ib" data-act="seSets" ${ea} data-d="-1" aria-label="Menos séries">−</button><b>${e.sets||1}</b><button class="ib" data-act="seSets" ${ea} data-d="1" aria-label="Mais séries">+</button></div></div><label class="f"><span>${e.kind==='time'?'Segundos':'Repetições'}</span><input data-ef="reps" ${ea} value="${esc(e.reps||'')}" placeholder="ex: 8-12"></label><label class="f"><span>Descanso</span>${sel('',opts,rs,`data-ef="restSec" ${ea}`)}</label></div>`;
        if(usesLoad(e))h+=`<label class="f"><span>Carga inicial (kg${e.kind==='bw'?' de lastro':''})</span><input data-pl="-1" ${ea} inputmode="decimal" value="${e.base??''}" placeholder="opcional"></label>`}
      else h+=`<p class="mu sm">${e.kind==='cardio'?'Cardio':'WOD'}: ajuste os detalhes em Opções avançadas.</p>`;
      h+=`<div class="row wrap" style="margin-top:8px"><button class="btn smb sp" data-act="go" data-v="picker" data-pid="${p.id}" data-sid="${s.id}" data-eid="${e.id}" data-mode="swap" ${ua()}>Trocar exercício</button><button class="btn smb sp" data-act="go" data-v="exercise" data-id="${e.id}" data-pid="${p.id}" ${ua()}>Ver como fazer</button></div>
        <div class="row wrap" style="margin-top:6px"><button class="btn smb sp" data-act="go" data-v="exedit" data-id="${e.id}" data-pid="${p.id}" ${ua()}>Opções avançadas</button><button class="btn smb sp" data-act="delEx" ${ea} style="color:var(--bad)">Remover</button></div>`}
    h+=`</div>`});
  h+=`</div><button class="btn block addx" data-act="go" data-v="picker" data-pid="${p.id}" data-sid="${s.id}" ${ua()}>+ Adicionar exercício</button>`;
  h+=`<details class="card"><summary><b>Mais detalhes do treino</b> <span class="mu sm">grupos, duração, notas, cardio</span></summary><div class="grid2"><label class="f"><span>Grupos musculares</span><input data-pf="groups" ${a} value="${esc(s.groups||'')}"></label><label class="f"><span>Duração</span><input data-pf="duration" ${a} value="${esc(s.duration||'')}" placeholder="ex: 60 min"></label></div><label class="f"><span>Notas</span><input data-pf="notes" ${a} value="${esc(s.notes||'')}"></label><label class="f"><span>Cardio do dia (lembrete)</span><input data-pf="cardio" ${a} value="${esc(s.cardio||'')}"></label></details>`;
  h+=`<div class="row"><button class="btn sp" data-act="dupSess" ${a} ${ua()}>Duplicar treino</button><button class="btn sp" data-act="delSess" ${a} style="color:var(--bad)">Excluir treino</button></div>`;
  return h};
function midiaDetail(k,m){if(!m)return'';let h='';
  if(m.f){const n=Math.min(m.n||1,2);h+=`<div class="mfotos">${[0,1].slice(0,n).map(i=>`<figure><img src="${fotoDe(k,i)}" alt="${i?'Posição final':'Posição inicial'}" loading="lazy"><figcaption>${i?'2 · Fim':'1 · Início'}</figcaption></figure>`).join('')}</div>`}
  if((m.p&&m.p.length)||(m.s&&m.s.length))h+=`<div class="card mus"><b>Músculos</b>${m.p&&m.p.length?`<div class="row sm"><i class="dot on"></i><span><b>Principal:</b> ${m.p.map(esc).join(', ')}</span></div>`:''}${m.s&&m.s.length?`<div class="row sm"><i class="dot"></i><span><b>Ajudam:</b> ${m.s.map(esc).join(', ')}</span></div>`:''}</div>`;
  if(m.c&&m.c.length)h+=`<div class="card"><b>Como fazer</b><ol class="mpassos">${m.c.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
  if(m.e&&m.e.length)h+=`<div class="card"><b>Evite</b><ul class="mpassos">${m.e.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  return h}
VIEWS.catex=function({cid}){const c=allCatalog().find(x=>x.id===cid);if(!c)return hdr('Exercício','',true)+'<div class="empty">Não encontrado</div>';const m=MIDIA[cid];
  let h=hdr(c.name,esc([c.cat,c.grp,c.eq].filter(Boolean).join(' · ')),true);
  h+=m?midiaDetail(cid,m):'<div class="empty">Sem fotos ou instruções para este exercício.</div>';
  if(m&&m.f)h+=`<p class="mu xs" style="margin:2px 2px 10px">${esc(MIDIA_CREDITO)} Textos do app Treino.</p>`;
  return h};
function afterAdd(it,p){const t=topV();if(t&&t.view==='sessedit'){SE.open=it.id;render();toast('Adicionado: '+it.name)}else{go('exedit',{id:it.id,pid:p.id,uid:U()});toast('Adicionado — ajuste séries e cargas')}}
function sparkSVG(vals){const v=vals.filter(x=>x!=null);if(v.length<2)return'';const mn=Math.min(...v),mx=Math.max(...v),W=320,H=64,r=mx-mn||1;const pts=v.map((x,i)=>`${Math.round(i*(W-8)/(v.length-1))+4},${Math.round(H-6-(x-mn)*(H-14)/r)}`);return`<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução da carga: de ${fkg(v[0])} a ${fkg(v[v.length-1])} kg"><path d="M${pts.join(' L')}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="4" fill="var(--ac)"/></svg>`}
function sobraTxt(rir){const m=String(rir||'').match(/(\d+)\s*[–-]?\s*(\d+)?/);if(!m)return'';return`Pare cada série com cerca de ${m[2]?m[1]+' a '+m[2]:m[1]} repetiç${(m[2]||m[1])==='1'?'ão':'ões'} sobrando.`}
VIEWS.exercise=function({id,pid}){const p=planById(pid),f=exIn(p,id);if(!f)return hdr('Exercício','',true)+'<div class="empty">Não encontrado</div>';const e=f.e,own=!U(),w=own?clampW(progOf(p).week,p):1;
  const k=midiaKey(e),m=midiaItem(e),c=k&&CATALOG.find(x=>x.id===k);
  let h=hdr(e.name,esc([c&&c.cat,c&&c.eq].filter(Boolean).join(' · ')||KIND_LABEL[e.kind]),true,`<button class="btn smb" data-act="go" data-v="exedit" data-id="${e.id}" data-pid="${p.id}" ${ua()}>Editar</button>`);
  h+=midiaDetail(k,m);
  if(e.why)h+=`<div class="card"><b>Dica do plano</b><p class="sm" style="margin:6px 0 0">${esc(e.why)}</p></div>`;
  if(own){const ent=[];S.logs.forEach(L=>{const x=L.exercises.find(x=>x.exId===e.id);if(x&&exHasData(x))ent.push({L,x})});
    if(usesLoad(e)){let best=null;ent.forEach(({x})=>doneSets(x).forEach(st=>{if(st.kg!=null&&(!best||st.kg>best.kg||(st.kg===best.kg&&(st.reps||0)>(best.reps||0))))best=st}));
      const last=ent[ent.length-1],pl=planFor(e,w);
      h+=`<div class="card"><b>Seu histórico</b><div class="stat3"><div><span>Última vez</span><b>${last&&topKg(last.x)!=null?fkg(topKg(last.x))+' kg':'—'}</b><span>${last?dshort(last.L.date):''}</span></div><div><span>Recorde</span><b>${best?fkg(best.kg)+' kg':'—'}</b><span>${best&&best.reps?'× '+best.reps:''}</span></div><div><span>Hoje</span><b class="ac">${pl!=null?fkg(pl)+' kg':'—'}</b><span>plano</span></div></div>${sparkSVG(ent.slice(-8).map(({x})=>topKg(x)))}<button class="lnk" data-act="go" data-v="evo" data-id="${e.id}">Ver evolução completa ›</button></div>`}
    else if(ent.length){const last=ent[ent.length-1];h+=`<div class="card"><b>Seu histórico</b><p class="sm" style="margin:6px 0 4px">Última vez (${dshort(last.L.date)}): ${esc(exSummary(last.x))}</p><p class="mu xs" style="margin:0">${ent.length} registro${ent.length===1?'':'s'}</p><button class="lnk" data-act="go" data-v="evo" data-id="${e.id}">Ver evolução completa ›</button></div>`}}
  const tg=itemTarget(e,p,w);
  h+=`<div class="card"><div class="row"><b class="sp">Neste treino</b><button class="btn smb" data-act="go" data-v="exedit" data-id="${e.id}" data-pid="${p.id}" ${ua()}>Editar</button></div>`;
  if(e.kind==='load'||e.kind==='bw'||e.kind==='time')h+=`<div class="stat3"><div><span>Séries</span><b>${setsFor(e,p,w)}</b></div><div><span>${e.kind==='time'?'Segundos':'Repetições'}</span><b>${esc(String(e.reps||'—').replace('-',' a ').replace('–',' a '))}</b></div><div><span>Descanso</span><b>${esc(restTxt(e)||'—')}</b></div></div>${sobraTxt(e.rir)?`<p class="mu sm" style="margin:8px 0 0">${sobraTxt(e.rir)}${usesLoad(e)?' Ao completar o topo da faixa em todas as séries, a carga sobe na próxima vez.':''}</p>`:''}`;
  else h+=`<p class="sm" style="margin:6px 0 0">${tg.filter(Boolean).join(' · ')}</p>`;
  h+=`</div>`;
  if(m&&m.f)h+=`<p class="mu xs" style="margin:2px 2px 10px">${esc(MIDIA_CREDITO)} Textos do app Treino.</p>`;
  return h};
VIEWS.exedit=function({id,pid}){const p=planById(pid),f=exIn(p,id);if(!f)return hdr('Exercício','',true)+'<div class="empty">Não encontrado</div>';const e=f.e,w=U()?0:progOf(p).week,N=weeksOf(p);
  const a=`data-eid="${e.id}" data-pid="${p.id}"`;
  let h=hdr('Editar: '+e.name,`${esc(f.s.name)} · ${KIND_ICON[e.kind]} ${esc(KIND_LABEL[e.kind])}`,true);
  h+=`<div class="card"><label class="f" style="margin-top:0"><span>Nome</span><input data-ef="name" ${a} value="${esc(e.name)}"></label>
    <label class="f"><span>Tipo de registro</span>${sel('',Object.entries(KIND_LABEL),e.kind,`data-ef="kind" ${a}`)}</label>`;
  if(e.kind==='load'||e.kind==='bw'||e.kind==='time')h+=`<div class="grid3"><label class="f"><span>Séries</span><input data-ef="sets" ${a} inputmode="numeric" value="${e.sets}"></label><label class="f"><span>${e.kind==='time'?'Alvo (seg)':'Reps'}</span><input data-ef="reps" ${a} value="${esc(e.reps)}"></label><label class="f"><span>RIR</span><input data-ef="rir" ${a} value="${esc(e.rir||'')}"></label></div>
    <div class="grid3"><label class="f"><span>Descanso (texto)</span><input data-ef="rest" ${a} value="${esc(e.rest||'')}"></label><label class="f"><span>Timer (seg)</span><input data-ef="restSec" ${a} inputmode="numeric" value="${e.restSec||90}"></label>${usesLoad(e)?`<label class="f"><span>Incremento kg</span><input data-ef="inc" ${a} inputmode="decimal" value="${e.inc||2.5}"></label>`:''}</div>`;
  if(e.kind==='cardio'){const c=e.cardio||{};h+=`<div class="grid3"><label class="f"><span>Minutos</span><input data-ec="min" ${a} inputmode="decimal" value="${c.min??''}"></label><label class="f"><span>Km (opc.)</span><input data-ec="km" ${a} inputmode="decimal" value="${c.km??''}"></label><label class="f"><span>Zona</span><input data-ec="zone" ${a} value="${esc(c.zone||'')}"></label></div>`}
  if(e.kind==='wod'){const x=e.wod||{};h+=`<div class="grid2"><label class="f"><span>Formato</span>${sel('',[['AMRAP','AMRAP (rounds + reps)'],['ForTime','For Time (tempo)'],['EMOM','EMOM'],['MaxLoad','Carga máxima']],x.format,`data-ew="format" ${a}`)}</label><label class="f"><span>Time cap (min)</span><input data-ew="cap" ${a} inputmode="numeric" value="${x.cap??''}"></label></div>
    <label class="f"><span>Descrição do WOD</span><textarea data-ew="desc" ${a} rows="5" placeholder="ex: 21-15-9&#10;Thruster 43 kg&#10;Barra fixa">${esc(x.desc||'')}</textarea></label><button class="btn smb" data-act="go" data-v="picker" data-pid="${p.id}" data-sid="${f.s.id}" data-eid="${e.id}" data-mode="insert" ${ua()}>+ Inserir movimento do banco</button>`}
  h+=`<label class="f"><span>Dicas / execução</span><textarea data-ef="why" ${a} rows="2">${esc(e.why||'')}</textarea></label></div>`;
  if(usesLoad(e)){e.plan=e.plan||Array(N).fill(null);let k=0;
    h+=`<h3>Cargas planejadas (kg${e.kind==='bw'?' de lastro':''})</h3><div class="card"><label class="f" style="margin-top:0"><span>Carga-base (atual)</span><input data-pl="-1" ${a} inputmode="decimal" value="${e.base??''}"></label>
      <div class="grid3 plan">${p.phases.map(ph=>Array.from({length:ph.weeks},()=>{k++;return`<label class="pc-${esc(ph.color)}">S${k}${k===w?' • atual':''}<input data-pl="${k-1}" ${a} inputmode="decimal" value="${e.plan[k-1]??''}" ${k===w?'style="outline:2px solid var(--ac)"':''}></label>`}).join('')).join('')}</div>
      <div style="height:10px"></div><button class="btn block" data-act="genEx" ${a} ${ua()}>Gerar progressão a partir da base</button></div>`}
  if(!U())h+=`<button class="btn block" data-act="go" data-v="evo" data-id="${e.id}">Ver evolução deste exercício</button><div style="height:8px"></div>`;
  h+=`<button class="btn block" data-act="delEx" ${a} style="color:var(--bad)">Excluir exercício</button>`;
  return h};

/* ---------- banco de exercícios (picker) ---------- */
const PK={q:'',cat:'',grp:'',eq:''};
function pkBase(){return allCatalog().filter(c=>!PK.cat||(PK.cat==='Meus'?c.custom:c.cat===PK.cat))}
function pkResults(){const q=norm(PK.q).split(/\s+/).filter(Boolean);return pkBase().filter(c=>(!PK.grp||c.grp===PK.grp)&&(!PK.eq||c.eq===PK.eq)&&q.every(t=>norm(c.name+' '+c.grp+' '+c.eq).includes(t)))}
function lastUsed(cid){for(let i=S.logs.length-1;i>=0;i--){const L=S.logs[i];if(L.exercises.some(x=>x.cat===cid))return L.date}return null}
function agoTxt(d){if(!d)return'';const n=Math.round((Date.now()-pISO(d).getTime())/864e5);return n<=0?'usado hoje':n===1?'usado ontem':n<30?`usado há ${n} dias`:`usado em ${dshort(d)}`}
function pkList(prm){const r=pkResults();const a=`data-pid="${prm.pid}" data-sid="${prm.sid}" data-eid="${prm.eid||''}" data-mode="${prm.mode||''}" ${ua()}`;
  const p=planById(prm.pid),s=p&&sessIn(p,prm.sid),inS=new Set(s?s.exercises.map(e=>e.cat).filter(Boolean):[]);
  const fixed=prm.mode==='swap'||prm.mode==='insert';
  const row=c=>{const u=fotoDe(c.id,0),has=!fixed&&inS.has(c.id),lu=lastUsed(c.id);
    return`<div class="li3">${u?`<button class="thb" data-act="go" data-v="catex" data-cid="${esc(c.id)}" aria-label="Ver ${esc(c.name)}"><img class="thumb" src="${u}" alt="" loading="lazy" style="width:52px;height:52px"></button>`:`<span class="thumb ph" style="width:52px;height:52px">${KIND_ICON[c.kind]}</span>`}<span class="t"><b>${esc(c.name)}</b><span class="mu sm">${esc([c.grp,c.eq].filter(Boolean).join(' · '))}${lu?' · '+agoTxt(lu):''}${c.custom?' · ★ personalizado':''}</span></span>${has?`<span class="addb ok" aria-label="Já está no treino">✓</span>`:`<button class="addb" data-act="pick" data-cid="${esc(c.id)}" ${a} aria-label="${prm.mode==='swap'?'Trocar por':'Adicionar'} ${esc(c.name)}">${prm.mode==='swap'?'⇄':'+'}</button>`}</div>`};
  return`<div class="mu sm b" style="margin:2px 2px 6px">${r.length} resultado${r.length===1?'':'s'}</div>`+(r.length?'':'<div class="empty">Nada encontrado.</div>')+(r.length?`<div class="card list">${r.slice(0,120).map(row).join('')}</div>`:'')+(r.length>120?`<div class="mu sm">+${r.length-120} resultados — refine a busca</div>`:'')}
VIEWS.picker=function(prm){const cats=['','Musculação','Cardio','Core','Crossfit'].concat(CUSTOM_CAT.length?['Meus']:[]);const base=pkBase();
  const grps=[...new Set(base.map(c=>c.grp).filter(Boolean))].sort((x,y)=>x.localeCompare(y,'pt'));
  const eqs=[...new Set(base.filter(c=>!PK.grp||c.grp===PK.grp).map(c=>c.eq).filter(Boolean))].sort((x,y)=>x.localeCompare(y,'pt'));
  const p=planById(prm.pid),s=p&&sessIn(p,prm.sid),sw=prm.mode==='swap'&&p&&exIn(p,prm.eid);
  const title=prm.mode==='insert'?'Inserir movimento':sw?'Trocar exercício':'Adicionar exercício';
  const sub=sw?'no lugar de '+esc(sw.e.name):s?'ao '+esc(s.name)+' · '+allCatalog().length+' exercícios':allCatalog().length+' exercícios';
  const chip=(act,k,v,l)=>`<button class="chip ${PK[k]===v?'on':''}" data-act="${act}" data-k="${k}" data-c="${esc(v)}">${esc(l)}</button>`;
  let h=hdr(title,sub,true);
  h+=`<label class="srch"><span class="sr">Buscar exercício</span><input id="pkQ" placeholder="Buscar: supino, remo, prancha…" value="${esc(PK.q)}" autocomplete="off"></label>
    <div class="fl">Tipo</div><div class="chips">${cats.map(c=>chip('pkCat','cat',c,c||'Todos')).join('')}</div>
    ${grps.length>1?`<div class="fl">Músculo / grupo</div><div class="chips">${chip('pkSet','grp','','Todos')}${grps.map(g=>chip('pkSet','grp',g,g)).join('')}</div>`:''}
    ${eqs.length>1?`<div class="fl">Equipamento</div><div class="chips">${chip('pkSet','eq','','Todos')}${eqs.map(g=>chip('pkSet','eq',g,g)).join('')}</div>`:''}
    <div id="pkList" data-prm='${esc(JSON.stringify(prm))}'>${pkList(prm)}</div>
    ${prm.mode==='insert'||sw?'':`<button class="btn block" data-act="customEx" data-pid="${prm.pid}" data-sid="${prm.sid}" ${ua()} style="border-style:dashed">+ Criar exercício que não está na lista</button>`}`;
  return h};
function refreshPicker(){const el=$('#pkList');if(el)el.innerHTML=pkList(JSON.parse(el.dataset.prm))}

/* ---------- salvar (minha conta ou de outro usuário) ---------- */
function psave(){if(CTX.tpl){tplSave();return}if(CTX.lib&&MANAGE&&CTX.lib===MANAGE.lib){MANAGE.dirty=true;clearTimeout(mT);mT=setTimeout(saveManaged,700)}else save()}
let mT=null;
function planOf(d){return planById(d.pid)}
function bestInRange(itemId,planId,e,p){const[lo]=range(e.reps);let best=null;S.logs.filter(L=>L.planId===planId).forEach(L=>{if(phaseAt(p,L.week).mode==='deload')return;const x=L.exercises.find(x=>x.exId===itemId);if(x)doneSets(x).forEach(s=>{if(s.reps>=lo&&s.kg!=null&&(best==null||s.kg>best))best=s.kg})});return best}

Object.assign(ACT,{
  newPlan:()=>{const lib=LIB();const G=(window.MODELOS&&MODELOS.GOALS)||{};const T=tplPlans();
    const src=[['blank','Em branco (eu monto)']].concat(T.map(t=>['m:'+t.tpl.id,'Modelo: '+tplLabel(t)+' — '+t.name])).concat(lib.plans.map(p=>[p.id,'Copiar treinos de: '+p.name])).concat(U()&&myActive()?[['mine','Copiar treinos do MEU plano ativo']]:[]);
    modal('Novo plano',`<label class="f"><span>Nome</span><input id="npName" placeholder="ex: Hipertrofia 2027 — Bloco 1"></label><label class="f"><span>Objetivo</span>${sel('',Object.entries(G).map(([k,g])=>[k,g.name]),'massa','id="npGoal"')}</label><label class="f"><span>Treinos</span>${sel('',src,'blank','id="npSrc"')}</label><label class="f"><span>Periodização</span><select id="npTpl"><option value="auto">Automática pelo objetivo</option>${Object.entries(PERIOD_TEMPLATES).map(([k,t])=>`<option value="${k}">${esc(t.name)}</option>`).join('')}</select></label><p class="mu xs">O objetivo ajusta séries, repetições e descanso dos modelos. Depois você pode trocar exercícios, cargas e repetições à vontade.</p>`,
    [{label:'Cancelar'},{label:'Criar',cls:'pri',fn:()=>{const gk=$('#npGoal').value,pv=$('#npTpl').value,per=pv==='auto'?((G[gk]||{}).period||'hip12'):pv,sv=$('#npSrc').value,nm=$('#npName').value.trim();let p;
      if(sv.startsWith('m:')){const tp=T.find(t=>t.tpl.id===sv.slice(2));p=planFromTpl(tp,nm||(tp.name.split(' · ')[0]+' · '+((G[gk]||{}).name||'')),gk,per)}
      else{p=newPlan(nm||'Novo plano',per);const q=sv==='mine'?myActive():sv!=='blank'?planById(sv,lib):null;
        if(q){p.sessions=clone(q.sessions);if(sv!=='mine'){p.tips=clone(q.tips||[]);p.nutrition=clone(q.nutrition||[])}p.sessions.forEach(s=>s.exercises.forEach(e=>{if(usesLoad(e))e.plan=e.base!=null?genPlan(e.base,e.inc,p):Array(weeksOf(p)).fill(null)}))}}
      lib.plans.push(p);if(!planById(lib.activeId,lib))lib.activeId=p.id;psave();go('plan',{id:p.id,uid:U()});toast('Plano criado')}}])},
  activatePlan:d=>{const lib=LIB(),p=planOf(d);const done=()=>{lib.activeId=p.id;psave();render();toast(p.name+' agora é o plano ativo')};
    if(!U()&&S.prog[p.id]&&S.prog[p.id].week>1)modal('Tornar ativo',`Você já tinha avançado até a semana ${S.prog[p.id].week} neste plano.`,[{label:'Recomeçar na S1',fn:()=>{S.prog[p.id]={week:1,round:(S.prog[p.id].round||1)+1};done()}},{label:'Continuar',cls:'pri',fn:done}]);
    else if(S.active&&!U())toast('Finalize o treino em andamento antes');else done()},
  dupPlan:d=>{const lib=LIB(),p=planOf(d);const c=clone(p);c.id=uid36('p');c.name=p.name+' (cópia)';c.created=Date.now();lib.plans.push(c);psave();V.stack.pop();go('plan',{id:c.id,uid:U()});toast('Plano duplicado')},
  delPlan:d=>{const lib=LIB(),p=planOf(d);const nLogs=U()?0:S.logs.filter(L=>L.planId===p.id).length;
    confirmBox('Excluir plano',`Excluir <b>${esc(p.name)}</b>?${nLogs?` Os ${nLogs} treinos já registrados continuam no histórico.`:''}`,'Excluir',()=>{lib.plans=lib.plans.filter(x=>x!==p);if(lib.activeId===p.id)lib.activeId=lib.plans[0]?lib.plans[0].id:null;psave();V.stack.pop();render()},true)},
  addSess:d=>{const p=planOf(d);const id=uid36('s');p.sessions.push({id,name:'Treino '+String.fromCharCode(65+p.sessions.length),groups:'',duration:'',notes:'',cardio:'',exercises:[]});psave();go('sessedit',{id,pid:p.id,uid:U()})},
  dupSess:d=>{const p=planOf(d),s=sessIn(p,d.sid);const c=clone(s);c.id=uid36('s');c.name=s.name.replace(/\s([A-Z])$/,(m,l)=>' '+String.fromCharCode(l.charCodeAt(0)+1));if(c.name===s.name)c.name+=' (2)';c.exercises.forEach(e=>e.id=uid36('e'));
    p.sessions.splice(p.sessions.indexOf(s)+1,0,c);psave();V.stack.pop();go('session',{id:c.id,pid:p.id,uid:U()});toast('Treino duplicado — renomeie se quiser')},
  delSess:d=>{const p=planOf(d),s=sessIn(p,d.sid);confirmBox('Excluir treino',`Remover <b>${esc(s.name)}</b> e seus ${s.exercises.length} exercício(s)? Os registros antigos continuam no histórico.`,'Excluir',()=>{p.sessions=p.sessions.filter(x=>x!==s);psave();while(topV()&&['session','sessedit'].includes(topV().view)&&topV().params.id===s.id)V.stack.pop();render()},true)},
  moveSess:d=>{const a=planOf(d).sessions,i=+d.i,k=i+(+d.d);if(k<0||k>=a.length)return;[a[i],a[k]]=[a[k],a[i]];psave();render()},
  moveEx:d=>{const s=sessIn(planOf(d),d.sid),i=+d.i,k=i+(+d.d);if(k<0||k>=s.exercises.length)return;const X=s.exercises,lo=Math.min(i,k);[lo-1,lo,lo+1].forEach(q=>{if(X[q])delete X[q].link});[X[i],X[k]]=[X[k],X[i]];psave();render()},
  linkEx:d=>{const X=sessIn(planOf(d),d.sid).exercises,e=X[+d.i];if(!e||+d.i>=X.length-1)return;if(e.link)delete e.link;else{e.link=true;toast(chainName(chainAt(X,+d.i).len)+': '+e.name+' + '+X[+d.i+1].name)}psave();render()},
  delEx:d=>{const f=exIn(planOf(d),d.eid);confirmBox('Excluir exercício',`Remover <b>${esc(f.e.name)}</b> de ${esc(f.s.name)}? Os registros antigos continuam no histórico.`,'Excluir',()=>{f.s.exercises=f.s.exercises.filter(e=>e!==f.e);psave();while(topV()&&['exercise','exedit'].includes(topV().view)&&topV().params.id===d.eid)V.stack.pop();if(SE.open===d.eid)SE.open='';render()},true)},
  genEx:d=>{const p=planOf(d),e=exIn(p,d.eid).e;if(e.base==null){toast('Preencha a carga-base primeiro');return}const np=genPlan(e.base,e.inc||2.5,p);
    confirmBox('Gerar progressão',`<p>${esc(e.name)} · base ${fkg(e.base)} kg · incremento ${fkg(e.inc||2.5)} kg</p>${diffTable(np.map((v,k)=>[`S${k+1}`,fkg(e.plan[k]),v!==e.plan[k]?`<b>${fkg(v)}</b>`:fkg(v)]),['Sem','Atual','Novo'])}`,'Substituir plano',()=>{e.plan=np;psave();render();toast('Progressão gerada')})},
  genAll:d=>{const p=planOf(d);const ch=[],rows=[];const N=weeksOf(p);p.sessions.forEach(s=>s.exercises.forEach(e=>{if(!usesLoad(e)||e.base==null)return;const np=genPlan(e.base,e.inc||2.5,p);const n=np.filter((v,k)=>v!==(e.plan||[])[k]).length;if(n){ch.push([e,np]);rows.push([esc(e.name),fkg((e.plan||[])[N-2]),`<b>${fkg(np[N-2])}</b>`,n])}}));
    if(!ch.length){toast('Nada a alterar — os planos já seguem as regras (exercícios sem carga-base ficam como estão)');return}
    confirmBox('Regerar cargas',`<p>${ch.length} exercício(s) terão as cargas substituídas. Sem carga-base ficam como estão.</p>${diffTable(rows,['Exercício',`S${N-1} atual`,`S${N-1} novo`,'Semanas'])}`,'Substituir',()=>{ch.forEach(([e,np])=>e.plan=np);psave();render();toast('Cargas regeradas')},true)},
  applyTpl:d=>{const p=planOf(d),k=$('#tplSel').value,t=PERIOD_TEMPLATES[k];confirmBox('Aplicar modelo',`As fases de <b>${esc(p.name)}</b> serão trocadas por <b>${esc(t.name)}</b> (${t.phases.reduce((a,x)=>a+x.weeks,0)} semanas). Depois, use "Regerar cargas".`,'Aplicar',()=>{p.phases=clone(t.phases);p.repeat=!!t.repeat;p.weekNotes=[];fitPlans(p);psave();render()})},
  addPh:d=>{const p=planOf(d);p.phases.push({name:'Nova fase',weeks:2,rir:'2',mode:'inc',step:1,hold:0,vol:1,color:PHASE_COLORS[p.phases.length%PHASE_COLORS.length][0],focus:''});fitPlans(p);psave();render()},
  delPh:d=>{const p=planOf(d);if(p.phases.length<2){toast('O plano precisa de pelo menos uma fase');return}const ph=p.phases[+d.k];confirmBox('Excluir fase',`Remover a fase <b>${esc(ph.name)}</b> (${ph.weeks} semanas)?`,'Excluir',()=>{p.phases.splice(+d.k,1);p.weekNotes=[];fitPlans(p);psave();render()},true)},
  movePh:d=>{const a=planOf(d).phases,i=+d.k,k=i+(+d.d);if(k<0||k>=a.length)return;[a[i],a[k]]=[a[k],a[i]];planOf(d).weekNotes=[];psave();render()},
  pkCat:d=>{PK.cat=d.c;PK.grp='';PK.eq='';render()},
  pkSet:d=>{PK[d.k]=d.c;if(d.k==='grp')PK.eq='';render()},
  pick:d=>{const c=allCatalog().find(x=>x.id===d.cid);const p=planOf(d);if(!c||!p)return;
    if(d.mode==='insert'){const e=exIn(p,d.eid).e;e.wod.desc=(e.wod.desc?e.wod.desc.replace(/\s*$/,'')+'\n':'')+c.name;psave();V.stack.pop();render();toast('Movimento inserido');return}
    if(d.mode==='swap'){const f=exIn(p,d.eid);if(!f)return;const e=f.e;const old=e.name;e.name=c.name;e.cat=c.id;if(e.kind!==c.kind){const df=defaultsFor(c.kind);e.kind=c.kind;if(c.kind==='cardio')e.cardio=df.cardio;if(c.kind==='wod')e.wod=df.wod;if(!e.sets)e.sets=df.sets;if(usesLoad(e)&&!e.plan)e.plan=Array(weeksOf(p)).fill(null)}psave();V.stack.pop();render();toast(old+' → '+c.name);return}
    const s=sessIn(p,d.sid);const it=makeItem(c,p);s.exercises.push(it);psave();V.stack.pop();afterAdd(it,p)},
  customEx:d=>{const isM=ME.role==='master';modal('Novo exercício',`<label class="f"><span>Nome</span><input id="cxName"></label><div class="grid2"><label class="f"><span>Categoria</span>${sel('',['Musculação','Cardio','Core','Crossfit'].map(x=>[x,x]),'Musculação','id="cxCat"')}</label><label class="f"><span>Tipo de registro</span>${sel('',Object.entries(KIND_LABEL),'load','id="cxKind"')}</label></div><div class="grid2"><label class="f"><span>Grupo</span><input id="cxGrp" placeholder="ex: Peito"></label><label class="f"><span>Equipamento</span><input id="cxEq" placeholder="ex: Máquina"></label></div><p class="mu xs">${isM?'Como master, ele entra no banco de exercícios para todos os usuários.':'Ele será adicionado a este treino.'}</p>`,
    [{label:'Cancelar'},{label:'Criar',cls:'pri',keep:true,fn:busy(async()=>{const c={name:$('#cxName').value.trim(),cat:$('#cxCat').value,kind:$('#cxKind').value,grp:$('#cxGrp').value.trim()||'Outros',eq:$('#cxEq').value.trim()||'—',custom:true};if(!c.name)throw new Error('Informe o nome');
      if(isM&&SB&&navigator.onLine){const{data,error}=await SB.from('exercise_catalog').insert({name:c.name,category:c.cat,grp:c.grp,equipment:c.eq,kind:c.kind,created_by:ME.id}).select().single();if(error)throw new Error('Não salvou no banco: '+friendlyErr(error));c.id='u_'+data.id;CUSTOM_CAT.push(c);try{localStorage.setItem('treino.cat',JSON.stringify(CUSTOM_CAT))}catch(e){}}
      else c.id='x_'+uid36();
      $('#modal').hidden=true;ACT.pick({cid:c.id,pid:d.pid,sid:d.sid,uid:d.uid,_c:c})})}])},
  repeatPlan:()=>{const p=myActive();if(!p)return;const rows=[],ch=[];p.sessions.forEach(s=>s.exercises.forEach(e=>{if(!usesLoad(e))return;const b=bestInRange(e.id,p.id,e,p);const nb=b!=null?rstep(b*0.9,e.inc||2.5):e.base;if(nb==null)return;ch.push([e.id,nb]);rows.push([esc(e.name),fkg(e.base),`<b>${fkg(nb)}</b>`,b!=null?'90% do melhor ('+fkg(b)+')':'base atual'])}));
    confirmBox('Novo ciclo com cargas atualizadas',`<p>Cria uma cópia de <b>${esc(p.name)}</b>, começando na semana 1. Nova carga-base = <b>90% da maior carga</b> que você fez dentro da faixa de reps (fora do deload). O plano atual fica guardado.</p>${diffTable(rows,['Exercício','Base atual','Nova base','Origem'])}`,'Criar novo ciclo',()=>{
      const c=clone(p);c.id=uid36('p');const m=p.name.match(/· ciclo (\d+)$/);c.name=m?p.name.replace(/\d+$/,+m[1]+1):p.name+' · ciclo 2';c.created=Date.now();
      ch.forEach(([id,nb])=>{const e=exIn(c,id).e;e.base=nb;e.plan=genPlan(nb,e.inc||2.5,c)});S.lib.plans.push(c);S.lib.activeId=c.id;S.prog[c.id]={week:1};save();V.tab='hoje';V.stack=[];render();toast('Novo ciclo criado')})},
});
// pick com exercício recém-criado (não está no catálogo)
const _pick=ACT.pick;ACT.pick=d=>{if(d._c&&!allCatalog().some(x=>x.id===d._c.id)){const p=planOf(d),s=sessIn(p,d.sid);const it=makeItem(d._c,p);s.exercises.push(it);psave();V.stack.pop();afterAdd(it,p);return}_pick(d)};

/* ---------- PERFIL CORPORAL e GASTO CALÓRICO ESTIMADO ----------
   Metabolismo basal: Mifflin-St Jeor. Gasto: MET corrigido pelo metabolismo (1 MET = TMB/24 por hora).
   Cardio com FC média: fórmula de Keytel (2005). Valores são estimativas (±20–30%). */
/* nome de exibição: um só lugar (profiles.name), usado no perfil, na avaliação e na lista de usuários */
async function setProfileName(uid,name){name=String(name||'').replace(/\s+/g,' ').trim().slice(0,80);if(name.length<2)throw new Error('Informe o nome (mínimo 2 letras)');
  const{data,error}=await SB.from('profiles').update({name}).eq('id',uid).select('id');if(error)throw new Error(friendlyErr(error));if(!data||!data.length)throw new Error('sem permissão para alterar este nome');
  if(ME&&uid===ME.id){ME.name=name;localStorage.setItem('treino.me',JSON.stringify(ME))}
  if(typeof USERS!=='undefined'&&USERS&&USERS.list){const u=USERS.list.find(x=>x.id===uid);if(u)u.name=name}return name}
window.setProfileName=setProfileName;
/* perfil corporal ← avaliações: preenche só o que está vazio e acrescenta o peso de cada avaliação nova */
function bodyFromAv(){if(!ME||!window.AV||!AV.mine)return;const m=AV.mine();if(!m||!m.list||!m.list.length)return;const B=bodyOf();if(B.avSync===m.list[0].id)return;
  let ch=false;const L=m.list[0],a=L.answers||{};
  if(!B.sex&&(a.sex==='M'||a.sex==='F')){B.sex=a.sex;ch=true}
  if(!B.birth&&/^\d{4}-\d{2}-\d{2}$/.test(a.birth||'')){B.birth=a.birth;ch=true}
  if(!B.height&&+L.height_cm){B.height=Math.round(+L.height_cm);ch=true}
  B.weights=B.weights||[];
  for(const x of m.list){if(x.id===B.avSync)break;const kg=+x.weight_kg,d=iso(new Date(x.created_at));if(kg&&!B.weights.some(w=>w.date===d)){B.weights.push({date:d,kg:r2(kg)});ch=true}}
  B.avSync=L.id;save();if(ch)setTimeout(render,0)}
window.bodyFromAvPrefill=()=>{const B=bodyOf(),w=weightAt(B);return{name:ME&&ME.name||'',sex:B.sex||'',birth:B.birth?isoToBR(B.birth):'',height:B.height?String(B.height):'',weight:w?String(w).replace('.',','):''}};
function bodyOf(st){st=st||S;if(!st.body)st.body={sex:'',birth:'',height:null,weights:[]};return st.body}
function ageAt(birth,dateISO){if(!birth)return null;const d=dateISO?pISO(dateISO):new Date(),b=pISO(birth);let a=d.getFullYear()-b.getFullYear();if(d.getMonth()<b.getMonth()||(d.getMonth()===b.getMonth()&&d.getDate()<b.getDate()))a--;return a}
function weightsSorted(B){return(B.weights||[]).filter(w=>w&&w.kg).slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)}
function weightAt(B,dateISO){const w=weightsSorted(B);let v=null;for(const x of w)if(!dateISO||x.date<=dateISO)v=x.kg;return v??(w[0]?w[0].kg:null)}
function bmrOf(B,dateISO){const w=weightAt(B,dateISO),h=+B.height,a=ageAt(B.birth,dateISO);if(!w||!h||a==null||!B.sex)return null;return 10*w+6.25*h-5*a+(B.sex==='F'?-161:5)}
function hrFrom(z){const m=String(z||'').match(/(\d{2,3})/);const v=m?+m[1]:null;return v&&v>=60&&v<=220?v:null}
function firstNum(s){const m=String(s||'').match(/\d+([.,]\d+)?/);return m?num(m[0]):null}
const CARDIO_MET=[[/air bike|assault/i,10],[/corda/i,11],[/spinning|bike indoor/i,8.5],[/bicicleta|ergom|ciclismo/i,6.8],[/el[íi]ptico|transport/i,5],[/escada|stair|step/i,9],[/remo/i,7],[/ski/i,7],[/hidro/i,4],[/nata[çc][ãa]o/i,7],[/tabata|hiit|tiro|intervalado/i,8.5],[/polichinelo/i,8],[/dan[çc]a|zumba/i,6.5],[/boxe|muay/i,7.8],[/futebol|coletivo/i,7],[/t[êe]nis/i,6],[/trilha|hiking/i,6],[/zona 2/i,5.5],[/inclinada/i,6],[/caminhada/i,3.5],[/corrida|run/i,9]];
function cardioMet(name,c){const n=String(name||'');
  if(c.km&&c.min){const v=c.km/(c.min/60);
    if(/bicicleta|bike|ciclismo|spinning|ergom/i.test(n))return v<16?4:v<19?6:v<22?8:v<25?10:12;
    if(/corrida|caminhada|esteira|run|trilha|zona 2/i.test(n)){const mm=v*1000/60;return(v<8?0.1*mm+3.5+(/inclinada/i.test(n)?7:0):0.2*mm+3.5)/3.5}}
  for(const[r,m]of CARDIO_MET)if(r.test(n))return m;return 6}
function strengthMet(rir){return rir==null?5:rir<=1?6:rir<=3?5:3.5}
/* W = treino registrado (log) ou em andamento (active). Retorna {total, active, min, hr} ou null sem perfil. */
function workoutKcal(W,B,live){B=B||bodyOf();const r=bmrOf(B,W.date);if(!r)return null;const kph=r/24;const p=planById(W.planId,S.lib);
  const item=x=>p&&exIn(p,x.exId)?exIn(p,x.exId).e:null;
  let dur=live?elapsedMs(W)/60000:(W.durationSec!=null?W.durationSec/60:((W.finishedAt||0)-(W.startedAt||0))/60000);const durOk=dur>=3&&dur<=300;
  let used=0,total=0,hrUsed=false,nSets=0,rirSum=0,rirN=0,restGuess=0;
  for(const x of W.exercises){const k=x.kind||'load';
    if(k==='cardio'){if(live&&!x.done)continue;const c=x.cardio||{};const m=+c.min||0;if(!m)continue;const hr=hrFrom(c.zone),w=weightAt(B,W.date),a=ageAt(B.birth,W.date);
      if(hr&&w&&a!=null){const kpm=B.sex==='F'?(-20.4022+0.4472*hr-0.1263*w+0.074*a)/4.184:(-55.0969+0.6309*hr+0.1988*w+0.2017*a)/4.184;total+=Math.max(kpm,kph/60)*m;hrUsed=true}
      else total+=cardioMet(x.name,c)*kph*m/60;used+=m}
    else if(k==='wod'){if(live&&!x.done)continue;const w=x.wod||{},e=item(x);const cap=(e&&e.wod&&+e.wod.cap)||12;
      const m=w.format==='ForTime'&&w.time?w.time/60:w.format==='MaxLoad'?10:cap;total+=(w.format==='MaxLoad'?6:9)*kph*m/60;used+=m}
    else if(k==='time'){const d=doneSets(x);if(!d.length)continue;const e=item(x);const rest=((e&&+e.restSec)||60)/60;const m=d.reduce((a,s)=>a+(+s.sec||30),0)/60+rest*Math.max(0,d.length-1);total+=3.8*kph*m/60;used+=m}
    else{const d=doneSets(x);if(!d.length)continue;const e=item(x);nSets+=d.length;restGuess+=d.length*(0.75+((e&&+e.restSec)||90)/60);d.forEach(s=>{if(s.rir!=null){rirSum+=+s.rir;rirN++}})}}
  let smin=0;if(nSets){smin=durOk||live?Math.max(dur-used,0):0;if(!live&&(!durOk||smin<nSets*0.75))smin=Math.max(smin,restGuess);
    let rir=rirN?rirSum/rirN:null;if(rir==null&&p)rir=firstNum(phaseAt(p,W.week).rir);total+=strengthMet(rir)*kph*smin/60}
  const mins=used+smin;if(!mins)return{total:0,active:0,min:0,hr:false};
  return{total:Math.round(total),active:Math.max(0,Math.round(total-kph*mins/60)),min:Math.round(mins),hr:hrUsed}}
function kcalTxt(k){return k?`~${k.total.toLocaleString('pt-BR')} kcal`:''}
function weekKcal(p){const B=bodyOf();const w=progOf(p).week,r=progOf(p).round||1;let s=0,any=false;S.logs.filter(L=>L.planId===p.id&&L.week===w&&(L.round||1)===r).forEach(L=>{const k=workoutKcal(L,B);if(k){s+=k.total;any=true}});return any?s:null}

/* ---------- gráfico de peso ---------- */
function weightChart(B){const w=weightsSorted(B).slice(-40);if(w.length<2)return w.length?`<div class="mu sm">Registre mais pesagens para ver o gráfico.</div>`:'';
  const W=340,H=160,pl=36,pr=10,pt=12,pb=24;const t0=pISO(w[0].date).getTime(),t1=pISO(w[w.length-1].date).getTime()||t0+1;
  let mn=Math.min(...w.map(x=>x.kg)),mx=Math.max(...w.map(x=>x.kg));if(mx-mn<2){mn-=1;mx+=1}
  const X=d=>pl+(W-pl-pr)*((pISO(d).getTime()-t0)/Math.max(1,t1-t0)),Y=v=>pt+(H-pt-pb)*(1-(v-mn)/(mx-mn));
  let g='';for(let k=0;k<=2;k++){const v=mn+(mx-mn)*k/2;g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2b303b"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end" font-size="10" fill="#9097a6">${fnum(v,1)}</text>`}
  const d=w.map((x,i)=>(i?'L':'M')+X(x.date).toFixed(1)+' '+Y(x.kg).toFixed(1)).join('');
  return`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peso corporal">${g}<text x="${pl}" y="${H-4}" font-size="10" fill="#9097a6">${dshort(w[0].date)}</text><text x="${W-pr}" y="${H-4}" text-anchor="end" font-size="10" fill="#9097a6">${dshort(w[w.length-1].date)}</text><path d="${d}" fill="none" stroke="#3fd1c8" stroke-width="2.5"/>${w.map(x=>`<circle cx="${X(x.date)}" cy="${Y(x.kg)}" r="3.5" fill="#3fd1c8"/>`).join('')}</svg>`}
function bodySummary(B,editable){const w=weightsSorted(B),last=w[w.length-1],a=ageAt(B.birth),r=bmrOf(B);
  const first=w[0];const diff=last&&first&&last!==first?r2(last.kg-first.kg):null;
  return`<div class="stat"><div><b>${last?fnum(last.kg,1):'—'}</b><span>peso (kg)${last?' · '+dshort(last.date):''}</span></div><div><b>${diff!=null?(diff>0?'+':'')+fnum(diff,1):'—'}</b><span>variação desde ${first?dshort(first.date):'—'}</span></div><div><b>${r?Math.round(r).toLocaleString('pt-BR'):'—'}</b><span>metabolismo basal (kcal/dia)</span></div></div>
    ${a!=null||B.height?`<div class="mu sm" style="margin-top:6px">${B.sex==='F'?'Feminino':B.sex==='M'?'Masculino':''}${a!=null?' · '+a+' anos':''}${B.height?' · '+B.height+' cm':''}</div>`:''}`}

/* ---------- ANAMNESE E AVALIAÇÃO FÍSICA ----------
   Guardada no documento de planos (lib.anam) para que o usuário e o master possam editar.
   IMC (OMS) · RCQ (OMS) · Relação cintura/estatura · %G por dobras (Jackson & Pollock 3/7 + Siri)
   ou fita métrica (Marinha dos EUA) · FC máx (Tanaka) · zonas por FC de reserva (Karvonen). */
const PARQ=['Algum médico já disse que você tem problema no coração ou pressão alta?',
 'Você sente dor no peito em repouso, nas atividades do dia a dia ou durante atividade física?',
 'Você perde o equilíbrio por tontura ou perdeu a consciência nos últimos 12 meses?',
 'Você já foi diagnosticado com outra doença crônica (além de coração ou pressão alta)?',
 'Você toma atualmente remédios receitados para alguma doença crônica?',
 'Você tem (ou teve nos últimos 12 meses) problema em ossos, articulações ou tecidos moles que possa piorar com atividade física?',
 'Algum médico já disse que você só deve fazer atividade física com supervisão médica?'];
const CIRC=[['neck','Pescoço'],['chest','Peitoral'],['waist','Cintura'],['abdomen','Abdômen (umbigo)'],['hip','Quadril'],['arm','Braço contraído'],['forearm','Antebraço'],['thigh','Coxa'],['calf','Panturrilha']];
const FOLDS=[['chest','Peitoral'],['midax','Axilar média'],['triceps','Tríceps'],['subscap','Subescapular'],['abd','Abdominal'],['suprail','Suprailíaca'],['thigh','Coxa']];
const JP3={M:['chest','abd','thigh'],F:['triceps','suprail','thigh']};
const ANM={};let ANM_TAB='res';
function anamOf(lib){lib=lib||S.lib;if(!lib.anam)lib.anam={health:{parq:[],obj:'',cond:'',inj:'',meds:'',surg:'',smoke:'',act:'',notes:''},evals:[],sex:'',birth:''};lib.anam.evals=lib.anam.evals||[];lib.anam.health=lib.anam.health||{parq:[]};return lib.anam}
/* contexto: próprio usuário ou usuário gerenciado pelo master */
function anamCtx(uid){if(!uid||uid===ME.id)return{self:true,lib:S.lib,body:bodyOf(),name:ME.name};const m=ANM[uid];return m&&m.lib?{self:false,uid,lib:m.lib,body:m.body||{},name:m.name}:null}
function anamBasics(c,a){const B=c.body||{};return{sex:B.sex||a.sex||'',birth:B.birth||a.birth||'',height:+B.height||null}}
function anamSave(c){if(c.self){commit();return}const m=ANM[c.uid];m.dirty=true;saveAnamRemote(c.uid)}
async function saveAnamRemote(uid){const m=ANM[uid];if(!m||!m.dirty)return;if(!navigator.onLine){toast('Sem internet — anamnese de '+m.name+' NÃO foi salva');return}
  const{data,error}=await SB.from('user_docs').select('program').eq('user_id',uid).maybeSingle();if(error){toast(friendlyErr(error));return}
  const lib=libFrom(data&&data.program)||emptyLib();lib.anam=m.lib.anam;
  const{error:e2}=await SB.from('user_docs').update({program:lib,program_edited:Date.now()}).eq('user_id',uid);if(e2){toast('Erro ao salvar: '+friendlyErr(e2));return}
  m.dirty=false;m.lib=lib;toast('Salvo para '+m.name)}
async function openAnamFor(u){if(!navigator.onLine){toast('Precisa de internet');return}
  const{data,error}=await SB.from('user_docs').select('program,state').eq('user_id',u.id).maybeSingle();if(error){toast(friendlyErr(error));return}
  ANM[u.id]={name:u.name,lib:libFrom(data&&data.program)||emptyLib(),body:(data&&data.state&&data.state.body)||{},dirty:false};ANM_TAB='res';go('anam',{uid:u.id})}

/* ---------- cálculos ---------- */
function r1(v){return Math.round(v*10)/10}
function imcOf(kg,cm){if(!kg||!cm)return null;const v=kg/Math.pow(cm/100,2);
  const c=v<18.5?['Abaixo do peso','warn']:v<25?['Peso normal','ok']:v<30?['Sobrepeso','warn']:v<35?['Obesidade grau I','bad']:v<40?['Obesidade grau II','bad']:['Obesidade grau III','bad'];return{v:r1(v),txt:c[0],c:c[1]}}
function rcqOf(w,h,sex){if(!w||!h||!sex)return null;const v=w/h,lim=sex==='F'?0.85:0.90;return{v:Math.round(v*100)/100,txt:v>=lim?'Risco aumentado':'Adequado',c:v>=lim?'bad':'ok',lim}}
function rceOf(w,cm){if(!w||!cm)return null;const v=w/cm;return{v:Math.round(v*100)/100,txt:v>=0.6?'Risco alto':v>=0.5?'Risco aumentado':'Adequado',c:v>=0.6?'bad':v>=0.5?'warn':'ok'}}
function bfFolds(E,sex,age){const f=E.folds||{},P=E.protocol||'jp3';if(!sex||age==null)return null;const keys=P==='jp7'?FOLDS.map(x=>x[0]):JP3[sex];
  const vals=keys.map(k=>+f[k]);if(vals.some(v=>!v))return null;const s=vals.reduce((a,b)=>a+b,0);let D;
  if(P==='jp7')D=sex==='M'?1.112-0.00043499*s+0.00000055*s*s-0.00028826*age:1.097-0.00046971*s+0.00000056*s*s-0.00012828*age;
  else D=sex==='M'?1.10938-0.0008267*s+0.0000016*s*s-0.0002574*age:1.0994921-0.0009929*s+0.0000023*s*s-0.0001392*age;
  return{v:r1(495/D-450),sum:r1(s),method:P==='jp7'?'Dobras · Jackson & Pollock 7':'Dobras · Jackson & Pollock 3'}}
function bfTape(E,sex,cm){const c=E.circ||{},n=+c.neck,w=+(sex==='M'?(c.abdomen||c.waist):c.waist),hp=+c.hip;if(!sex||!cm||!n||!w)return null;let v;
  if(sex==='M'){if(w<=n)return null;v=495/(1.0324-0.19077*Math.log10(w-n)+0.15456*Math.log10(cm))-450}
  else{if(!hp||w+hp<=n)return null;v=495/(1.29579-0.35004*Math.log10(w+hp-n)+0.221*Math.log10(cm))-450}
  return v>0&&v<70?{v:r1(v),method:'Fita métrica · Marinha dos EUA'}:null}
function bfClass(v,sex){const t=sex==='F'?[[14,'Essencial','warn'],[21,'Atleta','ok'],[25,'Bom','ok'],[32,'Médio','warn'],[999,'Acima do ideal','bad']]:[[6,'Essencial','warn'],[14,'Atleta','ok'],[18,'Bom','ok'],[25,'Médio','warn'],[999,'Acima do ideal','bad']];for(const[l,n,c]of t)if(v<l)return{txt:n,c}}
function evalCalc(E,k){const sex=k.sex,age=ageAt(k.birth,E.date),cm=+E.height||k.height,kg=+E.weight||null,c=E.circ||{};
  const bf=bfFolds(E,sex,age)||bfTape(E,sex,cm);const out={age,cm,kg,imc:imcOf(kg,cm),rcq:rcqOf(+c.waist,+c.hip,sex),rce:rceOf(+c.waist,cm),bf};
  if(bf&&kg){out.fat=r1(kg*bf.v/100);out.lean=r1(kg-out.fat);out.bfc=bfClass(bf.v,sex)}
  if(age!=null){const fcm=Math.round(208-0.7*age),rhr=+E.rhr||null;out.fcmax=fcm;out.rhr=rhr;
    out.zones=[[50,60,'Z1 · Recuperação'],[60,70,'Z2 · Base aeróbica'],[70,80,'Z3 · Aeróbico moderado'],[80,90,'Z4 · Limiar'],[90,100,'Z5 · Máximo']].map(([a,b,n])=>[n,rhr?Math.round(rhr+(fcm-rhr)*a/100):Math.round(fcm*a/100),rhr?Math.round(rhr+(fcm-rhr)*b/100):Math.round(fcm*b/100)])}
  return out}
function parqAlert(H){return(H.parq||[]).some(x=>x===true)}

/* ---------- telas ---------- */
const clr=c=>c==='ok'?'var(--ok)':c==='bad'?'var(--bad)':'var(--warn)';
function kv(l,v,s,c){return`<div class="row" style="padding:7px 0;border-top:1px solid var(--s3);align-items:flex-start;gap:10px"><span class="sp" style="flex:1 0 40%;min-width:40%">${l}</span><span style="text-align:right;flex:0 1 auto"><b style="white-space:nowrap">${v}</b>${s?`<div class="xs" style="color:${clr(c)}">${s}</div>`:''}</span></div>`}
function dl(a,b,inv){if(a==null||b==null)return'';const d=r1(a-b);if(!d)return'<span class="mu xs"> =</span>';const good=inv?d<0:d>0;return` <span class="xs" style="color:${good?'var(--ok)':'var(--warn)'}">${d>0?'+':''}${String(d).replace('.',',')}</span>`}
const fz=v=>v==null?'—':String(v).replace('.',',');
VIEWS.anam=function({uid}){const c=anamCtx(uid);if(!c)return hdr('Anamnese','',true)+'<div class="empty">Carregando…</div>';const a=anamOf(c.lib),k=anamBasics(c,a);
  if(ME.role!=='master')ANM_TAB='res';let h=hdr('Avaliação física',c.self?'Medidas e composição corporal':'de '+esc(c.name),true);
  h+=ME.role!=='master'?'':`<div class="seg">${[['res','Resultados'],['aval','Nova medição'],['saude','Saúde (anamnese)']].map(([t,l])=>`<button class="${ANM_TAB===t?'on':''}" data-act="anTab" data-t="${t}" data-uid="${uid||''}">${l}</button>`).join('')}</div>`;
  if(parqAlert(a.health))h+=`<div class="sug down" style="margin:10px 0 0">⚠️ Há resposta <b>"Sim"</b> no questionário de saúde. Recomenda-se avaliação médica antes de aumentar a intensidade dos treinos.</div>`;
  const hasH=k.height||a.evals.some(x=>x.height);const miss=[!k.sex&&'sexo',!k.birth&&'data de nascimento',!hasH&&'altura'].filter(Boolean);
  if(ANM_TAB==='saude')return h+anamHealthForm(a,k,uid);
  if(ANM_TAB==='aval')return h+anamEvalForm(a,k,uid,c);
  const ev=a.evals.slice().sort((x,y)=>x.date<y.date?1:-1);
  if(miss.length)h+=`<div class="card sm mu">Para todos os cálculos falta: <b>${miss.join(', ')}</b>. Preencha na aba <b>Saúde</b>${!hasH?' (a altura vai na avaliação)':''}.</div>`;
  if(!ev.length)return h+(ME.role==='master'?`<div class="empty">Nenhuma medição ainda.<div style="height:10px"></div><button class="btn pri" data-act="anTab" data-t="aval" data-uid="${uid||''}">+ Nova medição</button></div>`:`<div class="empty">Nenhuma avaliação física ainda. Seu treinador registra aqui suas medidas.</div>`);
  const E=ev[0],R=evalCalc(E,k),P=ev[1]?evalCalc(ev[1],k):null;
  h+=`<h3>Avaliação de ${isoToBR(E.date)}${P?` <span class="mu xs" style="text-transform:none;letter-spacing:0">vs ${isoToBR(ev[1].date)}</span>`:''}</h3><div class="card" style="padding:6px 14px">`;
  h+=kv('Peso',R.kg?fz(R.kg)+' kg'+(P?dl(R.kg,P.kg,true):''):'—');
  if(R.imc)h+=kv('IMC',fz(R.imc.v)+(P&&P.imc?dl(R.imc.v,P.imc.v,true):''),R.imc.txt,R.imc.c);
  if(R.bf)h+=kv('% de gordura',fz(R.bf.v)+' %'+(P&&P.bf?dl(R.bf.v,P.bf.v,true):''),(R.bfc?R.bfc.txt+' · ':'')+R.bf.method,R.bfc?R.bfc.c:'');
  if(R.fat!=null)h+=kv('Massa gorda',fz(R.fat)+' kg'+(P&&P.fat!=null?dl(R.fat,P.fat,true):''))+kv('Massa magra',fz(R.lean)+' kg'+(P&&P.lean!=null?dl(R.lean,P.lean):''));
  if(R.rcq)h+=kv('Relação cintura/quadril',fz(R.rcq.v),R.rcq.txt+` (limite ${fz(R.rcq.lim)})`,R.rcq.c);
  if(R.rce)h+=kv('Relação cintura/altura',fz(R.rce.v),R.rce.txt,R.rce.c);
  if(!R.bf)h+=`<div class="mu xs" style="padding:8px 0">% de gordura: informe as dobras (adipômetro) ou pescoço + ${k.sex==='F'?'cintura + quadril':'abdômen'} (fita).</div>`;
  h+=`</div>`;
  const cm=CIRC.filter(([x])=>E.circ&&E.circ[x]);
  if(cm.length)h+=`<h3>Circunferências (cm)</h3><div class="card" style="padding:6px 14px">${cm.map(([x,l])=>kv(l,fz(E.circ[x])+(ev[1]&&ev[1].circ&&ev[1].circ[x]?dl(+E.circ[x],+ev[1].circ[x],x==='waist'||x==='abdomen'||x==='hip'):''))).join('')}</div>`;
  if(R.zones)h+=`<h3>Frequência cardíaca</h3><div class="card" style="padding:6px 14px">${kv('FC máxima estimada',R.fcmax+' bpm','Fórmula de Tanaka (208 − 0,7 × idade)','ok')}${kv('FC de repouso',R.rhr?R.rhr+' bpm':'—',R.rhr?'Zonas pela FC de reserva (Karvonen)':'Informe a FC de repouso para zonas mais precisas','ok')}
    ${R.zones.map(([n,a,b])=>kv(n,`${a}–${b} bpm`)).join('')}<div class="mu xs" style="padding:8px 0">Use no campo "Zona / FC média" do cardio. Z2 é a zona de base aeróbica.</div></div>`;
  h+=`<h3>Histórico de avaliações</h3><div class="card" style="padding:4px 14px">${ev.map(x=>{const r=evalCalc(x,k);return`<div class="row" style="padding:8px 0;border-top:1px solid var(--s3)"><span class="sp"><b>${isoToBR(x.date)}</b><div class="mu xs">${[r.kg&&fz(r.kg)+' kg',r.imc&&'IMC '+fz(r.imc.v),r.bf&&fz(r.bf.v)+'% G'].filter(Boolean).join(' · ')||'—'}${x.by==='master'?' · pelo administrador':''}</div></span><button class="btn ghost smb" data-act="anEdit" data-id="${x.id}" data-uid="${uid||''}">editar</button></div>`}).join('')}</div>
    <p class="mu xs">Valores estimados por fórmulas de campo; servem para acompanhar a evolução e não substituem avaliação profissional.</p>`;
  return h};
function inp(id,l,v,ph,mode){return`<label class="f"><span>${l}</span><input id="${id}" inputmode="${mode||'decimal'}" value="${v??''}" placeholder="${ph||''}"></label>`}
function anamHealthForm(a,k,uid){const H=a.health;
  let h=`<h3>Dados básicos</h3><div class="card"><div class="grid2"><label class="f" style="margin-top:0"><span>Sexo</span>${sel('',[['','—'],['M','Masculino'],['F','Feminino']],k.sex,'id="anSex"')}</label><label class="f" style="margin-top:0"><span>Nascimento</span><input id="anBirth" data-mask="date" inputmode="numeric" placeholder="DD/MM/AAAA" value="${isoToBR(k.birth)}"></label></div><div class="mu xs" style="margin-top:6px">Usados nos cálculos. Se já estiverem no Perfil corporal (Perfil), prevalecem os de lá.</div></div>`;
  h+=`<h3>Prontidão para atividade física (PAR-Q)</h3><div class="card" style="padding:4px 14px">${PARQ.map((q,i)=>`<div style="padding:9px 0;border-top:${i?'1px solid var(--s3)':'0'}"><div class="sm">${i+1}. ${q}</div><div class="row" style="gap:8px;margin-top:6px">${[['1','Sim'],['0','Não']].map(([v,l])=>`<label class="chip" style="display:inline-flex;gap:6px;align-items:center"><input type="radio" name="pq${i}" value="${v}" ${H.parq[i]===(v==='1')?'checked':''}> ${l}</label>`).join('')}</div></div>`).join('')}</div>`;
  h+=`<h3>Histórico</h3><div class="card">${[['anObj','Objetivo','obj','ex: hipertrofia, emagrecimento, condicionamento'],['anAct','Atividade física atual','act','ex: musculação 5×/sem há 2 anos'],['anCond','Doenças / condições de saúde','cond','ex: nenhuma'],['anInj','Lesões, dores ou limitações','inj','ex: dor no ombro direito em supino'],['anSurg','Cirurgias','surg',''],['anMeds','Medicamentos em uso','meds',''],['anSmoke','Tabagismo / álcool','smoke',''],['anNotes','Observações','notes','sono, alimentação, estresse…']].map(([id,l,f,ph])=>`<label class="f"><span>${l}</span><textarea id="${id}" rows="2" placeholder="${ph}">${esc(H[f]||'')}</textarea></label>`).join('')}
    <button class="btn pri block" data-act="anSaveHealth" data-uid="${uid||''}" style="margin-top:10px">Salvar</button></div>`;
  return h}
function anamEvalForm(a,k,uid,c){const E=ANM_EDIT?a.evals.find(x=>x.id===ANM_EDIT):null;const last=a.evals.slice().sort((x,y)=>x.date<y.date?1:-1)[0];
  const e=E||{date:iso(new Date()),weight:c.self?weightAt(bodyOf()):(weightsSorted(c.body||{}).slice(-1)[0]||{}).kg,height:k.height,circ:{},folds:{},protocol:(last&&last.protocol)||'jp3',rhr:last&&last.rhr};
  let h=`<h3>${E?'Editar avaliação':'Nova avaliação'}</h3><div class="card"><div class="grid2"><label class="f" style="margin-top:0"><span>Data</span><input id="evDate" data-mask="date" inputmode="numeric" value="${isoToBR(e.date)}"></label>${inp('evRhr','FC de repouso (bpm)',e.rhr,'ex: 62','numeric').replace('class="f"','class="f" style="margin-top:0"')}</div>
    <div class="grid2">${inp('evW','Peso (kg)',e.weight,'ex: 82,5')}${inp('evH','Altura (cm)',e.height,'ex: 175','numeric')}</div></div>`;
  h+=`<h3>Circunferências (cm)</h3><div class="card"><div class="grid2">${CIRC.map(([x,l])=>inp('ec_'+x,l,e.circ[x],'')).join('')}</div><div class="mu xs" style="margin-top:6px">Para o % de gordura pela fita: pescoço + ${k.sex==='F'?'cintura + quadril':'abdômen'}. Cintura + quadril também calculam a relação cintura/quadril.</div></div>`;
  h+=`<h3>Dobras cutâneas (mm) — opcional</h3><div class="card"><label class="f" style="margin-top:0"><span>Protocolo</span>${sel('',[['jp3','Jackson & Pollock 3 dobras'],['jp7','Jackson & Pollock 7 dobras']],e.protocol,'id="evProt"')}</label>
    <div class="grid2">${FOLDS.map(([x,l])=>inp('ef_'+x,l+((JP3[k.sex||'M']||[]).includes(x)?' •':''),e.folds[x],'')).join('')}</div><div class="mu xs" style="margin-top:6px">• = as 3 dobras do protocolo de 3${k.sex?'':' (masculino; marque o sexo na aba Saúde)'}. O de 7 usa todas. Com as dobras preenchidas, elas têm prioridade sobre a fita.</div></div>
    <button class="btn pri block" data-act="anSaveEval" data-uid="${uid||''}">${E?'Salvar alterações':'Salvar avaliação'}</button>${E?`<div style="height:8px"></div><button class="btn block" data-act="anDelEval" data-id="${E.id}" data-uid="${uid||''}" style="color:var(--bad)">Excluir avaliação</button>`:''}`;
  return h}
let ANM_EDIT=null;
Object.assign(ACT,{
  anOpen:d=>{ANM_TAB='res';ANM_EDIT=null;go('anam',{})},
  anOpenUser:d=>{const u=USERS.list.find(x=>x.id===d.id);ANM_EDIT=null;openAnamFor(u)},
  anTab:d=>{ANM_TAB=d.t;ANM_EDIT=null;render();scrollTo(0,0)},
  anEdit:d=>{ANM_TAB='aval';ANM_EDIT=d.id;render();scrollTo(0,0)},
  anSaveHealth:d=>{const c=anamCtx(d.uid);const a=anamOf(c.lib),H=a.health;
    const b=$('#anBirth').value.trim(),bi=b?brToISO(b):'';if(b&&!bi){toast('Data de nascimento inválida (DD/MM/AAAA)');return}
    a.sex=$('#anSex').value;a.birth=bi||'';H.parq=PARQ.map((_,i)=>{const r=document.querySelector(`input[name="pq${i}"]:checked`);return r?r.value==='1':null});
    [['anObj','obj'],['anAct','act'],['anCond','cond'],['anInj','inj'],['anSurg','surg'],['anMeds','meds'],['anSmoke','smoke'],['anNotes','notes']].forEach(([id,f])=>H[f]=$('#'+id).value.trim());
    H.updated=Date.now();H.by=c.self?'self':'master';anamSave(c);if(c.self)toast('Anamnese salva');ANM_TAB='res';render();scrollTo(0,0)},
  anSaveEval:d=>{const c=anamCtx(d.uid);const a=anamOf(c.lib);const dt=brToISO($('#evDate').value);if(!dt){toast('Data inválida (DD/MM/AAAA)');return}
    const g=id=>{const v=num($('#'+id).value);return v&&v>0?v:null};
    const E=(ANM_EDIT&&a.evals.find(x=>x.id===ANM_EDIT))||{id:uid36('av')};
    Object.assign(E,{date:dt,weight:g('evW'),height:g('evH'),rhr:g('evRhr'),protocol:$('#evProt').value,circ:{},folds:{},by:c.self?'self':'master',at:Date.now()});
    CIRC.forEach(([x])=>{const v=g('ec_'+x);if(v)E.circ[x]=v});FOLDS.forEach(([x])=>{const v=g('ef_'+x);if(v)E.folds[x]=v});
    if(!a.evals.includes(E))a.evals.push(E);
    if(c.self){const B=bodyOf();if(E.weight&&!(B.weights||[]).some(w=>w.date===dt)){B.weights=B.weights||[];B.weights.push({date:dt,kg:E.weight})}if(E.height&&!B.height)B.height=E.height}
    anamSave(c);if(c.self)toast('Avaliação salva');ANM_EDIT=null;ANM_TAB='res';render();scrollTo(0,0)},
  anDelEval:d=>{const c=anamCtx(d.uid);const a=anamOf(c.lib);confirmBox('Excluir avaliação','<p>Esta avaliação será apagada.</p>','Excluir',()=>{a.evals=a.evals.filter(x=>x.id!==d.id);anamSave(c);ANM_EDIT=null;ANM_TAB='res';render()},true)}
});

/* ---------- EVOLUÇÃO ---------- */
function exOptions(p,selId){return p.sessions.map(s=>`<optgroup label="${esc(s.name)}">${s.exercises.map(e=>`<option value="${e.id}" ${e.id===selId?'selected':''}>${KIND_ICON[e.kind]||''} ${esc(e.name)}</option>`).join('')}</optgroup>`).join('')}
function chart(e,p){const N=weeksOf(p),W=340,H=190,pl=36,pr=10,pt=12,pb=26;const plan=Array.from({length:N},(_,i)=>planFor(e,i+1));
  const act=Array(N).fill(null);S.logs.filter(L=>L.planId===p.id).forEach(L=>{const x=L.exercises.find(x=>x.exId===e.id);if(x&&L.week>=1&&L.week<=N){const t=topKg(x);if(t!=null)act[L.week-1]=Math.max(act[L.week-1]??0,t)}});
  const vals=[...plan,...act].filter(v=>v!=null);if(!vals.length)return'<div class="empty">Sem dados para o gráfico ainda.</div>';
  let mn=Math.min(...vals),mx=Math.max(...vals);if(mn===mx){mn-=5;mx+=5}const pad=(mx-mn)*.1;mn=Math.max(0,mn-pad);mx+=pad;
  const X=i=>pl+(W-pl-pr)*(N>1?i/(N-1):.5),Y=v=>pt+(H-pt-pb)*(1-(v-mn)/(mx-mn));
  const line=arr=>{let d='',pen=false;arr.forEach((v,i)=>{if(v==null){pen=false;return}d+=(pen?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);pen=true});return d};
  let g='';for(let k=0;k<=3;k++){const v=mn+(mx-mn)*k/3;g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2b303b"/><text x="${pl-6}" y="${Y(v)+4}" text-anchor="end" font-size="10" fill="#9097a6">${Math.round(v)}</text>`}
  const step=Math.ceil(N/12);const xl=Array.from({length:N},(_,i)=>i%step?'':`<text x="${X(i)}" y="${H-4}" text-anchor="middle" font-size="10" fill="#9097a6">S${i+1}</text>`).join('');
  const bw=(W-pl-pr)/Math.max(N,1);const ph=Array.from({length:N},(_,i)=>`<rect x="${X(i)-bw/2+1}" y="${H-pb+6}" width="${bw-2}" height="3" rx="1.5" class="pc-${esc(phaseAt(p,i+1).color)}" style="fill:var(--pc)"/>`).join('');
  const dots=act.map((v,i)=>v==null?'':`<circle cx="${X(i)}" cy="${Y(v)}" r="4.5" fill="#ff7a3d" stroke="#0e1014" stroke-width="2"/>`).join('');
  return`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Planejado vs executado">${g}${ph}${xl}<path d="${line(plan)}" fill="none" stroke="#9097a6" stroke-width="2" stroke-dasharray="4 4"/><path d="${line(act)}" fill="none" stroke="#ff7a3d" stroke-width="2.5"/>${dots}</svg>
   <div class="row sm mu" style="justify-content:center;gap:16px;margin-top:4px"><span><span style="display:inline-block;width:16px;border-top:2px dashed #9097a6;vertical-align:middle"></span> Planejado</span><span><span style="display:inline-block;width:16px;border-top:3px solid #ff7a3d;vertical-align:middle"></span> Executado</span></div>`}
function evoBody(itemId){const p=myActive();const f=p&&exIn(p,itemId);
  const entries=[];S.logs.forEach(L=>{const x=L.exercises.find(x=>x.exId===itemId);if(x&&exHasData(x))entries.push({L,x})});
  const kind=f?f.e.kind:(entries[0]&&entries[0].x.kind)||'load';if(!f&&!entries.length)return'<div class="empty">Selecione um exercício.</div>';
  let h='';const rec=entries.slice().reverse();
  if(kind==='cardio'){const km=entries.reduce((a,{x})=>a+(x.cardio.km||0),0),mn=entries.reduce((a,{x})=>a+(x.cardio.min||0),0);let best=null;entries.forEach(({x})=>{const c=x.cardio;if(c.min&&c.km){const pc=c.min/c.km;if(best==null||pc<best)best=pc}});
    h+=`<div class="stat"><div><b>${fnum(km,1)}</b><span>km no total</span></div><div><b>${fnum(mn/60,1)} h</b><span>tempo total</span></div><div><b>${best?mmss(best*60):'—'}</b><span>melhor ritmo /km</span></div></div>`;
    if(rec.length)h+=`<h3>Registros</h3><div class="card" style="padding:6px 10px"><table><tr><th>Data</th><th>Min</th><th>Km</th><th>Ritmo</th><th>Zona</th></tr>${rec.map(({L,x})=>`<tr class="tap" data-act="openLog" data-id="${L.id}"><td>${dshort(L.date)}</td><td>${fnum(x.cardio.min,0)}</td><td>${fnum(x.cardio.km,2)}</td><td>${pace(x.cardio.min,x.cardio.km)}</td><td>${esc(x.cardio.zone||'')}</td></tr>`).join('')}</table></div>`;return h}
  if(kind==='wod'){h+=`<div class="stat"><div><b>${entries.length}</b><span>vezes feito</span></div><div><b style="font-size:15px">${rec[0]?esc(wodScore(rec[0].x.wod)):'—'}</b><span>último resultado</span></div><div><b style="font-size:15px">${f?esc(f.e.wod.format):''}</b><span>formato</span></div></div>`;
    if(f&&f.e.wod.desc)h+=`<div class="wod">${esc(f.e.wod.desc)}</div>`;
    if(rec.length)h+=`<h3>Resultados</h3><div class="card" style="padding:6px 10px"><table><tr><th>Data</th><th>Resultado</th></tr>${rec.map(({L,x})=>`<tr class="tap" data-act="openLog" data-id="${L.id}"><td>${dshort(L.date)}</td><td>${esc(wodScore(x.wod))}</td></tr>`).join('')}</table></div>`;return h}
  if(kind==='time'){let best=0;entries.forEach(({x})=>doneSets(x).forEach(s=>{if((s.sec||0)>best)best=s.sec}));
    h+=`<div class="stat"><div><b>${best?best+'s':'—'}</b><span>melhor tempo</span></div><div><b>${entries.length}</b><span>sessões</span></div><div><b>${rec[0]?esc(exSummary(rec[0].x)):'—'}</b><span>última</span></div></div>`;
    if(rec.length)h+=`<h3>Registros</h3><div class="card" style="padding:6px 10px"><table><tr><th>Data</th><th>Séries</th></tr>${rec.map(({L,x})=>`<tr class="tap" data-act="openLog" data-id="${L.id}"><td>${dshort(L.date)}</td><td>${esc(exSummary(x))}</td></tr>`).join('')}</table></div>`;return h}
  let best=0,bestE=0,bestEtxt='',bestR=0;entries.forEach(({x})=>doneSets(x).forEach(s=>{if((s.kg||0)>best)best=s.kg;if((s.reps||0)>bestR)bestR=s.reps;const r=e1rm(s.kg,s.reps);if(r>bestE){bestE=r;bestEtxt=`${fkg(s.kg)}×${s.reps}`}}));
  h+=kind==='bw'&&!best?`<div class="stat"><div><b>${bestR||'—'}</b><span>mais reps numa série</span></div><div><b>${entries.length}</b><span>sessões</span></div><div><b>${rec[0]?esc(exSummary(rec[0].x)):'—'}</b><span>última</span></div></div>`
    :`<div class="stat"><div><b>${best?fkg(best):'—'}</b><span>maior carga (kg)</span></div><div><b>${bestE?fkg(Math.round(bestE*10)/10):'—'}</b><span>1RM est. ${bestEtxt?'('+bestEtxt+')':''}</span></div><div><b>${entries.length}</b><span>sessões</span></div></div>`;
  if(f&&p)h+=`<div class="card">${chart(f.e,p)}</div>`;
  if(rec.length)h+=`<h3>Registros</h3><div class="card" style="padding:6px 10px"><table><tr><th>Data</th><th>Sem</th><th>Séries</th><th>1RM</th></tr>${rec.map(({L,x})=>{const r=Math.max(0,...doneSets(x).map(s=>e1rm(s.kg,s.reps)));return`<tr class="tap" data-act="openLog" data-id="${L.id}"><td>${dshort(L.date)}</td><td>${L.week}${L.planId!==(p&&p.id)?'<span class="mu xs"> *</span>':''}</td><td>${esc(exSummary(x))}</td><td>${r?fkg(Math.round(r*10)/10):'—'}</td></tr>`}).join('')}</table>${rec.some(({L})=>L.planId!==(p&&p.id))?'<div class="mu xs" style="padding:6px 4px">* feito em outro plano</div>':''}</div>`;
  return h}
function prEvents(){const best={},ev=[];S.logs.forEach(L=>L.exercises.forEach(x=>{if(x.kind!=='load'&&x.kind!=='bw')return;const d=doneSets(x).filter(t=>t.kg!=null);if(!d.length)return;
  const top=d.reduce((a,t)=>t.kg>a.kg||(t.kg===a.kg&&(t.reps||0)>(a.reps||0))?t:a);const k=x.cat||norm(x.name);const b=best[k];
  if(b!=null&&top.kg>b)ev.push({L,x,kg:top.kg,reps:top.reps});if(b==null||top.kg>b)best[k]=top.kg}));return ev}
VIEWS.evolucao=function(){const p=myActive();let h=hdr('Progresso',p?esc(p.name):'',false,syncBadge())+progSeg('evo');
  const ym=ymOf(new Date()),mLogs=S.logs.filter(L=>L.date.startsWith(ym)),prs=prEvents(),mPR=prs.filter(e=>e.L.date.startsWith(ym)).length;
  const vol=mLogs.reduce((a,L)=>a+logVolume(L),0);
  h+=`<div class="stat3"><div><span>Treinos no mês</span><b>${mLogs.length}</b></div><div><span>Recordes</span><b>${mPR}</b></div><div><span>Peso movido</span><b>${vol>=1000?(vol/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' t':Math.round(vol)+' kg'}</b></div></div>`;
  h+=calendarHTML(S.logs,'me',true,true);
  if(prs.length){h+=`<div class="card"><b>Recordes recentes</b>${prs.slice(-3).reverse().map(e=>{const k=e.x.cat&&MIDIA[e.x.cat]?e.x.cat:null,u=k&&fotoDe(k,0),nw=(Date.now()-pISO(e.L.date).getTime())<8*864e5;return`<div class="li2 nob">${u?`<img class="thumb" src="${u}" alt="" loading="lazy" style="width:40px;height:40px">`:`<span class="thumb ph" style="width:40px;height:40px">🏆</span>`}<span class="t"><b>${esc(e.x.name)}</b><span class="mu sm">${fkg(e.kg)} kg${e.reps?' × '+e.reps:''} · ${dshort(e.L.date)}</span></span>${nw?'<span class="newb">NOVO</span>':''}</div>`}).join('')}</div>`}
  if(p&&p.sessions.some(s=>s.exercises.length)){let sel=S.settings.progEx;if(!sel||!exIn(p,sel)){const L=S.logs[S.logs.length-1];const c=L&&L.exercises.find(x=>exIn(p,x.exId));sel=c?c.exId:(p.sessions.find(s=>s.exercises.length)||{exercises:[{}]}).exercises[0].id}
    const f=exIn(p,sel),e=f&&f.e;
    if(e){const ent=[];S.logs.forEach(L=>{const x=L.exercises.find(x=>x.exId===e.id);if(x&&exHasData(x))ent.push({L,x})});const k=midiaKey(e),u=k&&fotoDe(k,0);
      h+=`<div class="card"><div class="row" style="gap:10px">${u?`<img class="thumb" src="${u}" alt="" style="width:44px;height:44px">`:''}<div class="sp" style="min-width:0"><span class="mu xs">Exercício</span><div class="b">${esc(e.name)}</div></div><label class="trocar"><span class="sr">Trocar exercício do gráfico</span><select id="exSel">${exOptions(p,sel)}</select><span class="btn smb" aria-hidden="true">Trocar</span></label></div>`;
      if(usesLoad(e)){const tops=ent.map(({x})=>topKg(x)).filter(v=>v!=null),last=tops[tops.length-1],firstI=Math.max(0,tops.length-8),d=tops.length>1?r2(last-tops[firstI]):null;
        let best=null,bestL=null;ent.forEach(({L,x})=>doneSets(x).forEach(t=>{if(t.kg!=null&&(!best||t.kg>best.kg||(t.kg===best.kg&&(t.reps||0)>(best.reps||0)))){best=t;bestL=L}}));
        h+=`<div class="row" style="gap:8px;margin-top:10px;align-items:baseline"><span class="bignum">${last!=null?fkg(last)+' kg':'—'}</span>${d?`<span class="${d>0?'ok':'mu'} sm b">${d>0?'+':''}${fkg(d)} kg em ${tops.length-firstI} treinos</span>`:''}</div>${sparkSVG(tops.slice(-8))||'<p class="mu sm">Faça mais treinos para ver o gráfico.</p>'}${best?`<p class="mu sm" style="margin:6px 0 0">Melhor série: ${fkg(best.kg)} kg${best.reps?' × '+best.reps:''} em ${dshort(bestL.date)}</p>`:''}`}
      else h+=ent.length?`<p class="sm" style="margin:10px 0 0">Última vez (${dshort(ent[ent.length-1].L.date)}): ${esc(exSummary(ent[ent.length-1].x))}</p>`:'<p class="mu sm">Ainda sem registros.</p>';
      h+=`<button class="lnk" data-act="go" data-v="evo" data-id="${e.id}">Ver detalhes ›</button></div>`}}
  {const B=bodyOf(),ws=weightsSorted(B),wk=weightAt(B);const m0=ws.filter(x=>x.date<ym+'-01').pop(),dm=wk&&m0?r2(wk-m0.kg):null;const kw=p&&weekKcal(p);
   h+=`<div class="card"><div class="row" style="gap:10px"><div class="sp"><span class="mu xs">Peso corporal</span><div><span class="bignum" style="font-size:22px">${wk?fnum(wk,1)+' kg':'—'}</span> ${dm!=null?`<span class="mu sm">${dm>0?'+':''}${fnum(dm,1)} kg no mês</span>`:''}</div></div>${ws.length>1?`<div style="width:110px">${sparkSVG(ws.slice(-8).map(x=>x.kg)).replace('stroke="var(--ac)"','stroke="var(--acu)"').replace('fill="var(--ac)"','fill="var(--acu)"')}</div>`:''}</div>
     <div class="row" style="margin-top:8px"><button class="btn pri smb sp" data-act="addWeight">+ Registrar peso</button>${ws.length?'<button class="btn smb sp" data-act="go" data-v="weights">Ver registros</button>':''}</div>${kw!=null?`<p class="mu xs" style="margin:8px 0 0">Gasto estimado na semana: ~${kw.toLocaleString('pt-BR')} kcal</p>`:''}</div>`}
  return h};
VIEWS.evo=function({id}){const f=findExAny(id);return hdr(f?f.e.name:'Evolução',f?esc(f.s.name):'',true)+evoBody(id)};

/* ---------- HISTÓRICO ---------- */
VIEWS.historico=function(){let h=hdr('Progresso',`${S.logs.length} treino${S.logs.length===1?'':'s'} registrado${S.logs.length===1?'':'s'}`,false,syncBadge())+progSeg('hist');
  if(!S.logs.length)return h+'<div class="empty">Nenhum treino ainda.<br>Comece pela aba <b>Hoje</b>.</div>';
  h+=calendarHTML(S.logs,'me',true);
  let curM='';S.logs.slice().reverse().forEach(L=>{const m=pISO(L.date).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});if(m!==curM){if(curM)h+='</div>';h+=`<h3>${esc(m)}</h3><div class="card" style="padding:4px 14px">`;curM=m}
    const dur=L.durationSec!=null?Math.round(L.durationSec/60):L.finishedAt&&L.startedAt?Math.round((L.finishedAt-L.startedAt)/60000):null;const ns=L.exercises.reduce((a,x)=>a+(x.kind==='cardio'||x.kind==='wod'?1:doneSets(x).length),0);const vol=logVolume(L);
    h+=`<div class="li tap" data-act="openLog" data-id="${L.id}"><span class="pill" style="min-width:52px;text-align:center">${dshort(L.date)}</span><div class="t"><b>${esc(L.name)}</b><span class="mu sm">${esc(L.planName||'')} · S${L.week} · ${ns} séries/blocos${vol?' · '+(vol/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' t':''}${dur?` · ${dur} min`:''}${(k=>k&&k.total?' · 🔥 '+kcalTxt(k):'')(workoutKcal(L))}</span></div><span class="mu">›</span></div>`});
  return h+'</div>'};
VIEWS.log=function({id}){const L=S.logs.find(l=>l.id===id);if(!L)return hdr('Registro','',true)+'<div class="empty">Não encontrado</div>';
  const dur=L.durationSec!=null?Math.round(L.durationSec/60):L.finishedAt&&L.startedAt?Math.round((L.finishedAt-L.startedAt)/60000):null;
  let h=hdr(L.name,`${dlong(L.date)} · ${esc(L.planName||'')} · S${L.week}${dur?` · ${dur} min`:''}`,true);
  {const k=workoutKcal(L);h+=k?`<div class="card"><div class="row"><span class="kd">🔥</span><div class="sp"><b>${kcalTxt(k)}</b> <span class="mu sm">gasto estimado</span><div class="mu sm">~${k.active} kcal ativas · ${k.min} min${k.hr?' · cardio pela FC':''}</div></div></div><div class="mu xs" style="margin-top:6px">Estimativa pelo seu metabolismo basal e pela intensidade de cada bloco (±20–30%). "Ativas" é comparável às calorias ativas do relógio; o total inclui o metabolismo de repouso.</div></div>`:`<div class="card sm mu">🔥 Preencha seu <b>perfil corporal</b> em Perfil para ver o gasto calórico estimado.</div>`}
  h+=`<p class="mu sm">Toque nos valores para corrigir.</p>`;
  L.exercises.forEach((x,i)=>{h+=`<div class="card ex"><b>${KIND_ICON[x.kind]||''} ${esc(x.name)}</b>`;
    if(x.kind==='cardio'||x.kind==='wod')h+=`<div class="sm" style="margin-top:6px">${esc(exSummary(x))}</div>`;
    else{const cols=x.kind==='time'?['kg','sec']:['kg','reps','rir'];const gt=`grid-template-columns:26px ${cols.map(()=>'1fr').join(' ')}`;
      h+=`<div class="sg hd2" style="${gt}"><span>#</span>${cols.map(c=>`<span>${c==='sec'?'seg':c}</span>`).join('')}</div>${x.sets.map((s,j)=>`<div class="sg" style="${gt}"><span>${j+1}</span>${cols.map(c=>`<input data-lf="${c}" data-lid="${L.id}" data-i="${i}" data-j="${j}" inputmode="decimal" value="${s[c]??''}">`).join('')}</div>`).join('')}`}
    h+=`</div>`});
  if(L.note)h+=`<div class="card sm">📝 ${esc(L.note)}</div>`;
  h+=`<button class="btn block" data-act="delLog" data-id="${L.id}" style="color:var(--bad)">Excluir registro</button>`;return h};

/* ---------- AJUSTES ---------- */
VIEWS.ajustes=function(){const st=S.settings,p=myActive();
  let h=hdr('Ajustes',esc(ME.name||'')+' · versão '+APP_VERSION,false,syncBadge());
  const mi=(act,ic,t,d,x='')=>`<div class="li tap" data-act="${act}" ${x}><span class="kd">${ic}</span><div class="t"><b>${t}</b><span class="mu sm">${d}</span></div><span class="mu">›</span></div>`;
  h+=`<div class="card" style="padding:4px 14px">${mi('go','📋','Planos de treino','Em andamento, próximos e finalizados','data-v="planos"')}${ME.role==='master'?mi('openUsers','👥','Gerenciar usuários','Clientes, planos, avaliações e acessos')+mi('go','🧩','Modelos de treino','Editar os treinos prontos do app','data-v="modelos"'):''}${mi('go','❓','Ajuda','Como usar cada parte do app','data-v="ajuda"')}</div>`;
  h+=`<div class="card"><div class="sw"><span>Sempre mostrar opções avançadas<div class="mu xs">Mostra fases, RIR e progressão de cargas abertas nos planos. Deixe desligado para uma visão mais simples.</div></span><input type="checkbox" data-sf="adv" ${st.adv?'checked':''}></div></div>`;
  {const tp=themePref();h+=`<h3>Aparência</h3><div class="seg">${[['dark','🌙 Escuro'],['light','☀️ Claro'],['auto','📱 Automático']].map(([k,l])=>`<button class="${tp===k?'on':''}" data-act="setTheme" data-t="${k}">${l}</button>`).join('')}</div><p class="mu xs" style="margin:6px 2px 0">Automático segue o modo claro/escuro do iPhone. Vale só para este aparelho.</p>`}
  if(p){const w=progOf(p).week,N=weeksOf(p);h+=`<h3>Plano ativo</h3><div class="card"><div class="b">${esc(p.name)}</div><p class="sm mu">A semana avança sozinha quando você completa todos os treinos. Use os botões só para corrigir.</p>
    <div class="row"><button class="btn smb" data-act="shiftWeek" data-d="-1">◀ Voltar</button><div class="sp" style="text-align:center"><b>Semana ${Math.min(w,N+1)}</b><div class="mu xs">${w<=N?esc(phaseAt(p,w).name):'concluído'}</div></div><button class="btn smb" data-act="shiftWeek" data-d="1">Avançar ▶</button></div></div>`}
  {const B=bodyOf(),r=bmrOf(B);h+=`<h3>Meus dados</h3><div class="card"><label class="f" style="margin-top:0"><span>Nome de exibição</span><input id="bfName" maxlength="80" autocomplete="name" value="${esc(ME.name||'')}" placeholder="Seu nome"></label><div class="grid2"><label class="f" style="margin-top:0"><span>Sexo</span>${sel('',[['','—'],['M','Masculino'],['F','Feminino']],B.sex,'id="bfSex"')}</label><label class="f" style="margin-top:0"><span>Nascimento (DD/MM/AAAA)</span><input id="bfBirth" data-mask="date" inputmode="numeric" maxlength="10" placeholder="dd/mm/aaaa" value="${esc(isoToBR(B.birth))}" autocomplete="bday"></label></div>
    <div class="grid2"><label class="f"><span>Altura (cm)</span><input id="bfHeight" inputmode="numeric" maxlength="3" value="${B.height??''}" placeholder="ex: 175"></label><label class="f"><span>Peso atual (kg)</span><button class="btn block" data-act="addWeight" style="padding:10px">${weightAt(B)?fnum(weightAt(B),1)+' kg · atualizar':'Registrar'}</button></label></div>
    <button class="btn pri block" data-act="saveBody" style="margin-top:4px">Salvar meus dados</button><div class="mu xs" style="margin-top:6px">Sexo, nascimento, altura e peso vêm da sua avaliação quando estiverem vazios.</div>
    <div class="sm" style="margin-top:10px">${r?`Metabolismo basal estimado: <b>${Math.round(r).toLocaleString('pt-BR')} kcal/dia</b>`:'<span class="mu">Preencha sexo, nascimento, altura e peso para calcular o metabolismo e o gasto dos treinos.</span>'}</div>
    <div class="mu xs" style="margin-top:6px">${ME.role==='master'?'Usado para estimar o gasto calórico dos treinos.':'Usado para estimar o gasto calórico dos treinos. Visível para você e para o administrador do app.'} O peso é salvo ao tocar em "Salvar" na janela de registro.</div></div>`}
  h+=`<h3>Durante o treino</h3><p class="mu xs" style="margin:-4px 0 6px">Estas opções são salvas automaticamente ao tocar.</p><div class="card" style="padding:4px 14px"><div class="sw"><span>Som ao fim do descanso</span><input type="checkbox" data-sf="sound" ${st.sound?'checked':''}></div><div class="sw"><span>Aviso faltando 5 segundos</span><input type="checkbox" data-sf="warn5" ${st.warn5!==false?'checked':''}></div><div class="sw"><span>Manter tela ligada</span><input type="checkbox" data-sf="wake" ${st.wake?'checked':''}></div>
    <div class="sw"><span>Pausar o cronômetro do treino ao sair da tela<div class="mu xs">Pausa ao bloquear o celular <b>e</b> ao trocar de app (o iPhone não diferencia os dois). Você também pode pausar manualmente no ⏸.</div></span><input type="checkbox" data-sf="autoPause" ${st.autoPause?'checked':''}></div>
    <div style="padding:10px 0"><button class="btn block" data-act="testSound">🔊 Testar alertas sonoros</button><div class="mu xs" style="margin-top:6px">Se não ouvir: aumente o volume e confira se o iPhone não está no modo silencioso.</div></div></div>`;
  h+=`<h3>Conta</h3><div class="card"><div class="b">${esc(ME.name||'')}${ME.role==='master'?' <span class="pill" style="background:var(--ac);color:#fff">master</span>':''}</div><div class="mu sm">${esc(ME.email||'')}</div><div class="sm" style="margin:8px 0">${syncText()}</div>
    <button class="btn block" data-act="syncNow">Sincronizar agora</button><div style="height:8px"></div><button class="btn block" data-act="logout" style="color:var(--bad)">Sair da conta</button></div>`;
  h+=`<h3>Backup extra</h3><div class="card"><p class="sm mu" style="margin-top:0">Seus dados ficam na nuvem e neste aparelho. O arquivo é uma cópia extra.${st.lastBackup?` Último: ${new Date(st.lastBackup).toLocaleDateString('pt-BR')}.`:''}</p>
    <button class="btn block" data-act="exportJSON">Exportar backup (.json)</button><div style="height:8px"></div><button class="btn block" data-act="importJSON">Importar backup</button><div style="height:8px"></div><button class="btn block" data-act="exportCSV">Exportar histórico (.csv / Excel)</button></div>`;
  return h};
function share(name,text,type){const blob=new Blob([text],{type});let file=null;try{file=new File([blob],name,{type})}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:name}).catch(()=>{});return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function onImport(inp){const file=inp.files[0];inp.value='';if(!file)return;const rd=new FileReader();rd.onload=()=>{let D;try{D=JSON.parse(rd.result)}catch(e){toast('Arquivo inválido');return}
  if(!D||!Array.isArray(D.logs)){toast('Este arquivo não é um backup do app');return}
  confirmBox('Importar backup',`<p>Os dados atuais da sua conta serão <b>substituídos</b>:</p>${diffTable([['Treinos registrados',S.logs.length,`<b>${D.logs.length}</b>`],['Planos',S.lib.plans.length,`<b>${D.lib?D.lib.plans.length:(D.program?1:0)}</b>`]],['','Atual','Backup'])}`,'Substituir dados',()=>{const keep=S._sync;S=D;migrate();S._sync=Object.assign(freshSync(),{lastPull:keep.lastPull,dirtyLogs:S.logs.map(L=>L.id)});commit();V.tab='hoje';V.stack=[];render();toast('Backup importado')},true)};rd.readAsText(file)}

/* ---------- MODELOS PRONTOS (modelos.js + edições do master no Supabase) ---------- */
const TPL={lib:{v:3,plans:[],activeId:null},rows:{},loaded:false,snap:{},rebuild:true};
function tplMeta(){const L=((window.MODELOS&&MODELOS.list)||[]).slice();[['d5-acad','split5',5],['d7-acad','hip7',7]].forEach(([id,k,d])=>{const t=WORKOUT_TEMPLATES[k];if(t)L.push({id,name:t.name,days:d,place:'academia',level:'normal',sessions:t.sessions})});
  return L.sort((a,b)=>a.place.localeCompare(b.place)||a.days-b.days||(a.level===b.level?0:a.level==='iniciante'?1:-1))}
function tplPlans(){if(TPL.rebuild){TPL.lib.plans=tplMeta().map(m=>{const meta={id:m.id,days:m.days,place:m.place,level:m.level};const r=TPL.rows[m.id];let p;
    if(r&&r.data&&Array.isArray(r.data.sessions)){p=clone(r.data);meta.custom=true}else{p=newPlan(m.name,'hip12');try{p.sessions=sessionsFromRaw(m,p)}catch(e){console.error(e);p.sessions=[]}}
    p.id='tpl_'+m.id;p.tpl=meta;return p});TPL.rebuild=false;TPL.lib.plans.forEach(p=>TPL.snap[p.id]=p.name+JSON.stringify(p.sessions))}return TPL.lib.plans}
async function loadTpl(){if(!SB||TPL.loading)return;TPL.loading=true;try{const{data,error}=await SB.from('workout_templates').select('id,data,updated_at');if(error){TPL.err=error.message;return}TPL.rows={};(data||[]).forEach(x=>TPL.rows[x.id]=x);TPL.rebuild=true;TPL.loaded=true}finally{TPL.loading=false}}
let tplT=null;
function tplSave(){clearTimeout(tplT);tplT=setTimeout(async()=>{for(const p of TPL.lib.plans){const k=p.name+JSON.stringify(p.sessions);if(TPL.snap[p.id]===k)continue;const data=clone(p);delete data.tpl;
    const{error}=await SB.from('workout_templates').upsert({id:p.tpl.id,data,updated_by:ME.id,updated_at:new Date().toISOString()});
    if(error){toast('Não salvou o modelo: '+friendlyErr(error));return}TPL.snap[p.id]=k;p.tpl.custom=true;TPL.rows[p.tpl.id]={id:p.tpl.id,data}}
  toast('Modelo salvo para todos');render()},900)}
function tplLabel(p){const t=p.tpl||{};return`${t.days} dia${t.days===1?'':'s'} · ${t.place==='casa'?'casa':'academia'}${t.level==='iniciante'?' · iniciante':''}`}
function applyGoal(p,gk){const g=(window.MODELOS&&MODELOS.GOALS[gk])||null;if(!g)return p;
  p.sessions.forEach(s=>{if(g.cardio&&!s.cardio)s.cardio=g.cardio;s.exercises.forEach(e=>{if(e.kind==='cardio'||e.kind==='wod')return;
    if(g.setsMax&&e.sets>g.setsMax)e.sets=g.setsMax;
    if(g.reps&&e.kind!=='time')e.reps=g.reps;
    if(e.restSec){if(g.restMax&&e.restSec>g.restMax)e.restSec=g.restMax;if(g.restMin&&e.restSec<g.restMin)e.restSec=g.restMin;e.rest=e.restSec>=120?(e.restSec/60)+' min':e.restSec+' s'}
    if(g.rir&&e.rir)e.rir=g.rir})});p.goal=gk;return p}
function planFromTpl(tp,name,gk,period){const g=(window.MODELOS&&MODELOS.GOALS[gk])||{};const p=newPlan(name||tp.name,period||g.period||'hip12');
  p.sessions=clone(tp.sessions).map(s=>Object.assign(s,{id:uid36('s'),exercises:s.exercises.map(e=>Object.assign(e,{id:uid36('e')}))}));
  applyGoal(p,gk);p.sessions.forEach(s=>s.exercises.forEach(e=>{if(usesLoad(e))e.plan=e.base!=null?genPlan(e.base,e.inc,p):Array(weeksOf(p)).fill(null)}));p.from=tp.tpl&&tp.tpl.id;return p}
VIEWS.modelos=function(){if(ME.role!=='master')return hdr('Modelos de treino','',true)+'<div class="empty">Apenas o master edita modelos.</div>';
  if(!TPL.loaded&&!TPL.err)loadTpl().then(render);const L=tplPlans();
  let h=hdr('Modelos de treino','Base dos planos criados no app',true);
  h+=`<p class="mu sm" style="margin-top:0">Toque em um modelo para trocar exercícios, séries, repetições ou descanso. Vale para os próximos planos criados a partir dele.</p>`;
  if(TPL.err)h+=`<div class="banner">⚠️ Não consegui ler os modelos salvos (${esc(TPL.err)}). Falta aplicar o SQL da etapa 2? Por enquanto aparecem os modelos originais e as edições não serão salvas.</div>`;
  for(const pl of [['academia','🏋️ Academia'],['casa','🏠 Casa']]){const g=L.filter(p=>p.tpl.place===pl[0]);if(!g.length)continue;
    h+=`<h3>${pl[1]}</h3><div class="card" style="padding:4px 14px">${g.map(p=>`<div class="li tap" data-act="go" data-v="plan" data-id="${p.id}" data-uid="__tpl"><span class="pill" style="min-width:34px;text-align:center">${p.tpl.days}d</span><div class="t"><b>${esc(p.name)}</b><span class="mu sm">${p.sessions.length} treinos${p.tpl.level==='iniciante'?' · iniciante':''}${p.tpl.custom?' · <span class="ac">editado</span>':''}</span></div><span class="mu">›</span></div>`).join('')}</div>`}
  return h};
/* ---------- MONTAR TREINO EM 3 PERGUNTAS ---------- */
let WZ=null;
const WZ_GOAL_FROM={hipertrofia:'massa',recomposicao:'massa',emagrecimento:'gordura',condicionamento:'saude',saude:'saude',outro:'massa'};
function wzPrefill(a){const w={step:1,goal:'massa',days:3,time:'60',place:'academia'};if(!a)return w;
  if(WZ_GOAL_FROM[a.goal])w.goal=WZ_GOAL_FROM[a.goal];const d=+a.train_days;if(d>=2)w.days=Math.min(6,d);if(a.train_place==='casa')w.place='casa';if(d===0&&a.goal!=='hipertrofia')w.goal='iniciante';return w}
function wzModelId(w){if(w.days===7)return w.place==='casa'?'d6-casa':'d7-acad';if(w.days===5)return w.place==='casa'?'d4-casa':'d5-acad';const ini=w.goal==='iniciante'&&w.days<=4;return`d${w.days}-${w.place==='casa'?'casa':'acad'}${ini?'-ini':''}`}
function wzBuild(w){const T=tplPlans(),tp=T.find(t=>t.tpl.id===wzModelId(w))||T.find(t=>t.tpl.id==='d3-acad');const G=MODELOS.GOALS[w.goal]||{};
  const p=planFromTpl(tp,`${({massa:'Hipertrofia',gordura:'Emagrecimento',saude:'Condicionamento',iniciante:'Iniciante'})[w.goal]||'Treino'} · ${w.days}×/semana · ${w.place==='casa'?'casa':'academia'}`,w.goal);
  if(w.time==='45')p.sessions.forEach(x=>{if(x.exercises.length>5)x.exercises=x.exercises.slice(0,5)});
  if(w.time==='90'||w.time==='120'){const c=w.time==='120'?'30–40 min':'15–20 min';p.sessions.forEach(x=>{x.cardio=(x.cardio?x.cardio+' · ':'')+`Tempo extra: ${c} de cardio leve ou mobilidade no final`})}
  return p}
VIEWS.montar=function(prm){const uid=prm.uid||'';if(!WZ||WZ.uid!==uid||WZ.aid!==(prm.aid||'')){let a=null;if(prm.aid&&window.AV&&AV.cache.det[prm.aid])a=AV.cache.det[prm.aid].answers;else if(!uid&&window.AV&&AV.cache.mine&&AV.cache.mine.list&&AV.cache.mine.list[0])a=AV.cache.mine.list[0].answers;WZ=Object.assign(wzPrefill(a),{uid,aid:prm.aid||'',pref:!!a})}
  const w=WZ,G=(window.MODELOS&&MODELOS.GOALS)||{},who=uid?whoName():'';
  const bar=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:4px 0 14px">${[1,2,3].map(i=>`<div style="height:6px;border-radius:3px;background:${i<=w.step?'var(--ac)':'var(--s3)'}"></div>`).join('')}</div>`;
  let h=hdr(w.step===3?'Treino montado':'Montar treino',(who?'para '+esc(who)+' · ':'')+'passo '+w.step+' de 3',true)+bar;
  if(w.pref&&w.step===1)h+=`<div class="banner">📋 Respostas pré-preenchidas com a avaliação${who?' do cliente':''}. Confira e ajuste.</div>`;
  const opt=(k,v,t,d,ic)=>`<button class="wz-o ${w[k]===v?'on':''}" data-act="wzSet" data-k="${k}" data-v="${v}" aria-pressed="${w[k]===v}"><span class="wz-ic">${ic}</span><span class="t"><b>${t}</b>${d?`<span class="mu sm">${d}</span>`:''}</span><span class="wz-ck">${w[k]===v?'✓':''}</span></button>`;
  const chip=(k,v,t)=>`<button class="chip ${String(w[k])===String(v)?'on':''}" data-act="wzSet" data-k="${k}" data-v="${v}" aria-pressed="${String(w[k])===String(v)}">${t}</button>`;
  if(w.step===1){h+=`<h2 style="margin:0 0 4px">Qual é o objetivo${who?' do cliente':''}?</h2><p class="mu sm" style="margin-top:0">Escolha o que mais importa agora. Dá para mudar depois.</p>
    ${opt('goal','massa',G.massa.name,'Mais carga e volume ao longo das semanas.','💪')}${opt('goal','gordura',G.gordura.name,'Treino mais intenso, descanso curto e cardio leve no fim.','🔥')}${opt('goal','saude',G.saude.name,'Corpo todo, ritmo moderado, sem exagero.','❤️')}${opt('goal','iniciante',G.iniciante.name,'Máquinas e exercícios simples para aprender a técnica.','🌱')}
    <div style="height:12px"></div><button class="btn pri block" data-act="wzNext">Continuar</button>${w.goal!=='iniciante'?`<div style="height:8px"></div><button class="btn ghost block" data-act="wzSkip">Já treino: quero montar sozinho</button>`:''}`}
  else if(w.step===2){h+=`<h2 style="margin:0 0 10px">Como é a rotina${who?' do cliente':''}?</h2>
    <div class="b">Quantos dias por semana?</div><div class="chips wz-days">${[2,3,4,5,6,7].map(d=>chip('days',d,d)).join('')}</div>
    ${w.goal==='iniciante'&&w.days>=5?'<div class="sug down" style="margin-top:8px">Para quem está começando, 3 dias costumam render mais: dá tempo de recuperar. Você pode manter, se quiser.</div>':''}
    ${w.days===5&&w.place==='casa'?'<div class="mu sm" style="margin-top:6px">Para 5 dias em casa, o app usa o modelo de 4 treinos; no 5º dia, recomece pelo primeiro.</div>':''}${(w.time==='90'||w.time==='120')?'<div class="mu sm" style="margin-top:6px">Os treinos levam cerca de 1 hora; o tempo a mais vira cardio leve ou mobilidade no final de cada treino.</div>':''}${w.days===7?'<div class="mu sm" style="margin-top:6px">'+(w.place==='casa'?'Para 7 dias em casa, o app usa o modelo de 6 treinos; no 7º dia, recomece pelo primeiro. ':'')+'Treinar todos os dias exige atenção ao descanso: se sentir cansaço acumulado, tire um dia de folga.</div>':''}
    <div class="b" style="margin-top:16px">Quanto tempo por treino?</div><div class="chips">${chip('time','45','45 min')}${chip('time','60','1 hora')}${chip('time','90','1h30')}${chip('time','120','2 horas')}</div>
    <div class="b" style="margin-top:16px">Onde treina?</div>${opt('place','academia','Academia','Máquinas, halteres e barras.','🏋️')}${opt('place','casa','Em casa','Peso do corpo, halteres e banco.','🏠')}
    <div style="height:12px"></div><button class="btn pri block" data-act="wzNext">Ver o treino</button>`}
  else{if(!w.preview)w.preview=wzBuild(w);const p=w.preview,lib=LIB(),cur=planById(lib.activeId,lib);
    h+=`<div class="chips" style="margin-bottom:10px"><span class="pill">${esc((G[w.goal]||{}).name||'')}</span><span class="pill">${w.days}×/semana</span><span class="pill">${({'45':'45 min','90':'1h30','120':'2 horas'})[w.time]||'1 hora'}</span><span class="pill">${w.place==='casa'?'Casa':'Academia'}</span></div>
    <div class="card" style="padding:4px 14px">${p.sessions.map((x,i)=>`<div class="li"><span class="pill" style="min-width:30px;text-align:center">${String.fromCharCode(65+i)}</span><div class="t"><b>${esc(x.name)}</b><span class="mu sm">${x.exercises.length} exercícios · ${esc(x.duration||'')}</span><span class="mu xs">${x.exercises.map(e=>esc(e.name)).join(' · ')}</span></div></div>`).join('')}</div>
    <div class="banner">ℹ️ Faça os treinos na ordem${p.sessions.length>1?' ('+p.sessions.map((x,i)=>String.fromCharCode(65+i)).join(', ')+')':''} e repita. Na primeira vez use uma carga confortável: o app anota e avisa quando aumentar.</div>
    ${cur?`<p class="mu sm">O plano atual <b>${esc(cur.name)}</b> vai para <b>Próximos</b> e fica guardado.</p>`:''}
    <button class="btn pri block" data-act="wzCreate" data-then="hoje">${uid?'Salvar e ativar para o cliente':'Começar a usar'}</button><div style="height:8px"></div><button class="btn block" data-act="wzCreate" data-then="edit">${uid?'Salvar e ajustar exercícios':'Trocar algum exercício'}</button>`}
  return h};
function firstSteps(){const m=window.AV&&AV.mine?AV.mine():null,d1=!!(m&&m.list&&m.list.length);
  const it=(n,t,d,st,btn)=>`<div class="fs-i ${st}"><span class="fs-n">${st==='done'?'✓':n}</span><div class="sp"><b>${t}</b><div class="mu sm">${d}</div>${btn||''}</div></div>`;
  return`<div class="card"><div class="row"><b class="sp">Seus primeiros passos</b><span class="ac sm b">${d1?1:0} de 3</span></div>
    ${it(1,'Responder a avaliação',d1?'Pronto! O resultado fica na aba Avaliação.':'Medidas, objetivo e rotina. Leva uns 3 minutos.',d1?'done':'now',d1?'':'<button class="btn block" data-act="avNew" style="margin-top:8px">Responder agora</button>')}
    ${it(2,'Montar meu treino','3 perguntas rápidas: objetivo, dias por semana e onde você treina.',d1?'now':'next','<button class="btn pri block" data-act="go" data-v="montar" style="margin-top:8px">Montar meu treino</button><button class="btn ghost block" data-act="newPlan">Já treino: quero montar sozinho</button>')}
    ${it(3,'Fazer o primeiro treino','O app mostra cada exercício, as séries e conta o descanso para você.','next')}</div>
    ${ME.role!=='master'?'<div class="banner">ℹ️ Prefere que seu treinador monte? Ele monta pela conta dele e o treino aparece aqui sozinho.</div>':''}`}
async function loadManage(uid,name){const{data,error}=await SB.from('user_docs').select('program').eq('user_id',uid).maybeSingle();if(error)throw new Error(friendlyErr(error));MANAGE={uid,name,lib:libFrom(data&&data.program)||emptyLib(),dirty:false}}
function ADV(){return!!(S&&S.settings&&S.settings.adv)}
let PROG='evo';
function progSeg(t){return`<div class="seg" style="margin-bottom:10px">${[['evo','📈 Evolução'],['hist','🕒 Histórico']].map(([k,l])=>`<button class="${t===k?'on':''}" data-act="progTab" data-t="${k}">${l}</button>`).join('')}</div>`}
VIEWS.progresso=function(){return PROG==='hist'?VIEWS.historico():VIEWS.evolucao()};
VIEWS.perfil=function(){return VIEWS.ajustes()};
VIEWS.treinos=function(){const p=myActive();
  let h=hdr('Treinos','Toque em um treino para ver ou trocar exercícios',false,syncBadge());
  if(!p)return h+`<div class="card hero"><h2>Você ainda não tem um treino</h2><p class="mu sm">Responda 3 perguntas e o app monta o seu treino. Ou crie do zero, se preferir.${ME.role!=='master'?' Seu treinador também pode montar para você.':''}</p><button class="btn pri block" data-act="go" data-v="montar">Montar meu treino</button><div style="height:8px"></div><button class="btn block" data-act="newPlan">Criar do zero</button><div style="height:8px"></div><button class="btn ghost block" data-act="go" data-v="planos">Ver meus planos</button></div>`;
  const w=progOf(p).week,N=weeksOf(p),done=doneThisWeek(p),nx=nextSession(p);
  h+=`<div class="card"><div class="row"><div class="sp"><div class="mu xs b">MEU TREINO ATUAL</div><div class="b" style="font-size:18px">${esc(p.name)}</div><div class="mu sm">${w>N?'Concluído':'Semana '+w+' de '+N} · ${p.sessions.length} treino${p.sessions.length===1?'':'s'} por semana</div></div>${w<=N?phPill(p,w):''}</div>${weekbar(p,w)}
    <div style="margin-top:6px">${p.sessions.map((x,i)=>`<div class="li tap" data-act="go" data-v="session" data-id="${x.id}" data-pid="${p.id}"><span class="pill" style="min-width:30px;text-align:center">${String.fromCharCode(65+i)}</span><div class="t"><b>${esc(x.name)}</b><span class="mu sm">${x.exercises.length} exercício${x.exercises.length===1?'':'s'}${x.groups?' · '+esc(x.groups):''}</span></div>${done.has(x.id)?'<span class="ok sm b">feito ✓</span>':nx&&nx.id===x.id?'<span class="pill" style="background:var(--ac);color:#fff">próximo</span>':''}<span class="mu">›</span></div>`).join('')||'<div class="li mu sm">Nenhum treino ainda.</div>'}</div></div>
    <div class="grid2"><button class="btn" data-act="addSess" data-pid="${p.id}">+ Adicionar treino</button><button class="btn" data-act="go" data-v="planos">Planos de treino</button></div>
    <div style="height:8px"></div><button class="btn block" data-act="go" data-v="plan" data-id="${p.id}">⚙️ Configurar plano${ADV()?' (fases e cargas)':''}</button>`;
  return h};
VIEWS.avaliacao=function(){const isM=ME.role==='master';
  let h=hdr('Avaliação',isM?'Avaliações de todos os alunos':'Medidas, composição corporal e evolução',false,syncBadge());
  if(isM)h+=`<div class="seg" style="margin-bottom:10px">${[['rec','Recebidas'],['mine','Minha']].map(([k,l])=>`<button class="${AVT===k?'on':''}" data-act="avTab" data-t="${k}">${l}</button>`).join('')}</div>`;
  if(isM&&AVT==='rec')return h+(window.AV&&VIEWS.avall?VIEWS.avall({embed:true}):'');
  h+=(window.AV&&VIEWS.aval?VIEWS.aval({embed:true}):'');
  return h};
let AVT='rec';
VIEWS.weights=function(){const B=bodyOf(),w=weightsSorted(B).reverse();let h=hdr('Peso corporal',w.length+' registro(s)',true);
  h+=`<div class="card">${weightChart(B)}</div><div class="card" style="padding:4px 14px">${w.map((x,i)=>{const prev=w[i+1];const d=prev?r2(x.kg-prev.kg):null;return`<div class="li"><span class="pill" style="min-width:52px;text-align:center">${dshort(x.date)}</span><div class="t"><b>${fnum(x.kg,1)} kg</b><span class="mu sm">${d!=null?(d>0?'+':'')+fnum(d,1)+' kg':'primeiro registro'}</span></div><button class="ib" data-act="delWeight" data-date="${x.date}" style="color:var(--bad)">✕</button></div>`}).join('')}</div>
  <button class="btn pri block" data-act="addWeight">+ Registrar peso</button>`;return h};

/* ---------- CALENDÁRIO DE TREINOS (Histórico) ---------- */
const CAL={};
function ymOf(d){return iso(d).slice(0,7)}
function weekStartISO(s){const d=pISO(s),k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return iso(d)}
function weekStreak(logs){const wk=new Set(logs.map(L=>weekStartISO(L.date)));let d=pISO(weekStartISO(iso(new Date())));let n=0;
  if(!wk.has(iso(d)))d.setDate(d.getDate()-7); // semana atual ainda pode estar em andamento
  while(wk.has(iso(d))){n++;d.setDate(d.getDate()-7)}return n}
function calendarHTML(logs,key,tap,nost){const today=iso(new Date()),cur=ymOf(new Date());const ym=CAL[key]||cur;const[y,m]=ym.split('-').map(Number);
  const by={};logs.forEach(L=>{(by[L.date]=by[L.date]||[]).push(L)});
  const first=new Date(y,m-1,1),days=new Date(y,m,0).getDate(),lead=(first.getDay()+6)%7;
  const mLogs=logs.filter(L=>L.date.startsWith(ym)),nDays=Object.keys(by).filter(d=>d.startsWith(ym)).length;
  const elapsed=ym===cur?new Date().getDate():days,weeks=Math.max(1,elapsed/7);
  const minYm=logs.length?logs.reduce((a,L)=>L.date<a?L.date:a,logs[0].date).slice(0,7):cur;
  let h=`<div class="card cal"><div class="row" style="margin-bottom:8px"><button class="ib" data-act="calNav" data-k="${key}" data-d="-1" ${ym<=minYm?'disabled style="opacity:.3"':''}>‹</button><b class="sp" style="text-align:center">${(t=>t.charAt(0).toUpperCase()+t.slice(1))(first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}))}</b><button class="ib" data-act="calNav" data-k="${key}" data-d="1" ${ym>=cur?'disabled style="opacity:.3"':''}>›</button></div>
    <div class="calg">${['S','T','Q','Q','S','S','D'].map(d=>`<span class="cw">${d}</span>`).join('')}${'<span></span>'.repeat(lead)}`;
  for(let d=1;d<=days;d++){const ds=`${ym}-${String(d).padStart(2,'0')}`,L=by[ds],fut=ds>today;
    h+=`<span class="cd${L?' on':''}${ds===today?' td':''}${fut?' fu':''}" ${L&&tap?`data-act="openLog" data-id="${L[0].id}"`:''} ${L?`title="${esc(L.map(x=>x.name).join(', '))}"`:''}>${d}${L&&L.length>1?`<i>${L.length}</i>`:''}</span>`}
  if(nost)return h+`</div><p class="mu xs" style="margin:10px 0 0">${nDays?'Toque num dia para ver o treino feito.':'Nenhum treino neste mês ainda.'}</p></div>`;
  h+=`</div><div class="stat" style="margin-top:12px"><div><b>${mLogs.length}</b><span>treinos no mês</span></div><div><b>${(mLogs.length/weeks).toLocaleString('pt-BR',{maximumFractionDigits:1})}</b><span>por semana</span></div><div><b>${weekStreak(logs)}</b><span>semana${weekStreak(logs)===1?'':'s'} seguida${weekStreak(logs)===1?'':'s'}</span></div></div>
    <div class="mu xs" style="margin-top:8px">${nDays} dia${nDays===1?'':'s'} com treino${ym===cur?' até hoje':''} · "semanas seguidas" conta as semanas (seg–dom) com ao menos 1 treino.</div></div>`;
  return h}
ACT.calNav=d=>{const cur=CAL[d.k]||ymOf(new Date());const[y,m]=cur.split('-').map(Number);CAL[d.k]=ymOf(new Date(y,m-1+(+d.d),1));render()};

/* ---------- AJUDA ---------- */
function helpRow(icon,title,desc){return`<div class="hl"><div class="hi">${icon}</div><div><b>${title}</b><div class="sm mu">${desc}</div></div></div>`}
function helpDot(c,t){return`<span style="display:inline-flex;align-items:center;gap:6px;background:var(--s2);color:var(--mu);font-size:12px;border-radius:999px;padding:6px 10px"><i style="width:8px;height:8px;border-radius:50%;display:inline-block;background:${c}"></i>${t}</span>`}
VIEWS.ajuda=function(){
  const sec=(t,body,open)=>`<details ${open?'open':''}><summary>${t}</summary><div style="margin-top:8px">${body}</div></details>`;
  let h=hdr('Ajuda','Legendas, termos e o que cada botão faz',true);
  h+=sec('📖 Termos do treino',
    helpRow('<b>RIR</b>','RIR (Repetições em Reserva)','Quantas repetições você ainda conseguiria fazer ao terminar a série. RIR 2 = parou com 2 de sobra. RIR 0 = falha. O <b>RIR alvo</b> da semana vem da fase da periodização.')+
    helpRow('<b>4×8–12</b>','Séries × repetições','4 séries de 8 a 12 repetições. Ao atingir o topo da faixa (12) em todas as séries, é hora de subir a carga.')+
    helpRow('<b>90 s</b>','Descanso','Tempo de descanso entre as séries. O cronômetro dispara sozinho ao concluir cada série.')+
    helpRow('<b>Sem 1/4</b>','Semana do plano','Semana atual e total de semanas do plano. Avança sozinha quando todos os treinos da semana são concluídos.')+
    helpRow('🔥','Gasto calórico estimado','Estimativa baseada no seu metabolismo (Ajustes → Perfil corporal) e no tempo de treino. É uma média, para comparar com o relógio.')+
    helpRow('1RM','1RM estimado','Carga máxima estimada para 1 repetição, calculada a partir das séries registradas (aparece em Evolução).'),true);
  h+=sec('🏷️ Tipos de exercício',
    helpRow(KIND_ICON.load,'Carga × reps','Exercício com peso. Registre kg, repetições e RIR de cada série.')+
    helpRow(KIND_ICON.bw,'Peso corporal','Barra fixa, mergulho etc. O campo kg é o <b>lastro</b> (peso extra). Deixe em branco se usar só o corpo; "PC" = peso corporal.')+
    helpRow(KIND_ICON.time,'Tempo','Prancha e similares. Registre os segundos de cada série (kg é opcional).')+
    helpRow(KIND_ICON.cardio,'Cardio','Registre minutos, distância, zona/FC média e calorias. O ritmo (min/km) é calculado sozinho. Com FC média, o gasto calórico fica mais preciso.')+
    helpRow(KIND_ICON.wod,'WOD (Crossfit)','AMRAP (rounds + reps), For Time (tempo), EMOM (rounds) ou carga máxima. "Rx" = como prescrito; "Adaptado" = versão ajustada.'));
  h+=sec('🎨 Cores e indicadores',
    `<div class="sm mu" style="margin-bottom:6px"><b style="color:var(--tx)">Status da nuvem</b> (canto superior direito — toque para sincronizar):</div>
     <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:10px">${helpDot('var(--ok)','na nuvem')}${helpDot('var(--warn)','pendente')}${helpDot('var(--acu)','sincronizando')}${helpDot('var(--mu)','offline')}${helpDot('var(--bad)','erro')}</div>
     <div class="sm mu" style="margin-bottom:10px"><b style="color:var(--ok)">na nuvem</b>: tudo salvo. <b style="color:var(--warn)">pendente</b>: há alterações só neste aparelho, que sobem quando houver internet. <b>offline</b>: sem internet — o app funciona normalmente e sincroniza depois. <b style="color:var(--bad)">erro</b>: toque para tentar de novo.</div>`+
    helpRow('<span class="pill">Fase</span>','Etiqueta da fase','Nome da fase atual da periodização (ex.: Acumulação, Manutenção, Deload), na cor da fase.')+
    helpRow('▬▬▬','Barra de semanas','Cada traço é uma semana do plano, na cor da sua fase. O traço com contorno é a semana atual.')+
    helpRow('<span style="color:var(--ok)">✓</span>','Treino feito','Nos quadrinhos da semana: verde com ✓ = feito; contorno laranja = <b>próximo</b> treino.')+
    helpRow('<div class="kg" style="padding:2px 6px">Plano<b> 60 kg</b></div>','Carga do plano','Carga prevista para esta semana. "—" = ainda sem carga: a que você usar no treino vira a base do plano ao finalizar.')+
    helpRow('<span style="color:var(--ok)">▍</span>','Sugestão verde','Você atingiu o topo da faixa: pode subir a carga. Pode trazer um botão para ajustar o plano.')+
    helpRow('<span style="color:var(--warn)">▍</span>','Sugestão amarela','Abaixo da faixa em alguma série: mantenha a carga até completar as repetições.')+
    helpRow('<span style="color:var(--acu)">▍</span>','Sugestão azul','Dentro da faixa: siga o plano e busque mais repetições.')+
    helpRow('<span class="mu">Última</span>','Último desempenho','O que você fez neste exercício no treino anterior, para servir de referência.'));
  h+=sec('▶️ Botões do treino',
    helpRow('<span class="btn pri smb" style="pointer-events:none">Iniciar</span>','Iniciar treino','Abre o treino com as séries prontas. Você também pode tocar em qualquer quadrinho da semana para fazer outro treino.')+
    helpRow('<span class="chk" style="display:inline-grid;place-items:center;width:34px;height:30px;pointer-events:none">✓</span>','Concluir série','Marca a série como feita e inicia o descanso. A carga digitada é copiada para as séries seguintes.')+
    helpRow('<span style="color:var(--ac)">🔗 Bi-set 1/2</span>','Exercícios conjugados','Ao concluir a série do 1º exercício, o app vai direto para o próximo, sem descanso. O cronômetro de descanso só começa após a série do último exercício do grupo.')+
    helpRow('<b>+ Série / − Série</b>','Adicionar ou remover série','Muda a quantidade de séries só neste treino.')+
    helpRow('<b>dicas</b>','Dicas do exercício','Mostra a explicação do exercício (também abre ao tocar no nome).')+
    helpRow('⏸','Pausar','Pausa e retoma o cronômetro do treino.')+
    helpRow('<span class="btn pri smb" style="pointer-events:none">Finalizar</span>','Finalizar treino','Salva o treino no histórico, atualiza a semana e preenche cargas vazias do plano.')+
    helpRow('<span style="color:var(--bad)">Descartar</span>','Descartar treino','Apaga o treino em andamento sem salvar.')+
    helpRow('<b>Encerrar semana ›</b>','Encerrar semana','Avança para a próxima semana mesmo sem fazer todos os treinos.')+
    helpRow('💾','Salvamento automático','Tudo o que você digita é salvo na hora. Se fechar o app no meio, o treino continua de onde parou.'));
  h+=sec('📅 Planos',
    helpRow('<b>Montar treino</b>','Montar em 3 perguntas','Escolha objetivo, dias por semana, tempo e local: o app monta os treinos a partir dos modelos prontos. Depois você troca exercícios, séries e cargas à vontade. O master também monta para o cliente direto da avaliação dele.')+
    helpRow('<b>+ Novo plano</b>','Novo plano (avançado)','Escolha nome, objetivo, periodização e os treinos: em branco, um modelo pronto ou cópia de outro plano.')+
    helpRow('<b>Tornar ativo</b>','Tornar ativo','Define qual plano aparece em Hoje. Só um plano fica ativo por vez.')+
    helpRow('<b>Editar periodização</b>','Periodização','Fases, semanas, RIR alvo e como a carga evolui: <b>subir carga</b> (kg por semana), <b>subir %</b>, <b>manter</b> ou <b>deload</b> (% do pico, para recuperar).')+
    helpRow('<b>Gerar progressão</b>','Gerar progressão','Recalcula as cargas de todas as semanas a partir da carga base, seguindo a periodização. "Regerar de todos" faz isso em todos os exercícios.')+
    helpRow('<b>Novo ciclo</b>','Novo ciclo','Recomeça o plano usando as cargas que você realmente alcançou.')+
    helpRow('<b style="color:var(--ac)">🔗</b>','Bi-set / Tri-set','No treino do plano, toque em <b>＋ juntar em bi-set</b> entre dois exercícios para executá-los em sequência, sem descanso. Juntando 3 vira tri-set; 4 ou mais, circuito. O descanso vale após o último exercício do grupo (use o "Timer" dele). Toque de novo para separar.')+
    helpRow('<b>↑ ↓</b>','Reordenar','Muda a ordem de treinos, exercícios e fases.')+
    helpRow('<b>Duplicar / Excluir</b>','Duplicar ou excluir','Copia ou apaga o plano, o treino ou o exercício.')+
    helpRow('<b>Banco</b>','Banco de exercícios','Cerca de 300 exercícios (musculação, aeróbico, core e crossfit), com busca e filtro por grupo.'));
  h+=sec('📈 Progresso, Avaliação e Ajustes',
    helpRow('📈','Progresso','Aba Progresso. <b>Evolução</b>: resumo da semana, peso corporal e o histórico de cargas e 1RM de cada exercício. <b>Histórico</b>: calendário com os dias treinados e a lista de treinos.')+
    helpRow('📅','Treinos','Aba Treinos: o plano atual e seus treinos (A, B, C…). Toque em um treino para ver, trocar, adicionar ou remover exercícios. Todos os planos (em andamento, próximos e finalizados) ficam em Perfil → Planos de treino.')+
    helpRow('🩺','Avaliação','Aba Avaliação: um único questionário com contato, medidas básicas, circunferências, dobras cutâneas e frequência cardíaca de repouso (opcionais, com instruções de como medir), objetivo, rotina e limitações. O resultado mostra IMC, gasto calórico, % de gordura, massas gorda e magra, cintura/quadril, cintura/altura, FC máxima e zonas de treino, comparando com a avaliação anterior. Na reavaliação, os dados que não mudam já vêm preenchidos. Cada pessoa vê só as próprias; o administrador vê todas.')+
    helpRow('⚡','Opções avançadas','Em Ajustes. Ligue <b>Sempre mostrar opções avançadas</b> para ver fases, RIR e progressão de cargas abertas nos planos.')+
    helpRow('⚙️','Ajustes','Planos de treino, avaliação, ajuda, aparência, perfil corporal (para as calorias), sons e alertas, conta e backup.')+
    helpRow('🌓','Aparência','Em Ajustes: tema Escuro, Claro ou Automático (segue o iPhone). A escolha vale para o aparelho em que foi feita.')+
    helpRow('⬇️','Backup','"Exportar" gera uma cópia extra dos seus dados; "Importar" restaura essa cópia.'));
  return h};

/* ================= NUVEM: login, sincronização e painel master ================= */
function hsh(str){let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return h.toString(36)+':'+str.length}
function stateDoc(){return{v:3,prog:S.prog,settings:S.settings,active:S.active||null,body:S.body||null}}
function baseHashes(){const y=S._sync;y.progH=hsh(JSON.stringify(S.lib));y.stateH=hsh(JSON.stringify(stateDoc()))}
function detect(){const y=S._sync;const ph=hsh(JSON.stringify(S.lib));if(ph!==y.progH){y.progH=ph;y.progEd=Date.now();y.progDirty=true}
  const sh=hsh(JSON.stringify(stateDoc()));if(sh!==y.stateH){y.stateH=sh;y.stateEd=Date.now();y.stateDirty=true}}
function markLog(id){const a=S._sync.dirtyLogs;if(!a.includes(id))a.push(id)}
function pending(){if(!S||!S._sync)return 0;const y=S._sync;return(y.progDirty?1:0)+(y.stateDirty?1:0)+y.dirtyLogs.length+y.delLogs.length}
let SYNCING=false,SYNC_ERR=null,syncT=null;
function syncSoon(ms){clearTimeout(syncT);syncT=setTimeout(()=>sync(),ms||2500)}
function syncBadge(){const p=pending();let c,t;if(!navigator.onLine){c='var(--mu)';t='offline'}else if(SYNCING){c='var(--acu)';t='sincronizando'}else if(SYNC_ERR){c='var(--bad)';t='erro'}else if(p){c='var(--warn)';t='pendente'}else{c='var(--ok)';t='na nuvem'}
  return`<button class="sync" data-act="syncNow" title="Sincronizar"><i style="background:${c}"></i>${t}</button>`}
function syncText(){const y=S&&S._sync;const p=pending();
  return`${y&&y.lastSync?'Última sincronização: '+new Date(y.lastSync).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'Ainda não sincronizado'}${p?` · <b style="color:var(--warn)">${p} alteração(ões) aguardando envio</b>`:''}${SYNC_ERR?`<br><span style="color:var(--bad)">${esc(SYNC_ERR)}</span>`:''}`}
let RESUMED=false;
function refreshBadges(){document.querySelectorAll('.sync').forEach(b=>b.outerHTML=syncBadge())}

function sbInit(){if(!SB&&window.supabase&&/^https?:/.test(SB_URL))SB=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'treino.auth',detectSessionInUrl:false}});return SB}
function userKey(id){return'treino.u.'+id}
function loadUser(){KEY=userKey(ME.id);load();}

async function sync(manual){
  if(!ME||!SB||!S||SYNCING)return;
  if(!TPL.loaded&&!TPL.loading)loadTpl();
  if(!navigator.onLine){if(manual)toast('Sem internet — os dados ficam guardados e sobem depois');refreshBadges();return}
  SYNCING=true;refreshBadges();let changed=false;
  try{
    if(dirty)saveNow();
    const y=S._sync,uid=ME.id;
    // perfil (ativo? papel?)
    const{data:pr,error:pe}=await SB.from('profiles').select('id,name,email,role,active').eq('id',uid).maybeSingle();
    if(pe)throw pe;
    if(!pr||!pr.active){ME.active=false;localStorage.setItem('treino.me',JSON.stringify(ME));render();return}
    if(pr.name!==ME.name||pr.role!==ME.role){Object.assign(ME,pr);localStorage.setItem('treino.me',JSON.stringify(ME));changed=true}
    // envia programa/estado (só se o local for mais recente que o da nuvem)
    if(y.progDirty){const ed=y.progEd;const{error}=await SB.from('user_docs').update({program:S.lib,program_edited:ed}).eq('user_id',uid).lt('program_edited',ed);if(error)throw error;if(y.progEd===ed)y.progDirty=false}
    if(y.stateDirty){const ed=y.stateEd;const{error}=await SB.from('user_docs').update({state:stateDoc(),state_edited:ed}).eq('user_id',uid).lt('state_edited',ed);if(error)throw error;if(y.stateEd===ed)y.stateDirty=false}
    // envia treinos
    if(y.dirtyLogs.length){const ids=y.dirtyLogs.slice();const rows=ids.map(id=>S.logs.find(L=>L.id===id)).filter(Boolean).map(L=>({id:L.id,user_id:uid,date:L.date,data:L,deleted:false}));
      if(rows.length){const{error}=await SB.from('workout_logs').upsert(rows);if(error)throw error}y.dirtyLogs=y.dirtyLogs.filter(id=>!ids.includes(id))}
    if(y.delLogs.length){const del=y.delLogs.slice();const{error}=await SB.from('workout_logs').upsert(del.map(d=>({id:d.id,user_id:uid,date:d.date,data:{},deleted:true})));if(error)throw error;y.delLogs=y.delLogs.filter(d=>!del.includes(d))}
    // baixa programa/estado
    const{data:doc,error:de}=await SB.from('user_docs').select('program,program_edited,state,state_edited').eq('user_id',uid).maybeSingle();if(de)throw de;
    if(doc){
      if(+doc.program_edited>y.progEd&&!y.progDirty){const lib=libFrom(doc.program);if(lib){S.lib=lib;migrate();y.progEd=+doc.program_edited;y.progH=hsh(JSON.stringify(S.lib));changed=true}}
      if(+doc.state_edited>y.stateEd&&!y.stateDirty&&doc.state&&doc.state.prog){const st=doc.state;S.prog=st.prog||S.prog;if(st.body)S.body=st.body;S.settings=Object.assign(S.settings,st.settings||{});const ra=st.active;if(ra&&ra.id&&!S.logs.some(L=>L.id===ra.id)&&(!S.active||S.active.id===ra.id)){const was=!!S.active;S.active=ra;restoreTimer();if(!was)RESUMED=true}migrate();y.stateEd=+doc.state_edited;y.stateH=hsh(JSON.stringify(stateDoc()));changed=true}
    }
    // baixa treinos novos/alterados
    const since=y.lastPull?new Date(Date.parse(y.lastPull)-5*60e3).toISOString():'1970-01-01T00:00:00Z';let from=0,maxU=y.lastPull;
    for(;;){const{data:rows,error}=await SB.from('workout_logs').select('id,data,deleted,updated_at').eq('user_id',uid).gt('updated_at',since).order('updated_at').range(from,from+499);if(error)throw error;
      for(const r of rows){const i=S.logs.findIndex(L=>L.id===r.id);
        if(r.deleted){if(i>=0){S.logs.splice(i,1);changed=true}}
        else if(!y.dirtyLogs.includes(r.id)){if(i<0){S.logs.push(r.data);changed=true}else if(JSON.stringify(S.logs[i])!==JSON.stringify(r.data)){S.logs[i]=r.data;changed=true}}
        if(!maxU||r.updated_at>maxU)maxU=r.updated_at}
      if(rows.length<500)break;from+=500}
    y.lastPull=maxU;
    try{const{data:cat,error:ce}=await SB.from('exercise_catalog').select('id,name,category,grp,equipment,kind').eq('deleted',false);if(!ce&&cat){CUSTOM_CAT=cat.map(c=>({id:'u_'+c.id,name:c.name,cat:c.category,grp:c.grp||'Outros',eq:c.equipment||'—',kind:c.kind||'load',custom:true}));localStorage.setItem('treino.cat',JSON.stringify(CUSTOM_CAT))}}catch(e){}
    if(changed)S.logs.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.startedAt-b.startedAt);
    if(!y.lastSeen||Date.now()-y.lastSeen>10*60e3){SB.from('profiles').update({last_seen_at:new Date().toISOString()}).eq('id',uid).then(()=>{});y.lastSeen=Date.now()}
    y.lastSync=Date.now();SYNC_ERR=null;dirty=true;saveNow();
  }catch(e){console.warn('sync',e);SYNC_ERR=friendlyErr(e);if(manual)toast('Não sincronizou: '+SYNC_ERR)}
  finally{SYNCING=false;if(S&&S.active&&S.logs.some(L=>L.id===S.active.id)){S.active=null;T=null;changed=true}if(changed&&!document.querySelector('input:focus'))render();else refreshBadges();if(RESUMED){RESUMED=false;backupActive();V.tab='hoje';V.stack=[];render();toast('Treino em andamento retomado 💪')}if(manual&&!SYNC_ERR)toast('Sincronizado ✓')}
}
function friendlyErr(e){const m=String(e&&(e.message||e.error_description||e)||'');
  if(/JWT|token|401|session/i.test(m))return'sessão expirada — saia e entre novamente';if(/Failed to fetch|NetworkError|network/i.test(m))return'sem conexão com o servidor';return m.slice(0,140)}
window.addEventListener('online',()=>sync());window.addEventListener('offline',refreshBadges);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
setInterval(()=>{if(!document.hidden)sync()},120e3);

/* ---------- login ---------- */
function viewLogin(){const last=localStorage.getItem('treino.lastEmail')||'';
  return`<div class="login"><div class="logo"><svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg></div><h1>Treino</h1><div class="brand2">&amp; Dieta 70</div><p class="mu">Entre com o usuário criado pelo administrador.</p>
   <label class="f"><span>E-mail</span><input id="lgEmail" type="email" autocomplete="username" autocapitalize="off" value="${esc(last)}"></label>
   <label class="f"><span>Senha</span><input id="lgPass" type="password" autocomplete="current-password"></label>
   <div id="lgMsg" class="sm" style="color:var(--bad);min-height:20px"></div>
   <button class="btn pri block" data-act="login" id="lgBtn">Entrar</button>
   <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--s3)"><p class="mu sm">Primeiro acesso ou esqueceu a senha?</p><button class="btn block" data-act="avOpenResend">Criar ou redefinir minha senha</button></div>
   ${/^https?:/.test(SB_URL)?'':'<p class="sm" style="color:var(--bad)">Servidor não configurado.</p>'}</div>`}
function viewDisabled(){return`<div class="login"><h1>Conta desativada</h1><p class="mu">Seu acesso foi desativado pelo administrador. Fale com ele para reativar.</p><button class="btn block" data-act="logout">Sair</button></div>`}
async function doLogin(){const em=($('#lgEmail').value||'').trim().toLowerCase(),pw=$('#lgPass').value||'',msg=$('#lgMsg'),btn=$('#lgBtn');
  if(!em||!pw){msg.textContent='Informe e-mail e senha.';return}
  if(!sbInit()){msg.textContent='Servidor não configurado.';return}
  if(!navigator.onLine){msg.textContent='Sem internet. O primeiro login precisa de conexão.';return}
  btn.disabled=true;btn.textContent='Entrando…';msg.textContent='';
  try{
    const{data,error}=await SB.auth.signInWithPassword({email:em,password:pw});
    if(error){msg.textContent=/banned/i.test(error.message)?'Usuário desativado.':/invalid/i.test(error.message)?'E-mail ou senha incorretos.':error.message;return}
    const{data:p,error:pe}=await SB.from('profiles').select('id,name,email,role,active').eq('id',data.user.id).single();
    if(pe||!p){msg.textContent='Perfil não encontrado.';await SB.auth.signOut({scope:'local'});return}
    if(!p.active){msg.textContent='Usuário desativado.';await SB.auth.signOut({scope:'local'});return}
    ME=p;localStorage.setItem('treino.me',JSON.stringify(ME));localStorage.setItem('treino.lastEmail',em);
    loadUser();if(S.active)restoreTimer();V.tab='hoje';V.stack=[];render();await sync();await offerLegacy();render();wake();
  }catch(e){msg.textContent=friendlyErr(e)}finally{if(btn.isConnected){btn.disabled=false;btn.textContent='Entrar'}}}
async function offerLegacy(){let L;try{L=JSON.parse(localStorage.getItem('treino.v1')||'null')}catch(e){}
  if(!L)return;const isM=ME.role==='master';const lib=libFrom(L.program);const lp=lib&&lib.plans[0];
  const nLogs=(L.logs||[]).filter(x=>!S.logs.some(y=>y.id===x.id)).length;const takeProg=isM&&!S.lib.plans.length&&lp;
  const drop=()=>{if(isM)localStorage.setItem('treino.v1.migrado',localStorage.getItem('treino.v1'));localStorage.removeItem('treino.v1')};
  if(!nLogs&&!takeProg){drop();return}
  return new Promise(res=>modal('Dados deste aparelho',`<p>Encontrei dados salvos neste aparelho de antes do login:</p><ul class="sm">${nLogs?`<li><b>${nLogs}</b> treino(s) registrado(s)</li>`:''}${takeProg?`<li>Seu programa (<b>${lp.sessions.length}</b> treinos, ${weeksOf(lp)} semanas) e a semana atual (<b>${L.week||1}</b>)</li>`:''}</ul><p>Enviar para a conta de <b>${esc(ME.name)}</b>?</p>`,
    [{label:'Agora não',fn:res},{label:'Enviar',cls:'pri',fn:()=>{
      if(takeProg){S.lib.plans.push(lp);S.lib.activeId=lp.id;S.prog[lp.id]={week:L.week||1};if(L.settings)['sound','wake'].forEach(k=>{if(L.settings[k]!=null)S.settings[k]=L.settings[k]})}
      const pid=takeProg?lp.id:null,pname=takeProg?lp.name:'Programa anterior';
      (L.logs||[]).forEach(x=>{if(!S.logs.some(y=>y.id===x.id)){x.planId=x.planId||pid||'legacy';x.planName=x.planName||pname;(x.exercises||[]).forEach(e=>{e.kind=e.kind||'load'});S.logs.push(x);markLog(x.id)}});sortLogs();
      drop();commit();sync();render();toast('Dados enviados para sua conta');res()}}]))}
function logoutNow(){const id=ME&&ME.id;if(SB)SB.auth.signOut({scope:'local'}).catch(()=>{});if(id&&!pending())localStorage.removeItem(userKey(id));
  localStorage.removeItem('treino.me');ME=null;KEY=null;S=null;MANAGE=null;USERS=null;T=null;V.tab='hoje';V.stack=[];render()}

/* ---------- edição dos planos de outro usuário (master) ---------- */
async function saveManaged(){const M=MANAGE;if(!M||!M.dirty)return;if(!navigator.onLine){toast('Sem internet — alterações de '+M.name+' NÃO foram salvas');return}
  M.saving=true;{const r=await SB.from('user_docs').select('program').eq('user_id',M.uid).maybeSingle();const rl=libFrom(r.data&&r.data.program);if(rl&&rl.anam)M.lib.anam=rl.anam}
const{error}=await SB.from('user_docs').update({program:M.lib,program_edited:Date.now()}).eq('user_id',M.uid);M.saving=false;
  if(error)toast('Erro ao salvar: '+friendlyErr(error));else{M.dirty=false;toast('Salvo para '+M.name)}}
async function openManage(u){if(!navigator.onLine){toast('Precisa de internet');return}
  const{data,error}=await SB.from('user_docs').select('program').eq('user_id',u.id).maybeSingle();if(error){toast(friendlyErr(error));return}
  MANAGE={uid:u.id,name:u.name,lib:libFrom(data&&data.program)||emptyLib(),dirty:false};go('planos',{uid:u.id})}
/* ---------- painel master ---------- */
async function loadUsers(){if(!navigator.onLine){USERS={err:'Sem internet'};render();return}
  const{data,error}=await SB.rpc('admin_list_users');USERS=error?{err:friendlyErr(error)}:{list:data};const top=V.stack[V.stack.length-1];if(top&&(top.view==='users'||top.view==='user'))render()}
function rel(ts){if(!ts)return'nunca';const d=(Date.now()-Date.parse(ts))/864e5;return d<1?'hoje':d<2?'ontem':Math.floor(d)+' dias atrás'}
VIEWS.users=function(){if(!USERS){loadUsers();return hdr('Usuários','',true)+'<div class="empty">Carregando…</div>'}
  let h=hdr('Usuários',USERS.list?USERS.list.length+' conta(s)':'',true,'<button class="btn smb" data-act="reloadUsers">↻</button>');
  if(USERS.err)return h+`<div class="card" style="color:var(--bad)">${esc(USERS.err)}</div>`;
  h+=`<button class="btn pri block" data-act="newUser">+ Novo usuário</button><div class="card" style="padding:4px 14px;margin-top:12px">${USERS.list.map(u=>`<div class="li tap" data-act="go" data-v="user" data-id="${u.id}"><span class="pill" style="min-width:12px;background:${u.active?'var(--ok)':'var(--s3)'};padding:5px"></span><div class="t"><b>${esc(u.name)}${u.role==='master'?' · master':''}</b><span class="mu sm">${u.workouts} treino(s) · último: ${u.last_workout?dshort(String(u.last_workout)):'—'} · visto ${rel(u.last_seen_at)}${u.active?'':' · <span style="color:var(--bad)">desativado</span>'}</span></div><span class="mu">›</span></div>`).join('')}</div>`;
  return h};
VIEWS.user=function({id}){const u=USERS&&USERS.list&&USERS.list.find(x=>x.id===id);if(!u){loadUsers();return hdr('Usuário','',true)+'<div class="empty">Carregando…</div>'}
  const me=u.id===ME.id;
  let h=hdr(u.name,esc(u.email),true);
  h+=`<div class="stat"><div><b>${u.workouts}</b><span>treinos</span></div><div><b>${u.last_workout?dshort(String(u.last_workout)):'—'}</b><span>último treino</span></div><div><b style="font-size:15px">${rel(u.last_seen_at)}</b><span>visto no app</span></div></div>`;
  if(!UB[id]){UB[id]={loading:true};SB.from('user_docs').select('state').eq('user_id',id).maybeSingle().then(({data})=>{UB[id]=(data&&data.state&&data.state.body)||{};const t=topV();if(t&&(t.view==='user'||t.view==='uhist')&&t.params.id===id)render()})}
  const UBd=UB[id];if(UBd&&!UBd.loading)h+=`<h3>Perfil corporal</h3><div class="card">${(UBd.weights&&UBd.weights.length)||UBd.height?bodySummary(UBd)+(weightsSorted(UBd).length>1?'<div style="height:8px"></div>'+weightChart(UBd):''):'<div class="mu sm">Ainda não preenchido por ele.</div>'}</div>`;
  h+=`<div class="card"><div class="row"><span class="sp">Status</span><b style="color:${u.active?'var(--ok)':'var(--bad)'}">${u.active?'Ativo':'Desativado'}</b></div><div class="row" style="margin-top:6px"><span class="sp">Planos</span><b>${u.has_program?'sim':'nenhum ainda'}</b></div><div class="row" style="margin-top:6px"><span class="sp">Criado em</span><span>${new Date(u.created_at).toLocaleDateString('pt-BR')}</span></div></div>`;
  if(!me)h+=`<button class="btn pri block" data-act="manageProg" data-id="${u.id}">Ver / montar planos</button><div style="height:8px"></div>
    ${myActive()?`<button class="btn block" data-act="copyProg" data-id="${u.id}">Enviar uma cópia do meu plano ativo</button><div style="height:8px"></div>`:''}
    <button class="btn block" data-act="avOpenUser" data-id="${u.id}">📋 Avaliações do aluno</button><div style="height:8px"></div>
    ${MASTER_HISTORY?`<button class="btn block" data-act="go" data-v="uhist" data-id="${u.id}">Ver histórico (somente leitura)</button><div style="height:8px"></div>`:''}`;
  h+=`<button class="btn block" data-act="renameUser" data-id="${u.id}">Alterar nome</button><div style="height:8px"></div>`;
  if(!me)h+=`<button class="btn block" data-act="pwUser" data-id="${u.id}">Redefinir senha</button><div style="height:8px"></div><button class="btn block" data-act="toggleUser" data-id="${u.id}" style="color:${u.active?'var(--bad)':'var(--ok)'}">${u.active?'Desativar usuário':'Reativar usuário'}</button>`;
  return h};
const UH={},UB={};
VIEWS.uhist=function({id}){const u=USERS&&USERS.list&&USERS.list.find(x=>x.id===id);let h=hdr('Histórico',esc(u?u.name:''),true);
  if(!UH[id]){SB.from('workout_logs').select('data').eq('user_id',id).eq('deleted',false).order('date',{ascending:false}).limit(200).then(({data,error})=>{UH[id]=error?{err:friendlyErr(error)}:{list:(data||[]).map(r=>r.data)};render()});return h+'<div class="empty">Carregando…</div>'}
  if(UH[id].err)return h+`<div class="card">${esc(UH[id].err)}</div>`;if(!UH[id].list.length)return h+'<div class="empty">Nenhum treino registrado.</div>';
  const ub=UB[id]&&!UB[id].loading?UB[id]:null;return h+calendarHTML(UH[id].list,'u'+id,false)+UH[id].list.map(L=>`<div class="card"><div class="row"><b class="sp">${esc(L.name)}${(k=>k&&k.total?` <span class="mu sm">🔥 ${kcalTxt(k)}</span>`:'')(ub&&workoutKcal(L,ub))}</b><span class="mu sm">${dshort(L.date)} · ${esc(L.planName||'')} S${L.week}</span></div>${L.exercises.map(x=>`<div class="sm" style="margin-top:6px"><span class="mu">${KIND_ICON[x.kind||'load']||''} ${esc(x.name)}:</span> ${esc(exSummary(Object.assign({kind:'load'},x)))}</div>`).join('')}</div>`).join('')};
async function adminCall(body){const{data,error}=await SB.functions.invoke('admin-users',{body});
  if(error){let m=error.message;try{const j=await error.context.json();m=j.error||m}catch(e){}throw new Error(m)}if(data&&data.error)throw new Error(data.error);return data}
function genPass(){const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';let p='';const a=new Uint32Array(10);crypto.getRandomValues(a);a.forEach(v=>p+=c[v%c.length]);return p}
function busy(fn){return async()=>{try{await fn()}catch(e){toast(e.message||String(e))}}}

Object.assign(ACT,{
  login:()=>doLogin(),
  syncNow:()=>sync(true),
  logout:()=>{const p=pending();if(p)confirmBox('Sair da conta',`<p><b>${p} alteração(ões)</b> ainda não foram enviadas para a nuvem${navigator.onLine?'':' (você está sem internet)'}. Elas ficam guardadas neste aparelho e sobem quando você entrar de novo.</p>`,'Sair mesmo assim',logoutNow,true);else confirmBox('Sair da conta','Seus dados estão salvos na nuvem.','Sair',logoutNow)},
  reloadUsers:()=>{USERS=null;for(const k in UB)delete UB[k];for(const k in UH)delete UH[k];render()},
  openUsers:()=>{USERS=null;go('users')},
  manageProg:d=>{const u=USERS.list.find(x=>x.id===d.id);openManage(u)},
  copyProg:d=>{const u=USERS.list.find(x=>x.id===d.id),mine=myActive();if(!mine){toast('Você não tem plano ativo');return}
    confirmBox('Enviar plano',`Uma cópia de <b>${esc(mine.name)}</b> (${weeksOf(mine)} semanas, ${mine.sessions.length} treinos) será <b>adicionada</b> aos planos de <b>${esc(u.name)}</b> e ficará ativa para ele. Os outros planos dele não são apagados. As cargas serão as suas — ajuste depois.`,'Enviar',busy(async()=>{
      const{data,error}=await SB.from('user_docs').select('program').eq('user_id',u.id).maybeSingle();if(error)throw new Error(friendlyErr(error));const lib=libFrom(data&&data.program)||emptyLib();
      const c=clone(mine);c.id=uid36('p');c.tips=[];c.nutrition=[];c.created=Date.now();lib.plans.push(c);lib.activeId=c.id;
      const{error:e2}=await SB.from('user_docs').update({program:lib,program_edited:Date.now()}).eq('user_id',u.id);if(e2)throw new Error(friendlyErr(e2));toast('Plano enviado');USERS=null;render()}))},
  newUser:()=>{const pw=genPass();modal('Novo usuário',`<label class="f"><span>Nome</span><input id="nuName"></label><label class="f"><span>E-mail (será o login)</span><input id="nuEmail" type="email" autocapitalize="off"></label><label class="f"><span>Senha inicial</span><input id="nuPass" value="${pw}"></label><p class="mu sm">Anote a senha e passe para a pessoa. Mínimo 8 caracteres.</p>`,
    [{label:'Cancelar'},{label:'Criar',cls:'pri',keep:true,fn:busy(async()=>{const name=$('#nuName').value.trim(),email=$('#nuEmail').value.trim(),password=$('#nuPass').value;const r=await adminCall({action:'create',name,email,password});$('#modal').hidden=true;
      modal('Usuário criado ✓',`<p>Envie para <b>${esc(name)}</b>:</p><div class="card" style="user-select:all">Link: ${esc(location.origin+location.pathname)}<br>E-mail: ${esc(email)}<br>Senha: ${esc(password)}</div>`,[{label:'Fechar'},{label:'Montar plano',cls:'pri',fn:busy(async()=>{await loadUsers();const u=USERS.list.find(x=>x.id===r.id);if(u)openManage(u)})}]);USERS=null;render()})}])},
  pwUser:d=>{const u=USERS.list.find(x=>x.id===d.id);modal('Redefinir senha',`<p>Nova senha para <b>${esc(u.name)}</b>:</p><input id="npPass" value="${genPass()}">`,[{label:'Cancelar'},{label:'Salvar',cls:'pri',keep:true,fn:busy(async()=>{const pw=$('#npPass').value;await adminCall({action:'set_password',user_id:u.id,password:pw});$('#modal').hidden=true;toast('Senha alterada')})}])},
  renameUser:d=>{const u=USERS.list.find(x=>x.id===d.id);modal('Alterar nome',`<input id="rnName" value="${esc(u.name)}">`,[{label:'Cancelar'},{label:'Salvar',cls:'pri',keep:true,fn:busy(async()=>{await adminCall({action:'rename',user_id:u.id,name:$('#rnName').value});$('#modal').hidden=true;USERS=null;toast('Nome alterado');render()})}])},
  toggleUser:d=>{const u=USERS.list.find(x=>x.id===d.id);const act=!u.active;
    confirmBox(act?'Reativar usuário':'Desativar usuário',act?`<b>${esc(u.name)}</b> volta a ter acesso, com todo o histórico.`:`<b>${esc(u.name)}</b> perde o acesso imediatamente (não consegue mais entrar nem sincronizar). Os dados dele <b>não</b> são apagados e voltam se você reativar.`,act?'Reativar':'Desativar',busy(async()=>{await adminCall({action:'set_active',user_id:u.id,active:act});USERS=null;toast(act?'Reativado':'Desativado');render()}),!act)},
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&(e.target.id==='lgPass'||e.target.id==='lgEmail'))doLogin()});


/* ---------- ações gerais ---------- */
Object.assign(ACT,{
  tab:d=>{V.tab=d.t;V.stack=[];render();scrollTo(0,0)},
  progTab:d=>{PROG=d.t;render()},
  wzSet:d=>{WZ[d.k]=d.k==='days'?+d.v:d.v;WZ.preview=null;render()},
  wzSkip:()=>{V.stack=V.stack.filter(x=>x.view!=='montar');WZ=null;render();ACT.newPlan()},
  wzNext:()=>{WZ.step++;WZ.preview=null;render();scrollTo(0,0)},
  wzForClient:async d=>{if(!navigator.onLine){toast('Precisa de internet');return}try{const u=USERS&&USERS.list&&USERS.list.find(x=>x.id===d.uid);await loadManage(d.uid,(u&&u.name)||d.name||'cliente');WZ=null;go('montar',{uid:d.uid,aid:d.aid})}catch(e){toast(e.message)}},
  wzCreate:d=>{const w=WZ;if(!w)return;const p=w.preview||wzBuild(w),lib=LIB(),uid=w.uid;lib.plans.push(p);lib.activeId=p.id;if(!uid)S.prog[p.id]={week:1};psave();WZ=null;
    toast(uid?'Treino salvo e ativado para '+whoName():'Treino pronto!');
    if(uid){V.stack=V.stack.filter(x=>x.view!=='montar');go('plan',{id:p.id,uid});return}
    V.stack=[];V.tab=d.then==='edit'?'treinos':'hoje';render();scrollTo(0,0)},
  tplReset:d=>{const p=planById(d.pid,TPL.lib);if(!p)return;confirmBox('Restaurar modelo',`<p>Voltar <b>${esc(p.name)}</b> para a versão original do app? As suas alterações neste modelo serão perdidas. Planos já criados não mudam.</p>`,'Restaurar',async()=>{const{error}=await SB.from('workout_templates').delete().eq('id',p.tpl.id);if(error){toast(friendlyErr(error));return}delete TPL.rows[p.tpl.id];TPL.rebuild=true;tplPlans();toast('Modelo restaurado');render()})},
  avTab:d=>{AVT=d.t;render()},
  back:d=>{const t=topV();if(t&&t.view==='montar'&&WZ&&WZ.step>1){WZ.step--;WZ.preview=null;render();return}ACT._back(d)},
  _back:()=>{const t=V.stack.pop();if(t&&t.params&&t.params.uid&&!V.stack.some(x=>x.params&&x.params.uid)&&MANAGE&&MANAGE.dirty)saveManaged();render()},
  go:d=>{if(d.v==='picker'){PK.q='';PK.cat=d.mode==='insert'?'Crossfit':'';PK.grp=''}go(d.v,{id:d.id,pid:d.pid,sid:d.sid,eid:d.eid,mode:d.mode,uid:d.uid||''})},
  openLog:d=>go('log',{id:d.id}),
  start:d=>{if(S.active){if(S.active.sessionId===d.id){V.tab='hoje';V.stack=[];render();return}confirmBox('Treino em andamento',`Você tem <b>${esc(S.active.name)}</b> em andamento. Descartar e iniciar outro?`,'Descartar e iniciar',()=>{S.active=null;startWorkout(d.id)},true);return}startWorkout(d.id)},
  setTheme:d=>{try{localStorage.setItem(THEME_KEY,d.t)}catch(e){}applyTheme();render()},
  setDone:d=>{audio();const ax=S.active.exercises[+d.i],s=ax.sets[+d.j];
    document.querySelectorAll(`[data-wf][data-i="${d.i}"][data-j="${d.j}"]`).forEach(el=>s[el.dataset.wf]=num(el.value));
    if(s.done){s.done=false;save();render();return}
    const need=ax.kind==='time'?'sec':'reps';if(s[need]==null){const el=document.querySelector(`[data-wf="${need}"][data-i="${d.i}"][data-j="${d.j}"]`);if(el)el.focus();toast(ax.kind==='time'?'Informe os segundos':'Informe as repetições');return}
    s.done=true;save();const p=planById(S.active.planId,S.lib),f=p&&exIn(p,ax.exId);const nxs=ax.sets.findIndex(x=>!x.done);const nxe=S.active.exercises[+d.i+1];
    const X=S.active.exercises,ch=chainAt(X,+d.i);
    if(ch.len>1){const nm=chainName(ch.len);
      if(ch.pos<ch.len){const nx=X[+d.i+1],ns=nx.sets?nx.sets.findIndex(x=>!x.done):-1;
        if(nx.kind==='cardio'||nx.kind==='wod'||ns>=0){T=null;persistTimer();render();toast(`${nm}: sem descanso → ${nx.name}${ns>=0?' · série '+(ns+1):''}`);const el=document.getElementById('ex'+(+d.i+1));if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}}
      let first=-1,fs=-1;for(let q=ch.start;q<=ch.end;q++){const k=X[q].sets?X[q].sets.findIndex(x=>!x.done):-1;if(k>=0){first=q;fs=k;break}}
      const after=X[ch.end+1];
      startTimer(f&&f.e.restSec?f.e.restSec:90,nm+' concluído',first>=0?`${nm} · ${X[first].name} · série ${fs+1}`:(after?'Próximo: '+after.name:'Último exercício concluído'));render();return}
    startTimer(f&&f.e.restSec?f.e.restSec:90,ax.name,nxs>=0?`${ax.name} · série ${nxs+1}`:(nxe?'Próximo: '+nxe.name:'Último exercício concluído'));render()},
  xDone:d=>{const ax=S.active.exercises[+d.i];ax.done=!ax.done;save();render()},
  wodTimer:d=>{audio();const ax=S.active.exercises[+d.i],p=planById(S.active.planId,S.lib),f=p&&exIn(p,ax.exId);const cap=f&&f.e.wod&&f.e.wod.cap||10;startTimer(cap*60,ax.name,ax.name,'wod')},
  addSet:d=>{const ax=S.active.exercises[+d.i];const l=ax.sets[ax.sets.length-1];ax.sets.push({kg:l?l.kg:null,reps:null,rir:null,sec:null,done:false});save();render()},
  rmSet:d=>{const ax=S.active.exercises[+d.i];if(ax.sets.length>1)ax.sets.pop();save();render()},
  wkFocus:d=>{if(!S.active)return;S.active.focus=+d.i;save();render();const el=document.getElementById('ex'+d.i);if(el)el.scrollIntoView({block:'start',behavior:'smooth'})},
  toggleWhy:d=>{const ax=S.active&&S.active.exercises[+d.i];if(!ax)return;ax.open=!ax.open;save();render()},
  applySug:d=>{const ax=S.active.exercises[+d.i];const p=planById(S.active.planId,S.lib);const sg=suggest(ax,p,S.active.week);const f=exIn(p,ax.exId);if(!sg||!sg.act||!f)return;
    const e=f.e,before=e.plan.slice();shiftFuture(e,p,sg.act.from,sg.act.delta);const rows=[];for(let k=sg.act.from;k<=weeksOf(p);k++)if(before[k-1]!==e.plan[k-1])rows.push([`S${k}`,fkg(before[k-1]),`<b>${fkg(e.plan[k-1])}</b>`]);
    e.plan=before;confirmBox('Ajustar plano',`<p>${esc(e.name)}</p>${diffTable(rows,['Semana','Antes','Depois'])}`,'Aplicar',()=>{shiftFuture(e,p,sg.act.from,sg.act.delta);ax.applied=true;save();render();toast('Plano ajustado')})},
  finish:()=>{const A=S.active;const ok=A.exercises.filter(exHasData).length;
    if(!ok){confirmBox('Nada registrado','Nenhuma série ou bloco foi concluído. Deseja descartar este treino?','Descartar',()=>{S.active=null;T=null;save();saveNow();wake();render()},true);return}
    const pend=A.exercises.filter(x=>!exDone(x)).length;
    confirmBox('Finalizar treino',`<p><b>${ok}</b> de ${A.exercises.length} exercícios com registro · ${mmss(elapsedMs(A)/1000)} de treino.${(()=>{const k=workoutKcal(A,null,true);return k&&k.total?` Gasto estimado: <b>${kcalTxt(k)}</b> (ativas ~${k.active}).`:''})()}</p>${pend?'<p class="mu sm">Séries/blocos sem ✓ não serão salvos.</p>':''}`,'Salvar treino',finishWorkout)},
  discard:()=>confirmBox('Descartar treino','Tudo que foi registrado neste treino será perdido.','Descartar',()=>{S.active=null;T=null;save();saveNow();wake();render()},true),
  tAdd:d=>{if(T){T.end+=(+d.s)*1000;T.total=Math.max(T.total,(T.end-Date.now())/1000);const left=(T.end-Date.now())/1000;if(left>0)T.fired=false;if(left>5)T.warned=false;persistTimer();tick()}},
  tClose:()=>{T=null;persistTimer();tick()},
  pauseW:()=>{const A=S.active;if(!A)return;if(A.pausedAt){A.pausedMs=(A.pausedMs||0)+(Date.now()-A.pausedAt);A.pausedAt=null;A.autoPaused=false;toast('Cronômetro retomado')}else{A.pausedAt=Date.now();toast('Cronômetro pausado')}save();render()},
  addWeight:()=>{const B=bodyOf();modal('Registrar peso',`<div class="grid2"><label class="f"><span>Data (DD/MM/AAAA)</span><input id="wDate" data-mask="date" inputmode="numeric" maxlength="10" value="${isoToBR(iso(new Date()))}"></label><label class="f"><span>Peso (kg)</span><input id="wKg" inputmode="decimal" value="${weightAt(B)??''}" placeholder="ex: 85,4"></label></div>`,
    [{label:'Cancelar'},{label:'Salvar',cls:'pri',keep:true,fn:()=>{const d=brToISO($('#wDate').value),kg=num($('#wKg').value);if(!d||d>iso(new Date())){toast('Data inválida — use DD/MM/AAAA');return}if(!kg||kg<25||kg>350){toast('Peso inválido');return}B.weights=(B.weights||[]).filter(x=>x.date!==d);B.weights.push({date:d,kg:r2(kg)});$('#modal').hidden=true;save();render();toast('Peso registrado')}}])},
  delWeight:d=>{const B=bodyOf();const x=(B.weights||[]).find(w=>w.date===d.date);confirmBox('Excluir pesagem',`Remover <b>${fnum(x.kg,1)} kg</b> de ${dshort(d.date)}?`,'Excluir',()=>{B.weights=B.weights.filter(w=>w.date!==d.date);save();render()},true)},
  saveBody:async()=>{const B=bodyOf();const nm=($('#bfName')?$('#bfName').value:'').replace(/\s+/g,' ').trim();if(nm&&nm!==ME.name){if(!navigator.onLine){toast('Sem internet: o nome não foi alterado');return}try{await setProfileName(ME.id,nm)}catch(e){toast(e.message);$('#bfName').focus();return}}else if($('#bfName')&&!nm){toast('Informe seu nome de exibição');$('#bfName').focus();return}
    const sex=$('#bfSex').value,bt=$('#bfBirth').value.trim(),ht=$('#bfHeight').value.trim();
    let birth='';if(bt){birth=brToISO(bt);if(!birth){toast('Data de nascimento inválida — use DD/MM/AAAA');$('#bfBirth').focus();return}const a=ageAt(birth);if(a==null||a<10||a>100){toast('Confira o ano de nascimento');$('#bfBirth').focus();return}}
    let height=null;if(ht){height=Math.round(num(ht));if(!height||height<100||height>250){toast('Altura em centímetros (ex: 175)');$('#bfHeight').focus();return}}
    B.sex=sex;B.birth=birth;B.height=height;save();render();toast('Perfil salvo ✓')},
  testSound:()=>{audio();beep('warn');setTimeout(()=>beep('end'),900)},
  advWeek:()=>{const p=myActive(),pr=progOf(p),done=doneThisWeek(p),miss=p.sessions.filter(s=>!done.has(s.id)).map(s=>esc(s.name));const N=weeksOf(p);
    confirmBox(`Encerrar semana ${pr.week}`,`<p>Ir para a <b>semana ${pr.week+1}</b>${pr.week<N?' ('+esc(phaseAt(p,pr.week+1).name)+')':''} sem fazer: ${miss.join(', ')||'—'}?</p>`,'Avançar semana',()=>{pr.week++;if(pr.week>N&&p.repeat){pr.week=1;pr.round=(pr.round||1)+1}save();render();toast(pr.week>N?'Plano concluído':'Semana '+pr.week+' · '+phaseAt(p,pr.week).name)})},
  shiftWeek:d=>{const p=myActive();if(!p)return;const pr=progOf(p);pr.week=Math.min(weeksOf(p)+1,Math.max(1,pr.week+(+d.d)));save();render()},
  delLog:d=>confirmBox('Excluir registro','Este treino será removido do histórico.','Excluir',()=>{const L0=S.logs.find(L=>L.id===d.id);S.logs=S.logs.filter(L=>L.id!==d.id);if(L0){S._sync.dirtyLogs=S._sync.dirtyLogs.filter(x=>x!==d.id);S._sync.delLogs.push({id:L0.id,date:L0.date})}save();V.stack.pop();render()},true),
  exportJSON:()=>{share(`treino-backup-${iso(new Date())}.json`,JSON.stringify(Object.assign({},S,{_sync:undefined})),'application/json');S.settings.lastBackup=Date.now();save();setTimeout(render,500)},
  importJSON:()=>$('#importFile').click(),
  exportCSV:()=>{const rows=[['data','plano','semana','treino','exercicio','tipo','serie','kg','reps','rir','segundos','minutos','km','resultado_wod']];
    S.logs.forEach(L=>L.exercises.forEach(x=>{if(x.kind==='cardio')rows.push([L.date,L.planName||'',L.week,L.name,x.name,'cardio',1,'','','','',x.cardio.min??'',x.cardio.km??'','']);else if(x.kind==='wod')rows.push([L.date,L.planName||'',L.week,L.name,x.name,'wod',1,x.wod.kg??'','','','','','',wodScore(x.wod)]);
      else doneSets(x).forEach((s,j)=>rows.push([L.date,L.planName||'',L.week,L.name,x.name,x.kind||'load',j+1,s.kg??'',s.reps??'',s.rir??'',s.sec??'','','','']))}));
    const csv='﻿'+rows.map(r=>r.map(c=>{c=String(c);if(/^-?\d+\.\d+$/.test(c))c=c.replace('.',',');return/[;"\n]/.test(c)?`"${c.replace(/"/g,'""')}"`:c}).join(';')).join('\n');share(`treino-historico-${iso(new Date())}.csv`,csv,'text/csv')},
});

/* ---------- eventos ---------- */
document.addEventListener('touchend',()=>{if(S&&S.active)audio()},{passive:true});
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b)return;const f=ACT[b.dataset.act];if(f){ev.preventDefault();f(b.dataset,b)}});
document.addEventListener('input',ev=>{const t=ev.target,d=t.dataset;
  if(d.wf||d.wc||(d.ww&&d.ww!=='capped'&&t.tagName!=='SELECT'))onWorkoutInput(t,false);
  else if(d.wnote&&S.active){S.active.note=t.value;save()}
  else if(t.id==='pkQ'){PK.q=t.value;refreshPicker()}
  else if(d.mask==='date'){const v=maskDate(t.value);if(v!==t.value)t.value=v}});
document.addEventListener('change',ev=>{const t=ev.target,d=t.dataset;
  if(d.wf||d.wc||d.ww)return onWorkoutInput(t,true);
  if(t.id==='importFile')return onImport(t);
  if(t.id==='exSel'){S.settings.progEx=t.value;save();if($('#evo'))$('#evo').innerHTML=evoBody(t.value);else render();return}
  if(t.id==='pkGrp'){PK.grp=t.value;refreshPicker();return}
  if(d.plf){const p=planOf(d);p[d.plf]=t.type==='checkbox'?t.checked:t.value;psave();return}
  if(d.phf){const p=planOf(d),ph=p.phases[+d.k],f=d.phf;let v=t.value;
    if(f==='weeks'||f==='hold'){v=Math.round(num(v)??0);if(f==='weeks'&&(v<1||v>52)){toast('Semanas: entre 1 e 52');render();return}if(v<0)v=0}
    else if(f==='step'||f==='vol'){v=num(v);if(v==null){toast('Valor inválido');render();return}}
    ph[f]=v;if(f==='mode'){if(v==='deload'){ph.step=60;ph.vol=0.5}else if(v==='inc'&&(ph.step<=0||ph.step>10))ph.step=1;else if(v==='pct'&&Math.abs(ph.step)>20)ph.step=2.5}
    if(f==='weeks'){p.weekNotes=[];fitPlans(p)}psave();if(['weeks','mode','color'].includes(f))render();return}
  if(d.pf){const s=sessIn(planOf(d),d.sid);s[d.pf]=t.value;psave();if(d.pf==='name')render();return}
  if(d.ef){const p=planOf(d),e=exIn(p,d.eid).e,f=d.ef;let v=t.value;
    if(['sets','restSec'].includes(f)){v=Math.round(num(v));if(!v||v<0){toast('Valor inválido');render();return}}
    if(f==='inc'){v=num(v);if(!v||v<=0){toast('Valor inválido');render();return}}
    e[f]=v;if(f==='kind'){const df=defaultsFor(v);if(usesLoad(e)&&!e.plan)e.plan=Array(weeksOf(p)).fill(null);if(v==='cardio'&&!e.cardio)e.cardio=df.cardio;if(v==='wod'&&!e.wod)e.wod=df.wod;if(!e.sets)e.sets=df.sets}
    psave();if(f==='name'||f==='kind')render();return}
  if(d.ec){const e=exIn(planOf(d),d.eid).e;e.cardio=e.cardio||{};e.cardio[d.ec]=d.ec==='zone'?t.value:num(t.value);psave();return}
  if(d.ew){const e=exIn(planOf(d),d.eid).e;e.wod=e.wod||{};e.wod[d.ew]=d.ew==='cap'?num(t.value):t.value;psave();if(d.ew==='format')render();return}
  if(d.pl!=null){const e=exIn(planOf(d),d.eid).e,k=+d.pl,v=num(t.value);if(k<0)e.base=v;else e.plan[k]=v;psave();return}
  if(d.lf){const L=S.logs.find(l=>l.id===d.lid);L.exercises[+d.i].sets[+d.j][d.lf]=num(t.value);markLog(L.id);save();return}
  if(d.sf){S.settings[d.sf]=t.type==='checkbox'?t.checked:t.value;save();if(d.sf==='wake')wake();render();return}
});

/* ---------- boot ---------- */
(async function boot(){
  try{ME=JSON.parse(localStorage.getItem('treino.me')||'null')}catch(e){ME=null}
  try{CUSTOM_CAT=JSON.parse(localStorage.getItem('treino.cat')||'[]')}catch(e){CUSTOM_CAT=[]}
  sbInit();
  if(ME){loadUser();if(S&&S.active){restoreTimer();setTimeout(()=>toast('Treino em andamento retomado 💪'),300)}}
  render();wake();
  if(SB){
    SB.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&ME&&navigator.onLine){toast('Sessão encerrada — entre novamente');const keep=pending();ME=null;KEY=null;S=null;localStorage.removeItem('treino.me');render();if(keep)toast('Seus dados pendentes continuam guardados')}});
    try{const{data}=await SB.auth.getSession();if(ME&&!data.session&&navigator.onLine){ME=null;KEY=null;S=null;localStorage.removeItem('treino.me');render();toast('Entre novamente')}else if(ME)sync()}catch(e){}
  }
})();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
/* v4: edição do treino */
ACT.seOpen=d=>{SE.open=SE.open===d.eid?'':d.eid;render()};
ACT.seSets=d=>{const p=planOf(d),f=exIn(p,d.eid);if(!f)return;const e=f.e;e.sets=Math.max(1,Math.min(12,(+e.sets||1)+(+d.d)));psave();render()};
document.addEventListener('change',ev=>{const t=ev.target,d=t.dataset;if(d.ef==='restSec'){try{const f=exIn(planOf(d),d.eid);if(f)f.e.rest=''}catch(e){}}},true);
/* v4: arrastar ☰ para reordenar exercícios na edição do treino */
function seMove(X,i,k){if(i===k||i<0||k<0||i>=X.length||k>=X.length)return false;
  if(X[i-1])delete X[i-1].link;delete X[i].link;const [it]=X.splice(i,1);X.splice(k,0,it);if(X[k-1])delete X[k-1].link;return true}
(function(){let D=null;
  const items=()=>[...document.querySelectorAll('#selist .eitem')];
  function auto(){if(!D)return;const y=D.y;if(y<90)scrollBy(0,-12);else if(y>innerHeight-130)scrollBy(0,12);D.raf=requestAnimationFrame(auto);place()}
  function place(){if(!D)return;const dy=D.y-D.y0+(scrollY-D.sy);D.el.style.transform=`translateY(${dy}px)`;const mid=D.r.top+D.r.height/2+dy-(scrollY-D.sy);let k=D.i;
    D.others.forEach(o=>{const c=o.r.top+o.r.height/2-(scrollY-D.sy);let t=0;if(o.i>D.i&&mid>c){t=-D.r.height;k=Math.max(k,o.i)}else if(o.i<D.i&&mid<c){t=D.r.height;k=Math.min(k,o.i)}o.el.style.transform=t?`translateY(${t}px)`:''});D.k=k}
  document.addEventListener('pointerdown',ev=>{const hnd=ev.target.closest('[data-drag]');if(!hnd)return;const el=hnd.closest('.eitem'),list=document.getElementById('selist');if(!el||!list)return;ev.preventDefault();
    const all=items(),i=all.indexOf(el);D={el,list,i,k:i,y0:ev.clientY,y:ev.clientY,sy:scrollY,r:el.getBoundingClientRect(),others:all.filter(x=>x!==el).map(x=>({el:x,i:all.indexOf(x),r:x.getBoundingClientRect()})),pid:ev.pointerId};
    try{hnd.setPointerCapture(ev.pointerId)}catch(e){}el.classList.add('dragging');list.classList.add('sorting');if(navigator.vibrate)navigator.vibrate(15);D.raf=requestAnimationFrame(auto)});
  document.addEventListener('pointermove',ev=>{if(!D||ev.pointerId!==D.pid)return;ev.preventDefault();D.y=ev.clientY},{passive:false});
  function end(ev){if(!D||(ev&&ev.pointerId!==D.pid))return;cancelAnimationFrame(D.raf);const{i,k,list}=D;D=null;
    const p=planById(list.dataset.pid),s=p&&sessIn(p,list.dataset.sid);if(s&&seMove(s.exercises,i,k)){psave();toast('Ordem atualizada')}render()}
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end)})();
/* v4: ao terminar o exercício em foco, o foco volta a seguir a ordem do treino */
{const _sd=ACT.setDone,_xd=ACT.xDone;ACT.setDone=d=>{_sd(d);_wkRefocus(+d.i)};ACT.xDone=d=>{_xd(d);_wkRefocus(+d.i)}}
if('serviceWorker'in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('sw.js').catch(e=>console.warn('SW',e));let had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had){had=true;return}if(!S||!S.active){saveNow();location.reload()}else toast('Nova versão instalada — será aplicada ao reabrir')})}
