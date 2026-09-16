/* ═══════════════════════════════════════════════════════════════════════
   DATASET DE BRANDING — el empaque.
   ═══════════════════════════════════════════════════════════════════════
   El dataset tiene que salir del navegador con la misma forma que lo deja
   `generar_dataset.py`, o el pipeline de entrenamiento habría que reescribirlo:

     dataset/
       views/*.png       las fotos
       masks/*.png       siluetas binarias
       poses.npz         R, rot6d, dirs, rolls
       metadata.json     la ficha completa, con un registro por imagen

   `poses.npz` no es un formato opaco: un .npz es un ZIP sin comprimir con un
   .npy adentro por arreglo, y un .npy es una cabecera de texto seguida de los
   bytes crudos. Los dos se escriben acá a mano —unas cuarenta líneas— y el
   resultado lo abre `np.load('poses.npz')` sin saber que salió de un
   navegador. Es preferible a inventar un formato propio y obligar a que el
   script de entrenamiento lo aprenda.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  const enc = new TextEncoder();

  /* ── .npy ──────────────────────────────────────────────────────────────
     La cabecera es un diccionario de Python en texto plano. El formato exige
     que el total —magia + versión + longitud + cabecera— quede alineado a 64
     bytes, y que la cabecera termine en salto de línea. Si el relleno no
     cuadra, numpy lo abre igual pero mmap se rompe; conviene hacerlo bien. */
  function npy(datos, forma) {
    const dict = "{'descr': '<f8', 'fortran_order': False, 'shape': (" +
      forma.map(v => v + ',').join(' ') + "), }";
    const preludio = 10;                       // \x93NUMPY + 0x01 0x00 + uint16
    let largo = dict.length + 1;               // + '\n'
    const relleno = (64 - ((preludio + largo) % 64)) % 64;
    largo += relleno;

    const buf = new Uint8Array(preludio + largo + datos.length * 8);
    const vista = new DataView(buf.buffer);
    /* El número mágico es el byte 0x93 seguido de "NUMPY", y va escrito byte a
       byte a propósito: TextEncoder codifica en UTF-8, y ahí 0x93 no cabe en
       un byte —sale como 0xC2 0x93— así que la cabecera queda corrida y numpy
       devuelve el miembro como bytes crudos en vez de como arreglo. Falla en
       silencio: el .npz se abre, las claves aparecen, y lo que sale no es un
       array. */
    buf.set([0x93, 0x4E, 0x55, 0x4D, 0x50, 0x59], 0);
    buf[6] = 1; buf[7] = 0;
    vista.setUint16(8, largo, true);
    buf.set(enc.encode(dict), preludio);
    for (let i = 0; i < relleno; i++) buf[preludio + dict.length + i] = 0x20;   // espacios
    buf[preludio + largo - 1] = 0x0a;                                          // '\n'

    let off = preludio + largo;
    for (let i = 0; i < datos.length; i++) { vista.setFloat64(off, datos[i], true); off += 8; }
    return buf;
  }

  /* ── ZIP sin compresión ────────────────────────────────────────────────
     Los PNG ya vienen comprimidos y los .npy son flotantes: desinflarlos otra
     vez no gana casi nada y traería un compresor entero. Se guarda en modo
     "store", que es además lo que produce np.savez. */
  const TABLA = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(b) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < b.length; i++) c = TABLA[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function zip(entradas) {
    const partes = [], central = [];
    let off = 0;

    entradas.forEach(e => {
      const nombre = enc.encode(e.nombre);
      const datos = e.datos;
      const crc = crc32(datos);

      const lfh = new Uint8Array(30 + nombre.length);
      const v = new DataView(lfh.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);           // versión mínima
      v.setUint16(6, 0, true);            // banderas
      v.setUint16(8, 0, true);            // método 0 = store
      v.setUint16(10, 0, true);           // hora
      v.setUint16(12, 0x21, true);        // fecha (1 ene 1980)
      v.setUint32(14, crc, true);
      v.setUint32(18, datos.length, true);
      v.setUint32(22, datos.length, true);
      v.setUint16(26, nombre.length, true);
      v.setUint16(28, 0, true);
      lfh.set(nombre, 30);

      partes.push(lfh, datos);

      const cd = new Uint8Array(46 + nombre.length);
      const w = new DataView(cd.buffer);
      w.setUint32(0, 0x02014b50, true);
      w.setUint16(4, 20, true);
      w.setUint16(6, 20, true);
      w.setUint16(8, 0, true);
      w.setUint16(10, 0, true);
      w.setUint16(12, 0, true);
      w.setUint16(14, 0x21, true);
      w.setUint32(16, crc, true);
      w.setUint32(20, datos.length, true);
      w.setUint32(24, datos.length, true);
      w.setUint16(28, nombre.length, true);
      w.setUint32(42, off, true);
      cd.set(nombre, 46);
      central.push(cd);

      off += lfh.length + datos.length;
    });

    let tamCentral = 0;
    central.forEach(c => { tamCentral += c.length; });

    const fin = new Uint8Array(22);
    const f = new DataView(fin.buffer);
    f.setUint32(0, 0x06054b50, true);
    f.setUint16(8, entradas.length, true);
    f.setUint16(10, entradas.length, true);
    f.setUint32(12, tamCentral, true);
    f.setUint32(16, off, true);

    return new Blob(partes.concat(central, [fin]), { type: 'application/zip' });
  }

  /* PNG por el codificador del propio navegador: es el mismo que usa cualquier
     otra herramienta y evita traer uno escrito a mano. */
  function png(pixeles, S) {
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    cv.getContext('2d').putImageData(new ImageData(pixeles, S, S), 0, 0);
    return new Promise(res => cv.toBlob(b => b.arrayBuffer().then(a => res(new Uint8Array(a))), 'image/png'));
  }

  raiz.BR_EMPAQUE = { npy, zip, crc32, png };

})(window);
