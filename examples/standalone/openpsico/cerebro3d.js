/* ═══════════════════════════════════════════════════════════════════════════
   OPENPSICO — el cerebro de la portada, en 3D (Three.js r170, servido local).

   No hay malla: el cerebro lo FORMAN las partículas. Miles de puntos
   muestreados sobre una corteza procedural —dos hemisferios con turbulencia
   de Perlin, las cisuras de Silvio y central, el cerebelo con sus folias y el
   tronco— dibujan la silueta, y la densidad dibuja los pliegues: en los surcos
   hay menos puntos. Un relleno interior tenue le da cuerpo.

   Sobre esa nube corre la red: neuronas más grandes, axones curvos y
   potenciales de acción que viajan en el color de su lóbulo. Cada disparo
   manda una onda que enciende las partículas vecinas (se resuelve en la GPU
   con los últimos 24 disparos). La dinámica es la del lienzo 2D de sims.js:
   integración con fuga, umbral, refractario, retardo e inhibición global.

   Sin superficie que tape, la profundidad la da el propio punto: los del
   fondo son más tenues y más chicos, los que miran de frente más firmes.

   Al entrar en pantalla las partículas se reúnen hasta formar el cerebro,
   con la cámara fija en el encuadre definitivo durante todo el ensamblado.
   Oscila alrededor de la vista lateral; se arrastra para girarlo (en táctil
   sólo el gesto horizontal: el vertical es scroll); el cursor estimula las
   neuronas que toca y nombra el lóbulo.

   La portada muestra únicamente este cerebro, sin una animación 2D previa.
   `data-fijo="1"` en el contenedor lo deja ensamblado y quieto, para la lámina.
   ═══════════════════════════════════════════════════════════════════════════ */
import * as THREE from './vendor/three.module.min.js';

const cont = document.getElementById('cerebro3d');

function hayWebGL(){
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch(e){ return false; }
}

if(cont && hayWebGL()){
  try { montar(); }
  catch(e){ console.warn('[cerebro3d] no se pudo montar:', e); }
}

function montar(){
  const FIJO = cont.dataset.fijo === '1';
  const QUIETO = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const MOVIL = innerWidth < 900;
  const DPR = FIJO ? 2 : Math.min(devicePixelRatio || 1, MOVIL ? 1.75 : 2);
  let semillaN = 20260913;
  const r = () => (semillaN = (semillaN*1664525 + 1013904223) % 4294967296) / 4294967296;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a)/(b - a))); return t*t*(3 - 2*t); };

  /* ── Ruido de Perlin (versión mejorada, permutación con semilla) ─────── */
  const PERM = new Uint8Array(512);
  { const p = [...Array(256).keys()];
    for(let i=255;i>0;i--){ const j = Math.floor(r()*(i+1)); [p[i], p[j]] = [p[j], p[i]]; }
    for(let i=0;i<512;i++) PERM[i] = p[i & 255]; }
  const fade = t => t*t*t*(t*(t*6 - 15) + 10);
  const mix = (a, b, t) => a + (b - a)*t;
  const grad = (h, x, y, z) => { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
  function perlin(x, y, z){
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A+1] + Z, B = PERM[X+1] + Y, BA = PERM[B] + Z, BB = PERM[B+1] + Z;
    return mix(mix(mix(grad(PERM[AA], x, y, z),     grad(PERM[BA], x-1, y, z),     u),
                   mix(grad(PERM[AB], x, y-1, z),   grad(PERM[BB], x-1, y-1, z),   u), v),
               mix(mix(grad(PERM[AA+1], x, y, z-1), grad(PERM[BA+1], x-1, y, z-1), u),
                   mix(grad(PERM[AB+1], x, y-1, z-1), grad(PERM[BB+1], x-1, y-1, z-1), u), v), w);
  }

  const LOB = {
    frontal:   { n:'LÓBULO FRONTAL',    c:'#2563eb' },
    parietal:  { n:'LÓBULO PARIETAL',   c:'#0ea5e9' },
    occipital: { n:'LÓBULO OCCIPITAL',  c:'#6366f1' },
    temporal:  { n:'LÓBULO TEMPORAL',   c:'#0d9488' },
    cerebelo:  { n:'CEREBELO',          c:'#7c3aed' },
    tronco:    { n:'TRONCO ENCEFÁLICO', c:'#475569' },
  };
  const ORDEN = Object.keys(LOB);
  const COLOR = {}; for(const k of ORDEN) COLOR[k] = new THREE.Color(LOB[k].c);
  const BLANCO = new THREE.Color('#ffffff');

  /* ── Forma ────────────────────────────────────────────────────────────
     Coordenadas del cerebro: x a los lados, y hacia arriba, z hacia la
     frente. Largo ≈ 1,8 veces el alto, como un encéfalo real. */
  const HX = .38;
  const silvio = dz => -.10 - (dz - .30)*.34;
  const central = dy => .12 - dy*.28;

  function lobuloDe(dx, dy, dz, lado){
    if(dz < -.66 + dy*.10) return 'occipital';
    if(dx*lado > -.35 && dy < silvio(dz) && dz > -.55 && dz < .78) return 'temporal';
    if(dz > central(dy)) return 'frontal';
    return 'parietal';
  }
  /* El color se funde de un lóbulo al otro: un corte recto se lee como
     pegatina, no como tejido. */
  function colorCorteza(dx, dy, dz, lado, c){
    c.copy(COLOR.parietal);
    c.lerp(COLOR.frontal, smooth(-.10, .10, dz - central(dy)));
    c.lerp(COLOR.occipital, smooth(-.10, .10, (-.66 + dy*.10) - dz));
    if(dx*lado > -.35){
      const t = smooth(-.07, .07, silvio(dz) - dy)*smooth(-.62, -.48, dz)*(1 - smooth(.70, .84, dz));
      c.lerp(COLOR.temporal, t);
    }
    return c;
  }

  const RADIOS = med => [med ? .36 : .60, .70, 1.16];
  function base(dx, dy, dz, lado){
    const med = dx*lado < 0;
    const [rx, ry, rz] = RADIOS(med);
    let x = dx*rx, y = dy*ry, z = dz*rz;
    if(y < -.18) y = -.18 + (y + .18)*.55;
    x *= 1 - .18*Math.max(0, -dz)**2 - .10*Math.max(0, dz)**2;
    y *= 1 - .10*Math.max(0, -dz)**3;
    y += .05*dz;
    if(!med){
      const k = Math.max(0, -.05 - dy)*Math.max(0, 1 - Math.abs(dz - .18)/.55);
      x += lado*.10*k; y -= .12*k; z += .06*k;
    }
    return { x:lado*HX + x, y, z };
  }
  function hemisferio(dx, dy, dz, lado){
    const p = base(dx, dy, dz, lado);
    const qx = p.x + lado*7.3, qy = p.y, qz = p.z;
    const w = .45*perlin(qx*1.4 + 3.1, qy*1.4, qz*1.4);
    const s1 = Math.abs(perlin(qx*2.7 + w, qy*2.7 - w, qz*2.7 + w*.5));
    const s2 = Math.abs(perlin(qx*6.1 - w, qy*6.1 + 11, qz*6.1 + w));
    let d = Math.max(1 - smooth(0, .16, s1), .32*(1 - smooth(0, .16, s2)));
    if(dx*lado > -.2 && dz > -.55 && dz < .75) d = Math.max(d, 1.7*Math.exp(-(((dy - silvio(dz))/.045)**2)));
    if(dy > -.05) d = Math.max(d, 1.3*Math.exp(-(((dz - central(dy))/.04)**2)));
    const cx = lado*HX*.7, cy = -.12, k = 1 - .06*Math.min(d, 1.7);
    const [rx, ry, rz] = RADIOS(dx*lado < 0);
    const nx = dx/rx, ny = dy/ry, nz = dz/rz, L = Math.hypot(nx, ny, nz) || 1;
    return { x:cx + (p.x - cx)*k, y:cy + (p.y - cy)*k, z:p.z*k, d:Math.min(1, d),
             nx:nx/L, ny:ny/L, nz:nz/L, lob:lobuloDe(dx, dy, dz, lado), cx, cy, cz:0 };
  }
  const CB = { c:[0, -.50, -.70], r:[.56, .25, .36] };
  function cerebelo(dx, dy, dz){
    const f = Math.abs(Math.sin((dy*.95 + dz*.30)*17 + perlin(dx*2, dy*2, dz*2)*1.2));
    const d = Math.max(1 - smooth(0, .35, f), .9*Math.exp(-((dx/.07)**2)));
    const k = 1 - .06*d;
    const nx = dx/CB.r[0], ny = dy/CB.r[1], nz = dz/CB.r[2], L = Math.hypot(nx, ny, nz) || 1;
    return { x:CB.c[0] + dx*CB.r[0]*k, y:CB.c[1] + dy*CB.r[1]*k, z:CB.c[2] + dz*CB.r[2]*k, d,
             nx:nx/L, ny:ny/L, nz:nz/L, lob:'cerebelo', cx:CB.c[0], cy:CB.c[1], cz:CB.c[2] };
  }
  function tronco(){
    const t = r(), a = r()*Math.PI*2, rad = .085 - t*.03;
    const nx = Math.cos(a), nz = Math.sin(a);
    return { x:nx*rad, y:-.40 - t*.62, z:-.30 + t*.10 + nz*rad, d:0, nx, ny:0, nz, lob:'tronco', cx:0, cy:-.4 - t*.62, cz:-.3 };
  }
  const dentroCerebro = p => {
    const lado = p.x >= 0 ? 1 : -1;
    return ((p.x - lado*HX)/.56)**2 + ((p.y + .02)/.66)**2 + (p.z/1.10)**2 < .92;
  };
  const direccion = () => {
    const u = r()*2 - 1, th = r()*Math.PI*2, s = Math.sqrt(1 - u*u);
    return [s*Math.cos(th), u, s*Math.sin(th)];
  };

  /* ── Escena ─────────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance', preserveDrawingBuffer:FIJO });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  cont.appendChild(renderer.domElement);
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(30, 1, .1, 50);
  const cerebro = new THREE.Group();
  escena.add(cerebro);

  /* ── Muestreo: la nube ─────────────────────────────────────────────── */
  const N_PART = MOVIL ? 6500 : 14000;
  const muestras = [];
  const c = new THREE.Color();
  let intentos = 0;
  while(muestras.length < N_PART && intentos++ < N_PART*6){
    const q = r();
    let P, lado = 0, interior = false;
    if(q < .81){
      const [dx, dy, dz] = direccion();
      lado = r() < .5 ? -1 : 1;
      P = hemisferio(dx, dy, dz, lado);
      if(P.d > .55 && r() < .78) continue;                    // los surcos quedan ralos: así se ven los pliegues
      if(dy < -.6 && r() < .55) continue;                     // la base casi no se ve
      colorCorteza(dx, dy, dz, lado, c);
    } else if(q < .90){
      const [dx, dy, dz] = direccion();
      P = cerebelo(dx, dy, dz);
      if(dentroCerebro(P)) continue;
      if(P.d > .6 && r() < .7) continue;
      c.copy(COLOR.cerebelo);
    } else if(q < .92){
      P = tronco();
      if(dentroCerebro(P)) continue;
      c.copy(COLOR.tronco);
    } else {
      /* Relleno interior: pocos puntos, chicos y tenues. Le dan cuerpo. */
      const [dx, dy, dz] = direccion();
      lado = r() < .5 ? -1 : 1;
      P = hemisferio(dx, dy, dz, lado);
      const s = .35 + .55*Math.cbrt(r());
      P.x = P.cx + (P.x - P.cx)*s; P.y = P.cy + (P.y - P.cy)*s; P.z = P.z*s;
      colorCorteza(dx, dy, dz, lado, c);
      interior = true;
    }
    c.lerp(BLANCO, .06).multiplyScalar(1 - .18*P.d);
    muestras.push({ P, col:[c.r, c.g, c.b], interior, lado });
  }

  const NP = muestras.length;
  const geoPart = new THREE.BufferGeometry();
  const radioNube = muestras.reduce((radio, { P }) => Math.max(radio, Math.hypot(P.x, P.y, P.z)), 0);
  {
    const aPos = new Float32Array(NP*3), aIni = new Float32Array(NP*3), aNor = new Float32Array(NP*3);
    const aCol = new Float32Array(NP*3), aTam = new Float32Array(NP), aSem = new Float32Array(NP);
    muestras.forEach((m, i) => {
      const P = m.P;
      aPos.set([P.x, P.y, P.z], i*3);
      aNor.set(m.interior ? [0, 0, 0] : [P.nx, P.ny, P.nz], i*3);
      aCol.set(m.col, i*3);
      aTam[i] = m.interior ? 1.5 + r()*.8 : 2.1 + r()*1.3;
      aSem[i] = r();
      // Dispersión dentro del encuadre final: las partículas viajan, la cámara no.
      const inicio = new THREE.Vector3(P.x + (r() - .5)*.3, P.y + .15 + (r() - .5)*.3, P.z + (r() - .5)*.3);
      const radio = Math.max(Math.hypot(P.x, P.y, P.z), radioNube*(.9 + r()*.1));
      inicio.normalize().multiplyScalar(radio);
      aIni.set([inicio.x, inicio.y, inicio.z], i*3);
    });
    geoPart.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
    geoPart.setAttribute('aIni', new THREE.BufferAttribute(aIni, 3));
    geoPart.setAttribute('aNormal', new THREE.BufferAttribute(aNor, 3));
    geoPart.setAttribute('aColor', new THREE.BufferAttribute(aCol, 3));
    geoPart.setAttribute('aTam', new THREE.BufferAttribute(aTam, 1));
    geoPart.setAttribute('aSem', new THREE.BufferAttribute(aSem, 1));
  }
  const NEV = 24;
  const uEv = Array.from({ length:NEV }, () => new THREE.Vector4(0, 0, 0, -99));
  const matPart = new THREE.ShaderMaterial({
    uniforms:{ uTiempo:{ value:0 }, uIntro:{ value:FIJO ? 1 : 0 }, uPix:{ value:DPR }, uDist:{ value:5 }, uEv:{ value:uEv } },
    vertexShader:`
      attribute vec3 aIni; attribute vec3 aNormal; attribute vec3 aColor; attribute float aTam; attribute float aSem;
      uniform float uTiempo, uIntro, uPix, uDist;
      uniform vec4 uEv[${NEV}];
      varying vec3 vCol; varying float vAlf;
      void main(){
        float k = clamp(uIntro*1.45 - aSem*.45, 0.0, 1.0);
        k = k*k*(3.0 - 2.0*k);
        vec3 p = mix(aIni, position, k);
        p += aNormal*sin(uTiempo*1.4 + aSem*47.0)*.006;

        float luz = 0.0;
        for(int i = 0; i < ${NEV}; i++){
          float edad = uTiempo - uEv[i].w;
          if(edad < 0.0 || edad > 1.1) continue;
          float d = distance(p, uEv[i].xyz);
          float onda = exp(-pow((d - edad*.42)/.045, 2.0))*(1.0 - edad/1.1);
          float foco = exp(-d*d/.010)*max(0.0, 1.0 - edad*2.2);
          luz += onda*.85 + foco;
        }
        luz = min(luz, 1.0)*k;

        vec4 mv = modelViewMatrix*vec4(p, 1.0);
        float lateral = length(aNormal) > .5 ? smoothstep(-.45, .55, normalize(normalMatrix*aNormal).z) : .45;
        float prof = clamp((-mv.z - (uDist - 1.2))/2.4, 0.0, 1.0);
        vCol = mix(aColor, aColor*.92, luz);
        vAlf = ((.16 + .66*lateral)*(1.0 - .60*prof) + luz*.35)*mix(.25, 1.0, k);
        gl_PointSize = aTam*uPix*(uDist/-mv.z)*(1.0 + luz*.9)*(1.0 - .25*prof);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader:`
      varying vec3 vCol; varying float vAlf;
      void main(){
        float d = length(gl_PointCoord - .5)*2.0;
        if(d > 1.0 || vAlf < .01) discard;
        gl_FragColor = vec4(vCol, vAlf*smoothstep(1.0, .35, d));
      }`,
    transparent:true, depthWrite:false, depthTest:false,
  });
  const nube = new THREE.Points(geoPart, matPart);
  nube.frustumCulled = false;
  cerebro.add(nube);

  /* ── Neuronas: las partículas que mandan ─────────────────────────────── */
  const N_NEU = MOVIL ? 120 : 190;
  const minD = MOVIL ? .21 : .17;
  const neu = [];
  for(let i=0; i<muestras.length*4 && neu.length < N_NEU; i++){
    const m = muestras[Math.floor(r()*muestras.length)];
    if(m.interior || m.P.d > .3 || m.P.lob === 'tronco') continue;
    const P = m.P;
    let lejos = true;
    for(const o of neu){ if((o.x-P.x)**2 + (o.y-P.y)**2 + (o.z-P.z)**2 < minD*minD){ lejos = false; break; } }
    if(!lejos) continue;
    neu.push({ x:P.x, y:P.y, z:P.z, n:new THREE.Vector3(P.nx, P.ny, P.nz), lob:P.lob,
               grupo:P.lob === 'cerebelo' ? 0 : m.lado, v:r()*.7, ref:0, luz:0, sal:[] });
  }
  const ejes = [];
  for(let i=0;i<neu.length;i++){
    const a = neu[i], d = [];
    for(let j=0;j<neu.length;j++){
      if(j === i || neu[j].grupo !== a.grupo) continue;
      const b = neu[j], dd = (a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2;
      if(dd < .50*.50) d.push([dd, j]);
    }
    d.sort((p, q) => p[0] - q[0]);
    for(const [, j] of d.slice(0, 3)){
      const b = neu[j];
      const A = new THREE.Vector3(a.x, a.y, a.z), B = new THREE.Vector3(b.x, b.y, b.z);
      const L = A.distanceTo(B);
      const C = A.clone().add(B).multiplyScalar(.5).add(a.n.clone().add(b.n).normalize().multiplyScalar(.03 + .14*L));
      ejes.push({ a:i, b:j, A, B, C, L:A.distanceTo(C) + C.distanceTo(B) });
      a.sal.push(ejes.length - 1);
    }
  }
  const bez = (e, u, out) => {
    const k = 1 - u;
    out.x = k*k*e.A.x + 2*k*u*e.C.x + u*u*e.B.x;
    out.y = k*k*e.A.y + 2*k*u*e.C.y + u*u*e.B.y;
    out.z = k*k*e.A.z + 2*k*u*e.C.z + u*u*e.B.z;
    return out;
  };
  const matAxon = new THREE.LineBasicMaterial({ color:0x1e3a8a, transparent:true, opacity:0, depthWrite:false, depthTest:false });
  {
    const SEG = 10, arr = new Float32Array(ejes.length*SEG*6);
    const p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
    let o = 0;
    for(const e of ejes) for(let s=0;s<SEG;s++){
      bez(e, s/SEG, p0); bez(e, (s+1)/SEG, p1);
      arr[o++] = p0.x; arr[o++] = p0.y; arr[o++] = p0.z;
      arr[o++] = p1.x; arr[o++] = p1.y; arr[o++] = p1.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const lineas = new THREE.LineSegments(geo, matAxon);
    lineas.frustumCulled = false;
    cerebro.add(lineas);
  }

  const geoNeu = new THREE.BufferGeometry();
  {
    const aPos = new Float32Array(neu.length*3), aCol = new Float32Array(neu.length*3), aNor = new Float32Array(neu.length*3);
    neu.forEach((n, i) => { aPos.set([n.x, n.y, n.z], i*3); aNor.set([n.n.x, n.n.y, n.n.z], i*3);
                            const k = COLOR[n.lob]; aCol.set([k.r, k.g, k.b], i*3); });
    geoNeu.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
    geoNeu.setAttribute('aColor', new THREE.BufferAttribute(aCol, 3));
    geoNeu.setAttribute('aNormal', new THREE.BufferAttribute(aNor, 3));
    geoNeu.setAttribute('aLuz', new THREE.BufferAttribute(new Float32Array(neu.length), 1));
  }
  const matNeu = new THREE.ShaderMaterial({
    uniforms:{ uPix:{ value:DPR }, uDist:{ value:5 }, uIntro:{ value:FIJO ? 1 : 0 } },
    vertexShader:`
      attribute vec3 aColor; attribute vec3 aNormal; attribute float aLuz;
      uniform float uPix, uDist, uIntro;
      varying vec3 vCol; varying float vLuz; varying float vTam; varying float vVis;
      void main(){
        vec4 mv = modelViewMatrix*vec4(position, 1.0);
        float prof = clamp((-mv.z - (uDist - 1.2))/2.4, 0.0, 1.0);
        vVis = (.30 + .70*smoothstep(-.35, .5, normalize(normalMatrix*aNormal).z))*(1.0 - .55*prof)*smoothstep(.55, 1.0, uIntro);
        vTam = 26.0*uPix*(uDist/-mv.z);
        gl_PointSize = vTam;
        vCol = aColor; vLuz = aLuz;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader:`
      uniform float uPix;
      varying vec3 vCol; varying float vLuz; varying float vTam; varying float vVis;
      void main(){
        float d = length(gl_PointCoord - .5)*vTam/uPix;
        float nucleo = 1.0 - smoothstep(2.3 + vLuz*1.6, 3.3 + vLuz*1.6, d);
        float halo = (1.0 - smoothstep(3.0, 5.5 + vLuz*6.5, d))*vLuz*.30;
        float r0 = 3.5 + (1.0 - vLuz)*9.0;
        float onda = (1.0 - smoothstep(0.0, 1.1, abs(d - r0)))*vLuz*.6;
        float a = max(nucleo*(.85 + .15*vLuz), max(halo, onda))*vVis;
        if(a < .01) discard;
        gl_FragColor = vec4(vCol*(1.0 - .15*vLuz), a);
      }`,
    transparent:true, depthWrite:false, depthTest:false,
  });
  const puntosNeu = new THREE.Points(geoNeu, matNeu);
  puntosNeu.frustumCulled = false;
  cerebro.add(puntosNeu);

  /* Potenciales de acción: cabeza y dos puntos de estela por pulso. */
  const MAXP = 700, ESTELA = 3;
  const geoPul = new THREE.BufferGeometry();
  const pPos = new Float32Array(MAXP*ESTELA*3), pCol = new Float32Array(MAXP*ESTELA*3), pAlf = new Float32Array(MAXP*ESTELA);
  geoPul.setAttribute('position', new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage));
  geoPul.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3).setUsage(THREE.DynamicDrawUsage));
  geoPul.setAttribute('aAlpha', new THREE.BufferAttribute(pAlf, 1).setUsage(THREE.DynamicDrawUsage));
  const matPul = new THREE.ShaderMaterial({
    uniforms:{ uPix:{ value:DPR }, uDist:{ value:5 } },
    vertexShader:`
      attribute vec3 aColor; attribute float aAlpha;
      uniform float uPix, uDist;
      varying vec3 vCol; varying float vAlf;
      void main(){
        vec4 mv = modelViewMatrix*vec4(position, 1.0);
        float prof = clamp((-mv.z - (uDist - 1.2))/2.4, 0.0, 1.0);
        gl_PointSize = (3.0 + 3.5*aAlpha)*uPix*(uDist/-mv.z);
        vCol = aColor; vAlf = aAlpha*(1.0 - .55*prof);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader:`
      varying vec3 vCol; varying float vAlf;
      void main(){
        float d = length(gl_PointCoord - .5)*2.0;
        if(d > 1.0) discard;
        gl_FragColor = vec4(vCol, vAlf*smoothstep(1.0, .2, d));
      }`,
    transparent:true, depthWrite:false, depthTest:false,
  });
  const puntosPul = new THREE.Points(geoPul, matPul);
  puntosPul.frustumCulled = false;
  cerebro.add(puntosPul);

  /* ── Leyenda, rótulo y datos ────────────────────────────────────────── */
  const ley = document.getElementById('cerLey'), dato = document.getElementById('cerDato');
  let etq = document.getElementById('cerEtq');
  if(!etq){ etq = document.createElement('div'); etq.hidden = true; cont.appendChild(etq); }
  if(ley) ley.innerHTML = ORDEN.map(k => `<span><i style="background:${LOB[k].c}"></i>${LOB[k].n.replace('LÓBULO ','')}</span>`).join('');

  /* ── Encuadre ───────────────────────────────────────────────────────── */
  const OBJ = new THREE.Vector3(0, -.18, 0);
  // Encuadre estable desde el primer cuadro, con margen para cualquier giro.
  const radioDe = atributo => {
    let radio = 0;
    for(let i = 0; i < atributo.count; i++){
      radio = Math.max(radio, Math.hypot(atributo.getX(i), atributo.getY(i), atributo.getZ(i)));
    }
    return radio + OBJ.length() + .02;
  };
  const radioFinal = radioDe(geoPart.attributes.position);
  let W = 0, H = 0;
  function encuadrar(){
    const radio = radioFinal;
    const t = Math.tan(THREE.MathUtils.degToRad(camara.fov/2));
    // Margen para el tamaño de los puntos y los halos de las neuronas.
    const margen = Math.max(.65, 1 - 40/Math.min(W, H));
    const angulo = Math.atan(t*Math.min(1, camara.aspect)*margen);
    const dist = Math.max(Math.max(1.0/t, 1.48/(t*camara.aspect))*1.12, radio/Math.sin(angulo));
    camara.position.set(0, OBJ.y + .30, dist);
    camara.lookAt(OBJ);
    camara.far = dist + radio*2 + 10;
    camara.updateProjectionMatrix();
    for(const m of [matPart, matNeu, matPul]) m.uniforms.uDist.value = dist;
  }
  function medir(){
    const b = cont.getBoundingClientRect();
    W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height));
    renderer.setSize(W, H, false);
    camara.aspect = W/H;
    encuadrar();
  }
  medir();

  /* ── Gestos ─────────────────────────────────────────────────────────── */
  let angUser = 0, incUser = 0, vAng = 0, tAuto = 0, arrastre = null, corriendo = false;
  const puntero = { x:0, y:0, dentro:false };
  const pose = () => {
    const osc = FIJO ? -.42 : (QUIETO ? -.3 : .62*Math.sin(tAuto*.32));
    cerebro.rotation.set(.16 + incUser, -Math.PI/2 + angUser + osc, 0);
  };
  const leer = e => { const b = cont.getBoundingClientRect(); puntero.x = e.clientX - b.left; puntero.y = e.clientY - b.top; };
  if(!FIJO){
    cont.addEventListener('pointerenter', e => { leer(e); puntero.dentro = true; });
    cont.addEventListener('pointerleave', () => { puntero.dentro = false; if(!arrastre) etq.hidden = true; });
    cont.addEventListener('pointerdown', e => {
      leer(e); puntero.dentro = true;
      arrastre = { x:e.clientX, y:e.clientY, id:e.pointerId, decidido:e.pointerType === 'mouse' };
    });
    cont.addEventListener('pointermove', e => {
      leer(e); puntero.dentro = true;
      if(!arrastre || e.pointerId !== arrastre.id) return;
      const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      if(!arrastre.decidido){
        if(Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if(Math.abs(dy) > Math.abs(dx)){ arrastre = null; return; }
        arrastre.decidido = true;
        try { cont.setPointerCapture(e.pointerId); } catch(_){}
      }
      angUser += dx*.0075; vAng = dx*.5;
      incUser = Math.max(-.45, Math.min(.45, incUser + dy*.0035));
      arrastre.x = e.clientX; arrastre.y = e.clientY;
      if(!corriendo) pintar();
    });
    const soltar = e => {
      if(arrastre && e.pointerId === arrastre.id) arrastre = null;
      if(e.pointerType !== 'mouse') setTimeout(() => { puntero.dentro = false; etq.hidden = true; }, 900);
    };
    cont.addEventListener('pointerup', soltar);
    cont.addEventListener('pointercancel', soltar);
  }

  /* ── Dinámica ───────────────────────────────────────────────────────── */
  const pul = [];
  let cuenta = 0, ventana = 0, tasa = 0, reloj = 0, iEv = 0;
  const tmp = new THREE.Vector3(), tmpN = new THREE.Vector3();
  function simular(dt, estimular){
    const peso = .48*(1 - Math.min(.8, pul.length/MAXP));
    for(let i=pul.length-1;i>=0;i--){
      const q = pul[i];
      q.u += dt/q.dur;
      if(q.u >= 1){
        const b = neu[ejes[q.e].b];
        if(b.ref <= 0) b.v += peso;
        pul[i] = pul[pul.length-1]; pul.pop();
      }
    }
    for(let i=0;i<neu.length;i++){
      const a = neu[i];
      if(a.ref > 0) a.ref -= dt;
      else {
        a.v += dt*(-a.v*1.1 + .30);
        if(r() < dt*.28) a.v += .62;
        if(estimular && estimular[i]) a.v += dt*3.8*estimular[i];
        if(a.v >= 1){
          a.v = 0; a.ref = .35; a.luz = 1; cuenta++;
          /* La onda en la nube: los últimos NEV disparos, en anillo. */
          uEv[iEv].set(a.x, a.y, a.z, reloj); iEv = (iEv + 1) % NEV;
          if(pul.length < MAXP) for(const ei of a.sal) pul.push({ e:ei, u:0, dur:Math.max(.08, ejes[ei].L/1.2) });
        }
      }
      if(a.luz > 0) a.luz = Math.max(0, a.luz - dt*1.7);
    }
  }
  function volcar(){
    const aLuz = geoNeu.attributes.aLuz;
    for(let i=0;i<neu.length;i++) aLuz.array[i] = neu[i].luz;
    aLuz.needsUpdate = true;
    const vis = matAxon.opacity/.18;
    let k = 0;
    for(const q of pul){
      const e = ejes[q.e], col = COLOR[neu[e.a].lob];
      for(let s=0;s<ESTELA;s++){
        bez(e, Math.max(0, q.u - s*.07), tmp);
        pPos[k*3] = tmp.x; pPos[k*3+1] = tmp.y; pPos[k*3+2] = tmp.z;
        pCol[k*3] = col.r; pCol[k*3+1] = col.g; pCol[k*3+2] = col.b;
        pAlf[k] = (s === 0 ? .95 : .55/s)*vis;
        k++;
      }
    }
    geoPul.setDrawRange(0, k);
    geoPul.attributes.position.needsUpdate = true;
    geoPul.attributes.aColor.needsUpdate = true;
    geoPul.attributes.aAlpha.needsUpdate = true;
    matPart.uniforms.uTiempo.value = reloj;
  }
  for(let i=0;i<240;i++){ reloj += 1/60; simular(1/60, null); }

  function pintar(){ pose(); cerebro.updateMatrixWorld(); renderer.render(escena, camara); }

  const info = { neuronas:neu.length, axones:ejes.length, particulas:NP, tasa:() => tasa, pulsos:() => pul.length, listo:false };
  window.__cerebro3d = info;
  document.documentElement.classList.add('con-3d');

  if(FIJO){
    matAxon.opacity = .18;
    volcar(); pintar();
    requestAnimationFrame(() => { pintar(); info.listo = true; });
    return;
  }

  /* ── Cuadro ─────────────────────────────────────────────────────────── */
  const estim = new Float32Array(neu.length);
  let visible = false, ultimo = 0, intro = QUIETO ? 1 : 0;
  if(QUIETO){ matPart.uniforms.uIntro.value = 1; matNeu.uniforms.uIntro.value = 1; }
  new ResizeObserver(() => { medir(); if(!corriendo) pintar(); }).observe(cont);
  function cuadro(t){
    if(!corriendo) return;
    const dt = Math.min(.05, (t - ultimo)/1000) || .016;
    ultimo = t;
    reloj += dt;

    if(intro < 1){
      intro = Math.min(1, intro + dt/2.4);
      matPart.uniforms.uIntro.value = intro;
      matNeu.uniforms.uIntro.value = intro;
    }
    matAxon.opacity = .18*smooth(.6, 1, intro);

    if(!arrastre && !QUIETO){
      vAng *= Math.pow(.02, dt);
      angUser += dt*vAng*.012;
      tAuto += dt*(puntero.dentro ? .3 : 1);
    }
    pose();
    cerebro.updateMatrixWorld();

    estim.fill(0);
    let cercana = -1, mejor = 1e9;
    if(puntero.dentro && intro >= 1){
      const R = Math.min(W, H)*(MOVIL ? .16 : .11), R2 = R*R;
      for(let i=0;i<neu.length;i++){
        const n = neu[i];
        tmpN.copy(n.n).applyQuaternion(cerebro.quaternion);
        if(tmpN.z < .15) continue;
        tmp.set(n.x, n.y, n.z).applyMatrix4(cerebro.matrixWorld).project(camara);
        const sx = (tmp.x*.5 + .5)*W, sy = (-tmp.y*.5 + .5)*H;
        const d2 = (sx - puntero.x)**2 + (sy - puntero.y)**2;
        if(d2 < R2){ estim[i] = 1 - d2/R2; if(d2 < mejor){ mejor = d2; cercana = i; } }
      }
    }
    simular(QUIETO ? 0 : dt*smooth(.5, 1, intro), estim);

    if(cercana >= 0){
      const L = LOB[neu[cercana].lob];
      if(etq.textContent !== L.n){ etq.textContent = L.n; etq.style.color = L.c; etq.style.borderColor = L.c; }
      etq.hidden = false;
      const ex = Math.min(W - etq.offsetWidth - 8, puntero.x + 18), ey = Math.max(8, puntero.y - 42);
      etq.style.transform = `translate(${ex}px,${ey}px)`;
    } else if(!arrastre) etq.hidden = true;

    volcar();

    ventana += dt;
    if(ventana >= 1){
      tasa = cuenta/ventana; cuenta = 0; ventana = 0;
      if(dato) dato.textContent = `${neu.length} NEURONAS · ${Math.round(tasa)} DISPAROS/S · ${NP.toLocaleString('es-CL')} PARTÍCULAS`;
    }

    renderer.render(escena, camara);
    requestAnimationFrame(cuadro);
  }
  function arrancar(){
    if(corriendo || !visible || document.hidden) return;
    corriendo = true; ultimo = performance.now();
    requestAnimationFrame(cuadro);
  }
  function parar(){ corriendo = false; }
  new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); visible ? arrancar() : parar(); },
                           { rootMargin:'120px 0px' }).observe(cont);
  addEventListener('visibilitychange', () => { document.hidden ? parar() : arrancar(); });
  volcar(); pintar();
  info.listo = true;
}
