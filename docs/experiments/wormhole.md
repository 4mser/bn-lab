# Wormhole

*General relativity* · `wormhole` · [source](../../src/experiments/wormhole.js)

> Two regions of space joined by a tunnel that is shorter than the distance between them. Nothing in general relativity forbids the geometry. Keeping it open is the hard part.

```js
import { mount } from 'bn-lab';
import wormhole from 'bn-lab/experiments/wormhole';

mount(document.querySelector('canvas'), wormhole, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `reach` | Sheet extent | 1.4 – 6 | 3.2 |
| `tilt` | View angle | 0.12 – 0.9 | 0.34 |
| `travel` | Travellers | 0 – 4 | 2 |

## The model

**`ds² = −c²dt² + dl² + (b₀² + l²)dΩ²`**

The Morris-Thorne metric. l is proper radial distance and runs from minus to plus infinity: it passes straight through the throat instead of stopping at it, which is what makes this traversable rather than a black hole.

**`r(l) = √(b₀² + l²)`**

The circumferential radius. At l = 0 it reaches its minimum b₀, the throat, and grows on both sides. There is no singularity anywhere and no horizon.

**`z(l) = b₀·arcsinh(l/b₀)`**

The embedding height, obtained by integrating the shape function b(r) = b₀²/r. This is the exact surface drawn on screen, not an artistic hourglass.

**`ρ + p < 0`**

The catch. Holding the throat open requires matter that violates the null energy condition, meaning negative energy density as measured by a passing light ray. Nothing known does this in bulk.

## How it is implemented

The surface is generated from the metric rather than drawn by hand: rings of constant l and meridians of constant angle, each vertex placed at r(l) and z(l). Rings are sorted by height before drawing so the far side of the tunnel renders behind the near side. The travellers advance at constant rate in l, which is proper distance, so they cross the throat and come out the other sheet without anything special happening at l = 0.

## What to look at

Follow one traveller all the way through. It descends one sheet, passes the bright ring at the narrowest point and keeps going into the other sheet without turning around or slowing down. That is the whole difference from a black hole: the throat is a place you pass through, not a place you end.

## Why it matters

Morris and Thorne wrote this down in 1988 because Carl Sagan asked them for a way to move a character across the galaxy in Contact without breaking physics. They worked backwards: assume the trip is possible, then derive what the metric and the matter would have to be. The answer was a clean geometry and an impossible material, and that paper started the modern field.

## References

- M. S. Morris, K. S. Thorne, "Wormholes in spacetime and their use for interstellar travel", Am. J. Phys. 56 (1988) 395–412.

---

## En español: Agujero de gusano

> Dos regiones del espacio unidas por un tunel mas corto que la distancia que las separa. Nada en la relatividad general prohibe la geometria. Mantenerla abierta es la parte dificil.

### El modelo

**`ds² = −c²dt² + dl² + (b₀² + l²)dΩ²`**

La metrica de Morris-Thorne. l es distancia radial propia y va de menos a mas infinito: atraviesa la garganta en vez de detenerse en ella, y eso es lo que la hace transitable en vez de un agujero negro.

**`r(l) = √(b₀² + l²)`**

El radio circunferencial. En l = 0 alcanza su minimo b₀, la garganta, y crece hacia ambos lados. No hay singularidad en ninguna parte ni horizonte.

**`z(l) = b₀·arcsinh(l/b₀)`**

La altura de embebimiento, obtenida integrando la funcion de forma b(r) = b₀²/r. Esta es la superficie exacta que se dibuja en pantalla, no un reloj de arena artistico.

**`ρ + p < 0`**

El problema. Mantener la garganta abierta exige materia que viola la condicion de energia nula, o sea densidad de energia negativa medida por un rayo de luz que pasa. Nada conocido hace esto a granel.

### Cómo está implementado

La superficie se genera desde la metrica y no se dibuja a mano: anillos de l constante y meridianos de angulo constante, con cada vertice puesto en r(l) y z(l). Los anillos se ordenan por altura antes de dibujar para que el lado lejano del tunel quede detras del cercano. Los viajeros avanzan a ritmo constante en l, que es distancia propia, asi que cruzan la garganta y salen por la otra hoja sin que pase nada especial en l = 0.

### Qué mirar

Sigue a un viajero hasta el final. Baja por una hoja, pasa el anillo brillante del punto mas angosto y sigue hacia la otra hoja sin dar vuelta ni frenar. Esa es toda la diferencia con un agujero negro: la garganta es un lugar por donde se pasa, no un lugar donde se termina.

### Por qué importa

Morris y Thorne escribieron esto en 1988 porque Carl Sagan les pidio una forma de mover un personaje a traves de la galaxia en Contact sin romper la fisica. Trabajaron al reves: suponer que el viaje es posible, y de ahi deducir como tendrian que ser la metrica y la materia. La respuesta fue una geometria limpia y un material imposible, y ese paper inicio el campo moderno.
