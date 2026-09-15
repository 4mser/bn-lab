# A network thinking

*Neural networks* · `neural` · [source](../../src/experiments/neural.js)

> This is the picture people mean when they say a network activates. Two numbers go in on the left, and every neuron downstream lights up in proportion to how strongly it responds. The signal sweeps left to right, layer by layer.

```js
import { mount } from 'bn-lab';
import neural from 'bn-lab/experiments/neural';

mount(document.querySelector('canvas'), neural, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `depth` | Layers | 2 – 6 | 4 |
| `width` | Units per layer | 3 – 14 | 9 |
| `speed` | Signal speed | 0.2 – 3 | 1 |

## The model

**`a⁽ˡ⁾ = tanh(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)`**

One layer. A matrix multiply, a bias, and a squashing function. Stack it and that is the whole forward pass.

**`tanh(z) ∈ (−1, 1)`**

The squashing is what matters. Without it every layer collapses into a single linear map and depth buys you nothing at all.

**`flow ∝ |w·a|`**

What the edges draw. A connection is bright when it has both a large weight and an active source, which is what makes some paths through the network visibly dominate.

## How it is implemented

Weights are random rather than trained: the point here is the shape of the computation, not the answer. Each frame runs a full forward pass, then draws every connection with opacity proportional to how much signal is flowing through it and every node sized by its activation. A sweeping front gates the layers so you can see the order things happen in.

## What to look at

Move the cursor: it is the input. Small moves near the middle barely change anything and then a whole branch of the network suddenly switches sign. That sensitivity is where nonlinearity lives, and it is why a network can do things a straight line cannot.

## Why it matters

Every large model is this picture with more layers and vastly more nodes. Nothing else about the mechanism changes: numbers come in, get multiplied by weights, get squashed, and move right. Seeing it at nine neurons per layer makes the rest less mysterious.

## References

- D. E. Rumelhart, G. E. Hinton, R. J. Williams, "Learning representations by back-propagating errors", Nature 323 (1986) 533–536.

---

## En español: Una red pensando

> Esta es la imagen que la gente tiene en mente cuando dice que una red se activa. Dos numeros entran por la izquierda, y cada neurona rio abajo se enciende en proporcion a cuanto responde. La senal barre de izquierda a derecha, capa por capa.

### El modelo

**`a⁽ˡ⁾ = tanh(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)`**

Una capa. Una multiplicacion de matriz, un sesgo, y una funcion que aplasta. Apilala y eso es todo el paso hacia adelante.

**`tanh(z) ∈ (−1, 1)`**

El aplastamiento es lo que importa. Sin el cada capa colapsa en un solo mapa lineal y la profundidad no te compra nada.

**`flow ∝ |w·a|`**

Lo que dibujan las aristas. Una conexion brilla cuando tiene a la vez un peso grande y una fuente activa, y eso es lo que hace que algunos caminos por la red dominen a la vista.

### Cómo está implementado

Los pesos son aleatorios y no entrenados: aca lo que importa es la forma del computo, no la respuesta. Cada frame corre un paso hacia adelante completo, y despues dibuja cada conexion con opacidad proporcional a cuanta senal pasa por ella y cada nodo con tamano segun su activacion. Un frente que barre habilita las capas para que se vea el orden en que ocurren las cosas.

### Qué mirar

Mueve el cursor: es la entrada. Movimientos chicos cerca del centro casi no cambian nada y de pronto una rama entera de la red cambia de signo. Esa sensibilidad es donde vive la no linealidad, y es la razon de que una red pueda hacer cosas que una recta no.

### Por qué importa

Todo modelo grande es esta misma imagen con mas capas y muchisimos mas nodos. Nada mas del mecanismo cambia: entran numeros, se multiplican por pesos, se aplastan, y avanzan a la derecha. Verlo con nueve neuronas por capa hace que el resto sea menos misterioso.
