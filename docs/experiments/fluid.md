# Incompressible fluid

*Fluid dynamics* · `fluid` · [source](../../src/experiments/fluid.js) · WebGL

> Stir it with the cursor. What moves is not a particle system or a noise field: it is a velocity field kept incompressible, solved on the GPU sixty times a second.

```js
import { mount } from 'phenomena';
import fluid from 'phenomena/experiments/fluid';

mount(document.querySelector('canvas'), fluid, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `curl` | Vorticity confinement | 0 – 60 | 24 |
| `iterations` | Pressure iterations | 2 – 40 | 16 |
| `velocity` | Velocity decay | 0 – 2 | 0.26 |
| `dye` | Dye decay | 0 – 2 | 0.22 |
| `radius` | Splat radius | 0.05 – 1 | 0.17 |
| `ambient` | Ambient splats | 0 – 1 | 1 |

## The model

**`∂u/∂t + (u·∇)u = −∇p + f`**

Momentum. The fluid carries its own velocity along (advection), pressure pushes back, and f is your cursor. There is no explicit viscosity term: a gentle decay stands in for it.

**`∇·u = 0`**

Incompressibility. Whatever flows into a cell must flow out. Enforcing this is most of the work.

**`∇²p = ∇·u,   u ← u − ∇p`**

Projection (Chorin, 1968). Solve a Poisson equation for the pressure and subtract its gradient: what is left has no divergence. Here it is solved with Jacobi iterations, and the slider sets how many.

**`ω = ∇×u,   f_ω = ε (N × ω)`**

Vorticity confinement. Numerical diffusion kills small swirls; this term finds them (N points toward stronger vorticity) and spins them back up.

## How it is implemented

Velocity, pressure, divergence, curl and dye each live in a half-float texture, and every stage of the solver is a full-screen fragment shader rendering into another texture. Advection is semi-Lagrangian: each texel looks backwards along the velocity and samples what was there, which is unconditionally stable (Stam, 1999). Velocity is simulated on a coarse grid (128 cells on the short side) and dye on a fine one (640), then shaded with a normal taken from its own gradient. On a dark theme the dye is added as light; on a light theme the same density is read as a pigment tint. The solver structure is adapted from Pavel Dobryakov's WebGL-Fluid-Simulation (MIT).

## What to look at

Drag slowly, then fast: slow strokes leave smooth tongues, fast ones roll up into pairs of counter-rotating vortices. Set vorticity confinement to zero and the small curls die out. Drop the pressure iterations to two and the field is no longer fully divergence-free: the dye starts to bunch up and thin out instead of simply flowing.

## Why it matters

This method is what made real-time fluids practical in games and visual effects, and it is still how they are taught: unconditionally stable and small enough to fit in a handful of shaders. It is also a reminder of the distance between a solver and the equations: this one is two-dimensional, inviscid and numerically diffusive, and it says nothing about the three-dimensional regularity question that makes Navier-Stokes a Millennium Prize problem.

## References

- A. J. Chorin, "Numerical solution of the Navier-Stokes equations", Math. Comp. 22 (1968) 745–762.
- J. Stam, "Stable fluids", Proceedings of SIGGRAPH 99 (1999) 121–128.
- R. Fedkiw, J. Stam, H. W. Jensen, "Visual simulation of smoke", Proceedings of SIGGRAPH 2001 (2001) 15–22.
- M. J. Harris, "Fast fluid dynamics simulation on the GPU", in GPU Gems, ch. 38, Addison-Wesley (2004).
- P. Dobryakov, WebGL-Fluid-Simulation (2017), https://github.com/PavelDoGreat/WebGL-Fluid-Simulation — MIT License.

---

## En español: Fluido incompresible

> Revuélvelo con el cursor. Lo que se mueve no es un sistema de partículas ni un campo de ruido: es un campo de velocidad que se mantiene incompresible, resuelto en la GPU sesenta veces por segundo.

### El modelo

**`∂u/∂t + (u·∇)u = −∇p + f`**

Momento. El fluido arrastra su propia velocidad (advección), la presión empuja de vuelta y f es tu cursor. No hay un término de viscosidad explícito: un decaimiento suave cumple ese papel.

**`∇·u = 0`**

Incompresibilidad. Todo lo que entra a una celda tiene que salir. Imponerlo es la mayor parte del trabajo.

**`∇²p = ∇·u,   u ← u − ∇p`**

Proyección (Chorin, 1968). Se resuelve una ecuación de Poisson para la presión y se resta su gradiente: lo que queda no tiene divergencia. Acá se resuelve con iteraciones de Jacobi, y el deslizador fija cuántas.

**`ω = ∇×u,   f_ω = ε (N × ω)`**

Confinamiento de vorticidad. La difusión numérica mata los remolinos chicos; este término los encuentra (N apunta hacia donde la vorticidad es mayor) y los vuelve a hacer girar.

### Cómo está implementado

Velocidad, presión, divergencia, rotor y tinta viven cada una en una textura de medio flotante, y cada etapa del solucionador es un fragment shader de pantalla completa que escribe en otra textura. La advección es semi-lagrangiana: cada texel mira hacia atrás a lo largo de la velocidad y muestrea lo que había ahí, lo que es incondicionalmente estable (Stam, 1999). La velocidad se simula en una malla gruesa (128 celdas en el lado corto) y la tinta en una fina (640), sombreada con una normal tomada de su propio gradiente. En tema oscuro la tinta se suma como luz; en tema claro la misma densidad se lee como pigmento. La estructura del solucionador está adaptada de WebGL-Fluid-Simulation de Pavel Dobryakov (MIT).

### Qué mirar

Arrastra lento y después rápido: los trazos lentos dejan lenguas suaves, los rápidos se enrollan en pares de vórtices que giran en sentidos opuestos. Pon el confinamiento de vorticidad en cero y los rizos chicos se apagan. Baja las iteraciones de presión a dos y el campo deja de estar libre de divergencia: la tinta se amontona y se adelgaza en vez de simplemente fluir.

### Por qué importa

Este método es lo que hizo prácticos los fluidos en tiempo real en videojuegos y efectos visuales, y sigue siendo como se enseñan: incondicionalmente estable y lo bastante chico para caber en un puñado de shaders. También recuerda la distancia entre un solucionador y las ecuaciones: este es bidimensional, sin viscosidad y numéricamente difusivo, y no dice nada sobre la pregunta de regularidad en tres dimensiones que hace de Navier-Stokes un problema del milenio.
