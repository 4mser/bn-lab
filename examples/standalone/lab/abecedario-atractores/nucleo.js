/* ═══════════════════════════════════════════════════════════════════════
   ABECEDARIO DE ATRACTORES — núcleo numérico.
   ═══════════════════════════════════════════════════════════════════════
   Cuatro piezas, en el orden en que las usa el buscador:

     1. trayectoria()  integra el sistema y decide si lo que salió es un
                       atractor caótico de verdad o basura.
     2. proyectar()    gira la nube en 3D y la dibuja en una grilla chica,
                       trazando los segmentos y no sólo los puntos.
     3. objetivo()     rasteriza una letra y le calcula la transformada de
                       distancia, que es lo que permite castigar la tinta
                       suelta según lo lejos que cayó.
     4. puntuar()      compara las dos grillas.

   Una decisión que ordena todo el buscador: la trayectoria NO depende del
   ángulo. Integrar cuesta decenas de miles de pasos; proyectar cuesta una
   pasada sobre la nube ya calculada. Por eso se integra una vez por juego de
   parámetros y después se prueban cientos de ángulos sobre la misma nube.
   Invertir ese orden multiplica el costo por cien y fue lo primero que se
   midió al escribir esto.

   Vive en `self` para poder cargarse igual desde la página y desde el worker.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  /* ── 1. Integración y validación ──────────────────────────────────────
     Runge–Kutta 4. Euler alcanza para dibujar, pero acá el mismo sistema se
     integra miles de veces con parámetros distintos y con Euler el error de
     paso cambia la FORMA: el buscador terminaba premiando artefactos del
     integrador. RK4 cuesta cuatro evaluaciones por paso y devuelve la misma
     figura con dt más grande, así que sale casi gratis.

     Junto con la nube se estima el exponente de Lyapunov mayor por el método
     clásico de Benettin: una trayectoria sombra a distancia mínima, y cada
     cierto número de pasos se mide cuánto se separó y se la vuelve a acercar.
     Si el promedio de esos logaritmos es positivo, hay caos. Sin esta prueba
     el buscador se llena de ciclos límite: son curvas cerradas, puntúan bien
     contra letras redondas y no son atractores extraños. */

  const D = new Float64Array(3);
  const Ds = new Float64Array(3);
  const K1 = new Float64Array(3), K2 = new Float64Array(3),
        K3 = new Float64Array(3), K4 = new Float64Array(3), TMP = new Float64Array(3);

  function paso(f, e, P, dt, k1, k2, k3, k4, tmp) {
    f(e[0], e[1], e[2], P, k1);
    tmp[0] = e[0] + k1[0] * dt / 2; tmp[1] = e[1] + k1[1] * dt / 2; tmp[2] = e[2] + k1[2] * dt / 2;
    f(tmp[0], tmp[1], tmp[2], P, k2);
    tmp[0] = e[0] + k2[0] * dt / 2; tmp[1] = e[1] + k2[1] * dt / 2; tmp[2] = e[2] + k2[2] * dt / 2;
    f(tmp[0], tmp[1], tmp[2], P, k3);
    tmp[0] = e[0] + k3[0] * dt; tmp[1] = e[1] + k3[1] * dt; tmp[2] = e[2] + k3[2] * dt;
    f(tmp[0], tmp[1], tmp[2], P, k4);
    e[0] += dt * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
    e[1] += dt * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
    e[2] += dt * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) / 6;
  }

  const LIMITE = 1e6;          // más allá de esto se considera divergencia
  const D0 = 1e-9;             // separación de la trayectoria sombra

  /* Paso por longitud de arco.
     Un dt fijo sirve cuando el sistema es conocido y su escala también. Acá el
     buscador compara un Lorenz —de diámetro ~50 y velocidades de ~150— contra
     un sorteo cualquiera de la familia libre, que puede tener diámetro 0,3.
     Con el mismo dt uno queda dibujado con trazo continuo y el otro con puntos
     sueltos, y entonces el puntaje termina midiendo la escala del sistema en
     vez de su forma.

     Se sondea con el dt nominal, se mide el diámetro y la rapidez típica, y se
     elige el dt que hace que cada paso avance un ~1% del diámetro. Todos los
     sistemas quedan dibujados con la misma densidad de trazo y se pueden
     comparar. */
  function pasoAuto(sis, P, sem, dtNominal) {
    const e = sem.slice();
    const f = sis.f;
    let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity, mnz = Infinity, mxz = -Infinity;
    let vel = 0, cuenta = 0;
    for (let i = 0; i < 900; i++) {
      paso(f, e, P, dtNominal, K1, K2, K3, K4, TMP);
      if (!isFinite(e[0] + e[1] + e[2]) || Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) > LIMITE) return 0;
      if (i < 300) continue;             // transitorio del sondeo
      if (e[0] < mnx) mnx = e[0]; if (e[0] > mxx) mxx = e[0];
      if (e[1] < mny) mny = e[1]; if (e[1] > mxy) mxy = e[1];
      if (e[2] < mnz) mnz = e[2]; if (e[2] > mxz) mxz = e[2];
      f(e[0], e[1], e[2], P, D);
      vel += Math.hypot(D[0], D[1], D[2]); cuenta++;
    }
    const diam = Math.max(mxx - mnx, mxy - mny, mxz - mnz);
    const rapidez = cuenta ? vel / cuenta : 0;
    if (!(diam > 1e-9) || !(rapidez > 1e-12)) return 0;
    return Math.min(0.2, Math.max(1e-5, 0.01 * diam / rapidez));
  }

  function trayectoria(sis, P, opt) {
    const o = opt || {};
    const f = sis.f;

    let dt = o.dt || sis.dt;
    if (o.dtAuto !== false) {
      const d = pasoAuto(sis, P, o.sem || sis.sem, dt);
      if (!d) return { ok: false, motivo: 'diverge' };
      dt = d;
    }

    /* Subdivisión del paso.
       La ventana de exposición se guarda como fracción de la trayectoria. Si
       el visor integrara MÁS pasos que el buscador, esa fracción cubriría un
       tramo de recorrido más largo y la figura dibujada no sería la que se
       puntuó — se vio en la lámina de contactos: la G y la T salían como un
       punto porque su ventana, medida sobre una trayectoria once veces más
       larga, caía en otra parte del recorrido.

       La solución es no alargar el recorrido sino muestrearlo más fino: se
       divide dt y se multiplican los pasos por el mismo factor. El tiempo
       total y el tramo son idénticos; sólo cambia la densidad del trazo. Así
       el visor dibuja exactamente la figura que el buscador midió, pero con
       nueve veces más tinta. */
    const sub = Math.max(1, Math.round(o.subdiv || 1));
    dt = dt / sub;
    const n = (o.n || 14000) * sub;
    const transitorio = (o.transitorio || 2000) * sub;

    const e = (o.sem || sis.sem).slice();

    // Transitorio: la semilla no está sobre el atractor, hay que dejar que caiga.
    for (let i = 0; i < transitorio; i++) {
      paso(f, e, P, dt, K1, K2, K3, K4, TMP);
      if (!isFinite(e[0] + e[1] + e[2]) || Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) > LIMITE)
        return { ok: false, motivo: 'diverge' };
    }

    /* La sombra se coloca ACÁ, no antes del transitorio.
       Puesta antes, se quedaba en la semilla mientras la principal caía al
       atractor, así que al llegar a la primera renormalización la separación
       no era D0 sino el tamaño del atractor entero. Esa primera medición
       aportaba log(orden 1 / 1e-9) ≈ 21 de golpe, y como después se acumulaba
       lo de verdad —que es chico—, la suma quedaba dominada por esa constante.
       Resultado: λ salía como 21/T, o sea decaía con la longitud de la
       trayectoria en vez de converger. Se detectó midiendo que λ escalaba
       exactamente como 1/(n·dt). */
    const s = [e[0] + D0, e[1], e[2]];

    const pts = new Float32Array(n * 3);
    let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity, mnz = Infinity, mxz = -Infinity;
    let suma = 0, tramos = 0;
    const CADA = 20;                     // pasos entre renormalizaciones de la sombra

    for (let i = 0; i < n; i++) {
      paso(f, e, P, dt, K1, K2, K3, K4, TMP);
      paso(f, s, P, dt, K1, K2, K3, K4, TMP);
      if (!isFinite(e[0] + e[1] + e[2]) || Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) > LIMITE)
        return { ok: false, motivo: 'diverge' };

      if (i % CADA === CADA - 1) {
        const dx = s[0] - e[0], dy = s[1] - e[1], dz = s[2] - e[2];
        const dist = Math.hypot(dx, dy, dz);
        if (dist > 0 && isFinite(dist)) {
          suma += Math.log(dist / D0); tramos++;
          const k = D0 / dist;
          s[0] = e[0] + dx * k; s[1] = e[1] + dy * k; s[2] = e[2] + dz * k;
        } else {
          s[0] = e[0] + D0; s[1] = e[1]; s[2] = e[2];
        }
      }

      const j = i * 3;
      pts[j] = e[0]; pts[j + 1] = e[1]; pts[j + 2] = e[2];
      if (e[0] < mnx) mnx = e[0]; if (e[0] > mxx) mxx = e[0];
      if (e[1] < mny) mny = e[1]; if (e[1] > mxy) mxy = e[1];
      if (e[2] < mnz) mnz = e[2]; if (e[2] > mxz) mxz = e[2];
    }

    const lyap = tramos ? suma / (tramos * CADA * dt) : 0;
    const dx = mxx - mnx, dy = mxy - mny, dz = mxz - mnz;
    const diam = Math.max(dx, dy, dz);

    // Un atractor que ocupa un volumen ridículo respecto de su propia escala
    // es un punto fijo con ruido de integración: no dibuja nada.
    if (!(diam > 1e-6)) return { ok: false, motivo: 'punto' };
    if (!(lyap > (o.lyapMin != null ? o.lyapMin : 0.008))) return { ok: false, motivo: 'no-caotico', lyap: lyap };

    return {
      ok: true, pts: pts, n: n, lyap: lyap, dt: dt,
      centro: [(mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2],
      diam: diam
    };
  }

  /* ── 2. Proyección y trazo ────────────────────────────────────────────
     Rotación por tres ángulos de Euler y proyección ortográfica sobre el
     plano de pantalla. Ortográfica y no en perspectiva a propósito: la
     perspectiva depende de la distancia de cámara, que sería un parámetro
     más que buscar, y además deforma la figura de un modo que rompe la
     promesa —"esto es el mismo objeto, mirado desde otro lado"—.

     Después del giro, la nube se encaja en la grilla por su propia caja
     envolvente. Eso saca la escala y la traslación del espacio de búsqueda:
     tres dimensiones menos que optimizar, y el buscador puede concentrarse
     en lo único que decide la forma, que es la orientación.

     El trazo va por segmentos, no por puntos sueltos. Un atractor dibujado
     como nube de puntos deja huecos donde la trayectoria va rápido, y esos
     huecos hacen que una letra continua puntúe mal por razones que no tienen
     que ver con la forma. */

  function rotacion(yaw, pitch, roll, R) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cr = Math.cos(roll), sr = Math.sin(roll);
    // R = Rz(roll) · Rx(pitch) · Ry(yaw)
    R[0] = cr * cy + sr * sp * sy;  R[1] = -sr * cp;  R[2] = -cr * sy + sr * sp * cy;
    R[3] = sr * cy - cr * sp * sy;  R[4] = cr * cp;   R[5] = -sr * sy - cr * sp * cy;
    R[6] = cp * sy;                 R[7] = sp;        R[8] = cp * cy;
    return R;
  }

  const R9 = new Float64Array(9);

  /* Proyecta en `grid` (G×G, se limpia acá). `vista` = {yaw,pitch,roll,ex,ey}.
     ex/ey son un estirado opcional: por defecto 1, y sólo se mueven si la
     página lo habilita. Con estirado la figura deja de ser estrictamente el
     objeto girado y pasa a ser el objeto girado y deformado — se avisa en la
     ficha de cada letra porque cambia lo que la pieza está afirmando. */
  function proyectar(tray, vista, G, grid, margen) {
    const pts = tray.pts;
    const R = rotacion(vista.yaw, vista.pitch, vista.roll, R9);
    const cx = tray.centro[0], cy = tray.centro[1], cz = tray.centro[2];
    const ex = vista.ex || 1, ey = vista.ey || 1;

    /* Ventana de exposición: desde qué punto de la trayectoria y por cuánto.
       Es la decisión del fotógrafo, no una licencia sobre la matemática. Una
       exposición larga acumula la trayectoria entera y da el retrato clásico
       del atractor —la forma a la que el sistema tiende—. Una más corta
       registra un tramo del recorrido, que sigue siendo el mismo objeto
       recorrido por la misma trayectoria, y deja ver estructura que la
       exposición larga tapa cuando el trazo se satura.

       Está acotada por abajo: menos de un cuarto de la trayectoria ya no es
       un retrato del atractor sino un pedazo de curva, y con eso se puede
       dibujar cualquier cosa. La ficha de cada letra publica qué ventana se
       usó, porque cambia lo que la figura está afirmando. */
    const desde = Math.max(0, Math.min(0.75, vista.desde || 0));
    const largo = Math.max(0.25, Math.min(1, vista.largo == null ? 1 : vista.largo));
    const i0 = Math.floor(tray.n * desde);
    const n = Math.min(tray.n, i0 + Math.max(2, Math.floor(tray.n * largo)));

    // Pasada 1: caja envolvente de la proyección.
    let mnu = Infinity, mxu = -Infinity, mnv = Infinity, mxv = -Infinity;
    for (let i = i0; i < n; i++) {
      const j = i * 3;
      const a = pts[j] - cx, b = pts[j + 1] - cy, c = pts[j + 2] - cz;
      const u = (R[0] * a + R[1] * b + R[2] * c) * ex;
      const v = (R[3] * a + R[4] * b + R[5] * c) * ey;
      if (u < mnu) mnu = u; if (u > mxu) mxu = u;
      if (v < mnv) mnv = v; if (v > mxv) mxv = v;
    }
    const anu = mxu - mnu, anv = mxv - mnv;
    if (!(anu > 1e-9) || !(anv > 1e-9)) return false;

    const m = margen == null ? 0.06 : margen;
    const util = G * (1 - 2 * m);
    // Escala uniforme: encajar sin deformar. El estirado, si lo hay, ya se
    // aplicó arriba en el espacio de la proyección.
    const esc = util / Math.max(anu, anv);
    const ou = G / 2 - (mnu + mxu) / 2 * esc;
    const ov = G / 2 + (mnv + mxv) / 2 * esc;   // v hacia arriba

    grid.fill(0);

    // Pasada 2: trazo por segmentos con acumulación subpíxel.
    let pu = 0, pv = 0, hay = false;
    for (let i = i0; i < n; i++) {
      const j = i * 3;
      const a = pts[j] - cx, b = pts[j + 1] - cy, c = pts[j + 2] - cz;
      const u = ou + (R[0] * a + R[1] * b + R[2] * c) * ex * esc;
      const v = ov - (R[3] * a + R[4] * b + R[5] * c) * ey * esc;
      if (hay) {
        const du = u - pu, dv = v - pv;
        const pasos = Math.max(1, Math.min(64, Math.ceil(Math.hypot(du, dv))));
        const inc = 1 / pasos;
        for (let k = 1; k <= pasos; k++) {
          const gu = pu + du * inc * k, gv = pv + dv * inc * k;
          const iu = gu | 0, iv = gv | 0;
          if (iu >= 0 && iu < G && iv >= 0 && iv < G) grid[iv * G + iu] += inc;
        }
      }
      pu = u; pv = v; hay = true;
    }
    return true;
  }

  /* Normaliza la grilla de densidad al rango [0,1] con la misma compresión
     logarítmica que usa el render de larga exposición: sin ella, el núcleo
     denso del atractor vale mil veces más que los brazos y el puntaje sólo
     mira el centro. */
  function normalizar(grid, out) {
    let mx = 0;
    for (let i = 0; i < grid.length; i++) if (grid[i] > mx) mx = grid[i];
    if (!(mx > 0)) { out.fill(0); return 0; }
    const k = 24 / mx, den = Math.log(1 + 24);
    for (let i = 0; i < grid.length; i++) out[i] = Math.log(1 + grid[i] * k) / den;
    return mx;
  }

  /* ── 3. La letra objetivo ─────────────────────────────────────────────
     Se rasteriza el glifo y se calcula la transformada de distancia exacta
     (Felzenszwalb y Huttenlocher, 2012): para cada píxel de fuera, a qué
     distancia quedó la letra más cercana. Con eso el castigo por tinta
     perdida deja de ser binario —"cayó fuera"— y pasa a ser proporcional:
     un trazo que se sale un pelo casi no molesta, uno que cruza la lámina
     entera hunde el puntaje. Esa diferencia es lo que le da al buscador una
     pendiente por la que bajar; con castigo binario se queda plano.

     La transformada se hace en dos pasadas 1D sobre la distancia al cuadrado,
     que es exacta y de coste lineal. */

  function edt1d(f, d, v, zz, n) {
    let k = 0;
    v[0] = 0; zz[0] = -Infinity; zz[1] = Infinity;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= zz[k]) {
        k--;
        s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++; v[k] = q; zz[k] = s; zz[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (zz[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  }

  function distancia(mask, G) {
    const INF = 1e12;
    const f = new Float64Array(G), d = new Float64Array(G);
    const v = new Int32Array(G), zz = new Float64Array(G + 1);
    const tmp = new Float64Array(G * G);
    for (let x = 0; x < G; x++) {
      for (let y = 0; y < G; y++) f[y] = mask[y * G + x] ? 0 : INF;
      edt1d(f, d, v, zz, G);
      for (let y = 0; y < G; y++) tmp[y * G + x] = d[y];
    }
    const out = new Float32Array(G * G);
    for (let y = 0; y < G; y++) {
      for (let x = 0; x < G; x++) f[x] = tmp[y * G + x];
      edt1d(f, d, v, zz, G);
      for (let x = 0; x < G; x++) out[y * G + x] = Math.sqrt(d[x]) / G;   // normalizada al lado
    }
    return out;
  }

  /* ── 4. Puntaje ───────────────────────────────────────────────────────
     Jaccard blando entre la figura y la letra, por un factor de dispersión.

     La primera versión usaba F1 entre cobertura y precisión y tenía un
     defecto que se vio apenas se miraron los resultados: contra una "C"
     ganaba un anillo cerrado. Cubría la C entera, y el trozo que sobraba
     —el que cierra el anillo— cae justo en el hueco de la C, o sea a
     distancia casi cero, así que el castigo por dispersión no lo tocaba.
     Con F1 la diferencia entre el anillo y una C de verdad era de centésimas
     y el buscador no tenía por qué preferir la buena.

     Jaccard mide intersección sobre unión, y la unión sí crece con el
     sobrante esté donde esté: el anillo cae a ~0,80 contra el ~0,97 de una C
     bien hecha. Esa distancia es la que el buscador necesita para que le
     convenga arreglar el trazo en vez de conformarse.

     La dispersión se queda como factor aparte porque Jaccard no distingue
     entre tinta que sobra pegada a la letra y un brazo disparado al otro
     extremo de la lámina, y visualmente son cosas muy distintas. */

  const REF = 0.18;              // densidad desde la cual un píxel se da por pintado

  function puntuar(t, obj, G) {
    const mask = obj.mask, dist = obj.dist;
    let inter = 0, union = 0, lejania = 0, tintaFuera = 0;
    for (let i = 0; i < t.length; i++) {
      const tinta = t[i] > 0 ? Math.min(1, t[i] / REF) : 0;
      const m = mask[i];
      if (!tinta && !m) continue;
      if (m) {
        inter += tinta;
        union += 1;
      } else {
        union += tinta;
        tintaFuera += tinta;
        lejania += tinta * dist[i];
      }
    }
    if (!(union > 0)) return 0;
    const jac = inter / union;
    const dispersion = tintaFuera > 0 ? lejania / tintaFuera : 0;
    // dist viene normalizada al lado de la grilla: 0.30 ya es media lámina.
    return jac * (1 - Math.min(1, dispersion / 0.30) * 0.5);
  }

  raiz.ABC_NUCLEO = {
    trayectoria, proyectar, normalizar, puntuar, distancia, rotacion
  };

})(typeof self !== 'undefined' ? self : this);
