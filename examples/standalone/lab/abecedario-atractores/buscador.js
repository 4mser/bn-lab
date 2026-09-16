/* ═══════════════════════════════════════════════════════════════════════
   ABECEDARIO DE ATRACTORES — el buscador.
   ═══════════════════════════════════════════════════════════════════════
   El problema tiene dos niveles y cuestan cosas muy distintas:

     nivel externo   qué sistema y con qué parámetros → hay que INTEGRAR.
     nivel interno   desde qué ángulo se mira eso     → sólo hay que PROYECTAR.

   Integrar cuesta decenas de miles de pasos de Runge–Kutta; proyectar es una
   pasada sobre la nube ya calculada. Así que la aptitud de un juego de
   parámetros se define como "el mejor puntaje que se consigue mirando esa
   nube desde cualquier ángulo": se integra una vez y se prueban cientos de
   orientaciones encima. Es la diferencia entre segundos y minutos por letra.

   ── Por qué esta familia de optimizadores ────────────────────────────────
   La función a maximizar es negra, discontinua y llena de máximos locales:
   un cambio chico en un parámetro puede hacer que el atractor cambie de
   régimen y la forma salte. No hay gradiente que seguir, así que descenso
   por gradiente y sus derivados quedan fuera de plano.

   Se usa sep-CMA-ES: una estrategia de evolución que mantiene una gaussiana
   sobre el espacio de parámetros y, generación a generación, la mueve hacia
   donde puntúan mejor las muestras y le ajusta el ancho por eje. "sep" es por
   separable: la covarianza se guarda sólo en la diagonal. La CMA-ES completa
   guarda la matriz entera y necesita descomponerla en autovalores, que en
   treinta dimensiones y dentro de un worker no se paga solo; la diagonal
   captura lo que acá importa —que cada parámetro tiene su propia escala— a
   coste lineal.

   El nivel interno no usa CMA: es un muestreo cuasi-aleatorio de
   orientaciones seguido de una búsqueda por patrón que encoge el paso. Con
   tres variables acotadas eso encuentra el máximo local igual de bien y
   cuesta una fracción.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  const N = raiz.ABC_NUCLEO;

  /* Azar reproducible. Dos corridas con la misma semilla dan la misma letra:
     sin esto no se puede depurar un hallazgo ni volver a él. */
  function azar(semilla) {
    let a = semilla >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const normal = rnd => {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* ── Parámetros: el buscador trabaja en [0,1]^d y acá se traduce ────── */
  function aParams(sis, z) {
    const P = {};
    if (sis.libre) {
      const c = new Float64Array(30);
      for (let i = 0; i < 30; i++) {
        const r = sis.rango[i];
        c[i] = r.min + (r.max - r.min) * Math.min(1, Math.max(0, z[i]));
      }
      P.c = c;
      return P;
    }
    for (let i = 0; i < sis.rango.length; i++) {
      const r = sis.rango[i];
      P[r.k] = r.min + (r.max - r.min) * Math.min(1, Math.max(0, z[i]));
    }
    return P;
  }
  function deDefectos(sis) {
    return sis.rango.map(r => (r.max - r.min) > 0 ? (r.def - r.min) / (r.max - r.min) : 0.5);
  }

  /* ── Nivel interno: el ángulo ─────────────────────────────────────────
     Grueso y fino. El grueso barre orientaciones al azar —yaw y roll en toda
     la vuelta, pitch por el coseno para no amontonar muestras en los polos—.
     El fino toma las mejores y hace búsqueda por patrón: prueba ±paso en cada
     eje, se queda con la mejora, y cuando ninguna mejora encoge el paso.

     Devuelve {punt, vista} con la mejor orientación encontrada. */
  /* Mapa de orientaciones: rejilla equirectangular donde cada celda guarda el
     MEJOR puntaje conseguido mirando desde esa dirección. Se llena con todas
     las orientaciones que el nivel interno evalúa —cientos por candidato— y es
     lo que convierte la búsqueda de ángulo en algo que se puede mirar: se ve
     dónde están las direcciones buenas y cómo el refino se concentra en ellas.
     Va en Uint8 porque se manda al hilo principal varias veces por segundo. */
  const MAPA_W = 72, MAPA_H = 36;

  function anotarMapa(mapa, v, p) {
    if (!mapa) return;
    let yaw = v.yaw % (Math.PI * 2);
    if (yaw < 0) yaw += Math.PI * 2;
    const pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, v.pitch));
    const i = Math.min(MAPA_W - 1, Math.floor(yaw / (Math.PI * 2) * MAPA_W));
    const j = Math.min(MAPA_H - 1, Math.floor((pitch + Math.PI / 2) / Math.PI * MAPA_H));
    const q = Math.min(255, Math.round(p * 255));
    const k = j * MAPA_W + i;
    if (q > mapa[k]) mapa[k] = q;
  }

  function mejorVista(tray, obj, G, gridA, gridB, cfg, rnd, mapa) {
    const grueso = cfg.grueso, finos = cfg.finos, pasosFino = cfg.pasosFino;
    const estirar = !!cfg.estirado;

    const evaluar = v => {
      if (!N.proyectar(tray, v, G, gridA, cfg.margen)) return 0;
      N.normalizar(gridA, gridB);
      const p = N.puntuar(gridB, obj, G);
      anotarMapa(mapa, v, p);
      return p;
    };

    const expo = !!cfg.exposicion;      // ¿se puede recortar la exposición?
    const cand = [];
    for (let i = 0; i < grueso; i++) {
      const largo = expo ? 0.25 + rnd() * 0.75 : 1;
      const v = {
        yaw: rnd() * Math.PI * 2,
        pitch: Math.asin(rnd() * 2 - 1),
        roll: rnd() * Math.PI * 2,
        ex: estirar ? 0.7 + rnd() * 0.9 : 1,
        ey: 1,
        desde: expo ? rnd() * (1 - largo) : 0,
        largo: largo
      };
      cand.push({ v: v, p: evaluar(v) });
    }
    cand.sort((a, b) => b.p - a.p);

    let mejor = cand[0] || { v: { yaw: 0, pitch: 0, roll: 0, ex: 1, ey: 1, desde: 0, largo: 1 }, p: 0 };
    // Cada eje con su propio paso: los ángulos viven en radianes y la ventana
    // en fracciones de trayectoria, así que un paso común mueve mucho a uno y
    // nada al otro.
    const ejes = [['yaw', 1], ['pitch', 1], ['roll', 1]];
    if (estirar) ejes.push(['ex', 0.4]);
    if (expo) { ejes.push(['desde', 0.3]); ejes.push(['largo', 0.3]); }

    const acotar = (k, x) =>
      k === 'ex' ? Math.min(1.8, Math.max(0.55, x))
      : k === 'desde' ? Math.min(0.75, Math.max(0, x))
      : k === 'largo' ? Math.min(1, Math.max(0.25, x))
      : x;

    for (let s = 0; s < Math.min(finos, cand.length); s++) {
      let v = Object.assign({}, cand[s].v), p = cand[s].p;
      let paso = 0.35;
      for (let it = 0; it < pasosFino; it++) {
        let mejoro = false;
        for (let e = 0; e < ejes.length; e++) {
          const k = ejes[e][0], esc = ejes[e][1];
          for (let sg = -1; sg <= 1; sg += 2) {
            const w = Object.assign({}, v);
            w[k] = acotar(k, v[k] + sg * paso * esc);
            const q = evaluar(w);
            if (q > p) { p = q; v = w; mejoro = true; }
          }
        }
        if (!mejoro) { paso *= 0.5; if (paso < 0.004) break; }
      }
      if (p > mejor.p) mejor = { v: v, p: p };
    }
    return mejor;
  }

  /* ── Nivel externo: sep-CMA-ES sobre los parámetros del sistema ─────── */
  function buscarSistema(op) {
    const sis = raiz.ABC_SISTEMA(op.sistemaId);
    const obj = op.objetivo, G = op.G;
    const cfg = op.cfg || {};
    const rnd = azar(op.semilla || 12345);
    const d = sis.rango.length;

    const gridA = new Float32Array(G * G), gridB = new Float32Array(G * G);
    const vistaCfg = {
      grueso: cfg.grueso || 110, finos: cfg.finos || 3, pasosFino: cfg.pasosFino || 26,
      estirado: !!cfg.estirado, margen: cfg.margen
    };
    const tcfg = { n: cfg.puntos || 6000, transitorio: cfg.transitorio || 1200, lyapMin: cfg.lyapMin };

    /* Telemetría. No cambia la búsqueda; sólo la deja mirar. El mapa de
       orientaciones se acumula acá y se manda entero cada tanto; la población
       de cada generación se manda como coordenadas ya proyectadas a dos
       dimensiones, que es lo único que el panel necesita. */
    const mapa = op.telemetria ? new Uint8Array(MAPA_W * MAPA_H) : null;
    /* Proyección a dos ejes para el mapa de parámetros. En los sistemas con
       nombre son literalmente los dos primeros parámetros, que tienen nombre y
       significado —σ y ρ en Lorenz—. En la familia libre no hay dos que
       manden, así que se usa una proyección aleatoria FIJA de las treinta
       dimensiones a dos: no es interpretable una por una, pero conserva
       distancias relativas, que es lo que hace falta para ver si el enjambre
       se concentra o se dispersa. */
    const proy = (function () {
      if (!sis.libre || d < 3) return null;
      const r = azar(20240117);
      const a = new Float64Array(d), b = new Float64Array(d);
      for (let i = 0; i < d; i++) { a[i] = normal(r); b[i] = normal(r); }
      return { a: a, b: b };
    })();
    function dosEjes(z) {
      if (!proy) return [z[0], d > 1 ? z[1] : 0.5];
      let x = 0, y = 0;
      for (let i = 0; i < d; i++) { x += proy.a[i] * (z[i] - 0.5); y += proy.b[i] * (z[i] - 0.5); }
      const k = 1 / (2 * Math.sqrt(d));
      return [0.5 + x * k, 0.5 + y * k];
    }

    /* aptitud(z) → {p, vista, lyap} · devuelve 0 si el sistema no es válido */
    function aptitud(z) {
      const P = aParams(sis, z);
      const tr = N.trayectoria(sis, P, tcfg);
      if (!tr.ok) return { p: 0, motivo: tr.motivo };
      const m = mejorVista(tr, obj, G, gridA, gridB, vistaCfg, rnd, mapa);
      return { p: m.p, vista: m.v, lyap: tr.lyap };
    }

    /* Miniatura del mejor: la misma proyección que puntúa, en una grilla
       chica y en bytes, para que el panel muestre la figura que va ganando
       sin tener que reintegrar nada en el hilo principal. */
    const MINI = 44;
    const miniA = new Float32Array(MINI * MINI), miniB = new Float32Array(MINI * MINI);
    function miniatura(z, vista) {
      const tr = N.trayectoria(sis, aParams(sis, z), { n: 9000, transitorio: 1500 });
      if (!tr.ok || !N.proyectar(tr, vista, MINI, miniA)) return null;
      N.normalizar(miniA, miniB);
      const out = new Uint8Array(MINI * MINI);
      for (let i = 0; i < out.length; i++) out[i] = Math.min(255, Math.round(miniB[i] * 255));
      return out;
    }

    // Población y pesos estándar de CMA-ES.
    const lam = cfg.poblacion || Math.max(8, 4 + Math.floor(3 * Math.log(d)));
    const mu = Math.floor(lam / 2);
    const w = new Float64Array(mu);
    let sw = 0;
    for (let i = 0; i < mu; i++) { w[i] = Math.log(mu + 0.5) - Math.log(i + 1); sw += w[i]; }
    for (let i = 0; i < mu; i++) w[i] /= sw;
    let muEff = 0;
    for (let i = 0; i < mu; i++) muEff += w[i] * w[i];
    muEff = 1 / muEff;

    const cc = (4 + muEff / d) / (d + 4 + 2 * muEff / d);
    const cs = (muEff + 2) / (d + muEff + 5);
    // Coeficientes de la variante separable: el factor (d+2)/3 es el que
    // compensa guardar sólo la diagonal (Ros y Hansen, 2008).
    const c1 = 2 / ((d + 1.3) * (d + 1.3) + muEff) * (d + 2) / 3;
    const cmu = Math.min(1 - c1, 2 * (muEff - 2 + 1 / muEff) / ((d + 2) * (d + 2) + muEff)) * (d + 2) / 3;
    const damps = 1 + 2 * Math.max(0, Math.sqrt((muEff - 1) / (d + 1)) - 1) + cs;
    const chiN = Math.sqrt(d) * (1 - 1 / (4 * d) + 1 / (21 * d * d));

    /* ── Siembra ────────────────────────────────────────────────────────
       Para los sistemas con nombre se parte de sus valores clásicos: son
       caóticos por construcción y el optimizador tiene señal desde la primera
       generación.

       Para la familia libre no hay "valores clásicos". Partir del vector cero
       —que es lo que da el punto medio de los rangos— deja al buscador en una
       región donde TODO se descarta: el sistema nulo no se mueve, y sus
       vecinos son lineales y caen a un punto fijo. Con todos los hijos en
       cero, sep-CMA-ES no tiene gradiente empírico que seguir y se convierte
       en un paseo al azar caro. Se midió: 40 generaciones y ni una figura.

       La salida es la que usó Sprott para catalogar esta familia: sorteo con
       rechazo. Se tiran vectores al azar y se conserva el primero que pase el
       validador —acotado y con exponente de Lyapunov positivo—. Medido en
       este código, uno de cada siete u ocho sorteos pasa, así que encontrar
       semilla cuesta milisegundos. Desde ahí sí hay de dónde subir. */
    function sembrar() {
      if (!sis.libre) return deDefectos(sis);
      for (let intento = 0; intento < 400; intento++) {
        const z = new Array(d);
        for (let i = 0; i < d; i++) z[i] = rnd();
        const tr = N.trayectoria(sis, aParams(sis, z), tcfg);
        if (tr.ok) return z;
      }
      return deDefectos(sis);
    }

    let m = op.semillaZ ? op.semillaZ.slice() : sembrar();
    // La familia libre parte de un punto válido y aislado: con sigma grande el
    // primer paso ya sale de la región caótica y se pierde la semilla.
    let sigma = cfg.sigma0 || (sis.libre ? 0.10 : 0.28);
    const C = new Float64Array(d).fill(1);
    const ps = new Float64Array(d), pc = new Float64Array(d);

    let mejor = { p: 0, z: m.slice(), vista: null, lyap: 0 };
    /* Los mejores de la corrida, no sólo el mejor. Existen por la
       confirmación final: si el ganador resulta no ser un atractor caótico
       cuando se lo integra en serio, hay que poder caer al siguiente. */
    const podio = [];
    function anotar(c) {
      podio.push({ p: c.p, z: c.z.slice ? Array.from(c.z) : c.z, vista: c.vista, lyap: c.lyap });
      podio.sort((a, b) => b.p - a.p);
      if (podio.length > 6) podio.length = 6;
    }
    let sinMejora = 0;
    const gens = cfg.generaciones || 26;
    const descartes = { diverge: 0, punto: 0, 'no-caotico': 0 };

    for (let g = 0; g < gens; g++) {
      const hijos = [];
      for (let k = 0; k < lam; k++) {
        const z = new Float64Array(d), y = new Float64Array(d);
        for (let i = 0; i < d; i++) {
          y[i] = normal(rnd) * Math.sqrt(C[i]);
          z[i] = Math.min(1, Math.max(0, m[i] + sigma * y[i]));
        }
        const a = aptitud(z);
        if (a.motivo && descartes[a.motivo] != null) descartes[a.motivo]++;
        hijos.push({ z: z, y: y, p: a.p, vista: a.vista, lyap: a.lyap });
      }
      hijos.sort((a, b) => b.p - a.p);

      let mejoro = false;
      if (hijos[0].p > 0) anotar(hijos[0]);
      if (hijos[0].p > mejor.p) {
        mejor = { p: hijos[0].p, z: Array.from(hijos[0].z), vista: hijos[0].vista, lyap: hijos[0].lyap };
        sinMejora = 0; mejoro = true;
      } else sinMejora++;

      // Recombinación
      const mAnt = m.slice();
      const yw = new Float64Array(d);
      m = new Array(d).fill(0);
      for (let i = 0; i < mu; i++)
        for (let j = 0; j < d; j++) m[j] += w[i] * hijos[i].z[j];
      for (let j = 0; j < d; j++) yw[j] = (m[j] - mAnt[j]) / sigma;

      // Caminos de evolución
      let normPs = 0;
      for (let j = 0; j < d; j++) {
        ps[j] = (1 - cs) * ps[j] + Math.sqrt(cs * (2 - cs) * muEff) * yw[j] / Math.sqrt(C[j]);
        normPs += ps[j] * ps[j];
      }
      normPs = Math.sqrt(normPs);
      const hsig = normPs / Math.sqrt(1 - Math.pow(1 - cs, 2 * (g + 1))) / chiN < 1.4 + 2 / (d + 1) ? 1 : 0;
      for (let j = 0; j < d; j++)
        pc[j] = (1 - cc) * pc[j] + hsig * Math.sqrt(cc * (2 - cc) * muEff) * yw[j];

      // Covarianza diagonal
      for (let j = 0; j < d; j++) {
        let rank = 0;
        for (let i = 0; i < mu; i++) rank += w[i] * hijos[i].y[j] * hijos[i].y[j];
        C[j] = (1 - c1 - cmu) * C[j] + c1 * (pc[j] * pc[j] + (1 - hsig) * cc * (2 - cc) * C[j]) + cmu * rank;
        if (!(C[j] > 1e-12)) C[j] = 1e-12;
        if (C[j] > 4) C[j] = 4;
      }
      sigma *= Math.exp((cs / damps) * (normPs / chiN - 1));
      sigma = Math.min(0.6, Math.max(0.006, sigma));

      if (op.alPaso) {
        const t = op.telemetria ? {
          // La población de esta generación, ya proyectada a dos ejes.
          pobl: hijos.map(h => { const e = dosEjes(h.z); return [+e[0].toFixed(4), +e[1].toFixed(4), +h.p.toFixed(4)]; }),
          // El estado interno del optimizador: dónde está la gaussiana y
          // cuánto mide. Es literalmente lo que el método "cree" en este
          // momento sobre dónde vive la solución.
          media: dosEjes(m).map(v => +v.toFixed(4)),
          ancho: [+(sigma * Math.sqrt(C[0])).toFixed(4),
                  +(sigma * Math.sqrt(C[Math.min(1, d - 1)])).toFixed(4)],
          sigma: +sigma.toFixed(4),
          mapa: mapa,
          ejes: proy ? ['proyección aleatoria 30→2', ''] : [sis.rango[0].k, d > 1 ? sis.rango[1].k : ''],
          mini: mejoro ? miniatura(mejor.z, mejor.vista) : null
        } : null;
        op.alPaso({ gen: g + 1, gens: gens, mejor: mejor, sistemaId: sis.id,
                    descartes: descartes, tele: t, mejoro: mejoro });
      }

      // Reinicio: la gaussiana colapsó o lleva muchas generaciones sin
      // aprender nada. En un paisaje con tantos máximos locales, insistir
      // sobre uno agotado rinde menos que volver a tirar los dados.
      if (sigma <= 0.0065 || sinMejora >= (cfg.paciencia || 8)) {
        m = sis.libre ? sembrar()
                      : deDefectos(sis).map(v => Math.min(1, Math.max(0, v + normal(rnd) * 0.3)));
        sigma = cfg.sigma0 || (sis.libre ? 0.10 : 0.28);
        C.fill(1); ps.fill(0); pc.fill(0);
        sinMejora = 0;
      }
    }

    /* ── Confirmación ────────────────────────────────────────────────────
       Durante la búsqueda cada candidato se integra corto: son miles de
       integraciones y hay que poder pagarlas. Pero el exponente de Lyapunov
       estimado sobre pocos miles de pasos es poco fiable, y por ahí se cuelan
       ciclos límite —órbitas periódicas cerradas— que puntúan muy bien contra
       letras redondas y NO son atractores extraños.

       Pasó de verdad: la mejor figura de todo el primer barrido fue una "I"
       con 0,862 que al integrarla en serio resultó ser periódica. Por eso el
       ganador se vuelve a validar con la trayectoria larga, la misma con la
       que se va a dibujar, y si no aguanta se cae al siguiente del podio.
       Cuesta media docena de integraciones al final de la corrida. */
    let elegido = null;
    for (let i = 0; i < podio.length; i++) {
      const c = podio[i];
      const tr = N.trayectoria(sis, aParams(sis, c.z),
        { n: (cfg.puntosConfirma || 45000), transitorio: 3000, lyapMin: cfg.lyapMin });
      if (tr.ok) { elegido = { p: c.p, z: c.z, vista: c.vista, lyap: tr.lyap }; break; }
    }
    if (!elegido) elegido = { p: 0, z: mejor.z, vista: null, lyap: 0 };

    return {
      sistemaId: sis.id, punt: elegido.p, z: elegido.z, vista: elegido.vista,
      lyap: elegido.lyap, params: aParams(sis, elegido.z), descartes: descartes,
      confirmados: podio.length
    };
  }

  raiz.ABC_BUSCADOR = { buscarSistema, aParams, deDefectos, azar, mejorVista,
                        MAPA_W: MAPA_W, MAPA_H: MAPA_H, MINI: 44 };

})(typeof self !== 'undefined' ? self : this);
