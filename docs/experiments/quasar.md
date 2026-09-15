# Quasar

*Astrophysics* · `quasar` · [source](../../src/experiments/quasar.js)

> A supermassive black hole eating a galaxy. The infalling gas heats up until it outshines everything around it, and two jets leave along the rotation axis at nearly light speed.

```js
import { mount } from 'phenomena';
import quasar from 'phenomena/experiments/quasar';

mount(document.querySelector('canvas'), quasar, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `incl` | Inclination | 0.05 – 1.5 | 0.42 |
| `jet` | Jet power | 0 – 3 | 1.2 |
| `beam` | Beaming β | 0 – 0.9 | 0.55 |

## The model

**`v(r) ∝ r^(−1/2)`**

Keplerian rotation. The inner disk moves much faster than the outer, so the disk shears against itself and that friction is what heats it.

**`δ = 1/(γ(1 − β·cosθ))`**

The Doppler factor. Material coming toward you has its emission compressed in time and blueshifted, and both effects multiply.

**`I ∝ δ³`**

Observed brightness goes as the cube of that factor. It is why one side of the disk is visibly brighter here, and why most real quasars appear to have only one jet: the receding one is beamed away from us.

## How it is implemented

Nine hundred particles on Keplerian orbits, projected with an inclination you control. Each one is shaded by its own Doppler factor computed from its instantaneous direction of motion relative to the viewer, which is why the asymmetry appears without being drawn in. The jets are separate particle streams along the axis.

## What to look at

Drop the inclination toward zero to look straight down the jet. That is a blazar: the beaming points almost entirely at you and the object appears hundreds of times brighter than it is. Raise the beaming slider and watch one side of the disk take over.

## Why it matters

Quasars were found in 1963 as radio sources that looked like stars but had impossible redshifts. Resolving that meant accepting they were billions of light years away and therefore brighter than entire galaxies, powered by something only a few light hours across. That something turned out to be a black hole.

## References

- M. Schmidt, "3C 273: A star-like object with large red-shift", Nature 197 (1963) 1040.

---

## En español: Cuásar

> Un agujero negro supermasivo comiendose una galaxia. El gas que cae se calienta hasta brillar mas que todo lo que lo rodea, y dos chorros salen por el eje de rotacion casi a la velocidad de la luz.

### El modelo

**`v(r) ∝ r^(−1/2)`**

Rotacion kepleriana. El disco interior se mueve mucho mas rapido que el exterior, asi que el disco se cizalla contra si mismo y esa friccion es la que lo calienta.

**`δ = 1/(γ(1 − β·cosθ))`**

El factor Doppler. El material que viene hacia ti tiene su emision comprimida en el tiempo y corrida al azul, y los dos efectos se multiplican.

**`I ∝ δ³`**

El brillo observado va como el cubo de ese factor. Es la razon de que un lado del disco brille visiblemente mas aca, y de que la mayoria de los cuasares reales parezcan tener un solo chorro: el que se aleja esta apuntado lejos de nosotros.

### Cómo está implementado

Novecientas particulas en orbitas keplerianas, proyectadas con una inclinacion que controlas. Cada una se sombrea con su propio factor Doppler calculado desde su direccion instantanea de movimiento relativa al observador, y por eso la asimetria aparece sin dibujarla. Los chorros son flujos de particulas aparte a lo largo del eje.

### Qué mirar

Baja la inclinacion hacia cero para mirar de frente por el chorro. Eso es un blazar: el beaming apunta casi todo hacia ti y el objeto parece cientos de veces mas brillante de lo que es. Sube el deslizador de beaming y mira como un lado del disco se impone.

### Por qué importa

Los cuasares se encontraron en 1963 como fuentes de radio que parecian estrellas pero tenian corrimientos al rojo imposibles. Resolver eso implico aceptar que estaban a miles de millones de anos luz y por lo tanto brillaban mas que galaxias enteras, alimentados por algo de solo unas horas luz de ancho. Ese algo resulto ser un agujero negro.
