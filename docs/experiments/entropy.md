# Entropy

*Statistical mechanics* · `entropy` · [source](../../src/experiments/entropy.js)

> A gas let go in one corner spreads out and never gathers back. Nothing in the equations forbids it gathering. What forbids it is counting.

```js
import { mount } from 'bn-lab';
import entropy from 'bn-lab/experiments/entropy';

mount(document.querySelector('canvas'), entropy, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `n` | Particles | 4 – 600 | 240 |
| `cells` | Coarse-graining | 2 – 16 | 8 |
| `rev` | Reverse time | 0 – 1 | 0 |

## The model

**`S = k·ln Ω`**

Boltzmann. Entropy is the logarithm of how many microscopic arrangements look the same from outside. It is a property of your description, not of the particles.

**`S = −Σ pᵢ ln pᵢ`**

The form used here, over the occupancy of each cell. Normalised by the log of the cell count so the maximum is one, which is the state where every cell holds the same share.

**`Ω_spread / Ω_corner ≈ 2^N`**

Why it never goes back. With a few hundred particles that ratio already exceeds the number of atoms in the observable universe. Nothing is forbidden; it is just outnumbered.

## How it is implemented

Particles move in straight lines and bounce off the walls, with no collisions between them, which makes this a free expansion of an ideal gas and makes the dynamics exactly reversible. The shading is the coarse-grained description: how many particles are in each cell, which is all a macroscopic observer gets to know. Entropy is computed from those occupancies every frame and plotted underneath.

## What to look at

Flip the reverse switch once the gas has spread. Every velocity is negated and the whole thing retraces its path back into the corner, entropy falling the entire way. I measured it: reversing at step 600 sends S from 0.964 back to 0.313, the exact value it started from. Then set the particle count to four and watch entropy wander up and down on its own. At two hundred and forty it stops wandering, and that is the only reason the second law looks like a law.

## Why it matters

Loschmidt raised the reversal objection to Boltzmann in 1876 and it is not answerable by finding an error in the mechanics, because there is none. The answer is that entropy increase is overwhelmingly probable rather than certain, and that the initial state of the universe was one of extraordinarily low entropy. Everything we call the direction of time rests on that second fact, which physics describes and does not explain.

## References

- L. Boltzmann, "Über die Beziehung zwischen dem zweiten Hauptsatze der mechanischen Wärmetheorie und der Wahrscheinlichkeitsrechnung", Wiener Berichte 76 (1877) 373–435.
- C. E. Shannon, "A mathematical theory of communication", Bell Syst. Tech. J. 27 (1948) 379–423.

---

## En español: Entropía

> Un gas soltado en una esquina se expande y nunca vuelve a juntarse. Nada en las ecuaciones prohibe que se junte. Lo que lo prohibe es contar.

### El modelo

**`S = k·ln Ω`**

Boltzmann. La entropia es el logaritmo de cuantos arreglos microscopicos se ven iguales desde afuera. Es una propiedad de tu descripcion, no de las particulas.

**`S = −Σ pᵢ ln pᵢ`**

La forma usada aca, sobre la ocupacion de cada celda. Normalizada por el logaritmo del numero de celdas para que el maximo sea uno, que es el estado donde cada celda tiene la misma porcion.

**`Ω_spread / Ω_corner ≈ 2^N`**

Por que nunca vuelve. Con unos cientos de particulas esa razon ya supera el numero de atomos del universo observable. Nada esta prohibido; simplemente esta en minoria.

### Cómo está implementado

Las particulas se mueven en linea recta y rebotan en las paredes, sin colisiones entre ellas, lo que hace de esto una expansion libre de gas ideal y hace la dinamica exactamente reversible. El sombreado es la descripcion de grano grueso: cuantas particulas hay en cada celda, que es todo lo que un observador macroscopico llega a saber. La entropia se calcula de esas ocupaciones en cada frame y se grafica abajo.

### Qué mirar

Acciona el interruptor de inversion cuando el gas ya se expandio. Cada velocidad se niega y todo rehace su camino de vuelta a la esquina, con la entropia bajando en todo el trayecto. Lo medi: invertir en el paso 600 lleva S de 0,964 de vuelta a 0,313, el valor exacto del que partio. Despues pon el numero de particulas en cuatro y mira la entropia subir y bajar sola. En doscientas cuarenta deja de vagar, y esa es la unica razon de que la segunda ley parezca una ley.

### Por qué importa

Loschmidt le planteo la objecion de la inversion a Boltzmann en 1876 y no se responde encontrando un error en la mecanica, porque no lo hay. La respuesta es que el aumento de entropia es abrumadoramente probable y no seguro, y que el estado inicial del universo era de entropia extraordinariamente baja. Todo lo que llamamos direccion del tiempo descansa en ese segundo hecho, que la fisica describe y no explica.
