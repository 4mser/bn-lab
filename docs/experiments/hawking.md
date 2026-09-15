# Hawking radiation

*Black hole thermodynamics* · `hawking` · [source](../../src/experiments/hawking.js)

> Empty space is not empty: pairs of particles appear and annihilate constantly. Do that right at a horizon and sometimes one falls in while the other escapes, and the hole pays for it.

```js
import { mount } from 'bn-lab';
import hawking from 'bn-lab/experiments/hawking';

mount(document.querySelector('canvas'), hawking, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `mass` | Initial mass | 20 – 120 | 80 |
| `rate` | Evaporation rate | 0 – 3 | 0.6 |
| `pairs` | Pair density | 2 – 40 | 16 |

## The model

**`T = ħc³/(8πGMk_B)`**

The Hawking temperature, inversely proportional to mass. A hole the mass of the Sun is at 60 nanokelvin, colder than the cosmic background, so it absorbs more than it radiates.

**`L ∝ 1/M²`**

Luminosity. Losing mass raises the temperature, which raises the output, which loses mass faster. The process runs away instead of settling.

**`t_evap ∝ M³`**

Integrating that gives the lifetime. A solar mass hole would take 10⁶⁷ years, far longer than the age of the universe. A mountain-mass one would be ending about now.

## How it is implemented

Pairs are spawned at the horizon radius and separated: the outward one drifts away and fades, the inward one sinks. Mass is integrated with dM/dt proportional to minus one over M squared, which is what makes the collapse accelerate on its own. When the mass runs out there is a flash and it restarts.

## What to look at

The pace. It sits there for a long time barely radiating, and then the last stretch happens fast and ends in a burst. That asymmetry is the whole physics: the final second of a black hole releases more energy than everything before it.

## Why it matters

Hawking derived this in 1974 and it broke something. General relativity says a black hole has no properties beyond mass, charge and spin, so if it evaporates completely the information about what fell in appears to be gone, which quantum mechanics forbids. That paradox is still open.

## References

- S. W. Hawking, "Particle creation by black holes", Commun. Math. Phys. 43 (1975) 199–220.

---

## En español: Radiación de Hawking

> El espacio vacio no esta vacio: pares de particulas aparecen y se aniquilan constantemente. Haz eso justo en un horizonte y a veces una cae mientras la otra escapa, y el agujero lo paga.

### El modelo

**`T = ħc³/(8πGMk_B)`**

La temperatura de Hawking, inversamente proporcional a la masa. Un agujero con la masa del Sol esta a 60 nanokelvin, mas frio que el fondo cosmico, asi que absorbe mas de lo que radia.

**`L ∝ 1/M²`**

Luminosidad. Perder masa sube la temperatura, que sube la emision, que hace perder masa mas rapido. El proceso se dispara en vez de asentarse.

**`t_evap ∝ M³`**

Integrar eso da el tiempo de vida. Un agujero de masa solar tardaria 10⁶⁷ anos, mucho mas que la edad del universo. Uno con la masa de una montana estaria terminando ahora.

### Cómo está implementado

Los pares nacen en el radio del horizonte y se separan: el que va hacia afuera se aleja y se desvanece, el que va hacia adentro se hunde. La masa se integra con dM/dt proporcional a menos uno sobre M al cuadrado, que es lo que hace que el colapso se acelere solo. Cuando se acaba la masa hay un destello y vuelve a empezar.

### Qué mirar

El ritmo. Se queda ahi mucho rato apenas radiando, y despues el ultimo tramo pasa rapido y termina en un estallido. Esa asimetria es toda la fisica: el ultimo segundo de un agujero negro libera mas energia que todo lo anterior.

### Por qué importa

Hawking dedujo esto en 1974 y rompio algo. La relatividad general dice que un agujero negro no tiene mas propiedades que masa, carga y giro, asi que si se evapora del todo la informacion sobre lo que cayo parece haberse perdido, y la mecanica cuantica lo prohibe. Esa paradoja sigue abierta.
