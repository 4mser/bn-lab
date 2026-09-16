/* Chrome compartido por /lab y las páginas de experimento: header y cursor
   iguales a los del home de B&N (statusbar con velo + cursor agujero-negro),
   más el toggle de idioma para el contenido bilingüe del lab. Autocontenido:
   inyecta su propio CSS para no depender del generador. */
(function () {
  'use strict';

  /* Iconos de línea, el mismo trazo de 1.6 que usa el pie del sitio. */
  const SVG = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ICONO = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
    mail: SVG('<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>'),
    dir: SVG('<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8.5" cy="10" r="2"/><path d="M5 16c.6-1.8 2-2.6 3.5-2.6S11.4 14.2 12 16"/><line x1="14.5" y1="9.5" x2="19" y2="9.5"/><line x1="14.5" y1="13.5" x2="19" y2="13.5"/>')
  };

  const LINKS = [
    { href: '/',          en: 'Home',         es: 'Inicio',      here: false },
    { href: '/#dossier',  en: 'Capabilities', es: 'Capacidades', here: false, svc: true },
    { href: '/proyectos', en: 'Projects',     es: 'Proyectos',   here: 'proyectos' },
    { href: '/research',  en: 'Research',     es: 'Research',    here: 'research' },
    { href: '/lab',       en: 'Lab',          es: 'Lab',         here: 'lab' },
    { href: '/#contact',  en: 'Contact',      es: 'Contacto',    here: false }
  ];
  /* Rutas que pertenecen al Research Lab: el enlace se marca y la barra dice
     // RESEARCH. */
  const ES_RESEARCH = /^\/(research|milenio|lateralus|filtraciones-tuneles|privacidad)(\/|$)/;
  const ES_HERE = { lab: p => p.startsWith('/lab'), proyectos: p => p.startsWith('/proyectos'),
                    research: p => ES_RESEARCH.test(p) && !p.startsWith('/privacidad') };

  const CSS = `
  :root{ --bn-ink:#f4f5f7; --bn-ink3:rgba(244,245,247,.5); --bn-mono:'IBM Plex Mono',monospace;
         --bn-ink-rgb:244 245 247;
         --bn-bg:0 0 0; --bn-azul:#0a5cff; --bn-azul-rgb:10 92 255; }
  /* Claro/oscuro va en data-mode, NO en data-theme: el lab ya usa data-theme
     para su paleta de acento (amber, purple, pink…) y los dos atributos no
     pueden ser el mismo. Aquí solo cambian tinta y fondo del chrome. */
  html[data-mode="light"]{ --bn-ink:#080d18; --bn-ink3:rgba(23,36,61,.58);
                           --bn-ink-rgb:8 13 24; --bn-bg:255 255 255; }
  /* Puente de tokens para servicios-nav.js: el módulo es compartido y no
     conoce la paleta de cada contexto, así que se la pasamos. */
  :root{ --svcd-ink:var(--bn-ink-rgb); --svcd-bg:var(--bn-bg);
         --svcd-acc:var(--bn-ink); --svcd-mono:var(--bn-mono); }
  html[data-mode="light"]{ --svcd-acc:var(--bn-azul); }
  html,body{ background:#000; }
  html[data-mode="light"], html[data-mode="light"] body{ background:#f7f9fc; }
  body{ padding-top:52px; }
  @media(hover:hover) and (pointer:fine){ *,*::before,*::after{ cursor:none!important; } }
  /* ── Header B&N ── */
  /* z-index por encima del overlay: el botón de menú no se tapa, se queda en
     su sitio y se transforma en la X. Por eso el overlay no lleva cabecera
     propia — la barra ya está ahí. */
  .bn-bar{ position:fixed;top:0;left:0;right:0;z-index:1500;display:flex;align-items:center;
    justify-content:space-between;gap:16px;padding:13px clamp(18px,5vw,60px);
    font-family:var(--bn-mono);font-size:10px;letter-spacing:.14em;color:var(--bn-ink3); }
  .bn-bar::before{ content:'';position:absolute;left:0;right:0;top:0;height:230%;z-index:-1;pointer-events:none;
    background:linear-gradient(180deg,rgb(var(--bn-bg)/.92) 0%,rgb(var(--bn-bg)/.55) 42%,rgb(var(--bn-bg)/0) 100%); }
  .bn-left{ display:flex;align-items:center;gap:10px;white-space:nowrap;color:var(--bn-ink3);text-decoration:none;transition:color .25s ease; }
  .bn-left:hover{ color:var(--bn-ink); }
  .bn-dot{ width:5px;height:5px;border-radius:50%;background:var(--bn-ink);animation:bnPulse 2.4s ease-in-out infinite; }
  @keyframes bnPulse{ 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(244,245,247,.35);} 50%{opacity:.55;box-shadow:0 0 0 5px rgba(244,245,247,0);} }
  .bn-nav{ display:flex;gap:4px;align-items:center; }
  .bn-nav a{ position:relative;color:var(--bn-ink3);text-decoration:none;padding:6px 10px;transition:color .25s ease; }
  .bn-nav a::after{ content:'';position:absolute;left:10px;right:10px;bottom:2px;height:1px;background:var(--bn-ink);
    transform:scaleX(0);transform-origin:left;transition:transform .3s ease; }
  .bn-nav a:hover,.bn-nav a.is-here{ color:var(--bn-ink); }
  .bn-nav a:hover::after,.bn-nav a.is-here::after{ transform:scaleX(1); }
  .bn-right{ display:flex;align-items:center;gap:16px;white-space:nowrap; }
  .bn-lang{ font-family:var(--bn-mono);font-size:10px;letter-spacing:.14em;color:var(--bn-ink3);
    background:none;border:0;padding:0;transition:color .25s ease; }
  .bn-lang .active{ color:var(--bn-ink); }
  .bn-lab{ color:var(--bn-ink3); }
  /* Selector de tema: el mismo disco con terminador del home — creciente
     eclipsado en oscuro, disco pleno con corona en claro. */
  .bn-tema{ display:inline-flex;align-items:center;justify-content:center;
    width:24px;height:24px;padding:0;border:0;background:none; }
  .bn-tema svg{ width:21px;height:21px;display:block;overflow:visible; }
  .bn-tema .ec-body{ fill:var(--bn-ink3);transition:fill .35s ease; }
  .bn-tema .ec-corona{ fill:none;stroke:var(--bn-ink3);stroke-width:1;opacity:0;
    transform:scale(.72);transform-origin:12px 12px;
    transition:opacity .45s ease,transform .5s cubic-bezier(.16,1,.3,1),stroke .35s ease; }
  .bn-tema .ec-cut{ transform:translateX(-5.4px);
    transition:transform .55s cubic-bezier(.6,.02,.2,1); }
  .bn-tema:hover .ec-body,.bn-tema:focus-visible .ec-body{ fill:var(--bn-ink); }
  .bn-tema:hover .ec-corona,.bn-tema:focus-visible .ec-corona{ opacity:.55;transform:scale(1); }
  /* Tercer estado del icono: mismo eclipse del oscuro, pero en el azul de la
     marca, para que se vea de un golpe en qué tema estás. */
  html[data-mode="light"] .bn-tema .ec-cut{ transform:translateX(-23px); }
  html[data-mode="light"] .bn-tema .ec-body{ fill:var(--bn-azul); }
  html[data-mode="light"] .bn-tema .ec-corona{ opacity:.5;transform:scale(1);
    stroke:rgb(var(--bn-azul-rgb)/.55); }
  html[data-mode="light"] .bn-tema:hover .ec-corona{ opacity:1; }
  @media(prefers-reduced-motion:reduce){ .bn-tema .ec-cut,.bn-tema .ec-corona{ transition:none; } }
  /* ── Botón de menú (solo móvil): dos trazos que giran a X ── */
  .bn-burger{ display:none;width:34px;height:34px;position:relative;
    align-items:center;justify-content:center;padding:0;border:0;background:none;
    margin-left:2px;flex:none; }
  .bn-burger i{ position:absolute;left:8px;right:8px;height:1.5px;background:var(--bn-ink);
    transition:transform .4s cubic-bezier(.6,.02,.2,1),opacity .3s ease; }
  .bn-burger i:nth-child(1){ transform:translateY(-4px); }
  .bn-burger i:nth-child(2){ transform:translateY(4px); }
  body.bn-menu-open .bn-burger i:nth-child(1){ transform:translateY(0) rotate(45deg); }
  body.bn-menu-open .bn-burger i:nth-child(2){ transform:translateY(0) rotate(-45deg); }
  /* ── Overlay del menú ── */
  .bn-menu{ position:fixed;inset:0;z-index:1400;padding-top:56px;background:rgb(var(--bn-bg)/.97);
    -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
    display:flex;flex-direction:column;opacity:0;visibility:hidden;pointer-events:none;
    transition:opacity .42s cubic-bezier(.22,1,.36,1),visibility .42s; }
  body.bn-menu-open .bn-menu{ opacity:1;visibility:visible;pointer-events:auto; }
  /* La malla de fondo se retiró: ensuciaba y el overlay se sostiene con los
     brackets y la tipografía. */
  /* Brackets de mira, igual que en el menú del home. A 17px del borde: más
     cerca se pegaban al contenido. */
  .bn-menu-bk{ position:absolute;width:20px;height:20px;pointer-events:none;
    border:1px solid rgb(var(--bn-ink-rgb)/.3); }
  .bn-menu-bk.tl{ top:62px;left:17px;border-right:0;border-bottom:0; }
  .bn-menu-bk.tr{ top:62px;right:17px;border-left:0;border-bottom:0; }
  .bn-menu-bk.bl{ bottom:17px;left:17px;border-right:0;border-top:0; }
  .bn-menu-bk.br{ bottom:17px;right:17px;border-left:0;border-top:0; }
  /* La cabecera propia sobra: la barra queda encima con el logo, el tema y el
     mismo botón hecho X. */
  .bn-menu-top{ display:none; }
  .bn-menu-top-viejo{ position:relative;display:flex;align-items:center;justify-content:space-between;
    padding:26px 28px 10px;font-family:var(--bn-mono);font-size:10px;
    letter-spacing:.14em;color:var(--bn-ink3); }
  .bn-menu-close{ width:34px;height:34px;position:relative;padding:0;border:0;background:none;
    color:var(--bn-ink3); }
  .bn-menu-close .x{ position:absolute;left:9px;top:16px;width:16px;height:1.5px;
    background:currentColor;transform:rotate(45deg); }
  .bn-menu-close .x::after{ content:'';position:absolute;inset:0;background:currentColor;
    transform:rotate(90deg); }
  /* 'safe center': centra si cabe, alinea al inicio si desborda. Con 'center'
     a secas la primera fila se salía por arriba al desplegar. */
  .bn-menu-nav{ position:relative;flex:1;display:flex;flex-direction:column;justify-content:flex-start;
    /* Anclado arriba, no centrado: centrar hacía que al desplegar las
       capacidades todo subiera, y compensarlo por JS acumulaba estado. Sin
       centrado crece hacia abajo por naturaleza. El fondo deja que la última
       fila libre el pie y su velo. */
    padding:26px 28px 76px;gap:2px;
    /* min-height:0 para que pueda ceder al desplegar las capacidades; sin él
       un hijo de flex no baja de su contenido y se recorta la última fila. */
    min-height:0;overflow-y:auto;scrollbar-width:none; }
  .bn-menu-nav::-webkit-scrollbar{ display:none; }
  .bn-menu-nav a{ display:flex;align-items:baseline;gap:16px;text-decoration:none;
    padding:14px 6px;border-bottom:1px solid rgb(var(--bn-ink-rgb)/.10);
    /* Entra de lado, no de abajo: el desplazamiento vertical hacía que todo
       "subiera" al abrir y se sentía brusco. */
    opacity:0;transform:translateX(-14px);
    transition:opacity .62s cubic-bezier(.22,1,.36,1),transform .68s cubic-bezier(.22,1,.36,1),padding-left .3s ease; }
  body.bn-menu-open .bn-menu-nav a{ opacity:1;transform:none; }
  @media(hover:hover) and (pointer:fine){ .bn-menu-nav a:hover{ padding-left:18px; } }
  .bn-menu-num{ font-family:var(--bn-mono);font-size:11px;letter-spacing:.2em;
    color:rgb(var(--bn-ink-rgb)/.28);width:26px;flex:none; }
  .bn-menu-name{ font-family:'Space Grotesk',system-ui,sans-serif;
    font-size:clamp(24px,7vw,38px);font-weight:300;letter-spacing:-.01em;
    color:var(--bn-ink);line-height:1; }
  /* Dos filas que no pueden pisarse: canales arriba, ubicación abajo. */
  /* Velo inferior, espejo del de la barra: la navegación desplaza y sin esto el
     contenido se cortaba en seco contra el pie. */
  .bn-menu-foot::before{ content:'';position:absolute;left:0;right:0;bottom:100%;height:56px;z-index:2;
    background:linear-gradient(0deg,rgb(var(--bn-bg)/.92) 0%,rgb(var(--bn-bg)/.55) 42%,rgb(var(--bn-bg)/0) 100%);
    pointer-events:none; }
  .bn-menu-foot{ position:relative;display:flex;flex-direction:column;align-items:stretch;gap:14px;
    padding:18px 28px calc(26px + env(safe-area-inset-bottom,0px));
    border-top:1px solid rgb(var(--bn-ink-rgb)/.10);
    font-family:var(--bn-mono);font-size:10px;letter-spacing:.12em;color:var(--bn-ink3); }
  /* Las ocho capacidades no caben desplegadas: cinco filas de menú más ocho
     pedían más alto del que tiene un teléfono. Se abren al tocar, igual que el
     desplegable de escritorio. */
  /* La línea separadora va en la FILA, no en el enlace: en el enlace se corta
     donde empieza la flecha y no cierra como las demás. */
  .bn-menu-fila{ display:flex;align-items:center;gap:6px;
    border-bottom:1px solid rgb(var(--bn-ink-rgb)/.10); }
  /* Con el acordeón abierto la fila queda realzada: el estado que daría el
     hover, que en táctil no existe. */
  .bn-menu-fila.act > a{ padding-left:18px; }
  .bn-menu-fila.act .bn-menu-name{ color:var(--bn-ink); }
  .bn-menu-fila > a{ flex:1;min-width:0;border-bottom:0; }
  /* Solo la punta, sin círculo: competía con las filas. El área táctil sigue
     siendo de 42px. */
  .bn-menu-mas{
    width:42px;height:42px;flex:none;display:flex;align-items:center;justify-content:center;
    border:0;background:none;padding:0;
  }
  .bn-menu-mas i{
    width:9px;height:9px;display:block;
    border-right:1.5px solid var(--bn-ink3);border-bottom:1.5px solid var(--bn-ink3);
    transform:translateY(-2px) rotate(45deg);
    transition:transform .35s cubic-bezier(.16,1,.3,1);
  }
  .bn-menu-mas[aria-expanded="true"] i{ transform:translateY(1px) rotate(225deg); }
  /* Vive dentro de .bn-menu-nav, que ya pone el margen lateral: aquí solo una
     sangría que lo lee como dependiente de su fila. */
  /* flex:none — hijo de contenedor flex: sin esto se encoge en vez de tomar
     su alto. Quien desplaza es la navegación, no este bloque. */
  /* Solo abre. El fade va fila a fila: si el contenedor también se funde, su
     opacidad global tapa la cascada. */
  .bn-menu-svc{ position:relative;flex:0 0 auto;padding:0 0 0 26px;margin-bottom:2px;
    max-height:0;overflow:hidden;
    transition:max-height .55s cubic-bezier(.22,1,.36,1); }
  .bn-menu-svc.abierto{ max-height:560px; }
  /* Cada capacidad entra por su cuenta, con el gesto lateral del menú. */
  .bn-menu-svc .svcm-svc a{ opacity:0;transform:translateX(-16px);
    transition:opacity .34s ease-out,transform .42s cubic-bezier(.22,1,.36,1),
               color .25s ease,padding-left .3s ease; }
  .bn-menu-svc.abierto .svcm-svc a{ opacity:1;transform:none; }
  .bn-menu-svc::-webkit-scrollbar{ display:none; }
  @media(prefers-reduced-motion:reduce){ .bn-menu-svc,.bn-menu-mas i{ transition:none; } }
  .bn-menu-cta{ display:flex;flex-wrap:wrap;gap:12px;align-items:center; }
  .bn-menu-cta a{ width:42px;height:42px;display:flex;align-items:center;justify-content:center;
    border:1px solid rgb(var(--bn-ink-rgb)/.14);border-radius:50%;color:var(--bn-ink3);
    transition:color .25s ease,border-color .25s ease,background .25s ease,transform .25s ease; }
  .bn-menu-cta a:focus-visible{ color:var(--bn-ink);border-color:rgb(var(--bn-ink-rgb)/.28); }
  @media(hover:hover) and (pointer:fine){
    .bn-menu-cta a:hover{ color:var(--bn-ink);border-color:rgb(var(--bn-ink-rgb)/.28);
      background:rgb(var(--bn-ink-rgb)/.05);transform:translateY(-2px); }
  }
  .bn-menu-cta svg{ width:17px;height:17px;display:block; }
  .bn-menu-foot a{ color:var(--bn-ink);text-decoration:none; }
  .bn-menu-meta{ display:flex;justify-content:space-between;align-items:center;gap:16px; }

  @media(max-width:720px){
    /* En móvil la navegación de la barra se va entera al menú: antes se
       ocultaban algunos enlaces y esas rutas quedaban sin salida. */
    .bn-nav{ display:none; }
    .bn-lab{ display:none; }
    .bn-burger{ display:flex; }
    .bn-right{ margin-left:auto;gap:10px; }
  }
  @media(max-width:480px){ .bn-bar{ font-size:9px;padding:12px 16px; } }
  /* ── Cursor: retícula de puntería (idéntico al home) ── */
  .cur-dot,.cur-ring{ position:fixed;top:0;left:0;pointer-events:none;z-index:9999;border-radius:50%;
    transform:translate(-50%,-50%);opacity:0; }
  .cur-dot{ width:5px;height:5px;background:var(--bn-ink);mix-blend-mode:difference;
    transition:width .22s ease,height .22s ease; }
  .cur-dot.fijo{ width:3px;height:3px; }
  .cur-ring{ width:30px;height:30px;border:1px solid rgba(244,245,247,.4);mix-blend-mode:difference;
    transition:width .25s ease,height .25s ease,border-color .25s ease,opacity .25s ease; }
  .cur-ring.on{ width:42px;height:42px;border-color:transparent; }
  /* Blanco puro bajo difference = inverso exacto del fondo: se lee igual
     sobre negro, blanco o imagen, sin una regla por tema. */
  .cur-ring::before{ content:'';position:absolute;inset:0;opacity:0;
    --c:rgba(255,255,255,.92); --l:11px; --g:1.5px;
    background:
      linear-gradient(var(--c),var(--c)) left top/var(--l) var(--g) no-repeat,
      linear-gradient(var(--c),var(--c)) left top/var(--g) var(--l) no-repeat,
      linear-gradient(var(--c),var(--c)) right top/var(--l) var(--g) no-repeat,
      linear-gradient(var(--c),var(--c)) right top/var(--g) var(--l) no-repeat,
      linear-gradient(var(--c),var(--c)) left bottom/var(--l) var(--g) no-repeat,
      linear-gradient(var(--c),var(--c)) left bottom/var(--g) var(--l) no-repeat,
      linear-gradient(var(--c),var(--c)) right bottom/var(--l) var(--g) no-repeat,
      linear-gradient(var(--c),var(--c)) right bottom/var(--g) var(--l) no-repeat;
    transform:scale(1.55) rotate(45deg);
    transition:opacity .22s ease,transform .46s cubic-bezier(.16,1.1,.3,1); }
  .cur-ring.on::before{ opacity:1;transform:scale(1) rotate(0deg); }
  @media(hover:none),(pointer:coarse){ .cur-dot,.cur-ring{ display:none; } body{ cursor:auto; } }`;

  function injectCss() {
    const st = document.createElement('style');
    st.id = 'bn-chrome-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function build() {
    if (document.querySelector('.bn-bar')) return;
    document.documentElement.setAttribute('data-theme','amber');
    injectCss();
    const es = () => document.documentElement.lang === 'es';

    const bar = document.createElement('div');
    bar.className = 'bn-bar';
    bar.innerHTML =
      '<a class="bn-left" href="/" data-hover><span class="bn-dot"></span> B&amp;N</a>' +
      '<nav class="bn-nav">' +
      LINKS.map(l => {
        const here = !!(l.here && ES_HERE[l.here] && ES_HERE[l.here](location.pathname));
        const min = (l.href === '/#dossier' || l.href === '/#contact') ? ' data-min="1"' : '';
        const svc = l.svc ? ' data-svc-trigger' : '';
        return `<a href="${l.href}"${here ? ' class="is-here"' : ''}${min}${svc} data-en="${l.en}" data-es="${l.es}" data-hover>${l.en}</a>`;
      }).join('') +
      '</nav>' +
      '<div class="bn-right">' +
        (location.pathname.startsWith('/servicios') ? '<span class="bn-lab">// SERVICIO</span>'
          : location.pathname.startsWith('/lab') ? '<span class="bn-lab">// LAB</span>'
          : ES_HERE.research(location.pathname) ? '<span class="bn-lab">// RESEARCH</span>' : '') +
        /* El selector solo aparece donde la página declara soporte de tema, y
           esa declaración es el fragmento anti-parpadeo del <head>, que deja
           data-mode escrito. Sin él, mostrar el botón pondría fondo claro bajo
           un texto pensado para negro: ilegible. Se excluye solo. */
        (document.documentElement.dataset.mode ?
        '<button class="bn-tema" id="bnTema" type="button" data-hover ' +
          'aria-label="Cambiar entre tema claro y oscuro">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<mask id="bnEcl"><circle cx="12" cy="12" r="7.2" fill="#fff"/>' +
          '<circle class="ec-cut" cx="12" cy="12" r="7.2" fill="#000"/></mask>' +
          '<circle class="ec-corona" cx="12" cy="12" r="10.6"/>' +
          '<circle class="ec-body" cx="12" cy="12" r="7.2" mask="url(#bnEcl)"/></svg></button>' : '') +
        '<button class="bn-lang" id="bnLang" type="button" data-hover>' +
          '<span class="active" data-lang="en">EN</span> / <span data-lang="es">ES</span></button>' +
      '</div>' +
      /* Menú: en móvil los enlaces de la barra no caben y algunos se ocultaban,
         dejando rutas sin salida. El botón está en TODAS las páginas que usan
         este chrome, igual que en el home. */
      '<button class="bn-burger" id="bnBurger" type="button" data-hover ' +
        'aria-label="Abrir menú" aria-expanded="false"><i></i><i></i></button>';
    document.body.insertBefore(bar, document.body.firstChild);

    buildMenu();
    wireLang();
    wireTema();
    cursor();
    /* El panel de servicios vive en su propio archivo para no duplicar el
       catálogo entre el home y estas rutas. Se carga desde aquí para no tener
       que meter una etiqueta <script> en las 51 páginas generadas. */
    cargarServicios();
  }

  function cargarServicios() {
    const listo = () => {
      if (!window.BNServicios) return;
      const t = document.querySelector('.bn-nav [data-svc-trigger]');
      if (t) window.BNServicios.montar(t);
      const ov = document.getElementById('bnMenu');
      if (ov) inyectaCapacidades(ov);
      wireLang();   // reetiqueta lo recién insertado en el idioma activo
      // Las páginas de servicio dibujan su propia simulación con este motor y
      // no saben cuándo termina de cargar: se les avisa.
      dispatchEvent(new Event('bn:servicios'));
    };
    if (window.BNServicios) return listo();
    const s = document.createElement('script');
    s.src = '/servicios-nav.js';
    s.onload = listo;
    s.onerror = () => {};   // sin el módulo, la barra sigue funcionando igual
    document.head.appendChild(s);
  }

  /* Las ocho capacidades dentro del menú móvil. El catálogo vive en
     servicios-nav.js: una sola verdad para el home y para estas rutas. */
  function inyectaCapacidades(ov) {
    if (!window.BNServicios || ov.querySelector('.bn-menu-svc')) return;
    const esp = document.documentElement.lang !== 'en';
    const caja = document.createElement('div');
    caja.className = 'bn-menu-svc';
    // Sin título: la fila de la que cuelga ya dice Capacidades.
    if (window.BNServicios.inyectaCss) window.BNServicios.inyectaCss();
    caja.innerHTML = window.BNServicios.listaMovil('svcm');
    // Miniaturas con la simulación de cada capacidad: corren sólo desplegadas.
    const sims = window.BNServicios.animaLista ? window.BNServicios.animaLista(caja) : null;
    caja.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('bn-menu-open');
      document.body.style.overflow = '';
    }));
    // Cuelga de SU fila, no del final de la navegación: tocar Capacidades y
    // que aparezca algo debajo del último ítem no se entiende.
    const fila = ov.querySelector('.bn-menu-fila');
    const nav = ov.querySelector('.bn-menu-nav');
    if (fila) fila.insertAdjacentElement('afterend', caja);
    else if (nav) nav.insertAdjacentElement('afterend', caja);
    // Despliegue: el enlace sigue llevando a la sección y la punta abre las
    // ocho. Dos objetivos táctiles distintos, que es lo único que funciona
    // con el pulgar.
    // Toda la FILA despliega, no solo la punta: el enlace ocupaba el resto del
    // ancho y tocar un poco a la izquierda navegaba y cerraba el menú. Se
    // escucha en captura para ganarle al handler de cierre del enlace.
    const mas = document.getElementById('bnMenuMas');
    const filaCap = ov.querySelector('.bn-menu-fila');
    // Sin trucos: el menú está anclado arriba, así que abrir y cerrar solo
    // cambia el alto del bloque. Nada que congelar ni que acumular.
    if (filaCap) filaCap.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const abierto = caja.classList.toggle('abierto');
      if (mas) mas.setAttribute('aria-expanded', String(abierto));
      filaCap.classList.toggle('act', abierto);
      if (sims) { if (abierto) sims.start(); else sims.stop(); }
    }, true);
    // Cascada: cada capacidad con su propio retardo.
    caja.querySelectorAll('.svcm-svc a').forEach((a, i) => {
      a.style.transitionDelay = (0.07 + i * 0.06) + 's';
    });
    // Al cerrar el menú vuelve plegado.
    new MutationObserver(() => {
      if (!document.body.classList.contains('bn-menu-open')) {
        caja.classList.remove('abierto');
        if (mas) mas.setAttribute('aria-expanded', 'false');
        if (sims) sims.stop();
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── Menú móvil ──
     Mismo overlay que el home: pantalla completa, numerado, con los canales y
     el idioma abajo en dos filas que no se pisan. El tema NO va aquí: vive en
     la barra, al lado del botón, y duplicarlo solo apretaba el pie. */
  function buildMenu() {
    const es = document.documentElement.lang !== 'en';
    const ITEMS = [
      { href: '/',          en: 'Home',         es: 'Inicio' },
      { href: '/#dossier',  en: 'Capabilities', es: 'Capacidades' },
      { href: '/proyectos', en: 'Projects',     es: 'Proyectos' },
      { href: '/research',  en: 'Research',     es: 'Research' },
      { href: '/lab',       en: 'Lab',          es: 'Lab' },
      { href: '/c',         en: 'Directory',    es: 'Directorio' },
      { href: '/#contact',  en: 'Contact',      es: 'Contacto' }
    ];
    const ov = document.createElement('div');
    ov.className = 'bn-menu';
    ov.id = 'bnMenu';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.innerHTML =
      '<span class="bn-menu-bk tl"></span><span class="bn-menu-bk tr"></span>' +
      '<span class="bn-menu-bk bl"></span><span class="bn-menu-bk br"></span>' +
      '<div class="bn-menu-top"><span><span class="bn-dot"></span> B&amp;N</span>' +
        '<button class="bn-menu-close" id="bnMenuClose" type="button" ' +
          'aria-label="Cerrar menú" data-hover><span class="x" aria-hidden="true"></span></button></div>' +
      '<nav class="bn-menu-nav">' +
      /* Los data-en/data-es van en el SPAN del nombre, no en el <a>: wireLang
         reescribe el innerHTML de todo lo que los tenga, y puestos en el ancla
         se llevaba por delante el número y el propio span. */
      ITEMS.map((l, i) => {
        const fila = `<a href="${l.href}" data-hover>` +
          `<span class="bn-menu-num">0${i + 1}</span>` +
          `<span class="bn-menu-name" data-en="${l.en}" data-es="${l.es}">${es ? l.es : l.en}</span></a>`;
        if (l.href !== '/#dossier') return fila;
        return '<div class="bn-menu-fila">' + fila +
          '<button class="bn-menu-mas" id="bnMenuMas" type="button" aria-expanded="false"' +
          ' aria-label="Ver las capacidades"><i></i></button></div>';
      }).join('') +
      '</nav>' +
      '<div class="bn-menu-foot">' +
        /* Solo iconos: tres palabras en mayúsculas se comían la fila en un
           teléfono. Sin data-en/data-es, que reescriben innerHTML y borrarían
           el SVG; la etiqueta accesible se traduce aparte, en wireLang. */
        '<div class="bn-menu-cta">' +
          '<a href="https://wa.me/56937287950" target="_blank" rel="noopener" data-hover' +
            ' data-al-es="WhatsApp" data-al-en="WhatsApp" aria-label="WhatsApp">' + ICONO.wa + '</a>' +
          '<a href="mailto:contacto@bnsolutions.cl" data-hover' +
            ' data-al-es="Correo" data-al-en="Email" aria-label="Correo">' + ICONO.mail + '</a>' +
          '<a href="/c" data-hover' +
            ' data-al-es="Directorio del equipo" data-al-en="Team directory"' +
            ' aria-label="Directorio del equipo">' + ICONO.dir + '</a>' +
        '</div>' +
        '<div class="bn-menu-meta"><span>SANTIAGO · CHILE</span></div>' +
      '</div>';
    document.body.appendChild(ov);

    /* Las ocho capacidades, dentro del menú. El catálogo vive en
       servicios-nav.js: una sola verdad para el home y para estas rutas. */
    inyectaCapacidades(ov);

    const btn = document.getElementById('bnBurger');
    const abrir = () => {
      document.body.classList.add('bn-menu-open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const cerrar = () => {
      document.body.classList.remove('bn-menu-open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    btn.addEventListener('click', () =>
      document.body.classList.contains('bn-menu-open') ? cerrar() : abrir());
    document.getElementById('bnMenuClose').addEventListener('click', cerrar);
    ov.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('bn-menu-open')) cerrar();
    });
    ov.querySelectorAll('.bn-menu-nav a').forEach((a, i) => {
      a.style.transitionDelay = (0.05 + i * 0.05) + 's';
    });
  }

  /* ── Tema claro/oscuro ──
     Misma preferencia que el home ('bn-tema' en localStorage), así que cruzar
     de / a /servicios o /lab conserva el modo. El atributo se escribe además
     antes del primer pixel desde el <head> de cada página: este script va con
     defer y llega tarde, así que aquí solo se cablea el botón. */
  function wireTema() {
    const btn = document.getElementById('bnTema');
    if (!btn) return;
    const raiz = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    const COLOR = { dark: '#000000', light: '#f7f9fc' };
    /* Dos temas en un botón: el oscuro original y el claro. Hubo un tercero,
       'azul' —el oscuro con el acento de marca—, eliminado el 8 sep 2026.
       Quien lo tuviera guardado cae en el oscuro: CICLO['azul'] es undefined. */
    const CICLO = { dark: 'light', light: 'dark' };
    const ETIQUETA = { dark: 'Tema oscuro', light: 'Tema claro' };
    function aplicar(m, guardar) {
      raiz.dataset.mode = m;
      btn.setAttribute('aria-pressed', String(m === 'light'));
      btn.setAttribute('title', ETIQUETA[m] || '');
      if (meta) meta.setAttribute('content', COLOR[m]);
      if (guardar) { try { localStorage.setItem('bn-tema', m); } catch (e) {} }
      dispatchEvent(new CustomEvent('bn:tema', { detail: { claro: m === 'light' } }));
      dispatchEvent(new Event('themechange'));
    }
    aplicar(CICLO[raiz.dataset.mode] ? raiz.dataset.mode : 'dark', false);
    btn.addEventListener('click', () => aplicar(CICLO[raiz.dataset.mode] || 'light', true));
  }

  /* ── Idioma (contenido bilingüe del lab) ── */
  function wireLang() {
    const toggle = document.getElementById('bnLang');
    if (!toggle) return;
    const spans = [...toggle.querySelectorAll('span[data-lang]')];
    let current = document.documentElement.lang === 'en' ? 'en' : 'es';
    /* Páginas escritas sólo en español (<meta name="bn:idiomas" content="es">):
       en inglés se avisa, en vez de dejar el botón sin efecto visible. */
    const soloEs = (document.querySelector('meta[name="bn:idiomas"]') || {}).content === 'es';
    let aviso = document.getElementById('bnSoloEs');
    if (soloEs && !aviso) {
      aviso = document.createElement('div');
      aviso.id = 'bnSoloEs';
      aviso.setAttribute('role', 'status');
      aviso.style.cssText = 'position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));' +
        'transform:translateX(-50%);z-index:1300;font-family:var(--bn-mono);font-size:10px;letter-spacing:.14em;' +
        'color:var(--bn-ink);background:rgb(var(--bn-bg)/.92);border:1px solid rgb(var(--bn-azul-rgb)/.5);' +
        'padding:10px 16px;white-space:nowrap;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);display:none;';
      aviso.textContent = 'THIS ARTICLE IS AVAILABLE IN SPANISH ONLY';
      document.body.appendChild(aviso);
    }

    function set(lang) {
      current = lang;
      spans.forEach(s => s.classList.toggle('active', s.dataset.lang === lang));
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-en][data-es]').forEach(el => {
        const t = el.dataset[lang];
        if (t !== undefined) el.innerHTML = t;
      });
      // Enlaces que son solo icono: se traduce la etiqueta accesible, no el
      // contenido — reescribir innerHTML borraría el SVG.
      document.querySelectorAll('[data-al-en][data-al-es]').forEach(el => {
        const v = lang === 'en' ? el.dataset.alEn : el.dataset.alEs;
        if (v !== undefined) el.setAttribute('aria-label', v);
      });
      try { localStorage.setItem('nm-lang', lang); } catch (e) {}
      if (aviso) aviso.style.display = lang === 'en' ? 'block' : 'none';
      dispatchEvent(new CustomEvent('bn:idioma', { detail: { lang } }));
    }
    /* wireLang se llama dos veces (al construir y al cargar las capacidades):
       el listener va una sola vez o cada clic cambiaría y devolvería el idioma. */
    if (!toggle.dataset.cableado) {
      toggle.dataset.cableado = '1';
      toggle.addEventListener('click', () => set(document.documentElement.lang === 'en' ? 'es' : 'en'));
    }

    // ?lang= en la URL manda sobre la preferencia guardada.
    const q = new URLSearchParams(location.search).get('lang');
    let saved = 'es';
    try { saved = localStorage.getItem('nm-lang') || 'es'; } catch (e) {}
    if (q === 'en' || q === 'es') saved = q;
    set(saved === 'en' ? 'en' : 'es');
  }

  /* ── Cursor agujero-negro ── */
  function cursor() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (document.querySelector('.cur-dot')) return;
    const dot = document.createElement('div'); dot.className = 'cur-dot';
    const ring = document.createElement('div'); ring.className = 'cur-ring';
    document.body.append(dot, ring);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, on = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!on) { on = true; rx = x; ry = y; dot.style.opacity = ring.style.opacity = '1'; }
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    }, { passive: true });
    (function loop() {
      requestAnimationFrame(loop);
      rx += (x - rx) * .16; ry += (y - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    })();
    const HIT = 'a, button, summary, .exp, .step, input[type=range], .copy, [data-hover]';
    addEventListener('pointerover', e => {
      const hit = e.target.closest && e.target.closest(HIT);
      ring.classList.toggle('on', !!hit);
      dot.classList.toggle('fijo', !!hit);
    }, { passive: true });
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
