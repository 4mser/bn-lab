/* ═══════════════════════════════════════════════════════════════════════════
   OPENPSICO — seis simulaciones sobre la mente medida.

   Mismo contrato que /lateralus: cada sistema expone { init(W,H),
   frame(dt, g, W, H, m) } y el motor de la página instancia una copia por
   lienzo con Object.create, así que el estado vive en `this`.

   Tema CLARO, con el azul de openpsico.com. AZUL para lo que funciona
   (actividad, disponible, resultado) y CORAL para lo que exige atención
   clínica (severidad alta, el ítem 9, falsos positivos). En la portada, cada
   lóbulo del cerebro lleva su propio tono de la familia del azul.

   Lo que se afirma sale de openpsico.com: el catálogo de /app/, la ficha del
   PHQ-9 (bandas, corte ≥ 10, 88 % / 88 %) y sus preguntas frecuentes. Donde
   una figura es ilustrativa, el propio lienzo lo dice.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const TAU = Math.PI*2;
/* Tema CLARO. Los alfas de los sistemas se calibraron sobre negro y sobre
   papel un trazo al 8 % desaparece: la tinta y los acentos los multiplican,
   con tope en 1. El azul es el de openpsico.com (#2563EB). */
const ink = a => 'rgba(15,23,42,' + Math.min(1, a*1.8).toFixed(3) + ')';
const azu = a => 'rgba(37,99,235,' + Math.min(1, a*1.15).toFixed(3) + ')';
const cor = a => 'rgba(220,74,58,' + Math.min(1, a*1.2).toFixed(3) + ')';

const mono = (g,s,w) => { g.font = (w||400)+' '+s+"px 'IBM Plex Mono',ui-monospace,monospace"; };
const sans = (g,s,w) => { g.font = (w||400)+' '+s+"px 'Space Grotesk',system-ui,sans-serif"; };
const hacia = (v,o,k,dt) => v + (o-v)*(1-Math.exp(-k*dt));
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const semilla = s => () => (s = (s*1664525 + 1013904223) % 4294967296) / 4294967296;
const pct = v => Math.round(v*100) + ' %';

/* Rótulo al pie. Parte sólo las líneas que no caben. */
function pie(g, W, H, lineas, alto){
  const compacto = W < 620;
  const s = compacto ? 8.5 : 9.5;
  const x = compacto ? 10 : 16;
  const max = W - x*2;
  mono(g, s, 400);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const filas = [];
  for(const [txt,col] of lineas){
    if(!txt) continue;
    if(g.measureText(txt).width <= max){ filas.push([txt,col]); continue; }
    let linea = '';
    for(const pal of txt.split(' ')){
      const probar = linea ? linea + ' ' + pal : pal;
      if(linea && g.measureText(probar).width > max){ filas.push([linea,col]); linea = pal; }
      else linea = probar;
    }
    if(linea) filas.push([linea,col]);
  }
  let y = H - (alto || 10);
  for(let i=filas.length-1;i>=0;i--){
    g.fillStyle = filas[i][1] || ink(.34);
    g.fillText(filas[i][0], x, y);
    y -= s + 5;
  }
}

function firma(g, W, H, txt){
  mono(g, W<620?8.5:9.5, 500);
  g.textAlign = 'right'; g.textBaseline = 'top';
  g.fillStyle = ink(.30);
  g.fillText(txt, W - (W<620?10:16), W<620?10:14);
  g.textAlign = 'left';
}

function redondo(g,x,y,w,h,r){
  r = Math.min(r, w/2, h/2);
  g.beginPath();
  g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r);     g.arcTo(x,y,x+w,y,r);
  g.closePath();
}

const SIS = {};

/* ═══════════════════════════════════════════════════════════════════════════
   CATÁLOGO — tal cual lo publica openpsico.com/app/ (sep 2026).

   [sigla, disponible, ítems, corte o forma de interpretar]. El catálogo lista
   el PCL-5 dos veces; acá va una: 48 instrumentos distintos, 28 disponibles,
   20 en preparación, 10 áreas.
   ═══════════════════════════════════════════════════════════════════════════ */
const CATALOGO = [
  { k:'ÁNIMO', n:'Depresión y estado de ánimo', t:[
    ['PHQ-9',1,'9','corte ≥ 10 · depresión moderada'],
    ['PHQ-2',1,'2','corte ≥ 3 · sugiere aplicar PHQ-9'],
    ['CES-D',1,'20','corte ≥ 16 · riesgo de depresión clínica'],
    ['QIDS-SR16',0,'16','leve · moderado · severo · muy severo'],
    ['GDS-15',1,'15','corte ≥ 5 · sospecha de depresión'],
    ['MDQ',0,'13','≥ 7 síntomas + interferencia funcional'],
    ['ASRM',0,'5','corte ≥ 6 · probable episodio maníaco'] ]},
  { k:'ANSIEDAD', n:'Ansiedad, fobias y TOC', t:[
    ['GAD-7',1,'7','corte ≥ 10 · ansiedad moderada'],
    ['GAD-2',1,'2','corte ≥ 3 · sugiere aplicar GAD-7'],
    ['OASIS',0,'5','corte ≥ 8 · interferencia significativa'],
    ['SPIN',0,'17','corte ≥ 19 · ansiedad social'],
    ['Mini-SPIN',0,'3','corte ≥ 6 · tamizaje positivo'],
    ['OCI-R',0,'18','corte ≥ 21 · sugiere TOC clínico'],
    ['PDSS-SR',0,'7','severidad del trastorno de pánico'] ]},
  { k:'RIESGO SUICIDA', n:'Ideación y riesgo suicida', t:[
    ['C-SSRS',0,'3–6','algoritmo estructurado sí / no'],
    ['SBQ-R',0,'4','≥ 7 población general · ≥ 8 clínica'],
    ['IDCA',1,'20','bandas percentilares provisionales'] ]},
  { k:'TRAUMA', n:'Trauma, estrés y disociación', t:[
    ['PCL-5',1,'20','corte 31 a 33 puntos'],
    ['DSS',1,'20','total ≥ 10 · provisional'],
    ['DSS-B',1,'8','total ≥ 4 · provisional'],
    ['PC-PTSD-5',1,'5','corte ≥ 3 · evaluación formal'] ]},
  { k:'NEURODESARROLLO', n:'TDAH y autismo en adultos', t:[
    ['ASRS v1.1',1,'6','≥ 4 ítems positivos'],
    ['AQ-10',1,'10','corte ≥ 6 · evaluación especializada'],
    ['AQ-50',1,'50','≥ 26 evaluación · ≥ 32 umbral clínico'],
    ['RAADS-14',1,'14','mentalización, sensorial, reactividad social'] ]},
  { k:'REGULACIÓN', n:'Regulación emocional y síntomas generales', t:[
    ['DERS-16',1,'16','interpretación dimensional 16–80'],
    ['DERS-36',1,'36','interpretación dimensional 36–180'],
    ['PID-5-BF',0,'25','modelo dimensional del DSM-5'],
    ['CORE-10',0,'10','cambio sesión a sesión'],
    ['K10',1,'10','estándar OMS de encuestas de salud'] ]},
  { k:'SUSTANCIAS', n:'Adicciones y uso de sustancias', t:[
    ['AUDIT',1,'10','≥ 8 riesgo · ≥ 20 posible dependencia'],
    ['AUDIT-C',1,'3','≥ 4 hombres · ≥ 3 mujeres'],
    ['CAGE',1,'4','≥ 2 respuestas afirmativas'],
    ['DAST-10',0,'10','corte ≥ 3 · abuso moderado'],
    ['FTND',0,'6','corte ≥ 6 · dependencia alta'] ]},
  { k:'ALIMENTACIÓN · SUEÑO', n:'Alimentación, sueño y somatización', t:[
    ['EAT-26',0,'26','≥ 20 requiere derivación clínica'],
    ['SCOFF',1,'5','≥ 2 afirmativas · tamizaje positivo'],
    ['ISI',0,'7','≥ 15 insomnio clínico'],
    ['PHQ-15',1,'15','≥ 10 somatización moderada / alta'] ]},
  { k:'BIENESTAR', n:'Bienestar, autoestima y recursos', t:[
    ['RSES',1,'10','autoestima global'],
    ['SWLS',1,'5','satisfacción con la vida'],
    ['WHO-5',1,'5','< 50 % sugiere tamizaje de depresión'],
    ['PSS-10',0,'10','estrés percibido'] ]},
  { k:'LABORAL', n:'Burnout y engagement', t:[
    ['CBI',1,'19','0–100 por subescala · referencia 50'],
    ['UWES',0,'9','media por subescala 0–6'],
    ['OLBI',1,'16','bandas orientativas Peterson 2008'],
    ['MBI',0,'22','baremos según forma'],
    ['ERI',0,'23','cociente esfuerzo / recompensa > 1'] ]},
];

/* ═══════════════════════════════════════════════════════════════════════════
   01 · CEREBRO — la portada.

   Un corte lateral del encéfalo con sus lóbulos teñidos —frontal, parietal,
   occipital, temporal, cerebelo y tronco— y, adentro, neuronas dibujadas como
   neuronas: soma, dendritas que se ramifican y un axón curvo hacia sus
   vecinas. Cada una integra potencial con fuga, dispara al cruzar el umbral,
   queda refractaria y manda un potencial de acción que recorre el axón en el
   color de su lóbulo. La conectividad es de mundo pequeño: vecinas cercanas
   más unas pocas fibras largas que cruzan de un lóbulo a otro.

   El cursor es un electrodo: estimula la zona que toca y nombra el lóbulo.
   La silueta, los surcos, los tintes y las dendritas se pintan UNA vez en un
   lienzo aparte; por cuadro sólo se dibuja lo que cambia.
   ═══════════════════════════════════════════════════════════════════════════ */
const LOBULOS = {
  frontal:   { n:'LÓBULO FRONTAL',    c:'37,99,235'  },
  parietal:  { n:'LÓBULO PARIETAL',   c:'14,165,233' },
  occipital: { n:'LÓBULO OCCIPITAL',  c:'99,102,241' },
  temporal:  { n:'LÓBULO TEMPORAL',   c:'13,148,136' },
  cerebelo:  { n:'CEREBELO',          c:'124,58,237' },
  tronco:    { n:'TRONCO ENCEFÁLICO', c:'71,85,105'  },
};
const ORDEN_LOB = ['frontal','parietal','occipital','temporal','cerebelo','tronco'];

/* Lóbulo de un punto en coordenadas normalizadas de la silueta (frente a la
   izquierda). Los bordes siguen las cisuras que se dibujan: la central, la de
   Silvio y la parieto-occipital. */
function lobulo(u, v){
  if(v > .79 && u > .46 && u < .64) return 'tronco';
  if(u > .60 && v > .62) return 'cerebelo';
  const silvio = .60 - (u - .26)*.39;
  if(u > .18 && u < .68 && v > silvio) return 'temporal';
  if(u < .47 - .16*(v - .03)) return 'frontal';
  if(u > .75) return 'occipital';
  return 'parietal';
}

function siluetaCerebro(p, X, Y){
  p.moveTo(X(.14),Y(.62));
  p.bezierCurveTo(X(.02),Y(.50), X(.03),Y(.22), X(.20),Y(.12));    // frente
  p.bezierCurveTo(X(.32),Y(.02), X(.52),Y(.00), X(.66),Y(.05));    // coronilla
  p.bezierCurveTo(X(.84),Y(.10), X(.99),Y(.26), X(.96),Y(.50));    // occipucio
  p.bezierCurveTo(X(.95),Y(.58), X(.92),Y(.62), X(.90),Y(.63));
  p.bezierCurveTo(X(.97),Y(.70), X(.92),Y(.86), X(.78),Y(.86));    // cerebelo
  p.bezierCurveTo(X(.70),Y(.86), X(.65),Y(.82), X(.62),Y(.79));
  p.bezierCurveTo(X(.61),Y(.88), X(.60),Y(.95), X(.58),Y(1.0));    // tronco
  p.lineTo(X(.51),Y(1.0));
  p.bezierCurveTo(X(.52),Y(.92), X(.53),Y(.84), X(.52),Y(.77));
  p.bezierCurveTo(X(.44),Y(.80), X(.30),Y(.80), X(.24),Y(.72));    // lóbulo temporal
  p.bezierCurveTo(X(.20),Y(.67), X(.17),Y(.64), X(.14),Y(.62));
  p.closePath();
}

SIS.sinapsis = {
  init(W,H){
    const r = semilla(20260913);
    this.r = r;
    const desnudo = !!(this.datos && this.datos.desnudo === '1');
    this.desnudo = desnudo;
    let bw, bx, by;
    if(desnudo){ bw = Math.min(W*.94, H*1.14); bx = (W-bw)/2; by = (H-bw*.8)/2; }
    else if(W >= 900){ bw = Math.min(W*.46, (H-130)*1.22); bx = W - bw - Math.max(28, W*.05); by = 54 + (H-54-bw*.8)/2; }
    else { bw = W*.90; bx = (W-bw)/2; by = 66; }
    const bh = bw*.80;
    this.caja = { bx, by, bw, bh };
    const X = u => bx + u*bw, Y = v => by + v*bh;
    this.U = x => (x-bx)/bw; this.V = y => (y-by)/bh;
    const path = new Path2D(); siluetaCerebro(path, X, Y);
    this.path = path;

    const E = 2;
    const base = document.createElement('canvas');
    base.width = Math.ceil(W*E); base.height = Math.ceil(H*E);
    const b = base.getContext('2d');
    this.base = base; this.bctx = b; this.E = E;

    /* Neuronas: muestreo con distancia mínima dentro de la silueta. La prueba
       se hace con la transformación identidad, en píxeles de CSS. */
    const N = desnudo ? 190 : (W >= 900 ? 180 : 120);
    const dmin = bw*.036;
    this.n = [];
    for(let t=0; t<8000 && this.n.length<N; t++){
      const x = bx + r()*bw, y = by + r()*bh;
      if(!b.isPointInPath(path, x, y)) continue;
      let lejos = true;
      for(const q of this.n){ if((q.x-x)**2 + (q.y-y)**2 < dmin*dmin){ lejos = false; break; } }
      if(!lejos) continue;
      const lob = lobulo(this.U(x), this.V(y));
      const dend = [], nd = 3 + Math.floor(r()*3);
      for(let k=0;k<nd;k++) dend.push([r()*TAU, bw*(.012 + r()*.016), (r()-.5)*1.3]);
      this.n.push({ x, y, lob, c:LOBULOS[lob].c, v:r()*.7, ref:0, luz:0, sal:[], dend });
    }

    /* Axones: tres vecinas + a veces una fibra larga, todas curvas. */
    const n = this.n, NN = n.length;
    this.e = [];
    for(let i=0;i<NN;i++){
      const a = n[i], d = [];
      for(let j=0;j<NN;j++) if(j !== i) d.push([(a.x-n[j].x)**2 + (a.y-n[j].y)**2, j]);
      d.sort((p,q)=>p[0]-q[0]);
      const destinos = [d[0][1], d[1][1], d[2][1]];
      if(r() < .07) destinos.push(d[Math.floor(NN*.6 + r()*NN*.35)][1]);
      for(const j of destinos){
        const q = n[j], mx = (a.x+q.x)/2, my = (a.y+q.y)/2, dx = q.x-a.x, dy = q.y-a.y;
        const L = Math.hypot(dx,dy) || 1;
        const curva = (L > bw*.2 ? .30 : .18)*(r() < .5 ? -1 : 1);
        this.e.push({ a:i, b:j, cx:mx - dy*curva, cy:my + dx*curva, L });
        a.sal.push(this.e.length - 1);
      }
    }

    /* ── El fondo, pintado una vez ── */
    b.setTransform(E,0,0,E,0,0);
    b.save();
    b.shadowColor = 'rgba(37,99,235,.20)'; b.shadowBlur = 46; b.shadowOffsetY = 16;
    b.fillStyle = '#ffffff'; b.fill(path);
    b.restore();

    b.save();
    b.clip(path);
    /* Tinte de cada lóbulo, por celdas. */
    const paso = Math.max(3, bw/150);
    for(let yy=by; yy<by+bh; yy+=paso) for(let xx=bx; xx<bx+bw; xx+=paso){
      const lob = lobulo(this.U(xx+paso/2), this.V(yy+paso/2));
      b.fillStyle = 'rgba(' + LOBULOS[lob].c + ',.085)';
      b.fillRect(xx, yy, paso+.6, paso+.6);
    }
    /* Circunvoluciones: trazos ondulados cortos. */
    b.lineCap = 'round';
    const nGiros = Math.round(bw*.17);
    for(let k=0;k<nGiros;k++){
      let x = 0, y = 0, intento = 0;
      do { x = bx + r()*bw; y = by + r()*bh; intento++; }
      while(!b.isPointInPath(path, x*E, y*E) && intento < 40);
      const ang = r()*Math.PI, len = bw*(.05 + r()*.07), amp = bw*.008, fase = r()*TAU;
      b.strokeStyle = 'rgba(15,23,42,.075)'; b.lineWidth = 1.1;
      b.beginPath();
      for(let s=0;s<=16;s++){
        const u2 = s/16 - .5;
        const px = x + Math.cos(ang)*u2*len, py = y + Math.sin(ang)*u2*len;
        const w = Math.sin(u2*TAU*1.6 + fase)*amp;
        const qx = px - Math.sin(ang)*w, qy = py + Math.cos(ang)*w;
        s ? b.lineTo(qx,qy) : b.moveTo(qx,qy);
      }
      b.stroke();
    }
    /* Las cisuras mayores. */
    b.strokeStyle = 'rgba(15,23,42,.22)'; b.lineWidth = 1.7;
    b.beginPath(); b.moveTo(X(.26),Y(.60)); b.bezierCurveTo(X(.40),Y(.56), X(.52),Y(.44), X(.64),Y(.46)); b.stroke();   // de Silvio
    b.beginPath(); b.moveTo(X(.47),Y(.03)); b.bezierCurveTo(X(.44),Y(.18), X(.47),Y(.32), X(.41),Y(.48)); b.stroke();   // central
    b.beginPath(); b.moveTo(X(.75),Y(.07)); b.bezierCurveTo(X(.73),Y(.16), X(.77),Y(.24), X(.75),Y(.32)); b.stroke();   // parieto-occipital
    b.beginPath(); b.moveTo(X(.90),Y(.63)); b.bezierCurveTo(X(.80),Y(.66), X(.70),Y(.70), X(.62),Y(.79)); b.stroke();   // tentorio
    /* Folias del cerebelo. */
    b.strokeStyle = 'rgba(124,58,237,.18)'; b.lineWidth = 1;
    for(let k=1;k<=5;k++){
      b.beginPath();
      b.ellipse(X(.79), Y(.79), bw*(.03 + k*.026), bh*(.012 + k*.013), -.25, Math.PI*.95, Math.PI*2.02);
      b.stroke();
    }
    /* Dendritas: tronco y dos ramas por cada una. */
    b.lineWidth = 1;
    for(const q of this.n){
      b.strokeStyle = 'rgba(' + q.c + ',.45)';
      b.beginPath();
      for(const [ang,len,fork] of q.dend){
        const x1 = q.x + Math.cos(ang)*len, y1 = q.y + Math.sin(ang)*len;
        b.moveTo(q.x, q.y); b.lineTo(x1, y1);
        b.moveTo(x1, y1); b.lineTo(x1 + Math.cos(ang+fork)*len*.6, y1 + Math.sin(ang+fork)*len*.6);
        b.moveTo(x1, y1); b.lineTo(x1 + Math.cos(ang-fork*.8)*len*.5, y1 + Math.sin(ang-fork*.8)*len*.5);
      }
      b.stroke();
    }
    b.restore();
    b.strokeStyle = 'rgba(37,99,235,.55)'; b.lineWidth = 1.8;
    b.stroke(path);
    /* Nombres de los cuatro lóbulos corticales. Van FUERA del recorte —si no,
       el borde de la silueta se come las letras del occipital— y con un halo
       de papel, para que ningún axón ni cisura los tache. */
    if(bw >= 300){
      mono(b, bw < 500 ? 7.5 : 9, 500);
      b.textAlign = 'center'; b.textBaseline = 'middle';
      b.lineJoin = 'round'; b.lineWidth = 4;
      [['FRONTAL',.22,.34],['PARIETAL',.60,.21],['OCCIPITAL',.84,.44],['TEMPORAL',.43,.69]].forEach(([t,u,v])=>{
        const lob = lobulo(u, v);
        b.strokeStyle = 'rgba(255,255,255,.92)'; b.strokeText(t, X(u), Y(v));
        b.fillStyle = 'rgba(' + LOBULOS[lob].c + ',.85)'; b.fillText(t, X(u), Y(v));
      });
      b.textAlign = 'left'; b.textBaseline = 'alphabetic';
    }

    this.p = [];
    this.vel = bw*.55;
    this.cuenta = 0; this.ventana = 0; this.tasa = 0;
  },
  frame(dt,g,W,H,m){
    const r = this.r, n = this.n, e = this.e, cj = this.caja;
    const R = cj.bw*(W < 900 ? .18 : .13), R2 = R*R;

    const peso = .48*(1 - clamp(this.p.length/900, 0, .8));
    for(let i=this.p.length-1;i>=0;i--){
      const q = this.p[i];
      q.u += dt/q.dur;
      if(q.u >= 1){
        const b2 = n[e[q.e].b];
        if(b2.ref <= 0) b2.v += peso;
        this.p[i] = this.p[this.p.length-1]; this.p.pop();
      }
    }
    for(const a of n){
      if(a.ref > 0) a.ref -= dt;
      else {
        a.v += dt*(-a.v*1.1 + .30);                  // fuga + corriente basal
        if(r() < dt*.28) a.v += .62;                 // disparo espontáneo
        if(m.dentro){
          const d2 = (a.x-m.x)**2 + (a.y-m.y)**2;
          if(d2 < R2) a.v += dt*3.6*(1 - d2/R2);
        }
        if(a.v >= 1){
          a.v = 0; a.ref = .35; a.luz = 1; this.cuenta++;
          if(this.p.length < 900) for(const ei of a.sal)
            this.p.push({ e:ei, u:0, dur:Math.max(.08, e[ei].L*1.15/this.vel) });
        }
      }
      if(a.luz > 0) a.luz = Math.max(0, a.luz - dt*1.7);
    }
    this.ventana += dt;
    if(this.ventana >= 1){ this.tasa = this.cuenta/this.ventana; this.cuenta = 0; this.ventana = 0; }

    g.clearRect(0,0,W,H);
    g.drawImage(this.base, 0, 0, W, H);

    /* Axones. */
    g.lineWidth = .8; g.strokeStyle = 'rgba(15,23,42,.11)';
    g.beginPath();
    for(const ed of e){ const a = n[ed.a], b2 = n[ed.b]; g.moveTo(a.x,a.y); g.quadraticCurveTo(ed.cx, ed.cy, b2.x, b2.y); }
    g.stroke();

    /* Potenciales de acción, agrupados por el lóbulo de origen. */
    const punto = (ed, u) => { const a = n[ed.a], b2 = n[ed.b], k = 1-u;
      return [k*k*a.x + 2*k*u*ed.cx + u*u*b2.x, k*k*a.y + 2*k*u*ed.cy + u*u*b2.y]; };
    g.lineWidth = 2.2; g.lineCap = 'round';
    for(const lob of ORDEN_LOB){
      g.strokeStyle = 'rgba(' + LOBULOS[lob].c + ',.92)';
      g.beginPath();
      let hay = false;
      for(const q of this.p){
        const ed = e[q.e];
        if(n[ed.a].lob !== lob) continue;
        hay = true;
        const u0 = Math.max(0, q.u - .22);
        const [x0,y0] = punto(ed, u0);
        g.moveTo(x0, y0);
        for(let s=1;s<=3;s++){ const [x1,y1] = punto(ed, u0 + (q.u-u0)*s/3); g.lineTo(x1, y1); }
      }
      if(hay) g.stroke();
    }
    g.lineCap = 'butt';

    /* Somas: halo al disparar, núcleo y onda. */
    for(const a of n){
      const lz = a.luz;
      if(lz > 0){
        g.fillStyle = 'rgba(' + a.c + ',' + (.16*lz).toFixed(3) + ')';
        g.beginPath(); g.arc(a.x, a.y, 4 + lz*9, 0, TAU); g.fill();
      }
      g.fillStyle = 'rgba(' + a.c + ',' + (.66 + .34*lz).toFixed(3) + ')';
      g.beginPath(); g.arc(a.x, a.y, 2.4 + lz*1.6, 0, TAU); g.fill();
      if(lz > 0){
        g.strokeStyle = 'rgba(' + a.c + ',' + (.45*lz).toFixed(3) + ')'; g.lineWidth = 1;
        g.beginPath(); g.arc(a.x, a.y, 3 + (1-lz)*14, 0, TAU); g.stroke();
      }
    }

    /* El electrodo y el lóbulo que toca. */
    if(m.dentro){
      g.strokeStyle = 'rgba(37,99,235,.55)'; g.lineWidth = 1; g.setLineDash([3,4]);
      g.beginPath(); g.arc(m.x, m.y, R, 0, TAU); g.stroke();
      g.setLineDash([]);
      if(this.bctx.isPointInPath(this.path, m.x*this.E, m.y*this.E)){
        const lob = LOBULOS[lobulo(this.U(m.x), this.V(m.y))];
        mono(g, 10, 500);
        const tw = g.measureText(lob.n).width;
        const lx = clamp(m.x + R*.72, 10, W - tw - 22), ly = clamp(m.y - R*.72, 76, H - 20);
        g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(lx-8, ly-15, tw+16, 22);
        g.strokeStyle = 'rgba(' + lob.c + ',.6)'; g.strokeRect(lx-7.5, ly-14.5, tw+15, 21);
        g.fillStyle = 'rgba(' + lob.c + ',1)'; g.textBaseline = 'alphabetic';
        g.fillText(lob.n, lx, ly);
      }
    }

    /* Leyenda de lóbulos arriba del cerebro y la actividad abajo. */
    if(W >= 900 && !this.desnudo){
      mono(g, 9, 500); g.textBaseline = 'alphabetic'; g.textAlign = 'left';
      let x = cj.bx;
      const y = cj.by - 20;
      for(const k of ORDEN_LOB){
        const L = LOBULOS[k], t = L.n.replace('LÓBULO ','');
        g.fillStyle = 'rgba(' + L.c + ',1)';
        g.beginPath(); g.arc(x+3, y-3, 3.2, 0, TAU); g.fill();
        g.fillStyle = 'rgba(15,23,42,.60)';
        g.fillText(t, x+11, y);
        x += g.measureText(t).width + 28;
      }
      g.fillStyle = 'rgba(15,23,42,.48)'; g.textAlign = 'right';
      g.fillText(n.length + ' NEURONAS · ' + Math.round(this.tasa) + ' DISPAROS/S · 0 BYTES AL SERVIDOR',
                 cj.bx + cj.bw, cj.by + cj.bh + 22);
      g.textAlign = 'left';
    }
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   02 · ATLAS — elige el instrumento.

   Los 48 instrumentos del catálogo, agrupados en sus diez áreas. Cada área es
   una flor filotáctica alrededor de su centro; el tamaño del nodo sigue la
   raíz de la cantidad de ítems. Lleno = disponible hoy; hueco = en
   preparación. Sin cursor, el atlas se recorre solo por los disponibles.
   ═══════════════════════════════════════════════════════════════════════════ */
SIS.atlas = {
  init(W,H){
    this.t = 0; this.auto = 0; this.ia = 0; this.sel = null; this.luz = 0;
    const comp = W < 620;
    this.comp = comp;
    const cx = W*.5, cy = comp ? H*.47 : H*.49;
    const rx = comp ? W*.34 : W*.36, ry = comp ? H*.30 : H*.30;
    const paso = Math.min(W,H)*(comp ? .030 : .031);
    this.cx = cx; this.cy = cy;
    this.areas = []; this.nodos = [];
    CATALOGO.forEach((c,ci)=>{
      const ang = -Math.PI/2 + ci*TAU/CATALOGO.length;
      const ax = cx + Math.cos(ang)*rx, ay = cy + Math.sin(ang)*ry;
      const area = { c, ang, x:ax, y:ay, nodos:[], radio:0 };
      c.t.forEach((t,i)=>{
        const items = parseFloat(t[2]);
        const nodo = { t, area, i, disp:!!t[1],
                       rr:(comp?.78:1)*(1.7 + Math.sqrt(items)*.62),
                       th:i*2.39996 + ci, rad:paso*Math.sqrt(i+.7), x:ax, y:ay };
        area.radio = Math.max(area.radio, nodo.rad + nodo.rr);
        area.nodos.push(nodo); this.nodos.push(nodo);
      });
      this.areas.push(area);
    });
    this.disponibles = this.nodos.filter(n=>n.disp);
  },
  frame(dt,g,W,H,m){
    this.t += dt;
    const comp = this.comp;
    g.clearRect(0,0,W,H);

    for(const a of this.areas){
      const giro = this.t*.05*(a.c.k.length%2 ? 1 : -1);
      for(const n of a.nodos){
        n.x = a.x + Math.cos(n.th + giro)*n.rad;
        n.y = a.y + Math.sin(n.th + giro)*n.rad;
      }
    }

    /* ¿Qué se está mirando? El más cercano bajo el cursor; si no, el
       recorrido automático por los disponibles. */
    let sel = null;
    if(m.dentro){
      let mejor = 1e9;
      for(const n of this.nodos){
        const d = Math.hypot(n.x-m.x, n.y-m.y);
        if(d < Math.max(16, n.rr+9) && d < mejor){ mejor = d; sel = n; }
      }
    }
    if(!sel){
      this.auto += dt;
      if(this.auto > 2.2){ this.auto = 0; this.ia = (this.ia+7) % this.disponibles.length; }
      sel = m.dentro ? null : this.disponibles[this.ia];
    }
    if(sel !== this.sel){ this.sel = sel; this.luz = 0; }
    this.luz = hacia(this.luz, 1, 6, dt);

    /* Del centro a cada área: dendritas. */
    g.lineWidth = 1;
    for(const a of this.areas){
      const activa = sel && sel.area === a;
      g.strokeStyle = activa ? azu(.40) : ink(.07);
      g.beginPath();
      g.moveTo(this.cx, this.cy);
      g.quadraticCurveTo((this.cx+a.x)/2 + Math.sin(a.ang)*14, (this.cy+a.y)/2 - Math.cos(a.ang)*14, a.x, a.y);
      g.stroke();
      g.strokeStyle = activa ? azu(.22) : ink(.06);
      g.beginPath();
      for(const n of a.nodos){ g.moveTo(a.x,a.y); g.lineTo(n.x,n.y); }
      g.stroke();
    }

    /* Un pulso de búsqueda viaja por la dendrita del área seleccionada. */
    if(sel){
      const a = sel.area, u = (this.t*.9)%1;
      const qx = (this.cx+a.x)/2 + Math.sin(a.ang)*14, qy = (this.cy+a.y)/2 - Math.cos(a.ang)*14;
      const x = (1-u)*(1-u)*this.cx + 2*(1-u)*u*qx + u*u*a.x;
      const y = (1-u)*(1-u)*this.cy + 2*(1-u)*u*qy + u*u*a.y;
      g.fillStyle = azu(.9); g.beginPath(); g.arc(x,y,2,0,TAU); g.fill();
    }

    /* Nodos. */
    for(const n of this.nodos){
      const esSel = n === sel;
      if(n.disp){
        g.fillStyle = esSel ? azu(1) : azu(.62);
        g.beginPath(); g.arc(n.x,n.y,n.rr,0,TAU); g.fill();
      } else {
        g.strokeStyle = esSel ? ink(.9) : ink(.32);
        g.beginPath(); g.arc(n.x,n.y,n.rr,0,TAU); g.stroke();
      }
      if(esSel){
        g.strokeStyle = n.disp ? azu(.5*this.luz) : ink(.5*this.luz);
        g.beginPath(); g.arc(n.x,n.y,n.rr + 5 + 6*(1-this.luz),0,TAU); g.stroke();
      }
    }

    /* El centro. */
    g.fillStyle = ink(.9); g.beginPath(); g.arc(this.cx,this.cy,2.6,0,TAU); g.fill();
    g.strokeStyle = ink(.18); g.beginPath(); g.arc(this.cx,this.cy,9,0,TAU); g.stroke();

    /* Rótulos de área: sólo en encuadre ancho, afuera de cada flor. */
    if(!comp){
      mono(g, 9, 500);
      for(const a of this.areas){
        const dx = Math.cos(a.ang), dy = Math.sin(a.ang);
        const x = a.x + dx*(a.radio+12), y = a.y + dy*(a.radio+12);
        g.textAlign = Math.abs(dx) < .25 ? 'center' : (dx > 0 ? 'left' : 'right');
        g.textBaseline = Math.abs(dy) < .25 ? 'middle' : (dy > 0 ? 'top' : 'alphabetic');
        g.fillStyle = sel && sel.area === a ? azu(.95) : ink(.40);
        g.fillText(a.c.k, x, y);
      }
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    }

    /* Ficha del instrumento. */
    if(sel){
      const t = sel.t, a = sel.area;
      const lineas = [
        [t[0], 500, 13, t[1] ? azu(1) : ink(.92)],
        [a.c.n.toUpperCase(), 400, 8.5, ink(.42)],
        [t[2] + ' ÍTEMS · ' + t[3], 400, 9.5, ink(.72)],
        [t[1] ? '● DISPONIBLE' : '○ EN PREPARACIÓN', 500, 8.5, t[1] ? azu(.9) : ink(.45)],
      ];
      let ancho = 0;
      for(const l of lineas){ mono(g, l[2], l[1]); ancho = Math.max(ancho, g.measureText(l[0]).width); }
      const pw = ancho + 24, ph = 74;
      let px, py;
      if(comp){ px = 10; py = 10; }
      else {
        px = sel.x + 18; py = sel.y - ph - 12;
        if(px + pw > W - 10) px = sel.x - pw - 18;
        if(py < 10) py = sel.y + 18;
        if(py + ph > H - 34) py = H - 34 - ph;
      }
      g.globalAlpha = this.luz;
      g.fillStyle = 'rgba(255,255,255,.96)'; g.strokeStyle = t[1] ? azu(.45) : ink(.22);
      g.fillRect(px,py,pw,ph); g.strokeRect(px+.5,py+.5,pw-1,ph-1);
      let y = py + 20;
      for(const l of lineas){
        mono(g, l[2], l[1]); g.fillStyle = l[3];
        g.fillText(l[0], px+12, y);
        y += l[2] + 7;
      }
      g.globalAlpha = 1;
    }

    const disp = this.disponibles.length, total = this.nodos.length;
    pie(g, W, H, [[
      '● ' + disp + ' DISPONIBLES   ○ ' + (total-disp) + ' EN PREPARACIÓN   ·   ' + this.areas.length +
      ' ÁREAS   ·   ' + (comp ? 'TOCA UN NODO' : 'PASA EL CURSOR POR UN NODO'), ink(.36) ]]);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   03 · CIFRADO — aplícalo como quieras.

   Dos formas de aplicar, alternándose (o elegidas con el cursor: mitad
   izquierda tableta, mitad derecha enlace):
   · TABLETA: el paciente contesta, la pantalla queda neutra y el resultado
     sólo aparece cuando el profesional lo revela.
   · ENLACE: el paciente contesta en su móvil y el resultado viaja cifrado
     hasta el navegador del profesional, que es el único que lo abre.

   El texto cifrado que se ve es REAL: AES-GCM de 256 bits generado con Web
   Crypto en el navegador del visitante al montar el lienzo. Es una
   demostración de la técnica; el esquema exacto de OpenPsico puede ser otro.
   ═══════════════════════════════════════════════════════════════════════════ */
SIS.cifrado = {
  init(W,H){
    this.t = 0; this.ciclo = 0; this.modo = 1;
    this.claro = '{"test":"PHQ-9","r":[2,1,2,1,1,2,1,1,0],"total":11}';
    this.hex = '';
    const self = this;
    try{
      const c = crypto.subtle, iv = crypto.getRandomValues(new Uint8Array(12));
      c.generateKey({ name:'AES-GCM', length:256 }, false, ['encrypt'])
        .then(k => c.encrypt({ name:'AES-GCM', iv }, k, new TextEncoder().encode(self.claro)))
        .then(buf => { self.hex = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join(''); })
        .catch(()=>{});
    }catch(e){}
    const r = semilla(4141);
    this.falso = Array.from({length:160}, () => '0123456789abcdef'[Math.floor(r()*16)]).join('');
  },
  frame(dt,g,W,H,m){
    const DUR = 8;
    this.t += dt;
    if(this.t >= DUR){ this.t -= DUR; this.ciclo++; }
    if(m.dentro) this.modo = m.x < W/2 ? 0 : 1;
    else if(this.t < dt*1.5) this.modo = this.ciclo % 2;
    const t = this.t, comp = W < 620;
    const hex = this.hex || this.falso;

    g.clearRect(0,0,W,H);
    const fase = t < 2.6 ? 0 : t < 3.2 ? 1 : t < 5.4 ? 2 : t < 6.2 ? 3 : 4;
    const resp = [2,1,2,1,1,2,1,1,0];
    const nResp = Math.min(9, Math.floor(t/2.6*9 + .001));

    /* Un dispositivo con sus nueve respuestas. */
    const dispositivo = (x,y,w,h,rotulo,conResp,estado) => {
      g.strokeStyle = ink(.26); g.lineWidth = 1;
      redondo(g,x,y,w,h,Math.min(w,h)*.10); g.stroke();
      mono(g, comp?8:9, 500); g.fillStyle = ink(.42);
      g.textAlign = 'center'; g.fillText(rotulo, x+w/2, y-9); g.textAlign = 'left';
      if(estado === 'neutra'){
        mono(g, comp?8.5:10, 500); g.fillStyle = ink(.55); g.textAlign = 'center';
        g.fillText('PANTALLA NEUTRA', x+w/2, y+h/2 - 4);
        mono(g, comp?7.5:8.5, 400); g.fillStyle = ink(.30);
        g.fillText('entrega el dispositivo', x+w/2, y+h/2 + 12);
        g.textAlign = 'left';
        return;
      }
      if(conResp){
        const fil = (h - 24)/9, cw = Math.min(14, (w-40)/4);
        for(let i=0;i<9;i++){
          const yy = y + 12 + i*fil + fil/2;
          for(let v=0;v<4;v++){
            const xx = x + (w - cw*4 - 6)/2 + v*(cw+2);
            const on = i < nResp && resp[i] === v;
            g.fillStyle = on ? azu(.9) : ink(.08);
            g.fillRect(xx, yy - Math.min(fil*.32,5), cw, Math.min(fil*.64,10));
          }
        }
      }
    };

    /* El resultado, legible. */
    const resultado = (x,y,w,h,alfa) => {
      g.globalAlpha = alfa;
      mono(g, comp?8:9, 500); g.fillStyle = ink(.45);
      g.fillText('PHQ-9', x+14, y+22);
      sans(g, comp?30:42, 300); g.fillStyle = ink(.95);
      g.fillText('11', x+14, y + (comp?58:76));
      mono(g, comp?7.5:10, 500); g.fillStyle = azu(1);
      g.fillText('DEPRESIÓN MODERADA', x+14, y + (comp?76:100));
      const bx = x+14, bw = w-28, by = y + h - 26;
      g.fillStyle = ink(.10); g.fillRect(bx, by, bw, 4);
      g.fillStyle = azu(.9); g.fillRect(bx, by, bw*11/27, 4);
      g.globalAlpha = 1;
    };

    if(this.modo === 0){
      /* ── TABLETA ── */
      const w = comp ? W*.62 : W*.34, h = comp ? H*.60 : H*.62;
      const x = (W-w)/2, y = comp ? H*.14 : H*.16;
      if(fase <= 1) dispositivo(x,y,w,h,'TABLETA EN CONSULTA',true);
      else if(fase === 2) dispositivo(x,y,w,h,'TABLETA EN CONSULTA',false,'neutra');
      else {
        dispositivo(x,y,w,h,'TABLETA EN CONSULTA',false,'vacia');
        resultado(x,y+h*.08,w,h*.84, clamp((t-5.4)/.8,0,1));
        mono(g, comp?8:9, 500); g.fillStyle = azu(.8); g.textAlign = 'center';
        g.fillText('REVELADO POR EL PROFESIONAL', x+w/2, y+h+18); g.textAlign = 'left';
      }
      firma(g, W, H, 'MODO TABLETA');
      pie(g, W, H, [
        ['al terminar, la pantalla queda neutra hasta que el profesional revela el resultado', ink(.36)],
        [comp ? 'toca la mitad derecha para ver el enlace' : 'cursor a la derecha: modo enlace', ink(.24)] ]);
      return;
    }

    /* ── ENLACE ── */
    let A, B;
    if(comp){
      A = { x:W*.05, y:H*.13, w:W*.30, h:H*.44 };
      B = { x:W*.65, y:H*.13, w:W*.30, h:H*.44 };
    } else {
      A = { x:W*.06, y:H*.20, w:W*.18, h:H*.60 };
      B = { x:W*.66, y:H*.26, w:W*.28, h:H*.48 };
    }
    dispositivo(A.x,A.y,A.w,A.h,'MÓVIL DEL PACIENTE',true);
    dispositivo(B.x,B.y,B.w,B.h,'NAVEGADOR DEL PROFESIONAL',false,'vacia');

    /* Servidor: presente y sin uso. */
    const sx = W*.5, sy = comp ? H*.76 : H*.14;
    g.setLineDash([3,4]); g.strokeStyle = ink(.16);
    const sw = comp ? 86 : 110, sh = comp ? 24 : 30;
    g.strokeRect(sx-sw/2, sy-sh/2, sw, sh);
    g.beginPath(); g.moveTo(sx, sy + (comp?-sh/2:sh/2)); g.lineTo(sx, comp ? A.y+A.h+26 : H*.44); g.stroke();
    g.setLineDash([]);
    mono(g, comp?7.5:8.5, 500); g.fillStyle = ink(.34); g.textAlign = 'center';
    g.fillText('SERVIDOR · 0 B', sx, sy+3);
    g.strokeStyle = cor(.7); g.lineWidth = 1.4;
    const cxx = sx, cyy = comp ? (sy - sh/2 + A.y + A.h + 26)/2 : (sy + sh/2 + H*.44)/2;
    g.beginPath(); g.moveTo(cxx-5,cyy-5); g.lineTo(cxx+5,cyy+5); g.moveTo(cxx+5,cyy-5); g.lineTo(cxx-5,cyy+5); g.stroke();
    g.lineWidth = 1; g.textAlign = 'left';

    /* El canal. */
    const x1 = A.x + A.w, x2 = B.x, yc = comp ? A.y + A.h*.5 : H*.5;
    g.strokeStyle = ink(.10);
    g.beginPath(); g.moveTo(x1+6, yc); g.lineTo(x2-6, yc); g.stroke();

    /* El paquete: claro → cifrado → viaja → se descifra. */
    const col = comp ? 12 : 24, filas = 3;
    const fs = comp ? 7.5 : 9.5, lh = fs + 4;
    mono(g, fs, 400);
    const anchoCar = g.measureText('0').width;
    const bloque = (x0, y0, mezcla, alfaHex, alfaClaro) => {
      for(let f=0; f<filas; f++){
        for(let c=0; c<col; c++){
          const k = f*col + c;
          const esClaro = (k/(col*filas)) >= mezcla;
          const ch = esClaro ? (this.claro[k] || ' ') : (hex[k % hex.length]);
          g.fillStyle = esClaro ? ink(alfaClaro) : azu(alfaHex);
          g.fillText(ch, x0 + c*anchoCar, y0 + f*lh);
        }
      }
    };
    const anchoBloque = col*anchoCar;
    if(fase === 1){
      const u = (t-2.6)/.6;
      bloque(x1 + 10, yc - lh*1.2, u, .95, .8);
    } else if(fase === 2){
      const u = (t-3.2)/2.2, e = u*u*(3-2*u);
      const x0 = x1 + 10 + (x2 - x1 - 20 - anchoBloque)*e;
      bloque(x0, yc - lh*1.2, 1, .95, .8);
    } else if(fase === 3){
      const u = (t-5.4)/.8;
      bloque(x2 - 10 - anchoBloque, yc - lh*1.2, 1-u, .95, .8);
    } else if(fase === 0 && t > 2.2){
      bloque(x1 + 10, yc - lh*1.2, 0, .95, .5*(t-2.2)/.4);
    }
    if(fase >= 3) resultado(B.x, B.y + B.h*.05, B.w, B.h*.9, clamp((t-5.6)/.6,0,1));

    mono(g, comp?7.5:8.5, 500);
    g.fillStyle = fase===2 ? azu(.9) : ink(.30);
    g.textAlign = 'center';
    g.fillText(fase<=1 ? 'CIFRANDO EN EL MÓVIL' : fase===2 ? 'VIAJA CIFRADO' : 'SE DESCIFRA EN TU NAVEGADOR',
               (x1+x2)/2, comp ? A.y + A.h + 16 : yc + lh*2.8);
    g.textAlign = 'left';

    firma(g, W, H, 'MODO ENLACE');
    pie(g, W, H, [
      [(this.hex ? 'cifrado real: AES-GCM 256 generado ahora con Web Crypto en tu navegador' : 'cifrado ilustrativo: este navegador no expone Web Crypto') +
       ' · demostración de la técnica', ink(.36)],
      [comp ? 'toca la mitad izquierda para el modo tableta' : 'cursor a la izquierda: modo tableta', ink(.24)] ]);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   04 · CORRECCIÓN — el PHQ-9 corrigiéndose al instante.

   Nueve ítems de 0 a 3, total de 0 a 27 y las bandas que publica la ficha
   del PHQ-9 de OpenPsico: 0–4 mínima, 5–9 leve, 10–14 moderada, 15–19
   moderada-grave, 20–27 grave; corte ≥ 10. Las respuestas son de ejemplo y
   el ítem 9 va en cero en los tres perfiles; si el visitante lo sube, aparece
   el aviso de la propia ficha: exige evaluación de riesgo.
   ═══════════════════════════════════════════════════════════════════════════ */
const BANDAS = [
  { d:0,  h:4,  n:'MÍNIMA',         c:a=>ink(a*.55) },
  { d:5,  h:9,  n:'LEVE',           c:a=>azu(a*.45) },
  { d:10, h:14, n:'MODERADA',       c:a=>azu(a) },
  { d:15, h:19, n:'MODERADA-GRAVE', c:a=>cor(a*.72) },
  { d:20, h:27, n:'GRAVE',          c:a=>cor(a) },
];
const banda = s => BANDAS.find(b => s >= b.d && s <= b.h) || BANDAS[0];

SIS.correccion = {
  init(W,H){
    this.perfiles = [[0,1,1,0,1,0,1,0,0],[2,1,2,1,1,2,1,1,0],[3,2,3,2,2,3,2,2,0]];
    this.ip = 1; this.k = 0; this.acc = 0; this.espera = 0; this.manual = 0;
    this.r = [0,0,0,0,0,0,0,0,0];
    this.vis = [0,0,0,0,0,0,0,0,0];
    this.tv = 0;
  },
  frame(dt,g,W,H,m){
    const comp = W < 620;
    const gx = comp ? 12 : W*.05;
    const gy = comp ? 34 : H*.15;
    const etq = comp ? 44 : 64;
    const gw = comp ? W - 24 : W*.47;
    const fil = comp ? (H*.55)/9 : (H*.72)/9;
    const x0 = gx + etq, celda = (gw - etq - (comp?20:30))/4;

    /* Contestar con el cursor: fila por altura, respuesta por columna. */
    if(m.dentro && m.x >= x0 && m.x <= x0 + celda*4 && m.y >= gy && m.y < gy + fil*9){
      const i = clamp(Math.floor((m.y-gy)/fil),0,8), v = clamp(Math.floor((m.x-x0)/celda),0,3);
      this.r[i] = v; this.manual = 4;
    } else if(this.manual > 0){
      this.manual -= dt;
    } else {
      this.acc += dt;
      if(this.acc > .42){
        this.acc = 0;
        const P = this.perfiles[this.ip];
        if(this.k < 9){ this.r[this.k] = P[this.k]; this.k++; }
        else if(++this.espera > 8){
          this.espera = 0; this.k = 0; this.ip = (this.ip+1) % this.perfiles.length;
          this.r = [0,0,0,0,0,0,0,0,0];
        }
      }
    }

    const total = this.r.reduce((a,b)=>a+b,0);
    this.tv = hacia(this.tv, total, 7, dt);
    for(let i=0;i<9;i++) this.vis[i] = hacia(this.vis[i], this.r[i], 12, dt);

    g.clearRect(0,0,W,H);

    /* Encabezado de columnas. */
    const cab = comp ? ['0','1','2','3'] : ['NUNCA','VARIOS DÍAS','+ DE LA MITAD','CASI TODOS'];
    mono(g, comp?7.5:8, 500); g.fillStyle = ink(.34); g.textAlign = 'center';
    cab.forEach((c,v)=>g.fillText(c, x0 + celda*v + celda/2, gy - 8));
    g.textAlign = 'left';

    for(let i=0;i<9;i++){
      const y = gy + i*fil;
      mono(g, comp?8:9, 500);
      g.fillStyle = i === 8 && this.r[8] > 0 ? cor(.95) : ink(.42);
      g.textBaseline = 'middle';
      g.fillText((comp?'Í':'ÍTEM ') + (i+1), gx, y + fil/2);
      for(let v=0;v<4;v++){
        const cx = x0 + v*celda;
        g.strokeStyle = ink(.08);
        g.strokeRect(cx+1.5, y+2.5, celda-3, fil-5);
      }
      /* La marca se desliza a la respuesta: se ve el cambio, no el salto. */
      const px = x0 + this.vis[i]*celda;
      const esRiesgo = i === 8 && this.r[8] > 0;
      g.fillStyle = esRiesgo ? cor(.55) : azu(.22 + this.r[i]*.16);
      g.fillRect(px+2.5, y+3.5, celda-5, fil-7);
      mono(g, comp?9:10, 500);
      g.fillStyle = this.r[i] ? ink(.9) : ink(.3);
      g.textAlign = 'right';
      g.fillText(String(this.r[i]), gx + gw, y + fil/2);
      g.textAlign = 'left';
    }
    g.textBaseline = 'alphabetic';

    /* Panel del total. */
    const b = banda(total);
    let px, py, pw;
    if(comp){ px = 12; py = gy + fil*9 + 16; pw = W - 24; }
    else { px = W*.59; py = H*.18; pw = W*.36; }

    mono(g, comp?8:9, 500); g.fillStyle = ink(.40);
    g.fillText('PUNTAJE TOTAL', px, py + (comp?10:12));
    sans(g, comp?34:74, 300); g.fillStyle = ink(.96);
    const num = String(Math.round(this.tv));
    g.fillText(num, px, py + (comp?44:88));
    const anchoNum = g.measureText(num).width;
    mono(g, comp?10:13, 400); g.fillStyle = ink(.32);
    g.fillText('/ 27', px + anchoNum + 8, py + (comp?44:88));
    mono(g, comp?9:12, 500); g.fillStyle = b.c(1);
    const nombre = 'DEPRESIÓN ' + b.n;
    if(comp){ g.textAlign = 'right'; g.fillText(nombre, px + pw, py + 44); g.textAlign = 'left'; }
    else g.fillText(nombre, px, py + 116);

    /* La escala 0–27 con sus cinco bandas. */
    const ey = comp ? py + 62 : py + H*.40, eh = comp ? 8 : 10;
    const X = s => px + pw*(s/28);
    for(const bb of BANDAS){
      g.fillStyle = bb.c(bb === b ? 1 : .38);
      g.fillRect(X(bb.d)+1, ey, X(bb.h+1)-X(bb.d)-2, eh);
    }
    if(!comp){
      mono(g, 7.5, 500);
      for(const bb of BANDAS){
        g.fillStyle = bb === b ? ink(.85) : ink(.30);
        g.fillText(bb.d + '–' + bb.h, X(bb.d)+1, ey + eh + 14);
      }
    }
    /* Corte ≥ 10. */
    g.strokeStyle = ink(.7); g.setLineDash([2,3]);
    g.beginPath(); g.moveTo(X(10), ey - 12); g.lineTo(X(10), ey + eh + 4); g.stroke();
    g.setLineDash([]);
    mono(g, comp?7.5:8.5, 500); g.fillStyle = ink(.7);
    g.fillText('CORTE ≥ 10', X(10) + 4, ey - 5);
    /* El marcador. */
    const mx = X(this.tv + .5);
    g.fillStyle = ink(.95);
    g.beginPath(); g.moveTo(mx, ey + eh + 2); g.lineTo(mx-5, ey + eh + 10); g.lineTo(mx+5, ey + eh + 10); g.closePath(); g.fill();

    if(this.r[8] > 0){
      mono(g, comp?8:9.5, 500); g.fillStyle = cor(.95);
      const yy = comp ? ey + 30 : ey + 52;
      g.fillText('ÍTEM 9 > 0 · REQUIERE EVALUACIÓN DE RIESGO', px, yy);
    }

    firma(g, W, H, 'PHQ-9');
    pie(g, W, H, [
      [comp ? 'respuestas de ejemplo · toca una casilla para contestar' :
              'respuestas de ejemplo · pasa el cursor por la grilla para contestar tú', ink(.36)] ]);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   05 · FRONTERA — tu consulta, tus datos.

   Los datos de la consulta rebotan contra el borde del dispositivo y no hay
   por dónde salir. El servidor está dibujado y sigue en cero. El cursor atrae
   los datos: acércalo afuera y se amontonan contra la pared, que se enciende
   donde la golpean.
   ═══════════════════════════════════════════════════════════════════════════ */
SIS.frontera = {
  init(W,H){
    const r = semilla(1337);
    const comp = W < 620;
    this.comp = comp;
    this.box = comp ? { x:W*.07, y:H*.08, w:W*.86, h:H*.50 } : { x:W*.05, y:H*.14, w:W*.58, h:H*.70 };
    this.srv = comp ? { x:W*.30, y:H*.66, w:W*.40, h:H*.12 } : { x:W*.75, y:H*.38, w:W*.19, h:H*.24 };
    const b = this.box, N = comp ? 48 : 90;
    this.q = [];
    for(let i=0;i<N;i++){
      this.q.push({ x:b.x + 14 + r()*(b.w-28), y:b.y + 14 + r()*(b.h-28),
                    vx:(r()-.5)*70, vy:(r()-.5)*70, res: r() < .16 });
    }
    this.chis = [];
    this.t = 0;
  },
  frame(dt,g,W,H,m){
    this.t += dt;
    const b = this.box, comp = this.comp;
    const pad = 4, VMAX = 220;

    for(const p of this.q){
      if(m.dentro){
        const dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx,dy) + 30;
        const f = 5200/d;
        p.vx += dx/d*f*dt; p.vy += dy/d*f*dt;
      } else {
        p.vx += (Math.random()-.5)*40*dt; p.vy += (Math.random()-.5)*40*dt;
      }
      const v = Math.hypot(p.vx,p.vy);
      if(v > VMAX){ p.vx *= VMAX/v; p.vy *= VMAX/v; }
      if(!m.dentro && v < 22){ p.vx *= 1.02; p.vy *= 1.02; }
      p.vx *= Math.pow(.6, dt); p.vy *= Math.pow(.6, dt);
      p.x += p.vx*dt; p.y += p.vy*dt;
      const golpe = (x,y) => { if(this.chis.length < 140) this.chis.push({ x, y, v:1 }); };
      if(p.x < b.x+pad){ p.x = b.x+pad; p.vx = Math.abs(p.vx)*.8; golpe(b.x, p.y); }
      if(p.x > b.x+b.w-pad){ p.x = b.x+b.w-pad; p.vx = -Math.abs(p.vx)*.8; golpe(b.x+b.w, p.y); }
      if(p.y < b.y+pad){ p.y = b.y+pad; p.vy = Math.abs(p.vy)*.8; golpe(p.x, b.y); }
      if(p.y > b.y+b.h-pad){ p.y = b.y+b.h-pad; p.vy = -Math.abs(p.vy)*.8; golpe(p.x, b.y+b.h); }
    }
    for(let i=this.chis.length-1;i>=0;i--){
      this.chis[i].v -= dt*2.2;
      if(this.chis[i].v <= 0){ this.chis[i] = this.chis[this.chis.length-1]; this.chis.pop(); }
    }

    g.clearRect(0,0,W,H);

    /* El dispositivo. */
    g.strokeStyle = ink(.28); g.lineWidth = 1.2;
    redondo(g, b.x, b.y, b.w, b.h, 14); g.stroke();
    g.lineWidth = 1;
    mono(g, comp?8:9, 500); g.fillStyle = ink(.40);
    g.fillText('TU DISPOSITIVO · LA CONSULTA', b.x + 14, b.y + 20);

    /* Donde la golpean, la pared se enciende. */
    for(const c of this.chis){
      g.fillStyle = azu((.55*c.v).toFixed(3));
      g.beginPath(); g.arc(c.x, c.y, 2 + (1-c.v)*9, 0, TAU); g.fill();
    }

    /* Los datos. */
    for(const p of this.q){
      if(p.res){ g.fillStyle = azu(.95); g.fillRect(p.x-2.5, p.y-2.5, 5, 5); }
      else { g.fillStyle = ink(.62); g.fillRect(p.x-1.3, p.y-1.3, 2.6, 2.6); }
    }

    /* El servidor, presente y vacío. */
    const s = this.srv;
    g.setLineDash([3,4]); g.strokeStyle = ink(.16);
    g.strokeRect(s.x, s.y, s.w, s.h);
    const ax = comp ? W*.5 : b.x + b.w, ay = comp ? b.y + b.h : b.y + b.h/2;
    const bx2 = comp ? W*.5 : s.x, by2 = comp ? s.y : s.y + s.h/2;
    g.beginPath(); g.moveTo(ax + (comp?0:8), ay + (comp?8:0)); g.lineTo(bx2 - (comp?0:6), by2 - (comp?6:0)); g.stroke();
    g.setLineDash([]);
    const mxm = (ax+bx2)/2, mym = (ay+by2)/2;
    g.strokeStyle = cor(.75); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(mxm-6,mym-6); g.lineTo(mxm+6,mym+6); g.moveTo(mxm+6,mym-6); g.lineTo(mxm-6,mym+6); g.stroke();
    g.lineWidth = 1;
    g.textAlign = 'center';
    mono(g, comp?8:9, 500); g.fillStyle = ink(.32);
    g.fillText('SERVIDOR', s.x + s.w/2, s.y + (comp?14:22));
    sans(g, comp?16:30, 300); g.fillStyle = ink(.62);
    g.fillText('0 B', s.x + s.w/2, s.y + (comp? s.h - 6 : s.h*.72));
    g.textAlign = 'left';

    const nRes = this.q.filter(p=>p.res).length;
    pie(g, W, H, [
      ['▪ ' + (this.q.length - nRes) + ' DATOS DE LA CONSULTA   ■ ' + nRes + ' RESULTADOS   ·   0 B HACIA UN SERVIDOR', ink(.36)],
      [comp ? 'arrastra el dedo afuera: los datos chocan contra el borde' :
              'lleva el cursor afuera del dispositivo: los datos se amontonan contra el borde', ink(.24)] ]);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   06 · BAREMO — qué significa un punto de corte.

   Dos poblaciones sobre la escala del PHQ-9: sin y con depresión mayor.
   Mover el corte cambia a quién se detecta (sensibilidad) y a quién se deja
   tranquilo (especificidad): no hay corte que gane las dos a la vez. A la
   derecha, la curva ROC completa y el punto del corte elegido.

   Las distribuciones son ILUSTRATIVAS: normales discretizadas sobre 0–27,
   con la media de cada una ajustada por bisección para que en ≥ 10 den
   exactamente sensibilidad 88 % y especificidad 88 %, las cifras de Kroenke
   (2001) que cita la ficha. Todo lo demás se calcula en vivo sobre esas masas.
   ═══════════════════════════════════════════════════════════════════════════ */
function erf(x){
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1/(1 + .3275911*x);
  const y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - .284496736)*t + .254829592)*t*Math.exp(-x*x);
  return s*y;
}
const Fn = (x,mu,sd) => .5*(1 + erf((x-mu)/(sd*Math.SQRT2)));
function masas(mu, sd){
  const out = [];
  for(let k=0;k<=27;k++){
    const lo = k === 0 ? 0 : Fn(k-.5,mu,sd);
    const hi = k === 27 ? 1 : Fn(k+.5,mu,sd);
    out.push(hi - lo);
  }
  return out;
}
const sobre = (arr,c) => arr.slice(c).reduce((a,b)=>a+b,0);
function ajustar(sd, meta, lo, hi){
  for(let i=0;i<60;i++){
    const mid = (lo+hi)/2;
    if(sobre(masas(mid,sd),10) < meta) lo = mid; else hi = mid;
  }
  return (lo+hi)/2;
}

SIS.baremo = {
  init(W,H){
    this.sin = masas(ajustar(4.0, .12, -6, 15), 4.0);     // P(≥10 | sin) = 12 %  → esp. 88 %
    this.con = masas(ajustar(5.0, .88, 5, 26), 5.0);      // P(≥10 | con) = 88 %  → sens. 88 %
    this.corte = 10; this.cv = 10;
    this.roc = [];
    for(let c=0;c<=28;c++) this.roc.push([sobre(this.sin,c), sobre(this.con,c)]);   // [1−esp, sens]
    let auc = 0;
    for(let i=1;i<this.roc.length;i++){
      const a = this.roc[i-1], b = this.roc[i];
      auc += (a[0]-b[0])*(a[1]+b[1])/2;
    }
    this.auc = auc;
  },
  frame(dt,g,W,H,m){
    const comp = W < 620;
    const L = comp ? 14 : W*.06, R = comp ? W - 14 : W*.62;
    const T = comp ? H*.20 : H*.20, B = comp ? H*.62 : H*.78;
    const X = s => L + (R-L)*(s/28);

    if(m.dentro && m.x >= L && m.x <= R) this.corte = clamp(Math.round((m.x-L)/(R-L)*28), 1, 27);
    else if(!m.dentro) this.corte = 10;
    this.cv = hacia(this.cv, this.corte, 10, dt);
    const c = this.corte;
    const sens = sobre(this.con, c), esp = 1 - sobre(this.sin, c);

    g.clearRect(0,0,W,H);

    const maxM = Math.max(...this.sin, ...this.con);
    const Y = v => B - (B-T)*(v/maxM);
    const bw = (R-L)/28;

    /* Sin depresión mayor: tinta; lo que queda sobre el corte, falso positivo. */
    for(let k=0;k<=27;k++){
      const fp = k >= c;
      g.fillStyle = fp ? cor(.42) : ink(.16);
      g.fillRect(X(k)+1, Y(this.sin[k]), bw-2, B - Y(this.sin[k]));
    }
    /* Con depresión mayor: azul; bajo el corte, falso negativo (hueco). */
    for(let k=0;k<=27;k++){
      const y = Y(this.con[k]), h = B - y;
      if(k >= c){ g.fillStyle = azu(.55); g.fillRect(X(k)+1, y, bw-2, h); }
      else { g.strokeStyle = azu(.55); g.strokeRect(X(k)+1.5, y+.5, bw-3, h-1); }
    }

    /* Eje. */
    g.strokeStyle = ink(.22);
    g.beginPath(); g.moveTo(L, B+.5); g.lineTo(R, B+.5); g.stroke();
    mono(g, comp?7.5:8.5, 400); g.fillStyle = ink(.34); g.textAlign = 'center';
    for(const s of [0,5,10,15,20,27]) g.fillText(String(s), X(s)+bw/2, B + 14);
    g.textAlign = 'left';

    /* El corte. */
    const xc = X(this.cv);
    g.strokeStyle = ink(.9); g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(xc, T - 16); g.lineTo(xc, B + 4); g.stroke();
    g.lineWidth = 1;
    mono(g, comp?8.5:10, 500); g.fillStyle = ink(.95);
    g.fillText('CORTE ≥ ' + c, xc + 6, T - 6);

    /* Lecturas. */
    const lx = comp ? 14 : W*.06, ly = comp ? 22 : H*.10;
    mono(g, comp?8:9, 500);
    g.fillStyle = azu(.9); g.fillText('SENSIBILIDAD ' + pct(sens), lx, ly);
    g.fillStyle = ink(.75); g.fillText('ESPECIFICIDAD ' + pct(esp), lx + (comp ? W*.48 : 170), ly);
    if(c === 10){
      g.fillStyle = ink(.40);
      g.fillText(comp ? '= KROENKE 2001' : '← LAS CIFRAS DE KROENKE 2001 EN ≥ 10', lx + (comp ? W*.48 : 360), ly + (comp ? 14 : 0));
    }

    /* ROC. */
    const rs = comp ? Math.min(W*.30, H*.26) : Math.min(W*.26, H*.56);
    const rx = comp ? W - 14 - rs : W*.70, ry = comp ? H - 40 - rs : H*.22;
    g.strokeStyle = ink(.18); g.strokeRect(rx+.5, ry+.5, rs, rs);
    g.setLineDash([2,4]);
    g.beginPath(); g.moveTo(rx, ry+rs); g.lineTo(rx+rs, ry); g.stroke();
    g.setLineDash([]);
    g.strokeStyle = azu(.85); g.lineWidth = 1.5;
    g.beginPath();
    this.roc.forEach((p,i)=>{ const x = rx + p[0]*rs, y = ry + rs - p[1]*rs; i ? g.lineTo(x,y) : g.moveTo(x,y); });
    g.stroke(); g.lineWidth = 1;
    const pp = this.roc[c];
    g.fillStyle = ink(.98);
    g.beginPath(); g.arc(rx + pp[0]*rs, ry + rs - pp[1]*rs, 4, 0, TAU); g.fill();
    mono(g, comp?7.5:8.5, 500);
    g.fillStyle = ink(.40);
    g.fillText('CURVA ROC', rx, ry - 8);
    g.textAlign = 'right';
    g.fillText('AUC ' + this.auc.toFixed(2).replace('.',','), rx + rs, ry - 8);
    if(!comp){
      g.fillText('1 − ESPECIFICIDAD', rx + rs, ry + rs + 16);
      g.textAlign = 'left';
      g.save(); g.translate(rx - 8, ry + rs); g.rotate(-Math.PI/2);
      g.fillText('SENSIBILIDAD', 0, 0); g.restore();
    }
    g.textAlign = 'left';

    pie(g, W, H, comp ? [
      ['▮ sin depresión mayor  ▯ con depresión mayor · ilustrativo', ink(.36)],
    ] : [
      ['▮ sin depresión mayor (tinta · coral = falso positivo)   ▮ con depresión mayor (azul · hueco = falso negativo)', ink(.36)],
      ['distribuciones ilustrativas, ajustadas para reproducir sens. 88 % y esp. 88 % en ≥ 10 · mueve el cursor para correr el corte', ink(.24)] ]);
  }
};

window.__SIS = SIS;
window.__CATALOGO = CATALOGO;
})();
