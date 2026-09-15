# Julia set

*Fractals* · `julia` · [source](../../src/experiments/julia.js)

> The same squaring rule, but now the constant is fixed and the starting point is the pixel. Every value of that constant gives a completely different shape, and the cursor sweeps through them.

```js
import { mount } from 'bn-lab-simulations';
import julia from 'bn-lab-simulations/experiments/julia';

mount(document.querySelector('canvas'), julia, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `iter` | Iterations | 40 – 300 | 120 |
| `res` | Resolution | 90 – 260 | 170 |
| `orbit` | Auto orbit | 0 – 1 | 1 |

## The model

**`z_{n+1} = z_n² + c,  z₀ = pixel`**

Identical iteration to Mandelbrot, with the roles swapped: there c was the pixel, here c is a constant you choose and the pixel is where the orbit starts.

**`c ∈ M ⟺ J_c connected`**

The two sets are linked. If c is inside the Mandelbrot set the Julia set is one connected piece; if it is outside the Julia set shatters into dust.

## How it is implemented

Same escape-time loop and same smoothing as the Mandelbrot, same caching by view key. The only difference is which of the two numbers is held fixed, which is about four characters of code.

## What to look at

Move slowly near the edge of the shape. There is a boundary in cursor position where the figure stops being one connected object and explodes into disconnected dust. That transition is the Mandelbrot boundary, seen from the other side.

## Why it matters

Julia and Fatou worked these out around 1918 with no way to see them. They proved the structure existed and described it in writing, sixty years before anyone could render one.

## References

- G. Julia, "Mémoire sur l'itération des fonctions rationnelles", J. Math. Pures Appl. 8 (1918) 47–245.

---

## En español: Conjunto de Julia

> La misma regla de elevar al cuadrado, pero ahora la constante es fija y el punto de partida es el pixel. Cada valor de esa constante da una forma completamente distinta, y el cursor las recorre.

### El modelo

**`z_{n+1} = z_n² + c,  z₀ = pixel`**

Iteracion identica a Mandelbrot, con los roles cambiados: alla c era el pixel, aca c es una constante que eliges y el pixel es donde arranca la orbita.

**`c ∈ M ⟺ J_c connected`**

Los dos conjuntos estan ligados. Si c esta dentro del conjunto de Mandelbrot el de Julia es una pieza conexa; si esta fuera el de Julia se hace polvo.

### Cómo está implementado

El mismo bucle de tiempo de escape y el mismo suavizado que el Mandelbrot, el mismo cacheo por clave de vista. La unica diferencia es cual de los dos numeros se mantiene fijo, que son unos cuatro caracteres de codigo.

### Qué mirar

Muevete despacio cerca del borde de la forma. Hay una frontera en la posicion del cursor donde la figura deja de ser un objeto conexo y estalla en polvo disconexo. Esa transicion es la frontera de Mandelbrot, vista desde el otro lado.

### Por qué importa

Julia y Fatou dedujeron esto alrededor de 1918 sin ninguna forma de verlo. Demostraron que la estructura existia y la describieron por escrito, sesenta anos antes de que alguien pudiera dibujar una.
