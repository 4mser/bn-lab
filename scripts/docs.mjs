// Generates docs/EXPERIMENTS.md and one page per experiment in docs/experiments/.
//
// Text comes from docs/content/lab-content.cjs (bilingual: the model, how it
// is implemented, what to look at, why it matters). OVERRIDES correct entries
// whose implementation changed, and REFERENCES lists primary sources.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { experiments } from '../src/experiments/index.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const CONTENT = require('../docs/content/lab-content.cjs');

const VALIDATED = new Set(['lorenz', 'pendulum', 'kepler', 'ising']);

const OVERRIDES = {
  lorenz: {
    how: {
      en: 'Classical fourth-order Runge-Kutta with dt = 0.005, fourteen steps per frame so the curve advances at a readable speed. The trail keeps the last 2,600 points and fades along its length. The projection is simply x on screen-x and z on screen-y: the famous butterfly is the shadow of a three-dimensional curve. The validation suite measures the largest Lyapunov exponent of this exact scheme against the published value.',
      es: 'Runge-Kutta clásico de cuarto orden con dt = 0,005, catorce pasos por frame para que la curva avance a una velocidad legible. La estela guarda los últimos 2.600 puntos y se desvanece a lo largo. La proyección es simplemente x en la x de pantalla y z en la y: la famosa mariposa es la sombra de una curva tridimensional. La suite de validación mide el mayor exponente de Lyapunov de este mismo esquema contra el valor publicado.'
    }
  },
  pendulum: {
    how: {
      en: 'The expanded equations are integrated with fourth-order Runge-Kutta, three steps of h = 0.05 per frame, with a damping factor of 0.9999 per step so the motion decays over minutes instead of running forever. With damping off, the validation suite measures the energy error of this scheme below 0.001 % over a minute. The tip leaves a 900-point trail that fades along its length.',
      es: 'Las ecuaciones expandidas se integran con Runge-Kutta de cuarto orden, tres pasos de h = 0,05 por frame, con un factor de amortiguación de 0,9999 por paso para que el movimiento decaiga en minutos en vez de correr para siempre. Sin amortiguación, la suite de validación mide el error de energía de este esquema bajo 0,001 % en un minuto. La punta deja una estela de 900 puntos que se desvanece a lo largo.'
    },
    watch: {
      en: 'The trail never repeats a shape. Grab the pendulum with the cursor and release it twice from what looks like the same spot: a sub-pixel difference in where you let go is enough, and within seconds the two runs have nothing in common.',
      es: 'La estela nunca repite una forma. Agarra el péndulo con el cursor y suéltalo dos veces desde lo que parece el mismo lugar: una diferencia de menos de un píxel en dónde lo sueltas basta, y en segundos las dos corridas no tienen nada en común.'
    }
  },
  kepler: {
    how: {
      en: 'The three laws are not coded. Only Newtonian gravity is, integrated with leapfrog (kick-drift-kick) at 64 sub-steps per frame, and the ellipses, the varying speed and the period ratios all fall out of it. Leapfrog conserves angular momentum exactly, which is why the swept wedges, drawn from the stored path at a fixed frame spacing, have equal areas to machine precision.',
      es: 'Las tres leyes no están programadas. Solo está la gravedad newtoniana, integrada con leapfrog (impulso-deriva-impulso) a 64 subpasos por frame, y las elipses, la velocidad variable y las razones de período salen todas de ahí. Leapfrog conserva exactamente el momento angular, y por eso las cuñas barridas, dibujadas desde el camino guardado con una separación fija de frames, tienen áreas iguales a precisión de máquina.'
    }
  },
  fluid: {
    tag: { en: 'Fluid dynamics', es: 'Dinámica de fluidos' },
    lede: {
      en: 'Stir it with the cursor. What moves is not a particle system or a noise field: it is a velocity field kept incompressible, solved on the GPU sixty times a second.',
      es: 'Revuélvelo con el cursor. Lo que se mueve no es un sistema de partículas ni un campo de ruido: es un campo de velocidad que se mantiene incompresible, resuelto en la GPU sesenta veces por segundo.'
    },
    math: [
      { eq: '∂u/∂t + (u·∇)u = −∇p + f',
        en: 'Momentum. The fluid carries its own velocity along (advection), pressure pushes back, and f is your cursor. There is no explicit viscosity term: a gentle decay stands in for it.',
        es: 'Momento. El fluido arrastra su propia velocidad (advección), la presión empuja de vuelta y f es tu cursor. No hay un término de viscosidad explícito: un decaimiento suave cumple ese papel.' },
      { eq: '∇·u = 0',
        en: 'Incompressibility. Whatever flows into a cell must flow out. Enforcing this is most of the work.',
        es: 'Incompresibilidad. Todo lo que entra a una celda tiene que salir. Imponerlo es la mayor parte del trabajo.' },
      { eq: '∇²p = ∇·u,   u ← u − ∇p',
        en: 'Projection (Chorin, 1968). Solve a Poisson equation for the pressure and subtract its gradient: what is left has no divergence. Here it is solved with Jacobi iterations, and the slider sets how many.',
        es: 'Proyección (Chorin, 1968). Se resuelve una ecuación de Poisson para la presión y se resta su gradiente: lo que queda no tiene divergencia. Acá se resuelve con iteraciones de Jacobi, y el deslizador fija cuántas.' },
      { eq: 'ω = ∇×u,   f_ω = ε (N × ω)',
        en: 'Vorticity confinement. Numerical diffusion kills small swirls; this term finds them (N points toward stronger vorticity) and spins them back up.',
        es: 'Confinamiento de vorticidad. La difusión numérica mata los remolinos chicos; este término los encuentra (N apunta hacia donde la vorticidad es mayor) y los vuelve a hacer girar.' }
    ],
    how: {
      en: 'Velocity, pressure, divergence, curl and dye each live in a half-float texture, and every stage of the solver is a full-screen fragment shader rendering into another texture. Advection is semi-Lagrangian: each texel looks backwards along the velocity and samples what was there, which is unconditionally stable (Stam, 1999). Velocity is simulated on a coarse grid (128 cells on the short side) and dye on a fine one (640), then shaded with a normal taken from its own gradient. On a dark theme the dye is added as light; on a light theme the same density is read as a pigment tint. The solver structure is adapted from Pavel Dobryakov\'s WebGL-Fluid-Simulation (MIT).',
      es: 'Velocidad, presión, divergencia, rotor y tinta viven cada una en una textura de medio flotante, y cada etapa del solucionador es un fragment shader de pantalla completa que escribe en otra textura. La advección es semi-lagrangiana: cada texel mira hacia atrás a lo largo de la velocidad y muestrea lo que había ahí, lo que es incondicionalmente estable (Stam, 1999). La velocidad se simula en una malla gruesa (128 celdas en el lado corto) y la tinta en una fina (640), sombreada con una normal tomada de su propio gradiente. En tema oscuro la tinta se suma como luz; en tema claro la misma densidad se lee como pigmento. La estructura del solucionador está adaptada de WebGL-Fluid-Simulation de Pavel Dobryakov (MIT).'
    },
    watch: {
      en: 'Drag slowly, then fast: slow strokes leave smooth tongues, fast ones roll up into pairs of counter-rotating vortices. Set vorticity confinement to zero and the small curls die out. Drop the pressure iterations to two and the field is no longer fully divergence-free: the dye starts to bunch up and thin out instead of simply flowing.',
      es: 'Arrastra lento y después rápido: los trazos lentos dejan lenguas suaves, los rápidos se enrollan en pares de vórtices que giran en sentidos opuestos. Pon el confinamiento de vorticidad en cero y los rizos chicos se apagan. Baja las iteraciones de presión a dos y el campo deja de estar libre de divergencia: la tinta se amontona y se adelgaza en vez de simplemente fluir.'
    },
    why: {
      en: 'This method is what made real-time fluids practical in games and visual effects, and it is still how they are taught: unconditionally stable and small enough to fit in a handful of shaders. It is also a reminder of the distance between a solver and the equations: this one is two-dimensional, inviscid and numerically diffusive, and it says nothing about the three-dimensional regularity question that makes Navier-Stokes a Millennium Prize problem.',
      es: 'Este método es lo que hizo prácticos los fluidos en tiempo real en videojuegos y efectos visuales, y sigue siendo como se enseñan: incondicionalmente estable y lo bastante chico para caber en un puñado de shaders. También recuerda la distancia entre un solucionador y las ecuaciones: este es bidimensional, sin viscosidad y numéricamente difusivo, y no dice nada sobre la pregunta de regularidad en tres dimensiones que hace de Navier-Stokes un problema del milenio.'
    }
  }
};

const REFERENCES = {
  interference: ['T. Young, "The Bakerian Lecture: Experiments and calculations relative to physical optics", Phil. Trans. R. Soc. Lond. 94 (1804) 1–16.'],
  galaxia: ['C. C. Lin, F. H. Shu, "On the spiral structure of disk galaxies", Astrophys. J. 140 (1964) 646–655.'],
  lorenz: ['E. N. Lorenz, "Deterministic nonperiodic flow", J. Atmos. Sci. 20 (1963) 130–141.',
    'G. Benettin, L. Galgani, A. Giorgilli, J.-M. Strelcyn, "Lyapunov characteristic exponents for smooth dynamical systems and for Hamiltonian systems", Meccanica 15 (1980) 9–20.',
    'J. C. Sprott, Chaos and Time-Series Analysis, Oxford University Press (2003).'],
  pendulum: ['T. Shinbrot, C. Grebogi, J. Wisdom, J. A. Yorke, "Chaos in a double pendulum", Am. J. Phys. 60 (1992) 491–499.'],
  rule30: ['S. Wolfram, "Statistical mechanics of cellular automata", Rev. Mod. Phys. 55 (1983) 601–644.'],
  phyllotaxis: ['H. Vogel, "A better way to construct the sunflower head", Math. Biosci. 44 (1979) 179–189.'],
  brownian: ['A. Einstein, "Über die von der molekularkinetischen Theorie der Wärme geforderte Bewegung von in ruhenden Flüssigkeiten suspendierten Teilchen", Ann. Phys. 17 (1905) 549–560.',
    'J. Perrin, "Mouvement brownien et réalité moléculaire", Ann. Chim. Phys. 18 (1909) 5–114.'],
  fourier: ['J. Fourier, Théorie analytique de la chaleur, Firmin Didot (1822).'],
  relativity: ['A. Einstein, "Zur Elektrodynamik bewegter Körper", Ann. Phys. 17 (1905) 891–921.'],
  spacetime: ['A. Einstein, "Die Feldgleichungen der Gravitation", Sitzungsber. Preuss. Akad. Wiss. (1915) 844–847.',
    'F. W. Dyson, A. S. Eddington, C. Davidson, "A determination of the deflection of light by the Sun\'s gravitational field", Phil. Trans. R. Soc. A 220 (1920) 291–333.'],
  curvature: ['A. Einstein, "Die Feldgleichungen der Gravitation", Sitzungsber. Preuss. Akad. Wiss. (1915) 844–847.'],
  wormhole: ['M. S. Morris, K. S. Thorne, "Wormholes in spacetime and their use for interstellar travel", Am. J. Phys. 56 (1988) 395–412.'],
  shortcut: ['M. S. Morris, K. S. Thorne, "Wormholes in spacetime and their use for interstellar travel", Am. J. Phys. 56 (1988) 395–412.',
    'O. James, E. von Tunzelmann, P. Franklin, K. S. Thorne, "Visualizing Interstellar\'s wormhole", Am. J. Phys. 83 (2015) 486–499.'],
  handle: ['M. S. Morris, K. S. Thorne, "Wormholes in spacetime and their use for interstellar travel", Am. J. Phys. 56 (1988) 395–412.'],
  hawking: ['S. W. Hawking, "Particle creation by black holes", Commun. Math. Phys. 43 (1975) 199–220.'],
  quasar: ['M. Schmidt, "3C 273: A star-like object with large red-shift", Nature 197 (1963) 1040.'],
  entanglement: ['J. S. Bell, "On the Einstein Podolsky Rosen paradox", Physics 1 (1964) 195–200.'],
  doubleslit: ['A. Tonomura, J. Endo, T. Matsuda, T. Kawasaki, H. Ezawa, "Demonstration of single-electron buildup of an interference pattern", Am. J. Phys. 57 (1989) 117–120.'],
  duality: ['P. Grangier, G. Roger, A. Aspect, "Experimental evidence for a photon anticorrelation effect on a beam splitter: a new light on single-photon interferences", Europhys. Lett. 1 (1986) 173–179.'],
  quantum: ['E. Schrödinger, "Quantisierung als Eigenwertproblem", Ann. Phys. 79 (1926) 361–376.'],
  entropy: ['L. Boltzmann, "Über die Beziehung zwischen dem zweiten Hauptsatze der mechanischen Wärmetheorie und der Wahrscheinlichkeitsrechnung", Wiener Berichte 76 (1877) 373–435.',
    'C. E. Shannon, "A mathematical theory of communication", Bell Syst. Tech. J. 27 (1948) 379–423.'],
  ising: ['E. Ising, "Beitrag zur Theorie des Ferromagnetismus", Z. Phys. 31 (1925) 253–258.',
    'L. Onsager, "Crystal statistics. I. A two-dimensional model with an order-disorder transition", Phys. Rev. 65 (1944) 117–149.',
    'C. N. Yang, "The spontaneous magnetization of a two-dimensional Ising model", Phys. Rev. 85 (1952) 808–816.',
    'N. Metropolis, A. W. Rosenbluth, M. N. Rosenbluth, A. H. Teller, E. Teller, "Equation of state calculations by fast computing machines", J. Chem. Phys. 21 (1953) 1087–1092.'],
  grayscott: ['P. Gray, S. K. Scott, "Autocatalytic reactions in the isothermal, continuous stirred tank reactor", Chem. Eng. Sci. 38 (1983) 29–43.',
    'J. E. Pearson, "Complex patterns in a simple system", Science 261 (1993) 189–192.'],
  boids: ['C. W. Reynolds, "Flocks, herds and schools: A distributed behavioral model", Computer Graphics (SIGGRAPH \'87) 21(4) (1987) 25–34.'],
  attention: ['A. Vaswani et al., "Attention is all you need", Advances in Neural Information Processing Systems 30 (2017). arXiv:1706.03762.'],
  optimizers: ['B. T. Polyak, "Some methods of speeding up the convergence of iteration methods", USSR Comput. Math. Math. Phys. 4(5) (1964) 1–17.',
    'D. P. Kingma, J. Ba, "Adam: A method for stochastic optimization", ICLR (2015). arXiv:1412.6980.'],
  embedding: ['J. B. Kruskal, "Multidimensional scaling by optimizing goodness of fit to a nonmetric hypothesis", Psychometrika 29 (1964) 1–27.'],
  neural: ['D. E. Rumelhart, G. E. Hinton, R. J. Williams, "Learning representations by back-propagating errors", Nature 323 (1986) 533–536.'],
  radiation: ['J. Larmor, "On a dynamical theory of the electric and luminiferous medium, Part III", Phil. Trans. R. Soc. A 190 (1897) 205–300.'],
  refraction: ['M. Born, E. Wolf, Principles of Optics, 7th ed., Cambridge University Press (1999).'],
  chladni: ['E. F. F. Chladni, Entdeckungen über die Theorie des Klanges, Weidmanns Erben und Reich (1787).'],
  ulam: ['M. L. Stein, S. M. Ulam, M. B. Wells, "A visual display of some properties of the distribution of primes", Am. Math. Monthly 71 (1964) 516–520.'],
  collatz: ['J. C. Lagarias, "The 3x+1 problem and its generalizations", Am. Math. Monthly 92 (1985) 3–23.'],
  voronoi: ['G. Voronoi, "Nouvelles applications des paramètres continus à la théorie des formes quadratiques", J. Reine Angew. Math. 133 (1908) 97–178.'],
  oscillators: ['A. P. French, Vibrations and Waves, W. W. Norton (1971).'],
  kepler: ['J. Kepler, Astronomia Nova (1609).',
    'E. Hairer, C. Lubich, G. Wanner, Geometric Numerical Integration, 2nd ed., Springer (2006).'],
  mandelbrot: ['B. B. Mandelbrot, "Fractal aspects of the iteration of z → λz(1−z) for complex λ and z", Ann. N.Y. Acad. Sci. 357 (1980) 249–259.'],
  julia: ['G. Julia, "Mémoire sur l\'itération des fonctions rationnelles", J. Math. Pures Appl. 8 (1918) 47–245.'],
  fluid: ['A. J. Chorin, "Numerical solution of the Navier-Stokes equations", Math. Comp. 22 (1968) 745–762.',
    'J. Stam, "Stable fluids", Proceedings of SIGGRAPH 99 (1999) 121–128.',
    'R. Fedkiw, J. Stam, H. W. Jensen, "Visual simulation of smoke", Proceedings of SIGGRAPH 2001 (2001) 15–22.',
    'M. J. Harris, "Fast fluid dynamics simulation on the GPU", in GPU Gems, ch. 38, Addison-Wesley (2004).',
    'P. Dobryakov, WebGL-Fluid-Simulation (2017), https://github.com/PavelDoGreat/WebGL-Fluid-Simulation — MIT License.']
};

const esc = s => String(s).replace(/\|/g, '\\|');
const outDir = path.join(root, 'docs/experiments');
fs.mkdirSync(outDir, { recursive: true });

const sorted = [...experiments].sort((a, b) => a.name.en.localeCompare(b.name.en));
const missing = [];

for (const def of sorted) {
  const c = { ...(CONTENT[def.id] || {}), ...(OVERRIDES[def.id] || {}) };
  if (!c.lede) missing.push(def.id);
  const refs = REFERENCES[def.id] || [];
  const params = def.params || [];
  const lines = [
    `# ${def.name.en}`,
    '',
    `${c.tag ? `*${c.tag.en}*` : ''} · \`${def.id}\` · [source](../../src/experiments/${def.id}.js)` +
      (VALIDATED.has(def.id) ? ' · [numerically validated](../../validation/RESULTS.md)' : '') +
      (def.kind === 'webgl' ? ' · WebGL' : ''),
    '',
    `> ${c.lede ? c.lede.en : def.note.en}`,
    '',
    '```js',
    `import { mount } from 'bn-lab-simulations';`,
    `import ${def.id.replace(/\W/g, '')} from 'bn-lab-simulations/experiments/${def.id}';`,
    '',
    `mount(document.querySelector('canvas'), ${def.id.replace(/\W/g, '')}, { controls: document.querySelector('#controls') });`,
    '```',
    ''
  ];
  if (params.length) {
    lines.push('## Parameters', '', '| key | label | range | default |', '|---|---|---|---|');
    for (const p of params) lines.push(`| \`${p.key}\` | ${esc(p.label.en)} | ${p.min} – ${p.max}${p.unit ? ' ' + p.unit : ''} | ${+p.def.toFixed(4)} |`);
    lines.push('');
  }
  if (c.math) {
    lines.push('## The model', '');
    for (const m of c.math) lines.push(`**\`${m.eq}\`**`, '', m.en, '');
  }
  if (c.how) lines.push('## How it is implemented', '', c.how.en, '');
  if (c.watch) lines.push('## What to look at', '', c.watch.en, '');
  if (c.why) lines.push('## Why it matters', '', c.why.en, '');
  if (refs.length) lines.push('## References', '', ...refs.map(r => `- ${r}`), '');
  if (c.lede) {
    lines.push('---', '', `## En español: ${def.name.es}`, '', `> ${c.lede.es}`, '');
    if (c.math) { lines.push('### El modelo', ''); for (const m of c.math) lines.push(`**\`${m.eq}\`**`, '', m.es, ''); }
    if (c.how) lines.push('### Cómo está implementado', '', c.how.es, '');
    if (c.watch) lines.push('### Qué mirar', '', c.watch.es, '');
    if (c.why) lines.push('### Por qué importa', '', c.why.es, '');
  }
  fs.writeFileSync(path.join(outDir, def.id + '.md'), lines.join('\n'));
}

const byTopic = new Map();
for (const def of sorted) {
  const c = { ...(CONTENT[def.id] || {}), ...(OVERRIDES[def.id] || {}) };
  const topic = c.tag ? c.tag.en : 'Other';
  if (!byTopic.has(topic)) byTopic.set(topic, []);
  byTopic.get(topic).push(def);
}
const index = [
  '# Experiments',
  '',
  `${experiments.length} experiments. Each page covers the model, how it is implemented, what to look at, why it matters, and primary references, in English and Spanish. ✓ marks experiments whose on-screen scheme is checked by the [validation suite](../validation/RESULTS.md).`,
  ''
];
for (const topic of [...byTopic.keys()].sort()) {
  index.push(`## ${topic}`, '', '| id | experiment | what it shows |', '|---|---|---|');
  for (const def of byTopic.get(topic)) {
    index.push(`| \`${def.id}\` | [${esc(def.name.en)}](experiments/${def.id}.md)${VALIDATED.has(def.id) ? ' ✓' : ''}${def.kind === 'webgl' ? ' (WebGL)' : ''} | ${esc(def.note.en)} |`);
  }
  index.push('');
}
fs.writeFileSync(path.join(root, 'docs/EXPERIMENTS.md'), index.join('\n'));
console.log(`${sorted.length} pages · ${byTopic.size} topics` + (missing.length ? ` · without long-form text: ${missing.join(', ')}` : ''));
