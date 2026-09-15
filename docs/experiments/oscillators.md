# Coupled oscillators

*Classical mechanics* · `oscillators` · [source](../../src/experiments/oscillators.js)

> Two masses joined by a spring. Start one moving and the other stays still, for a while. Then the energy has crossed over completely and the first one is the one at rest.

```js
import { mount } from 'bn-lab-simulations';
import oscillators from 'bn-lab-simulations/experiments/oscillators';

mount(document.querySelector('canvas'), oscillators, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `kc` | Coupling | 0 – 0.6 | 0.18 |
| `k` | Stiffness | 0.2 – 3 | 1 |
| `mass` | Mass ratio | 0.4 – 3 | 1 |

## The model

**`m₁ẍ₁ = −kx₁ − k_c(x₁ − x₂)`**

Newton for the first mass: its own spring plus the coupling. The second equation is the mirror image.

**`ω± = √(k/m), √((k+2k_c)/m)`**

The two normal modes: both masses moving together, and both moving against each other. Any motion at all is a mix of exactly these two.

**`f_beat = (ω₊ − ω₋)/2π`**

The beat frequency is the difference between the modes. Weaker coupling means slower handover, which is why the slider changes the rhythm and not the pitch.

## How it is implemented

Two second-order equations integrated with a fixed step, three substeps per frame. The two traces at the bottom are the displacement history of each mass, and the beating is visible there long before you notice it in the masses themselves.

## What to look at

Turn the coupling to zero and the handover stops: two independent oscillators that never talk. Turn it up and they trade energy so fast the two motions blur into one.

## Why it matters

Normal modes are how you solve any system of coupled linear oscillators: find the combinations that do not talk to each other, then everything decouples. Molecules, bridges, circuits and crystal lattices are all this problem with more indices.

## References

- A. P. French, Vibrations and Waves, W. W. Norton (1971).

---

## En español: Osciladores acoplados

> Dos masas unidas por un resorte. Pon una en movimiento y la otra se queda quieta, por un rato. Después la energía cruzó completa y la que está en reposo es la primera.

### El modelo

**`m₁ẍ₁ = −kx₁ − k_c(x₁ − x₂)`**

Newton para la primera masa: su propio resorte más el acoplamiento. La segunda ecuación es la imagen espejo.

**`ω± = √(k/m), √((k+2k_c)/m)`**

Los dos modos normales: las dos masas moviéndose juntas, y las dos moviéndose en contra. Cualquier movimiento es una mezcla de exactamente esos dos.

**`f_beat = (ω₊ − ω₋)/2π`**

La frecuencia de batido es la diferencia entre los modos. Menos acoplamiento significa traspaso más lento, y por eso el deslizador cambia el ritmo y no el tono.

### Cómo está implementado

Dos ecuaciones de segundo orden integradas con paso fijo, tres subpasos por frame. Las dos trazas de abajo son la historia de desplazamiento de cada masa, y el batido se ve ahí mucho antes de que lo notes en las masas mismas.

### Qué mirar

Baja el acoplamiento a cero y el traspaso se detiene: dos osciladores independientes que nunca se hablan. Súbelo y se pasan la energía tan rápido que los dos movimientos se funden en uno.

### Por qué importa

Los modos normales son cómo se resuelve cualquier sistema de osciladores lineales acoplados: encontrar las combinaciones que no se hablan entre sí, y ahí todo se desacopla. Moléculas, puentes, circuitos y redes cristalinas son este mismo problema con más índices.
