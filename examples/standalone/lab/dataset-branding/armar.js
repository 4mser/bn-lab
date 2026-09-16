/* Arma lab/dataset-branding/index.html.

   El encabezado, los temas, el nav y el cursor son los mismos de todo el
   sitio. Copiarlos a mano en una página nueva es cómo se desincronizan las
   paletas: acá se leen de /lab/ondas-guia.html —la otra página del lab hecha
   a mano— y se pegan tal cual. Si esos bloques cambian de sitio, este script
   falla en vez de generar una página con el estilo viejo.

   Correr:  node armar.js */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const LAB = path.join(DIR, '..');
const fuente = fs.readFileSync(path.join(LAB, 'ondas-guia.html'), 'utf8');

function tramo(desde, hasta, que) {
  const a = fuente.indexOf(desde);
  const b = fuente.indexOf(hasta, a + 1);
  if (a < 0 || b < 0) { console.error('No se encontró el bloque de ' + que); process.exit(1); }
  return fuente.slice(a, b);
}

// Temas + nav + cursor: todo lo que va antes del CSS propio de la página.
const compartido = tramo(
  '    /* ── Temas ─',
  '    html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;}',
  'estilos compartidos');
if (!compartido.includes('.cursor-ring')) {
  console.error('El bloque compartido no trae el cursor: cambió la estructura de ondas-guia.html');
  process.exit(1);
}
const fuentes = (fuente.match(/<link[^>]*fonts[^>]*>/g) || []).join('\n  ');
if (!fuentes) { console.error('No se encontraron los links de fuentes'); process.exit(1); }

const TITULO = 'Dataset de branding — Lab — B&N SOLUTIONS';
const DESC = 'El atractor envuelto en un tubo y fotografiado desde toda la esfera: vistas, ' +
             'máscaras y poses en el formato que espera el pipeline de entrenamiento, ' +
             'generadas en el navegador.';

const cuerpo = fs.readFileSync(path.join(DIR, 'cuerpo.html'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0a0806">
  <script>
  /* Tema antes del primer pixel. chrome.js va con defer y llegaría tarde: sin
     esto la página pinta oscura y salta al claro. */
  (function(){var t;try{t=localStorage.getItem('bn-tema');}catch(e){}
  if(!({dark:1,light:1})[t])t='dark';document.documentElement.dataset.mode=t;})();
  </script>
  <script>(function(){try{var t=localStorage.getItem('nm-theme');
    if(t&&['amber','lilac','magenta','blue','jade','aurora','nova'].indexOf(t)>-1)
      document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
  <title>${TITULO}</title>
  <meta name="description" content="${DESC}">
  <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="canonical" href="https://bnsolutions.cl/lab/dataset-branding">
  <meta property="og:title" content="Dataset de branding — Lab">
  <meta property="og:description" content="${DESC}">
  <meta property="og:image" content="https://www.bnsolutions.cl/og-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://www.bnsolutions.cl/og-2026.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fuentes}
  <script src="/chrome.js" defer></script>
  <style>
${compartido}${cuerpo}
`;

fs.writeFileSync(path.join(DIR, 'index.html'), html);
console.log('index.html armado ·', (html.length / 1024).toFixed(0) + ' KB');
