# Embedding space

*Machine learning* · `embedding` · [source](../../src/experiments/embedding.js)

> Models think in hundreds of dimensions. Screens have two. Every embedding plot you have seen is the result of squeezing one into the other, and something always breaks in the squeeze.

```js
import { mount } from 'phenomena';
import embedding from 'phenomena/experiments/embedding';

mount(document.querySelector('canvas'), embedding, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `dim` | True dimensions | 3 – 24 | 10 |
| `clus` | Clusters | 2 – 8 | 5 |
| `rate` | Relaxation rate | 0.01 – 0.4 | 0.12 |

## The model

**`dᵢⱼ = ‖xᵢ − xⱼ‖`**

The target: the distance between every pair of points in the original high-dimensional space. This matrix is the only thing carried over; the coordinates themselves are thrown away.

**`stress = Σᵢⱼ (‖yᵢ − yⱼ‖ − dᵢⱼ)²`**

What we are minimising: the total disagreement between distances on screen and distances in the real space. Classical multidimensional scaling, going back to Torgerson in 1952.

**`yᵢ += ((d − dᵢⱼ)/d)·(yⱼ − yᵢ)·η`**

The relaxation step, applied to random pairs. If two points are closer on screen than they should be, push them apart; if further, pull them together. Repeat forever. It is a spring network where every pair has its own rest length.

## How it is implemented

Points are generated in genuinely high-dimensional space around random cluster centres, then their full pairwise distance matrix is computed once and used as the target. The layout starts as a blob and relaxes. Nothing here knows which cluster a point belongs to: the grouping you see on screen is recovered purely from distances.

## What to look at

The number that matters is the residual distortion at the bottom. Take the true dimensions up to 24 and watch it climb: there is simply not enough room in a plane to keep all those distances honest. This is the caveat under every t-SNE picture in every paper, and it is usually not printed.

## Why it matters

Because these plots get read as if they were maps. Distances between clusters in a t-SNE or UMAP figure are frequently meaningless, and cluster sizes almost always are. Seeing the distortion percentage move while you change the dimension is the fastest way to stop trusting them more than they deserve.

## References

- J. B. Kruskal, "Multidimensional scaling by optimizing goodness of fit to a nonmetric hypothesis", Psychometrika 29 (1964) 1–27.

---

## En español: Espacio de embeddings

> Los modelos piensan en cientos de dimensiones. Las pantallas tienen dos. Todo gráfico de embeddings que hayas visto es el resultado de exprimir una en la otra, y en el apretón algo siempre se rompe.

### El modelo

**`dᵢⱼ = ‖xᵢ − xⱼ‖`**

El objetivo: la distancia entre cada par de puntos en el espacio original de muchas dimensiones. Esta matriz es lo único que se traslada; las coordenadas mismas se descartan.

**`stress = Σᵢⱼ (‖yᵢ − yⱼ‖ − dᵢⱼ)²`**

Lo que estamos minimizando: el desacuerdo total entre las distancias en pantalla y las distancias en el espacio real. Escalado multidimensional clásico, que viene de Torgerson en 1952.

**`yᵢ += ((d − dᵢⱼ)/d)·(yⱼ − yᵢ)·η`**

El paso de relajación, aplicado a pares al azar. Si dos puntos están más cerca en pantalla de lo que deberían, sepáralos; si están más lejos, acércalos. Repetir para siempre. Es una red de resortes donde cada par tiene su propia longitud de reposo.

### Cómo está implementado

Los puntos se generan de verdad en un espacio de muchas dimensiones alrededor de centros de grupo al azar, después se calcula una vez su matriz completa de distancias por pares y se usa como objetivo. La disposición arranca como un grumo y se relaja. Nada acá sabe a qué grupo pertenece un punto: la agrupación que ves en pantalla se recupera solo de las distancias.

### Qué mirar

El número que importa es la distorsión residual de abajo. Sube las dimensiones reales a 24 y míralo trepar: sencillamente no hay espacio en un plano para mantener honestas todas esas distancias. Esta es la advertencia que va debajo de cada imagen de t-SNE en cada paper, y normalmente no se imprime.

### Por qué importa

Porque estos gráficos se leen como si fueran mapas. Las distancias entre grupos en una figura de t-SNE o UMAP con frecuencia no significan nada, y los tamaños de los grupos casi nunca significan algo. Ver moverse el porcentaje de distorsión mientras cambias la dimensión es la forma más rápida de dejar de confiar en ellos más de lo que merecen.
