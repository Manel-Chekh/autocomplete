import { countries } from './data.js';

const input = document.getElementById('search');
const list = document.getElementById('results');
const MAX = 8;

// Lowercase, remove accents, turn apostrophes into spaces
const strip = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['\u2019\u2018`\u00b4]/g, ' ');
// Keep only letters/digits separated by single spaces
const norm = s => strip(s).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const compact = s => norm(s).replace(/ /g, '');

// Index built ONCE at load: each keystroke only searches prepared strings
const index = countries.map(c => ({ name: c.name, n: norm(c.name), c: compact(c.name) }));

function search(query) {
  const n = norm(query);
  if (!n) return [];
  const c = n.replace(/ /g, '');
  const out = [];
  for (const e of index) {
    let score = -1;
    if (e.n.startsWith(n)) score = 0;                 // starts with the query
    else if ((' ' + e.n).includes(' ' + n)) score = 1; // a word starts with the query
    else if (e.n.includes(n)) score = 2;               // mid-word match (land -> iceland)
    else if (c && e.c.includes(c)) score = 3;          // ignoring spaces (cote divoire)
    if (score >= 0) out.push({ name: e.name, score });
  }
  out.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  return out.slice(0, MAX);
}

// Build a highlighted node, mapping the match back to the original text
function highlight(name, query) {
  const frag = document.createDocumentFragment();
  let flat = '';
  const map = [];
  [...name].forEach((ch, i) => {
    const f = strip(ch).replace(/[^\p{L}\p{N}]/gu, ' ');
    for (const x of f) { flat += x; map.push(i); }
  });
  const q = norm(query);
  const idx = q ? flat.indexOf(q) : -1;
  if (idx < 0) { frag.append(name); return frag; }
  const start = map[idx];
  const end = map[idx + q.length - 1] + 1;
  const chars = [...name];
  const mark = document.createElement('mark');
  mark.textContent = chars.slice(start, end).join('');
  frag.append(chars.slice(0, start).join(''), mark, chars.slice(end).join(''));
  return frag;
}

let items = [];
let active = -1;

function setOpen(open) {
  list.hidden = !open;
  input.setAttribute('aria-expanded', String(open));
}

function setActive(i) {
  const lis = list.querySelectorAll('li[role="option"]');
  lis.forEach(li => li.classList.remove('active'));
  active = i;
  if (i >= 0 && lis[i]) { lis[i].classList.add('active'); lis[i].scrollIntoView({ block: 'nearest' }); }
}

function render() {
  const q = input.value;
  items = search(q);
  list.replaceChildren();
  active = -1;
  if (!norm(q)) { setOpen(false); return; }
  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No results';
    list.append(li);
  } else {
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.append(highlight(it.name, q));
      li.addEventListener('mousedown', e => { e.preventDefault(); choose(i); });
      list.append(li);
    });
  }
  setOpen(true);
}

function choose(i) {
  if (!items[i]) return;
  input.value = items[i].name;
  setOpen(false);
}

// Small debounce so we don't search on every single key burst
let timer;
input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 60); });
input.addEventListener('focus', () => { if (input.value) render(); });
input.addEventListener('blur', () => setOpen(false));

input.addEventListener('keydown', e => {
  if (list.hidden || items.length === 0) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % items.length); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + items.length) % items.length); }
  else if (e.key === 'Enter') { e.preventDefault(); choose(active >= 0 ? active : 0); }
  else if (e.key === 'Escape') { setOpen(false); }
});