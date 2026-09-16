/* ═══════════════════════════════════════════════════════════════════════
   ABECEDARIO DE ATRACTORES — catálogo de sistemas.
   ═══════════════════════════════════════════════════════════════════════
   Cada entrada es un sistema dinámico continuo en R³ con sus parámetros
   abiertos a la búsqueda. El campo `f` escribe la derivada en `d` en vez de
   devolver un arreglo: en el buscador esto se llama millones de veces y un
   `[a,b,c]` por paso son millones de objetos para el recolector de basura.

   `sem` es la semilla, `dt` el paso de integración por defecto y `rango` los
   límites dentro de los que el buscador puede mover cada parámetro. Los
   límites no son decorativos: fuera de ellos casi todos estos sistemas dejan
   de ser caóticos —se van a un punto fijo, a un ciclo o al infinito— y el
   buscador perdería el tiempo evaluando trayectorias muertas.

   Se carga igual desde la página y desde el worker: por eso cuelga de `self`,
   que existe en los dos lados.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  /* p: parámetro buscable.  p(clave, def, min, max) */
  const p = (k, def, min, max) => ({ k, def, min, max });

  const SISTEMAS = [

    { id: 'lorenz', nombre: 'Lorenz', dt: 0.005, sem: [0.1, 0, 0],
      cita: 'Lorenz, 1963 — convección atmosférica.',
      rango: [p('s', 10, 4, 20), p('r', 28, 14, 60), p('b', 2.667, 0.6, 5)],
      f: (x, y, z, P, d) => {
        d[0] = P.s * (y - x);
        d[1] = x * (P.r - z) - y;
        d[2] = x * y - P.b * z;
      } },

    { id: 'rossler', nombre: 'Rössler', dt: 0.02, sem: [1, 1, 1],
      cita: 'Rössler, 1976 — el atractor de una sola banda.',
      rango: [p('a', 0.2, 0.05, 0.45), p('b', 0.2, 0.05, 2), p('c', 5.7, 2.5, 18)],
      f: (x, y, z, P, d) => {
        d[0] = -y - z;
        d[1] = x + P.a * y;
        d[2] = P.b + z * (x - P.c);
      } },

    { id: 'thomas', nombre: 'Thomas', dt: 0.06, sem: [0.12, 0.16, -0.09],
      cita: 'Thomas, 1999 — simétrico y cíclico; el de la estrella.',
      rango: [p('b', 0.19, 0.05, 0.32)],
      f: (x, y, z, P, d) => {
        d[0] = Math.sin(y) - P.b * x;
        d[1] = Math.sin(z) - P.b * y;
        d[2] = Math.sin(x) - P.b * z;
      } },

    /* a = 1.4, no 1.89. Con 1.89 el sistema cae en una ventana periódica: el
       exponente de Lyapunov medido da ~0.002, o sea un ciclo límite. Con 1.4
       da 0.744, que es el valor publicado para este atractor (~0.78). El
       rango se acota por arriba para no volver a caer en esa ventana. */
    { id: 'halvorsen', nombre: 'Halvorsen', dt: 0.005, sem: [-1.48, -1.51, 2.04],
      cita: 'Halvorsen — cíclicamente simétrico, tres lóbulos.',
      rango: [p('a', 1.4, 1.1, 1.6)],
      f: (x, y, z, P, d) => {
        d[0] = -P.a * x - 4 * y - 4 * z - y * y;
        d[1] = -P.a * y - 4 * z - 4 * x - z * z;
        d[2] = -P.a * z - 4 * x - 4 * y - x * x;
      } },

    { id: 'chenlee', nombre: 'Chen–Lee', dt: 0.003, sem: [1, 1, 1],
      cita: 'Chen y Lee, 2004 — giroscopio sin rozamiento.',
      rango: [p('a', 5, 2, 8), p('b', 10, 5, 16), p('c', 0.38, 0.1, 1.2)],
      f: (x, y, z, P, d) => {
        d[0] = P.a * x - y * z;
        d[1] = -P.b * y + x * z;
        d[2] = -P.c * z + x * y / 3;
      } },

    { id: 'lu', nombre: 'Lü', dt: 0.003, sem: [0.1, 0.1, 20],
      cita: 'Lü y Chen, 2002 — puente entre Lorenz y Chen.',
      rango: [p('a', 36, 20, 48), p('b', 3, 1, 6), p('c', 20, 10, 30)],
      f: (x, y, z, P, d) => {
        d[0] = P.a * (y - x);
        d[1] = -x * z + P.c * y;
        d[2] = x * y - P.b * z;
      } },

    { id: 'aizawa', nombre: 'Aizawa', dt: 0.01, sem: [0.1, 0, 0],
      cita: 'Aizawa — un toroide que se rompe por los polos.',
      rango: [p('a', 0.95, 0.6, 1.2), p('b', 0.7, 0.3, 1.1), p('c', 0.6, 0.2, 1),
              p('d', 3.5, 2, 5), p('e', 0.25, 0.05, 0.6), p('g', 0.1, 0, 0.3)],
      f: (x, y, z, P, d) => {
        const zb = z - P.b;
        d[0] = zb * x - P.d * y;
        d[1] = P.d * x + zb * y;
        d[2] = P.c + P.a * z - z * z * z / 3 - (x * x + y * y) * (1 + P.e * z) + P.g * z * x * x * x;
      } },

    { id: 'dadras', nombre: 'Dadras', dt: 0.004, sem: [1.1, 2.1, -2],
      cita: 'Dadras y Momeni, 2009 — atractor de cuatro alas.',
      rango: [p('a', 3, 1.5, 5), p('b', 2.7, 1, 4), p('c', 1.7, 0.8, 3),
              p('d', 2, 1, 4), p('e', 9, 5, 14)],
      f: (x, y, z, P, d) => {
        d[0] = y - P.a * x + P.b * y * z;
        d[1] = P.c * y - x * z + z;
        d[2] = P.d * x * y - P.e * z;
      } },

    { id: 'burkeshaw', nombre: 'Burke–Shaw', dt: 0.003, sem: [1, 1, 1],
      cita: 'Shaw, 1981 — variante de Lorenz con simetría de espejo.',
      rango: [p('s', 10, 5, 15), p('v', 4.272, 1, 8)],
      f: (x, y, z, P, d) => {
        d[0] = -P.s * (x + y);
        d[1] = -y - P.s * x * z;
        d[2] = P.s * x * y + P.v;
      } },

    { id: 'sprottf', nombre: 'Sprott–Linz F', dt: 0.02, sem: [0.1, 0, 0],
      cita: 'Sprott, 1994 — de los sistemas caóticos más simples que existen.',
      rango: [p('a', 0.5, 0.2, 0.9)],
      f: (x, y, z, P, d) => {
        d[0] = y + z;
        d[1] = -x + P.a * y;
        d[2] = x * x - z;
      } },

    { id: 'nosehoover', nombre: 'Nosé–Hoover', dt: 0.02, sem: [0, 5, 0],
      cita: 'Nosé–Hoover — termostato de dinámica molecular.',
      rango: [p('a', 1.5, 0.6, 2.4)],
      f: (x, y, z, P, d) => {
        d[0] = y;
        d[1] = -x + y * z;
        d[2] = P.a - y * y;
      } },

    { id: 'rikitake', nombre: 'Rikitake', dt: 0.004, sem: [1, 0, 0.5],
      cita: 'Rikitake, 1958 — dinamo doble; inversiones del campo terrestre.',
      rango: [p('m', 2, 0.8, 4), p('a', 5, 2, 8)],
      f: (x, y, z, P, d) => {
        d[0] = -P.m * x + z * y;
        d[1] = -P.m * y + x * (z - P.a);
        d[2] = 1 - x * y;
      } },

    { id: 'fourwing', nombre: 'Cuatro alas', dt: 0.02, sem: [1, 1, 1],
      cita: 'Wang, 2009 — cuatro alas alrededor del origen.',
      rango: [p('a', 0.2, 0.05, 0.4), p('b', 0.01, -0.1, 0.1), p('c', -0.4, -0.8, -0.1)],
      f: (x, y, z, P, d) => {
        d[0] = P.a * x + y * z;
        d[1] = P.b * x + P.c * y - x * z;
        d[2] = -z - x * y;
      } },

    { id: 'rabinovich', nombre: 'Rabinovich–Fabrikant', dt: 0.004, sem: [-1, 0, 0.5],
      cita: 'Rabinovich y Fabrikant, 1979 — ondas en un medio no lineal.',
      rango: [p('a', 1.1, 0.85, 1.4), p('g', 0.87, 0.05, 1.2)],
      f: (x, y, z, P, d) => {
        d[0] = y * (z - 1 + x * x) + P.g * x;
        d[1] = x * (3 * z + 1 - x * x) + P.g * y;
        d[2] = -2 * z * (P.a + x * y);
      } },

    /* ── La familia libre ────────────────────────────────────────────────
       Los catorce de arriba son formas fijas: se les puede mover los
       parámetros, pero un Lorenz sigue pareciéndose a un Lorenz. Veintiséis
       letras necesitan más variedad que eso.

       Ésta es la familia cuadrática general que estudió Sprott: las tres
       derivadas son polinomios de segundo grado completos, treinta
       coeficientes en total. Contiene a Lorenz, a Rössler y a casi todos los
       demás como casos particulares, y sobre todo contiene millones de formas
       que no tienen nombre. Sprott midió que alrededor del 1% de los sorteos
       al azar da un atractor caótico acotado; el resto se va al infinito o se
       muere en un punto, y el validador de nucleo.js los descarta.

       Acá el buscador deja de afinar un atractor conocido y pasa a buscar
       forma en un espacio de treinta dimensiones. Es donde aparecen las
       letras raras. */
    { id: 'libre', nombre: 'Familia libre (cuadrática)', dt: 0.03, sem: [0.05, 0.05, 0.05],
      libre: true,
      cita: 'Sprott, 1993 — la familia cuadrática general en R³.',
      rango: Array.from({ length: 30 }, (_, i) => p('c' + i, 0, -1.2, 1.2)),
      f: (x, y, z, P, d) => {
        const c = P.c;                     // Float64Array(30), plano
        const xx = x * x, yy = y * y, zz = z * z, xy = x * y, xz = x * z, yz = y * z;
        d[0] = c[0] + c[1] * x + c[2] * y + c[3] * z + c[4] * xx + c[5] * yy + c[6] * zz + c[7] * xy + c[8] * xz + c[9] * yz;
        d[1] = c[10] + c[11] * x + c[12] * y + c[13] * z + c[14] * xx + c[15] * yy + c[16] * zz + c[17] * xy + c[18] * xz + c[19] * yz;
        d[2] = c[20] + c[21] * x + c[22] * y + c[23] * z + c[24] * xx + c[25] * yy + c[26] * zz + c[27] * xy + c[28] * xz + c[29] * yz;
      } },
  ];

  const POR_ID = {};
  SISTEMAS.forEach(s => { POR_ID[s.id] = s; });

  raiz.ABC_SISTEMAS = SISTEMAS;
  raiz.ABC_SISTEMA = id => POR_ID[id];

})(typeof self !== 'undefined' ? self : this);
