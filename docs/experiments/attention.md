# Attention

*Machine learning* · `attention` · [source](../../src/experiments/attention.js)

> The one operation underneath every language model. Each word builds a query, every other word offers a key, and the match decides who gets listened to. Everything else in a transformer is plumbing around this.

```js
import { mount } from 'bn-lab-simulations';
import attention from 'bn-lab-simulations/experiments/attention';

mount(document.querySelector('canvas'), attention, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `temp` | Softmax sharpness | 0.2 – 4 | 1 |
| `head` | Head | 0 – 3 | 0 |
| `row` | Focus token | -1 – 9 | -1 |

## The model

**`Atención(Q,K,V) = softmax(QKᵀ/√d)·V`**

The whole thing, in one line. QKᵀ is every query dotted with every key, giving a square matrix of raw affinities. Softmax turns each row into a set of weights that sum to one, and those weights mix the values.

**`softmax(x)ᵢ = e^xᵢ / Σⱼ e^xⱼ`**

Turns any list of numbers into a probability distribution. It is computed here after subtracting the row maximum, which changes nothing mathematically and prevents e^x from overflowing.

**`÷ √d`**

The detail people skip. Dot products of d-dimensional vectors grow like √d, so without this the softmax input gets large, the exponential saturates, and every row becomes almost one-hot with almost no gradient. Dividing by √d keeps the variance at 1 and the model trainable.

**`multi-cabeza`**

The same sentence is projected several times with different weights, so each head can attend to a different kind of relation: one tracks syntax, another tracks what a pronoun refers to. Switching heads here changes the projection matrix and nothing else.

## How it is implemented

Honest about what this is: the sentence and its four-dimensional vectors are hand-written, not learned. The dimensions mean animal, furniture, action and reference, and the four heads are fixed permutation-style matrices. It is a mechanism demo, not a model. The arithmetic, though, is exactly what runs inside a real transformer: same projections, same scaled dot product, same softmax. I checked that every row of the matrix sums to 1.000000.

## What to look at

Hover over a row to isolate one word and see the arcs of who it is looking at. Then drag sharpness down toward 0.2: the attention spreads until every word listens to everything equally, which is the same as listening to nothing. Push it up and it collapses to a single hard pointer.

## Why it matters

This replaced recurrence in 2017 and everything since is built on it. The reason it won is not accuracy, it is shape: every pair of positions is compared in one step, with no sequential dependency, so the whole thing parallelises across a GPU. Recurrent networks could not, and that is the entire story of the last decade of scale.

## References

- A. Vaswani et al., "Attention is all you need", Advances in Neural Information Processing Systems 30 (2017). arXiv:1706.03762.

---

## En español: Atención

> La única operación debajo de todo modelo de lenguaje. Cada palabra arma una consulta, todas las demás ofrecen una clave, y la coincidencia decide a quién se escucha. Todo lo demás en un transformer es plomería alrededor de esto.

### El modelo

**`Atención(Q,K,V) = softmax(QKᵀ/√d)·V`**

Todo, en una línea. QKᵀ es cada consulta multiplicada por cada clave, lo que da una matriz cuadrada de afinidades crudas. El softmax convierte cada fila en pesos que suman uno, y esos pesos mezclan los valores.

**`softmax(x)ᵢ = e^xᵢ / Σⱼ e^xⱼ`**

Convierte cualquier lista de números en una distribución de probabilidad. Acá se calcula después de restar el máximo de la fila, lo que no cambia nada matemáticamente y evita que e^x se desborde.

**`÷ √d`**

El detalle que la gente se salta. Los productos punto de vectores de d dimensiones crecen como √d, así que sin esto la entrada del softmax se hace grande, la exponencial se satura, y cada fila queda casi one-hot y casi sin gradiente. Dividir por √d mantiene la varianza en 1 y el modelo entrenable.

**`multi-cabeza`**

La misma frase se proyecta varias veces con pesos distintos, así cada cabeza puede atender a un tipo de relación distinto: una sigue la sintaxis, otra sigue a qué se refiere un pronombre. Cambiar de cabeza acá cambia la matriz de proyección y nada más.

### Cómo está implementado

Honesto sobre lo que es: la frase y sus vectores de cuatro dimensiones están escritos a mano, no aprendidos. Las dimensiones significan animal, mueble, acción y referencia, y las cuatro cabezas son matrices fijas tipo permutación. Es una demostración del mecanismo, no un modelo. La aritmética, eso sí, es exactamente la que corre dentro de un transformer real: mismas proyecciones, mismo producto punto escalado, mismo softmax. Verifiqué que cada fila de la matriz suma 1.000000.

### Qué mirar

Pasa el cursor sobre una fila para aislar una palabra y ver los arcos de a quién está mirando. Después baja la nitidez hacia 0.2: la atención se reparte hasta que cada palabra escucha todo por igual, que es lo mismo que no escuchar nada. Súbela y colapsa a un único puntero duro.

### Por qué importa

Esto reemplazó a la recurrencia en 2017 y todo lo que vino después está construido encima. La razón por la que ganó no es la precisión, es la forma: cada par de posiciones se compara en un solo paso, sin dependencia secuencial, así que todo se paraleliza en una GPU. Las redes recurrentes no podían, y esa es la historia entera de la última década de escala.
