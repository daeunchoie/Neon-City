import { PAL, DESIGNS, SKIES, defaultCity } from '../data.js';
import { loadCity, saveCity, clearCity } from '../storage.js';
import * as D from '../draw.js';
import * as UI from '../ui.js';

const W = 360, H = 640, GY = 540;
// Fixed composition (layout); only styles live in the saved city.
const B = [{x:4,w:68,h:300},{x:76,w:56,h:390},{x:136,w:84,h:260},{x:224,w:60,h:350},{x:288,w:68,h:300}];
const BB_ON = [1, 3];
const V = [{y:90,speed:30,dir:1},{y:170,speed:18,dir:-1},{y:250,speed:44,dir:1}];
const bbRect = i => { const L = B[BB_ON[i]], top = GY - L.h, y = top - 34; return { x: L.x + L.w / 2 - 22, y, w: 44, h: 28, legH: top - (y + 28) }; };

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

    this.bG = []; this.nG = []; this.bbG = []; this.vG = []; this.veh = [];
    B.forEach((L, i) => {
      this.bG.push(gfx(3)); const n = gfx(4); this.nG.push(n);
      this.tweens.add({ targets: n, alpha: 0.65, duration: 900 + i * 170, yoyo: true, repeat: -1 });
      this.zone(L.x + L.w / 2, GY - L.h / 2, L.w, L.h, 5, () => this.select('building', i));
    });
    BB_ON.forEach((_, i) => {
      const g = gfx(6); this.bbG.push(g); const r = bbRect(i);
      this.tweens.add({ targets: g, alpha: 0.75, duration: 500 + i * 330, yoyo: true, repeat: -1, hold: 900 });
      this.zone(r.x + 22, r.y + 14, 52, 40, 7, () => this.select('billboard', i));
    });
    V.forEach((m, i) => {
      const g = this.add.graphics(); this.vG.push(g);
      const c = this.add.container(Phaser.Math.Between(0, W), m.y, [g]).setDepth(8).setScale(m.dir, 1);
      c.setInteractive(new Phaser.Geom.Rectangle(-24, -18, 48, 36), Phaser.Geom.Rectangle.Contains);
      c.on('pointerdown', () => this.select('vehicle', i)); this.veh.push(c);
    });
    this.zone(W / 2, GY / 2, W, GY, 0, () => this.select('sky', 0));
    this.zone(W / 2, (GY + H) / 2, W, H - GY, 0, () => this.select(null));
    this.hl = gfx(9);
    this.paint();
    UI.init({ save: () => this.save(), reset: () => this.reset(), close: () => this.select(null) });
  }
  zone(x, y, w, h, depth, fn) { this.add.zone(x, y, w, h).setDepth(depth).setInteractive().on('pointerdown', fn); }

  paint() {
    const c = this.city;
    D.drawSky(this.skyG, c.sky, W, GY);
    B.forEach((L, i) => { D.drawBuilding(this.bG[i], L, c.buildings[i], i, GY); D.drawNeon(this.nG[i], L, c.buildings[i], GY); });
    BB_ON.forEach((_, i) => D.drawBillboard(this.bbG[i], bbRect(i), c.billboards[i]));
    this.vG.forEach((g, i) => D.drawVehicle(g, PAL.vehicle[c.vehicles[i].color][1]));
  }
  update(t, dt) {
    V.forEach((m, i) => {
      const c = this.veh[i]; c.x += m.dir * m.speed * dt / 1000;
      if (m.dir > 0 && c.x > W + 30) c.x = -30; if (m.dir < 0 && c.x < -30) c.x = W + 30;
      c.y = m.y + Math.round(Math.sin(t / 600 + i) * 2);
    });
    this.hl.clear();
    if (this.sel) { const r = this.selRect(); this.hl.lineStyle(2, 0xffffff, 0.9).strokeRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4); }
  }
  selRect() {
    const { kind, i } = this.sel;
    if (kind === 'building') return { x: B[i].x, y: GY - B[i].h, w: B[i].w, h: B[i].h };
    if (kind === 'billboard') return bbRect(i);
    if (kind === 'vehicle') return { x: this.veh[i].x - 16, y: this.veh[i].y - 10, w: 32, h: 20 };
    return { x: 4, y: 4, w: W - 8, h: GY - 8 };
  }

  select(kind, i = 0) {
    this.sel = kind ? { kind, i } : null;
    if (!kind) return UI.hide();
    UI.show(...this.spec());
  }
  spec() {
    const { kind, i } = this.sel, c = this.city;
    const sw = a => a.map(([name, color]) => ({ name, color }));
    const set = (o, k) => idx => { o[k] = idx; this.paint(); this.dirty(); };
    if (kind === 'building') { const o = c.buildings[i]; return [`Building ${i + 1}`, [
      { label: 'Walls', items: sw(PAL.body), cur: o.body, pick: set(o, 'body') },
      { label: 'Windows', items: sw(PAL.win), cur: o.win, pick: set(o, 'win') },
      { label: 'Neon trim', items: sw(PAL.neon), cur: o.neon, pick: set(o, 'neon') }]]; }
    if (kind === 'billboard') { const o = c.billboards[i]; return ['Billboard', [
      { label: 'Design', items: DESIGNS.map(name => ({ name })), cur: o.design, pick: set(o, 'design') },
      { label: 'Color', items: sw(PAL.neon), cur: o.color, pick: set(o, 'color') }]]; }
    if (kind === 'vehicle') { const o = c.vehicles[i]; return ['Vehicle', [
      { label: 'Color', items: sw(PAL.vehicle), cur: o.color, pick: set(o, 'color') }]]; }
    return ['Sky', [{ label: 'Mood', items: SKIES.map(([name]) => ({ name })), cur: c.sky, pick: set(c, 'sky') }]];
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
