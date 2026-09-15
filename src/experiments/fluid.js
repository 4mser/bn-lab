/* Incompressible fluid — the Navier-Stokes equations on the GPU.

   Stable Fluids (Stam 1999) in the form popularised for WebGL: every field
   lives in a floating-point texture and every step of the solver is a
   full-screen fragment shader.

     ∂u/∂t = −(u·∇)u − ∇p + f        momentum (inviscid; decay stands in for ν)
     ∇·u   = 0                         incompressibility

   One frame, in order:
     1. curl       ω = ∂v/∂x − ∂u/∂y
     2. vorticity  confinement re-injects the small swirls that numerical
                   diffusion erases (Fedkiw, Stam & Jensen 2001)
     3. divergence of the velocity field
     4. pressure   Jacobi iterations of the Poisson equation ∇²p = ∇·u
     5. project    u ← u − ∇p, which removes the divergent part
     6. advect     semi-Lagrangian back-tracing of velocity and dye

   The solver structure, shader set and the half-float capability checks are
   adapted from Pavel Dobryakov's WebGL-Fluid-Simulation:

     Copyright (c) 2017 Pavel Dobryakov — MIT License
     https://github.com/PavelDoGreat/WebGL-Fluid-Simulation

   Changes here: it runs as a BN Lab experiment (sized, paused and themed by
   the engine), WebGL2 half-float textures are treated as filterable by spec
   so iOS devices keep the simulation, and the display shader reads the same
   dye either as additive light on a dark theme or as a subtractive tint on a
   light theme, blending between the two when the theme changes. */

import { L } from '../core/shared.js';

const unsupported = message => Object.assign(new Error('bn-lab/fluid: ' + message), { code: 'WEBGL_UNSUPPORTED' });

export default {
  id: 'fluid',
  kind: 'webgl',
  pixelRatio: 1.25,
  name: L('Incompressible fluid', 'Fluido incompresible'),
  note: L('Navier-Stokes on the GPU: advection, pressure projection and vorticity confinement, all in shaders.',
          'Navier-Stokes en la GPU: advección, proyección de presión y confinamiento de vorticidad, todo en shaders.'),
  params: [
    { key: 'curl',       label: L('Vorticity confinement', 'Confinamiento de vorticidad'), min: 0,    max: 60,  step: 1,    def: 24 },
    { key: 'iterations', label: L('Pressure iterations', 'Iteraciones de presión'),        min: 2,    max: 40,  step: 1,    def: 16 },
    { key: 'velocity',   label: L('Velocity decay', 'Decaimiento de velocidad'),           min: 0,    max: 2,   step: 0.02, def: 0.26 },
    { key: 'dye',        label: L('Dye decay', 'Decaimiento de tinta'),                    min: 0,    max: 2,   step: 0.02, def: 0.22 },
    { key: 'radius',     label: L('Splat radius', 'Radio de inyección'),                   min: 0.05, max: 1,   step: 0.01, def: 0.17 },
    { key: 'ambient',    label: L('Ambient splats', 'Inyección ambiental'),                min: 0,    max: 1,   step: 1,    def: 1 }
  ],

  make(w, h, env) {
    const cv = env.canvas;
    const small = Math.min(w, h) < 520;
    const SIM_RES = small ? 96 : 128;
    const DYE_RES = small ? 448 : 640;
    const PRESSURE = 0.8;
    const SPLAT_FORCE = 3200;

    const attrs = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = cv.getContext('webgl2', attrs);
    const isGL2 = !!gl;
    if (!gl) gl = cv.getContext('webgl', attrs) || cv.getContext('experimental-webgl', attrs);
    if (!gl) throw unsupported('WebGL is not available');

    let halfFloat, linear;
    if (isGL2) {
      // In WebGL2 half-float textures are filterable by specification; asking
      // for OES_texture_float_linear (a float32 extension iOS lacks) would
      // needlessly disable the simulation there. Renderability is tested below.
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
      halfFloat = gl.HALF_FLOAT;
      linear = true;
    } else {
      const ext = gl.getExtension('OES_texture_half_float');
      linear = !!gl.getExtension('OES_texture_half_float_linear');
      halfFloat = ext ? ext.HALF_FLOAT_OES : null;
    }
    if (!halfFloat || !linear) throw unsupported('half-float textures are not supported');

    const fmt = (internalFormat, format) => ({ internalFormat, format });
    let texRGBA, texRG, texR;
    if (isGL2) { texRGBA = fmt(gl.RGBA16F, gl.RGBA); texRG = fmt(gl.RG16F, gl.RG); texR = fmt(gl.R16F, gl.RED); }
    else { texRGBA = texRG = texR = fmt(gl.RGBA, gl.RGBA); }

    function renderable(f) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, f.internalFormat, 4, 4, 0, f.format, halfFloat, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.deleteFramebuffer(fb); gl.deleteTexture(tex);
      return ok;
    }
    if (!renderable(texRGBA)) throw unsupported('cannot render to half-float textures');
    if (!renderable(texRG)) texRG = texRGBA;
    if (!renderable(texR)) texR = texRG;

    /* ── Shaders ── */
    const shaders = [];
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        throw new Error('bn-lab/fluid: shader failed to compile\n' + gl.getShaderInfoLog(s));
      }
      shaders.push(s);
      return s;
    }
    const VERT = compile(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * .5 + .5;
        vL = vUv - vec2(texelSize.x, 0.); vR = vUv + vec2(texelSize.x, 0.);
        vT = vUv + vec2(0., texelSize.y); vB = vUv - vec2(0., texelSize.y);
        gl_Position = vec4(aPosition, 0., 1.);
      }`);
    const programs = [];
    function program(fragment) {
      const p = gl.createProgram();
      gl.attachShader(p, VERT);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
      gl.bindAttribLocation(p, 0, 'aPosition');
      gl.linkProgram(p);
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
      programs.push(p);
      return { u, bind: () => gl.useProgram(p) };
    }

    const splatP = program(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio, radius;
      uniform vec3 color;
      uniform vec2 point;
      void main () {
        vec2 p = vUv - point; p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.);
      }`);
    // Semi-Lagrangian advection: follow the velocity backwards one step and
    // sample what was there. Unconditionally stable, slightly diffusive.
    const advectP = program(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity, uSource;
      uniform vec2 texelSize;
      uniform float dt, dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = texture2D(uSource, coord) / (1. + dissipation * dt);
      }`);
    // Central differences; at the walls the normal component is reflected
    // (no-through-flow boundary).
    const divergenceP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x;
        if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
        gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.);
      }`);
    const curlP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(R - L - T + B, 0., 0., 1.);
      }`);
    // Vorticity confinement: push along N × ω, where N points up the gradient
    // of |ω|. It spins existing vortices back up instead of adding new ones.
    const vorticityP = program(`
      precision highp float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity, uCurl;
      uniform float curl, dt;
      void main () {
        float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + .0001;
        force *= curl * C; force.y *= -1.;
        vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
        gl_FragColor = vec4(clamp(vel, -1000., 1000.), 0., 1.);
      }`);
    // One Jacobi sweep of ∇²p = ∇·u on a unit grid.
    const pressureP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure, uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        float div = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - div) * .25, 0., 0., 1.);
      }`);
    const gradientP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure, uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
        gl_FragColor = vec4(vel, 0., 1.);
      }`);
    // Warm start: the previous pressure, scaled down, is a better first guess
    // for Jacobi than zero.
    const clearP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`);
    // The dye is shaded with a normal taken from its own density gradient, then
    // read as light (dark theme) or as a pigment tint (light theme).
    const displayP = program(`
      precision highp float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uTexture;
      uniform vec3 uPaper, uInk;
      uniform float uLight;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float dx = length(texture2D(uTexture, vR).rgb) - length(texture2D(uTexture, vL).rgb);
        float dy = length(texture2D(uTexture, vT).rgb) - length(texture2D(uTexture, vB).rgb);
        vec3 n = normalize(vec3(dx, dy, .14));
        c *= clamp(dot(n, normalize(vec3(-.3, .4, 1.))) + .72, .72, 1.08);
        vec3 dark = uPaper + c;
        float dens = clamp(length(c) * 3.1, 0., 1.);
        vec3 tint = mix(uPaper, mix(uPaper, uInk, .38), smoothstep(.05, .52, dens));
        tint = mix(tint, uInk, .8 * smoothstep(.58, 1., dens));
        float u = smoothstep(.18, .82, uLight);
        vec3 col = mix(dark, tint, u);
        float d = length(vUv - vec2(.5, .42));
        col *= 1. - (.32 * (1. - uLight) + .05 * uLight) * smoothstep(.45, .95, d);
        gl_FragColor = vec4(col, 1.);
      }`);

    /* ── Geometry: one full-screen quad ── */
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target) {
      if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb); }
      else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /* ── Framebuffers ── */
    let targets = [];
    function fbo(tw, th, f, filter) {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, f.internalFormat, tw, th, 0, f.format, halfFloat, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, tw, th); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      const target = { tex, fb, w: tw, h: th, texel: [1 / tw, 1 / th],
        attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; } };
      targets.push(target);
      return target;
    }
    function doubleFbo(tw, th, f, filter) {
      let a = fbo(tw, th, f, filter), b = fbo(tw, th, f, filter);
      return { get read() { return a; }, get write() { return b; }, swap() { const t = a; a = b; b = t; },
               texel: [1 / tw, 1 / th] };
    }
    function resolution(base) {
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      return aspect < 1 ? { w: base, h: Math.round(base / aspect) } : { w: Math.round(base * aspect), h: base };
    }
    let dye, velocity, divergence, curl, pressure;
    function allocate() {
      for (const t of targets) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }
      targets = [];
      const sr = resolution(SIM_RES), dr = resolution(DYE_RES);
      dye = doubleFbo(dr.w, dr.h, texRGBA, gl.LINEAR);
      velocity = doubleFbo(sr.w, sr.h, texRG, gl.LINEAR);
      divergence = fbo(sr.w, sr.h, texR, gl.NEAREST);
      curl = fbo(sr.w, sr.h, texR, gl.NEAREST);
      pressure = doubleFbo(sr.w, sr.h, texR, gl.NEAREST);
    }
    allocate();

    /* ── Dye: shades of the theme accent ── */
    const LEVELS = [0.22, 0.36, 0.5, 0.66, 0.82];
    const rgb = s => s.split(',').map(n => +n / 255);
    function tint(k) {
      const a = rgb(env.theme.accent);
      const level = LEVELS[(Math.random() * LEVELS.length) | 0] * k;
      return [a[0] * level, a[1] * level, a[2] * level];
    }

    function splat(x, y, dx, dy, color, radius) {
      splatP.bind();
      gl.uniform1i(splatP.u.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatP.u.aspectRatio, cv.width / cv.height);
      gl.uniform2f(splatP.u.point, x, y);
      gl.uniform3f(splatP.u.color, dx, dy, 0);
      gl.uniform1f(splatP.u.radius, radius / 100);
      blit(velocity.write); velocity.swap();
      gl.uniform1i(splatP.u.uTarget, dye.read.attach(0));
      gl.uniform3f(splatP.u.color, color[0], color[1], color[2]);
      blit(dye.write); dye.swap();
    }

    function burst(n, strength) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, f = 600 + Math.random() * 900;
        splat(0.12 + Math.random() * 0.76, 0.15 + Math.random() * 0.7,
          Math.cos(a) * f, Math.sin(a) * f, tint(strength), 0.5 + Math.random() * 0.5);
      }
    }

    function solve(dt, P) {
      gl.disable(gl.BLEND);
      const texel = velocity.texel;

      curlP.bind();
      gl.uniform2f(curlP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(curlP.u.uVelocity, velocity.read.attach(0));
      blit(curl);

      vorticityP.bind();
      gl.uniform2f(vorticityP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(vorticityP.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityP.u.uCurl, curl.attach(1));
      gl.uniform1f(vorticityP.u.curl, P.curl);
      gl.uniform1f(vorticityP.u.dt, dt);
      blit(velocity.write); velocity.swap();

      divergenceP.bind();
      gl.uniform2f(divergenceP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(divergenceP.u.uVelocity, velocity.read.attach(0));
      blit(divergence);

      clearP.bind();
      gl.uniform1i(clearP.u.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearP.u.value, PRESSURE);
      blit(pressure.write); pressure.swap();

      pressureP.bind();
      gl.uniform2f(pressureP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(pressureP.u.uDivergence, divergence.attach(0));
      for (let i = 0, n = P.iterations | 0; i < n; i++) {
        gl.uniform1i(pressureP.u.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }

      gradientP.bind();
      gl.uniform2f(gradientP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(gradientP.u.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradientP.u.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      advectP.bind();
      gl.uniform2f(advectP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(advectP.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectP.u.uSource, velocity.read.attach(0));
      gl.uniform1f(advectP.u.dt, dt);
      gl.uniform1f(advectP.u.dissipation, P.velocity);
      blit(velocity.write); velocity.swap();

      gl.uniform1i(advectP.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectP.u.uSource, dye.read.attach(1));
      gl.uniform1f(advectP.u.dissipation, P.dye);
      blit(dye.write); dye.swap();
    }

    let light = env.theme.mode === 'light' ? 1 : 0;
    function display() {
      const paper = rgb(env.theme.paper), ink = rgb(env.theme.accent);
      displayP.bind();
      gl.uniform2f(displayP.u.texelSize, 1 / cv.width, 1 / cv.height);
      gl.uniform1i(displayP.u.uTexture, dye.read.attach(0));
      gl.uniform3f(displayP.u.uPaper, paper[0], paper[1], paper[2]);
      gl.uniform3f(displayP.u.uInk, ink[0], ink[1], ink[2]);
      gl.uniform1f(displayP.u.uLight, light);
      blit(null);
    }

    const pointer = { x: 0.5, y: 0.5, inside: false, presses: 0, color: tint(0.2), since: 0 };
    let lastAmbient = 0, clock = 0;
    burst(12, 0.42);

    return {
      step(ctx, w, h, t, acc, P, M, env) {
        const dt = Math.min(env.dt, 1 / 60);
        clock += dt;
        const target = env.theme.mode === 'light' ? 1 : 0;
        light = env.reducedMotion ? target : light + (target - light) * 0.095;

        if (M.in) {
          const nx = M.x / w, ny = 1 - M.y / h;
          if (pointer.inside) {
            const dx = (nx - pointer.x) * SPLAT_FORCE, dy = (ny - pointer.y) * SPLAT_FORCE;
            if (Math.abs(dx) + Math.abs(dy) > 3) {
              if (clock - pointer.since > 2.4) { pointer.color = tint(0.2); pointer.since = clock; }
              splat(nx, ny, dx, dy, pointer.color, P.radius);
            }
          }
          pointer.x = nx; pointer.y = ny; pointer.inside = true;
        } else {
          pointer.inside = false;
        }
        if (M.presses !== pointer.presses) {
          pointer.presses = M.presses;
          const nx = M.x / w, ny = 1 - M.y / h;
          for (let i = 0; i < 6; i++) {
            const a = Math.PI * 2 * i / 6, f = 480 + Math.random() * 380;
            splat(nx, ny, Math.cos(a) * f, Math.sin(a) * f, tint(0.32), P.radius);
          }
        }
        if (P.ambient && clock - lastAmbient > 1.5) {
          lastAmbient = clock;
          const a = Math.random() * Math.PI * 2, f = 340 + Math.random() * 420;
          splat(0.1 + Math.random() * 0.8, 0.15 + Math.random() * 0.7,
            Math.cos(a) * f, Math.sin(a) * f, tint(0.3), 0.5 + Math.random() * 0.45);
        }
        solve(dt, P);
        display();
      },
      resize() { allocate(); burst(12, 0.42); },
      reset() { allocate(); burst(12, 0.42); },
      destroy() {
        for (const t of targets) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }
        for (const p of programs) gl.deleteProgram(p);
        for (const s of shaders) gl.deleteShader(s);
        gl.deleteBuffer(vbo); gl.deleteBuffer(ibo);
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
    };
  }
};
