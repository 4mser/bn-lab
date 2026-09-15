# Voronoi

*Geometry* · `voronoi` · [source](../../src/experiments/voronoi.js)

> Scatter some points, then colour every position in the plane by whichever point is nearest. The boundaries that appear were never drawn: they are just where the answer changes.

```js
import { mount } from 'bn-lab-simulations';
import voronoi from 'bn-lab-simulations/experiments/voronoi';

mount(document.querySelector('canvas'), voronoi, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `sites` | Sites | 3 – 40 | 14 |
| `speed` | Drift | 0 – 3 | 0.8 |
| `metric` | Distance | 0 – 2 | 0 |

## The model

**`V(pᵢ) = { x : d(x,pᵢ) ≤ d(x,pⱼ) ∀j }`**

The definition, and it is the whole thing. Each cell is the set of points closer to one site than to any other. Everything else, including the fact that the cells are convex polygons, is a consequence.

**`d(x,y) = √(Δx² + Δy²)  |  |Δx|+|Δy|  |  max(|Δx|,|Δy|)`**

Euclidean, Manhattan, Chebyshev. Change which one you mean by nearest and the cell walls stop being straight-line bisectors: Manhattan gives staircase boundaries, Chebyshev gives boxes. The sites never moved.

**`dual = triangulación de Delaunay`**

Connect every pair of sites whose cells touch and you get the Delaunay triangulation, the triangulation that maximises the smallest angle. Two of the most used structures in computational geometry are the same object seen from two sides.

## How it is implemented

Brute force on purpose: a coarse grid where every cell asks every site who is closest, then the result is scaled up with smoothing. Fortune's sweep-line algorithm would build the exact diagram in O(n log n), but it needs a priority queue and careful degenerate-case handling, and here the sites move every frame so the diagram would be rebuilt anyway. Borders are found by checking whether a pixel's owner differs from its right or lower neighbour, which is one comparison instead of any geometry.

## What to look at

Your cursor is a site. Move it slowly near a boundary and watch cells that are nowhere near you change shape, because adding a site steals area from everyone whose territory it touches. Then switch the distance to Manhattan and the whole world turns into city blocks without a single site moving.

## Why it matters

John Snow drew one by hand in 1854 around the water pumps of London and used it to argue that cholera came from a single pump on Broad Street. The same diagram is used for cell shapes in tissue, coverage areas for antennas, mesh generation for simulation, and crystal grain boundaries, which grow into exactly this because each seed claims what is nearest.

## References

- G. Voronoi, "Nouvelles applications des paramètres continus à la théorie des formes quadratiques", J. Reine Angew. Math. 133 (1908) 97–178.

---

## En español: Voronoi

> Esparce unos puntos y después colorea cada posición del plano según cuál punto tenga más cerca. Los bordes que aparecen nunca se dibujaron: son solo el lugar donde cambia la respuesta.

### El modelo

**`V(pᵢ) = { x : d(x,pᵢ) ≤ d(x,pⱼ) ∀j }`**

La definición, y es todo. Cada celda es el conjunto de puntos más cerca de un sitio que de cualquier otro. Todo lo demás, incluido que las celdas sean polígonos convexos, es consecuencia.

**`d(x,y) = √(Δx² + Δy²)  |  |Δx|+|Δy|  |  max(|Δx|,|Δy|)`**

Euclídea, Manhattan, Chebyshev. Cambia a cuál te refieres con más cerca y las paredes de las celdas dejan de ser bisectrices rectas: Manhattan da bordes en escalera, Chebyshev da cajas. Los sitios no se movieron.

**`dual = triangulación de Delaunay`**

Conecta cada par de sitios cuyas celdas se tocan y obtienes la triangulación de Delaunay, la que maximiza el ángulo más chico. Dos de las estructuras más usadas de la geometría computacional son el mismo objeto visto por dos lados.

### Cómo está implementado

Fuerza bruta a propósito: una rejilla gruesa donde cada celda le pregunta a cada sitio quién está más cerca, y después el resultado se escala con suavizado. El algoritmo de barrido de Fortune construiría el diagrama exacto en O(n log n), pero necesita una cola de prioridad y un manejo cuidadoso de casos degenerados, y acá los sitios se mueven cada frame así que el diagrama se reconstruiría igual. Los bordes se encuentran comprobando si el dueño de un píxel difiere del de su vecino derecho o inferior, que es una comparación en vez de geometría.

### Qué mirar

Tu cursor es un sitio. Muévelo despacio cerca de un borde y mira cómo cambian de forma celdas que no están cerca de ti, porque agregar un sitio le roba área a todos cuyo territorio toca. Después cambia la distancia a Manhattan y el mundo entero se vuelve cuadras de ciudad sin que se mueva un solo sitio.

### Por qué importa

John Snow dibujó uno a mano en 1854 alrededor de las bombas de agua de Londres y lo usó para argumentar que el cólera venía de una sola bomba en Broad Street. El mismo diagrama se usa para formas celulares en tejidos, áreas de cobertura de antenas, generación de mallas para simulación, y bordes de grano en cristales, que crecen exactamente en esto porque cada semilla reclama lo que tiene más cerca.
