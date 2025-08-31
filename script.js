/* Gowda Poker Room — dark theme app
 *
 * Client‑side poker leaderboard and tournament manager.  Data is stored in
 * localStorage under the key "gpr-data".  The admin password is configurable
 * below.  Most UI elements are rendered dynamically through this script.
 */

// No admin password is required; admin dashboard is open by default.

// Load or initialize data from localStorage
function load() {
  return JSON.parse(localStorage.getItem('gpr-data') || '{}');
}
function save(d) {
  localStorage.setItem('gpr-data', JSON.stringify(d));
}
const data = load();
if (!data.players) data.players = []; // {id, first, last, active}
if (!data.sessions) data.sessions = []; // {id, notes, createdAt, entries[]}
if (!data.tournaments) data.tournaments = []; // {id,title,when,buyIn,description,prizes,status,attendees,placements}
save(data);

// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

/* Navigation with history */
let currentPage = 'home';
const navHistory = [];

function updateBackBar() {
  // Show or hide the global back bar depending on history length.
  // The element id here must match the `id` used in index.html (backbar).
  const bar = $('#backbar');
  if (navHistory.length > 0) bar.classList.remove('hidden');
  else bar.classList.add('hidden');
  // No dynamic local back buttons to toggle because back buttons are defined in index.html.
}

function showPage(id) {
  // highlight nav and show page
  $$('.nav-btn').forEach((b) => b.classList.remove('active'));
  $$('.page').forEach((p) => p.classList.remove('page-active'));
  const navButton = $(`#nav-${id}`);
  if (navButton) navButton.classList.add('active');
  $(`#${id}`).classList.add('page-active');
  // page-specific rendering
  if (id === 'leaderboard') renderLeaderboard();
  if (id === 'tournaments') { renderTournaments(); $('#tournament-detail').classList.add('hidden'); }
  if (id === 'home') { refreshHomeStats(); renderHighlights(); }
  currentPage = id;
}

// navigate to a page and push current page into history
function navigateTo(id) {
  if (id !== currentPage) {
    navHistory.push(currentPage);
  }
  showPage(id);
  updateBackBar();
}

// Back navigation
function goBack() {
  const prev = navHistory.pop();
  if (prev) {
    showPage(prev);
  }
  updateBackBar();
}

// Bind navigation buttons
$$('.nav-btn').forEach((btn) => btn.addEventListener('click', () => navigateTo(btn.id.replace('nav-', ''))));
// CTA links on home
$$('.cta-row .btn').forEach((btn) => btn.addEventListener('click', () => navigateTo(btn.dataset.nav)));
// Back bar button
const backBtn = $('#back-btn');
if (backBtn) backBtn.addEventListener('click', goBack);

// Attach goBack() to any buttons that have a data-back attribute (e.g. page head back buttons)
document.querySelectorAll('[data-back]').forEach((btn) => btn.addEventListener('click', goBack));

// Insert local back buttons functionality has been removed because
// the index.html already includes explicit back buttons with a `data-back` attribute.
// If you wish to add dynamic back buttons to each page in the future,
// implement that logic here and ensure it does not duplicate existing buttons.

// set year in footer
$('#year').textContent = new Date().getFullYear();

/* HOME STATS */
function refreshHomeStats() {
  $('#stat-players').textContent = data.players.length;
  $('#stat-sessions').textContent = data.sessions.length;
  const totalCash = data.sessions.flatMap((s) => s.entries || []).reduce((a, e) => a + Number(e.cashOut || 0), 0);
  $('#stat-profit').textContent = '$' + fmt(totalCash);
}
function renderHighlights() {
  const ul = $('#highlights-list');
  ul.innerHTML = '';
  // compute profits per player
  const map = new Map();
  for (const s of data.sessions) {
    for (const e of s.entries || []) {
      const p = map.get(e.playerId) || { buy: 0, cash: 0, profit: 0 };
      p.buy += Number(e.buyIn || 0);
      p.cash += Number(e.cashOut || 0);
      p.profit += Number(e.cashOut || 0) - Number(e.buyIn || 0);
      map.set(e.playerId, p);
    }
  }
  const rows = Array.from(map.entries()).map(([pid, v]) => ({ pid, ...v })).sort((a, b) => b.profit - a.profit).slice(0, 3);
  for (const r of rows) {
    const player = data.players.find((p) => p.id === r.pid);
    const li = document.createElement('li');
    li.innerHTML = `<strong>${player ? player.first + ' ' + player.last : r.pid}</strong>
      — Sessions: ${data.sessions.flatMap((s) => s.entries || []).filter((e) => e.playerId === r.pid).length} · Profit: <span style="color:${r.profit >= 0 ? '#34d399' : '#fb7185'}">$${fmt(r.profit)}</span>`;
    ul.appendChild(li);
  }
}

/* PLAYERS */
function addPlayer(first, last) {
  if (!first || !last) return;
  data.players.push({ id: uid(), first, last, active: true });
  save(data);
  renderPlayers();
  refreshHomeStats();
  renderLeaderboard();
}
function renderPlayers() {
  const ul = $('#players-ul');
  if (!ul) return;
  ul.innerHTML = '';
  for (const p of data.players) {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<span>${p.first} ${p.last} ${p.active ? '' : '<em style="color:#93a1b3;font-size:12px">(inactive)</em>'}</span>
      <button class="btn" data-id="${p.id}">${p.active ? 'Set inactive' : 'Set active'}</button>`;
    ul.appendChild(li);
  }
  ul.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = data.players.find((x) => x.id === btn.dataset.id);
      p.active = !p.active;
      save(data);
      renderPlayers();
    });
  });
  // update session player select
  const sel = $('#entry-player');
  if (sel) {
    sel.innerHTML = '<option value="">Select player…</option>' + data.players.filter((p) => p.active).map((p) => `<option value="${p.id}">${p.first} ${p.last}</option>`).join('');
  }
}

/* SESSIONS */
function createSession(notes) {
  const s = { id: uid(), notes: notes || null, createdAt: now(), entries: [] };
  data.sessions.unshift(s);
  save(data);
  renderSessions();
  refreshHomeStats();
  renderLeaderboard();
}
function renderSessions() {
  const select = $('#session-select');
  if (!select) return;
  select.innerHTML = '<option value="">Select session…</option>' + data.sessions.map((s) => `<option value="${s.id}">${new Date(s.createdAt).toLocaleString()}${s.notes ? ' — ' + s.notes : ''}</option>`).join('');
  $('#entries-table tbody').innerHTML = '';
}
function addEntry(sessionId, playerId, buy, cash) {
  if (!sessionId || !playerId) return;
  const s = data.sessions.find((x) => x.id === sessionId);
  s.entries.push({ playerId, buyIn: Number(buy || 0), cashOut: Number(cash || 0) });
  save(data);
  renderEntries(sessionId);
  renderLeaderboard();
  refreshHomeStats();
  renderHighlights();
}
function renderEntries(sessionId) {
  const s = data.sessions.find((x) => x.id === sessionId);
  if (!s) return;
  const tb = $('#entries-table tbody');
  tb.innerHTML = '';
  // aggregate per player within session
  const agg = {};
  for (const e of s.entries || []) {
    agg[e.playerId] = agg[e.playerId] || { buy: 0, cash: 0 };
    agg[e.playerId].buy += Number(e.buyIn || 0);
    agg[e.playerId].cash += Number(e.cashOut || 0);
  }
  for (const pid of Object.keys(agg)) {
    const p = data.players.find((pl) => pl.id === pid);
    const name = p ? `${p.first} ${p.last}` : pid;
    const v = agg[pid];
    const profit = v.cash - v.buy;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${name}</td><td>$${fmt(v.buy)}</td><td>$${fmt(v.cash)}</td><td style="color:${profit >= 0 ? '#34d399' : '#fb7185'}">$${fmt(profit)}</td>`;
    tb.appendChild(tr);
  }
}

/* LEADERBOARD */
function renderLeaderboard() {
  const entries = data.sessions.flatMap((s) => s.entries.map((e) => ({ session: s.id, ...e })));
  const map = new Map();
  for (const e of entries) {
    const v = map.get(e.playerId) || { buy: 0, cash: 0, sessions: 0 };
    v.buy += Number(e.buyIn || 0);
    v.cash += Number(e.cashOut || 0);
    v.sessions += 1;
    map.set(e.playerId, v);
  }
  const rows = Array.from(map.entries()).map(([pid, v]) => ({ pid, ...v, profit: v.cash - v.buy })).sort((a, b) => b.profit - a.profit);
  const tb = $('#leaderboard-table tbody');
  if (!tb) return;
  tb.innerHTML = '';
  rows.forEach((r, i) => {
    const p = data.players.find((x) => x.id === r.pid);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${p ? `${p.first} ${p.last}` : r.pid}</td><td>${r.sessions}</td><td>$${fmt(r.buy)}</td><td>$${fmt(r.cash)}</td><td style="color:${r.profit >= 0 ? '#34d399' : '#fb7185'}">$${fmt(r.profit)}</td>`;
    tb.appendChild(tr);
  });
}

/* TOURNAMENTS */
function createTournament({ title, when, buyIn, description, prizes }) {
  const t = {
    id: uid(),
    title,
    when,
    buyIn: Number(buyIn || 0),
    description: description || null,
    prizes: prizes || [],
    status: 'scheduled',
    attendees: [],
    placements: [],
  };
  data.tournaments.unshift(t);
  save(data);
  renderTournaments();
}
function renderTournaments() {
  const wrap = $('#tournament-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const t of data.tournaments) {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<div><div><strong>${t.title}</strong></div><div class="muted">${new Date(t.when).toLocaleString()} • Buy‑in $${fmt(t.buyIn)}</div></div><div class="row"><button class="btn ghost" data-id="${t.id}" data-act="view">View</button><button class="btn" data-id="${t.id}" data-act="rsvp">RSVP</button></div>`;
    wrap.appendChild(item);
  }
  wrap.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const act = b.dataset.act;
      const t = data.tournaments.find((x) => x.id === id);
      if (act === 'view') showTournament(t);
      if (act === 'rsvp') promptRSVP(t);
    });
  });
}
function showTournament(t) {
  const det = $('#tournament-detail');
  det.classList.remove('hidden');
  det.innerHTML = `
    <h3 style="margin-top:0">${t.title}</h3>
    <div class="muted">${new Date(t.when).toLocaleString()} • Buy‑in $${fmt(t.buyIn)} • Status: ${t.status}</div>
    ${t.description ? `<p style="margin-top:8px">${t.description}</p>` : ''}
    ${t.prizes && t.prizes.length ? `<div style="margin-top:10px"><strong>Prizes</strong><ul>${t.prizes.map((p) => `<li>${p}</li>`).join('')}</ul></div>` : ''}
    <div class="grid two" style="margin-top:16px">
      <div class="pane">
        <h4>Attendees</h4>
        <ul class="list compact">${t.attendees.map((a) => `<li class="item">${a.name} — ${a.email}</li>`).join('') || '<li class="item muted">No RSVPs yet.</li>'}</ul>
      </div>
      <div class="pane">
        <h4>Placements</h4>
        <ol class="list compact">${t.placements.sort((a, b) => a.rank - b.rank).map((p) => `<li class="item">${p.rank}. ${p.name}${p.prize ? ' — ' + p.prize : ''}</li>`).join('') || '<li class="item muted">No placements yet.</li>'}</ol>
      </div>
    </div>`;
}
function promptRSVP(t) {
  const name = prompt('Your name:');
  if (!name) return;
  const email = prompt('Your email:');
  if (!email) return;
  t.attendees.push({ name, email });
  save(data);
  renderTournaments();
  showTournament(t);
}

/* ADMIN */
// Immediately initialize admin on page load since there is no password

function initAdmin() {
  renderPlayers();
  renderSessions();
  renderLeaderboard();
  renderTournaments();
  // add player
  $('#add-player').onclick = () => {
    addPlayer($('#player-first').value.trim(), $('#player-last').value.trim());
    $('#player-first').value = '';
    $('#player-last').value = '';
  };
  // create session
  $('#create-session').onclick = () => {
    createSession($('#session-notes').value.trim());
    $('#session-notes').value = '';
  };
  // session select change
  $('#session-select').onchange = (e) => {
    renderEntries(e.target.value);
  };
  // add entry
  $('#add-entry').onclick = () => {
    addEntry($('#session-select').value, $('#entry-player').value, $('#entry-buyin').value, $('#entry-cashout').value);
    $('#entry-buyin').value = '';
    $('#entry-cashout').value = '';
  };
  // create tournament
  $('#t-create').onclick = () => {
    const prizes = $('#t-prizes').value.split('\n').map((s) => s.trim()).filter(Boolean);
    createTournament({ title: $('#t-title').value.trim(), when: $('#t-when').value, buyIn: $('#t-buyin').value, description: $('#t-description').value.trim(), prizes });
    $('#t-title').value = '';
    $('#t-when').value = '';
    $('#t-buyin').value = '';
    $('#t-description').value = '';
    $('#t-prizes').value = '';
    fillTournamentManage();
  };
  // manage tournaments
  $('#p-add').onclick = () => {
    const tid = $('#t-manage-select').value;
    if (!tid) return;
    const t = data.tournaments.find((x) => x.id === tid);
    const rank = Number($('#p-rank').value || 0);
    const name = $('#p-name').value.trim();
    const prize = $('#p-prize').value.trim() || null;
    if (!rank || !name) return;
    t.placements.push({ rank, name, prize });
    save(data);
    renderPlacementTable(t);
    $('#p-rank').value = '';
    $('#p-name').value = '';
    $('#p-prize').value = '';
  };
  $('#t-mark-complete').onclick = () => {
    const tid = $('#t-manage-select').value;
    if (!tid) return;
    const t = data.tournaments.find((x) => x.id === tid);
    t.status = 'completed';
    save(data);
    renderTournaments();
  };
  fillTournamentManage();
}
function fillTournamentManage() {
  const sel = $('#t-manage-select');
  sel.innerHTML = '<option value="">Select…</option>' + data.tournaments.map((t) => `<option value="${t.id}">${t.title}</option>`).join('');
  sel.onchange = () => {
    const t = data.tournaments.find((x) => x.id === sel.value);
    renderPlacementTable(t);
  };
}
function renderPlacementTable(t) {
  const tb = $('#placements-table tbody');
  tb.innerHTML = '';
  if (!t) return;
  t.placements.sort((a, b) => a.rank - b.rank).forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.rank}</td><td>${p.name}</td><td>${p.prize || ''}</td>`;
    tb.appendChild(tr);
  });
}

// Initial rendering
renderLeaderboard();
renderTournaments();
refreshHomeStats();
renderHighlights();
showPage('home');
updateBackBar();
// Initialize admin immediately since there is no login gate
initAdmin();
