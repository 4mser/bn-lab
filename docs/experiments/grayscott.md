# Reaction and diffusion

*Reaction–diffusion* · `grayscott` · [source](../../src/experiments/grayscott.js)

> Two chemicals spreading and eating each other. Four numbers decide whether you get spots, stripes, a maze, or blobs that split like cells. Turing wrote the equations in 1952 to ask how an animal decides where to put its markings.

```js
import { mount } from 'phenomena';
import grayscott from 'phenomena/experiments/grayscott';

mount(document.querySelector('canvas'), grayscott, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `F` | Feed F | 0.01 – 0.08 | 0.037 |
| `k` | Kill k | 0.045 – 0.07 | 0.06 |
| `it` | Steps per frame | 1 – 14 | 6 |

## The model

**`∂U/∂t = Du∇²U − UV² + F(1−U)`**

U diffuses, gets eaten by the reaction UV², and is topped back up toward 1 at rate F. That last term is the feed: without it the system runs out and dies flat.

**`∂V/∂t = Dv∇²V + UV² − (F+k)V`**

V is produced by the same reaction that consumes U, which makes it autocatalytic: V needs V to make more V. It is removed at rate F+k. The entire zoo of patterns lives in the balance between that self-feeding and that removal.

**`Du / Dv = 2`**

The one condition that makes patterns possible: the inhibitor must spread faster than the activator. If they diffused at the same rate the sheet would stay uniform forever. Turing called it diffusion-driven instability, and it is deeply counterintuitive, because diffusion is supposed to smooth things out.

**`∇²U ≈ U↑ + U↓ + U← + U→ − 4U`**

The Laplacian on a grid, five points. It measures how much a cell differs from the average of its neighbours: positive if it sits in a dip, negative on a bump. That single number is all the geometry the simulation ever knows.

## How it is implemented

A 150×150 grid of two Float32Arrays, explicit Euler in time, five-point Laplacian in space. Two extra buffers hold the next state so a cell never reads a half-updated neighbour, and the pairs get swapped instead of copied. It runs several steps per frame because the timestep has to stay small for the integration to be stable.

## What to look at

Draw on it with the cursor: you are injecting V, and whatever you draw grows into the pattern the parameters allow. Then move k slowly. Around F=0.037, k=0.06 you get spots that divide like bacteria. Push k up and they freeze into a static maze. Push it down and everything floods.

## Why it matters

Turing published this the year before he died, and it is the least famous of his big ideas. It gives a mechanism for how an undifferentiated sheet of cells can end up with stripes in the right places without any cell being told the plan. Zebrafish stripe mutants have since been shown to behave the way the equations predict.

## References

- P. Gray, S. K. Scott, "Autocatalytic reactions in the isothermal, continuous stirred tank reactor", Chem. Eng. Sci. 38 (1983) 29–43.
- J. E. Pearson, "Complex patterns in a simple system", Science 261 (1993) 189–192.

---

## En español: Reacción y difusión

> Dos químicos que se difunden y se comen entre ellos. Cuatro números deciden si salen manchas, rayas, un laberinto, o gotas que se dividen como células. Turing escribió las ecuaciones en 1952 para preguntarse cómo un animal decide dónde ponerse sus manchas.

### El modelo

**`∂U/∂t = Du∇²U − UV² + F(1−U)`**

U se difunde, es consumido por la reacción UV², y se repone hacia 1 a una tasa F. Ese último término es la alimentación: sin él el sistema se agota y muere plano.

**`∂V/∂t = Dv∇²V + UV² − (F+k)V`**

V se produce por la misma reacción que consume U, lo que la hace autocatalítica: V necesita V para hacer más V. Se remueve a una tasa F+k. Todo el zoológico de patrones vive en el equilibrio entre esa autoalimentación y esa remoción.

**`Du / Dv = 2`**

La única condición que hace posibles los patrones: el inhibidor debe esparcirse más rápido que el activador. Si se difundieran al mismo ritmo la lámina quedaría uniforme para siempre. Turing lo llamó inestabilidad inducida por difusión, y es profundamente contraintuitivo, porque se supone que la difusión suaviza.

**`∇²U ≈ U↑ + U↓ + U← + U→ − 4U`**

El laplaciano en una rejilla, cinco puntos. Mide cuánto difiere una celda del promedio de sus vecinas: positivo si está en un hoyo, negativo en un montículo. Ese único número es toda la geometría que la simulación llega a conocer.

### Cómo está implementado

Una rejilla de 150×150 con dos Float32Array, Euler explícito en el tiempo y laplaciano de cinco puntos en el espacio. Dos búferes extra guardan el estado siguiente para que una celda nunca lea a una vecina a medio actualizar, y los pares se intercambian en vez de copiarse. Corre varios pasos por frame porque el paso de tiempo tiene que ser chico para que la integración sea estable.

### Qué mirar

Dibuja encima con el cursor: estás inyectando V, y lo que dibujes crece hacia el patrón que los parámetros permitan. Después mueve k despacio. Cerca de F=0.037, k=0.06 salen manchas que se dividen como bacterias. Sube k y se congelan en un laberinto estático. Bájala y todo se inunda.

### Por qué importa

Turing publicó esto el año antes de morir, y es la menos famosa de sus grandes ideas. Da un mecanismo para que una lámina de células indiferenciadas termine con rayas en los lugares correctos sin que ninguna célula conozca el plan. Después se demostró que los mutantes de rayas del pez cebra se comportan como predicen las ecuaciones.
