# Particle in a box

*Quantum mechanics* · `quantum` · [source](../../src/experiments/quantum.js)

> Trap a particle between two walls and it can only have certain energies. Put it in two of them at once and the probability starts sloshing back and forth, forever, with no energy going anywhere.

```js
import { mount } from 'phenomena';
import quantum from 'phenomena/experiments/quantum';

mount(document.querySelector('canvas'), quantum, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `n1` | State n₁ | 1 – 6 | 1 |
| `n2` | State n₂ | 1 – 8 | 2 |
| `mix` | Mix | 0 – 1 | 0.5 |

## The model

**`φₙ(x) = √(2/L)·sin(nπx/L)`**

The stationary states of an infinite well. They are the only shapes that fit with zero at both walls, which is why n has to be a whole number.

**`Eₙ = n²π²ħ²/2mL²`**

Energy grows as n², not n. That quadratic gap is what makes the two states beat against each other at a visible rate.

**`ψ = a·φ₁e^(−iE₁t/ħ) + b·φ₂e^(−iE₂t/ħ)`**

A superposition. Each piece rotates in the complex plane at its own rate, and the interference between them is the motion you see.

## How it is implemented

No integration at all: the solution is exact, so each frame evaluates the closed form at 220 points. Three curves are drawn: the real part, the imaginary part, and |ψ|² on top. The first two are not observable and are drawn faint on purpose.

## What to look at

Set n₁ and n₂ to the same number and the motion stops dead: a single stationary state has a probability that does not depend on time. That is what stationary means, and it is why atoms do not radiate away.

## Why it matters

This is the simplest system where quantisation falls out of the maths instead of being assumed. The walls are what force it: confinement plus a wave equation gives discrete energies, and that is the origin of every atomic spectrum ever measured.

## References

- E. Schrödinger, "Quantisierung als Eigenwertproblem", Ann. Phys. 79 (1926) 361–376.

---

## En español: Partícula en una caja

> Atrapa una partícula entre dos paredes y solo puede tener ciertas energías. Ponla en dos de ellas a la vez y la probabilidad empieza a chapotear de un lado a otro, para siempre, sin que la energía vaya a ninguna parte.

### El modelo

**`φₙ(x) = √(2/L)·sin(nπx/L)`**

Los estados estacionarios de un pozo infinito. Son las únicas formas que calzan con cero en las dos paredes, y por eso n tiene que ser entero.

**`Eₙ = n²π²ħ²/2mL²`**

La energía crece como n², no como n. Esa separación cuadrática es lo que hace que los dos estados batan entre sí a un ritmo visible.

**`ψ = a·φ₁e^(−iE₁t/ħ) + b·φ₂e^(−iE₂t/ħ)`**

Una superposición. Cada pieza rota en el plano complejo a su propio ritmo, y la interferencia entre ellas es el movimiento que ves.

### Cómo está implementado

Sin integración de ningún tipo: la solución es exacta, así que cada frame evalúa la forma cerrada en 220 puntos. Se dibujan tres curvas: la parte real, la imaginaria, y |ψ|² encima. Las dos primeras no son observables y se dibujan tenues a propósito.

### Qué mirar

Pon n₁ y n₂ en el mismo número y el movimiento se detiene en seco: un solo estado estacionario tiene una probabilidad que no depende del tiempo. Eso es lo que significa estacionario, y es la razón de que los átomos no se desintegren radiando.

### Por qué importa

Este es el sistema más simple donde la cuantización sale de las matemáticas en vez de suponerse. Las paredes son las que la fuerzan: confinamiento más una ecuación de onda da energías discretas, y ese es el origen de todo espectro atómico jamás medido.
