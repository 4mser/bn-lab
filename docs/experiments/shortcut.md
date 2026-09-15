# Looking through

*General relativity* · `shortcut` · [source](../../src/experiments/shortcut.js)

> Not a diagram of a wormhole: the view through one. Every pixel is a light ray traced backwards through the metric, and the ones that make it to the other side bring back a different sky.

```js
import { mount } from 'bn-lab-simulations';
import shortcut from 'bn-lab-simulations/experiments/shortcut';

mount(document.querySelector('canvas'), shortcut, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `b0` | Throat radius b₀ | 0.2 – 3 | 1 |
| `dist` | Camera distance | 1.5 – 14 | 5 |
| `fov` | Field of view | 30 – 140 ° | 90 |

## The model

**`ds² = −dt² + dl² + (b₀² + l²)dφ²`**

The Ellis metric, the simplest traversable wormhole. l runs through the throat instead of stopping at it, so light can cross.

**`dl/dφ = ±(r²/b)·√(1 − b²/r²)`**

The null geodesic equation, with b the impact parameter and r² = b₀² + l². Integrating it is the entire renderer.

**`b < b₀ ⟹ crosses`**

The condition that decides everything. Since r never drops below b₀, a ray with a smaller impact parameter has no turning point and must come out the other side. Everything else bends around and returns.

## How it is implemented

A full per-pixel trace would be far too slow, but the camera sits on the axis so the deflection depends only on the angle from it. That makes the problem one-dimensional: 512 geodesics are integrated once into a lookup table, and every pixel is then a table read. The integration is done with respect to φ rather than l, which removes the square-root divergence at the turning point. Both skies are procedural and sampled by the same function, so what separates them is where the ray came from, not how they are drawn.

## What to look at

The rim. Right at the edge of the disc the near sky is smeared into a thin ring: those rays passed close to the throat, wound part way around it and came back. Widen the throat and the other sky takes over the frame; pull the camera back and it shrinks to a coin. The readout tells you what fraction of your field of view is now somewhere else.

## Why it matters

This is how the Interstellar wormhole was made: Kip Thorne wrote the equations, the effects team integrated them per pixel, and the result was a published paper as well as a film. The point is that a wormhole has no appearance of its own. You never see the tunnel. You see the other place, wrapped into a sphere by the geometry between you and it.

## References

- M. S. Morris, K. S. Thorne, "Wormholes in spacetime and their use for interstellar travel", Am. J. Phys. 56 (1988) 395–412.
- O. James, E. von Tunzelmann, P. Franklin, K. S. Thorne, "Visualizing Interstellar's wormhole", Am. J. Phys. 83 (2015) 486–499.

---

## En español: Mirar a través

> No es un diagrama de un agujero de gusano: es la vista a traves de uno. Cada pixel es un rayo de luz trazado hacia atras por la metrica, y los que llegan al otro lado traen de vuelta otro cielo.

### El modelo

**`ds² = −dt² + dl² + (b₀² + l²)dφ²`**

La metrica de Ellis, el agujero de gusano transitable mas simple. l atraviesa la garganta en vez de detenerse en ella, asi que la luz puede cruzar.

**`dl/dφ = ±(r²/b)·√(1 − b²/r²)`**

La ecuacion de la geodesica nula, con b el parametro de impacto y r² = b₀² + l². Integrarla es todo el renderizador.

**`b < b₀ ⟹ crosses`**

La condicion que decide todo. Como r nunca baja de b₀, un rayo con parametro de impacto menor no tiene punto de retorno y tiene que salir por el otro lado. Todo lo demas se curva y vuelve.

### Cómo está implementado

Un trazado completo por pixel seria demasiado lento, pero la camara esta sobre el eje y la desviacion depende solo del angulo respecto a el. Eso vuelve el problema unidimensional: se integran 512 geodesicas una vez a una tabla, y cada pixel pasa a ser una lectura. La integracion es respecto a φ y no a l, lo que elimina la divergencia de la raiz en el punto de retorno. Los dos cielos son procedurales y se muestrean con la misma funcion, asi que lo que los separa es de donde vino el rayo, no como se dibujan.

### Qué mirar

El borde. Justo en el filo del disco el cielo cercano queda embarrado en un anillo fino: esos rayos pasaron cerca de la garganta, la rodearon en parte y volvieron. Ensancha la garganta y el otro cielo se apodera del cuadro; aleja la camara y se encoge a una moneda. El numero de abajo dice que fraccion de tu campo de vision esta ahora en otra parte.

### Por qué importa

Asi se hizo el agujero de gusano de Interstellar: Kip Thorne escribio las ecuaciones, el equipo de efectos las integro por pixel, y el resultado fue un paper publicado ademas de una pelicula. El punto es que un agujero de gusano no tiene apariencia propia. Nunca ves el tunel. Ves el otro lugar, envuelto en una esfera por la geometria que hay entre tu y el.
