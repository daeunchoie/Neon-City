import * as Music from './music.js?v=6';
// DOM panel + buttons. Knows nothing about Phaser.
const $ = id => document.getElementById(id);
export function init(h) { $('save').onclick = h.save; $('reset').onclick = h.reset; $('close').onclick = h.close; initIntro(); initMusic(); }
export const setDirty = d => $('save').classList.toggle('dirty', d);
export function toast(m) {
  const t = $('toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1500);
}
export const hide = () => $('panel').classList.add('hidden');
export function show(title, groups, atTop) {
  $('panel-title').textContent = title;
  const box = $('options'); box.innerHTML = '';
  groups.forEach(g => {
    const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = g.label;
    const row = document.createElement('div'); row.className = 'items';
    g.items.forEach((it, idx) => {
      const b = document.createElement('button');
      b.className = 'opt' + (idx === g.cur ? ' on' : '');
      b.setAttribute('aria-label', it.name);
      if (it.color != null) b.style.background = '#' + it.color.toString(16).padStart(6, '0'); else b.textContent = it.name;
      b.onclick = () => { row.querySelectorAll('.opt').forEach((x, j) => x.classList.toggle('on', j === idx)); g.pick(idx); };
      row.append(b);
    });
    box.append(lab, row);
  });
  $('panel').classList.toggle('top', !!atTop);
  $('panel').classList.remove('hidden');
}

function initIntro() {
  const el = $('intro'), K = 'neon-worlds-intro-seen';
  const open = () => el.classList.remove('hidden');
  const close = () => { el.classList.add('hidden'); try { localStorage.setItem(K, '1'); } catch (e) {} };
  $('intro-x').onclick = close; $('intro-ok').onclick = close; $('help').onclick = open;
  let seen = false; try { seen = !!localStorage.getItem(K); } catch (e) {}
  if (!seen) open();
}

function initMusic() {
  const b = $('music'), K = 'neon-worlds-music'; let want = true;
  try { want = localStorage.getItem(K) !== 'off'; } catch (e) {}
  const sync = () => b.classList.toggle('off', !want);
  b.onclick = () => { want = !want; try { localStorage.setItem(K, want ? 'on' : 'off'); } catch (e) {} want ? Music.start() : Music.stop(); sync(); };
  // Browsers only allow sound after a user gesture, so the first tap anywhere starts the music.
  const first = () => { if (want) Music.start(); ['touchend', 'mousedown'].forEach(ev => window.removeEventListener(ev, first, true)); };
  ['touchend', 'mousedown'].forEach(ev => window.addEventListener(ev, first, true));
  sync();
}
