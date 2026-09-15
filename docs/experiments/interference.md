# Interference

*Wave optics* · `interference` · [source](../../src/experiments/interference.js)

> Two sources emitting the same wave. Where the crests meet, light. Where a crest meets a trough, nothing. The pattern is not in either wave: it only exists in the sum.

```js
import { mount } from 'bn-lab-simulations';
import interference from 'bn-lab-simulations/experiments/interference';

mount(document.querySelector('canvas'), interference, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `lambda` | Wavelength λ | 12 – 70 px | 34 |
| `sources` | Sources | 2 – 5 | 2 |
| `speed` | Speed | 0 – 4 | 2.2 |

## The model

**`ψ(r,t) = A/√r · cos(kr − ωt)`**

A single spherical source. Amplitude falls as 1/√r because energy spreads over a growing circumference; k = 2π/λ is the wavenumber and ω the angular frequency.

**`ψ_total = Σ ψ_i`**

Superposition. Waves add linearly, which is the whole reason interference exists. If they multiplied, there would be no pattern.

**`I = |ψ|²`**

What you actually see is the intensity: the square of the amplitude. Squaring is why the fringes are always positive and why the dark bands are exactly zero.

## How it is implemented

The canvas is a grid of sample points spaced 6px apart. For each point I sum the contribution of every source, square it, and map the result to the radius and opacity of a dot. Nothing is precomputed: the whole field is evaluated every frame, which is roughly 10.000 evaluations at 60fps.

## What to look at

Move the cursor over it. One of the sources follows you, so you can open and close the fringes by hand. Notice the hyperbolic shape of the dark bands: those are the points where the path difference is exactly half a wavelength.

## Why it matters

This is the experiment that forced physics to accept that light is a wave, and later that electrons are too. Young ran it with sunlight and a card in 1801. The same maths describes noise-cancelling headphones and the antenna array in a phone.

## References

- T. Young, "The Bakerian Lecture: Experiments and calculations relative to physical optics", Phil. Trans. R. Soc. Lond. 94 (1804) 1–16.

---

## En español: Interferencia

> Dos fuentes emitiendo la misma onda. Donde las crestas se encuentran, luz. Donde una cresta encuentra un valle, nada. El patrón no está en ninguna de las dos ondas: solo existe en la suma.

### El modelo

**`ψ(r,t) = A/√r · cos(kr − ωt)`**

Una sola fuente esférica. La amplitud cae como 1/√r porque la energía se reparte sobre una circunferencia que crece; k = 2π/λ es el número de onda y ω la frecuencia angular.

**`ψ_total = Σ ψ_i`**

Superposición. Las ondas se suman linealmente, que es la razón entera de que exista la interferencia. Si se multiplicaran, no habría patrón.

**`I = |ψ|²`**

Lo que ves de verdad es la intensidad: el cuadrado de la amplitud. Elevar al cuadrado es la razón de que las franjas siempre sean positivas y de que las bandas oscuras sean exactamente cero.

### Cómo está implementado

El canvas es una rejilla de puntos separados 6px. Para cada punto sumo la contribución de todas las fuentes, la elevo al cuadrado y mapeo el resultado al radio y la opacidad de un punto. Nada está precalculado: el campo entero se evalúa en cada frame, que son unas 10.000 evaluaciones a 60fps.

### Qué mirar

Mueve el cursor encima. Una de las fuentes te sigue, así que puedes abrir y cerrar las franjas a mano. Fíjate en la forma hiperbólica de las bandas oscuras: son los puntos donde la diferencia de camino es exactamente media longitud de onda.

### Por qué importa

Este es el experimento que obligó a la física a aceptar que la luz es una onda, y después que los electrones también. Young lo corrió con luz solar y una tarjeta en 1801. Las mismas matemáticas describen los audífonos con cancelación de ruido y el arreglo de antenas de un teléfono.
