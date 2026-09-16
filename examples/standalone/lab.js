/* ═══ LAB — experimentos ═══════════════════════════════════════════════════
   API de cada experimento:
     params: [{key,label:{en,es},min,max,step,def}]   controles expuestos
     make(w,h) → { step(ctx,w,h,t,acc,P,M), resize?, fade?, persist?, reset? }
   P son los parámetros vivos; M el mouse {x,y,in} en px del canvas.
   El motor se encarga de DPR, resize, tema, controles y de no renderizar lo que
   no está en pantalla. Sin librerías: canvas 2D y matemáticas.
   Lo usan la tira del home, /lab y las páginas de detalle.
═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const L = (en, es) => ({ en, es });

  const EXPERIMENTS = [

    /* Acompaña a /lab/dataset-branding. La miniatura es la esfera de vistas:
       las direcciones de cámara repartidas por la espiral de Fibonacci, que es
       de donde salen las fotos del dataset. Se ve que no se amontonan en los
       polos y que no se alinean en radios — que es todo el punto del método. */
    { id: 'dataset-branding',
      name: L('Branding dataset', 'Dataset de branding'),
      note: L('The attractor wrapped in a tube and photographed from all over the sphere: views, masks and poses.',
              'El atractor envuelto en un tubo y fotografiado desde toda la esfera: vistas, máscaras y poses.'),
      params: [
        { key: 'n',    label: L('Views', 'Vistas'), min: 24, max: 400, step: 8, def: 160 },
        { key: 'giro', label: L('Spin', 'Giro'),    min: 0,  max: 1,   step: 0.05, def: 0.4 }
      ],
      make() {
        let ang = 0;
        return {
          step(ctx, w, h, t, acc, P, M) {
            const n = Math.round(P.n);
            ang = M && M.in ? (M.x / w - 0.5) * 6 : ang + P.giro * 0.005;
            const ca = Math.cos(ang), sa = Math.sin(ang);
            const R = Math.min(w, h) * 0.36, cx = w / 2, cy = h / 2;
            ctx.clearRect(0, 0, w, h);

            // El meridiano de referencia, para que se lea que es una esfera.
            ctx.strokeStyle = 'rgba(' + acc + ',0.13)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(cx, cy, R, R, 0, 0, Math.PI * 2); ctx.stroke();

            // Espiral de Fibonacci: uniforme en cos(theta), ángulo áureo entre
            // muestras. Misma fórmula que usa el generador del dataset.
            const aureo = Math.PI * (1 + Math.sqrt(5));
            for (let k = 0; k < n; k++) {
              const i = k + 0.5;
              const z = 1 - 2 * i / n;
              const r = Math.sqrt(Math.max(0, 1 - z * z));
              const phi = aureo * i;
              const x = r * Math.cos(phi), y = r * Math.sin(phi);
              // Giro sobre el eje vertical y proyección ortográfica.
              const xr = x * ca + z * sa, zr = z * ca - x * sa;
              const sx = cx + xr * R, sy = cy - y * R;
              // Las de atrás se apagan: da la profundidad sin pintar nada más.
              const frente = (zr + 1) / 2;
              ctx.fillStyle = 'rgba(' + acc + ',' + (0.12 + frente * 0.75).toFixed(3) + ')';
              ctx.beginPath(); ctx.arc(sx, sy, 0.7 + frente * 1.5, 0, Math.PI * 2); ctx.fill();
            }
          }
        };
      }
    },

    /* Acompaña a /lab/abecedario-atractores, donde se buscan las veintiséis
       letras dentro de proyecciones de atractores caóticos. La miniatura no
       resume el buscador —no cabe— sino su premisa: el mismo objeto girando,
       y una orientación en la que se lee. Se integra un Thomas, que es el que
       tiene la estrella, y se lo hace rotar en torno al eje vertical. */
    { id: 'abecedario-atractores',
      name: L('Alphabet of attractors', 'Abecedario de atractores'),
      note: L('Twenty-six letters searched for inside chaotic attractors: which ones are there, which are not, and why.',
              'Veintiséis letras buscadas dentro de atractores caóticos: cuáles están, cuáles no, y por qué.'),
      params: [
        { key: 'b',   label: L('Damping', 'Amortiguación'), min: 0.10, max: 0.28, step: 0.005, def: 0.19 },
        { key: 'giro', label: L('Spin', 'Giro'),            min: 0,    max: 1,    step: 0.05,  def: 0.35 }
      ],
      persist: true,
      make() {
        // La nube se guarda entera y se reproyecta cada cuadro: girar no
        // vuelve a integrar. Es la misma mecánica de las firmas del home.
        let p = [0.12, 0.16, -0.09], buf = [], ang = 0, ultimoB = -1;
        const MAX = 9000;
        return {
          step(ctx, w, h, t, acc, P, M) {
            if (P.b !== ultimoB) { buf = []; p = [0.12, 0.16, -0.09]; ultimoB = P.b; }
            for (let k = 0; k < 26; k++) {
              const dx = Math.sin(p[1]) - P.b * p[0];
              const dy = Math.sin(p[2]) - P.b * p[1];
              const dz = Math.sin(p[0]) - P.b * p[2];
              p[0] += dx * 0.08; p[1] += dy * 0.08; p[2] += dz * 0.08;
              buf.push(p[0], p[1], p[2]);
            }
            if (buf.length > MAX * 3) buf.splice(0, buf.length - MAX * 3);

            // El puntero manda el ángulo; sin puntero, deriva sola.
            ang = M && M.in ? (M.x / w - 0.5) * 6 : ang + P.giro * 0.006;

            const ca = Math.cos(ang), sa = Math.sin(ang);
            let mn = 1e9, mx = -1e9;
            for (let i = 0; i < buf.length; i += 3) {
              const v = buf[i + 1];
              if (v < mn) mn = v; if (v > mx) mx = v;
            }
            const esc = Math.min(w, h) * 0.36 / Math.max(1e-6, (mx - mn) / 2);

            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(' + acc + ',0.1)';
            ctx.lineWidth = 0.7;
            const N = buf.length / 3, CH = 10, salto = Math.ceil(N / CH);
            for (let c = 0; c < CH; c++) {
              const a0 = c * salto, a1 = Math.min(N, a0 + salto + 1);
              if (a0 >= a1) break;
              ctx.beginPath();
              for (let j = a0; j < a1; j++) {
                const i = j * 3;
                const x = buf[i] * ca + buf[i + 2] * sa;
                const sx = w / 2 + x * esc, sy = h / 2 - buf[i + 1] * esc;
                j > a0 ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
              }
              ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
          }
        };
      }
    },

    /* Entrada didáctica: acompaña a /lab/ondas-guia, donde una guía escolar de
       ondas queda resuelta paso a paso. La miniatura muestra las tres variables
       que la guía relaciona —amplitud, longitud de onda y frecuencia— sobre una
       misma onda viajera. */
    { id: 'ondas-guia',
      name: L('Waves, solved', 'Ondas: guía resuelta'),
      note: L('Amplitude, wavelength, period, frequency and speed — a school worksheet solved step by step.',
              'Amplitud, longitud de onda, periodo, frecuencia y velocidad: una guía escolar resuelta paso a paso.'),
      params: [
        { key: 'A',   label: L('Amplitude', 'Amplitud'),        min: 0.1, max: 1,  step: 0.05, def: 0.6 },
        { key: 'lam', label: L('Wavelength', 'Longitud de onda'), min: 0.5, max: 4, step: 0.1, def: 1.6 },
        { key: 'f',   label: L('Frequency', 'Frecuencia'),       min: 0,   max: 3,  step: 0.1, def: 0.8, unit: ' Hz' }
      ],
      make() {
        return {
          step(ctx, w, h, t, acc, P, M) {
            ctx.clearRect(0, 0, w, h);
            const midY = h / 2, amp = h * 0.30 * P.A, escX = w / 5;
            // acc llega como terna cruda ("232,234,238"), no como color: hay que
            // envolverla. Asignándola directo, strokeStyle queda inválido y el
            // trazo sale negro sobre negro — dibuja, pero no se ve.
            const C = a => 'rgba(' + acc + ',' + a + ')';

            // Eje de equilibrio y las dos líneas de amplitud, como en la guía.
            ctx.strokeStyle = C(0.30); ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
            ctx.strokeStyle = C(0.14); ctx.setLineDash([3, 5]);
            [1, -1].forEach(sg => {
              ctx.beginPath(); ctx.moveTo(0, midY - sg * amp); ctx.lineTo(w, midY - sg * amp); ctx.stroke();
            });
            ctx.setLineDash([]);

            // La onda viajera: y = A·sen(2π(x/λ − f·t)).
            ctx.strokeStyle = C(1); ctx.lineWidth = 1.8;
            ctx.beginPath();
            for (let px = 0; px <= w; px++) {
              const x = px / escX;
              const y = midY - amp * Math.sin(TAU * (x / P.lam - P.f * t));
              px ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
            }
            ctx.stroke();

            // Una longitud de onda medida sobre el eje: es lo que la guía llama λ.
            const x1 = P.lam * escX;
            if (x1 < w * 0.92) {
              const yb = midY + h * 0.36;
              ctx.strokeStyle = C(0.55);
              ctx.beginPath(); ctx.moveTo(0, yb); ctx.lineTo(x1, yb); ctx.stroke();
              [0, x1].forEach(x => {
                ctx.beginPath(); ctx.moveTo(x, yb - h * 0.03); ctx.lineTo(x, yb + h * 0.03); ctx.stroke();
              });
            }
          }
        };
      }
    },

    /* Entrada didáctica: acompaña a /lab/quimica-guia, donde una guía escolar
       de reacciones químicas cotidianas queda resuelta. La miniatura muestra lo
       que la guía usa como hilo conductor: el oxígeno disponible decide si la
       combustión llega a CO2 —llama azul— o se queda a medias en CO y hollín,
       que es la llama amarilla de siempre. */
    { id: 'quimica-guia',
      name: L('Chemistry, solved', 'Química: guía resuelta'),
      note: L('Combustion, redox, ozone and acid rain — a school worksheet solved step by step.',
              'Combustión, óxido-reducción, ozono y lluvia ácida: una guía escolar resuelta paso a paso.'),
      params: [
        { key: 'o2',    label: L('Oxygen', 'Oxígeno'),   min: 30, max: 140, step: 1,   def: 100, unit: ' %' },
        { key: 'alto',  label: L('Flame', 'Llama'),      min: 0.4, max: 1.2, step: 0.05, def: 0.85 },
        { key: 'humo',  label: L('Smoke', 'Humo'),       min: 0,  max: 1,   step: 0.05, def: 0.6 }
      ],
      make() {
        const humo = [];
        return {
          step(ctx, w, h, t, acc, P, M) {
            ctx.clearRect(0, 0, w, h);
            const C = a => 'rgba(' + acc + ',' + a + ')';
            const cx = w * 0.5, baseY = h * 0.84;
            // Fracción que alcanza a oxidarse por completo. Bajo 100% de
            // oxígeno la reacción se queda corta y aparece el hollín.
            const limpio = Math.min(1, Math.pow(P.o2 / 100, 2));

            ctx.strokeStyle = C(0.28); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();

            // La llama: ancha abajo, afilada arriba, con el borde temblando.
            const alto = h * 0.52 * P.alto * (0.7 + 0.3 * Math.min(1, P.o2 / 120));
            const ancho = w * 0.16;
            const AZ = [100, 170, 255], AM = [250, 170, 60];
            for (let capa = 0; capa < 3; capa++) {
              const k = 1 - capa * 0.28, al = alto * k, an = ancho * k;
              const col = AZ.map((v, i) => Math.round(v * limpio + AM[i] * (1 - limpio)));
              ctx.beginPath();
              for (let i = 0; i <= 26; i++) {
                const f = i / 26, perfil = Math.sin(Math.pow(f, 0.62) * Math.PI);
                const tmb = Math.sin(t * 9 + f * 7 + capa) * an * 0.10 * f;
                i ? ctx.lineTo(cx + tmb + perfil * an * 0.5, baseY - f * al)
                  : ctx.moveTo(cx + tmb + perfil * an * 0.5, baseY - f * al);
              }
              for (let i = 26; i >= 0; i--) {
                const f = i / 26, perfil = Math.sin(Math.pow(f, 0.62) * Math.PI);
                const tmb = Math.sin(t * 9 + f * 7 + capa) * an * 0.10 * f;
                ctx.lineTo(cx + tmb - perfil * an * 0.5, baseY - f * al);
              }
              ctx.closePath();
              ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (0.22 + capa * 0.20) + ')';
              ctx.fill();
            }

            // Productos subiendo: claros si es CO2, oscuros si es hollín.
            if (humo.length < 40 * P.humo && Math.random() < 0.4 * P.humo) {
              humo.push({ x: cx + (Math.random() - 0.5) * ancho * 0.7, y: baseY - alto * 0.9,
                          v: 0.4 + Math.random() * 0.8, d: (Math.random() - 0.5) * 0.3,
                          suc: Math.random() > limpio, vida: 1 });
            }
            for (let i = humo.length - 1; i >= 0; i--) {
              const p = humo[i];
              p.y -= p.v; p.x += p.d; p.vida -= 0.008;
              if (p.vida <= 0 || p.y < 0) { humo.splice(i, 1); continue; }
              ctx.globalAlpha = p.vida * 0.8;
              ctx.fillStyle = p.suc ? 'rgba(120,120,120,1)' : C(1);
              ctx.beginPath(); ctx.arc(p.x, p.y, p.suc ? 2.2 : 2.8, 0, TAU); ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
        };
      }
    },

    /* Entrada didáctica: acompaña a /lab/ecosistemas-guia, donde una guía
       escolar de materia y energía en los ecosistemas queda resuelta. La
       miniatura muestra las dos cosas que la guía distingue: la energía sube
       por los niveles y se escapa como calor —nunca vuelve— mientras la
       materia baja hasta los descomponedores y vuelve a subir, en círculo. */
    { id: 'ecosistemas-guia',
      name: L('Ecosystems, solved', 'Ecosistemas: guía resuelta'),
      note: L('Energy flow, matter cycle, food chains and webs — a school worksheet solved step by step.',
              'Flujo de energía, ciclo de la materia, cadenas y redes tróficas: una guía escolar resuelta paso a paso.'),
      params: [
        { key: 'sol',  label: L('Sunlight', 'Luz del Sol'),   min: 20, max: 160, step: 1,   def: 100, unit: ' %' },
        { key: 'ef',   label: L('Transfer', 'Transferencia'), min: 5,  max: 30,  step: 1,   def: 10,  unit: ' %' },
        { key: 'ciclo',label: L('Matter', 'Materia'),         min: 0,  max: 1,   step: 0.05, def: 0.7 }
      ],
      make() {
        const ener = [], mate = [];
        return {
          step(ctx, w, h, t, acc, P, M) {
            ctx.clearRect(0, 0, w, h);
            const C = a => 'rgba(' + acc + ',' + a + ')';
            const SOL = '#e8b23d', CALOR = '#e0533f', MAT = '#5ec98a';
            const izq = w * 0.30, der = w * 0.78, alt = (h * 0.60) / 4, base = h * 0.78;
            const yN = i => base - i * alt;
            // El ancho cae con la energía que queda: eso ES la pirámide.
            const anN = i => (der - izq) * Math.max(0.08, Math.pow(Math.pow(P.ef / 100, i), 0.34));

            // Los cuatro niveles
            for (let i = 0; i < 4; i++) {
              const y = yN(i), an = anN(i);
              ctx.fillStyle = C(0.10); ctx.fillRect(izq, y - alt * 0.55, an, alt * 0.5);
              ctx.strokeStyle = C(0.30); ctx.lineWidth = 1;
              ctx.strokeRect(izq, y - alt * 0.55, an, alt * 0.5);
            }
            // Los descomponedores cierran el ciclo
            const yD = base + alt * 0.40;
            ctx.fillStyle = 'rgba(94,201,138,.12)'; ctx.fillRect(izq, yD, der - izq, alt * 0.36);
            ctx.strokeStyle = 'rgba(94,201,138,.4)'; ctx.strokeRect(izq, yD, der - izq, alt * 0.36);

            // ENERGÍA: sube por los niveles y se escapa como calor
            if (ener.length < 60 && Math.random() < P.sol / 260) ener.push({ niv: 0, p: 0 });
            for (let i = ener.length - 1; i >= 0; i--) {
              const e = ener[i];
              if (e.calor) {
                e.x += 2.2; e.a -= 0.022;
                if (e.a <= 0) { ener.splice(i, 1); continue; }
                ctx.globalAlpha = e.a * 0.85; ctx.fillStyle = CALOR;
                ctx.beginPath(); ctx.arc(e.x, e.y, 2.2, 0, TAU); ctx.fill();
                ctx.globalAlpha = 1; continue;
              }
              e.p += 0.014;
              const y = yN(e.niv) - alt * 0.3 - alt * e.p;
              const x = izq + anN(e.niv) * 0.5;
              ctx.fillStyle = SOL;
              ctx.beginPath(); ctx.arc(x, y, 2.8, 0, TAU); ctx.fill();
              if (e.p >= 1) {
                if (e.niv >= 3 || Math.random() > P.ef / 100 * 3) { e.calor = 1; e.x = x; e.y = y; e.a = 1; }
                else { e.niv++; e.p = 0; }
              }
            }

            // MATERIA: baja por la derecha y vuelve por la izquierda
            if (P.ciclo > 0 && mate.length < 26 && Math.random() < 0.13 * P.ciclo)
              mate.push({ f: 0, p: 0, niv: (Math.random() * 4) | 0 });
            for (let i = mate.length - 1; i >= 0; i--) {
              const m = mate[i];
              ctx.fillStyle = MAT; ctx.globalAlpha = 0.9;
              if (m.f === 0) {
                m.p += 0.017;
                const y0 = yN(m.niv) - alt * 0.3, y1 = yD + alt * 0.36 + 9;
                ctx.beginPath(); ctx.arc(der + 12, y0 + (y1 - y0) * m.p, 2.5, 0, TAU); ctx.fill();
                if (m.p >= 1) { m.f = 1; m.p = 0; }
              } else if (m.f === 1) {
                m.p += 0.013;
                const y = yD + alt * 0.36 + 9;
                ctx.beginPath(); ctx.arc(der + 12 + (izq - 16 - der - 12) * m.p, y, 2.5, 0, TAU); ctx.fill();
                if (m.p >= 1) { m.f = 2; m.p = 0; }
              } else {
                m.p += 0.013;
                const y0 = yD + alt * 0.36 + 9, y1 = yN(0) - alt * 0.3;
                ctx.beginPath(); ctx.arc(izq - 16, y0 + (y1 - y0) * m.p, 2.5, 0, TAU); ctx.fill();
                if (m.p >= 1) mate.splice(i, 1);
              }
              ctx.globalAlpha = 1;
            }
          }
        };
      }
    },

    { id: 'interference',
      name: L('Interference', 'Interferencia'),
      note: L('Two point sources. |ψ|² where their waves overlap.',
              'Dos fuentes puntuales. |ψ|² donde sus ondas se cruzan.'),
      params: [
        { key: 'lambda',  label: L('Wavelength λ', 'Longitud de onda λ'), min: 12, max: 70, step: 1, def: 34, unit: 'px' },
        { key: 'sources', label: L('Sources', 'Fuentes'),                 min: 2,  max: 5,  step: 1, def: 2 },
        { key: 'speed',   label: L('Speed', 'Velocidad'),                 min: 0,  max: 4,  step: 0.1, def: 2.2 }
      ],
      make() {
        return {
          step(ctx, w, h, t, acc, P, M) {
            const STEP = 6, k = TAU / P.lambda;
            const src = [];
            if (M.in) src.push([M.x, M.y, 1]);
            else src.push([w * (0.5 + 0.22 * Math.cos(t * 0.25)), h * 0.36, 1]);
            for (let i = 1; i < P.sources; i++) {
              const a = (i / (P.sources - 1)) * Math.PI + 0.6;
              src.push([w * (0.5 + 0.3 * Math.cos(a)), h * (0.55 + 0.22 * Math.sin(a)), 0.92]);
            }
            for (let x = STEP / 2; x < w; x += STEP) {
              for (let y = STEP / 2; y < h; y += STEP) {
                let psi = 0;
                for (const s of src) {
                  const r = Math.hypot(x - s[0], y - s[1]) + 8;
                  psi += s[2] * (22 / Math.sqrt(r)) * Math.cos(k * r - t * P.speed);
                }
                const I = Math.min(1, psi * psi / 9);
                if (I < 0.04) continue;
                ctx.fillStyle = `rgba(${acc},${(0.09 + I * 0.72).toFixed(3)})`;
                ctx.beginPath(); ctx.arc(x, y, 0.5 + I * 2.2, 0, TAU); ctx.fill();
              }
            }
            ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1;
            for (const s of src) { ctx.beginPath(); ctx.arc(s[0], s[1], 3.5, 0, TAU); ctx.stroke(); }
          }
        };
      }
    },

    { id: 'lorenz',
      name: L('Lorenz attractor', 'Atractor de Lorenz'),
      note: L('Deterministic and unpredictable. Never repeats, never escapes.',
              'Determinista e impredecible. Nunca se repite, nunca se escapa.'),
      params: [
        { key: 'rho',   label: L('Rayleigh ρ', 'Rayleigh ρ'),   min: 1,  max: 60, step: 0.5, def: 28 },
        { key: 'sigma', label: L('Prandtl σ', 'Prandtl σ'),     min: 1,  max: 20, step: 0.5, def: 10 },
        { key: 'beta',  label: L('Geometry β', 'Geometría β'),  min: 0.5, max: 5, step: 0.05, def: 8 / 3 }
      ],
      make() {
        let x = 0.01, y = 0, z = 0, trail = [];
        return {
          reset() { x = 0.01; y = 0; z = 0; trail = []; },
          step(ctx, w, h, t, acc, P, M) {
            const dt = 0.005;
            for (let i = 0; i < 14; i++) {
              const f = (a, b, c) => [P.sigma * (b - a), a * (P.rho - c) - b, a * b - P.beta * c], hh = dt / 2;
              // RK4. Con Euler explícito el exponente de Lyapunov salía 5,8 % alto
              // (lo midió la suite de validación de BN Lab Simulations); con RK4, 0,18 %.
              const k1 = f(x, y, z), k2 = f(x + hh * k1[0], y + hh * k1[1], z + hh * k1[2]);
              const k3 = f(x + hh * k2[0], y + hh * k2[1], z + hh * k2[2]);
              const k4 = f(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2]);
              x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
              y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
              z += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
              trail.push([x, y, z]);
            }
            if (trail.length > 2600) trail.splice(0, trail.length - 2600);
            // El mouse gira la proyección alrededor del eje vertical
            const ang = M.in ? (M.x / w - 0.5) * 2.4 : 0;
            const ca = Math.cos(ang), sa = Math.sin(ang);
            const sc = Math.min(w, h) / 62, cx = w / 2, cy = h / 2 + h * 0.22;
            const px = p => cx + (p[0] * ca - p[1] * sa) * sc;
            const py = p => cy - p[2] * sc;
            ctx.lineWidth = 1;
            for (let i = 1; i < trail.length; i++) {
              ctx.strokeStyle = `rgba(${acc},${((i / trail.length) * 0.75).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(px(trail[i - 1]), py(trail[i - 1]));
              ctx.lineTo(px(trail[i]), py(trail[i]));
              ctx.stroke();
            }
          }
        };
      }
    },

    { id: 'pendulum',
      name: L('Double pendulum', 'Péndulo doble'),
      note: L('Two rods, one equation, and no way to predict minute two.',
              'Dos barras, una ecuación, y ninguna forma de predecir el minuto dos.'),
      params: [
        { key: 'g',    label: L('Gravity', 'Gravedad'),   min: 0.1, max: 2,   step: 0.05, def: 0.6 },
        { key: 'damp', label: L('Damping', 'Amortiguación'), min: 0.99, max: 1, step: 0.0005, def: 0.9999 },
        { key: 'm2',   label: L('Lower mass', 'Masa inferior'), min: 1, max: 40, step: 1, def: 10 }
      ],
      make() {
        let a1 = Math.PI / 2 + 0.6, a2 = Math.PI / 2 + 0.4, v1 = 0, v2 = 0, trace = [];
        return {
          reset() { a1 = Math.PI / 2 + 0.6; a2 = Math.PI / 2 + 0.4; v1 = v2 = 0; trace = []; },
          step(ctx, w, h, t, acc, P, M) {
            const m1 = 10, m2 = P.m2, l1 = Math.min(w, h) * 0.20, l2 = Math.min(w, h) * 0.20, g = P.g;
            const ox = w / 2, oy = h * 0.34;
            // Con el mouse dentro se agarra el péndulo: los ángulos apuntan al cursor
            if (M.in) {
              a1 = Math.atan2(M.x - ox, M.y - oy);
              a2 = a1; v1 = v2 = 0; trace.length = 0;
            } else {
              // RK4. Con Euler semi-implícito perdía 7 % de la energía por minuto sin
              // amortiguación (suite de validación de BN Lab Simulations): un roce que la figura
              // no declaraba. Ahora la única pérdida es P.damp.
              const acel = (A1, A2, V1, V2) => {
                const s = Math.sin, c = Math.cos;
                const d = 2 * m1 + m2 - m2 * c(2 * A1 - 2 * A2);
                const n1 = -g * (2 * m1 + m2) * s(A1) - m2 * g * s(A1 - 2 * A2)
                         - 2 * s(A1 - A2) * m2 * (V2 * V2 * l2 + V1 * V1 * l1 * c(A1 - A2));
                const n2 = 2 * s(A1 - A2) * (V1 * V1 * l1 * (m1 + m2) + g * (m1 + m2) * c(A1)
                         + V2 * V2 * l2 * m2 * c(A1 - A2));
                return [V1, V2, n1 / (l1 * d), n2 / (l2 * d)];
              };
              const H = 0.05, q = H / 2;
              for (let i = 0; i < 3; i++) {
                const k1 = acel(a1, a2, v1, v2);
                const k2 = acel(a1 + q * k1[0], a2 + q * k1[1], v1 + q * k1[2], v2 + q * k1[3]);
                const k3 = acel(a1 + q * k2[0], a2 + q * k2[1], v1 + q * k2[2], v2 + q * k2[3]);
                const k4 = acel(a1 + H * k3[0], a2 + H * k3[1], v1 + H * k3[2], v2 + H * k3[3]);
                a1 += H / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
                a2 += H / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
                v1 = (v1 + H / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])) * P.damp;
                v2 = (v2 + H / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])) * P.damp;
              }
            }
            const x1 = ox + l1 * Math.sin(a1), y1 = oy + l1 * Math.cos(a1);
            const x2 = x1 + l2 * Math.sin(a2), y2 = y1 + l2 * Math.cos(a2);
            trace.push([x2, y2]);
            if (trace.length > 900) trace.shift();
            for (let i = 1; i < trace.length; i++) {
              ctx.strokeStyle = `rgba(${acc},${((i / trace.length) * 0.5).toFixed(3)})`;
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(trace[i - 1][0], trace[i - 1][1]);
              ctx.lineTo(trace[i][0], trace[i][1]); ctx.stroke();
            }
            ctx.strokeStyle = `rgba(${acc},0.85)`; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            ctx.fillStyle = `rgba(${acc},0.95)`;
            [[x1, y1, 2.6], [x2, y2, 2 + m2 * 0.12]].forEach(p => {
              ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, TAU); ctx.fill();
            });
          }
        };
      }
    },

    { id: 'flow',
      name: L('Flow field', 'Campo de flujo'),
      note: L('Particles with no plan, following a field they cannot see.',
              'Partículas sin plan, siguiendo un campo que no pueden ver.'),
      params: [
        { key: 'scale', label: L('Field scale', 'Escala del campo'), min: 3, max: 30, step: 0.5, def: 11 },
        { key: 'speed', label: L('Step size', 'Tamaño del paso'),   min: 0.3, max: 4, step: 0.05, def: 1.25 },
        { key: 'pull',  label: L('Cursor pull', 'Atracción del cursor'), min: 0, max: 3, step: 0.1, def: 1.2 }
      ],
      make(w, h) {
        const N = 220, P = [];
        for (let i = 0; i < N; i++) P.push({ x: Math.random() * w, y: Math.random() * h, life: Math.random() * 200 });
        return {
          fade: 0.055,
          step(ctx, w, h, t, acc, Q, M) {
            const f = Q.scale / 1000;
            ctx.lineWidth = 1;
            for (const p of P) {
              const a = (Math.sin(p.x * f + t * 0.35) + Math.cos(p.y * f * 1.18 - t * 0.28)) * Math.PI;
              let vx = Math.cos(a) * Q.speed, vy = Math.sin(a) * Q.speed;
              if (M.in && Q.pull) {                       // el cursor curva las trayectorias
                const dx = M.x - p.x, dy = M.y - p.y, d = Math.hypot(dx, dy) + 1;
                if (d < 220) { const g = Q.pull * (1 - d / 220); vx += (dx / d) * g; vy += (dy / d) * g; }
              }
              const nx = p.x + vx, ny = p.y + vy;
              ctx.strokeStyle = `rgba(${acc},0.30)`;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
              p.x = nx; p.y = ny; p.life--;
              if (p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
                p.x = Math.random() * w; p.y = Math.random() * h; p.life = 120 + Math.random() * 160;
              }
            }
          }
        };
      }
    },

    { id: 'rule30',
      name: L('Rule 30', 'Regla 30'),
      note: L('One line, one rule, applied forever. The result looks random.',
              'Una línea, una regla, aplicada infinitas veces. El resultado parece azar.'),
      params: [
        { key: 'rule', label: L('Rule number', 'Número de regla'), min: 0, max: 255, step: 1, def: 30 },
        { key: 'cell', label: L('Cell size', 'Tamaño de celda'),   min: 2, max: 8,   step: 1, def: 3, unit: 'px' }
      ],
      make(w) {
        let cols = 0, row = null, y = 0, lastCell = 0;
        const seed = c => { row = new Uint8Array(c); row[c >> 1] = 1; y = 0; };
        return {
          persist: true,
          resize() { cols = 0; },
          reset() { cols = 0; },
          step(ctx, w, h, t, acc, P, M) {
            const CELL = P.cell | 0;
            if (!cols || CELL !== lastCell) {
              lastCell = CELL; cols = Math.max(8, Math.floor(w / CELL));
              seed(cols); ctx.clearRect(0, 0, w, h);
            }
            if (y * CELL > h) { seed(cols); ctx.clearRect(0, 0, w, h); }
            ctx.fillStyle = `rgba(${acc},0.8)`;
            for (let i = 0; i < cols; i++) if (row[i]) ctx.fillRect(i * CELL, y * CELL, CELL - 0.6, CELL - 0.6);
            const R = P.rule | 0, next = new Uint8Array(cols);
            for (let i = 0; i < cols; i++) {
              const l = row[(i - 1 + cols) % cols], c = row[i], r = row[(i + 1) % cols];
              const idx = (l << 2) | (c << 1) | r;       // vecindario como número 0..7
              next[i] = (R >> idx) & 1;                  // el bit idx de la regla
            }
            row = next; y++;
          }
        };
      }
    },

    { id: 'phyllotaxis',
      name: L('Phyllotaxis', 'Filotaxis'),
      note: L('The golden angle. The same packing a sunflower solved first.',
              'El ángulo áureo. El mismo empaquetado que un girasol resolvió antes.'),
      params: [
        { key: 'angle', label: L('Divergence angle', 'Ángulo de divergencia'), min: 130, max: 145, step: 0.01, def: 137.507, unit: '°' },
        { key: 'count', label: L('Seeds', 'Semillas'),   min: 60, max: 900, step: 10, def: 420 },
        { key: 'spread', label: L('Spread', 'Dispersión'), min: 0.01, max: 0.06, step: 0.002, def: 0.028 }
      ],
      make() {
        return {
          step(ctx, w, h, t, acc, P, M) {
            const GA = P.angle * Math.PI / 180;
            const n = P.count | 0, sc = Math.min(w, h) * P.spread, cx = w / 2, cy = h / 2;
            const spin = M.in ? (M.x / w - 0.5) * 6 : t * 0.12;
            for (let i = 0; i < n; i++) {
              const a = i * GA + spin, r = sc * Math.sqrt(i);
              const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
              const f = i / n;
              ctx.fillStyle = `rgba(${acc},${(0.15 + f * 0.7).toFixed(3)})`;
              ctx.beginPath(); ctx.arc(x, y, 0.8 + f * 2.1, 0, TAU); ctx.fill();
            }
          }
        };
      }
    },

    { id: 'brownian',
      name: L('Brownian motion', 'Movimiento browniano'),
      note: L('Einstein 1905: the jitter that proved atoms are real.',
              'Einstein 1905: el temblor que demostró que los átomos existen.'),
      params: [
        { key: 'jump',    label: L('Step size', 'Tamaño del paso'), min: 1, max: 18, step: 0.5, def: 6 },
        { key: 'walkers', label: L('Walkers', 'Caminantes'),        min: 1, max: 14, step: 1,   def: 6 },
        { key: 'drift',   label: L('Cursor drift', 'Deriva al cursor'), min: 0, max: 2, step: 0.05, def: 0.5 }
      ],
      make(w, h) {
        let W = [];
        const fit = (n, w, h) => {
          while (W.length < n) W.push({ x: w / 2, y: h / 2, p: [] });
          if (W.length > n) W.length = n;
        };
        return {
          resize(w, h) { W.forEach(k => { k.x = w / 2; k.y = h / 2; k.p.length = 0; }); },
          reset() { W = []; },
          step(ctx, w, h, t, acc, P, M) {
            fit(P.walkers | 0, w, h);
            for (const k of W) {
              for (let i = 0; i < 3; i++) {
                k.x += (Math.random() - 0.5) * P.jump;
                k.y += (Math.random() - 0.5) * P.jump;
                if (M.in && P.drift) {                    // sesgo hacia el cursor
                  const dx = M.x - k.x, dy = M.y - k.y, d = Math.hypot(dx, dy) + 1;
                  k.x += (dx / d) * P.drift; k.y += (dy / d) * P.drift;
                }
                k.x = Math.max(4, Math.min(w - 4, k.x)); k.y = Math.max(4, Math.min(h - 4, k.y));
                k.p.push([k.x, k.y]);
              }
              if (k.p.length > 520) k.p.splice(0, k.p.length - 520);
              ctx.lineWidth = 1;
              for (let i = 1; i < k.p.length; i++) {
                ctx.strokeStyle = `rgba(${acc},${((i / k.p.length) * 0.55).toFixed(3)})`;
                ctx.beginPath(); ctx.moveTo(k.p[i - 1][0], k.p[i - 1][1]);
                ctx.lineTo(k.p[i][0], k.p[i][1]); ctx.stroke();
              }
              ctx.fillStyle = `rgba(${acc},0.9)`;
              ctx.beginPath(); ctx.arc(k.x, k.y, 2.2, 0, TAU); ctx.fill();
            }
          }
        };
      }
    },

    { id: 'relativity',
      name: L('Special relativity', 'Relatividad especial'),
      note: L('A light clock, seen from two frames. Same bounces, different elapsed time.',
              'Un reloj de luz visto desde dos marcos. Mismos rebotes, distinto tiempo transcurrido.'),
      params: [
        { key: 'vista', label: L('View: 0 same frame · 1 two frames', 'Vista: 0 un marco · 1 dos marcos'),
          min: 0, max: 1, step: 1, def: 1 },
        { key: 'beta',  label: L('Speed β = v/c', 'Velocidad β = v/c'), min: 0, max: 0.98, step: 0.005, def: 0.6 },
        { key: 'rate',  label: L('Clock rate', 'Ritmo del reloj'),      min: 0.3, max: 2.5, step: 0.05, def: 1 },
        { key: 'trail', label: L('Path memory', 'Memoria del camino'),  min: 0, max: 900, step: 20, def: 420 }
      ],
      make() {
        // ── Dos diagramas distintos, y la diferencia entre ellos ES la lección.
        //
        // No se puede tener las tres cosas a la vez:
        //   (1) las dos bolitas rebotan en el mismo instante
        //   (2) las dos van a la misma rapidez en pantalla
        //   (3) la de la derecha recorre más camino  (cierto si β > 0)
        // Dos cualesquiera excluyen la tercera.
        //
        // Vista 1 (por defecto) = 1+3: el MISMO reloj visto desde dos marcos.
        // Los rebotes son los MISMOS EVENTOS, así que ocurren juntos. Lo que
        // cambia es cuánto tiempo marcó cada reloj entre esos dos eventos: el
        // panel derecho recorre γ veces más camino a la misma c, o sea que en
        // tu marco pasó γ veces más tiempo. Eso es la dilatación, derivada.
        // Las rapideces EN PANTALLA no se comparan entre paneles porque cada
        // panel avanza sobre su propio eje de tiempo.
        //
        // Vista 0 = 2+3: dos relojes en UN marco. Ahí sí ambos fotones van a c
        // en pantalla, y por eso el que viaja rebota menos seguido.
        let ph = 0, lab = 0, tau = 0, ticksM = 0, ticksR = 0, path = [], px0 = 0;
        let xL = 0, yL = 0, prevPm = 1, upL = -1, legs = 0;
        // Camino que lleva recorrido cada fotón, acumulado del dibujo mismo.
        // Los relojes se calculan de acá (t = s / c) en vez de multiplicar por γ:
        // así el número es una MEDICIÓN de lo que se está viendo y delata
        // cualquier error de geometría, en vez de repetir la fórmula.
        let sIzq = 0, sDer = 0, ultIzq = null, ultDer = null;
        const tri = u => Math.abs(((u % 2) + 2) % 2 - 1);   // diente de sierra 1→0→1
        return {
          reset() { ph = 0; lab = 0; tau = 0; ticksM = ticksR = 0; path = []; px0 = 0;
                    xL = 0; yL = 0; prevPm = 1; upL = -1; legs = 0;
                    sIzq = 0; sDer = 0; ultIzq = null; ultDer = null; },
          step(ctx, w, h, t, acc, P, M) {
            const beta = M.in ? Math.min(0.98, Math.max(0, M.x / w)) : P.beta;
            const g = 1 / Math.sqrt(1 - beta * beta);
            const dt = 0.016 * P.rate;
            const dos = (P.vista | 0) === 1;

            ctx.font = '11px monospace';

            if (dos) {
              // ══ DOS MARCOS ══════════════════════════════════════════════
              // Un solo avance de fase manda los dos paneles: por construcción
              // los rebotes son simultáneos, que es justo lo que se quiere ver.
              // La animación corre sobre TU reloj. Por eso un tramo tarda γ
              // veces más: la bolita de abajo queda fija en c pase lo que pase
              // con β, y la de arriba se frena a c/γ. Antes el eje era el de los
              // eventos y el panel de arriba no reaccionaba a la velocidad.
              const prev = ph;
              ph += (dt * 1.2) / g;
              if (Math.floor(ph) !== Math.floor(prev)) legs++;
              const p = tri(ph);

              // Paneles APILADOS: así el reloj de abajo tiene el ancho entero
              // para viajar y su reinicio ocurre fuera de pantalla. Lado a lado
              // tenía que dar la vuelta dentro del panel y teletransportaba en
              // cada ciclo, que es justo el defecto que esto venía a arreglar.
              const H = h * 0.28;
              const topA = h * 0.08, botA = topA + H;      // marco del reloj
              const topB = h * 0.46, botB = topB + H;      // tu marco
              const cV = 1.2 * H;

              const mirror = (x, y0, y1, wide, a) => {
                ctx.strokeStyle = `rgba(${acc},${a})`; ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(x - wide / 2, y0); ctx.lineTo(x + wide / 2, y0);
                ctx.moveTo(x - wide / 2, y1); ctx.lineTo(x + wide / 2, y1);
                ctx.stroke();
              };
              const wide = Math.min(w * 0.09, 84);

              // ── Arriba: en el marco del propio reloj ──
              const ax = w * 0.5, ay = topA + H * p;
              mirror(ax, topA, botA, wide, 0.5);
              ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(ax, topA); ctx.lineTo(ax, botA); ctx.stroke();
              ctx.fillStyle = `rgba(${acc},0.95)`;
              ctx.beginPath(); ctx.arc(ax, ay, 4.2, 0, TAU); ctx.fill();

              // ── Abajo: el mismo reloj, moviéndose. Avanza de continuo y
              // reaparece fuera del cuadro, nunca salta a la vista.
              const pad = w * 0.10, span = w + 2 * pad;
              if (!px0) px0 = pad + w * 0.30;
              px0 += beta * cV * dt;                        // βγH por tramo, con el eje nuevo
              let reinicio = false;
              if (px0 > span) { px0 -= span; path.length = 0; reinicio = true; }
              const bx = -pad + px0, by = topB + H * p;

              path.push([bx, by]);
              const keep = P.trail | 0;
              if (keep === 0) path.length = 0;
              else if (path.length > keep) path.splice(0, path.length - keep);
              ctx.lineWidth = 1.1;
              for (let k = 1; k < path.length; k++) {
                if (Math.abs(path[k][0] - path[k - 1][0]) > w * 0.5) continue;
                ctx.strokeStyle = `rgba(${acc},${((k / path.length) * 0.5).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(path[k - 1][0], path[k - 1][1]);
                ctx.lineTo(path[k][0], path[k][1]);
                ctx.stroke();
              }

              mirror(bx, topB, botB, wide / g, 0.9);        // contracción de longitudes
              ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(bx, topB); ctx.lineTo(bx, botB); ctx.stroke();
              ctx.fillStyle = `rgba(${acc},1)`;
              ctx.beginPath(); ctx.arc(bx, by, 4.2, 0, TAU); ctx.fill();

              // Guía: las dos van a la misma altura relativa, siempre
              ctx.strokeStyle = `rgba(${acc},0.12)`; ctx.lineWidth = 1;
              ctx.setLineDash([1, 5]);
              ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + (topB - topA)); ctx.stroke();
              ctx.setLineDash([]);

              // Camino recorrido por cada fotón, tomado del dibujo
              if (ultIzq) { const d = Math.hypot(ax - ultIzq[0], ay - ultIzq[1]); if (d < H) sIzq += d; }
              if (ultDer && !reinicio) { const d = Math.hypot(bx - ultDer[0], by - ultDer[1]); if (d < H) sDer += d; }
              ultIzq = [ax, ay]; ultDer = [bx, by];

              ctx.fillStyle = `rgba(${acc},0.5)`;
              ctx.fillText('en el marco del reloj', 14, topA - 10);
              ctx.fillText('en tu marco', 14, topB - 10);

              const propio = (sIzq / cV).toFixed(2);
              const tuyo = (sDer / cV).toFixed(2);
              const medido = sIzq > 1 ? (sDer / sIzq) : 1;
              ctx.fillStyle = `rgba(${acc},0.9)`;
              ctx.fillText('reloj del cohete  τ = ' + propio + ' s     tu reloj  t = ' + tuyo + ' s', 12, h - 44);
              ctx.fillStyle = `rgba(${acc},0.55)`;
              ctx.fillText('mismos ' + legs + ' rebotes · arriba se ve lenta porque ese reloj corre lento en tu tiempo', 12, h - 28);
              ctx.fillStyle = `rgba(${acc},0.95)`;
              ctx.fillText('β = ' + beta.toFixed(3) + '    γ = ' + g.toFixed(3) +
                '    t/τ medido = ' + medido.toFixed(3), 12, h - 12);
              return;
            }

            // ══ UN MARCO ═══════════════════════════════════════════════════
            const topY = h * 0.20, botY = h * 0.62, H = botY - topY;
            const restX = w * 0.13;

            const prevR = lab;
            lab += dt;
            const pr = tri(lab * 1.2);
            if (Math.floor(lab * 1.2) !== Math.floor(prevR * 1.2)) ticksR++;

            const prevT = tau;
            tau += dt / g;
            const pm = tri(tau * 1.2);
            if (Math.floor(tau * 1.2) !== Math.floor(prevT * 1.2)) ticksM++;

            const cLuz = 1.2 * H;
            const pad = w * 0.10;
            const span = w + 2 * pad;
            if (!px0) px0 = pad + w * 0.32;
            px0 = px0 + beta * cLuz * dt;
            if (px0 > span) { px0 -= span; path.length = 0; }
            const cxm = -pad + px0;

            const phY = topY + H * pm;
            path.push([cxm, phY]);
            const keep = P.trail | 0;
            if (keep === 0) path.length = 0;
            else if (path.length > keep) path.splice(0, path.length - keep);

            ctx.lineWidth = 1;
            for (let i = 1; i < path.length; i++) {
              if (Math.abs(path[i][0] - path[i - 1][0]) > w * 0.5) continue;
              ctx.strokeStyle = `rgba(${acc},${((i / path.length) * 0.55).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(path[i - 1][0], path[i - 1][1]);
              ctx.lineTo(path[i][0], path[i][1]);
              ctx.stroke();
            }

            const mirror2 = (x, alpha, wide) => {
              ctx.strokeStyle = `rgba(${acc},${alpha})`; ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.moveTo(x - wide / 2, topY); ctx.lineTo(x + wide / 2, topY);
              ctx.moveTo(x - wide / 2, botY); ctx.lineTo(x + wide / 2, botY);
              ctx.stroke();
            };
            mirror2(restX, 0.3, w * 0.07);
            ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(restX, topY); ctx.lineTo(restX, botY); ctx.stroke();
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.beginPath(); ctx.arc(restX, topY + H * pr, 3.2, 0, TAU); ctx.fill();

            mirror2(cxm, 0.9, (w * 0.07) / g);
            ctx.fillStyle = `rgba(${acc},1)`;
            ctx.beginPath(); ctx.arc(cxm, phY, 3.8, 0, TAU); ctx.fill();

            const rulerY = h * 0.79, L0 = w * 0.16;
            ctx.strokeStyle = `rgba(${acc},0.25)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(restX - L0 / 2, rulerY); ctx.lineTo(restX + L0 / 2, rulerY); ctx.stroke();
            ctx.strokeStyle = `rgba(${acc},0.85)`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cxm - L0 / (2 * g), rulerY); ctx.lineTo(cxm + L0 / (2 * g), rulerY); ctx.stroke();

            ctx.fillStyle = `rgba(${acc},0.9)`;
            ctx.fillText('β = ' + beta.toFixed(3) + '    γ = ' + g.toFixed(3), 12, h - 44);
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('rest   ' + ticksR + ' ticks', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('moving ' + ticksM + ' ticks    ratio ' +
              (ticksR ? (ticksM / ticksR).toFixed(3) : '—') + '   1/γ = ' + (1 / g).toFixed(3), 12, h - 12);
          }
        };
      }
    },
    { id: 'spacetime',
      name: L('Curved spacetime', 'Espaciotiempo curvo'),
      note: L('The embedding diagram of a black hole. Orbits are straight lines on a bent surface.',
              'El diagrama de embebimiento de un agujero negro. Las órbitas son rectas sobre una superficie doblada.'),
      params: [
        { key: 'rs',    label: L('Schwarzschild radius', 'Radio de Schwarzschild'), min: 4, max: 40, step: 1, def: 16, unit: 'px' },
        { key: 'tilt',  label: L('View angle', 'Ángulo de vista'), min: 0.1, max: 0.9, step: 0.02, def: 0.42 },
        { key: 'orbit', label: L('Orbiting particles', 'Partículas en órbita'), min: 0, max: 6, step: 1, def: 3 }
      ],
      make(w, h) {
        let bodies = [], lw = w, lh = h;
        const seed = (w, h) => {
          bodies = [];
          for (let i = 0; i < 6; i++) {
            const r = Math.min(w, h) * (0.14 + i * 0.05), a = i * 1.7;
            const v = Math.sqrt(2200 / r);
            bodies.push({ x: r * Math.cos(a), y: r * Math.sin(a),
                          vx: -Math.sin(a) * v, vy: Math.cos(a) * v, p: [] });
          }
        };
        seed(w, h);
        return {
          resize(w, h) { lw = w; lh = h; seed(w, h); },
          reset() { seed(lw, lh); },
          step(ctx, w, h, t, acc, P, M) {
            const cx = M.in ? M.x : w / 2, cy = (M.in ? M.y : h / 2) - h * 0.06;
            const rs = P.rs, tilt = P.tilt, DEPTH = 1.5;

            // Paraboloide de Flamm: z(r) = 2·√(rs·(r − rs)) para r ≥ rs.
            // Es la superficie de embebimiento exacta de Schwarzschild, no un
            // pozo inventado: la garganta está en rs y se aplana hacia el infinito.
            const zOf = r => 2 * Math.sqrt(rs * Math.max(0, r - rs));
            const proj = (dx, dy) => {
              const r = Math.hypot(dx, dy);
              const z = zOf(Math.max(r, rs));
              return [cx + dx, cy + dy * tilt + (zOf(600) - z) * DEPTH * tilt];
            };

            // Malla polar: anillos y radios, que es como se dibuja el diagrama
            ctx.lineWidth = 1;
            const RINGS = 16, SPOKES = 32, RMAX = Math.max(w, h) * 0.62;
            for (let i = 1; i <= RINGS; i++) {
              const r = rs + Math.pow(i / RINGS, 1.7) * RMAX;
              ctx.strokeStyle = `rgba(${acc},${(0.30 - i * 0.012).toFixed(3)})`;
              ctx.beginPath();
              for (let k = 0; k <= SPOKES; k++) {
                const a = (k / SPOKES) * TAU;
                const p = proj(r * Math.cos(a), r * Math.sin(a));
                k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
              }
              ctx.stroke();
            }
            ctx.strokeStyle = `rgba(${acc},0.14)`;
            for (let k = 0; k < SPOKES; k++) {
              const a = (k / SPOKES) * TAU;
              ctx.beginPath();
              for (let i = 0; i <= RINGS; i++) {
                const r = rs + Math.pow(i / RINGS, 1.7) * RMAX;
                const p = proj(r * Math.cos(a), r * Math.sin(a));
                i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
              }
              ctx.stroke();
            }

            // El horizonte: la garganta del embudo
            ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (let k = 0; k <= SPOKES; k++) {
              const a = (k / SPOKES) * TAU;
              const p = proj(rs * Math.cos(a), rs * Math.sin(a));
              k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
            }
            ctx.stroke();

            // Partículas: se integran en el plano y se proyectan a la superficie
            const n = P.orbit | 0;
            for (let i = 0; i < n && i < bodies.length; i++) {
              const b = bodies[i];
              for (let s = 0; s < 2; s++) {
                const r = Math.hypot(b.x, b.y) + 4;
                const a = 2200 / (r * r) * 0.5;
                b.vx -= (b.x / r) * a; b.vy -= (b.y / r) * a;
                b.x += b.vx * 0.5; b.y += b.vy * 0.5;
              }
              b.p.push([b.x, b.y]); if (b.p.length > 520) b.p.shift();
              ctx.strokeStyle = `rgba(${acc},0.6)`; ctx.lineWidth = 1.1;
              ctx.beginPath();
              b.p.forEach((q, k) => { const pr = proj(q[0], q[1]);
                k ? ctx.lineTo(pr[0], pr[1]) : ctx.moveTo(pr[0], pr[1]); });
              ctx.stroke();
              const pb = proj(b.x, b.y);
              ctx.fillStyle = `rgba(${acc},0.95)`;
              ctx.beginPath(); ctx.arc(pb[0], pb[1], 3.2, 0, TAU); ctx.fill();
            }

            ctx.fillStyle = `rgba(${acc},0.75)`; ctx.font = '11px monospace';
            ctx.fillText('r_s = ' + rs + 'px', 12, h - 12);
          }
        };
      }
    },

    { id: 'wormhole',
      name: L('Wormhole', 'Agujero de gusano'),
      note: L('A Morris-Thorne throat joining two sheets. Watch something cross it.',
              'Una garganta de Morris-Thorne uniendo dos hojas. Mira algo cruzarla.'),
      params: [
        { key: 'reach',   label: L('Sheet extent', 'Alcance de las hojas'), min: 1.4, max: 6, step: 0.1, def: 3.2 },
        { key: 'tilt',    label: L('View angle', 'Ángulo de vista'), min: 0.12, max: 0.9, step: 0.02, def: 0.34 },
        { key: 'travel',  label: L('Travellers', 'Viajeros'), min: 0, max: 4, step: 1, def: 2 }
      ],
      make() {
        // Métrica de Morris-Thorne con función de forma b(r) = b₀²/r.
        // La coordenada radial propia l va de −∞ a +∞ y CRUZA la garganta:
        //   r(l) = √(b₀² + l²)        radio circunferencial
        //   z(l) = b₀·arcsinh(l/b₀)   altura de embebimiento
        // Con l = 0 en la garganta, l > 0 una hoja y l < 0 la otra.
        let phi = 0, trav = [];
        const seed = n => {
          trav = [];
          for (let i = 0; i < 4; i++) trav.push({ l: 1 - i * 0.5, dir: i % 2 ? 1 : -1, p: [] });
        };
        seed();
        return {
          reset() { seed(); phi = 0; },
          step(ctx, w, h, t, acc, P, M) {
            // La métrica es autosimilar en b₀: cambiarlo solo escala la figura y no
            // cambia su forma. Así que b₀ se fija en 1 unidad de mundo y la escala
            // se calcula para llenar el cuadro; el control real es cuánto de las
            // hojas se ve, que sí cambia lo que hay en pantalla.
            const LMAX = P.reach;
            const S = (Math.min(w, h) * 0.40) / Math.sqrt(1 + LMAX * LMAX);
            const b0 = S;
            const tilt = M.in ? 0.12 + (M.y / h) * 0.78 : P.tilt;
            if (M.in) phi = (M.x / w) * TAU; else phi += 0.0035;

            const rOf = l => S * Math.sqrt(1 + l * l);
            const zOf = l => S * Math.asinh(l);
            const ca = Math.cos(phi), sa = Math.sin(phi);
            const kz = Math.cos(tilt), ky = Math.sin(tilt);
            const cx = w / 2, cy = h / 2;
            // Proyección: giro en azimut y luego inclinación de la cámara
            const proj = (l, a) => {
              const r = rOf(l), z = zOf(l);
              const x = r * Math.cos(a), y = r * Math.sin(a);
              const xr = x * ca - y * sa, yr = x * sa + y * ca;
              return [cx + xr, cy + yr * ky - z * kz];
            };

            // Anillos de l constante, dibujados de atrás hacia adelante
            const RINGS = 26, SEG = 40;
            const ls = [];
            for (let i = 0; i <= RINGS; i++) ls.push(-LMAX + (2 * LMAX * i) / RINGS);
            ls.sort((A, B) => zOf(B) - zOf(A));    // los de arriba primero
            ctx.lineWidth = 1;
            for (const l of ls) {
              const near = 1 - Math.min(1, Math.abs(l) / LMAX);
              ctx.strokeStyle = `rgba(${acc},${(0.10 + near * 0.45).toFixed(3)})`;
              ctx.beginPath();
              for (let k = 0; k <= SEG; k++) {
                const pnt = proj(l, (k / SEG) * TAU);
                k ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
              }
              ctx.stroke();
            }
            // Meridianos de ángulo constante
            ctx.strokeStyle = `rgba(${acc},0.14)`;
            for (let k = 0; k < 16; k++) {
              const a = (k / 16) * TAU;
              ctx.beginPath();
              for (let i = 0; i <= 60; i++) {
                const l = -LMAX + (2 * LMAX * i) / 60;
                const pnt = proj(l, a);
                i ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
              }
              ctx.stroke();
            }
            // La garganta: el círculo mínimo, l = 0, radio exactamente b₀
            ctx.strokeStyle = `rgba(${acc},0.95)`; ctx.lineWidth = 1.6;
            ctx.beginPath();
            for (let k = 0; k <= SEG; k++) {
              const pnt = proj(0, (k / SEG) * TAU);
              k ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
            }
            ctx.stroke();

            // Viajeros: avanzan en l a rapidez propia constante y cruzan
            const n = P.travel | 0;
            for (let i = 0; i < n && i < trav.length; i++) {
              const tr = trav[i];
              tr.l += tr.dir * 0.016;
              if (tr.l > LMAX) { tr.l = LMAX; tr.dir = -1; tr.p.length = 0; }
              if (tr.l < -LMAX) { tr.l = -LMAX; tr.dir = 1; tr.p.length = 0; }
              const a = (i / Math.max(1, n)) * TAU + t * 0.25;
              tr.p.push([tr.l, a]);
              if (tr.p.length > 220) tr.p.shift();
              ctx.lineWidth = 1.2;
              for (let k = 1; k < tr.p.length; k++) {
                ctx.strokeStyle = `rgba(${acc},${((k / tr.p.length) * 0.7).toFixed(3)})`;
                const A = proj(tr.p[k - 1][0], tr.p[k - 1][1]), B = proj(tr.p[k][0], tr.p[k][1]);
                ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
              }
              const pnt = proj(tr.l, a);
              ctx.fillStyle = `rgba(${acc},1)`;
              ctx.beginPath(); ctx.arc(pnt[0], pnt[1], 4.2, 0, TAU); ctx.fill();
            }

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('r(l) = √(b₀² + l²)      z(l) = b₀·asinh(l/b₀)', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.9)`;
            ctx.fillText('b₀ = ' + S.toFixed(0) + 'px    2πb₀ = ' + (TAU * S).toFixed(0) + 'px    l ∈ [−' + LMAX.toFixed(1) + ', ' + LMAX.toFixed(1) + ']', 12, h - 12);
          }
        };
      }
    },

    { id: 'hawking',
      name: L('Hawking radiation', 'Radiación de Hawking'),
      note: L('Pairs born at the horizon. One escapes, one falls in, and the hole loses mass.',
              'Pares que nacen en el horizonte. Uno escapa, otro cae, y el agujero pierde masa.'),
      params: [
        { key: 'mass', label: L('Initial mass', 'Masa inicial'), min: 20, max: 120, step: 2, def: 80 },
        { key: 'rate', label: L('Evaporation rate', 'Ritmo de evaporación'), min: 0, max: 3, step: 0.05, def: 0.6 },
        { key: 'pairs', label: L('Pair density', 'Densidad de pares'), min: 2, max: 40, step: 1, def: 16 }
      ],
      make() {
        let M = 80, pairs = [], flash = 0;
        return {
          reset() { M = 0; pairs = []; flash = 0; },
          step(ctx, w, h, t, acc, P, M0) {
            if (M <= 0) M = P.mass;
            const cx = w / 2, cy = h / 2;
            // El horizonte crece con la masa: r_s = 2GM/c²
            const rs = M * 0.9;
            // Temperatura de Hawking: T = ħc³/8πGMk_B  →  T ∝ 1/M.
            // Por eso evaporar CALIENTA: mientras menos masa, más radia.
            const T = 60 / M;
            // Luminosidad ∝ 1/M², así que dM/dt ∝ −1/M² y el final es abrupto
            if (P.rate > 0) M -= (P.rate * 40) / (M * M);
            if (M < 6) { flash = 1; M = P.mass; pairs = []; }
            flash *= 0.9;

            // Esfera de fotones en 1.5 r_s: la última órbita posible de la luz
            ctx.strokeStyle = `rgba(${acc},0.22)`; ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath(); ctx.arc(cx, cy, rs * 1.5, 0, TAU); ctx.stroke();
            ctx.setLineDash([]);

            // Nacimiento de pares en el horizonte
            const want = P.pairs | 0;
            if (pairs.length < want && Math.random() < 0.5) {
              const a = Math.random() * TAU;
              pairs.push({ a, r: rs, out: 0, life: 0 });
            }
            pairs = pairs.filter(p => {
              p.life += 0.016;
              p.out += 0.8 + T * 6;                    // el que escapa se aleja
              const ro = rs + p.out, ri = Math.max(0, rs - p.out * 0.55);
              const fade = Math.max(0, 1 - p.out / (Math.min(w, h) * 0.45));
              // El que escapa: energía positiva, se ve
              ctx.fillStyle = `rgba(${acc},${(fade * 0.9).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(cx + ro * Math.cos(p.a), cy + ro * Math.sin(p.a), 1.8, 0, TAU); ctx.fill();
              // El que cae: energía NEGATIVA, y por eso el agujero adelgaza
              ctx.fillStyle = `rgba(${neutro()},${(fade * 0.4).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(cx + ri * Math.cos(p.a), cy + ri * Math.sin(p.a), 1.4, 0, TAU); ctx.fill();
              return fade > 0.02;
            });

            // El horizonte: un disco perfectamente negro con borde
            const grd = ctx.createRadialGradient(cx, cy, rs * 0.9, cx, cy, rs * 1.25);
            grd.addColorStop(0, 'rgba(0,0,0,1)');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(cx, cy, rs * 1.25, 0, TAU); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(cx, cy, rs, 0, TAU); ctx.fill();
            ctx.strokeStyle = `rgba(${acc},${(0.5 + T * 2).toFixed(2)})`; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.arc(cx, cy, rs, 0, TAU); ctx.stroke();

            if (flash > 0.02) {                        // el destello final
              ctx.fillStyle = `rgba(${acc},${(flash * 0.5).toFixed(3)})`;
              ctx.beginPath(); ctx.arc(cx, cy, rs * (1 + (1 - flash) * 6), 0, TAU); ctx.fill();
            }

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('T ∝ 1/M      L ∝ 1/M²      lifetime ∝ M³', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('M = ' + M.toFixed(1) + '     T = ' + T.toFixed(3) + '  (rising)', 12, h - 12);
          }
        };
      }
    },

    { id: 'quasar',
      name: L('Quasar', 'Cuásar'),
      note: L('An accretion disk and two jets. One side is brighter, and that is relativity.',
              'Un disco de acreción y dos chorros. Un lado brilla más, y eso es relatividad.'),
      params: [
        { key: 'incl', label: L('Inclination', 'Inclinación'), min: 0.05, max: 1.5, step: 0.02, def: 0.42 },
        { key: 'jet',  label: L('Jet power', 'Potencia del chorro'), min: 0, max: 3, step: 0.05, def: 1.2 },
        { key: 'beam', label: L('Beaming β', 'Beaming β'), min: 0, max: 0.9, step: 0.02, def: 0.55 }
      ],
      make(w, h) {
        let disk = [], jet = [], phi = 0;
        const seed = (w, h) => {
          disk = []; jet = [];
          const R = Math.min(w, h);
          for (let i = 0; i < 900; i++) {
            const u = Math.pow(Math.random(), 0.6);
            disk.push({ r: R * (0.07 + u * 0.34), a: Math.random() * TAU });
          }
        };
        seed(w, h);
        return {
          resize(w, h) { seed(w, h); },
          reset() { seed(w, h); jet = []; },
          step(ctx, w, h, t, acc, P, M) {
            const incl = M.in ? 0.05 + (M.y / h) * 1.45 : P.incl;
            if (M.in) phi = (M.x / w) * TAU; else phi += 0.002;
            const cx = w / 2, cy = h / 2;
            const ky = Math.sin(incl), kz = Math.cos(incl);
            const rgb = acc.split(',').map(Number);

            // Chorros: colimados perpendicular al disco, arriba y abajo
            if (P.jet > 0 && jet.length < 260) {
              for (let k = 0; k < 2; k++)
                jet.push({ z: 0, dir: k ? 1 : -1, o: (Math.random() - 0.5) * 14, v: 2 + Math.random() * 3 });
            }
            jet = jet.filter(j => {
              j.z += j.dir * j.v * P.jet;
              const far = Math.abs(j.z) > Math.min(w, h) * 0.62;
              const y = cy - j.z * kz, x = cx + j.o;
              const fade = 1 - Math.abs(j.z) / (Math.min(w, h) * 0.62);
              ctx.fillStyle = `rgba(${acc},${(fade * 0.5).toFixed(3)})`;
              ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill();
              return !far;
            });

            // Disco: rotación kepleriana, más rápido hacia adentro
            for (const d of disk) {
              d.a += (2.2 / Math.pow(d.r, 1.5)) * 60;
              const ax = d.a + phi;
              const x = d.r * Math.cos(ax), y = d.r * Math.sin(ax);
              const sx = cx + x, sy = cy + y * ky;
              // Beaming Doppler: δ = 1/(γ(1 − β·cosθ)). El lado que se acerca
              // brilla mucho más. Es el mismo efecto que hace que un solo chorro
              // se vea en la mayoría de los cuásares reales.
              const beta = P.beam * Math.min(1, (Math.min(w, h) * 0.12) / d.r);
              const g = 1 / Math.sqrt(1 - beta * beta);
              const cosTh = -Math.sin(ax) * Math.cos(incl);
              const delta = 1 / (g * (1 - beta * cosTh));
              const b = Math.min(1, Math.pow(delta, 3) * 0.18);
              ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${b.toFixed(3)})`;
              ctx.fillRect(sx, sy, 1.6, 1.6);
            }

            // El motor central
            const R0 = Math.min(w, h) * 0.05;
            const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, R0);
            g2.addColorStop(0, `rgba(${nucleo()},0.9)`);
            g2.addColorStop(0.4, `rgba(${acc},0.7)`);
            g2.addColorStop(1, `rgba(${acc},0)`);
            ctx.fillStyle = g2;
            ctx.beginPath(); ctx.arc(cx, cy, R0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(cx, cy, R0 * 0.28, 0, TAU); ctx.fill();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('δ = 1/(γ(1 − β·cosθ))     brightness ∝ δ³', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.9)`;
            ctx.fillText('inclination ' + (incl * 57.3).toFixed(0) + '°     β = ' + P.beam.toFixed(2), 12, h - 12);
          }
        };
      }
    },

    { id: 'entanglement',
      name: L('Bell test', 'Test de Bell'),
      note: L('Two detectors, random outcomes each, correlations no local theory can produce.',
              'Dos detectores, resultados azarosos en cada uno, correlaciones que ninguna teoría local produce.'),
      params: [
        { key: 'angA',  label: L('Detector A angle', 'Ángulo del detector A'), min: 0, max: 180, step: 1, def: 0, unit: '°' },
        { key: 'angB',  label: L('Detector B angle', 'Ángulo del detector B'), min: 0, max: 180, step: 1, def: 45, unit: '°' },
        { key: 'speed', label: L('Pairs per frame', 'Pares por frame'), min: 1, max: 200, step: 1, def: 40 }
      ],
      make() {
        // Ajustes que maximizan CHSH con esta convención de signo (E = −cos):
        //   a = 0°, a' = 90°, b = 45°, b' = 135°  →  S = 2√2
        // Con 0/45/22.5/67.5 el mismo estado da solo 2.39: viola el límite
        // clásico igual, pero no alcanza el máximo cuántico.
        const SET = [[0, 45], [0, 135], [90, 45], [90, 135]];
        let tally = SET.map(() => ({ n: 0, s: 0 })), hist = [], shots = [];
        const D = 180 / Math.PI;
        return {
          reset() { tally = SET.map(() => ({ n: 0, s: 0 })); hist = []; shots = []; },
          step(ctx, w, h, t, acc, P, M) {
            const aA = M.in ? (M.x / w) * 180 : P.angA;
            const aB = P.angB;

            // Una medición: cada lado da ±1 al azar, pero la correlación del
            // estado singlete es E = −cos(a − b). No hay señal entre ellos.
            const measure = (a, b) => {
              const E = -Math.cos((a - b) / D);
              const A = Math.random() < 0.5 ? 1 : -1;
              const B = Math.random() < (1 + E) / 2 ? A : -A;
              return [A, B];
            };

            for (let k = 0; k < (P.speed | 0); k++) {
              SET.forEach((cfg, i) => {
                const [A, B] = measure(cfg[0], cfg[1]);
                tally[i].n++; tally[i].s += A * B;
              });
              const [A, B] = measure(aA, aB);
              shots.push({ A, B, life: 0 });
            }
            if (shots.length > 40) shots.splice(0, shots.length - 40);

            const E = tally.map(x => (x.n ? x.s / x.n : 0));
            const S = Math.abs(E[0] - E[1] + E[2] + E[3]);   // parámetro CHSH

            // Correlación medida del par visible contra la predicción
            const Emeas = -Math.cos((aA - aB) / D);
            hist.push(Emeas);
            if (hist.length > 200) hist.shift();

            const cx = w / 2, cy = h * 0.34, arm = Math.min(w * 0.3, h * 0.3);
            // Fuente al centro, detectores a los lados
            ctx.strokeStyle = `rgba(${acc},0.25)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy); ctx.stroke();
            ctx.fillStyle = `rgba(${acc},0.9)`;
            ctx.beginPath(); ctx.arc(cx, cy, 4, 0, TAU); ctx.fill();

            const dial = (x, ang, label, val) => {
              ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1.2;
              ctx.beginPath(); ctx.arc(x, cy, 16, 0, TAU); ctx.stroke();
              const r = ang / D;
              ctx.strokeStyle = `rgba(${acc},0.95)`; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.moveTo(x - 16 * Math.cos(r), cy - 16 * Math.sin(r));
              ctx.lineTo(x + 16 * Math.cos(r), cy + 16 * Math.sin(r)); ctx.stroke();
              ctx.font = '10px monospace'; ctx.fillStyle = `rgba(${acc},0.7)`;
              ctx.fillText(label + ' ' + ang.toFixed(0) + '°', x - 22, cy + 34);
              ctx.fillStyle = val > 0 ? `rgba(${acc},1)` : `rgba(${neutro()},0.9)`;
              ctx.fillText(val > 0 ? '+1' : '−1', x - 7, cy - 26);
            };
            const last = shots[shots.length - 1] || { A: 1, B: -1 };
            dial(cx - arm, aA, 'A', last.A);
            dial(cx + arm, aB, 'B', last.B);

            // Curva de correlación: medida contra −cos(Δ)
            const gy = h * 0.72, gh = h * 0.2, gw = w * 0.76, gx = w * 0.12;
            ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
            ctx.strokeStyle = `rgba(${acc},0.5)`;
            ctx.beginPath();
            for (let i = 0; i <= 90; i++) {
              const d = (i / 90) * 180, y = gy - (-Math.cos(d / D)) * gh;
              i ? ctx.lineTo(gx + (i / 90) * gw, y) : ctx.moveTo(gx, y);
            }
            ctx.stroke();
            const px = gx + (Math.abs(aA - aB) / 180) * gw;
            ctx.fillStyle = `rgba(${acc},1)`;
            ctx.beginPath(); ctx.arc(px, gy - Emeas * gh, 3.4, 0, TAU); ctx.fill();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('E(a,b) = −cos(a−b)      classical limit S ≤ 2', 12, h - 28);
            ctx.fillStyle = S > 2 ? `rgba(${acc},1)` : `rgba(${neutro()},0.8)`;
            ctx.fillText('CHSH  S = ' + S.toFixed(3) + '   (2√2 = 2.828)' +
              (S > 2 ? '   violated' : ''), 12, h - 12);
          }
        };
      }
    },

    { id: 'shortcut',
      name: L('Looking through', 'Mirar a través'),
      note: L('Ray-traced view into an Ellis wormhole. Two skies in one image.',
              'Vista trazada por rayos hacia un agujero de Ellis. Dos cielos en una imagen.'),
      params: [
        { key: 'b0',   label: L('Throat radius b₀', 'Radio de garganta b₀'), min: 0.2, max: 3, step: 0.05, def: 1 },
        { key: 'dist', label: L('Camera distance', 'Distancia de la cámara'), min: 1.5, max: 14, step: 0.25, def: 5 },
        { key: 'fov',  label: L('Field of view', 'Campo de visión'), min: 30, max: 140, step: 2, def: 90, unit: '°' }
      ],
      make() {
        // Métrica de Ellis (Morris-Thorne con b(r) = b₀²/r):
        //   ds² = −dt² + dl² + (b₀² + l²)dφ²
        // Un rayo con parámetro de impacto b cumple
        //   dl/dφ = ±(r²/b)·√(1 − b²/r²),   r² = b₀² + l²
        // Integrando EN φ la raíz no diverge en el punto de retorno: dl/dφ → 0
        // suavemente, así que basta Euler con paso fino.
        const N = 512;                       // rayos de la tabla
        let lut = null, key = '', img = null, off = null, ikey = '';

        function buildLUT(b0, l0, fovRad) {
          const r0 = Math.sqrt(b0 * b0 + l0 * l0);
          const t = new Float32Array(N);     // ángulo asintótico Θ
          const side = new Uint8Array(N);    // 0 = mismo lado, 1 = el otro
          const LINF = 260;
          for (let i = 0; i < N; i++) {
            const psi = (i / (N - 1)) * (fovRad / 2);
            const b = r0 * Math.sin(psi);
            let l = l0, phi = 0, dir = -1;   // arranca cayendo hacia la garganta
            const dphi = 0.004;
            let guard = 0;
            while (guard++ < 6000) {
              const r2 = b0 * b0 + l * l;
              const s = 1 - (b * b) / r2;
              if (s <= 0) { dir = -dir; l += dir * 0.001; continue; }   // punto de retorno
              const dl = dir * (r2 / Math.max(b, 1e-6)) * Math.sqrt(s);
              l += dl * dphi; phi += dphi;
              if (l > LINF || l < -LINF) break;
            }
            side[i] = l < 0 ? 1 : 0;
            t[i] = phi;
          }
          return { t, side, r0 };
        }

        // Cielos procedurales. Las estrellas se generan por celda con una
        // posición aleatoria dentro de ella y caída suave, así se leen como
        // puntos y no como bloques del buffer.
        function sky(which, th, az, rgb, px, o) {
          const hash = (a, b) => {
            const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
            return s - Math.floor(s);
          };
          const K = which ? 34 : 22;
          const u = th * K, v = az * K * 0.5;
          let star = 0;
          for (let du = -1; du <= 0; du++) {
            for (let dv = -1; dv <= 0; dv++) {
              const cu = Math.floor(u) + du, cv = Math.floor(v) + dv;
              const h1 = hash(cu, cv);
              if (h1 < (which ? 0.28 : 0.16)) continue;          // celda sin estrella
              const sx = cu + hash(cu + 3.3, cv), sy = cv + hash(cu, cv + 7.7);
              const d = Math.hypot(u - sx, v - sy);
              const mag = 0.35 + hash(cv, cu) * 0.65;
              star = Math.max(star, Math.max(0, 1 - d / 0.42) * mag);
            }
          }
          star = Math.pow(star, 1.7);
          // Retícula de coordenadas: distinta densidad a cada lado
          const gA = Math.abs(((th * (which ? 7 : 4)) % 1) - 0.5);
          const gB = Math.abs(((az * (which ? 7 : 4)) % 1) - 0.5);
          const grid = Math.max(0, 0.5 - Math.min(gA, gB)) * (which ? 0.20 : 0.13);
          if (which) {                        // el otro cielo: frío, pálido
            px[o]   = Math.min(255, 205 * star + 110 * grid);
            px[o+1] = Math.min(255, 222 * star + 130 * grid);
            px[o+2] = Math.min(255, 255 * star + 165 * grid);
          } else {                            // el propio: el color del tema
            px[o]   = Math.min(255, rgb[0] * star + rgb[0] * grid);
            px[o+1] = Math.min(255, rgb[1] * star + rgb[1] * grid);
            px[o+2] = Math.min(255, rgb[2] * star + rgb[2] * grid);
          }
          px[o+3] = 255;
        }

        return {
          reset() { key = ''; ikey = ''; },
          step(ctx, w, h, t, acc, P, M) {
            const b0 = P.b0, l0 = P.dist, fov = P.fov * Math.PI / 180;
            const spin = M.in ? (M.x / w) * TAU : t * 0.05;
            const RES = 300;

            const k = [b0.toFixed(2), l0.toFixed(2), P.fov].join('|');
            if (k !== key) { key = k; lut = buildLUT(b0, l0, fov); ikey = ''; }

            const ik = [k, acc].join('|');
            if (ik !== ikey) {
              ikey = ik;
              if (!img || img.width !== RES) {
                img = ctx.createImageData(RES, RES);
                off = document.createElement('canvas'); off.width = off.height = RES;
              }
              const rgb = acc.split(',').map(Number), px = img.data;
              const half = RES / 2, tanH = Math.tan(fov / 2);
              for (let j = 0; j < RES; j++) {
                const dy = (j - half) / half;
                for (let i = 0; i < RES; i++) {
                  const dx = (i - half) / half;
                  const rad = Math.hypot(dx, dy);
                  const o = (j * RES + i) * 4;
                  // ángulo del rayo respecto al eje óptico
                  const psi = Math.atan(rad * tanH);
                  const idx = Math.min(N - 1, Math.round((psi / (fov / 2)) * (N - 1)));
                  const az = Math.atan2(dy, dx);
                  sky(lut.side[idx], lut.t[idx], az, rgb, px, o);
                }
              }
              off.getContext('2d').putImageData(img, 0, 0);
            }

            // El giro se aplica al dibujar. Recalcular el buffer por cada frame de
            // rotación costaría 90.000 lecturas de tabla que no cambian nada.
            const S = Math.max(w, h) * 1.45;
            ctx.save();
            ctx.translate(w / 2, h / 2); ctx.rotate(spin);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(off, -S / 2, -S / 2, S, S);
            ctx.restore();

            // Borde de la boca: el último rayo que aún cruza al otro lado
            let edge = 0;
            for (let i = 0; i < N; i++) if (lut.side[i]) edge = i;
            const psiE = ((edge + 0.5) / (N - 1)) * (fov / 2);
            const rE = Math.tan(psiE) / Math.tan(fov / 2);
            ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(w / 2, h / 2, (rE * S) / 2, 0, TAU); ctx.stroke();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('dl/dφ = ±(r²/b)·√(1 − b²/r²)      r² = b₀² + l²', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            const frac = lut.side.reduce((a, b) => a + b, 0) / N;
            ctx.fillText('b₀ = ' + b0.toFixed(2) + '   camera l = ' + l0.toFixed(1) +
              '   other sky covers ' + (frac * 100).toFixed(0) + '% of the view', 12, h - 12);
          }
        };
      }
    },

    { id: 'handle',
      name: L('Two mouths, one plane', 'Dos bocas, un plano'),
      note: L('Both ends in the same space. Go in one, come out the other.',
              'Los dos extremos en el mismo espacio. Entras por uno, sales por el otro.'),
      params: [
        { key: 'R',    label: L('Mouth radius', 'Radio de boca'), min: 14, max: 60, step: 1, def: 30, unit: 'px' },
        { key: 'pull', label: L('Gravity', 'Gravedad'), min: 0, max: 4, step: 0.1, def: 1.6 },
        { key: 'rays', label: L('Rays', 'Rayos'), min: 1, max: 40, step: 1, def: 18 }
      ],
      make(w, h) {
        // Un asa: al plano se le quitan dos discos y se pegan sus bordes.
        // Los dos discos son EL MISMO lugar, así que cruzar el borde de uno es
        // salir por el otro. La topología cambia; el plano de afuera sigue plano.
        let rays = [], A = [0, 0], B = [0, 0], flash = 0;
        const spawn = (w, h) => ({
          p: [Math.random() * w, -10],
          v: (() => { const a = Math.PI * (0.25 + Math.random() * 0.5); return [Math.cos(a) * 2.2, Math.sin(a) * 2.2]; })(),
          tr: [], hops: 0
        });
        return {
          reset() { rays = []; flash = 0; },
          step(ctx, w, h, t, acc, P, M) {
            const R = P.R;
            A = [w * 0.30, h * 0.58];
            B = M.in ? [M.x, M.y] : [w * 0.72, h * 0.40];
            const mouths = [A, B];

            // Deformación de la rejilla: el MISMO campo que curva los rayos.
            // No es decoración, es la deflexión dibujada sobre las líneas.
            const warp = (x, y) => {
              let ox = x, oy = y;
              for (const m of mouths) {
                const dx = x - m[0], dy = y - m[1], d = Math.hypot(dx, dy) + 1;
                const s = Math.min(R * 1.15, (R * R * P.pull * 0.6) / d);
                ox -= (dx / d) * s; oy -= (dy / d) * s;
              }
              return [ox, oy];
            };
            const STEP = 34;
            ctx.strokeStyle = `rgba(${acc},0.16)`; ctx.lineWidth = 1;
            for (let gx = -STEP; gx <= w + STEP; gx += STEP) {
              ctx.beginPath();
              for (let gy = -STEP; gy <= h + STEP; gy += STEP / 3) {
                const q = warp(gx, gy); gy === -STEP ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]);
              }
              ctx.stroke();
            }
            for (let gy = -STEP; gy <= h + STEP; gy += STEP) {
              ctx.beginPath();
              for (let gx = -STEP; gx <= w + STEP; gx += STEP / 3) {
                const q = warp(gx, gy); gx === -STEP ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]);
              }
              ctx.stroke();
            }

            // Rayos: caen hacia las bocas por gravedad y cruzan al tocar el borde
            while (rays.length < (P.rays | 0)) rays.push(spawn(w, h));
            if (rays.length > (P.rays | 0)) rays.length = P.rays | 0;

            for (const r of rays) {
              for (let s = 0; s < 2; s++) {
                for (const m of mouths) {
                  const dx = m[0] - r.p[0], dy = m[1] - r.p[1], d = Math.hypot(dx, dy) + 4;
                  const a = (P.pull * R * R * 0.02) / (d * d);
                  r.v[0] += (dx / d) * a; r.v[1] += (dy / d) * a;
                }
                r.p[0] += r.v[0] * 0.5; r.p[1] += r.v[1] * 0.5;

                // El cruce: si entra en un disco, sale por el otro conservando
                // la dirección. Los dos bordes son el mismo círculo pegado.
                for (let k = 0; k < 2; k++) {
                  const m = mouths[k], o = mouths[1 - k];
                  if (Math.hypot(r.p[0] - m[0], r.p[1] - m[1]) < R) {
                    const sp = Math.hypot(r.v[0], r.v[1]) || 1;
                    const ux = r.v[0] / sp, uy = r.v[1] / sp;
                    r.p[0] = o[0] + ux * (R + 1.5);
                    r.p[1] = o[1] + uy * (R + 1.5);
                    r.tr.push(null);                    // corta la estela: no cruzó el plano
                    r.hops++; flash = 1;
                    break;
                  }
                }
              }
              r.tr.push([r.p[0], r.p[1]]);
              if (r.tr.length > 190) r.tr.shift();
              if (r.p[0] < -60 || r.p[0] > w + 60 || r.p[1] < -60 || r.p[1] > h + 60) {
                const n = spawn(w, h); r.p = n.p; r.v = n.v; r.tr = []; r.hops = 0;
              }
              // Estela, con el corte donde ocurrió el salto
              ctx.lineWidth = 1;
              for (let i = 1; i < r.tr.length; i++) {
                if (!r.tr[i] || !r.tr[i - 1]) continue;
                ctx.strokeStyle = `rgba(${acc},${((i / r.tr.length) * (r.hops ? 0.75 : 0.4)).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(r.tr[i - 1][0], r.tr[i - 1][1]);
                ctx.lineTo(r.tr[i][0], r.tr[i][1]);
                ctx.stroke();
              }
              ctx.fillStyle = `rgba(${acc},0.95)`;
              ctx.beginPath(); ctx.arc(r.p[0], r.p[1], 2, 0, TAU); ctx.fill();
            }

            // Las bocas. El arco tenue recuerda que son el mismo sitio.
            flash *= 0.92;
            ctx.strokeStyle = `rgba(${acc},${(0.12 + flash * 0.3).toFixed(2)})`;
            ctx.setLineDash([4, 7]); ctx.lineWidth = 1;
            ctx.beginPath();
            const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
            ctx.moveTo(A[0], A[1]);
            ctx.quadraticCurveTo(mx, my - Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.22, B[0], B[1]);
            ctx.stroke(); ctx.setLineDash([]);

            mouths.forEach((m, i) => {
              const g = ctx.createRadialGradient(m[0], m[1], R * 0.2, m[0], m[1], R);
              g.addColorStop(0, 'rgba(0,0,0,0.95)');
              g.addColorStop(1, `rgba(${acc},0.10)`);
              ctx.fillStyle = g;
              ctx.beginPath(); ctx.arc(m[0], m[1], R, 0, TAU); ctx.fill();
              ctx.strokeStyle = `rgba(${acc},${(0.75 + flash * 0.25).toFixed(2)})`;
              ctx.lineWidth = 1.6;
              ctx.beginPath(); ctx.arc(m[0], m[1], R, 0, TAU); ctx.stroke();
              ctx.font = '11px monospace'; ctx.fillStyle = `rgba(${acc},0.8)`;
              ctx.fillText(i ? 'B' : 'A', m[0] - 3, m[1] - R - 8);
            });

            const sep = Math.hypot(B[0] - A[0], B[1] - A[1]);
            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('∂A ≡ ∂B      the two circles are the same circle', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('separation ' + sep.toFixed(0) + 'px   through the handle 0px', 12, h - 12);
          }
        };
      }
    },

    { id: 'curvature',
      name: L('Gravity is geometry', 'La gravedad es geometría'),
      note: L('A lattice of space with a mass in it. Move the mass and watch the grid answer.',
              'Una retícula de espacio con una masa dentro. Mueve la masa y mira responder a la rejilla.'),
      params: [
        { key: 'mass', label: L('Mass', 'Masa'), min: 0, max: 3, step: 0.05, def: 1.2 },
        { key: 'div',  label: L('Lattice divisions', 'Divisiones de la retícula'), min: 3, max: 8, step: 1, def: 6 },
        { key: 'tilt', label: L('View tilt', 'Inclinación de la vista'), min: 0.05, max: 1.1, step: 0.02, def: 0.42 }
      ],
      make() {
        let yaw = 0.6;
        return {
          reset() { yaw = 0.6; },
          step(ctx, w, h, t, acc, P, M) {
            const N = P.div | 0, SUB = 8;          // SUB: puntos por tramo, para que la curva se vea
            const tilt = P.tilt;
            yaw += 0.0022;
            // La masa se mueve con el cursor dentro de la retícula
            const mx = M.in ? (M.x / w - 0.5) * 2.1 : Math.cos(t * 0.35) * 0.5;
            const my = M.in ? (M.y / h - 0.5) * -2.1 : Math.sin(t * 0.5) * 0.4;
            const Mp = [mx, my, 0];
            const rgb = acc.split(',').map(Number);

            // Desplazamiento de cada vértice hacia la masa. La caída 1/r² con un
            // núcleo suave evita que la rejilla se invierta sobre sí misma cerca
            // del centro, que es donde la aproximación deja de valer igual.
            const K = P.mass * 0.30;
            const warp = p => {
              const dx = p[0] - Mp[0], dy = p[1] - Mp[1], dz = p[2] - Mp[2];
              const r2 = dx * dx + dy * dy + dz * dz;
              const r = Math.sqrt(r2) + 1e-4;
              const s = Math.min(r * 0.75, K / (r2 + 0.05));
              return [p[0] - (dx / r) * s, p[1] - (dy / r) * s, p[2] - (dz / r) * s, r];
            };

            // Proyección: giro en yaw, inclinación, y perspectiva suave
            const cy = Math.cos(yaw), sy = Math.sin(yaw);
            const ct = Math.cos(tilt), st = Math.sin(tilt);
            const S = Math.min(w, h) * 0.30, ox = w / 2, oy = h / 2;
            const proj = q => {
              const x = q[0] * cy - q[2] * sy;
              const z = q[0] * sy + q[2] * cy;
              const y = q[1] * ct - z * st;
              const zz = q[1] * st + z * ct;
              const per = 1 / (1 + zz * 0.22);         // perspectiva
              return [ox + x * S * per, oy - y * S * per, zz, per];
            };

            // Todas las líneas de la retícula, en los tres ejes
            const lines = [];
            const at = (u, i, j) => {
              const a = -1 + (2 * i) / N, b = -1 + (2 * j) / N;
              return u === 0 ? [null, a, b] : u === 1 ? [a, null, b] : [a, b, null];
            };
            for (let u = 0; u < 3; u++) {
              for (let i = 0; i <= N; i++) {
                for (let j = 0; j <= N; j++) {
                  const tpl = at(u, i, j), pts = [];
                  let depth = 0, near = 0;
                  for (let k = 0; k <= N * SUB; k++) {
                    const v = -1 + (2 * k) / (N * SUB);
                    const p = tpl.slice(); p[u] = v;
                    const q = warp(p);
                    const pr = proj(q);
                    pts.push(pr);
                    depth += pr[2];
                    near = Math.max(near, 1 / (1 + q[3] * q[3] * 2.2));
                  }
                  lines.push({ pts, depth: depth / pts.length, near });
                }
              }
            }
            // De atrás hacia adelante, para que la profundidad se lea
            lines.sort((a, b) => b.depth - a.depth);

            for (const L of lines) {
              // Cerca de la masa la línea se aclara hacia blanco: el mismo
              // recurso del gradiente azul→verde de las ilustraciones clásicas
              const n = Math.min(1, L.near * 1.5);
              const r = rgb[0] + (245 - rgb[0]) * n;
              const g = rgb[1] + (250 - rgb[1]) * n;
              const b = rgb[2] + (255 - rgb[2]) * n;
              const fog = Math.max(0.10, Math.min(0.75, 0.5 - L.depth * 0.16));
              ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${(fog * (0.45 + n * 0.55)).toFixed(3)})`;
              ctx.lineWidth = 0.8 + n * 1.2;
              ctx.beginPath();
              L.pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
              ctx.stroke();
            }

            // La masa
            const pm = proj([Mp[0], Mp[1], Mp[2], 0]);
            const R = (7 + P.mass * 5) * pm[3];
            const gg = ctx.createRadialGradient(pm[0], pm[1], 0, pm[0], pm[1], R * 3);
            gg.addColorStop(0, `rgba(${nucleo()},0.95)`);
            gg.addColorStop(0.35, `rgba(${acc},0.5)`);
            gg.addColorStop(1, `rgba(${acc},0)`);
            ctx.fillStyle = gg;
            ctx.beginPath(); ctx.arc(pm[0], pm[1], R * 3, 0, TAU); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(pm[0], pm[1], R * 0.5, 0, TAU); ctx.fill();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('no force is drawn here — only distances', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('mass ' + P.mass.toFixed(2) + '     lattice ' + N + '³', 12, h - 12);
          }
        };
      }
    },

    { id: 'doubleslit',
      name: L('Double slit', 'Doble rendija'),
      note: L('Nobody watching, and fringes appear. Put an observer at the slits and they do not.',
              'Nadie mirando, y aparecen franjas. Pon un observador en las rendijas y no aparecen.'),
      params: [
        { key: 'watch', label: L('Observer at the slits', 'Observador en las rendijas'), min: 0, max: 1, step: 1, def: 0 },
        { key: 'eff',   label: L('Detector reliability', 'Fiabilidad del detector'), min: 0, max: 1, step: 0.01, def: 1 },
        { key: 'sep',   label: L('Slit separation d', 'Separación d'), min: 20, max: 140, step: 2, def: 62, unit: 'px' },
        { key: 'lam',   label: L('Wavelength λ', 'Longitud de onda λ'), min: 8, max: 40, step: 1, def: 18, unit: 'px' }
      ],
      make(w, h) {
        const BINS = 150;
        let bins = new Float32Array(BINS), peak = 1, hits = [], lastKey = '';
        let seen = [0, 0], glow = [0, 0];
        return {
          reset() { bins = new Float32Array(BINS); peak = 1; hits = []; seen = [0, 0]; },
          step(ctx, w, h, t, acc, P, M) {
            // El observador es un interruptor. Su fiabilidad decide cuánta
            // información de camino existe: un detector perfecto da D = 1.
            const on = P.watch > 0.5;
            const eff = M.in ? Math.min(1, Math.max(0, M.x / w)) : P.eff;
            const D = on ? eff : 0;
            const V = Math.sqrt(Math.max(0, 1 - D * D));   // complementariedad V² + D² ≤ 1
            const key = [P.sep, P.lam, on ? 1 : 0, D.toFixed(2)].join('|');
            if (key !== lastKey) { lastKey = key; bins = new Float32Array(BINS); peak = 1; hits = []; seen = [0, 0]; }

            const bx = w * 0.34, sx = w * 0.90, cy = h / 2;
            const s1 = cy - P.sep / 2, s2 = cy + P.sep / 2;
            const k = TAU / P.lam;

            const amp = (x, y, sy) => {
              const dx = x - bx, dy = y - sy, r = Math.hypot(dx, dy) + 6;
              const a = 26 / Math.sqrt(r);
              return [a * Math.cos(k * r), a * Math.sin(k * r)];
            };
            // Con el observador apagado el término cruzado entra completo y hay
            // franjas. Encendido desaparece y quedan dos manchas sumadas.
            const inten = (x, y) => {
              const A = amp(x, y, s1), B = amp(x, y, s2);
              const i1 = A[0] * A[0] + A[1] * A[1], i2 = B[0] * B[0] + B[1] * B[1];
              return i1 + i2 + 2 * V * (A[0] * B[0] + A[1] * B[1]);
            };

            const STEP = 7;
            for (let x = bx + STEP; x < sx; x += STEP) {
              for (let y = STEP / 2; y < h; y += STEP) {
                const I = Math.min(1, inten(x, y) / 26);
                if (I < 0.05) continue;
                ctx.fillStyle = `rgba(${acc},${(0.06 + I * 0.5).toFixed(3)})`;
                ctx.beginPath(); ctx.arc(x, y, 0.5 + I * 1.9, 0, TAU); ctx.fill();
              }
            }
            ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
            for (const sy of [s1, s2]) {
              for (let n = 0; n < 7; n++) {
                const rr = ((t * 34 + n * P.lam * 2.4) % (sx - bx));
                ctx.beginPath(); ctx.arc(bx, sy, rr, -1.15, 1.15); ctx.stroke();
              }
            }

            ctx.strokeStyle = `rgba(${acc},0.8)`; ctx.lineWidth = 2.5;
            const gap = 7;
            [[0, s1 - gap], [s1 + gap, s2 - gap], [s2 + gap, h]].forEach(([a, b]) => {
              ctx.beginPath(); ctx.moveTo(bx, a); ctx.lineTo(bx, b); ctx.stroke();
            });

            // Detecciones. Con el observador encendido, además se registra por
            // cuál rendija pasó: eso es la información que mata las franjas.
            let Imax = 0;
            for (let b = 0; b < BINS; b++) Imax = Math.max(Imax, inten(sx, (b + 0.5) * h / BINS));
            for (let q = 0; q < 3; q++) {
              for (let tries = 0; tries < 14; tries++) {
                const y = Math.random() * h;
                if (inten(sx, y) > Math.random() * Imax) {
                  const b = Math.min(BINS - 1, Math.floor((y / h) * BINS));
                  bins[b]++; peak = Math.max(peak, bins[b]);
                  hits.push({ y, life: 1 });
                  if (on) {
                    // Rendija más probable dado dónde aterrizó, si el detector
                    // acierta; con fiabilidad < 1 a veces se equivoca.
                    let which = y < cy ? 0 : 1;
                    if (Math.random() > eff) which = 1 - which;
                    seen[which]++; glow[which] = 1;
                  }
                  break;
                }
              }
            }
            if (hits.length > 260) hits.splice(0, hits.length - 260);

            // El observador: dos detectores que destellan al registrar un paso
            glow[0] *= 0.90; glow[1] *= 0.90;
            if (on) {
              [s1, s2].forEach((sy, i) => {
                ctx.strokeStyle = `rgba(${neutro()},${(0.3 + glow[i] * 0.7).toFixed(2)})`;
                ctx.lineWidth = 1.2 + glow[i];
                ctx.beginPath(); ctx.arc(bx + 15, sy, 7, 0, TAU); ctx.stroke();
                ctx.font = '10px monospace';
                ctx.fillStyle = `rgba(${neutro()},${(0.45 + glow[i] * 0.55).toFixed(2)})`;
                ctx.fillText(String(seen[i]), bx + 26, sy + 4);
              });
            }

            const bw = h / BINS;
            for (let b = 0; b < BINS; b++) {
              if (!bins[b]) continue;
              const L = (bins[b] / peak) * (w * 0.085);
              ctx.fillStyle = `rgba(${acc},${(0.25 + 0.6 * (bins[b] / peak)).toFixed(3)})`;
              ctx.fillRect(sx, b * bw, L, bw - 0.5);
            }
            ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
            hits.forEach(hh => {
              hh.life *= 0.985;
              ctx.fillStyle = `rgba(${neutro()},${(hh.life * 0.8).toFixed(3)})`;
              ctx.beginPath(); ctx.arc(sx, hh.y, 1.6, 0, TAU); ctx.fill();
            });

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('V² + D² ≤ 1      knowing the path costs you the fringes', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText((on ? 'observer ON   D = ' + D.toFixed(2) : 'nobody watching   D = 0') +
              '    V = ' + V.toFixed(2) + '    ' +
              (V > 0.15 ? 'interference' : 'two bands, no fringes'), 12, h - 12);
          }
        };
      }
    },

    { id: 'duality',
      name: L('Wave or particle, your choice', 'Onda o partícula, tú eliges'),
      note: L('One apparatus. Slide the second mirror in and out, and the photon changes what it was.',
              'Un aparato. Mete y saca el segundo espejo, y el fotón cambia lo que fue.'),
      params: [
        { key: 'bs2',  label: L('Second splitter in place', 'Segundo divisor puesto'), min: 0, max: 1, step: 1, def: 1 },
        { key: 'late', label: L('Decide after entry', 'Decidir tras la entrada'), min: 0, max: 1, step: 1, def: 0 },
        { key: 'phase', label: L('Phase φ', 'Fase φ'), min: 0, max: 360, step: 1, def: 60, unit: '°' }
      ],
      make() {
        const NB = 72;                                  // casillas de fase para la curva
        let curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
        let shots = [], lastBS = -1, early = 0, lateN = 0, earlyD0 = 0, lateD0 = 0;
        return {
          reset() { curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
                    shots = []; early = lateN = earlyD0 = lateD0 = 0; },
          step(ctx, w, h, t, acc, P, M) {
            const deg = M.in ? (M.x / w) * 360 : P.phase;
            const phi = deg * Math.PI / 180;
            const hasBS2 = P.bs2 > 0.5, delayed = P.late > 0.5;
            if (hasBS2 !== (lastBS === 1)) {             // cambiar de modo limpia la curva
              lastBS = hasBS2 ? 1 : 0;
              curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
              early = lateN = earlyD0 = lateD0 = 0;
            }

            // ── Geometría. Tres franjas que no se pisan:
            //    0–0.12h texto · 0.14–0.62h aparato · 0.66–0.96h curva
            //    D1 sale hacia ABAJO para dejar el techo libre al encabezado.
            const SRC = [w * 0.06, h * 0.20], BS1 = [w * 0.20, h * 0.20];
            const M1  = [w * 0.20, h * 0.48], M2  = [w * 0.52, h * 0.20];
            const BS2 = [w * 0.52, h * 0.48];
            const D0  = [w * 0.76, h * 0.48], D1 = [w * 0.52, h * 0.62];
            const line = (p1, p2, al, lw) => {
              ctx.strokeStyle = `rgba(${acc},${al})`; ctx.lineWidth = lw || 1.4;
              ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
            };
            line(SRC, BS1, 0.4);
            line(BS1, M2, 0.3); line(M2, BS2, 0.3);       // brazo A: derecha, abajo
            line(BS1, M1, 0.3); line(M1, BS2, 0.3);       // brazo B: abajo, derecha
            line(BS2, D0, 0.3); line(BS2, D1, 0.3);

            ctx.font = '10px monospace';
            const tag = (x, y, str, al) => {
              ctx.fillStyle = `rgba(${acc},${al || 0.55})`;
              ctx.fillText(str, x, y);
            };
            const mirror = p => { ctx.strokeStyle = `rgba(${acc},0.75)`; ctx.lineWidth = 3;
              ctx.beginPath(); ctx.moveTo(p[0] - 10, p[1] - 10); ctx.lineTo(p[0] + 10, p[1] + 10); ctx.stroke(); };
            const splitter = (p, on) => {
              ctx.strokeStyle = on ? `rgba(${acc},0.95)` : `rgba(${acc},0.16)`;
              ctx.lineWidth = on ? 2.6 : 1.4;
              if (!on) ctx.setLineDash([3, 4]);
              ctx.beginPath(); ctx.moveTo(p[0] - 11, p[1] + 11); ctx.lineTo(p[0] + 11, p[1] - 11); ctx.stroke();
              ctx.setLineDash([]);
            };
            mirror(M1); mirror(M2); splitter(BS1, true); splitter(BS2, hasBS2);

            // Rótulos: todos POR FUERA del rectángulo, ninguno cruza un camino
            ctx.fillStyle = `rgba(${acc},0.9)`;
            ctx.beginPath(); ctx.arc(SRC[0], SRC[1], 4, 0, TAU); ctx.fill();
            tag(SRC[0] - 20, SRC[1] - 14, 'source', 0.7);
            tag(BS1[0] - 46, BS1[1] - 16, 'splitter 1');
            tag(M2[0] - 16, M2[1] - 16, 'mirror');
            tag(M1[0] - 52, M1[1] + 4, 'mirror');
            tag(BS2[0] + 16, BS2[1] + 26, hasBS2 ? 'splitter 2' : 'splitter 2 · REMOVED', hasBS2 ? 0.55 : 0.95);
            // Los dos brazos, nombrados donde hay espacio libre
            tag((BS1[0] + M2[0]) / 2 - 40, BS1[1] - 16, 'path A   φ = ' + deg.toFixed(0) + '°', 0.8);
            tag((M1[0] + BS2[0]) / 2 - 24, M1[1] + 20, 'path B', 0.55);
            // ── Fotones
            if (Math.random() < 0.4) shots.push({ u: 0, arm: Math.random() < 0.5 ? 0 : 1,
                                                  decided: !delayed, bs2: hasBS2, hit: null, wasLate: delayed });
            shots = shots.filter(s => {
              s.u += 0.010;
              if (!s.decided && s.u > 0.55) { s.decided = true; s.bs2 = hasBS2; }
              const u = s.u;
              const dot = (p, a, r) => { ctx.fillStyle = `rgba(${acc},${a})`;
                ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill(); };
              if (u < 0.22) {
                const k = u / 0.22;
                dot([SRC[0] + (BS1[0] - SRC[0]) * k, SRC[1]], 0.95, 3);
              } else if (u < 0.72) {
                const k = (u - 0.22) / 0.5;
                const arms = (s.decided && !s.bs2) ? [s.arm] : [0, 1];
                for (const a of arms) {
                  // A: derecha por arriba y luego baja. B: baja y luego derecha.
                  const p = a === 0
                    ? (k < 0.5 ? [BS1[0] + (M2[0] - BS1[0]) * (k / 0.5), BS1[1]]
                               : [M2[0], M2[1] + (BS2[1] - M2[1]) * ((k - 0.5) / 0.5)])
                    : (k < 0.5 ? [BS1[0], BS1[1] + (M1[1] - BS1[1]) * (k / 0.5)]
                               : [M1[0] + (BS2[0] - M1[0]) * ((k - 0.5) / 0.5), M1[1]]);
                  arms.length === 1 ? dot(p, 0.95, 3) : dot(p, 0.45, 2.4);
                }
              } else {
                if (s.hit === null) {
                  const pd0 = s.bs2 ? Math.cos(phi / 2) ** 2 : 0.5;
                  s.hit = Math.random() < pd0 ? 0 : 1;
                  const b = Math.min(NB - 1, Math.floor((deg / 360) * NB));
                  curve[b].n++; if (s.hit === 0) curve[b].d0++;
                  if (s.wasLate) { lateN++; if (!s.hit) lateD0++; }
                  else { early++; if (!s.hit) earlyD0++; }
                }
                const k = (u - 0.72) / 0.28;
                dot(s.hit === 0 ? [BS2[0] + (D0[0] - BS2[0]) * k, D0[1]]
                                : [D1[0], BS2[1] + (D1[1] - BS2[1]) * k], 0.95, 3);
              }
              return u < 1;
            });

            [[D0, 'D0', 18, 4], [D1, 'D1', -8, 26]].forEach(([p, lab, dx, dy]) => {
              ctx.strokeStyle = `rgba(${acc},0.8)`; ctx.lineWidth = 1.6;
              ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, TAU); ctx.stroke();
              ctx.font = '11px monospace'; ctx.fillStyle = `rgba(${acc},0.9)`;
              ctx.fillText(lab, p[0] + dx, p[1] + dy);
            });

            // ── La curva: es lo que hace visible la diferencia
            const gx = w * 0.08, gw = w * 0.86, gy = h * 0.95, gh = h * 0.27;
            ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
            [0, 0.5, 1].forEach(v => { const Y = gy - v * gh;
              ctx.beginPath(); ctx.moveTo(gx, Y); ctx.lineTo(gx + gw, Y); ctx.stroke(); });
            ctx.font = '10px monospace'; ctx.fillStyle = `rgba(${acc},0.45)`;
            ctx.fillText('1', gx - 12, gy - gh + 4); ctx.fillText('½', gx - 12, gy - gh / 2 + 4);
            ctx.fillText('0', gx - 12, gy + 4);
            ctx.fillText('P(D0) vs φ', gx, gy - gh - 8);
            // Predicción
            ctx.strokeStyle = `rgba(${acc},0.45)`; ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 5]); ctx.beginPath();
            for (let i = 0; i <= 180; i++) {
              const d = (i / 180) * 360, v = hasBS2 ? Math.cos((d * Math.PI / 180) / 2) ** 2 : 0.5;
              const X = gx + (i / 180) * gw, Y = gy - v * gh;
              i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
            }
            ctx.stroke(); ctx.setLineDash([]);
            // Medido
            ctx.fillStyle = `rgba(${acc},0.95)`;
            curve.forEach((c, i) => {
              if (c.n < 3) return;
              const X = gx + ((i + 0.5) / NB) * gw, Y = gy - (c.d0 / c.n) * gh;
              ctx.beginPath(); ctx.arc(X, Y, 2.4, 0, TAU); ctx.fill();
            });
            const mx = gx + (deg / 360) * gw;
            ctx.strokeStyle = `rgba(${acc},0.35)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mx, gy - gh); ctx.lineTo(mx, gy); ctx.stroke();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText(hasBS2 ? 'WAVE — both routes contribute, φ decides the detector'
                                : 'PARTICLE — the detector names the route, φ does nothing', 118, 22);
            const fE = early ? earlyD0 / early : 0, fL = lateN ? lateD0 / lateN : 0;
            ctx.fillStyle = `rgba(${acc},0.9)`;
            ctx.fillText('decided early  ' + (early ? fE.toFixed(3) : '—') +
                         '     decided mid-flight  ' + (lateN ? fL.toFixed(3) : '—') +
                         '     predicted ' + (hasBS2 ? (Math.cos(phi / 2) ** 2).toFixed(3) : '0.500'), 118, 40);
          }
        };
      }
    },
    { id: 'entropy',
      name: L('Entropy', 'Entropía'),
      note: L('Gas released in a corner. Reverse every velocity and watch it go home.',
              'Un gas soltado en una esquina. Invierte todas las velocidades y míralo volver.'),
      params: [
        { key: 'n',    label: L('Particles', 'Partículas'), min: 4, max: 600, step: 1, def: 240 },
        { key: 'cells', label: L('Coarse-graining', 'Grano de la descripción'), min: 2, max: 16, step: 1, def: 8 },
        { key: 'rev',  label: L('Reverse time', 'Invertir el tiempo'), min: 0, max: 1, step: 1, def: 0 }
      ],
      make(w, h) {
        // Partículas sin colisiones entre sí: es una expansión libre de gas
        // ideal. Sin colisiones la dinámica es exactamente reversible, que es
        // justo lo que hace falta para el argumento de Loschmidt.
        let P = [], hist = [], lastRev = 0, lastN = 0, boxH = 0;
        const seed = (n, w, h) => {
          P = [];
          for (let i = 0; i < n; i++) {
            const a = Math.random() * TAU, sp = 0.8 + Math.random() * 1.6;
            P.push({ x: w * 0.06 + Math.random() * w * 0.16,
                     y: h * 0.10 + Math.random() * h * 0.16,
                     vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
          }
          hist = [];
        };
        return {
          reset() { lastN = 0; },
          step(ctx, w, h, t, acc, P0, M) {
            boxH = h * 0.66;
            const n = P0.n | 0, C = P0.cells | 0;
            if (n !== lastN) { seed(n, w, boxH); lastN = n; }
            // Cambiar el control invierte todas las velocidades a la vez
            if (P0.rev !== lastRev) { lastRev = P0.rev; for (const p of P) { p.vx = -p.vx; p.vy = -p.vy; } }

            for (const p of P) {
              // El cursor empuja: bajar la entropía localmente cuesta trabajo
              if (M.in && M.y < boxH) {
                const dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy) + 1;
                if (d < 90) { const g = (1 - d / 90) * 0.5; p.vx += (dx / d) * g; p.vy += (dy / d) * g; }
              }
              p.x += p.vx; p.y += p.vy;
              if (p.x < 2) { p.x = 2; p.vx = -p.vx; }
              if (p.x > w - 2) { p.x = w - 2; p.vx = -p.vx; }
              if (p.y < 2) { p.y = 2; p.vy = -p.vy; }
              if (p.y > boxH - 2) { p.y = boxH - 2; p.vy = -p.vy; }
            }

            // Entropía de grano grueso: contar ocupación por celda.
            // S = −Σ pᵢ·ln pᵢ, normalizada por ln(C²) para que el máximo sea 1.
            const cnt = new Float64Array(C * C);
            for (const p of P) {
              const cx = Math.min(C - 1, (p.x / w * C) | 0);
              const cy = Math.min(C - 1, (p.y / boxH * C) | 0);
              cnt[cy * C + cx]++;
            }
            let S = 0;
            for (let i = 0; i < cnt.length; i++) {
              if (!cnt[i]) continue;
              const q = cnt[i] / P.length;
              S -= q * Math.log(q);
            }
            S /= Math.log(C * C);
            hist.push(S);
            if (hist.length > w * 0.86) hist.shift();

            // Celdas: el sombreado ES la descripción macroscópica
            const cw = w / C, ch = boxH / C;
            for (let i = 0; i < C; i++) {
              for (let jj = 0; jj < C; jj++) {
                const q = cnt[jj * C + i] / Math.max(1, P.length);
                if (q <= 0) continue;
                ctx.fillStyle = `rgba(${acc},${Math.min(0.30, q * 3.2).toFixed(3)})`;
                ctx.fillRect(i * cw, jj * ch, cw, ch);
              }
            }
            ctx.strokeStyle = `rgba(${acc},0.10)`; ctx.lineWidth = 1;
            for (let i = 1; i < C; i++) {
              ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, boxH); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(0, i * ch); ctx.lineTo(w, i * ch); ctx.stroke();
            }
            ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1.2;
            ctx.strokeRect(1, 1, w - 2, boxH - 2);

            ctx.fillStyle = `rgba(${acc},0.95)`;
            for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, TAU); ctx.fill(); }

            // Curva de S en el tiempo
            const gy = h * 0.90, gh = h * 0.17, gx = w * 0.07;
            ctx.strokeStyle = `rgba(${acc},0.2)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx + w * 0.86, gy - gh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + w * 0.86, gy); ctx.stroke();
            ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.5;
            ctx.beginPath();
            hist.forEach((v, i) => { const X = gx + i, Y = gy - v * gh;
              i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
            ctx.stroke();
            ctx.font = '10px monospace'; ctx.fillStyle = `rgba(${acc},0.45)`;
            ctx.fillText('S max', gx - 4, gy - gh - 4);

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('S = −Σ pᵢ ln pᵢ      the equations do not know which way is forward', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('S / S_max = ' + S.toFixed(3) + '     N = ' + P.length +
              '     cells ' + C + '×' + C, 12, h - 12);
          }
        };
      }
    },

    { id: 'ising',
      name: L('Ising model', 'Modelo de Ising'),
      note: L('Spins that copy their neighbours. Below a critical temperature they all agree.',
              'Espines que copian a sus vecinos. Bajo cierta temperatura todos se ponen de acuerdo.'),
      params: [
        { key: 'T',  label: L('Temperature T', 'Temperatura T'), min: 0.4, max: 5, step: 0.02, def: 2.6 },
        { key: 'B',  label: L('External field', 'Campo externo'), min: -0.5, max: 0.5, step: 0.01, def: 0 },
        { key: 'sw', label: L('Sweeps per frame', 'Barridos por frame'), min: 1, max: 40, step: 1, def: 12 }
      ],
      make() {
        const TC = 2 / Math.log(1 + Math.SQRT2);      // 2.269..., exacta (Onsager)
        let N = 0, sp = null, hist = [];
        // Arranca ORDENADO a propósito. Desde el azar, a baja temperatura el
        // sistema congela dominios que tardan enormidades en fusionarse y |M|
        // se queda cerca de cero: el número mentiría sobre la transición.
        const init = n => { N = n; sp = new Int8Array(N * N).fill(1); hist = []; };
        return {
          reset() { init(N || 110); },
          step(ctx, w, h, t, acc, P, M) {
            const n = Math.min(140, Math.max(40, Math.floor(Math.min(w, h) / 4)));
            if (n !== N) init(n);
            const T = M.in ? 0.4 + (M.x / w) * 4.6 : P.T;

            // Metropolis: propone dar vuelta un espín y acepta con exp(−ΔE/T).
            // Toda la transición de fase sale de esa única exponencial.
            const flips = (P.sw | 0) * N * N / 6;
            for (let f = 0; f < flips; f++) {
              const i = (Math.random() * N) | 0, j = (Math.random() * N) | 0, k = j * N + i;
              const s = sp[k];
              const nb = sp[j * N + ((i + 1) % N)] + sp[j * N + ((i - 1 + N) % N)]
                       + sp[((j + 1) % N) * N + i] + sp[((j - 1 + N) % N) * N + i];
              const dE = 2 * s * (nb + P.B);
              if (dE <= 0 || Math.random() < Math.exp(-dE / T)) sp[k] = -s;
            }

            let m = 0;
            for (let i = 0; i < sp.length; i++) m += sp[i];
            m /= sp.length;
            hist.push(Math.abs(m));
            if (hist.length > 240) hist.shift();

            // Dibujo de la rejilla
            const S = Math.min(w, h) * 0.74, ox = (w - S) / 2, oy = h * 0.06, cs = S / N;
            const img = ctx.createImageData(N, N), px = img.data;
            const rgb = acc.split(',').map(Number);
            for (let k = 0; k < sp.length; k++) {
              const o = k * 4, up = sp[k] > 0;
              px[o] = up ? rgb[0] : 12; px[o+1] = up ? rgb[1] : 12; px[o+2] = up ? rgb[2] : 14; px[o+3] = 255;
            }
            const off = document.createElement('canvas');
            off.width = off.height = N; off.getContext('2d').putImageData(img, 0, 0);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(off, ox, oy, S, S);
            ctx.strokeStyle = `rgba(${acc},0.4)`; ctx.lineWidth = 1;
            ctx.strokeRect(ox, oy, S, S);

            // Magnetización en el tiempo y dónde estás respecto a Tc
            const gx = ox, gw = S, gy = h * 0.95, gh = h * 0.10;
            ctx.strokeStyle = `rgba(${acc},0.18)`;
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
            ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.4;
            ctx.beginPath();
            hist.forEach((v, i) => { const X = gx + (i / 240) * gw, Y = gy - v * gh;
              i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
            ctx.stroke();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('T_c = 2/ln(1+√2) = ' + TC.toFixed(3) + '   (exact, Onsager 1944)', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('T = ' + T.toFixed(2) + '   |M| = ' + Math.abs(m).toFixed(3) + '   ' +
              (T < TC ? 'ordered' : 'disordered'), 12, h - 12);
          }
        };
      }
    },

    { id: 'grayscott',
      name: L('Reaction and diffusion', 'Reacción y difusión'),
      note: L('Two chemicals, four numbers. Spots, stripes, mazes, things that divide.',
              'Dos químicos, cuatro números. Manchas, rayas, laberintos, cosas que se dividen.'),
      params: [
        { key: 'F', label: L('Feed F', 'Alimentación F'), min: 0.01, max: 0.08, step: 0.001, def: 0.037 },
        { key: 'k', label: L('Kill k', 'Remoción k'), min: 0.045, max: 0.07, step: 0.0005, def: 0.06 },
        { key: 'it', label: L('Steps per frame', 'Pasos por frame'), min: 1, max: 14, step: 1, def: 6 }
      ],
      make() {
        const N = 150;
        let U = null, V = null, U2 = null, V2 = null;
        const seed = () => {
          U = new Float32Array(N * N).fill(1); V = new Float32Array(N * N);
          U2 = new Float32Array(N * N); V2 = new Float32Array(N * N);
          for (let q = 0; q < 22; q++) {
            const cx = 10 + ((Math.random() * (N - 20)) | 0), cy = 10 + ((Math.random() * (N - 20)) | 0);
            for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
              const k = (cy + dy) * N + (cx + dx);
              U[k] = 0.5; V[k] = 0.25;
            }
          }
        };
        seed();
        return {
          reset() { seed(); },
          step(ctx, w, h, t, acc, P, M) {
            if (M.in) {                                  // sembrar con el cursor
              const S0 = Math.min(w, h) * 0.8, ox0 = (w - S0) / 2, oy0 = (h - S0) / 2;
              const cx = ((M.x - ox0) / S0 * N) | 0, cy = ((M.y - oy0) / S0 * N) | 0;
              for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
                const x = cx + dx, y = cy + dy;
                if (x > 0 && x < N - 1 && y > 0 && y < N - 1) { U[y * N + x] = 0.5; V[y * N + x] = 0.25; }
              }
            }
            const Du = 0.16, Dv = 0.08, F = P.F, kk = P.k;
            for (let s = 0; s < (P.it | 0); s++) {
              for (let y = 1; y < N - 1; y++) {
                for (let x = 1; x < N - 1; x++) {
                  const i = y * N + x;
                  // Laplaciano de 5 puntos
                  const lu = U[i - 1] + U[i + 1] + U[i - N] + U[i + N] - 4 * U[i];
                  const lv = V[i - 1] + V[i + 1] + V[i - N] + V[i + N] - 4 * V[i];
                  const uvv = U[i] * V[i] * V[i];
                  U2[i] = U[i] + Du * lu - uvv + F * (1 - U[i]);
                  V2[i] = V[i] + Dv * lv + uvv - (F + kk) * V[i];
                }
              }
              const tu = U; U = U2; U2 = tu;
              const tv = V; V = V2; V2 = tv;
            }
            const img = ctx.createImageData(N, N), px = img.data;
            const rgb = acc.split(',').map(Number);
            for (let i = 0; i < N * N; i++) {
              const v = Math.min(1, Math.max(0, V[i] * 3.4));
              const o = i * 4;
              px[o] = rgb[0] * v; px[o+1] = rgb[1] * v; px[o+2] = rgb[2] * v; px[o+3] = 255;
            }
            const off = document.createElement('canvas');
            off.width = off.height = N; off.getContext('2d').putImageData(img, 0, 0);
            const S = Math.min(w, h) * 0.8;
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(off, (w - S) / 2, (h - S) / 2, S, S);

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('∂U/∂t = Du∇²U − UV² + F(1−U)      ∂V/∂t = Dv∇²V + UV² − (F+k)V', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('F = ' + F.toFixed(3) + '   k = ' + kk.toFixed(4), 12, h - 12);
          }
        };
      }
    },

    { id: 'boids',
      name: L('Flocking', 'Bandada'),
      note: L('Three local rules and no leader. The flock is not in any of the birds.',
              'Tres reglas locales y ningún líder. La bandada no está en ninguno de los pájaros.'),
      params: [
        { key: 'sep', label: L('Separation', 'Separación'), min: 0, max: 3, step: 0.05, def: 1.4 },
        { key: 'ali', label: L('Alignment', 'Alineación'), min: 0, max: 3, step: 0.05, def: 1 },
        { key: 'coh', label: L('Cohesion', 'Cohesión'), min: 0, max: 3, step: 0.05, def: 0.9 }
      ],
      make(w, h) {
        let B = [];
        const seed = (w, h) => {
          B = [];
          for (let i = 0; i < 220; i++) {
            const a = Math.random() * TAU;
            B.push({ x: Math.random() * w, y: Math.random() * h,
                     vx: Math.cos(a) * 2, vy: Math.sin(a) * 2 });
          }
        };
        seed(w, h);
        return {
          resize(w, h) { seed(w, h); },
          reset() { seed(w, h); },
          step(ctx, w, h, t, acc, P, M) {
            const R = 46, RS = 20;
            for (const b of B) {
              let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0;
              for (const o of B) {
                if (o === b) continue;
                const dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
                if (d2 > R * R) continue;
                n++; cx += o.x; cy += o.y; ax += o.vx; ay += o.vy;
                if (d2 < RS * RS) { const d = Math.sqrt(d2) + 0.01; sx -= dx / d; sy -= dy / d; }
              }
              if (n) {
                cx = cx / n - b.x; cy = cy / n - b.y;                 // cohesión
                ax = ax / n - b.vx; ay = ay / n - b.vy;               // alineación
                const norm = (x, y) => { const d = Math.hypot(x, y) || 1; return [x / d, y / d]; };
                const [c1, c2] = norm(cx, cy), [a1, a2] = norm(ax, ay), [s1, s2] = norm(sx, sy);
                b.vx += c1 * P.coh * 0.05 + a1 * P.ali * 0.09 + s1 * P.sep * 0.13;
                b.vy += c2 * P.coh * 0.05 + a2 * P.ali * 0.09 + s2 * P.sep * 0.13;
              }
              if (M.in) {                                             // el cursor asusta
                const dx = b.x - M.x, dy = b.y - M.y, d = Math.hypot(dx, dy) + 1;
                if (d < 130) { const g = (1 - d / 130) * 0.8; b.vx += (dx / d) * g; b.vy += (dy / d) * g; }
              }
              const sp = Math.hypot(b.vx, b.vy) || 1;
              const cap = 2.6;
              b.vx = (b.vx / sp) * cap; b.vy = (b.vy / sp) * cap;
              b.x = (b.x + b.vx + w) % w; b.y = (b.y + b.vy + h) % h;
            }
            for (const b of B) {
              const a = Math.atan2(b.vy, b.vx);
              ctx.fillStyle = `rgba(${acc},0.9)`;
              ctx.beginPath();
              ctx.moveTo(b.x + Math.cos(a) * 5, b.y + Math.sin(a) * 5);
              ctx.lineTo(b.x + Math.cos(a + 2.5) * 3.4, b.y + Math.sin(a + 2.5) * 3.4);
              ctx.lineTo(b.x + Math.cos(a - 2.5) * 3.4, b.y + Math.sin(a - 2.5) * 3.4);
              ctx.closePath(); ctx.fill();
            }
            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('separation · alignment · cohesion — each one looks only at its neighbours', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText(B.length + ' birds   sep ' + P.sep.toFixed(2) +
              '   ali ' + P.ali.toFixed(2) + '   coh ' + P.coh.toFixed(2), 12, h - 12);
          }
        };
      }
    },

    { id: 'attention',
      name: L('Attention', 'Atención'),
      note: L('What a transformer does to a sentence: every word weighs every other one.',
              'Lo que un transformer le hace a una frase: cada palabra pesa a todas las demás.'),
      params: [
        { key: 'temp', label: L('Softmax sharpness', 'Nitidez del softmax'), min: 0.2, max: 4, step: 0.05, def: 1 },
        { key: 'head', label: L('Head', 'Cabeza'), min: 0, max: 3, step: 1, def: 0 },
        { key: 'row',  label: L('Focus token', 'Token en foco'), min: -1, max: 9, step: 1, def: -1 }
      ],
      make() {
        // Frase fija con vectores hechos a mano en 4 dimensiones interpretables:
        // [animal, mueble, acción, referencia]. No es un modelo entrenado y no
        // pretende serlo: enseña el MECANISMO, que es lo que casi nadie ve.
        const TOK = ['the', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'];
        // Las magnitudes importan: con vectores cerca de cero todos los productos
        // punto se parecen, el softmax sale casi plano y la matriz se ve muerta.
        // La primera versión tenía ese problema. Los embeddings reales tampoco
        // son diminutos.
        const E = [
          [0.2, 0.2, 0.1, 0.3], [2.4, 0.1, 0.2, 0.6], [0.3, 0.2, 2.3, 0.2],
          [0.1, 0.8, 0.5, 0.1], [0.2, 0.2, 0.1, 0.3], [0.2, 2.4, 0.1, 0.5],
          [0.1, 0.1, 0.5, 1.0], [1.6, 0.5, 0.1, 2.2], [0.2, 0.1, 1.3, 0.5],
          [1.4, 0.1, 0.9, 0.3]
        ];
        // Cuatro cabezas: cada una proyecta con pesos distintos y por eso
        // atiende a relaciones distintas sobre la misma frase.
        const HEAD = [
          [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],
          [[0,0,0,1],[1,0,0,0],[0,1,0,0],[0,0,1,0]],
          [[0,1,0,0],[0,0,1,0],[0,0,0,1],[1,0,0,0]],
          [[1,0,0,1],[0,1,1,0],[1,0,1,0],[0,1,0,1]]
        ];
        return {
          step(ctx, w, h, t, acc, P, M) {
            const n = TOK.length, W = HEAD[P.head | 0];
            const proj = v => W.map(r => r.reduce((a, x, i) => a + x * v[i], 0));
            const Q = E.map(proj), K = E.map(proj);
            // A = softmax(Q·Kᵀ / √d)
            const A = Q.map(q => {
              const sc = K.map(k => k.reduce((a, x, i) => a + x * q[i], 0) / Math.sqrt(4) / P.temp);
              const mx = Math.max(...sc), ex = sc.map(v => Math.exp(v - mx));
              const sum = ex.reduce((a, b) => a + b, 0);
              return ex.map(v => v / sum);
            });

            const focus = M.in ? Math.min(n - 1, Math.floor((M.y / h) * n)) : (P.row | 0);
            const gy = h * 0.14, gx = w * 0.30, cell = Math.min((w * 0.42) / n, (h * 0.62) / n);

            // Matriz de atención
            for (let i = 0; i < n; i++) {
              for (let j = 0; j < n; j++) {
                const a = A[i][j];
                const on = focus < 0 || focus === i;
                ctx.fillStyle = `rgba(${acc},${(a * (on ? 0.95 : 0.12)).toFixed(3)})`;
                ctx.fillRect(gx + j * cell, gy + i * cell, cell - 1, cell - 1);
              }
            }
            ctx.strokeStyle = `rgba(${acc},0.2)`; ctx.lineWidth = 1;
            ctx.strokeRect(gx, gy, cell * n, cell * n);

            ctx.font = '11px monospace';
            for (let i = 0; i < n; i++) {
              const on = focus < 0 || focus === i;
              ctx.fillStyle = `rgba(${acc},${on ? 0.95 : 0.35})`;
              ctx.textAlign = 'right';
              ctx.fillText(TOK[i], gx - 8, gy + i * cell + cell * 0.7);   // consultas
              ctx.textAlign = 'left';
              ctx.save();
              ctx.translate(gx + i * cell + cell * 0.7, gy - 10);
              ctx.rotate(-Math.PI / 4);
              ctx.fillStyle = `rgba(${acc},0.6)`;
              ctx.fillText(TOK[i], 0, 0);                                 // claves
              ctx.restore();
            }
            ctx.textAlign = 'left';

            // Arcos de la fila en foco: a quién mira esa palabra
            if (focus >= 0) {
              const by = gy + cell * n + h * 0.10, bx = gx;
              for (let j = 0; j < n; j++) {
                const a = A[focus][j];
                if (a < 0.02) continue;
                const x1 = bx + focus * cell + cell / 2, x2 = bx + j * cell + cell / 2;
                ctx.strokeStyle = `rgba(${acc},${Math.min(0.9, a * 1.6).toFixed(3)})`;
                ctx.lineWidth = 0.5 + a * 5;
                ctx.beginPath();
                ctx.moveTo(x1, by);
                ctx.quadraticCurveTo((x1 + x2) / 2, by - Math.abs(x2 - x1) * 0.45 - 12, x2, by);
                ctx.stroke();
              }
              for (let j = 0; j < n; j++) {
                ctx.fillStyle = `rgba(${acc},${j === focus ? 1 : 0.5})`;
                ctx.font = '11px monospace';
                ctx.fillText(TOK[j], bx + j * cell + 2, by + 16);
              }
            }

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('A = softmax(Q·Kᵀ / √d)      rows are queries, columns are keys', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('head ' + (P.head | 0) + '   sharpness ' + P.temp.toFixed(2) +
              (focus >= 0 ? '   focus: "' + TOK[focus] + '"' : '   (hover a row)'), 12, h - 12);
          }
        };
      }
    },

    { id: 'optimizers',
      name: L('How a model learns', 'Cómo aprende un modelo'),
      note: L('The same slope, three ways down. Momentum and Adam against plain descent.',
              'La misma pendiente, tres formas de bajar. Momentum y Adam contra el descenso simple.'),
      params: [
        { key: 'lr',   label: L('Learning rate', 'Tasa de aprendizaje'), min: 0.001, max: 0.06, step: 0.001, def: 0.012 },
        { key: 'land', label: L('Landscape', 'Paisaje'), min: 0, max: 2, step: 1, def: 0 },
        { key: 'run',  label: L('Restart', 'Reiniciar'), min: 0, max: 1, step: 1, def: 0 }
      ],
      make() {
        let R = [], lastRun = 0, lastLand = -1;
        // Tres paisajes con trampas distintas: valle estrecho, silla, y baches
        const f = (x, y, L) =>
          L === 0 ? (1 - x) ** 2 + 12 * (y - x * x) ** 2                    // Rosenbrock
        : L === 1 ? x * x - y * y + 0.35 * (x ** 4 + y ** 4)                // silla
        :           x * x + y * y + 1.6 * (Math.sin(3 * x) + Math.sin(3 * y));
        const grad = (x, y, L) => {
          const e = 1e-3;
          return [(f(x + e, y, L) - f(x - e, y, L)) / (2 * e),
                  (f(x, y + e, L) - f(x, y - e, L)) / (2 * e)];
        };
        // Cada paisaje arranca donde su lección se ve. Medido, no elegido a ojo:
        // en la silla Adam sale en 11 pasos, momentum en 64 y SGD en 315; en el
        // paisaje con baches momentum es el único que escapa del hoyo malo.
        const START = [[-1.4, 1.6], [1.6, 0.001], [2.05, 2.05]];
        const seed = land => {
          const [sx, sy] = START[land] || START[0];
          R = [
            { n: 'SGD', x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 },
            { n: 'momentum', x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 },
            { n: 'Adam', x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 }
          ];
        };
        seed(0);
        return {
          reset() { seed(lastLand < 0 ? 0 : lastLand); },
          step(ctx, w, h, t, acc, P, M) {
            const LAND = P.land | 0;
            if (P.run !== lastRun || LAND !== lastLand) { lastRun = P.run; lastLand = LAND; seed(LAND); }
            const S = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
            const toS = (x, y) => [cx + x * S / 2.2, cy - y * S / 2.2];

            // Curvas de nivel
            const RES = 90, vals = [];
            let mn = 1e9, mx = -1e9;
            for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
              const x = (i / RES) * 4.4 - 2.2, y = (j / RES) * 4.4 - 2.2;
              const v = Math.log(1 + Math.max(0, f(x, y, LAND) + 4));
              vals.push(v); if (v < mn) mn = v; if (v > mx) mx = v;
            }
            const img = ctx.createImageData(RES, RES), px = img.data;
            const rgb = acc.split(',').map(Number);
            for (let k = 0; k < vals.length; k++) {
              const u = (vals[k] - mn) / (mx - mn + 1e-9);
              const band = 0.5 + 0.5 * Math.cos(u * 34);
              const a = (1 - u) * 0.5 + band * 0.12;
              const o = k * 4;
              px[o] = rgb[0] * a; px[o+1] = rgb[1] * a; px[o+2] = rgb[2] * a; px[o+3] = 255;
            }
            const off = document.createElement('canvas');
            off.width = off.height = RES; off.getContext('2d').putImageData(img, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(off, cx - S, cy - S, S * 2, S * 2);

            // Los tres optimizadores, mismo punto de partida y misma tasa base
            const lr = P.lr;
            R.forEach(r => {
              const [gx, gy] = grad(r.x, r.y, LAND);
              r.t++;
              if (r.n === 'SGD') { r.x -= lr * gx; r.y -= lr * gy; }
              else if (r.n === 'momentum') {
                r.vx = 0.9 * r.vx - lr * gx; r.vy = 0.9 * r.vy - lr * gy;
                r.x += r.vx; r.y += r.vy;
              } else {
                const b1 = 0.9, b2 = 0.999, e = 1e-8;
                r.mx = b1 * r.mx + (1 - b1) * gx; r.my = b1 * r.my + (1 - b1) * gy;
                r.sx = b2 * r.sx + (1 - b2) * gx * gx; r.sy = b2 * r.sy + (1 - b2) * gy * gy;
                const mhx = r.mx / (1 - Math.pow(b1, r.t)), mhy = r.my / (1 - Math.pow(b1, r.t));
                const shx = r.sx / (1 - Math.pow(b2, r.t)), shy = r.sy / (1 - Math.pow(b2, r.t));
                r.x -= lr * 8 * mhx / (Math.sqrt(shx) + e);
                r.y -= lr * 8 * mhy / (Math.sqrt(shy) + e);
              }
              r.x = Math.max(-2.2, Math.min(2.2, r.x));
              r.y = Math.max(-2.2, Math.min(2.2, r.y));
              r.p.push([r.x, r.y]); if (r.p.length > 900) r.p.shift();
            });

            const style = ['0.45', '0.7', '1'];
            R.forEach((r, i) => {
              ctx.strokeStyle = `rgba(${acc},${style[i]})`; ctx.lineWidth = 1 + i * 0.5;
              ctx.beginPath();
              r.p.forEach((q, k) => { const p = toS(q[0], q[1]);
                k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
              ctx.stroke();
              const p = toS(r.x, r.y);
              ctx.fillStyle = `rgba(${acc},${style[i]})`;
              ctx.beginPath(); ctx.arc(p[0], p[1], 3.6, 0, TAU); ctx.fill();
              ctx.font = '11px monospace';
              ctx.fillText(r.n + '  loss ' + f(r.x, r.y, LAND).toFixed(3), 14, 48 + i * 16);
            });

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText(['Rosenbrock — a narrow curved valley',
                          'saddle — flat in one direction, steep in the other',
                          'bumpy bowl — local minima everywhere'][LAND], 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('same start, same learning rate ' + lr.toFixed(3) +
              '   steps ' + R[0].t, 12, h - 12);
          }
        };
      }
    },

    { id: 'embedding',
      name: L('Embedding space', 'Espacio de embeddings'),
      note: L('High-dimensional structure squeezed into a plane, live.',
              'Estructura de muchas dimensiones exprimida a un plano, en vivo.'),
      params: [
        { key: 'dim',  label: L('True dimensions', 'Dimensiones reales'), min: 3, max: 24, step: 1, def: 10 },
        { key: 'clus', label: L('Clusters', 'Grupos'), min: 2, max: 8, step: 1, def: 5 },
        { key: 'rate', label: L('Relaxation rate', 'Tasa de relajación'), min: 0.01, max: 0.4, step: 0.01, def: 0.12 }
      ],
      make(w, h) {
        let hi = [], lo = [], lab = [], D = 0, C = 0, target = null;
        const build = (dim, clus, w, h) => {
          D = dim; C = clus; hi = []; lo = []; lab = [];
          const centres = Array.from({ length: clus }, () =>
            Array.from({ length: dim }, () => (Math.random() * 2 - 1) * 2.2));
          for (let c = 0; c < clus; c++) {
            for (let i = 0; i < 26; i++) {
              hi.push(centres[c].map(v => v + (Math.random() * 2 - 1) * 0.45));
              lab.push(c);
              lo.push([w / 2 + (Math.random() - 0.5) * 40, h / 2 + (Math.random() - 0.5) * 40]);
            }
          }
          // Matriz de distancias reales en alta dimensión: es el objetivo
          const n = hi.length;
          target = new Float32Array(n * n);
          let mx = 0;
          for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
            let s = 0;
            for (let k = 0; k < dim; k++) { const d = hi[i][k] - hi[j][k]; s += d * d; }
            const v = Math.sqrt(s); target[i * n + j] = v; if (v > mx) mx = v;
          }
          const scale = (Math.min(w, h) * 0.40) / mx;
          for (let i = 0; i < n * n; i++) target[i] *= scale;
        };
        build(10, 5, w, h);
        return {
          resize(w, h) { build(D, C, w, h); },
          reset() { build(D, C, w, h); },
          step(ctx, w, h, t, acc, P, M) {
            if ((P.dim | 0) !== D || (P.clus | 0) !== C) build(P.dim | 0, P.clus | 0, w, h);
            const n = lo.length, rate = P.rate;
            // Escalado multidimensional por relajación: acerca o aleja cada par
            // hasta que la distancia en el plano se parezca a la real.
            for (let s = 0; s < 3; s++) {
              for (let i = 0; i < n; i++) {
                const j = (Math.random() * n) | 0;
                if (i === j) continue;
                const dx = lo[j][0] - lo[i][0], dy = lo[j][1] - lo[i][1];
                const d = Math.hypot(dx, dy) + 1e-6;
                const want = target[i * n + j];
                const push = ((d - want) / d) * rate * 0.5;
                lo[i][0] += dx * push; lo[i][1] += dy * push;
                lo[j][0] -= dx * push; lo[j][1] -= dy * push;
              }
            }
            // Error residual: cuánto no cabe en dos dimensiones
            let err = 0, cnt = 0;
            for (let q = 0; q < 400; q++) {
              const i = (Math.random() * n) | 0, j = (Math.random() * n) | 0;
              if (i === j) continue;
              const d = Math.hypot(lo[j][0] - lo[i][0], lo[j][1] - lo[i][1]);
              const want = target[i * n + j];
              err += Math.abs(d - want) / (want + 1); cnt++;
            }
            err = cnt ? err / cnt : 0;

            for (let i = 0; i < n; i++) {
              const c = lab[i], a = 0.35 + (c / Math.max(1, C - 1)) * 0.6;
              ctx.fillStyle = c % 2 ? `rgba(${acc},${a.toFixed(2)})` : `rgba(${neutro()},${(a * 0.7).toFixed(2)})`;
              ctx.beginPath(); ctx.arc(lo[i][0], lo[i][1], 2.6, 0, TAU); ctx.fill();
            }
            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('pairwise distances in ' + D + 'D, forced onto 2D by relaxation', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText(D + ' dimensions → 2   ' + C + ' clusters   residual distortion ' +
              (err * 100).toFixed(1) + '%', 12, h - 12);
          }
        };
      }
    },

    { id: 'radiation',
      name: L('Why light exists', 'Por qué existe la luz'),
      note: L('Field lines drawn from the retarded position. Shake a charge and you see the kink leave.',
              'Líneas de campo desde la posición retardada. Sacude una carga y ves salir el quiebre.'),
      params: [
        { key: 'mode',  label: L('Motion', 'Movimiento'), min: 0, max: 2, step: 1, def: 0 },
        { key: 'beta',  label: L('Speed (v/c)', 'Rapidez (v/c)'), min: 0.05, max: 0.75, step: 0.01, def: 0.35 },
        { key: 'lines', label: L('Field lines', 'Líneas de campo'), min: 8, max: 40, step: 2, def: 24 }
      ],
      make() {
        // Construcción de Purcell: una línea de campo apunta radialmente desde
        // donde ESTABA la carga hace r/c, no desde donde está. Al acelerar, esa
        // discrepancia se acumula en un quiebre que viaja a c. El quiebre es la luz.
        const DT = 1 / 120, C = 210;         // px por segundo
        let hist = [], st = 0, acct = 0;
        const posAt = (tt, mode, beta, w, h) => {
          // Lo único que se ve es la longitud de onda λ = c·T, así que se fija a
          // una fracción del lienzo para que quepan varias, y la amplitud sale de
          // ahí: A = βλ/2π. Esa es la relación real de un dipolo, y explica por
          // qué la carga casi no se mueve mientras el campo ondea entero.
          const LAM = Math.min(w, h) * 0.38, om = (TAU * C) / LAM, A = (beta * C) / om;
          if (mode === 0) return [w / 2 + A * Math.sin(om * tt), h / 2];
          if (mode === 1) return [w / 2 + A * Math.cos(om * tt), h / 2 + A * Math.sin(om * tt)];
          // Rebote duro: velocidad constante y reversiones bruscas. Su recorrido
          // se elige para que los quiebres queden separados ~200px y se vean varios.
          const AB = LAM * 0.18, T = (AB * 4) / (beta * C), ph = ((tt % T) + T) % T;
          const x = ph < T / 2 ? -AB + (ph / (T / 2)) * 2 * AB : AB - ((ph - T / 2) / (T / 2)) * 2 * AB;
          return [w / 2 + x, h / 2];
        };
        return {
          reset() { hist = []; st = 0; acct = 0; },
          step(ctx, w, h, t, acc, P, M) {
            const mode = P.mode | 0;
            const RMAX = Math.hypot(w, h) * 0.52;
            const need = Math.ceil(RMAX / (C * DT)) + 4;
            // El movimiento es una función pura del tiempo, así que el pasado se
            // puede calcular: se precarga y el campo aparece formado desde el
            // primer cuadro en vez de tardar segundos en llenarse.
            if (hist.length < need)
              for (let i = hist.length; i < need; i++) hist.push(posAt(st - i * DT, mode, P.beta, w, h));
            // Reloj propio de paso fijo: así el índice del historial ES la distancia
            acct += 1 / 60;
            while (st < acct) {
              st += DT;
              hist.unshift(posAt(st, mode, P.beta, w, h));
              if (hist.length > need) hist.length = need;
            }

            const N = P.lines | 0, dr = C * DT * 2;
            for (let k = 0; k < N; k++) {
              const th = (k / N) * TAU;
              const ct = Math.cos(th), sn = Math.sin(th);
              ctx.beginPath();
              let started = false;
              for (let r = 6; r < RMAX; r += dr) {
                const idx = Math.min(hist.length - 1, Math.round(r / (C * DT)));
                const p = hist[idx];
                const x = p[0] + r * ct, y = p[1] + r * sn;
                started ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), started = true);
              }
              ctx.strokeStyle = `rgba(${acc},0.42)`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            const now = hist[0];
            ctx.fillStyle = `rgba(${acc},1)`;
            ctx.beginPath(); ctx.arc(now[0], now[1], 4.5, 0, TAU); ctx.fill();
            ctx.strokeStyle = `rgba(${acc},0.14)`;
            ctx.beginPath(); ctx.arc(now[0], now[1], 5.5, 0, TAU); ctx.stroke();

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText(['dipole — the textbook antenna',
                          'circular — this is synchrotron light',
                          'hard turns — every kink is a burst'][mode], 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('v/c = ' + P.beta.toFixed(2) +
              '   lines point at the charge as it was r/c ago', 12, h - 12);
          }
        };
      }
    },

    { id: 'refraction',
      name: L('Snell and the trapped ray', 'Snell y el rayo atrapado'),
      note: L('Tilt the beam past the critical angle and the interface turns into a mirror.',
              'Inclina el haz más allá del ángulo crítico y la interfaz se vuelve espejo.'),
      params: [
        { key: 'n1',  label: L('n above', 'n arriba'), min: 1, max: 2.6, step: 0.01, def: 1.5 },
        { key: 'n2',  label: L('n below', 'n abajo'), min: 1, max: 2.6, step: 0.01, def: 1 },
        { key: 'ang', label: L('Angle of incidence', 'Ángulo de incidencia'), min: 1, max: 89, step: 0.5, def: 35 }
      ],
      make() {
        return {
          step(ctx, w, h, t, acc, P, M) {
            const iy = h * 0.52, ox = w * 0.5;
            const n1 = P.n1, n2 = P.n2;
            // El cursor manda sobre el deslizador cuando está encima
            let th1 = (P.ang * Math.PI) / 180;
            if (M.in && M.y < iy) th1 = Math.max(0.02, Math.min(1.55, Math.atan2(Math.abs(M.x - ox), Math.max(6, iy - M.y))));

            const s2 = (n1 / n2) * Math.sin(th1);
            const tir = s2 > 1;
            const th2 = tir ? 0 : Math.asin(s2);
            const critical = n1 > n2 ? Math.asin(n2 / n1) : null;

            // Fresnel, polarización s y p
            const c1 = Math.cos(th1), c2 = Math.cos(th2);
            const rs = tir ? 1 : ((n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2)) ** 2;
            const rp = tir ? 1 : ((n1 * c2 - n2 * c1) / (n1 * c2 + n2 * c1)) ** 2;
            const R = (rs + rp) / 2, T = 1 - R;

            // Medios
            ctx.fillStyle = `rgba(${acc},0.07)`; ctx.fillRect(0, 0, w, iy);
            ctx.fillStyle = `rgba(${acc},0.03)`; ctx.fillRect(0, iy, w, h - iy);
            ctx.strokeStyle = `rgba(${acc},0.45)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, iy); ctx.lineTo(w, iy); ctx.stroke();

            // Normal
            ctx.setLineDash([3, 5]); ctx.strokeStyle = `rgba(${acc},0.28)`;
            ctx.beginPath(); ctx.moveTo(ox, 12); ctx.lineTo(ox, h - 44); ctx.stroke();
            ctx.setLineDash([]);

            const Lr = Math.min(w, h) * 0.46;
            const beam = (x1, y1, x2, y2, a, wd) => {
              ctx.strokeStyle = `rgba(${acc},${a.toFixed(3)})`;
              ctx.lineWidth = wd;
              ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
              // Frentes de onda: se separan menos donde el índice es mayor
              const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
              const ux = dx / len, uy = dy / len, sp = 14;
              const ph = ((t * 60) % sp);
              ctx.lineWidth = 1;
              for (let d = ph; d < len; d += sp) {
                const px = x1 + ux * d, py = y1 + uy * d;
                ctx.strokeStyle = `rgba(${acc},${(a * 0.5).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(px - uy * 4, py + ux * 4);
                ctx.lineTo(px + uy * 4, py - ux * 4);
                ctx.stroke();
              }
            };

            // Incidente (llega desde arriba-izquierda)
            beam(ox - Math.sin(th1) * Lr, iy - Math.cos(th1) * Lr, ox, iy, 0.95, 2);
            // Reflejado
            beam(ox, iy, ox + Math.sin(th1) * Lr, iy - Math.cos(th1) * Lr, 0.25 + R * 0.7, 1 + R * 2.5);
            // Transmitido
            if (!tir) beam(ox, iy, ox + Math.sin(th2) * Lr, iy + Math.cos(th2) * Lr, 0.25 + T * 0.7, 1 + T * 2.5);

            // Cono crítico
            if (critical !== null) {
              ctx.setLineDash([2, 4]);
              ctx.strokeStyle = `rgba(${acc},0.3)`;
              ctx.beginPath();
              ctx.moveTo(ox - Math.sin(critical) * Lr, iy - Math.cos(critical) * Lr);
              ctx.lineTo(ox, iy);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.font = '10px monospace';
              ctx.fillStyle = `rgba(${acc},0.5)`;
              ctx.fillText('θc = ' + ((critical * 180) / Math.PI).toFixed(1) + '°',
                ox - Math.sin(critical) * Lr - 4, iy - Math.cos(critical) * Lr - 6);
            }

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.6)`;
            ctx.fillText('n₁ = ' + n1.toFixed(2), 12, 20);
            ctx.fillText('n₂ = ' + n2.toFixed(2), 12, iy + 20);
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('n₁ sin θ₁ = n₂ sin θ₂        reflectance from Fresnel', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText(tir
              ? 'θ₁ = ' + ((th1 * 180) / Math.PI).toFixed(1) + '°  ·  total internal reflection  ·  R = 100%'
              : 'θ₁ = ' + ((th1 * 180) / Math.PI).toFixed(1) + '°   θ₂ = ' + ((th2 * 180) / Math.PI).toFixed(1) +
                '°   R = ' + (R * 100).toFixed(1) + '%   T = ' + (T * 100).toFixed(1) + '%', 12, h - 12);
          }
        };
      }
    },

    { id: 'chladni',
      name: L('Chladni figures', 'Figuras de Chladni'),
      note: L('Sand on a vibrating plate walks off the loud parts and piles on the silent ones.',
              'La arena sobre una placa que vibra huye de lo que suena y se apila en lo callado.'),
      params: [
        { key: 'm',    label: L('Mode m', 'Modo m'), min: 1, max: 9, step: 1, def: 3 },
        { key: 'n',    label: L('Mode n', 'Modo n'), min: 1, max: 9, step: 1, def: 5 },
        { key: 'grain', label: L('Grains', 'Granos'), min: 400, max: 6000, step: 100, def: 2600 }
      ],
      make(w, h) {
        let g = [], K = 0;
        const seed = (n, w, h) => {
          g = [];
          for (let i = 0; i < n; i++) g.push([Math.random(), Math.random()]);
          K = n;
        };
        seed(2600, w, h);
        // Placa cuadrada libre: la combinación antisimétrica es la que produce
        // las figuras que dibujó Chladni en 1787.
        const u = (x, y, m, n) =>
          Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) -
          Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
        return {
          reset() { seed(K, w, h); },
          step(ctx, w, h, t, acc, P, M) {
            if ((P.grain | 0) !== K) seed(P.grain | 0, w, h);
            const m = P.m | 0, n = P.n | 0;
            const S = Math.min(w, h) * 0.78, px = (w - S) / 2, py = (h - S) / 2;

            // Campo de fondo
            const RES = 120, img = ctx.createImageData(RES, RES), d = img.data;
            const rgb = acc.split(',').map(Number);
            for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
              const a = Math.abs(u(i / RES, j / RES, m, n)) / 2;
              const o = (j * RES + i) * 4;
              d[o] = rgb[0] * a * 0.30; d[o+1] = rgb[1] * a * 0.30; d[o+2] = rgb[2] * a * 0.30; d[o+3] = 255;
            }
            const off = document.createElement('canvas');
            off.width = off.height = RES; off.getContext('2d').putImageData(img, 0, 0);
            ctx.drawImage(off, px, py, S, S);
            ctx.strokeStyle = `rgba(${acc},0.35)`;
            ctx.lineWidth = 1; ctx.strokeRect(px, py, S, S);

            // Cada grano baja por el gradiente de |u| y salta según lo fuerte
            // que vibre donde está. Donde u = 0 no hay salto: ahí se queda.
            const e = 0.004;
            for (let k = 0; k < g.length; k++) {
              const p = g[k];
              const a = Math.abs(u(p[0], p[1], m, n));
              const gx = (Math.abs(u(p[0] + e, p[1], m, n)) - Math.abs(u(p[0] - e, p[1], m, n))) / (2 * e);
              const gy = (Math.abs(u(p[0], p[1] + e, m, n)) - Math.abs(u(p[0], p[1] - e, m, n))) / (2 * e);
              // Dos ruidos distintos. El proporcional a la amplitud es el que
              // expulsa los granos de las zonas que vibran. El constante es el que
              // los deja caminar A LO LARGO de la línea nodal una vez que llegan:
              // sin él se quedan pegados en el primer punto que tocan y la figura
              // sale como charcos sueltos en vez de curvas. Medido: 0.038 sextuplica
              // la cobertura sin sacarlos del nodo (|u| medio 0.070 contra 0.068).
              const kick = a * 0.010, walk = 0.038;
              p[0] += -gx * 0.0016 + (Math.random() - 0.5) * kick + (Math.random() - 0.5) * walk;
              p[1] += -gy * 0.0016 + (Math.random() - 0.5) * kick + (Math.random() - 0.5) * walk;
              p[0] = Math.max(0, Math.min(1, p[0]));
              p[1] = Math.max(0, Math.min(1, p[1]));
            }

            ctx.fillStyle = `rgba(${acc},0.85)`;
            for (let k = 0; k < g.length; k++)
              ctx.fillRect(px + g[k][0] * S - 0.6, py + g[k][1] * S - 0.6, 1.5, 1.5);

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('u = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)      grains settle where u = 0', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('m = ' + m + '   n = ' + n + '   ' + g.length + ' grains', 12, h - 12);
          }
        };
      }
    },

    { id: 'ulam',
      name: L('Ulam spiral', 'Espiral de Ulam'),
      note: L('Primes on a square spiral. Nobody knows why the diagonals are there.',
              'Primos en una espiral cuadrada. Nadie sabe por qué están las diagonales.'),
      params: [
        { key: 'size',  label: L('Grid', 'Rejilla'), min: 60, max: 400, step: 10, def: 200 },
        { key: 'start', label: L('Start at', 'Empieza en'), min: 0, max: 60, step: 1, def: 0 },
        { key: 'euler', label: L('Mark n²+n+41', 'Marcar n²+n+41'), min: 0, max: 1, step: 1, def: 0 }
      ],
      make() {
        let cache = null, key = '';
        const sieve = n => {
          const p = new Uint8Array(n + 1).fill(1);
          p[0] = p[1] = 0;
          for (let i = 2; i * i <= n; i++) if (p[i]) for (let j = i * i; j <= n; j += i) p[j] = 0;
          return p;
        };
        return {
          step(ctx, w, h, t, acc, P, M) {
            const N = P.size | 0, start = P.start | 0, eu = P.euler | 0;
            const k = N + ':' + start + ':' + eu + ':' + acc;
            if (key !== k) {
              key = k;
              const total = N * N, pr = sieve(total + start + 4);
              const euler = new Set();
              if (eu) for (let i = 0; i * i + i + 41 <= total + start; i++) euler.add(i * i + i + 41);
              const img = new ImageData(N, N), d = img.data;
              const rgb = acc.split(',').map(Number);
              // Camina la espiral: derecha 1, arriba 1, izquierda 2, abajo 2, …
              let x = N >> 1, y = N >> 1, dx = 1, dy = 0, run = 1, done = 0;
              for (let v = 1; v <= total; v++) {
                if (x >= 0 && x < N && y >= 0 && y < N) {
                  const num = v + start, o = (y * N + x) * 4;
                  const isP = !!pr[num], isE = euler.has(num);
                  const a = isE ? 1 : isP ? 0.85 : 0.04;
                  d[o] = isE ? 255 : rgb[0] * a;
                  d[o+1] = isE ? 255 : rgb[1] * a;
                  d[o+2] = isE ? 255 : rgb[2] * a;
                  d[o+3] = 255;
                }
                x += dx; y += dy;
                if (++done === run) {
                  done = 0;
                  const tmp = dx; dx = -dy; dy = tmp;      // gira
                  if (dy === 0) run++;
                }
              }
              cache = document.createElement('canvas');
              cache.width = cache.height = N;
              cache.getContext('2d').putImageData(img, 0, 0);
            }
            const S = Math.min(w, h) * 0.84, px = (w - S) / 2, py = (h - S) / 2;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(cache, px, py, S, S);
            ctx.imageSmoothingEnabled = true;
            ctx.strokeStyle = `rgba(${acc},0.25)`;
            ctx.strokeRect(px, py, S, S);

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('every diagonal line is a quadratic n² + bn + c that is prime unusually often', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText('1 to ' + (N * N + start).toLocaleString('en') + '   offset ' + start +
              (eu ? '   ·  white: n²+n+41, prime for n = 0…39' : ''), 12, h - 12);
          }
        };
      }
    },

    { id: 'collatz',
      name: L('Collatz', 'Collatz'),
      note: L('Halve it or triple-plus-one. Every path tested so far falls to 1. Nobody has proved it.',
              'Divide en dos o triplica y suma uno. Todo camino probado cae a 1. Nadie lo ha demostrado.'),
      params: [
        { key: 'count', label: L('Numbers', 'Números'), min: 100, max: 6000, step: 100, def: 2200 },
        { key: 'even',  label: L('Even turn', 'Giro par'), min: 0, max: 20, step: 0.5, def: 7 },
        { key: 'odd',   label: L('Odd turn', 'Giro impar'), min: -24, max: 0, step: 0.5, def: -11 }
      ],
      make() {
        let cache = null, key = '', maxLen = 0;
        return {
          resize() { key = ''; },
          step(ctx, w, h, t, acc, P, M) {
            const N = P.count | 0;
            const k = N + ':' + P.even + ':' + P.odd + ':' + w + ':' + h + ':' + acc;
            if (key !== k) {
              key = k;
              cache = document.createElement('canvas');
              cache.width = w; cache.height = h;
              const c = cache.getContext('2d');
              const ev = (P.even * Math.PI) / 180, od = (P.odd * Math.PI) / 180;
              const seg = Math.min(w, h) * 0.020;
              maxLen = 0;
              // Se dibuja la secuencia AL REVÉS, desde el 1. Todas las ramas
              // comparten raíz, y por eso el dibujo crece como un coral.
              for (let s = 2; s <= N; s++) {
                const path = [];
                let v = s, guard = 0;
                while (v !== 1 && guard++ < 1000) { path.push(v % 2 === 0); v = v % 2 === 0 ? v / 2 : 3 * v + 1; }
                if (path.length > maxLen) maxLen = path.length;
                let x = w / 2, y = h * 0.94, a = -Math.PI / 2;
                c.beginPath(); c.moveTo(x, y);
                for (let i = path.length - 1; i >= 0; i--) {
                  a += path[i] ? ev : od;
                  x += Math.cos(a) * seg; y += Math.sin(a) * seg;
                  c.lineTo(x, y);
                }
                c.strokeStyle = `rgba(${acc},0.035)`;
                c.lineWidth = 1;
                c.stroke();
              }
            }
            ctx.drawImage(cache, 0, 0);
            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText('n even → n/2      n odd → 3n+1      drawn backwards from 1', 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText(N.toLocaleString('en') + ' starting numbers   longest path ' + maxLen + ' steps', 12, h - 12);
          }
        };
      }
    },

    { id: 'voronoi',
      name: L('Voronoi', 'Voronoi'),
      note: L('Every point belongs to whoever is nearest. Change what "near" means and the world changes shape.',
              'Cada punto pertenece a quien tenga más cerca. Cambia qué significa "cerca" y el mundo cambia de forma.'),
      params: [
        { key: 'sites',  label: L('Sites', 'Sitios'), min: 3, max: 40, step: 1, def: 14 },
        { key: 'speed',  label: L('Drift', 'Deriva'), min: 0, max: 3, step: 0.1, def: 0.8 },
        { key: 'metric', label: L('Distance', 'Distancia'), min: 0, max: 2, step: 1, def: 0 }
      ],
      make(w, h) {
        let S = [], K = 0;
        const seed = (n, w, h) => {
          S = []; K = n;
          for (let i = 0; i < n; i++)
            S.push({ x: Math.random() * w, y: Math.random() * h,
                     vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40 });
        };
        seed(14, w, h);
        return {
          resize(w, h) { seed(K, w, h); },
          reset() { seed(K, w, h); },
          step(ctx, w, h, t, acc, P, M) {
            if ((P.sites | 0) !== K) seed(P.sites | 0, w, h);
            const met = P.metric | 0, dt = 1 / 60;
            S.forEach(s => {
              s.x += s.vx * P.speed * dt; s.y += s.vy * P.speed * dt;
              if (s.x < 0 || s.x > w) s.vx *= -1;
              if (s.y < 0 || s.y > h) s.vy *= -1;
              s.x = Math.max(0, Math.min(w, s.x)); s.y = Math.max(0, Math.min(h, s.y));
            });
            // El cursor es un sitio más: la teselación reacciona en vivo
            const pts = M.in ? S.concat([{ x: M.x, y: M.y, cur: 1 }]) : S;

            const dist = (dx, dy) =>
              met === 0 ? dx * dx + dy * dy
            : met === 1 ? Math.abs(dx) + Math.abs(dy)
            :             Math.max(Math.abs(dx), Math.abs(dy));

            const RES = 150, RH = Math.max(1, Math.round((RES * h) / w));
            const own = new Int16Array(RES * RH);
            for (let j = 0; j < RH; j++) {
              const y = ((j + 0.5) / RH) * h;
              for (let i = 0; i < RES; i++) {
                const x = ((i + 0.5) / RES) * w;
                let best = 1e18, bi = 0;
                for (let s = 0; s < pts.length; s++) {
                  const d = dist(x - pts[s].x, y - pts[s].y);
                  if (d < best) { best = d; bi = s; }
                }
                own[j * RES + i] = bi;
              }
            }

            const img = ctx.createImageData(RES, RH), d = img.data;
            const rgb = acc.split(',').map(Number);
            for (let j = 0; j < RH; j++) for (let i = 0; i < RES; i++) {
              const q = j * RES + i, o = q * 4, id = own[q];
              // Borde = donde cambia el dueño respecto al vecino
              const edge = (i + 1 < RES && own[q + 1] !== id) || (j + 1 < RH && own[q + RES] !== id);
              const a = edge ? 0.9 : 0.05 + ((id * 37) % 100) / 100 * 0.22;
              d[o] = rgb[0] * a; d[o+1] = rgb[1] * a; d[o+2] = rgb[2] * a; d[o+3] = 255;
            }
            const off = document.createElement('canvas');
            off.width = RES; off.height = RH;
            off.getContext('2d').putImageData(img, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(off, 0, 0, w, h);

            pts.forEach(s => {
              ctx.fillStyle = s.cur ? `rgba(${neutro()},1)` : `rgba(${acc},0.95)`;
              ctx.beginPath(); ctx.arc(s.x, s.y, s.cur ? 4 : 2.4, 0, TAU); ctx.fill();
            });

            ctx.font = '11px monospace';
            ctx.fillStyle = `rgba(${acc},0.55)`;
            ctx.fillText(['Euclidean — straight line, the usual one',
                          'Manhattan — |dx| + |dy|, city blocks',
                          'Chebyshev — max(|dx|,|dy|), king moves'][met], 12, h - 28);
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.fillText(pts.length + ' sites' + (M.in ? '   ·  one of them is your cursor' : ''), 12, h - 12);
          }
        };
      }
    },

    { id: 'quantum',
      name: L('Particle in a box', 'Partícula en una caja'),
      note: L('Two states added together. The probability sloshes and never settles.',
              'Dos estados sumados. La probabilidad chapotea y nunca se asienta.'),
      params: [
        { key: 'n1',  label: L('State n₁', 'Estado n₁'), min: 1, max: 6, step: 1, def: 1 },
        { key: 'n2',  label: L('State n₂', 'Estado n₂'), min: 1, max: 8, step: 1, def: 2 },
        { key: 'mix', label: L('Mix', 'Mezcla'),         min: 0, max: 1, step: 0.01, def: 0.5 }
      ],
      make() {
        return {
          step(ctx, w, h, t, acc, P, M) {
            const pad = w * 0.08, L = w - pad * 2, base = h * 0.55, A = h * 0.16;
            const mix = M.in ? Math.min(1, Math.max(0, M.x / w)) : P.mix;
            const a = Math.sqrt(1 - mix), b = Math.sqrt(mix);
            const n1 = P.n1 | 0, n2 = P.n2 | 0;
            const E1 = n1 * n1 * 0.35, E2 = n2 * n2 * 0.35;   // Eₙ ∝ n²

            // Paredes del pozo
            ctx.strokeStyle = `rgba(${acc},0.35)`; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad, h * 0.12); ctx.lineTo(pad, h * 0.9);
            ctx.moveTo(pad + L, h * 0.12); ctx.lineTo(pad + L, h * 0.9);
            ctx.stroke();

            let reP = [], imP = [], pr = [];
            for (let i = 0; i <= 220; i++) {
              const u = i / 220, x = pad + u * L;
              const f1 = Math.sin(n1 * Math.PI * u), f2 = Math.sin(n2 * Math.PI * u);
              const re = a * f1 * Math.cos(-E1 * t) + b * f2 * Math.cos(-E2 * t);
              const im = a * f1 * Math.sin(-E1 * t) + b * f2 * Math.sin(-E2 * t);
              reP.push([x, base - re * A]); imP.push([x, base - im * A]);
              pr.push([x, base - (re * re + im * im) * A * 1.5]);
            }
            const line = (pts, alpha, lw) => {
              ctx.strokeStyle = `rgba(${acc},${alpha})`; ctx.lineWidth = lw;
              ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
              ctx.stroke();
            };
            line(reP, 0.35, 1);          // parte real
            line(imP, 0.22, 1);          // parte imaginaria
            line(pr, 0.95, 1.6);         // |ψ|², lo único observable
            ctx.fillStyle = `rgba(${acc},0.8)`; ctx.font = '11px monospace';
            ctx.fillText('|ψ|²  n₁=' + n1 + '  n₂=' + n2, 12, 20);
          }
        };
      }
    },

    { id: 'oscillators',
      name: L('Coupled oscillators', 'Osciladores acoplados'),
      note: L('Two masses, one spring between them. Energy moves back and forth on its own.',
              'Dos masas, un resorte entre ellas. La energía va y viene sola.'),
      params: [
        { key: 'kc',   label: L('Coupling', 'Acoplamiento'), min: 0, max: 0.6, step: 0.01, def: 0.18 },
        { key: 'k',    label: L('Stiffness', 'Rigidez'),     min: 0.2, max: 3, step: 0.05, def: 1 },
        { key: 'mass', label: L('Mass ratio', 'Razón de masas'), min: 0.4, max: 3, step: 0.05, def: 1 }
      ],
      make() {
        let x1 = 1, x2 = 0, v1 = 0, v2 = 0, h1 = [], h2 = [];
        return {
          reset() { x1 = 1; x2 = 0; v1 = v2 = 0; h1 = []; h2 = []; },
          step(ctx, w, h, t, acc, P, M) {
            if (M.in) { x1 = (M.y / h - 0.5) * 2; v1 = 0; }   // el cursor levanta la primera masa
            const dt = 0.12;
            for (let i = 0; i < 3; i++) {
              const a1 = (-P.k * x1 - P.kc * (x1 - x2));
              const a2 = (-P.k * x2 - P.kc * (x2 - x1)) / P.mass;
              v1 += a1 * dt; v2 += a2 * dt; x1 += v1 * dt; x2 += v2 * dt;
            }
            h1.push(x1); h2.push(x2);
            if (h1.length > w * 0.5) { h1.shift(); h2.shift(); }

            const cy = h * 0.32, A = h * 0.16, xa = w * 0.26, xb = w * 0.62;
            ctx.strokeStyle = `rgba(${acc},0.3)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(xa, cy + x1 * A); ctx.lineTo(xb, cy + x2 * A); ctx.stroke();
            ctx.fillStyle = `rgba(${acc},0.95)`;
            ctx.beginPath(); ctx.arc(xa, cy + x1 * A, 7, 0, TAU); ctx.fill();
            ctx.beginPath(); ctx.arc(xb, cy + x2 * A, 7 * Math.sqrt(P.mass), 0, TAU); ctx.fill();

            // Historia de cada masa: el batido se ve solo
            const y0 = h * 0.74, s = h * 0.1;
            [[h1, 0.85], [h2, 0.4]].forEach(([arr, al]) => {
              ctx.strokeStyle = `rgba(${acc},${al})`; ctx.lineWidth = 1.2;
              ctx.beginPath();
              arr.forEach((v, k) => { const X = w * 0.06 + k * 2, Y = y0 + v * s;
                k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
              ctx.stroke();
            });
          }
        };
      }
    },

    { id: 'kepler',
      name: L('Kepler orbits', 'Órbitas de Kepler'),
      note: L('Equal areas in equal times. The law Newton later explained.',
              'Áreas iguales en tiempos iguales. La ley que Newton explicó después.'),
      params: [
        { key: 'ecc', label: L('Eccentricity', 'Excentricidad'), min: 0, max: 0.85, step: 0.01, def: 0.55 },
        { key: 'planets', label: L('Planets', 'Planetas'), min: 1, max: 6, step: 1, def: 3 },
        { key: 'speed', label: L('Time scale', 'Escala temporal'), min: 0.08, max: 0.8, step: 0.01, def: 0.28 }
      ],
      make(w, h) {
        let lw = w, lh = h;
        return {
          resize(w, h) { lw = w; lh = h; },
          reset() {},
          step(ctx, w, h, t, acc, P, M) {
            const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
            ctx.fillStyle = `rgba(${acc},0.96)`;
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
            const n = P.planets | 0, e = Math.min(.85, Math.max(0, P.ecc));
            for (let i = 0; i < n; i++) {
              const a = R * (0.22 + i * 0.13), b = a * Math.sqrt(1 - e * e);
              const mean = t * P.speed * (0.52 / Math.pow(i + 1, 1.5)) + i * 1.7;
              let E = mean;
              for (let q = 0; q < 5; q++) E -= (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
              const px = cx + a * (Math.cos(E) - e), py = cy + b * Math.sin(E);
              ctx.strokeStyle = `rgba(${acc},${i === 0 ? .28 : .12})`; ctx.lineWidth = i === 0 ? 1.2 : .7;
              ctx.beginPath(); ctx.ellipse(cx - a * e, cy, a, b, 0, 0, TAU); ctx.stroke();
              ctx.fillStyle = `rgba(${acc},${i === 0 ? .98 : .7})`;
              ctx.beginPath(); ctx.arc(px, py, i === 0 ? 4 : 2.8, 0, TAU); ctx.fill();
              if (i === 0) {
                ctx.fillStyle = `rgba(${acc},.13)`;
                const E0 = E - .7, E1 = E - .28;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + a * (Math.cos(E0) - e), cy + b * Math.sin(E0));
                ctx.lineTo(px, py); ctx.closePath(); ctx.fill();
              }
            }
          }
        };
      }
    },

    { id: 'neural',
      name: L('A network thinking', 'Una red pensando'),
      note: L('Signal entering on the left and spreading. Node brightness is activation.',
              'Señal entrando por la izquierda y propagándose. El brillo del nodo es su activación.'),
      params: [
        { key: 'depth', label: L('Layers', 'Capas'),          min: 2, max: 6, step: 1, def: 4 },
        { key: 'width', label: L('Units per layer', 'Neuronas por capa'), min: 3, max: 14, step: 1, def: 9 },
        { key: 'speed', label: L('Signal speed', 'Velocidad de la señal'), min: 0.2, max: 3, step: 0.1, def: 1 }
      ],
      make() {
        let Wt = [], D = 0, N = 0;
        const rnd = () => (Math.random() * 2 - 1) * 1.4;
        function build(depth, width) {
          D = depth; N = width; Wt = [];
          // Capa 0 recibe 2 entradas; el resto recibe la capa anterior completa
          for (let l = 0; l < D; l++) {
            const inN = l === 0 ? 2 : N;
            Wt.push(Array.from({ length: l === D - 1 ? 1 : N },
                               () => Array.from({ length: inN }, rnd)));
          }
        }
        build(4, 9);
        return {
          reset() { build(D, N); },
          step(ctx, w, h, t, acc, P, M) {
            if ((P.depth | 0) !== D || (P.width | 0) !== N) build(P.depth | 0, P.width | 0);

            // Entrada: el cursor. Sin cursor, un punto que orbita solo.
            const ix = M.in ? (M.x / w) * 2 - 1 : Math.cos(t * 0.5) * 0.8;
            const iy = M.in ? (M.y / h) * 2 - 1 : Math.sin(t * 0.7) * 0.8;

            // Propagación hacia adelante, guardando cada capa
            const acts = [[ix, iy]];
            for (let l = 0; l < D; l++) {
              const prev = acts[acts.length - 1], out = [];
              for (const row of Wt[l]) {
                let z = 0;
                for (let k = 0; k < row.length; k++) z += row[k] * prev[k];
                out.push(Math.tanh(z));
              }
              acts.push(out);
            }

            // El frente de señal barre las capas: eso es lo que se lee como pensar
            const front = (t * P.speed * 0.6) % (D + 2);
            const reach = l => Math.max(0, Math.min(1, front - l));

            const padX = w * 0.12, spanX = w - padX * 2;
            const colX = i => padX + (spanX * i) / (acts.length - 1);
            const nodeY = (layer, i) => {
              const n = layer.length;
              return h * 0.5 + (i - (n - 1) / 2) * Math.min(h * 0.11, h * 0.8 / Math.max(n, 1));
            };

            // Conexiones: grosor por |peso|, brillo por cuánto viaja por ellas
            for (let l = 0; l < D; l++) {
              const from = acts[l], to = acts[l + 1], g = reach(l);
              if (g <= 0) continue;
              for (let j = 0; j < to.length; j++) {
                for (let k = 0; k < from.length; k++) {
                  const wgt = Wt[l][j][k];
                  const flow = Math.abs(wgt * from[k]) * g;
                  if (flow < 0.03) continue;
                  ctx.lineWidth = 0.4 + Math.min(1.6, Math.abs(wgt) * 0.8);
                  ctx.strokeStyle = wgt >= 0
                    ? `rgba(${acc},${Math.min(0.6, flow * 0.55).toFixed(3)})`
                    : `rgba(${neutro()},${Math.min(0.35, flow * 0.3).toFixed(3)})`;
                  ctx.beginPath();
                  ctx.moveTo(colX(l), nodeY(from, k));
                  ctx.lineTo(colX(l + 1), nodeY(to, j));
                  ctx.stroke();
                }
              }
            }

            // Nodos: radio y halo según |activación|
            for (let l = 0; l < acts.length; l++) {
              const layer = acts[l], g = reach(l - 1) || (l === 0 ? 1 : 0);
              for (let i = 0; i < layer.length; i++) {
                const a = Math.abs(layer[i]) * (l === 0 ? 1 : g);
                const x = colX(l), y = nodeY(layer, i);
                ctx.fillStyle = `rgba(${acc},${(0.05 + a * 0.12).toFixed(3)})`;
                ctx.beginPath(); ctx.arc(x, y, 5 + a * 13, 0, TAU); ctx.fill();
                ctx.fillStyle = layer[i] >= 0
                  ? `rgba(${acc},${(0.25 + a * 0.75).toFixed(3)})`
                  : `rgba(${neutro()},${(0.2 + a * 0.6).toFixed(3)})`;
                ctx.beginPath(); ctx.arc(x, y, 2.4 + a * 3.4, 0, TAU); ctx.fill();
              }
            }

            // Salida
            const out = acts[acts.length - 1][0];
            ctx.fillStyle = `rgba(${acc},0.85)`; ctx.font = '11px monospace';
            ctx.fillText('in (' + ix.toFixed(2) + ', ' + iy.toFixed(2) + ')', 12, h - 28);
            ctx.fillText('out ' + out.toFixed(3), 12, h - 12);
          }
        };
      }
    },

    { id: 'mandelbrot',
      name: L('Mandelbrot set', 'Conjunto de Mandelbrot'),
      note: L('One line of algebra, repeated. The edge never stops having detail.',
              'Una línea de álgebra, repetida. El borde nunca deja de tener detalle.'),
      params: [
        { key: 'zoom', label: L('Zoom', 'Zoom'),            min: 0, max: 14, step: 0.05, def: 0 },
        { key: 'iter', label: L('Iterations', 'Iteraciones'), min: 40, max: 400, step: 10, def: 140 },
        { key: 'res',  label: L('Resolution', 'Resolución'),  min: 90, max: 260, step: 10, def: 170 }
      ],
      make() {
        let img = null, off = null, key = '';
        let cx = -0.743643887037151, cy = 0.13182590420533;   // punto de Misiurewicz
        return {
          reset() { cx = -0.743643887037151; cy = 0.13182590420533; },
          step(ctx, w, h, t, acc, P, M) {
            const RES = P.res | 0, IT = P.iter | 0;
            const scale = 3.2 / Math.pow(2, P.zoom);
            // El cursor reencuadra: su posición se vuelve el nuevo centro
            if (M.in) {
              // Paneo suave y acotado: sin el clamp el centro se va fuera del
              // conjunto en un par de segundos y la vista queda en negro plano.
              cx += ((M.x / w - 0.5) * scale) * 0.006;
              cy += ((M.y / h - 0.5) * scale * (h / w)) * 0.006;
              cx = Math.max(-2.3, Math.min(0.9, cx));
              cy = Math.max(-1.3, Math.min(1.3, cy));
            }
            const k = [RES, IT, P.zoom.toFixed(3), cx.toFixed(12), cy.toFixed(12), acc].join('|');
            if (k !== key) {
              key = k;
              if (!img || img.width !== RES) {
                img = ctx.createImageData(RES, RES);
                off = document.createElement('canvas'); off.width = off.height = RES;
              }
              const rgb = acc.split(',').map(Number), px = img.data;
              for (let j = 0; j < RES; j++) {
                const y0 = cy + ((j / RES) - 0.5) * scale;
                for (let i = 0; i < RES; i++) {
                  const x0 = cx + ((i / RES) - 0.5) * scale;
                  let x = 0, y = 0, n = 0, x2 = 0, y2 = 0;
                  // z ← z² + c, hasta escapar del disco de radio 2
                  while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + y0; x = x2 - y2 + x0; x2 = x * x; y2 = y * y; n++; }
                  const o = (j * RES + i) * 4;
                  if (n >= IT) { px[o] = px[o+1] = px[o+2] = 0; px[o+3] = 255; }
                  else {
                    // Suavizado del contador: quita las bandas del escape entero
                    const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;
                    const v = Math.pow(Math.max(0, mu) / IT, 0.32);
                    // Paleta cíclica: una rampa plana esconde los filamentos,
                    // los ciclos los revelan como capas de cebolla.
                    // √mu en vez de mu: da ciclos también donde el escape es rápido
                    const band = 0.5 + 0.5 * Math.cos(Math.sqrt(Math.max(0, mu)) * 2.0 - 1.1);
                    const m1 = 0.30 + 0.70 * band, m2 = (1 - band) * 0.55;
                    px[o]   = Math.min(255, rgb[0] * v * m1 + 245 * v * m2);
                    px[o+1] = Math.min(255, rgb[1] * v * m1 + 248 * v * m2);
                    px[o+2] = Math.min(255, rgb[2] * v * m1 + 255 * v * m2);
                    px[o+3] = 255;
                  }
                }
              }
              off.getContext('2d').putImageData(img, 0, 0);
            }
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(off, 0, 0, w, h);
            ctx.fillStyle = `rgba(${acc},0.85)`; ctx.font = '11px monospace';
            ctx.fillText('zoom ×' + Math.pow(2, P.zoom).toFixed(0), 12, h - 12);
          }
        };
      }
    },

    { id: 'julia',
      name: L('Julia set', 'Conjunto de Julia'),
      note: L('Same rule, one constant. Move the cursor and the whole shape reorganises.',
              'La misma regla, una constante. Mueve el cursor y la forma entera se reorganiza.'),
      params: [
        { key: 'iter', label: L('Iterations', 'Iteraciones'), min: 40, max: 300, step: 10, def: 120 },
        { key: 'res',  label: L('Resolution', 'Resolución'),  min: 90, max: 260, step: 10, def: 170 },
        { key: 'orbit', label: L('Auto orbit', 'Órbita automática'), min: 0, max: 1, step: 1, def: 1 }
      ],
      make() {
        let img = null, off = null, key = '';
        return {
          step(ctx, w, h, t, acc, P, M) {
            const RES = P.res | 0, IT = P.iter | 0;
            // c se toma SOBRE el borde de la cardioide principal:
            //   c = ½e^{iθ} − ¼e^{2iθ}
            // Ahí viven los Julia interesantes. Mapear el cursor a todo el plano
            // deja la mayoría de las posiciones dentro, donde son manchas gordas.
            // Horizontal elige el punto del borde; vertical se aleja hacia adentro
            // (conexo) o hacia afuera (polvo disconexo).
            const th = M.in ? (M.x / w) * TAU : t * 0.12;
            const radial = M.in ? (M.y / h - 0.5) * 0.30 : 0;
            const k1 = (1 + radial);
            const jr = (0.5 * Math.cos(th) - 0.25 * Math.cos(2 * th)) * k1;
            const ji = (0.5 * Math.sin(th) - 0.25 * Math.sin(2 * th)) * k1;
            const k = [RES, IT, jr.toFixed(5), ji.toFixed(5), acc].join('|');
            if (k !== key) {
              key = k;
              if (!img || img.width !== RES) {
                img = ctx.createImageData(RES, RES);
                off = document.createElement('canvas'); off.width = off.height = RES;
              }
              const rgb = acc.split(',').map(Number), px = img.data, scale = 3.0;
              for (let j = 0; j < RES; j++) {
                const y0 = ((j / RES) - 0.5) * scale;
                for (let i = 0; i < RES; i++) {
                  const x0 = ((i / RES) - 0.5) * scale;
                  let x = x0, y = y0, n = 0, x2 = x * x, y2 = y * y;
                  // Igual que Mandelbrot pero c es fijo y z arranca en el píxel
                  while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + ji; x = x2 - y2 + jr; x2 = x * x; y2 = y * y; n++; }
                  const o = (j * RES + i) * 4;
                  if (n >= IT) { px[o] = px[o+1] = px[o+2] = 0; px[o+3] = 255; }
                  else {
                    const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;
                    const v = Math.pow(Math.max(0, mu) / IT, 0.34);
                    // √mu en vez de mu: da ciclos también donde el escape es rápido
                    const band = 0.5 + 0.5 * Math.cos(Math.sqrt(Math.max(0, mu)) * 2.1 - 1.1);
                    const m1 = 0.30 + 0.70 * band, m2 = (1 - band) * 0.55;
                    px[o]   = Math.min(255, rgb[0] * v * m1 + 245 * v * m2);
                    px[o+1] = Math.min(255, rgb[1] * v * m1 + 248 * v * m2);
                    px[o+2] = Math.min(255, rgb[2] * v * m1 + 255 * v * m2);
                    px[o+3] = 255;
                  }
                }
              }
              off.getContext('2d').putImageData(img, 0, 0);
            }
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(off, 0, 0, w, h);
            ctx.fillStyle = `rgba(${acc},0.85)`; ctx.font = '11px monospace';
            ctx.fillText('c = ' + jr.toFixed(3) + (ji >= 0 ? ' + ' : ' − ') + Math.abs(ji).toFixed(3) + 'i', 12, h - 12);
          }
        };
      }
    },

    { id: 'fourier',
      name: L('Fourier series', 'Serie de Fourier'),
      note: L('Enough circles turning at once will draw any shape.',
              'Suficientes círculos girando a la vez dibujan cualquier forma.'),
      params: [
        { key: 'terms', label: L('Harmonics', 'Armónicos'), min: 1, max: 20, step: 1, def: 6 },
        { key: 'speed', label: L('Speed', 'Velocidad'),     min: 0, max: 2, step: 0.05, def: 0.6 }
      ],
      make() {
        let trace = [];
        return {
          reset() { trace = []; },
          step(ctx, w, h, t, acc, P, M) {
            const cx = w * 0.34, cy = h / 2, R = Math.min(w, h) * 0.17;
            // El mouse arrastra la fase: puedes recorrer la onda a mano
            const phase = M.in ? (M.x / w) * 12 : t * P.speed;
            let x = cx, y = cy;
            ctx.lineWidth = 1;
            for (let i = 0; i < (P.terms | 0); i++) {
              const n = i * 2 + 1, r = R * (4 / (n * Math.PI));
              const px = x, py = y;
              x += r * Math.cos(n * phase); y += r * Math.sin(n * phase);
              ctx.strokeStyle = `rgba(${acc},0.20)`;
              ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.stroke();
              ctx.strokeStyle = `rgba(${acc},0.45)`;
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
            }
            trace.unshift(y);
            if (trace.length > Math.floor(w * 0.6)) trace.pop();
            ctx.strokeStyle = `rgba(${acc},0.85)`; ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (let i = 0; i < trace.length; i++) {
              const tx = w * 0.62 + i, ty = trace[i];
              i ? ctx.lineTo(tx, ty) : ctx.moveTo(tx, ty);
            }
            ctx.stroke();
            ctx.strokeStyle = `rgba(${acc},0.3)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(w * 0.62, trace[0]); ctx.stroke();
          }
        };
      }
    },

    { id: 'galaxia',
      name: L('Spiral galaxy', 'Galaxia espiral'),
      note: L('Two thousand stars, one law of rotation. The arms wind themselves up.',
              'Dos mil estrellas, una ley de rotación. Los brazos se enrollan solos.'),
      params: [
        { key: 'brazos', label: L('Arms', 'Brazos'),           min: 1, max: 6, step: 1,    def: 3 },
        { key: 'giro',   label: L('Pitch g', 'Paso g'),        min: 1, max: 9, step: 0.1,  def: 4.6 },
        { key: 'vel',    label: L('Rotation ω', 'Rotación ω'), min: 0, max: 3, step: 0.05, def: 1 }
      ],
      make() {
        // Cada estrella guarda radio, brazo, desvío y fase de parpadeo. El
        // ángulo se recalcula en cada frame desde los deslizadores: cambiar
        // el número de brazos repliega la galaxia sin resembrar el campo.
        let stars = [];
        const sow = () => {
          stars = [];
          for (let i = 0; i < 2000; i++) {
            const u = Math.pow(Math.random(), 0.72);            // más densidad al núcleo
            stars.push({
              u,
              arm: (Math.random() * 6) | 0,
              jit: (Math.random() - 0.5) * (0.14 + u * 0.6),    // los brazos se deshilachan afuera
              sz: 0.5 + Math.random() * 1.5,
              tw: Math.random() * Math.PI * 2
            });
          }
        };
        sow();
        return {
          reset() { sow(); },
          step(ctx, w, h, t, acc, P, M) {
            const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
            // El cursor inclina el disco: de frente arriba, de canto abajo
            const inc = M.in ? 0.1 + (M.y / h) * 1.25 : 0.44;
            const ci = Math.cos(inc);
            ctx.globalCompositeOperation = 'lighter';
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
            g.addColorStop(0, `rgba(${acc},0.5)`);
            g.addColorStop(0.3, `rgba(${acc},0.1)`);
            g.addColorStop(1, `rgba(${acc},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(cx, cy, R * 0.5, R * 0.5 * ci, 0, 0, Math.PI * 2);
            ctx.fill();
            for (const s of stars) {
              const r = 0.05 + s.u * 0.95;
              // Rotación diferencial kepleriana: ω ∝ 1/√r
              const om = P.vel / Math.sqrt(r);
              // Espiral logarítmica más deriva temporal: el enrollamiento en vivo
              const th = (s.arm % P.brazos) * (Math.PI * 2 / P.brazos)
                       + P.giro * Math.log(r + 0.12) + s.jit + t * 0.05 * om;
              const x = cx + Math.cos(th) * r * R;
              const y = cy + Math.sin(th) * r * R * ci;
              const b = (0.3 + 0.7 * (1 - s.u)) * (0.74 + 0.26 * Math.sin(t * 2.2 + s.tw));
              ctx.fillStyle = `rgba(${acc},${(b * 0.3).toFixed(3)})`;
              ctx.beginPath(); ctx.arc(x, y, s.sz * 2.6, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = `rgba(${acc},${b.toFixed(3)})`;
              ctx.beginPath(); ctx.arc(x, y, s.sz * 0.75, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
          }
        };
      }
    },
  ];

  /* ── Motor ────────────────────────────────────────────────────────────── */
  function accent() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
    const n = v.split(/\s+/).map(Number);
    return (n.length === 3 && n.every(x => !isNaN(x))) ? n.join(',') : '255,179,71';
  }

  /* ── Tema del lienzo ──────────────────────────────────────────────────
     El canvas no hereda CSS: aquí los colores son strings. Dos cosas cambian
     con el modo claro:

     · El rastro. Los experimentos con estela no borran el lienzo: pintan un
       velo encima cada frame. Ese velo estaba fijo en negro, así que sobre
       papel el experimento se ennegrecía solo hasta quedar oscuro. Ahora el
       velo es del color del fondo real.
     · La tinta neutra. Los blancos (`235,238,245`) son el contrapunto del
       acento sobre negro; sobre blanco no se ven. Pasan a tinta oscura. */
  const claro = () => document.documentElement.dataset.mode === 'light';
  /* Velo del rastro: del color del papel, no negro. */
  const velo = () => (claro() ? '247,249,252' : '0,0,0');
  /* Tinta neutra (lo que en oscuro era blanco). */
  const neutro = () => (claro() ? '20,30,52' : '235,238,245');
  /* Blanco puro de los destellos ↔ tinta profunda en claro. */
  const nucleo = () => (claro() ? '8,13,24' : '255,255,255');

  function mount(canvas, id, opts) {
    opts = opts || {};
    const def = EXPERIMENTS.find(e => e.id === id);
    if (!canvas || !def) return null;
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, inst = null, raf = 0, t = 0, acc = accent();

    // Los experimentos escriben sus lecturas con una tipografía fija pensada
    // para un lienzo ancho. En un teléfono el lienzo mide ~330px y esas líneas
    // se salían cortadas por el borde derecho, en los 38. En vez de reescribir
    // cada texto, el motor encoge la tipografía de esa llamada lo justo para
    // que entre, y solo cuando hace falta.
    const drawText = ctx.fillText.bind(ctx);
    ctx.fillText = function (txt, x, y) {
      const room = w - x - 8;
      if (room <= 0) return;
      const need = ctx.measureText(txt).width;
      if (need <= room) return drawText(txt, x, y);
      const face = /^(\d+(?:\.\d+)?)px\s+(.+)$/.exec(ctx.font);
      const shrunk = face && parseFloat(face[1]) * (room / need);
      if (shrunk && shrunk >= 7.5) {
        const keep = ctx.font;
        ctx.font = shrunk.toFixed(2) + 'px ' + face[2];
        drawText(txt, x, y);
        ctx.font = keep;
      } else {
        drawText(txt, x, y, room);   // ya demasiado chica: que el canvas la comprima
      }
    };

    const P = {};
    (def.params || []).forEach(p => { P[p.key] = p.def; });
    const M = { x: 0, y: 0, in: false };

    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      M.x = e.clientX - r.left; M.y = e.clientY - r.top; M.in = true;
    }, { passive: true });
    canvas.addEventListener('pointerleave', () => { M.in = false; }, { passive: true });

    function size() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!inst) inst = def.make(w, h);
      else if (inst.resize) inst.resize(w, h);
      ctx.clearRect(0, 0, w, h);
      return true;
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!w && !size()) return;
      t += reduce ? 0 : 0.016;
      if (inst.fade) { ctx.fillStyle = `rgba(${velo()},${inst.fade})`; ctx.fillRect(0, 0, w, h); }
      else if (!inst.persist) ctx.clearRect(0, 0, w, h);
      inst.step(ctx, w, h, t, acc, P, M);
      if (reduce) { cancelAnimationFrame(raf); raf = 0; }
    }

    addEventListener('resize', () => { w = 0; }, { passive: true });
    addEventListener('themechange', () => { acc = accent(); });

    new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { if (!raf) { size(); frame(); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }), { threshold: 0.01 }).observe(canvas);

    const api = {
      id, params: P,
      set(k, v) { P[k] = v; },
      reset() { if (inst && inst.reset) { inst.reset(); ctx.clearRect(0, 0, w, h); } },
      stop() { if (raf) cancelAnimationFrame(raf); }
    };
    if (opts.controls) buildControls(opts.controls, def, api);
    return api;
  }

  /* ── Controles ────────────────────────────────────────────────────────── */
  function buildControls(host, def, api) {
    if (!def.params || !def.params.length) return;
    const es = () => document.documentElement.lang === 'es';
    host.innerHTML = '';
    def.params.forEach(p => {
      const row = document.createElement('label');
      row.className = 'ctl';
      const val = document.createElement('output');
      const fmt = v => (p.step < 1 ? Number(v).toFixed(String(p.step).split('.')[1].length) : v) + (p.unit || '');
      row.innerHTML = `<span class="ctl-l" data-en="${p.label.en}" data-es="${p.label.es}">${es() ? p.label.es : p.label.en}</span>`;
      const input = document.createElement('input');
      input.type = 'range'; input.min = p.min; input.max = p.max; input.step = p.step; input.value = p.def;
      val.className = 'ctl-v'; val.textContent = fmt(p.def);
      input.addEventListener('input', () => { api.set(p.key, +input.value); val.textContent = fmt(input.value); });
      row.appendChild(input); row.appendChild(val);
      host.appendChild(row);
    });
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ctl-reset';
    btn.dataset.en = 'Reset'; btn.dataset.es = 'Reiniciar';
    btn.textContent = es() ? 'Reiniciar' : 'Reset';
    btn.addEventListener('click', () => {
      def.params.forEach((p, i) => {
        const inp = host.querySelectorAll('input')[i];
        inp.value = p.def; inp.dispatchEvent(new Event('input'));
      });
      api.reset();
    });
    host.appendChild(btn);
  }

  global.LAB = { experiments: EXPERIMENTS, mount, accent };
})(window);
