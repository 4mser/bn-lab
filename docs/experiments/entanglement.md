# Bell test

*Quantum mechanics* · `entanglement` · [source](../../src/experiments/entanglement.js)

> Two particles are measured far apart. Each result on its own is a coin flip. Put the two lists side by side and they agree more often than any theory where the answers were decided in advance could allow.

```js
import { mount } from 'phenomena';
import entanglement from 'phenomena/experiments/entanglement';

mount(document.querySelector('canvas'), entanglement, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `angA` | Detector A angle | 0 – 180 ° | 0 |
| `angB` | Detector B angle | 0 – 180 ° | 45 |
| `speed` | Pairs per frame | 1 – 200 | 40 |

## The model

**`E(a,b) = −cos(a − b)`**

The correlation predicted for a singlet state. It depends only on the difference between the two detector angles, never on either one alone.

**`S = |E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′)|`**

The CHSH combination of four measurement settings. Bell proved that any theory where the outcomes exist before measurement and nothing travels faster than light must keep this below 2.

**`S_max = 2√2 ≈ 2.828`**

What quantum mechanics gives at the optimal angles, and what experiments measure. The simulation converges here, above the classical ceiling.

## How it is implemented

Each pair is generated honestly: one side gets a fair coin flip, and the other agrees with probability (1 + E)/2 where E is the quantum correlation for that angle difference. Nothing is passed between the detectors in the code. Four angle settings run in parallel to accumulate the CHSH sum live.

## What to look at

The S value climbing past 2 and settling near 2.828. Also look at each detector on its own: the plus and minus signs are an even coin flip no matter what angle you set, which is exactly why this cannot be used to send a message.

## Why it matters

Einstein argued in 1935 that quantum mechanics had to be incomplete, that there must be hidden variables carrying the answers. Bell turned that argument into a number you can measure. Aspect, Clauser and Zeilinger measured it and shared the 2022 Nobel for closing the loopholes. The hidden variables are not there.

## References

- J. S. Bell, "On the Einstein Podolsky Rosen paradox", Physics 1 (1964) 195–200.

---

## En español: Test de Bell

> Dos particulas se miden lejos una de otra. Cada resultado por separado es una moneda al aire. Pon las dos listas lado a lado y coinciden mas seguido de lo que permitiria cualquier teoria donde las respuestas estuvieran decididas de antemano.

### El modelo

**`E(a,b) = −cos(a − b)`**

La correlacion predicha para un estado singlete. Depende solo de la diferencia entre los dos angulos de detector, nunca de ninguno por separado.

**`S = |E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′)|`**

La combinacion CHSH de cuatro ajustes de medicion. Bell demostro que cualquier teoria donde los resultados existan antes de medir y nada viaje mas rapido que la luz tiene que mantener esto bajo 2.

**`S_max = 2√2 ≈ 2.828`**

Lo que da la mecanica cuantica en los angulos optimos, y lo que miden los experimentos. La simulacion converge aca, por encima del techo clasico.

### Cómo está implementado

Cada par se genera de forma honesta: un lado recibe una moneda justa, y el otro coincide con probabilidad (1 + E)/2 donde E es la correlacion cuantica para esa diferencia de angulos. En el codigo no se pasa nada entre los detectores. Cuatro ajustes de angulo corren en paralelo para acumular la suma CHSH en vivo.

### Qué mirar

El valor de S subiendo mas alla de 2 y asentandose cerca de 2,828. Mira tambien cada detector por separado: los signos mas y menos son una moneda justa sin importar que angulo pongas, y por eso mismo esto no sirve para enviar un mensaje.

### Por qué importa

Einstein argumento en 1935 que la mecanica cuantica tenia que estar incompleta, que debian existir variables ocultas cargando las respuestas. Bell convirtio ese argumento en un numero que se puede medir. Aspect, Clauser y Zeilinger lo midieron y compartieron el Nobel 2022 por cerrar las escapatorias. Las variables ocultas no estan ahi.
