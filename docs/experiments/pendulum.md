# Double pendulum

*Classical mechanics* · `pendulum` · [source](../../src/experiments/pendulum.js) · [numerically validated](../../validation/RESULTS.md)

> A pendulum hanging from another pendulum. Two rods, four numbers, and a system that no closed formula can solve. The first pendulum is predictable for centuries. Adding the second one breaks that permanently.

```js
import { mount } from 'phenomena';
import pendulum from 'phenomena/experiments/pendulum';

mount(document.querySelector('canvas'), pendulum, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `g` | Gravity | 0.1 – 2 | 0.6 |
| `damp` | Damping | 0.99 – 1 | 0.9999 |
| `m2` | Lower mass | 1 – 40 | 10 |

## The model

**`L = T − V`**

The Lagrangian: kinetic minus potential energy. The equations of motion come out of it rather than from drawing force diagrams.

**`d/dt (∂L/∂θ̇) − ∂L/∂θ = 0`**

Euler-Lagrange, applied to each angle. Expanding it for two coupled rods gives the pair of second-order equations the simulation integrates.

**`λ > 0`**

The Lyapunov exponent is positive, which is the formal definition of chaos: nearby trajectories separate exponentially rather than linearly.

## How it is implemented

The expanded equations are integrated with fourth-order Runge-Kutta, three steps of h = 0.05 per frame, with a damping factor of 0.9999 per step so the motion decays over minutes instead of running forever. With damping off, the validation suite measures the energy error of this scheme below 0.001 % over a minute. The tip leaves a 900-point trail that fades along its length.

## What to look at

The trail never repeats a shape. Grab the pendulum with the cursor and release it twice from what looks like the same spot: a sub-pixel difference in where you let go is enough, and within seconds the two runs have nothing in common.

## Why it matters

It is the cheapest demonstration that determinism and predictability are not the same thing. Every step follows from the previous one with no randomness anywhere, and it is still impossible to say where the tip will be in thirty seconds.

## References

- T. Shinbrot, C. Grebogi, J. Wisdom, J. A. Yorke, "Chaos in a double pendulum", Am. J. Phys. 60 (1992) 491–499.

---

## En español: Péndulo doble

> Un péndulo colgando de otro péndulo. Dos barras, cuatro números, y un sistema que ninguna fórmula cerrada resuelve. El primer péndulo es predecible por siglos. Agregar el segundo rompe eso para siempre.

### El modelo

**`L = T − V`**

El lagrangiano: energía cinética menos potencial. Las ecuaciones de movimiento salen de ahí en vez de dibujar diagramas de fuerzas.

**`d/dt (∂L/∂θ̇) − ∂L/∂θ = 0`**

Euler-Lagrange, aplicada a cada ángulo. Expandirla para dos barras acopladas da el par de ecuaciones de segundo orden que integra la simulación.

**`λ > 0`**

El exponente de Lyapunov es positivo, que es la definición formal de caos: las trayectorias cercanas se separan exponencialmente en vez de linealmente.

### Cómo está implementado

Las ecuaciones expandidas se integran con Runge-Kutta de cuarto orden, tres pasos de h = 0,05 por frame, con un factor de amortiguación de 0,9999 por paso para que el movimiento decaiga en minutos en vez de correr para siempre. Sin amortiguación, la suite de validación mide el error de energía de este esquema bajo 0,001 % en un minuto. La punta deja una estela de 900 puntos que se desvanece a lo largo.

### Qué mirar

La estela nunca repite una forma. Agarra el péndulo con el cursor y suéltalo dos veces desde lo que parece el mismo lugar: una diferencia de menos de un píxel en dónde lo sueltas basta, y en segundos las dos corridas no tienen nada en común.

### Por qué importa

Es la demostración más barata de que determinismo y predictibilidad no son lo mismo. Cada paso se deduce del anterior sin azar en ninguna parte, y aun así es imposible decir dónde estará la punta en treinta segundos.
