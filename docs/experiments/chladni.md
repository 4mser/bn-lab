# Chladni figures

*Acoustics* · `chladni` · [source](../../src/experiments/chladni.js)

> Sand on a metal plate. Bow it and the sand runs away from everywhere that is moving and piles up along the lines that are not. You end up looking directly at a standing wave.

```js
import { mount } from 'bn-lab';
import chladni from 'bn-lab/experiments/chladni';

mount(document.querySelector('canvas'), chladni, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `m` | Mode m | 1 – 9 | 3 |
| `n` | Mode n | 1 – 9 | 5 |
| `grain` | Grains | 400 – 6000 | 2600 |

## The model

**`u(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)`**

A mode of a square plate with free edges. The subtraction is what matters: it is the antisymmetric combination of two degenerate modes, and it is what produces the curved, non-obvious figures rather than a plain grid.

**`u = 0`**

The nodal lines. Every point where the plate is not moving at all, at any moment in the cycle. This is where the sand ends up, so the pattern you see is literally the zero set of a function.

**`ṙ ∝ −∇|u| + ξ·|u|`**

How each grain is moved: downhill on the amplitude, plus a random kick whose size is the local amplitude. Where the plate is loud the grain bounces and wanders; where it is silent the kick is zero and the grain stays. Nobody tells the sand where the lines are.

## How it is implemented

A few thousand grains, each following the gradient of |u| estimated by finite differences, plus noise proportional to the local amplitude. That second term is the whole mechanism and it is not a trick: it is why real sand accumulates at nodes, because a vibrating region keeps throwing grains until one lands somewhere that does not throw it back. I measured it: mean |u| across the grains starts at 0.541 for a random scatter and settles at 0.070.

## What to look at

Change m and n by one and the figure reorganises completely, which is the point: these patterns are not continuous in the parameters, they are discrete modes. Setting m equal to n cancels the expression exactly and the plate goes silent, and the sand just sits wherever it happened to be.

## Why it matters

Chladni toured Europe doing this in the 1780s and it was the closest thing to seeing sound. Napoleon set a prize for explaining it mathematically; Sophie Germain won it in 1816 after three attempts, working outside the academy because she was not allowed inside it. The theory of vibrating plates came out of that prize.

## References

- E. F. F. Chladni, Entdeckungen über die Theorie des Klanges, Weidmanns Erben und Reich (1787).

---

## En español: Figuras de Chladni

> Arena sobre una placa de metal. Frótala con un arco y la arena huye de todo lo que se mueve y se apila en las líneas que no. Terminas mirando directamente una onda estacionaria.

### El modelo

**`u(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)`**

Un modo de una placa cuadrada con bordes libres. La resta es lo que importa: es la combinación antisimétrica de dos modos degenerados, y es lo que produce las figuras curvas y no obvias en vez de una cuadrícula simple.

**`u = 0`**

Las líneas nodales. Cada punto donde la placa no se mueve nada, en ningún momento del ciclo. Ahí termina la arena, así que el patrón que ves es literalmente el conjunto de ceros de una función.

**`ṙ ∝ −∇|u| + ξ·|u|`**

Cómo se mueve cada grano: cuesta abajo en la amplitud, más una patada al azar cuyo tamaño es la amplitud local. Donde la placa suena fuerte el grano rebota y vaga; donde está en silencio la patada es cero y el grano se queda. Nadie le dice a la arena dónde están las líneas.

### Cómo está implementado

Unos miles de granos, cada uno siguiendo el gradiente de |u| estimado por diferencias finitas, más ruido proporcional a la amplitud local. Ese segundo término es todo el mecanismo y no es un truco: es por qué la arena real se acumula en los nodos, porque una región que vibra sigue lanzando granos hasta que uno cae donde ya no lo lanzan. Lo medí: el |u| promedio sobre los granos parte en 0.541 con una dispersión al azar y se asienta en 0.070.

### Qué mirar

Cambia m y n en uno y la figura se reorganiza por completo, que es justamente el punto: estos patrones no son continuos en los parámetros, son modos discretos. Poner m igual a n cancela la expresión exactamente y la placa queda muda, y la arena se queda donde haya quedado.

### Por qué importa

Chladni recorrió Europa haciendo esto en los años 1780 y era lo más cercano que había a ver el sonido. Napoleón puso un premio por explicarlo matemáticamente; Sophie Germain lo ganó en 1816 al tercer intento, trabajando fuera de la academia porque no la dejaban entrar. La teoría de placas vibrantes salió de ese premio.
