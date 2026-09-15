# Wave or particle, your choice

*Quantum mechanics* · `duality` · [source](../../src/experiments/duality.js)

> One photon, one apparatus, and a plate you can slide in or out at the last moment. Leave it in and the photon behaves as if it took both routes. Take it out and one detector clicks, naming a single route.

```js
import { mount } from 'phenomena';
import duality from 'phenomena/experiments/duality';

mount(document.querySelector('canvas'), duality, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `bs2` | Second splitter in place | 0 – 1 | 1 |
| `late` | Decide after entry | 0 – 1 | 0 |
| `phase` | Phase φ | 0 – 360 ° | 60 |

## The model

**`P(D0) = cos²(φ/2)`**

With the second splitter in place. The two amplitudes recombine and their relative phase decides which detector fires, so sweeping φ moves every photon from one detector to the other.

**`P(D0) = ½`**

With it removed. No recombination, no phase dependence, and the detector that fires tells you which arm. Changing φ does nothing at all.

**`V = 1  ⟷  V = 0`**

The visibility flips between the two configurations with nothing in between, because the plate is either there or it is not. The rest of the apparatus never changed.

## How it is implemented

The apparatus is labelled so you can read it: a source, a first splitter that divides the route, two mirrors, a second splitter that can be slid out, and two detectors. Photons are emitted one at a time and their detector is drawn from the probability for whichever configuration is in force when they arrive. The curve underneath is the point of the whole thing: every detection is filed into a phase bin, and the dots are the measured fraction landing in D0 while the dashed line is the prediction. With the splitter in you watch a cosine build itself out of single events. With it out the same dots pile up on a flat line at one half.

## What to look at

Sweep the cursor across the canvas to move the phase and watch the measured dots fill in the curve. Then pull the second splitter out and sweep again: the cosine is gone and every bin sits at one half, because with no recombination the phase has nothing to act on. Finally turn on the delayed choice and compare the two numbers at the top. They agree, which is the whole of Wheeler argument reduced to two figures you can read off the screen.

## Why it matters

Wheeler proposed it in 1978 to press on a tempting idea: that the photon somehow decides what to be on entering. If that were so, deciding afterwards should break something. It does not. The lesson is not that the present rewrites the past. It is that asking what the photon was doing between the two plates is asking about something the theory does not contain, and the experiment is a way of finding that out rather than a way of being confused by it.

## References

- P. Grangier, G. Roger, A. Aspect, "Experimental evidence for a photon anticorrelation effect on a beam splitter: a new light on single-photon interferences", Europhys. Lett. 1 (1986) 173–179.

---

## En español: Onda o partícula, tú eliges

> Un foton, un aparato, y una placa que puedes meter o sacar en el ultimo momento. Dejala puesta y el foton se comporta como si hubiera tomado las dos rutas. Sacala y suena un solo detector, nombrando una sola ruta.

### El modelo

**`P(D0) = cos²(φ/2)`**

Con el segundo divisor puesto. Las dos amplitudes se recombinan y su fase relativa decide que detector se dispara, asi que barrer φ mueve cada foton de un detector al otro.

**`P(D0) = ½`**

Con el sacado. Sin recombinacion no hay dependencia de fase, y el detector que se dispara te dice cual brazo. Cambiar φ no hace absolutamente nada.

**`V = 1  ⟷  V = 0`**

La visibilidad salta entre las dos configuraciones sin nada en medio, porque la placa esta o no esta. El resto del aparato nunca cambio.

### Cómo está implementado

El aparato esta rotulado para que se pueda leer: una fuente, un primer divisor que reparte la ruta, dos espejos, un segundo divisor que se puede retirar, y dos detectores. Los fotones se emiten de a uno y su detector se sortea de la probabilidad de la configuracion vigente cuando llegan. La curva de abajo es el punto de todo esto: cada deteccion se archiva en una casilla de fase, y los puntos son la fraccion medida que cae en D0 mientras la linea punteada es la prediccion. Con el divisor puesto ves un coseno construirse a partir de eventos individuales. Sin el, los mismos puntos se apilan en una recta plana en un medio.

### Qué mirar

Barre el cursor por el canvas para mover la fase y mira los puntos medidos llenar la curva. Despues retira el segundo divisor y barre otra vez: el coseno desaparecio y cada casilla se queda en un medio, porque sin recombinacion la fase no tiene sobre que actuar. Por ultimo activa la eleccion diferida y compara los dos numeros de arriba. Coinciden, y eso es todo el argumento de Wheeler reducido a dos cifras que se leen en pantalla.

### Por qué importa

Wheeler lo propuso en 1978 para presionar una idea tentadora: que el foton de algun modo decide que ser al entrar. Si fuera asi, decidir despues deberia romper algo. No lo rompe. La leccion no es que el presente reescriba el pasado. Es que preguntar que hacia el foton entre las dos placas es preguntar por algo que la teoria no contiene, y el experimento sirve para descubrir eso en vez de para quedar confundido.
