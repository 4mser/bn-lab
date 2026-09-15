# Brownian motion

*Statistical mechanics* · `brownian` · [source](../../src/experiments/brownian.js)

> A particle with no direction of its own, hit from every side by things too small to see. It goes nowhere in particular, and how far it gets follows a law you can write down.

```js
import { mount } from 'bn-lab-simulations';
import brownian from 'bn-lab-simulations/experiments/brownian';

mount(document.querySelector('canvas'), brownian, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `jump` | Step size | 1 – 18 | 6 |
| `walkers` | Walkers | 1 – 14 | 6 |
| `drift` | Cursor drift | 0 – 2 | 0.5 |

## The model

**`⟨r²⟩ = 4Dt`**

Mean squared displacement grows linearly with time, not with time squared. That is the signature of diffusion as opposed to travel: doubling the distance takes four times as long.

**`D = kT / 6πηa`**

The Stokes-Einstein relation. It connects the jitter of one visible particle to Boltzmann's constant, and through it to the size of atoms.

## How it is implemented

Six independent walkers, three steps per frame, each step a uniform random offset in x and y clamped to the canvas. Each keeps its last 520 positions and draws them as a fading polyline.

## What to look at

The paths look like they have structure, with long runs and tight clusters. They do not. Every step is independent of the last, and the apparent structure is what randomness actually looks like when you draw it.

## Why it matters

In 1905 Einstein wrote down how far such a particle should drift. Perrin measured it, got Avogadro's number out of it, and that settled the argument about whether atoms were real objects or just a convenient accounting device.

## References

- A. Einstein, "Über die von der molekularkinetischen Theorie der Wärme geforderte Bewegung von in ruhenden Flüssigkeiten suspendierten Teilchen", Ann. Phys. 17 (1905) 549–560.
- J. Perrin, "Mouvement brownien et réalité moléculaire", Ann. Chim. Phys. 18 (1909) 5–114.

---

## En español: Movimiento browniano

> Una partícula sin dirección propia, golpeada por todos lados por cosas demasiado chicas para verse. No va a ninguna parte en particular, y cuánto se aleja sigue una ley que puedes escribir.

### El modelo

**`⟨r²⟩ = 4Dt`**

El desplazamiento cuadrático medio crece linealmente con el tiempo, no con el tiempo al cuadrado. Esa es la firma de la difusión frente al viaje: duplicar la distancia toma cuatro veces más tiempo.

**`D = kT / 6πηa`**

La relación de Stokes-Einstein. Conecta el temblor de una partícula visible con la constante de Boltzmann, y a través de ella con el tamaño de los átomos.

### Cómo está implementado

Seis caminantes independientes, tres pasos por frame, cada paso un desplazamiento aleatorio uniforme en x e y acotado al canvas. Cada uno guarda sus últimas 520 posiciones y las dibuja como una polilínea que se desvanece.

### Qué mirar

Los caminos parecen tener estructura, con tramos largos y grumos apretados. No la tienen. Cada paso es independiente del anterior, y la estructura aparente es cómo se ve realmente el azar cuando lo dibujas.

### Por qué importa

En 1905 Einstein escribió cuánto debía derivar una partícula así. Perrin lo midió, sacó de ahí el número de Avogadro, y eso zanjó la discusión sobre si los átomos eran objetos reales o solo un artificio de contabilidad.
