// Pure drawing helpers: (graphics, geometry, style) -> pixels.
import { PAL, SKIES } from './data.js';
export const shade = (c, f) => { const m = s => Math.min(255, ((c >> s) & 255) * f | 0); return (m(16) << 16) | (m(8) << 8) | m(0); };
const mix = (a, b, t) => { const m = s => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return (m(16) << 16) | (m(8) << 8) | m(0); };
const rnd = s => () => (s = s * 16807 % 2147483647) / 2147483647;
const hash = (a, b, c) => ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0;

// Any-language pixel text: render with the device's CJK font at tiny size, threshold to hard pixels.
const FONT = '"Noto Sans KR","Noto Sans JP","Malgun Gothic","Apple SD Gothic Neo","Hiragino Sans","Yu Gothic",sans-serif';
const cache = {};
export function glyphs(str, vert) {
  const key = str + vert; if (cache[key]) return cache[key];
  const P = 11, ch = [...str], W = vert ? P : P * ch.length, H = vert ? P * ch.length : P;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d', { willReadFrequently: true });
  x.font = `bold ${P - 1}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff';
  ch.forEach((c, k) => x.fillText(c, vert ? P / 2 : k * P + P / 2, vert ? k * P + P / 2 + 1 : P / 2 + 1));
  const d = x.getImageData(0, 0, W, H).data, px = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (d[(j * W + i) * 4 + 3] > 100) px.push([i, j]);
  return (cache[key] = { px, w: W, h: H });
}
function drawSign(g, x, y, gp, c) {
  const w = gp.w * 2 + 6, h = gp.h * 2 + 6;
  g.fillStyle(c, 0.3).fillRect(x - 2, y - 2, w + 4, h + 4);
  g.fillStyle(0x07030c).fillRect(x, y, w, h);
  g.lineStyle(2, c).strokeRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle(mix(c, 0xffffff, 0.6)); gp.px.forEach(([i, j]) => g.fillRect(x + 3 + i * 2, y + 3 + j * 2, 2, 2));
}

export function drawSky(g, i, W, H) {
  const [, top, bot] = SKIES[i]; g.clear();
  for (let y = 0; y < H; y += 8) { g.fillStyle(mix(top, bot, Math.pow(y / H, 1.6))); g.fillRect(0, y, W, 8); }
  [[0.35, 230, 90, 7], [0.62, 150, 60, 11]].forEach(([k, mh, mn, seed], L) => {
    const r = rnd(seed); let x = 0; const c = mix(bot, 0, k);
    while (x < W) {
      const w = 12 + Math.floor(r() * 20), h = mn + Math.floor(r() * (mh - mn));
      g.fillStyle(c).fillRect(x, H - h, w, h);
      if (L) for (let k2 = 0; k2 < h / 14; k2++) if (r() < 0.6) g.fillStyle(0xffb347, 0.55).fillRect(x + 2 + Math.floor(r() * (w - 5)), H - h + 4 + k2 * 12, 2, 3);
      x += w + 2;
    }
  });
}
export function drawFog(g, i, W, GY) {
  g.clear(); const bot = SKIES[i][2];
  for (let y = GY - 150; y < GY; y += 10) g.fillStyle(bot, 0.04 + ((y - GY + 150) / 150) * 0.34).fillRect(0, y, W, 10);
}
export function drawStars(g, seed, n) {
  const r = rnd(seed);
  for (let k = 0; k < n; k++) { g.fillStyle(r() < 0.3 ? 0xffb8f2 : 0xffffff); g.fillRect(Math.floor(r() * 180) * 2, Math.floor(r() * 110) * 2, 2, 2); }
}
export function drawGround(g, W, H, GY) {
  g.fillStyle(0x0d0820).fillRect(0, GY, W, H - GY);
  g.fillStyle(0x1a1033).fillRect(0, GY, W, 12);
  g.fillStyle(0x07040f).fillRect(0, GY + 12, W, H - GY - 12);
  g.fillStyle(0xff2d7a, 0.15).fillRect(0, GY + 14, W, 18);
  g.fillStyle(0xff2d7a).fillRect(0, GY + 12, W, 2);
  g.fillStyle(0x2bf6ff).fillRect(0, H - 4, W, 4);
  g.fillStyle(0x4a3a80); const my = GY + 12 + Math.floor((H - GY - 12) / 2);
  for (let x = 0; x < W; x += 30) g.fillRect(x, my, 16, 2);
}

export function drawBuilding(g, L, s, i, GY) {
  g.clear(); const c = PAL.body[s.body][1], top = GY - L.h, { x, w } = L, nc = PAL.neon[s.neon][1], st = s.style;
  g.fillStyle(c).fillRect(x, top, w, L.h);
  g.fillStyle(shade(c, 0.6)).fillRect(x + w - 8, top, 8, L.h);
  g.fillStyle(shade(c, 1.6)).fillRect(x, top, w, 2);
  const win = PAL.win[s.win][1], off = shade(c, 1.35), cols = Math.floor((w - 16) / 12), rows = Math.floor((L.h - 30) / 16);
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    g.fillStyle(hash(i + 1, r, k) % 100 < 55 ? win : off).fillRect(x + 6 + k * 12, top + 14 + r * 16, 6, 8);
    if (st === 4) g.fillStyle(shade(c, 0.5)).fillRect(x + 4 + k * 12, top + 23 + r * 16, 10, 2);
  }
  if (st === 0) { g.fillStyle(shade(c, 0.8)).fillRect(x + 10, top - 12, w - 20, 12); g.fillStyle(0x9999bb).fillRect(x + w / 2 - 1, top - 28, 2, 16); g.fillStyle(0xff3b3b).fillRect(x + w / 2 - 1, top - 30, 2, 2); }
  else if (st === 1) {
    g.fillStyle(0x8a2433).fillRect(x - 6, top - 4, w + 12, 6).fillRect(x - 2, top - 12, w + 4, 8);
    g.fillStyle(0xd44a3a).fillRect(x - 6, top - 4, w + 12, 2).fillRect(x - 2, top - 12, w + 4, 2).fillRect(x - 8, top - 6, 2, 2).fillRect(x + w + 6, top - 6, 2, 2);
    g.fillStyle(0xffc857).fillRect(x + w / 2 - 1, top - 18, 2, 6);
  } else if (st === 2) {
    for (let k = 0; k < w; k += 8) g.fillStyle(k / 8 % 2 ? nc : 0x1a0a12).fillRect(x + k, GY - 46, 8, 10);
    g.fillStyle(0x7d8590).fillRect(x + w - 16, top + 40, 8, 6).fillRect(x + w - 16, top + 72, 8, 6);
    g.fillStyle(0x5b4636).fillRect(x + 8, top - 14, 12, 14).fillRect(x + 10, top - 18, 8, 4);
  } else if (st === 3) {
    for (let y = top + 30; y < GY - 10; y += 48) g.fillStyle(nc, 0.5).fillRect(x, y, w - 8, 2);
    g.fillStyle(shade(c, 0.7)).fillRect(x + 6, top - 6, 10, 6).fillRect(x + w - 24, top - 6, 10, 6);
  }
}
export function drawNeon(g, L, s, i, GY) {
  g.clear(); const c = PAL.neon[s.neon][1], top = GY - L.h;
  g.fillStyle(c, 0.25).fillRect(L.x - 2, top - 2, L.w + 4, 6).fillRect(L.x - 2, top - 2, 6, L.h + 2);
  g.fillStyle(c).fillRect(L.x, top, L.w, 2).fillRect(L.x, top, 2, L.h);
  const text = ['酒場', 'ホテル', '별빛', '카페', '夜市', '霓虹', '月光', '拉麺'][s.sign];
  let v = i % 2 === 0, gp = glyphs(text, v);
  if (!v && gp.w * 2 + 6 > L.w - 6) { v = true; gp = glyphs(text, true); }
  const sx = L.x + (L.w - gp.w * 2 - 6) * (v ? (i % 4 < 2 ? 0.15 : 0.8) : 0.4);
  drawSign(g, Math.round(sx), top + 26, gp, PAL.neon[s.signColor][1]);
}
export function drawBillboard(g, r, s) {
  g.clear(); const c = PAL.neon[s.color][1], { x, y } = r, cx = x + 26, P = 0x14040a, bg = mix(c, 0, 0.45), hi = mix(c, 0xffffff, 0.6);
  g.fillStyle(0x2a2048).fillRect(x + 8, y + 64, 2, r.legH).fillRect(x + 42, y + 64, 2, r.legH);
  g.fillStyle(c, 0.3).fillRect(x - 2, y - 2, 56, 68);
  g.fillStyle(bg).fillRect(x, y, 52, 64);
  g.fillStyle(0x000000, 0.18); for (let k = 2; k < 64; k += 4) g.fillRect(x, y + k, 52, 1);
  if (s.design === 0) {
    g.fillStyle(P).fillRect(cx - 8, y + 10, 16, 30).fillCircle(cx, y + 16, 6).fillRect(cx - 10, y + 26, 20, 5).fillRect(cx - 6, y + 31, 12, 13);
    g.fillTriangle(cx - 6, y + 44, cx + 6, y + 44, cx - 10, y + 56).fillTriangle(cx + 6, y + 44, cx + 10, y + 56, cx - 10, y + 56).fillRect(cx - 5, y + 56, 3, 6).fillRect(cx + 2, y + 56, 3, 6);
  } else if (s.design === 1) {
    g.fillStyle(P).fillRect(cx - 8, y + 12, 16, 14).fillRect(cx - 1, y + 4, 2, 8).fillRect(cx - 10, y + 16, 2, 6).fillRect(cx + 8, y + 16, 2, 6).fillRect(cx - 14, y + 28, 28, 8).fillRect(cx - 8, y + 36, 16, 22);
    g.fillStyle(hi).fillRect(cx - 6, y + 17, 12, 3);
  } else if (s.design === 2) {
    g.fillStyle(hi).fillCircle(cx, y + 30, 16); g.fillStyle(bg); for (let k = 0; k < 5; k++) g.fillRect(cx - 17, y + 32 + k * 4, 34, 1 + (k >> 1));
  } else { g.fillStyle(hi); [10, 22, 16, 30, 12, 24, 18].forEach((h, k) => g.fillRect(x + 6 + k * 6, y + 56 - h, 4, h)); }
  g.lineStyle(2, c).strokeRect(x + 1, y + 1, 50, 62);
}
export function drawVehicle(g, type, c) {
  g.clear(); const hi = shade(c, 1.3), lo = shade(c, 0.6);
  if (type === 0) {
    g.fillStyle(c, 0.3).fillRect(-10, 5, 20, 3); g.fillStyle(c).fillRect(-12, -3, 24, 6); g.fillStyle(hi).fillRect(-5, -7, 10, 4);
    g.fillStyle(0xbff6ff).fillRect(-3, -6, 6, 2); g.fillStyle(lo).fillRect(-12, 3, 24, 2); g.fillStyle(0xffffff, 0.8).fillRect(-14, -1, 2, 3); g.fillStyle(0xfff2a0).fillRect(10, -1, 2, 2);
  } else if (type === 1) {
    g.fillStyle(c, 0.3).fillRect(-14, 6, 28, 3); g.fillStyle(c).fillRect(-16, -5, 32, 10); g.fillStyle(lo).fillRect(-16, 3, 32, 3);
    for (let k = 0; k < 4; k++) g.fillStyle(0xbff6ff).fillRect(-12 + k * 7, -3, 5, 4);
    g.fillStyle(0xfff2a0).fillRect(14, -1, 2, 3);
  } else if (type === 2) {
    g.fillStyle(lo).fillRect(-26, -9, 6, 6).fillRect(-26, 3, 6, 6).fillRect(-6, 8, 12, 4);
    g.fillStyle(c).fillEllipse(0, 0, 48, 18); g.fillStyle(hi).fillRect(-14, -5, 28, 2); g.fillStyle(0xffffff, 0.85).fillRect(-12, 0, 24, 2);
  } else {
    g.fillStyle(lo).fillRect(-5, -2, 10, 5); g.fillStyle(c).fillRect(-11, -4, 22, 1).fillRect(-12, -6, 6, 1).fillRect(6, -6, 6, 1);
    g.fillStyle(0xff3b3b).fillRect(-1, 3, 2, 2);
  }
}
