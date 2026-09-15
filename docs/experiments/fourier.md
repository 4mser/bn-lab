# Fourier series

*Harmonic analysis* · `fourier` · [source](../../src/experiments/fourier.js)

> A circle turning on the rim of another circle, on another, on another. Add enough of them at the right sizes and speeds and the tip traces a square wave: a shape with corners, drawn entirely by things with none.

```js
import { mount } from 'phenomena';
import fourier from 'phenomena/experiments/fourier';

mount(document.querySelector('canvas'), fourier, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `terms` | Harmonics | 1 – 20 | 6 |
| `speed` | Speed | 0 – 2 | 0.6 |

## The model

**`f(t) = Σ (4/nπ)·sin(nt),  n odd`**

The square wave as a sum of sines. Only odd harmonics, each with amplitude falling as 1/n, which is why the series converges so slowly.

**`radius = 4/nπ`**

Each circle in the chain is one term of that sum. Its radius is the amplitude and its rotation rate is the frequency.

## How it is implemented

Six circles, computed and drawn from scratch each frame: start at the centre, for each term add a rotating offset, and draw both the circle and the arm. The vertical position of the last tip is pushed into a buffer and plotted to the right, which is the waveform.

## What to look at

The ripple near the corners never goes away. Adding more circles makes it narrower but not shorter: it overshoots by about 9% no matter how many terms you use. That is the Gibbs phenomenon, and it is a property of the series rather than a bug.

## Why it matters

Fourier claimed in 1807 that any function could be written this way and was rejected by the leading mathematicians of his time. The claim was too strong as stated, but the corrected version underpins JPEG, MP3, MRI, and essentially every signal processing system built since.

## References

- J. Fourier, Théorie analytique de la chaleur, Firmin Didot (1822).

---

## En español: Serie de Fourier

> Un círculo girando en el borde de otro círculo, sobre otro, sobre otro. Suma suficientes con los tamaños y velocidades correctos y la punta traza una onda cuadrada: una forma con esquinas, dibujada enteramente por cosas que no tienen ninguna.

### El modelo

**`f(t) = Σ (4/nπ)·sin(nt),  n odd`**

La onda cuadrada como suma de senos. Solo armónicos impares, cada uno con amplitud cayendo como 1/n, que es la razón de que la serie converja tan lento.

**`radius = 4/nπ`**

Cada círculo de la cadena es un término de esa suma. Su radio es la amplitud y su velocidad de giro es la frecuencia.

### Cómo está implementado

Seis círculos, calculados y dibujados desde cero en cada frame: parte del centro, por cada término suma un desplazamiento rotatorio, y dibuja tanto el círculo como el brazo. La posición vertical de la última punta se guarda en un buffer y se grafica a la derecha, que es la forma de onda.

### Qué mirar

La ondulación cerca de las esquinas nunca desaparece. Agregar más círculos la hace más angosta pero no más baja: se pasa alrededor de un 9% sin importar cuántos términos uses. Eso es el fenómeno de Gibbs, y es una propiedad de la serie y no un error.

### Por qué importa

Fourier afirmó en 1807 que cualquier función podía escribirse así y fue rechazado por los matemáticos más importantes de su época. La afirmación era demasiado fuerte tal como estaba, pero la versión corregida sostiene JPEG, MP3, la resonancia magnética, y esencialmente todo sistema de procesamiento de señales construido desde entonces.
