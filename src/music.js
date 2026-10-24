// Procedural cyberpunk loop (Web Audio, no audio files). Am - F - C - G, 92 BPM.
let ctx, master, noise, timer = 0, step = 0, next = 0;
const S = 60 / 92 / 4, BASS = [45, 41, 48, 43], CH = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]];
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function osc(t, m, d, type, v, cut, a = 0.01) {
  const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  o.type = type; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = cut;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
}
function kick(t) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
}
function burst(t, type, freq, d, v) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + d + 0.02);
}
function sched(s, t) {
  const bar = (s >> 4) % 4, k = s & 15, root = BASS[bar], ch = CH[bar];
  if (k % 4 === 0) kick(t);
  if (k === 4 || k === 12) burst(t, 'bandpass', 1800, 0.14, 0.45);
  if (k % 2 === 1) burst(t, 'highpass', 7000, 0.04, 0.12);
  if (k % 2 === 0) osc(t, root + (k % 8 === 6 ? 12 : 0), S * 1.8, 'sawtooth', 0.28, 500);
  osc(t, root + 24 + ch[[0, 1, 2, 1][k % 4]] + (k % 8 > 3 ? 12 : 0), S * 1.5, 'square', 0.07, 2400);
  if (k === 0) ch.forEach(n => osc(t, root + 12 + n, S * 16, 'sawtooth', 0.05, 900, 0.6));
}
export function start() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.3;
    const c = ctx.createDynamicsCompressor(); master.connect(c); c.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    document.addEventListener('visibilitychange', () => { if (ctx && timer) document.hidden ? ctx.suspend() : ctx.resume(); });
  }
  ctx.resume(); if (timer) return;
  next = ctx.currentTime + 0.1; step = 0;
  timer = setInterval(() => { while (next < ctx.currentTime + 0.3) { sched(step, next); next += S; step++; } }, 60);
}
export function stop() { clearInterval(timer); timer = 0; if (ctx) ctx.suspend(); }
