# Ulam spiral

*Number theory* · `ulam` · [source](../../src/experiments/ulam.js)

> Ulam was bored in a talk in 1963 and started numbering a square spiral on a napkin, circling the primes. They fell on diagonals. Sixty years later nobody has explained why.

```js
import { mount } from 'bn-lab-simulations';
import ulam from 'bn-lab-simulations/experiments/ulam';

mount(document.querySelector('canvas'), ulam, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `size` | Grid | 60 – 400 | 200 |
| `start` | Start at | 0 – 60 | 0 |
| `euler` | Mark n²+n+41 | 0 – 1 | 0 |

## The model

**`π(N) ~ N / ln N`**

The prime number theorem: primes thin out, but slowly. Near 40.000 roughly one in ten numbers is prime, so a spiral of that size should look like uniform static. It does not.

**`diagonal ⇒ 4n² + bn + c`**

Why diagonals are special: walking diagonally on the spiral means stepping by a full turn, and each turn adds a linearly growing amount. So a diagonal is exactly the set of values of a quadratic polynomial.

**`n² + n + 41`**

Euler found this in 1772 and it is prime for every n from 0 to 39, without exception. Turn on the marker and it lights up as a single unbroken line. Over the first 200 values it is prime 78% of the time, against a background density of 10.5%.

## How it is implemented

A sieve of Eratosthenes for the whole range, then a single walk along the spiral writing pixels: right one, turn, up one, turn, left two, turn, down two, and so on. The arm length grows every second turn, which is the entire spiral in one line of logic. The image is cached by parameters, so panning the sliders is instant and only a change actually recomputes.

## What to look at

Move the offset. The diagonals do not wash out, they reorganise, because shifting the start changes which quadratic sits on which line. Some offsets are visibly richer than others, and that is not an artefact: certain polynomials really are more prime-dense than others.

## Why it matters

Because the pattern is real and unexplained. Hardy and Littlewood conjectured in 1923 a formula for how dense primes are along a quadratic, and it predicts the effect well, but the conjecture is still a conjecture. This picture is one of the few places where an open problem in number theory is visible to the naked eye.

## References

- M. L. Stein, S. M. Ulam, M. B. Wells, "A visual display of some properties of the distribution of primes", Am. Math. Monthly 71 (1964) 516–520.

---

## En español: Espiral de Ulam

> Ulam estaba aburrido en una charla en 1963 y empezó a numerar una espiral cuadrada en una servilleta, marcando los primos. Cayeron en diagonales. Sesenta años después nadie ha explicado por qué.

### El modelo

**`π(N) ~ N / ln N`**

El teorema de los números primos: los primos se ralean, pero despacio. Cerca de 40.000 más o menos uno de cada diez números es primo, así que una espiral de ese tamaño debería verse como estática uniforme. No se ve así.

**`diagonal ⇒ 4n² + bn + c`**

Por qué las diagonales son especiales: caminar en diagonal por la espiral significa avanzar una vuelta completa, y cada vuelta agrega una cantidad que crece linealmente. Así que una diagonal es exactamente el conjunto de valores de un polinomio cuadrático.

**`n² + n + 41`**

Euler encontró esto en 1772 y es primo para todo n de 0 a 39, sin excepción. Enciende el marcador y se ilumina como una sola línea continua. En los primeros 200 valores es primo el 78% de las veces, contra una densidad de fondo de 10.5%.

### Cómo está implementado

Una criba de Eratóstenes para todo el rango, después un solo recorrido por la espiral escribiendo píxeles: uno a la derecha, giro, uno arriba, giro, dos a la izquierda, giro, dos abajo, y así. El largo del brazo crece cada dos giros, que es la espiral entera en una línea de lógica. La imagen se cachea por parámetros, así que mover los deslizadores es instantáneo y solo un cambio real recalcula.

### Qué mirar

Mueve el desplazamiento. Las diagonales no se borran, se reorganizan, porque correr el inicio cambia qué cuadrática cae en qué línea. Algunos desplazamientos son visiblemente más ricos que otros, y eso no es un artefacto: ciertos polinomios de verdad son más densos en primos que otros.

### Por qué importa

Porque el patrón es real y no está explicado. Hardy y Littlewood conjeturaron en 1923 una fórmula para la densidad de primos a lo largo de una cuadrática, y predice bien el efecto, pero la conjetura sigue siendo conjetura. Esta imagen es uno de los pocos lugares donde un problema abierto de teoría de números se ve a simple vista.
