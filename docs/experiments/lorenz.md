# Lorenz attractor

*Chaos theory* · `lorenz` · [source](../../src/experiments/lorenz.js) · [numerically validated](../../validation/RESULTS.md)

> Three equations with no randomness in them. Run them twice from almost the same starting point and the two paths diverge until they have nothing to do with each other. Nothing was added: the divergence was already in the equations.

```js
import { mount } from 'bn-lab-simulations';
import lorenz from 'bn-lab-simulations/experiments/lorenz';

mount(document.querySelector('canvas'), lorenz, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `rho` | Rayleigh ρ | 1 – 60 | 28 |
| `sigma` | Prandtl σ | 1 – 20 | 10 |
| `beta` | Geometry β | 0.5 – 5 | 2.6667 |

## The model

**`dx/dt = σ(y − x)`**

σ is the Prandtl number. This term pulls x toward y at a rate set by the fluid viscosity.

**`dy/dt = x(ρ − z) − y`**

ρ is the Rayleigh number, the temperature difference driving the convection. Above ρ ≈ 24.74 the system stops settling and never repeats.

**`dz/dt = xy − βz`**

β is a geometric factor. The classic values are σ=10, ρ=28, β=8/3, which is what runs here.

## How it is implemented

Classical fourth-order Runge-Kutta with dt = 0.005, fourteen steps per frame so the curve advances at a readable speed. The trail keeps the last 2,600 points and fades along its length. The projection is simply x on screen-x and z on screen-y: the famous butterfly is the shadow of a three-dimensional curve. The validation suite measures the largest Lyapunov exponent of this exact scheme against the published value.

## What to look at

The curve never crosses itself and never closes. It orbits one wing an unpredictable number of times, jumps to the other, and comes back. Which wing it picks next is the part nobody can compute in advance.

## Why it matters

Lorenz found it in 1963 by restarting a weather simulation from a printout rounded to three decimals instead of six. The forecast came out completely different. That accident is why we have a word for the butterfly effect and why weather forecasts have a horizon.

## References

- E. N. Lorenz, "Deterministic nonperiodic flow", J. Atmos. Sci. 20 (1963) 130–141.
- G. Benettin, L. Galgani, A. Giorgilli, J.-M. Strelcyn, "Lyapunov characteristic exponents for smooth dynamical systems and for Hamiltonian systems", Meccanica 15 (1980) 9–20.
- J. C. Sprott, Chaos and Time-Series Analysis, Oxford University Press (2003).

---

## En español: Atractor de Lorenz

> Tres ecuaciones sin nada de azar dentro. Córrelas dos veces desde puntos de partida casi iguales y las dos trayectorias divergen hasta no tener nada que ver. No se agregó nada: la divergencia ya estaba en las ecuaciones.

### El modelo

**`dx/dt = σ(y − x)`**

σ es el número de Prandtl. Este término tira de x hacia y a una tasa que fija la viscosidad del fluido.

**`dy/dt = x(ρ − z) − y`**

ρ es el número de Rayleigh, la diferencia de temperatura que impulsa la convección. Sobre ρ ≈ 24,74 el sistema deja de asentarse y no se repite nunca.

**`dz/dt = xy − βz`**

β es un factor geométrico. Los valores clásicos son σ=10, ρ=28, β=8/3, que son los que corren aquí.

### Cómo está implementado

Runge-Kutta clásico de cuarto orden con dt = 0,005, catorce pasos por frame para que la curva avance a una velocidad legible. La estela guarda los últimos 2.600 puntos y se desvanece a lo largo. La proyección es simplemente x en la x de pantalla y z en la y: la famosa mariposa es la sombra de una curva tridimensional. La suite de validación mide el mayor exponente de Lyapunov de este mismo esquema contra el valor publicado.

### Qué mirar

La curva nunca se cruza a sí misma y nunca se cierra. Orbita un ala un número impredecible de veces, salta a la otra, y vuelve. Cuál ala elige después es la parte que nadie puede calcular por adelantado.

### Por qué importa

Lorenz lo encontró en 1963 al reiniciar una simulación del clima desde una impresión redondeada a tres decimales en vez de seis. El pronóstico salió completamente distinto. Ese accidente es la razón de que exista la expresión efecto mariposa y de que los pronósticos del tiempo tengan un horizonte.
