# Flow field

*Vector fields* · `flow` · [source](../../src/experiments/flow.js)

> Two hundred particles that know nothing. At each position they read one angle from an invisible field and take a step. The structure you see was never drawn: it is what the field looks like when enough things follow it.

```js
import { mount } from 'bn-lab';
import flow from 'bn-lab/experiments/flow';

mount(document.querySelector('canvas'), flow, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `scale` | Field scale | 3 – 30 | 11 |
| `speed` | Step size | 0.3 – 4 | 1.25 |
| `pull` | Cursor pull | 0 – 3 | 1.2 |

## The model

**`θ(x,y,t) = π[sin(0.011x + 0.35t) + cos(0.013y − 0.28t)]`**

The field. Two sine waves at different spatial frequencies, both drifting in time, which is what keeps the structure from freezing.

**`p ← p + (cos θ, sin θ)·v`**

Each particle steps in the direction the field gives it. No inertia, no memory: the trajectory is entirely a property of the field.

## How it is implemented

The canvas is never cleared. Each frame it gets a black rectangle at 5.5% opacity, so old strokes fade instead of disappearing, and that fade is what produces the trails. Particles that leave the canvas or exhaust their lifetime respawn at random.

## What to look at

Bright ridges form where many trajectories converge, and empty regions where the field pushes everything away. Those are the attractors and repellers of the field, visible only because something is moving through them.

## Why it matters

It is the same idea behind streamline plots in fluid dynamics and behind how wind maps are drawn. The field is the physics; the particles are just how you make it visible.

---

## En español: Campo de flujo

> Doscientas partículas que no saben nada. En cada posición leen un ángulo de un campo invisible y dan un paso. La estructura que ves nunca se dibujó: es cómo se ve el campo cuando suficientes cosas lo siguen.

### El modelo

**`θ(x,y,t) = π[sin(0.011x + 0.35t) + cos(0.013y − 0.28t)]`**

El campo. Dos senoidales de distinta frecuencia espacial, ambas derivando en el tiempo, que es lo que evita que la estructura se congele.

**`p ← p + (cos θ, sin θ)·v`**

Cada partícula avanza en la dirección que le da el campo. Sin inercia, sin memoria: la trayectoria es enteramente una propiedad del campo.

### Cómo está implementado

El canvas nunca se limpia. Cada frame recibe un rectángulo negro al 5,5% de opacidad, así los trazos viejos se desvanecen en vez de desaparecer, y ese desvanecimiento es lo que produce las estelas. Las partículas que salen del canvas o agotan su vida reaparecen al azar.

### Qué mirar

Se forman crestas brillantes donde muchas trayectorias convergen, y regiones vacías donde el campo empuja todo hacia afuera. Esos son los atractores y repulsores del campo, visibles solo porque algo se mueve a través de ellos.

### Por qué importa

Es la misma idea detrás de los gráficos de líneas de corriente en dinámica de fluidos y de cómo se dibujan los mapas de viento. El campo es la física; las partículas son solo cómo lo haces visible.
