# Kepler orbits

*Astronomy* · `kepler` · [source](../../src/experiments/kepler.js) · [numerically validated](../../validation/RESULTS.md)

> Planets do not move at a constant speed and their orbits are not circles. Kepler worked that out from Tycho's tables alone, decades before anyone could explain why.

```js
import { mount } from 'bn-lab-simulations';
import kepler from 'bn-lab-simulations/experiments/kepler';

mount(document.querySelector('canvas'), kepler, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `ecc` | Eccentricity | 0 – 0.9 | 0.55 |
| `planets` | Planets | 1 – 6 | 3 |
| `perturb` | Cursor mass | 0 – 4000 | 900 |

## The model

**`r = a(1 − e²)/(1 + e·cos θ)`**

First law: the orbit is an ellipse with the star at one focus, not at the centre. e is the eccentricity the slider controls.

**`dA/dt = constant`**

Second law: equal areas in equal times. The shaded wedges are drawn at a fixed number of frames apart, so they are all the same area even though they look different.

**`T² ∝ a³`**

Third law. It is why the outer planets in the simulation crawl and the inner ones sprint, without that ever being programmed in.

## How it is implemented

The three laws are not coded. Only Newtonian gravity is, integrated with leapfrog (kick-drift-kick) at 64 sub-steps per frame, and the ellipses, the varying speed and the period ratios all fall out of it. Leapfrog conserves angular momentum exactly, which is why the swept wedges, drawn from the stored path at a fixed frame spacing, have equal areas to machine precision.

## What to look at

Your cursor is a second mass. Bring it near an orbit and you can pull a planet into a completely different one, or throw it out of the system entirely. That instability is the three-body problem in miniature.

## Why it matters

Kepler spent years fitting circles to Mars and failing by eight arcminutes. He trusted the data over the shape everyone assumed was perfect, and that decision is where modern astronomy starts.

## References

- J. Kepler, Astronomia Nova (1609).
- E. Hairer, C. Lubich, G. Wanner, Geometric Numerical Integration, 2nd ed., Springer (2006).

---

## En español: Órbitas de Kepler

> Los planetas no se mueven a velocidad constante y sus órbitas no son círculos. Kepler dedujo eso solo de las tablas de Tycho, décadas antes de que alguien pudiera explicar por qué.

### El modelo

**`r = a(1 − e²)/(1 + e·cos θ)`**

Primera ley: la órbita es una elipse con la estrella en un foco, no en el centro. e es la excentricidad que controla el deslizador.

**`dA/dt = constant`**

Segunda ley: áreas iguales en tiempos iguales. Las cuñas sombreadas se dibujan separadas por un número fijo de frames, así que todas tienen la misma área aunque se vean distintas.

**`T² ∝ a³`**

Tercera ley. Es la razón de que los planetas exteriores de la simulación se arrastren y los interiores corran, sin que eso esté programado en ninguna parte.

### Cómo está implementado

Las tres leyes no están programadas. Solo está la gravedad newtoniana, integrada con leapfrog (impulso-deriva-impulso) a 64 subpasos por frame, y las elipses, la velocidad variable y las razones de período salen todas de ahí. Leapfrog conserva exactamente el momento angular, y por eso las cuñas barridas, dibujadas desde el camino guardado con una separación fija de frames, tienen áreas iguales a precisión de máquina.

### Qué mirar

Tu cursor es una segunda masa. Acércalo a una órbita y puedes arrastrar un planeta a otra completamente distinta, o expulsarlo del sistema. Esa inestabilidad es el problema de los tres cuerpos en miniatura.

### Por qué importa

Kepler pasó años ajustando círculos a Marte y fallando por ocho minutos de arco. Le creyó a los datos por sobre la forma que todos daban por perfecta, y en esa decisión empieza la astronomía moderna.
