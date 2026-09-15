# Ising model

*Statistical physics* · `ising` · [source](../../src/experiments/ising.js) · [numerically validated](../../validation/RESULTS.md)

> A sheet of arrows that only care about their four neighbours. Warm it and they argue. Cool it and at one precise temperature the entire sheet picks a side at once, with nothing telling it to.

```js
import { mount } from 'bn-lab-simulations';
import ising from 'bn-lab-simulations/experiments/ising';

mount(document.querySelector('canvas'), ising, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `T` | Temperature T | 0.4 – 5 | 2.6 |
| `B` | External field | -0.5 – 0.5 | 0 |
| `sw` | Sweeps per frame | 1 – 40 | 12 |

## The model

**`E = −Σ⟨ij⟩ sᵢsⱼ − B Σᵢ sᵢ`**

The energy of the whole sheet. Neighbours that agree cost less; the second term is an external field that bribes everyone toward one side. There is no long-range term anywhere: every interaction is between touching neighbours.

**`ΔE = 2sᵢ(Σ vecinos + B)`**

Flipping one spin changes the energy by exactly this. It only needs the four neighbours, which is why the simulation is cheap: the cost of a move is local even though the effect is not.

**`P(aceptar) = min(1, e^−ΔE/T)`**

The Metropolis rule. Downhill moves always happen; uphill moves happen with a probability that collapses as the temperature drops. The whole phase transition comes out of this single exponential.

**`T_c = 2 / ln(1+√2) = 2.269…`**

Onsager solved the two-dimensional model exactly in 1944 and this number fell out. It is not fitted or measured here: it is a closed form, and the simulation lands on it. Run the sweep and the magnetisation holds near 1 below it and collapses above.

## How it is implemented

Metropolis Monte Carlo on a grid with periodic edges. Each frame proposes thousands of random flips and accepts them by the exponential above. One detail matters more than it looks: the grid starts fully ordered, not random. Starting from noise at low temperature freezes domains that would take astronomically long to merge, and the magnetisation readout would sit near zero and lie to you about the transition. I measured both: ordered start gives 1.000 / 0.960 / 0.874 / 0.657 at T = 1.0 / 1.8 / 2.1 / 2.269, which is the textbook curve. A quench from noise gets stuck around 0.1 at every temperature below T_c.

## What to look at

Move the cursor left and right over the canvas: that sweeps the temperature directly, overriding the slider. Cross 2.269 and watch the trace at the bottom fall off a cliff. Near the critical point look at the grid itself, where you get domains of every size at once, from a few pixels to the whole frame. That scale-free look is the signature of criticality.

## Why it matters

This is the simplest thing that has a phase transition, and it was the first one anybody solved exactly. Its importance is universality: near the critical point, a magnet, a liquid boiling and a binary alloy separating all follow the same exponents, and the microscopic details wash out. It is the reason physicists believe that some collective behaviour does not care what it is made of.

## References

- E. Ising, "Beitrag zur Theorie des Ferromagnetismus", Z. Phys. 31 (1925) 253–258.
- L. Onsager, "Crystal statistics. I. A two-dimensional model with an order-disorder transition", Phys. Rev. 65 (1944) 117–149.
- C. N. Yang, "The spontaneous magnetization of a two-dimensional Ising model", Phys. Rev. 85 (1952) 808–816.
- N. Metropolis, A. W. Rosenbluth, M. N. Rosenbluth, A. H. Teller, E. Teller, "Equation of state calculations by fast computing machines", J. Chem. Phys. 21 (1953) 1087–1092.

---

## En español: Modelo de Ising

> Una lámina de flechas a las que solo les importan sus cuatro vecinos. Caliéntala y discuten. Enfríala y a una temperatura precisa la lámina entera elige un bando de golpe, sin que nadie se lo ordene.

### El modelo

**`E = −Σ⟨ij⟩ sᵢsⱼ − B Σᵢ sᵢ`**

La energía de toda la lámina. Los vecinos que coinciden cuestan menos; el segundo término es un campo externo que soborna a todos hacia un lado. No hay ningún término de largo alcance: toda interacción es entre vecinos que se tocan.

**`ΔE = 2sᵢ(Σ vecinos + B)`**

Dar vuelta un espín cambia la energía exactamente en esto. Solo necesita los cuatro vecinos, y por eso la simulación es barata: el costo de un movimiento es local aunque el efecto no lo sea.

**`P(aceptar) = min(1, e^−ΔE/T)`**

La regla de Metropolis. Los movimientos que bajan la energía siempre ocurren; los que la suben ocurren con una probabilidad que se desploma al bajar la temperatura. La transición de fase entera sale de esa única exponencial.

**`T_c = 2 / ln(1+√2) = 2.269…`**

Onsager resolvió el modelo bidimensional exactamente en 1944 y este número salió de ahí. No está ajustado ni medido acá: es una forma cerrada, y la simulación cae en ella. Corre el barrido y la magnetización se queda cerca de 1 por debajo y se desploma por encima.

### Cómo está implementado

Monte Carlo de Metropolis sobre una rejilla con bordes periódicos. Cada frame propone miles de volteos al azar y los acepta con la exponencial de arriba. Un detalle importa más de lo que parece: la rejilla arranca completamente ordenada, no al azar. Partir del ruido a baja temperatura congela dominios que tardarían tiempos astronómicos en fusionarse, y la magnetización se quedaría cerca de cero mintiéndote sobre la transición. Medí las dos: con arranque ordenado da 1.000 / 0.960 / 0.874 / 0.657 a T = 1.0 / 1.8 / 2.1 / 2.269, que es la curva de libro. Un enfriamiento brusco desde ruido se queda pegado cerca de 0.1 a cualquier temperatura bajo T_c.

### Qué mirar

Mueve el cursor de izquierda a derecha sobre el canvas: eso barre la temperatura directamente, por encima del deslizador. Cruza 2.269 y mira cómo la traza de abajo se cae por un acantilado. Cerca del punto crítico fíjate en la rejilla misma: aparecen dominios de todos los tamaños a la vez, desde unos pocos píxeles hasta el cuadro entero. Ese aspecto sin escala propia es la firma de la criticalidad.

### Por qué importa

Es lo más simple que tiene una transición de fase, y fue lo primero que alguien resolvió exactamente. Su importancia es la universalidad: cerca del punto crítico, un imán, un líquido hirviendo y una aleación separándose siguen los mismos exponentes, y los detalles microscópicos se borran. Es la razón por la que los físicos creen que cierto comportamiento colectivo no depende de en qué esté hecho.
