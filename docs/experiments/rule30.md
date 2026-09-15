# Rule 30

*Cellular automata* · `rule30` · [source](../../src/experiments/rule30.js)

> One row of cells, each either on or off. One rule that looks at three neighbours and decides the cell below. Repeat. The left side settles into stripes, the right side never settles into anything.

```js
import { mount } from 'bn-lab';
import rule30 from 'bn-lab/experiments/rule30';

mount(document.querySelector('canvas'), rule30, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `rule` | Rule number | 0 – 255 | 30 |
| `cell` | Cell size | 2 – 8 px | 3 |

## The model

**`c′ = l XOR (c OR r)`**

The whole rule. l, c and r are the three cells above. That single boolean expression is the entire program.

**`00011110₂ = 30`**

The name: write the outputs for the eight possible neighbourhoods in order and read them as a binary number.

## How it is implemented

A Uint8Array one cell per 3px of width, starting with a single cell set in the middle. One row is drawn per frame and the array is replaced by its successor. When the bottom is reached it clears and starts over from the same single cell, and it draws exactly the same thing again.

## What to look at

The asymmetry. Same rule applied to both sides of a symmetric starting condition, and one side produces order while the other produces something that passes every statistical test for randomness.

## Why it matters

Wolfram used the centre column of this automaton as the random number generator in Mathematica for years. It is one line of boolean logic producing a sequence nobody has been able to predict or compress.

## References

- S. Wolfram, "Statistical mechanics of cellular automata", Rev. Mod. Phys. 55 (1983) 601–644.

---

## En español: Regla 30

> Una fila de celdas, cada una encendida o apagada. Una regla que mira tres vecinas y decide la celda de abajo. Repetir. El lado izquierdo se asienta en franjas, el derecho no se asienta en nada.

### El modelo

**`c′ = l XOR (c OR r)`**

La regla completa. l, c y r son las tres celdas de arriba. Esa única expresión booleana es el programa entero.

**`00011110₂ = 30`**

El nombre: escribe las salidas para los ocho vecindarios posibles en orden y léelas como número binario.

### Cómo está implementado

Un Uint8Array de una celda por cada 3px de ancho, empezando con una sola celda encendida al medio. Se dibuja una fila por frame y el arreglo se reemplaza por su sucesor. Al llegar abajo se limpia y parte de nuevo desde la misma celda única, y dibuja exactamente lo mismo otra vez.

### Qué mirar

La asimetría. La misma regla aplicada a los dos lados de una condición inicial simétrica, y un lado produce orden mientras el otro produce algo que pasa todos los tests estadísticos de aleatoriedad.

### Por qué importa

Wolfram usó la columna central de este autómata como generador de números aleatorios en Mathematica durante años. Es una línea de lógica booleana produciendo una secuencia que nadie ha podido predecir ni comprimir.
