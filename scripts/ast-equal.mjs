// Compara dos fuentes JS ignorando comentarios y posiciones.
// Uso: node scripts/ast-equal.mjs <dir-a> <dir-b>   (compara archivo por archivo)
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';

const DROP = new Set(['start', 'end', 'loc', 'range', 'raw']);
const norm = src => JSON.stringify(
  acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' }),
  (k, v) => (DROP.has(k) ? undefined : v)
);

const [a, b] = process.argv.slice(2);
let bad = 0, n = 0;
for (const f of fs.readdirSync(a).filter(f => f.endsWith('.js'))) {
  const pb = path.join(b, f);
  if (!fs.existsSync(pb)) continue;
  n++;
  if (norm(fs.readFileSync(path.join(a, f), 'utf8')) !== norm(fs.readFileSync(pb, 'utf8'))) {
    console.log('DIFFERENT:', f); bad++;
  }
}
console.log(`${n - bad}/${n} identical ignoring comments`);
process.exit(bad ? 1 : 0);
