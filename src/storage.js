const KEY = 'neon-worlds-v1';
export function loadCity(def) {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    const ok = s && s.v === def.v && ['buildings','billboards','vehicles'].every(k => Array.isArray(s[k]) && s[k].length === def[k].length);
    return ok ? s : null;
  } catch (e) { return null; }
}
export function saveCity(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); return true; } catch (e) { return false; } }
export function clearCity() { try { localStorage.removeItem(KEY); } catch (e) {} }
