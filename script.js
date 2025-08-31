// Local data store
function load(){ return JSON.parse(localStorage.getItem('gpr-data')||'{}'); }
function save(d){ localStorage.setItem('gpr-data', JSON.stringify(d)); }
const data = load(); if(!data.players) data.players=[]; if(!data.sessions) data.sessions=[]; if(!data.tournaments) data.tournaments=[]; save(data);

const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const fmt=n=>(Number(n)||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const uid=()=>Math.random().toString(36).slice(2,10); const now=()=>new Date().toISOString();

// Simple history + nav
const pageStack=['home'];
function updateBackUI(){ const show=pageStack.length>1; const b=$('#backbar'); show?b.classList.remove('hidden'):b.classList.add('hidden'); }
function showPage(id){
  $$('.nav-btn').forEach(b=>b.classList.remove('active')); $$('.page').forEach(p=>p.classList.remove('page-active'));
  $('#'+id).classList.add('page-active'); $(`#nav-${id}`)?.classList.add('active');
  if(pageStack[pageStack.length-1]!==id) pageStack.push(id); updateBackUI();
  if(id==='leaderboard') renderLeaderboard();
  if(id==='tournaments'){ renderTournaments(); $('#tournament-detail').classList.add('hidden'); }
  if(id==='home'){ refreshHomeStats(); renderHighlights(); }
}
function goBack(){ if(pageStack.length>1){ pageStack.pop(); const prev=pageStack[pageStack.length-1]; $$('.page').forEach(p=>p.classList.remove('page-active')); $('#'+prev).classList.add('page-active'); $$('.nav-btn').forEach(b=>b.classList.remove('active')); $(`#nav-${prev}`)?.classList.add('active'); updateBackUI(); } }
$('#back-btn').addEventListener('click', goBack); $$('[data-back]').forEach(b=>b.addEventListener('click', goBack));
$$('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.id.replace('nav-','')))); $$('.cta-row .btn')?.forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.nav)));

$('#year').textContent = new Date().getFullYear();

// HOME
function refreshHomeStats(){
  $('#stat-players').textContent=data.players.length; $('#stat-sessions').textContent=data.sessions.length;
  const totalCash=data.sessions.flatMap(s=>s.entries||[]).reduce((a,e)=>a+Number(e.cashOut||0),0); $('#stat-profit').textContent='$'+fmt(totalCash);
}
function renderHighlights(){
  const ul=$('#highlights-list'); ul.innerHTML=''; const map=new Map();
  for(const s of data.sessions){ for(const e of (s.entries||[])){ const p=map.get(e.playerId)||{buy:0,cash:0,profit:0}; p.buy+=Number(e.buyIn||0); p.cash+=Number(e.cashOut||0); p.profit+=Number(e.cashOut||0)-Number(e.buyIn||0); map.set(e.playerId,p); } }
  const rows=[...map.entries()].map(([pid,v])=>({pid,...v})).sort((a,b)=>b.profit-a.profit).slice(0,3);
  for(const r of rows){ const player=data.players.find(p=>p.id===r.pid); const li=document.createElement('li'); li.innerHTML=`<strong>${player?player.first+' '+player.last:r.pid}</strong> — Sessions: ${(data.sessions.flatMap(s=>s.entries||[]).filter(e=>e.playerId===r.pid).length)} · Profit: <span style="color:${r.profit>=0?'#34d399':'#fb7185'}">$${fmt(r.profit)}</span>`; ul.appendChild(li); }
}

// PLAYERS
function addPlayer(first,last){ if(!first||!last) return; data.players.push({id:uid(),first,last,active:true}); save(data); renderPlayers(); refreshHomeStats(); renderLeaderboard(); }
function renderPlayers(){
  const ul=$('#players-ul'); if(!ul) return; ul.innerHTML='';
  for(const p of data.players){ const li=document.createElement('li'); li.className='item'; li.innerHTML=`<span>${p.first} ${p.last} ${p.active?'':'<em style="color:#93a1b3;font-size:12px">(inactive)</em>'}</span><button class="btn" data-id="${p.id}">${p.active?'Set inactive':'Set active'}</button>`; ul.appendChild(li); }
  ul.querySelectorAll('button').forEach(btn=>{ btn.addEventListener('click',()=>{ const p=data.players.find(x=>x.id===btn.dataset.id); p.active=!p.active; save(data); renderPlayers(); }); });
  const sel=$('#entry-player'); if(sel){ sel.innerHTML='<option value="">Select player…</option>'+data.players.filter(p=>p.active).map(p=>`<option value="${p.id}">${p.first} ${p.last}</option>`).join(''); }
}
// Local data store
function load(){ return JSON.parse(localStorage.getItem('gpr-data')||'{}'); }
function save(d){ localStorage.setItem('gpr-data', JSON.stringify(d)); }
const data = load(); if(!data.players) data.players=[]; if(!data.sessions) data.sessions=[]; if(!data.tournaments) data.tournaments=[]; save(data);

const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const fmt=n=>(Number(n)||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const uid=()=>Math.random().toString(36).slice(2,10); const now=()=>new Date().toISOString();

// Simple history + nav
const pageStack=['home'];
function updateBackUI(){ const show=pageStack.length>1; const b=$('#backbar'); show?b.classList.remove('hidden'):b.classList.add('hidden'); }
function showPage(id){
  $$('.nav-btn').forEach(b=>b.classList.remove('active')); $$('.page').forEach(p=>p.classList.remove('page-active'));
  $('#'+id).classList.add('page-active'); $(`#nav-${id}`)?.classList.add('active');
  if(pageStack[pageStack.length-1]!==id) pageStack.push(id); updateBackUI();
  if(id==='leaderboard') renderLeaderboard();
  if(id==='tournaments'){ renderTournaments(); $('#tournament-detail').classList.add('hidden'); }
  if(id==='home'){ refreshHomeStats(); renderHighlights(); }
}
function goBack(){ if(pageStack.length>1){ pageStack.pop(); const prev=pageStack[pageStack.length-1]; $$('.page').forEach(p=>p.classList.remove('page-active')); $('#'+prev).classList.add('page-active'); $$('.nav-btn').forEach(b=>b.classList.remove('active')); $(`#nav-${prev}`)?.classList.add('active'); updateBackUI(); } }
$('#back-btn').addEventListener('click', goBack); $$('[data-back]').forEach(b=>b.addEventListener('click', goBack));
$$('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.id.replace('nav-','')))); $$('.cta-row .btn')?.forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.nav)));

$('#year').textContent = new Date().getFullYear();

// HOME
function refreshHomeStats(){
  $('#stat-players').textContent=data.players.length; $('#stat-sessions').textContent=data.sessions.length;
  const totalCash=data.sessions.flatMap(s=>s.entries||[]).reduce((a,e)=>a+Number(e.cashOut||0),0); $('#stat-profit').textContent='$'+fmt(totalCash);
}
function renderHighlights(){
  const ul=$('#highlights-list'); ul.innerHTML=''; const map=new Map();
  for(const s of data.sessions){ for(const e of (s.entries||[])){ const p=map.get(e.playerId)||{buy:0,cash:0,profit:0}; p.buy+=Number(e.buyIn||0); p.cash+=Number(e.cashOut||0); p.profit+=Number(e.cashOut||0)-Number(e.buyIn||0); map.set(e.playerId,p); } }
  const rows=[...map.entries()].map(([pid,v])=>({pid,...v})).sort((a,b)=>b.profit-a.profit).slice(0,3);
  for(const r of rows){ const player=data.players.find(p=>p.id===r.pid); const li=document.createElement('li'); li.innerHTML=`<strong>${player?player.first+' '+player.last:r.pid}</strong> — Sessions: ${(data.sessions.flatMap(s=>s.entries||[]).filter(e=>e.playerId===r.pid).length)} · Profit: <span style="color:${r.profit>=0?'#34d399':'#fb7185'}">$${fmt(r.profit)}</span>`; ul.appendChild(li); }
}

// PLAYERS
function addPlayer(first,last){ if(!first||!last) return; data.players.push({id:uid(),first,last,active:true}); save(data); renderPlayers(); refreshHomeStats(); renderLeaderboard(); }
function renderPlayers(){
  const ul=$('#players-ul'); if(!ul) return; ul.innerHTML='';
  for(const p of data.players){ const li=document.createElement('li'); li.className='item'; li.innerHTML=`<span>${p.first} ${p.last} ${p.active?'':'<em style="color:#93a1b3;font-size:12px">(inactive)</em>'}</span><button class="btn" data-id="${p.id}">${p.active?'Set inactive':'Set active'}</button>`; ul.appendChild(li); }
  ul.querySelectorAll('button').forEach(btn=>{ btn.addEventListener('click',()=>{ const p=data.players.find(x=>x.id===btn.dataset.id); p.active=!p.active; save(data); renderPlayers(); }); });
  const sel=$('#entry-player'); if(sel){ sel.innerHTML='<option value="">Select player…</option>'+data.players.filter(p=>p.active).map(p=>`<option value="${p.id}">${p.first} ${p.last}</option>`).join(''); }
}

// SESSIONS
function createSession(notes){ const s={id:uid(),notes:notes||null,createdAt:now(),entries:[]}; data.sessions.unshift(s); save(data); renderSessions(); refreshHomeStats(); renderLeaderboard(); }
function renderSessions(){ const select=$('#session-select'); if(!select) return; select.innerHTML='<option value="">Select session…</option>'+data.sessions.map(s=>`<option value="${s.id}">${new Date(s.createdAt).toLocaleString()} ${s.notes?('— '+s.notes):''}</option>`).join(''); $('#entries-table tbody').innerHTML=''; }
function addEntry(sessionId,playerId,buy,cash){ if(!sessionId||!playerId) return; const s=data.sessions.find(x=>x.id===sessionId); s.entries.push({playerId,buyIn:Number(buy||0),cashOut:Number(cash||0)}); save(data); renderEntries(sessionId); renderLeaderboard(); refreshHomeStats(); renderHighlights(); }
function renderEntries(sessionId){ const s=data.sessions.find(x=>x.id===sessionId); if(!s) return; const tb=$('#entries-table tbody'); tb.innerHTML=''; const agg={}; for(const e of (s.entries||[])){ agg[e.playerId]=agg[e.playerId]||{buy:0,cash:0}; agg[e.playerId].buy+=Number(e.buyIn||0); agg[e.playerId].cash+=Number(e.cashOut||0); } for(const [pid,v] of Object.entries(agg)){ const name=(data.players.find(p=>p.id===pid)||{first:pid,last:''}); const profit=v.cash-v.buy; const tr=document.createElement('tr'); tr.innerHTML=`<td>${name.first} ${name.last}</td><td>$${fmt(v.buy)}</td><td>$${fmt(v.cash)}</td><td style="color:${profit>=0?'#34d399':'#fb7185'}">$${fmt(profit)}</td>`; tb.appendChild(tr); } }

// LEADERBOARD
function renderLeaderboard(){ const all=data.sessions.flatMap(s=> s.entries.map(e=>({session:s.id,...e})) ); const map=new Map(); for(const e of all){ const v=map.get(e.playerId)||{buy:0,cash:0,sessions:0}; v.buy+=Number(e.buyIn||0); v.cash+=Number(e.cashOut||0); v.sessions+=1; map.set(e.playerId,v); } const rows=[...map.entries()].map(([pid,v])=>({pid,...v,profit:v.cash-v.buy})).sort((a,b)=>b.profit-a.profit); const tb=$('#leaderboard-table tbody'); if(!tb) return; tb.innerHTML=''; rows.forEach((r,i)=>{ const p=data.players.find(x=>x.id===r.pid); const tr=document.createElement('tr'); tr.innerHTML=`<td>${i+1}</td><td>${p?`${p.first} ${p.last}`:r.pid}</td><td>${r.sessions}</td><td>$${fmt(r.buy)}</td><td>$${fmt(r.cash)}</td><td style="color:${r.profit>=0?'#34d399':'#fb7185'}">$${fmt(r.profit)}</td>`; tb.appendChild(tr); }); }

// TOURNAMENTS
function createTournament({title, when, buyIn, description, prizes}){ const t={id:uid(),title,when,buyIn:Number(buyIn||0),description:description||null,prizes:prizes||[],status:'scheduled',attendees:[],placements:[]}; data.tournaments.unshift(t); save(data); renderTournaments(); }
function renderTournaments(){ const wrap=$('#tournament-list'); if(!wrap) return; wrap.innerHTML=''; for(const t of data.tournaments){ const item=document.createElement('div'); item.className='item'; item.innerHTML=`<div><div><strong>${t.title}</strong></div><div class="muted">${new Date(t.when).toLocaleString()} • Buy-in $${fmt(t.buyIn)}</div></div><div class="row"><button class="btn ghost" data-id="${t.id}" data-act="view">View</button><button class="btn" data-id="${t.id}" data-act="rsvp">RSVP</button></div>`; wrap.appendChild(item);} wrap.querySelectorAll('button').forEach(b=>{ b.addEventListener('click',()=>{ const id=b.dataset.id, act=b.dataset.act; const t=data.tournaments.find(x=>x.id===id); if(act==='view') showTournament(t); if(act==='rsvp') promptRSVP(t); }); }); }
function showTournament(t){ const det=$('#tournament-detail'); det.classList.remove('hidden'); det.innerHTML=`<div class="page-head"><h3 style="margin:0">Tournament: ${t.title}</h3><button class="btn back sm" id="detail-back">← Back</button></div><div class="muted">${new Date(t.when).toLocaleString()} • Buy-in $${fmt(t.buyIn)} • Status: ${t.status}</div>${t.description?`<p style="margin-top:8px">${t.description}</p>`:''}${t.prizes?.length?`<div style="margin-top:10px"><strong>Prizes</strong><ul>${t.prizes.map(p=>`<li>${p}</li>`).join('')}</ul></div>`:''}<div class="grid two" style="margin-top:16px"><div class="pane"><h4>Attendees</h4><ul class="list compact">${t.attendees.map(a=>`<li class="item">${a.name} — ${a.email}</li>`).join('')||'<li class="item muted">No RSVPs yet.</li>'}</ul></div><div class="pane"><h4>Placements</h4><ol class="list compact">${t.placements.sort((a,b)=>a.rank-b.rank).map(p=>`<li class="item">${p.rank}. ${p.name}${p.prize?` — ${p.prize}`:''}</li>`).join('')||'<li class="item muted">No placements yet.</li>'}</ol></div></div>`; $('#detail-back').addEventListener('click',()=>{det.classList.add('hidden');}); }
function promptRSVP(t){ const name=prompt('Your name:'); if(!name) return; const email=prompt('Your email:'); if(!email) return; t.attendees.push({name,email}); save(data); renderTournaments(); showTournament(t); }

// Admin
function initAdmin(){ renderPlayers(); renderSessions(); renderLeaderboard(); renderTournaments();
  $('#add-player').onclick=()=>addPlayer($('#player-first').value.trim(), $('#player-last').value.trim());
  $('#create-session').onclick=()=>createSession($('#session-notes').value.trim());
  $('#session-select').onchange=e=>renderEntries(e.target.value);
  $('#add-entry').onclick=()=>addEntry($('#session-select').value,$('#entry-player').value,$('#entry-buyin').value,$('#entry-cashout').value);
  $('#t-create').onclick=()=>{ const prizes=$('#t-prizes').value.split('\n').map(s=>s.trim()).filter(Boolean); createTournament({title:$('#t-title').value.trim(), when:$('#t-when').value, buyIn:$('#t-buyin').value, description:$('#t-description').value.trim(), prizes}); fillTournamentManage(); };
  $('#p-add').onclick=()=>{ const tid=$('#t-manage-select').value; if(!tid) return; const t=data.tournaments.find(x=>x.id===tid); const rank=Number($('#p-rank').value||0); const name=$('#p-name').value.trim(); const prize=$('#p-prize').value.trim()||null; if(!rank||!name) return; t.placements.push({rank,name,prize}); save(data); renderPlacementTable(t); };
  $('#t-mark-complete').onclick=()=>{ const tid=$('#t-manage-select').value; if(!tid) return; const t=data.tournaments.find(x=>x.id===tid); t.status='completed'; save(data); renderTournaments(); };
  fillTournamentManage();
}
function fillTournamentManage(){ const sel=$('#t-manage-select'); sel.innerHTML='<option value="">Select…</option>'+data.tournaments.map(t=>`<option value="${t.id}">${t.title}</option>`).join(''); sel.onchange=()=>{ const t=data.tournaments.find(x=>x.id===sel.value); renderPlacementTable(t); }; }
function renderPlacementTable(t){ const tb=$('#placements-table tbody'); tb.innerHTML=''; if(!t) return; t.placements.sort((a,b)=>a.rank-b.rank).forEach(p=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.rank}</td><td>${p.name}</td><td>${p.prize||''}</td>`; tb.appendChild(tr); }); }

// Boot
initAdmin(); renderLeaderboard(); renderTournaments(); refreshHomeStats(); renderHighlights(); showPage('home');
// SESSIONS
function createSession(notes){ const s={id:uid(),notes:notes||null,createdAt:now(),entries:[]}; data.sessions.unshift(s); save(data); renderSessions(); refreshHomeStats(); renderLeaderboard(); }
function renderSessions(){ const select=$('#session-select'); if(!select) return; select.innerHTML='<option value="">Select session…</option>'+data.sessions.map(s=>`<option value="${s.id}">${new Date(s.createdAt).toLocaleString()} ${s.notes?('— '+s.notes):''}</option>`).join(''); $('#entries-table tbody').innerHTML=''; }
function addEntry(sessionId,playerId,buy,cash){ if(!sessionId||!playerId) return; const s=data.sessions.find(x=>x.id===sessionId); s.entries.push({playerId,buyIn:Number(buy||0),cashOut:Number(cash||0)}); save(data); renderEntries(sessionId); renderLeaderboard(); refreshHomeStats(); renderHighlights(); }
function renderEntries(sessionId){ const s=data.sessions.find(x=>x.id===sessionId); if(!s) return; const tb=$('#entries-table tbody'); tb.innerHTML=''; const agg={}; for(const e of (s.entries||[])){ agg[e.playerId]=agg[e.playerId]||{buy:0,cash:0}; agg[e.playerId].buy+=Number(e.buyIn||0); agg[e.playerId].cash+=Number(e.cashOut||0); } for(const [pid,v] of Object.entries(agg)){ const name=(data.players.find(p=>p.id===pid)||{first:pid,last:''}); const profit=v.cash-v.buy; const tr=document.createElement('tr'); tr.innerHTML=`<td>${name.first} ${name.last}</td><td>$${fmt(v.buy)}</td><td>$${fmt(v.cash)}</td><td style="color:${profit>=0?'#34d399':'#fb7185'}">$${fmt(profit)}</td>`; tb.appendChild(tr); } }

// LEADERBOARD
function renderLeaderboard(){ const all=data.sessions.flatMap(s=> s.entries.map(e=>({session:s.id,...e})) ); const map=new Map(); for(const e of all){ const v=map.get(e.playerId)||{buy:0,cash:0,sessions:0}; v.buy+=Number(e.buyIn||0); v.cash+=Number(e.cashOut||0); v.sessions+=1; map.set(e.playerId,v); } const rows=[...map.entries()].map(([pid,v])=>({pid,...v,profit:v.cash-v.buy})).sort((a,b)=>b.profit-a.profit); const tb=$('#leaderboard-table tbody'); if(!tb) return; tb.innerHTML=''; rows.forEach((r,i)=>{ const p=data.players.find(x=>x.id===r.pid); const tr=document.createElement('tr'); tr.innerHTML=`<td>${i+1}</td><td>${p?`${p.first} ${p.last}`:r.pid}</td><td>${r.sessions}</td><td>$${fmt(r.buy)}</td><td>$${fmt(r.cash)}</td><td style="color:${r.profit>=0?'#34d399':'#fb7185'}">$${fmt(r.profit)}</td>`; tb.appendChild(tr); }); }

// TOURNAMENTS
function createTournament({title, when, buyIn, description, prizes}){ const t={id:uid(),title,when,buyIn:Number(buyIn||0),description:description||null,prizes:prizes||[],status:'scheduled',attendees:[],placements:[]}; data.tournaments.unshift(t); save(data); renderTournaments(); }
function renderTournaments(){ const wrap=$('#tournament-list'); if(!wrap) return; wrap.innerHTML=''; for(const t of data.tournaments){ const item=document.createElement('div'); item.className='item'; item.innerHTML=`<div><div><strong>${t.title}</strong></div><div class="muted">${new Date(t.when).toLocaleString()} • Buy-in $${fmt(t.buyIn)}</div></div><div class="row"><button class="btn ghost" data-id="${t.id}" data-act="view">View</button><button class="btn" data-id="${t.id}" data-act="rsvp">RSVP</button></div>`; wrap.appendChild(item);} wrap.querySelectorAll('button').forEach(b=>{ b.addEventListener('click',()=>{ const id=b.dataset.id, act=b.dataset.act; const t=data.tournaments.find(x=>x.id===id); if(act==='view') showTournament(t); if(act==='rsvp') promptRSVP(t); }); }); }
function showTournament(t){ const det=$('#tournament-detail'); det.classList.remove('hidden'); det.innerHTML=`<div class="page-head"><h3 style="margin:0">Tournament: ${t.title}</h3><button class="btn back sm" id="detail-back">← Back</button></div><div class="muted">${new Date(t.when).toLocaleString()} • Buy-in $${fmt(t.buyIn)} • Status: ${t.status}</div>${t.description?`<p style="margin-top:8px">${t.description}</p>`:''}${t.prizes?.length?`<div style="margin-top:10px"><strong>Prizes</strong><ul>${t.prizes.map(p=>`<li>${p}</li>`).join('')}</ul></div>`:''}<div class="grid two" style="margin-top:16px"><div class="pane"><h4>Attendees</h4><ul class="list compact">${t.attendees.map(a=>`<li class="item">${a.name} — ${a.email}</li>`).join('')||'<li class="item muted">No RSVPs yet.</li>'}</ul></div><div class="pane"><h4>Placements</h4><ol class="list compact">${t.placements.sort((a,b)=>a.rank-b.rank).map(p=>`<li class="item">${p.rank}. ${p.name}${p.prize?` — ${p.prize}`:''}</li>`).join('')||'<li class="item muted">No placements yet.</li>'}</ol></div></div>`; $('#detail-back').addEventListener('click',()=>{det.classList.add('hidden');}); }
function promptRSVP(t){ const name=prompt('Your name:'); if(!name) return; const email=prompt('Your email:'); if(!email) return; t.attendees.push({name,email}); save(data); renderTournaments(); showTournament(t); }

// Admin
function initAdmin(){ renderPlayers(); renderSessions(); renderLeaderboard(); renderTournaments();
  $('#add-player').onclick=()=>addPlayer($('#player-first').value.trim(), $('#player-last').value.trim());
  $('#create-session').onclick=()=>createSession($('#session-notes').value.trim());
  $('#session-select').onchange=e=>renderEntries(e.target.value);
  $('#add-entry').onclick=()=>addEntry($('#session-select').value,$('#entry-player').value,$('#entry-buyin').value,$('#entry-cashout').value);
  $('#t-create').onclick=()=>{ const prizes=$('#t-prizes').value.split('\n').map(s=>s.trim()).filter(Boolean); createTournament({title:$('#t-title').value.trim(), when:$('#t-when').value, buyIn:$('#t-buyin').value, description:$('#t-description').value.trim(), prizes}); fillTournamentManage(); };
  $('#p-add').onclick=()=>{ const tid=$('#t-manage-select').value; if(!tid) return; const t=data.tournaments.find(x=>x.id===tid); const rank=Number($('#p-rank').value||0); const name=$('#p-name').value.trim(); const prize=$('#p-prize').value.trim()||null; if(!rank||!name) return; t.placements.push({rank,name,prize}); save(data); renderPlacementTable(t); };
  $('#t-mark-complete').onclick=()=>{ const tid=$('#t-manage-select').value; if(!tid) return; const t=data.tournaments.find(x=>x.id===tid); t.status='completed'; save(data); renderTournaments(); };
  fillTournamentManage();
}
function fillTournamentManage(){ const sel=$('#t-manage-select'); sel.innerHTML='<option value="">Select…</option>'+data.tournaments.map(t=>`<option value="${t.id}">${t.title}</option>`).join(''); sel.onchange=()=>{ const t=data.tournaments.find(x=>x.id===sel.value); renderPlacementTable(t); }; }
function renderPlacementTable(t){ const tb=$('#placements-table tbody'); tb.innerHTML=''; if(!t) return; t.placements.sort((a,b)=>a.rank-b.rank).forEach(p=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.rank}</td><td>${p.name}</td><td>${p.prize||''}</td>`; tb.appendChild(tr); }); }

// Boot
initAdmin(); renderLeaderboard(); renderTournaments(); refreshHomeStats(); renderHighlights(); showPage('home');
