// Pure drawing helpers: (graphics, geometry, style) -> pixels.
import { PAL, SKIES } from './data.js';
export const shade = (c, f) => { const m = s => Math.min(255, ((c >> s) & 255) * f | 0); return (m(16) << 16) | (m(8) << 8) | m(0); };
const mix = (a, b, t) => { const m = s => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return (m(16) << 16) | (m(8) << 8) | m(0); };
const rnd = s => () => (s = s * 16807 % 2147483647) / 2147483647;
const hash = (a, b, c) => ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0;

export function drawSky(g, i, W, H) {
  const [, top, bot] = SKIES[i]; g.clear();
  for (let y = 0; y < H; y += 10) { g.fillStyle(mix(top, bot, y / H)); g.fillRect(0, y, W, 10); }
  const r = rnd(5); let x = 0; g.fillStyle(shade(bot, 0.55));
  while (x < W) { const w = 14 + Math.floor(r() * 22), h = 60 + Math.floor(r() * 110); g.fillRect(x, H - h, w, h); x += w + 2; }
}
export function drawStars(g, seed, n) {
  const r = rnd(seed);
  for (let k = 0; k < n; k++) { g.fillStyle(r() < 0.3 ? 0xffb8f2 : 0xffffff); g.fillRect(Math.floor(r() * 180) * 2, Math.floor(r() * 130) * 2, 2, 2); }
}
export function drawGround(g, W, H, GY) {
  g.fillStyle(0x0d0820).fillRect(0, GY, W, H - GY);
  g.fillStyle(0x1a1033).fillRect(0, GY, W, 12);
  g.fillStyle(0x07040f).fillRect(0, GY + 12, W, H - GY - 12);
  g.fillStyle(0xff2bd6).fillRect(0, GY + 12, W, 2);
  g.fillStyle(0x2bf6ff).fillRect(0, H - 4, W, 4);
  g.fillStyle(0x4a3a80); const my = GY + 12 + Math.floor((H - GY - 12) / 2);
  for (let x = 0; x < W; x += 30) g.fillRect(x, my, 16, 2);
}
export function drawBuilding(g, L, s, i, GY) {
  g.clear(); const c = PAL.body[s.body][1], top = GY - L.h;
  g.fillStyle(c).fillRect(L.x, top, L.w, L.h);
  g.fillStyle(shade(c, 0.65)).fillRect(L.x + L.w - 8, top, 8, L.h);
  g.fillStyle(shade(c, 1.5)).fillRect(L.x, top, L.w, 2);
  const win = PAL.win[s.win][1], off = shade(c, 1.3);
  const cols = Math.floor((L.w - 16) / 12), rows = Math.floor((L.h - 24) / 16);
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    g.fillStyle(hash(i + 1, r, k) % 100 < 55 ? win : off).fillRect(L.x + 6 + k * 12, top + 12 + r * 16, 6, 8);
  }
}
export function drawNeon(g, L, s, GY) {
  g.clear(); const c = PAL.neon[s.neon][1], top = GY - L.h;
  g.fillStyle(c, 0.25).fillRect(L.x - 2, top - 2, L.w + 4, 6).fillRect(L.x - 2, top - 2, 6, L.h + 2);
  g.fillStyle(c).fillRect(L.x, top, L.w, 2).fillRect(L.x, top, 2, L.h).fillRect(L.x, GY - 60, L.w - 8, 2);
}
export function drawBillboard(g, r, s) {
  g.clear(); const c = PAL.neon[s.color][1], x = r.x, y = r.y, P = 0x0a0618;
  g.fillStyle(0x2a2048).fillRect(x + 6, y + 28, 2, r.legH).fillRect(x + 36, y + 28, 2, r.legH);
  g.fillStyle(c, 0.3).fillRect(x - 2, y - 2, 48, 32);
  g.fillStyle(P).fillRect(x, y, 44, 28);
  g.lineStyle(2, c).strokeRect(x + 1, y + 1, 42, 26);
  const ix = x + 6, iy = y + 5; g.fillStyle(c);
  if (s.design === 0) for (let k = 0; k < 4; k++) g.fillRect(ix, iy + k * 5, 32, 3);
  else if (s.design === 1) { g.fillCircle(x + 22, y + 14, 9); g.fillStyle(P); for (let k = 0; k < 3; k++) g.fillRect(x + 12, y + 16 + k * 3, 20, 1); }
  else if (s.design === 2) [6, 12, 9, 15, 7, 12].forEach((h, k) => g.fillRect(ix + k * 6, y + 22 - h, 4, h));
  else { for (let k = 0; k < 5; k++) g.fillRect(ix + k * 8, iy, 1, 18); for (let k = 0; k < 4; k++) g.fillRect(ix, iy + k * 6, 33, 1); }
}
export function drawVehicle(g, color) {
  g.clear();
  g.fillStyle(color, 0.3).fillRect(-10, 5, 20, 3);
  g.fillStyle(color).fillRect(-12, -3, 24, 6);
  g.fillStyle(shade(color, 1.3)).fillRect(-5, -7, 10, 4);
  g.fillStyle(0xbff6ff).fillRect(-3, -6, 6, 2);
  g.fillStyle(shade(color, 0.6)).fillRect(-12, 3, 24, 2);
  g.fillStyle(0xffffff, 0.8).fillRect(-14, -1, 2, 3);
  g.fillStyle(0xfff2a0).fillRect(10, -1, 2, 2);
}
