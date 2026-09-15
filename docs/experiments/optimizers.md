# How a model learns

*Machine learning* · `optimizers` · [source](../../src/experiments/optimizers.js)

> Training is one thing repeated a lot: look at the slope, take a step. Three ways of taking that step, released on the same surface from the same point, with the same learning rate.

```js
import { mount } from 'phenomena';
import optimizers from 'phenomena/experiments/optimizers';

mount(document.querySelector('canvas'), optimizers, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `lr` | Learning rate | 0.001 – 0.06 | 0.012 |
| `land` | Landscape | 0 – 2 | 0 |
| `run` | Restart | 0 – 1 | 0 |

## The model

**`θ ← θ − η∇L`**

Plain gradient descent. Step downhill, proportional to the slope. When the slope is nearly flat the step is nearly nothing, which is exactly the failure you can watch on the saddle.

**`v ← βv − η∇L,   θ ← θ + v`**

Momentum. The step keeps a memory of the previous steps, so consistent directions accumulate and oscillations across a narrow valley cancel out. β = 0.9 means roughly the last ten gradients are still contributing.

**`m ← β₁m + (1−β₁)g,   s ← β₂s + (1−β₂)g²`**

Adam tracks two running averages: the mean of the gradient and the mean of its square. The first is momentum, the second is a per-coordinate estimate of how steep that direction usually is.

**`θ ← θ − η · m̂ / (√ŝ + ε)`**

Dividing by the typical magnitude makes the step size roughly the same in every direction, no matter how differently scaled they are. That is why Adam crosses a flat saddle fast: a tiny gradient divided by a tiny typical gradient is still order one.

## How it is implemented

Gradients come from a central finite difference, not by hand, so swapping in a new landscape needs no new derivation. The three runners share a step budget and a learning rate; only the update rule differs. Each landscape starts somewhere its lesson is visible, and those starting points were measured rather than guessed: on the bumpy bowl every start I tried first sent all three into the same hole, which demonstrates nothing.

## What to look at

Switch to the saddle. The gradient along the ridge is nearly zero, and the three separate hard: Adam gets off it at step 11, momentum at 64, plain descent at 315. Those are measured, not illustrative. Then switch to the bumpy bowl, where momentum is the only one that carries enough speed to roll out of the first trap and ends at loss −2.72 while the other two sit at 1.12.

## Why it matters

Every trained model you have used came out of this loop, just with millions of coordinates instead of two. The reason Adam became the default is not that it finds better minima, it is that it needs far less tuning of the learning rate to not fail, and at the scale where one run costs a fortune, not failing is the whole game.

## References

- B. T. Polyak, "Some methods of speeding up the convergence of iteration methods", USSR Comput. Math. Math. Phys. 4(5) (1964) 1–17.
- D. P. Kingma, J. Ba, "Adam: A method for stochastic optimization", ICLR (2015). arXiv:1412.6980.

---

## En español: Cómo aprende un modelo

> Entrenar es una sola cosa repetida mucho: mira la pendiente, da un paso. Tres formas de dar ese paso, soltadas sobre la misma superficie desde el mismo punto y con la misma tasa de aprendizaje.

### El modelo

**`θ ← θ − η∇L`**

Descenso de gradiente simple. Un paso cuesta abajo, proporcional a la pendiente. Cuando la pendiente es casi plana el paso es casi nada, que es exactamente la falla que puedes ver en la silla.

**`v ← βv − η∇L,   θ ← θ + v`**

Momentum. El paso guarda memoria de los pasos anteriores, así las direcciones consistentes se acumulan y las oscilaciones a través de un valle angosto se cancelan. β = 0.9 significa que los últimos diez gradientes más o menos siguen aportando.

**`m ← β₁m + (1−β₁)g,   s ← β₂s + (1−β₂)g²`**

Adam lleva dos promedios móviles: la media del gradiente y la media de su cuadrado. El primero es momentum, el segundo es una estimación por coordenada de qué tan empinada suele ser esa dirección.

**`θ ← θ − η · m̂ / (√ŝ + ε)`**

Dividir por la magnitud típica hace que el tamaño del paso sea parecido en toda dirección, sin importar cuán distinto estén escaladas. Por eso Adam cruza rápido una silla plana: un gradiente diminuto dividido por un gradiente típico diminuto sigue siendo del orden de uno.

### Cómo está implementado

Los gradientes salen de una diferencia finita centrada, no a mano, así que meter un paisaje nuevo no necesita ninguna derivación nueva. Los tres corredores comparten presupuesto de pasos y tasa de aprendizaje; solo cambia la regla de actualización. Cada paisaje arranca donde su lección se ve, y esos puntos de partida están medidos y no elegidos a ojo: en el paisaje con baches, el primer arranque que probé mandaba a los tres al mismo hoyo, lo que no demuestra nada.

### Qué mirar

Cambia a la silla. El gradiente a lo largo de la cresta es casi cero, y los tres se separan fuerte: Adam sale en el paso 11, momentum en el 64, el descenso simple en el 315. Están medidos, no son ilustrativos. Después cambia al paisaje con baches, donde momentum es el único que lleva suficiente velocidad para salir rodando de la primera trampa y termina en pérdida −2.72 mientras los otros dos se quedan en 1.12.

### Por qué importa

Todo modelo entrenado que hayas usado salió de este bucle, solo que con millones de coordenadas en vez de dos. La razón de que Adam sea el predeterminado no es que encuentre mejores mínimos, es que necesita mucho menos ajuste de la tasa de aprendizaje para no fallar, y a la escala donde una corrida cuesta una fortuna, no fallar es todo el juego.
