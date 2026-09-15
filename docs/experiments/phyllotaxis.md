# Phyllotaxis

*Botany and number theory* · `phyllotaxis` · [source](../../src/experiments/phyllotaxis.js)

> Place each new seed at a fixed angle from the last one and push it slightly further out. Almost every angle wastes space. One angle does not, and it is the one sunflowers use.

```js
import { mount } from 'phenomena';
import phyllotaxis from 'phenomena/experiments/phyllotaxis';

mount(document.querySelector('canvas'), phyllotaxis, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `angle` | Divergence angle | 130 – 145 ° | 137.507 |
| `count` | Seeds | 60 – 900 | 420 |
| `spread` | Spread | 0.01 – 0.06 | 0.028 |

## The model

**`φ = 137.507…°`**

The golden angle: 360° divided by the golden ratio squared. It is the most irrational number available, meaning it is the hardest to approximate with a fraction.

**`r = c√n,  θ = n·φ`**

Vogel's model. The square root is what keeps the density constant: area grows as r², so r must grow as √n for each seed to get the same room.

## How it is implemented

420 points, each drawn directly from the formula with no simulation and no state. The slow rotation is just a phase added to θ. Point size and opacity grow with the index so the outer ring reads as the newest growth.

## What to look at

Spirals appear that nobody placed. Count them and you get Fibonacci numbers, and the count changes depending on whether you follow the clockwise or the counterclockwise family.

## Why it matters

The plant is not doing number theory. It grows each primordium in the largest gap available, and that local greedy rule converges on the golden angle by itself. It is one of the cleanest cases of mathematics being discovered rather than invented.

## References

- H. Vogel, "A better way to construct the sunflower head", Math. Biosci. 44 (1979) 179–189.

---

## En español: Filotaxis

> Pon cada semilla nueva a un ángulo fijo de la anterior y empújala un poco más afuera. Casi cualquier ángulo desperdicia espacio. Un ángulo no, y es el que usan los girasoles.

### El modelo

**`φ = 137.507…°`**

El ángulo áureo: 360° dividido por la razón áurea al cuadrado. Es el número más irracional disponible, o sea el más difícil de aproximar con una fracción.

**`r = c√n,  θ = n·φ`**

El modelo de Vogel. La raíz cuadrada es lo que mantiene la densidad constante: el área crece como r², así que r debe crecer como √n para que cada semilla tenga el mismo espacio.

### Cómo está implementado

420 puntos, cada uno dibujado directamente de la fórmula sin simulación ni estado. La rotación lenta es solo una fase sumada a θ. El tamaño y la opacidad crecen con el índice para que el anillo exterior se lea como el crecimiento más nuevo.

### Qué mirar

Aparecen espirales que nadie puso. Cuéntalas y salen números de Fibonacci, y la cuenta cambia según si sigues la familia horaria o la antihoraria.

### Por qué importa

La planta no está haciendo teoría de números. Hace crecer cada primordio en el hueco más grande disponible, y esa regla local y codiciosa converge sola al ángulo áureo. Es uno de los casos más limpios de matemática que se descubre en vez de inventarse.
