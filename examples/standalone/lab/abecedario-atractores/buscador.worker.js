/* Worker del buscador.
   La página rasteriza la letra (necesita canvas) y manda acá la máscara y su
   transformada de distancia ya calculadas; el worker sólo integra, proyecta y
   puntúa. Un worker por sistema: son islas independientes, no comparten nada,
   y la página se queda con la mejor de todas.

   El motivo de que esto viva en un worker y no en la página es medible: una
   corrida de una letra son del orden de mil quinientas integraciones de cinco
   mil pasos cada una. En el hilo principal eso congela la pestaña varios
   segundos y el navegador deja de repintar. */
self.importScripts('sistemas.js', 'nucleo.js', 'buscador.js');

self.onmessage = function (ev) {
  const m = ev.data;
  if (m.tipo !== 'buscar') return;

  const objetivo = {
    letra: m.letra,
    mask: new Uint8Array(m.mask),
    dist: new Float32Array(m.dist),
    area: m.area
  };

  let ultimo = 0;
  const res = self.ABC_BUSCADOR.buscarSistema({
    sistemaId: m.sistemaId,
    objetivo: objetivo,
    G: m.G,
    semilla: m.semilla,
    cfg: m.cfg,
    telemetria: !!m.telemetria,
    alPaso: function (p) {
      /* Ritmo de los avisos. Seis workers mandando una generación cada uno
         inundan el hilo principal y la página deja de repintar justo cuando
         más hay que mirar. Se limita a uno cada 110 ms — salvo el que trae
         una mejora o el último, que pasan siempre porque son los que cambian
         lo que se ve. */
      const ahora = Date.now();
      if (ahora - ultimo < 110 && p.gen < p.gens && !p.mejoro) return;
      ultimo = ahora;

      const msg = { tipo: 'avance', trabajo: m.trabajo, letra: m.letra,
        sistemaId: p.sistemaId, gen: p.gen, gens: p.gens, punt: p.mejor.p,
        descartes: p.descartes };

      if (p.tele) {
        // La orientación que va ganando, para marcarla sobre el mapa.
        if (p.mejor.vista) msg.vista = { yaw: p.mejor.vista.yaw, pitch: p.mejor.vista.pitch };
        msg.pobl = p.tele.pobl;
        msg.media = p.tele.media;
        msg.ancho = p.tele.ancho;
        msg.sigma = p.tele.sigma;
        msg.ejes = p.tele.ejes;
        // El mapa se copia: el original lo sigue escribiendo la búsqueda, y
        // transferirlo dejaría al worker sin él a la siguiente generación.
        if (p.tele.mapa) msg.mapa = p.tele.mapa.slice();
        if (p.tele.mini) msg.mini = p.tele.mini;
      }
      self.postMessage(msg);
    }
  });

  self.postMessage({ tipo: 'listo', trabajo: m.trabajo, letra: m.letra, res: res });
};
