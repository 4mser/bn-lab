# Two mouths, one plane

*General relativity* · `handle` · [source](../../src/experiments/handle.js)

> Both mouths in the same universe. Cut two discs out of a plane, glue their edges to each other, and the space you are left with has a route between two places that is not the road between them.

```js
import { mount } from 'phenomena';
import handle from 'phenomena/experiments/handle';

mount(document.querySelector('canvas'), handle, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `R` | Mouth radius | 14 – 60 px | 30 |
| `pull` | Gravity | 0 – 4 | 1.6 |
| `rays` | Rays | 1 – 40 | 18 |

## The model

**`∂A ≡ ∂B`**

The identification. Every point on the edge of one disc is the same point as one on the edge of the other. Nothing is transported: there is only one circle, drawn twice.

**`χ = 2 − 2g`**

Gluing a handle drops the Euler characteristic by two. That is the invariant that changed, and it is why no amount of bending the plane can imitate this.

**`α ≈ 2R/b`**

The deflection each mouth produces on a passing ray. The same field warps the grid, so what you see bending the lines is what you see bending the paths.

## How it is implemented

Rays are integrated under the attraction of both mouths. When one reaches a mouth boundary it is placed on the other mouth boundary with its direction unchanged, and its trail is cut at that instant. The cut matters: the path is continuous in the space but discontinuous on the screen, because the screen is drawing a plane and the space is not one. The grid is displaced by the same field that bends the rays, so the two are never telling different stories.

## What to look at

Drag mouth B around with the cursor. The separation readout changes and the distance through the handle stays zero, because the two circles are one circle no matter where you put them. Watch a ray fall toward A, vanish, and continue out of B travelling the same way it was going.

## Why it matters

This is the version that would matter if wormholes existed: not a bridge to another universe but a shortcut inside this one. It is also the version with the worst problem. Move one mouth at high speed and time dilation desynchronises the two ends, which turns the handle into a machine for arriving before you left. Most physicists take that as evidence something forbids it.

## References

- M. S. Morris, K. S. Thorne, "Wormholes in spacetime and their use for interstellar travel", Am. J. Phys. 56 (1988) 395–412.

---

## En español: Dos bocas, un plano

> Las dos bocas en el mismo universo. Recorta dos discos de un plano, pega sus bordes entre si, y el espacio que queda tiene una ruta entre dos lugares que no es el camino que los separa.

### El modelo

**`∂A ≡ ∂B`**

La identificacion. Cada punto del borde de un disco es el mismo punto que uno del borde del otro. Nada se transporta: hay un solo circulo, dibujado dos veces.

**`χ = 2 − 2g`**

Pegar un asa baja la caracteristica de Euler en dos. Ese es el invariante que cambio, y es la razon de que ninguna cantidad de doblado del plano pueda imitar esto.

**`α ≈ 2R/b`**

La deflexion que cada boca produce sobre un rayo que pasa. El mismo campo deforma la rejilla, asi que lo que ves doblando las lineas es lo que ves doblando las trayectorias.

### Cómo está implementado

Los rayos se integran bajo la atraccion de las dos bocas. Cuando uno llega al borde de una se coloca en el borde de la otra con su direccion intacta, y su estela se corta en ese instante. El corte importa: el camino es continuo en el espacio y discontinuo en la pantalla, porque la pantalla dibuja un plano y el espacio no lo es. La rejilla se desplaza con el mismo campo que curva los rayos, asi que las dos nunca cuentan historias distintas.

### Qué mirar

Arrastra la boca B con el cursor. La separacion cambia y la distancia por el asa sigue en cero, porque los dos circulos son un circulo pongas donde los pongas. Mira un rayo caer hacia A, desaparecer, y seguir saliendo de B viajando en la misma direccion que llevaba.

### Por qué importa

Esta es la version que importaria si los agujeros de gusano existieran: no un puente a otro universo sino un atajo dentro de este. Es tambien la version con el peor problema. Mueve una boca a gran velocidad y la dilatacion temporal desincroniza los dos extremos, lo que convierte al asa en una maquina para llegar antes de haber salido. La mayoria de los fisicos toma eso como evidencia de que algo lo prohibe.
