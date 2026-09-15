/* Sliders for an experiment's parameters.

   Plain DOM with stable class names and no inline styles, so the host page
   can style it. `bn-lab/style.css` ships a neutral default. */

const decimals = step => (String(step).split('.')[1] || '').length;

export function buildControls(host, def, api, locale = 'en') {
  const params = def.params || [];
  host.textContent = '';
  host.classList.add('bnlab-controls');
  if (!params.length) return { sync() {}, destroy() { host.textContent = ''; } };

  const rows = new Map();
  const text = l => (l && typeof l === 'object' ? l[locale] ?? l.en : l);

  for (const p of params) {
    const row = document.createElement('label');
    row.className = 'bnlab-ctl';
    const name = document.createElement('span');
    name.className = 'bnlab-ctl-label';
    name.textContent = text(p.label) ?? p.key;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = p.min; input.max = p.max; input.step = p.step ?? 'any';
    input.value = api.params[p.key];
    const out = document.createElement('output');
    out.className = 'bnlab-ctl-value';
    const fmt = v => (p.step && p.step < 1 ? Number(v).toFixed(decimals(p.step)) : String(v)) + (p.unit || '');
    out.textContent = fmt(api.params[p.key]);
    input.addEventListener('input', () => { api.set(p.key, +input.value); });
    row.append(name, input, out);
    host.appendChild(row);
    rows.set(p.key, { input, out, fmt });
  }

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'bnlab-reset';
  reset.textContent = locale === 'es' ? 'Reiniciar' : 'Reset';
  reset.addEventListener('click', () => { api.resetParams(); api.reset(); });
  host.appendChild(reset);

  return {
    sync(key) {
      for (const [k, r] of rows) {
        if (key && k !== key) continue;
        r.input.value = api.params[k];
        r.out.textContent = r.fmt(api.params[k]);
      }
    },
    destroy() { host.textContent = ''; host.classList.remove('bnlab-controls'); }
  };
}
