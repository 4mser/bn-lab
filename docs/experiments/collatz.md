# Collatz

*Number theory* · `collatz` · [source](../../src/experiments/collatz.js)

> Take any number. Even, halve it. Odd, triple it and add one. Every number anybody has ever tried falls to 1. Nobody can prove it, and Erdős said mathematics is not ready for problems like this.

```js
import { mount } from 'phenomena';
import collatz from 'phenomena/experiments/collatz';

mount(document.querySelector('canvas'), collatz, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `count` | Numbers | 100 – 6000 | 2200 |
| `even` | Even turn | 0 – 20 | 7 |
| `odd` | Odd turn | -24 – 0 | -11 |

## The model

**`f(n) = n/2 si n par;  3n+1 si n impar`**

The entire rule. It fits on a line and a child can follow it, which is precisely what makes the difficulty embarrassing.

**`3n+1 es par ⇒ el paso real es (3n+1)/2`**

Odd steps grow by about 1.5×, even steps halve. On average a random step multiplies by √(3/2)/... under 1, so heuristically everything should fall. Heuristics are not proofs, and the sequence for 27 climbs to 9232 before collapsing.

**`verificado hasta 2⁶⁸ ≈ 2.95 × 10²⁰`**

Every starting value below that has been checked by computer and every one reaches 1. That is overwhelming evidence and zero proof, and the distinction is the whole of mathematics.

## How it is implemented

For each starting number the sequence is computed down to 1, then drawn backwards from a common root, turning one way on an even step and the other way on an odd one. Because every sequence ends at 1, every drawing starts at the same point, and the shared prefixes overlap into thick trunks while the rare paths become thin outer branches. It is rendered once to an offscreen canvas and cached, because 2.200 paths is far too much to redraw at 60fps.

## What to look at

The readout gives the longest path found. Under 2.200 it is 181 steps, and that record belongs to 1161; the next number to beat it is 2223, just outside the range. Push the count up and watch the coral thicken without ever growing a branch that escapes: every single one of those thousands of paths comes home.

## Why it matters

Terence Tao got the closest anybody has in 2019, proving that almost all starting values eventually get almost bounded, which is a long way from all. The problem is famous because it is the clearest example of a statement that is trivial to check, impossible to prove, and completely useless if true.

## References

- J. C. Lagarias, "The 3x+1 problem and its generalizations", Am. Math. Monthly 92 (1985) 3–23.

---

## En español: Collatz

> Toma cualquier número. Par, divídelo en dos. Impar, triplícalo y suma uno. Todo número que alguien haya probado cae a 1. Nadie puede demostrarlo, y Erdős dijo que la matemática no está lista para problemas así.

### El modelo

**`f(n) = n/2 si n par;  3n+1 si n impar`**

La regla completa. Cabe en una línea y un niño puede seguirla, que es exactamente lo que hace vergonzosa la dificultad.

**`3n+1 es par ⇒ el paso real es (3n+1)/2`**

Los pasos impares crecen alrededor de 1.5×, los pares dividen en dos. En promedio un paso al azar multiplica por menos de 1, así que heurísticamente todo debería caer. Las heurísticas no son demostraciones, y la secuencia del 27 trepa hasta 9232 antes de derrumbarse.

**`verificado hasta 2⁶⁸ ≈ 2.95 × 10²⁰`**

Todo valor inicial bajo esa cifra se revisó por computador y todos llegan a 1. Es evidencia abrumadora y cero demostración, y esa distinción es la matemática entera.

### Cómo está implementado

Para cada número inicial se calcula la secuencia hasta 1, después se dibuja al revés desde una raíz común, girando hacia un lado en un paso par y hacia el otro en uno impar. Como toda secuencia termina en 1, todo dibujo empieza en el mismo punto, y los prefijos compartidos se superponen en troncos gruesos mientras los caminos raros quedan como ramas finas de afuera. Se renderiza una vez a un canvas fuera de pantalla y se cachea, porque 2.200 caminos es demasiado para redibujar a 60fps.

### Qué mirar

La lectura da el camino más largo encontrado. Bajo 2.200 son 181 pasos, y ese récord es del 1161; el siguiente número que lo supera es el 2223, justo fuera del rango. Sube la cantidad y mira el coral engrosarse sin que nunca crezca una rama que se escape: cada uno de esos miles de caminos vuelve a casa.

### Por qué importa

Terence Tao llegó más cerca que nadie en 2019, demostrando que casi todos los valores iniciales terminan casi acotados, que está lejos de todos. El problema es famoso porque es el ejemplo más claro de un enunciado trivial de comprobar, imposible de demostrar, y completamente inútil si es cierto.
