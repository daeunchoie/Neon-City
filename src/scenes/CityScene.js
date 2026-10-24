import { PAL, STYLES, SIGNS, DESIGNS, MEGA_DESIGNS, CSTYLES, VTYPES, SKIES, defaultCity } from '../data.js?v=6';
import { loadCity, saveCity, clearCity } from '../storage.js?v=6';
import * as D from '../draw.js?v=6';
import * as UI from '../ui.js?v=6';

const W = 360, H = 640, GY = 540;
// Fixed composition (layout); only styles live in the saved city.
const B = [{x:4,w:68,h:300},{x:76,w:56,h:390},{x:136,w:84,h:260},{x:224,w:60,h:350},{x:288,w:68,h:300}];
const BB_ON = [1, 3];
const V = [{y:50,speed:10,dir:-1},{y:120,speed:34,dir:1},{y:200,speed:22,dir:-1},{y:290,speed:50,dir:1}];
const bbRect = i => { const L = B[BB_ON[i]], top = GY - L.h, y = top - 72; return { x: L.x + L.w / 2 - 26, y, w: 52, h: 64, legH: top - (y + 64) + 6 }; };

const BR_Y = 452;
const BCARS = [{speed:40,dir:1},{speed:28,dir:-1},{speed:55,dir:1}];
const CIT = [{x:50,speed:9,dir:1},{x:140,speed:12,dir:-1},{x:230,speed:7,dir:1},{x:310,speed:10,dir:-1}];
const megaRect = () => { const L = B[2], y = GY - L.h - 50; return { x: L.x + L.w / 2 - 40, y, w: 80, h: 40, legH: 16 }; };

export class CityScene extends Phaser.Scene {
  constructor() { super('city'); }
  create() {
    const def = defaultCity();
    this.city = loadCity(def) || def; this.sel = null;
    const gfx = d => this.add.graphics().setDepth(d);
    this.skyG = gfx(0); D.drawStars(gfx(1), 7, 70);
    const tw = gfx(1); D.drawStars(tw, 99, 25);
    this.tweens.add({ targets: tw, alpha: 0.2, duration: 1400, yoyo: true, repeat: -1 });
    D.drawGround(gfx(2), W, H, GY);
    this.fogG = gfx(5); D.drawMoon(gfx(1));
    this.bridgeG = gfx(6); this.lampG = gfx(6); this.megaG = gfx(6);
    this.tweens.add({ targets: this.megaG, alpha: 0.85, duration: 700, yoyo: true, repeat: -1, hold: 1200 });
    this.tweens.add({ targets: this.lampG, alpha: 0.8, duration: 1600, yoyo: true, repeat: -1 });
    this.bcars = BCARS.map(m => { const g = this.add.graphics().setDepth(7).setScale(m.dir, 1); g.x = Phaser.Math.Between(0, W); g.y = BR_Y; return { g, m }; });
    this.cits = CIT.map(m => { const g = this.add.graphics().setDepth(7).setScale(m.dir, 1); g.x = m.x; g.y = GY + 9; return { g, m, f: -1 }; });

    this.bG = []; this.nG = []; this.bbG = []; this.vG = []; this.veh = [];
    B.forEach((L, i) => {
      this.bG.push(gfx(3)); const n = gfx(4); this.nG.push(n);
      this.tweens.add({ targets: n, alpha: 0.7, duration: 900 + i * 170, yoyo: true, repeat: -1 });
    });
    BB_ON.forEach((_, i) => {
      const g = gfx(6); this.bbG.push(g); const r = bbRect(i);
      this.tweens.add({ targets: g, alpha: 0.8, duration: 500 + i * 330, yoyo: true, repeat: -1, hold: 900 });
    });
    V.forEach((m, i) => {
      const g = this.add.graphics(); this.vG.push(g);
      const c = this.add.container(Phaser.Math.Between(0, W), m.y, [g]).setDepth(8).setScale(m.dir, 1);
      this.veh.push(c);
    });
    // One manual hit-test per tap (no per-object zones): deterministic on iOS, forgiving for moving vehicles.
    this.input.on('pointerdown', p => this.tap(p.x, p.y));
    // iOS Safari: toolbars collapse/expand without a reliable resize event, so refresh canvas bounds before every touch.
    const bounds = () => this.scale.updateBounds();
    ['touchstart', 'mousedown'].forEach(ev => window.addEventListener(ev, bounds, { capture: true, passive: true }));
    const refresh = () => setTimeout(() => this.scale.refresh(), 300);
    window.addEventListener('orientationchange', refresh);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refresh);
    this.hl = gfx(9);
    this.paint();
    UI.init({ save: () => this.save(), reset: () => this.reset(), close: () => this.select(null) });
  }
  tap(x, y) {
    this.ripple(x, y);
    const near = (r, pad) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
    let best = null, bd = 1e9;
    this.veh.forEach((c, i) => { const d = Math.hypot(c.x - x, c.y - y); if (d < 30 && d < bd) { bd = d; best = ['vehicle', i]; } });
    this.cits.forEach((o, i) => { if (!best && Math.hypot(o.g.x - x, o.g.y - 8 - y) < 20) best = ['citizen', i]; });
    if (!best && near(megaRect(), 6)) best = ['mega', 0];
    if (!best) BB_ON.forEach((_, i) => { if (near(bbRect(i), 6)) best = ['billboard', i]; });
    if (!best && D.LAMPX.some(lx => Math.abs(lx - x) < 12) && y > GY - 46 && y < GY + 14) best = ['lamp', 0];
    if (!best && y > BR_Y - 10 && y < BR_Y + 14) best = ['bridge', 0];
    if (!best) B.forEach((L, i) => { if (near({ x: L.x, y: GY - L.h, w: L.w, h: L.h }, 2)) best = ['building', i]; });
    if (!best) best = y < GY ? ['sky', 0] : [null, 0];
    this.select(...best);
  }
  ripple(x, y) {
    const r = this.add.circle(x, y, 4, 0xffffff, 0).setStrokeStyle(2, 0xffffff, 0.9).setDepth(20);
    this.tweens.add({ targets: r, scale: 3, alpha: 0, duration: 260, onComplete: () => r.destroy() });
  }

  paint() {
    const c = this.city;
    D.drawSky(this.skyG, c.sky, W, GY); D.drawFog(this.fogG, c.sky, W, GY);
    B.forEach((L, i) => { D.drawBuilding(this.bG[i], L, c.buildings[i], i, GY); D.drawNeon(this.nG[i], L, c.buildings[i], i, GY); });
    BB_ON.forEach((_, i) => D.drawBillboard(this.bbG[i], bbRect(i), c.billboards[i]));
    this.vG.forEach((g, i) => D.drawVehicle(g, c.vehicles[i].type, PAL.vehicle[c.vehicles[i].color][1]));
    D.drawBridge(this.bridgeG, W, GY, BR_Y, PAL.neon[c.bridge.neon][1]);
    this.bcars.forEach(({ g }, i) => D.drawCar(g, D.shade(PAL.vehicle[c.bridge.car][1], [1, 0.75, 1.15][i % 3])));
    D.drawLamps(this.lampG, GY, PAL.lamp[c.lamp][1]); D.drawMega(this.megaG, megaRect(), c.mega);
    this.cits.forEach(o => { o.f = -1; });
  }
  update(t, dt) {
    V.forEach((m, i) => {
      const c = this.veh[i]; c.x += m.dir * m.speed * dt / 1000;
      if (m.dir > 0 && c.x > W + 40) c.x = -40; if (m.dir < 0 && c.x < -40) c.x = W + 40;
      c.y = m.y + Math.round(Math.sin(t / 600 + i) * 2);
    });
    this.bcars.forEach(({ g, m }) => { g.x += m.dir * m.speed * dt / 1000; if (m.dir > 0 && g.x > W + 20) g.x = -20; if (m.dir < 0 && g.x < -20) g.x = W + 20; });
    const fr = (t / 240 | 0) & 1;
    this.cits.forEach((o, i) => {
      o.g.x += o.m.dir * o.m.speed * dt / 1000; if (o.g.x > W + 12) o.g.x = -12; if (o.g.x < -12) o.g.x = W + 12;
      if (o.f !== fr) { o.f = fr; const cc = this.city.citizens[i]; D.drawCitizen(o.g, cc.style, PAL.neon[cc.color][1], fr); }
    });
    this.hl.clear();
    if (this.sel) { const r = this.selRect(); this.hl.lineStyle(2, 0xffffff, 0.9).strokeRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4); }
  }
  selRect() {
    const { kind, i } = this.sel;
    if (kind === 'building') return { x: B[i].x, y: GY - B[i].h, w: B[i].w, h: B[i].h };
    if (kind === 'billboard') return bbRect(i);
    if (kind === 'vehicle') return { x: this.veh[i].x - 26, y: this.veh[i].y - 14, w: 52, h: 28 };
    if (kind === 'mega') return megaRect();
    if (kind === 'bridge') return { x: 2, y: BR_Y - 10, w: W - 4, h: 26 };
    if (kind === 'lamp') return { x: 4, y: GY - 46, w: W - 8, h: 58 };
    if (kind === 'citizen') { const g = this.cits[i].g; return { x: g.x - 8, y: g.y - 26, w: 16, h: 30 }; }
    return { x: 4, y: 4, w: W - 8, h: GY - 8 };
  }

  select(kind, i = 0) {
    this.sel = kind ? { kind, i } : null;
    if (!kind) return UI.hide();
    const r = this.selRect();
    UI.show(...this.spec(), r.y + r.h / 2 > H / 2); // object in lower half -> panel on top, and vice versa
  }
  spec() {
    const { kind, i } = this.sel, c = this.city;
    const sw = a => a.map(([name, color]) => ({ name, color })), tx = a => a.map(name => ({ name }));
    const set = (o, k) => idx => { o[k] = idx; this.paint(); this.dirty(); };
    if (kind === 'building') { const o = c.buildings[i]; return [`Building ${i + 1}`, [
      { label: 'Style', items: tx(STYLES), cur: o.style, pick: set(o, 'style') },
      { label: 'Walls', items: sw(PAL.body), cur: o.body, pick: set(o, 'body') },
      { label: 'Windows', items: sw(PAL.win), cur: o.win, pick: set(o, 'win') },
      { label: 'Neon trim', items: sw(PAL.neon), cur: o.neon, pick: set(o, 'neon') },
      { label: 'Sign text', items: tx(SIGNS), cur: o.sign, pick: set(o, 'sign') },
      { label: 'Sign color', items: sw(PAL.neon), cur: o.signColor, pick: set(o, 'signColor') }]]; }
    if (kind === 'billboard') { const o = c.billboards[i]; return ['Billboard', [
      { label: 'Design', items: tx(DESIGNS), cur: o.design, pick: set(o, 'design') },
      { label: 'Color', items: sw(PAL.neon), cur: o.color, pick: set(o, 'color') }]]; }
    if (kind === 'vehicle') { const o = c.vehicles[i]; return ['Vehicle', [
      { label: 'Type', items: tx(VTYPES), cur: o.type, pick: set(o, 'type') },
      { label: 'Color', items: sw(PAL.vehicle), cur: o.color, pick: set(o, 'color') }]]; }
    if (kind === 'mega') { const o = c.mega; return ['Mega billboard', [
      { label: 'Design', items: tx(MEGA_DESIGNS), cur: o.design, pick: set(o, 'design') },
      { label: 'Slogan', items: tx(SIGNS), cur: o.text, pick: set(o, 'text') },
      { label: 'Color', items: sw(PAL.neon), cur: o.color, pick: set(o, 'color') }]]; }
    if (kind === 'bridge') { const o = c.bridge; return ['Overpass', [
      { label: 'Rail neon', items: sw(PAL.neon), cur: o.neon, pick: set(o, 'neon') },
      { label: 'Car color', items: sw(PAL.vehicle), cur: o.car, pick: set(o, 'car') }]]; }
    if (kind === 'lamp') return ['Street lamps', [{ label: 'Light', items: sw(PAL.lamp), cur: c.lamp, pick: set(c, 'lamp') }]];
    if (kind === 'citizen') { const o = c.citizens[i]; return [`Citizen ${i + 1}`, [
      { label: 'Outfit', items: tx(CSTYLES), cur: o.style, pick: set(o, 'style') },
      { label: 'Color', items: sw(PAL.neon), cur: o.color, pick: set(o, 'color') }]]; }
    return ['Sky', [{ label: 'Mood', items: tx(SKIES.map(s => s[0])), cur: c.sky, pick: set(c, 'sky') }]];
  }
  dirty() { UI.setDirty(true); }
  save() {
    const ok = saveCity(this.city);
    if (ok) UI.setDirty(false);
    UI.toast(ok ? 'City saved' : 'Could not save (storage blocked)');
  }
  reset() {
    if (!confirm('Reset your city to the default look?')) return;
    clearCity(); this.city = defaultCity(); this.paint(); this.select(null); UI.setDirty(false); UI.toast('City reset');
  }
}
