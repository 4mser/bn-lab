# Gravity is geometry

*General relativity* · `curvature` · [source](../../src/experiments/curvature.js)

> Newton said mass pulls. Einstein said mass bends, and things follow the bend. This is a lattice of space with a mass in it, and there is no force anywhere in the code.

```js
import { mount } from 'bn-lab';
import curvature from 'bn-lab/experiments/curvature';

mount(document.querySelector('canvas'), curvature, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `mass` | Mass | 0 – 3 | 1.2 |
| `div` | Lattice divisions | 3 – 8 | 6 |
| `tilt` | View tilt | 0.05 – 1.1 | 0.42 |

## The model

**`G_μν = 8πG/c⁴ · T_μν`**

Matter on the right, curvature on the left. Ten coupled nonlinear equations saying the same thing in both directions: what is there decides the shape, and the shape decides how things move.

**`δ∫ds = 0`**

A free particle takes the longest proper time between two events. It is not being pushed; it is going straight, and straight in a curved geometry is not what it looks like from outside.

**`g_μν vs Γ`**

The distortion here is of distances, not of a rubber surface. What changes near the mass is what a ruler reads between two lattice points, and every grid line shows exactly that.

## How it is implemented

A three dimensional lattice, drawn as lines along all three axes. Every vertex is displaced toward the mass by an amount falling as one over distance squared, with a soft core so the grid cannot fold through itself where the approximation stops being useful. Lines are sorted back to front before drawing and brightened as they approach the mass, which is the same job the blue to green gradient does in the classic illustrations.

## What to look at

Move the mass with the cursor. Notice that the lattice never moves as a whole: only the spacing changes, and only near the mass. Far away the cells stay square, which is what asymptotically flat means. Set the mass to zero and the whole thing is a plain cube of straight lines, because with nothing there space has nothing to do.

## Why it matters

The picture has one honest limit worth stating: it draws space bending in space, and real curvature is intrinsic. It needs no outside to bend into, and it involves time as much as it involves distance. What survives the simplification is the important part. Gravity is not something that reaches across a gap and pulls. It is what a straight line looks like when the geometry is not flat.

## References

- A. Einstein, "Die Feldgleichungen der Gravitation", Sitzungsber. Preuss. Akad. Wiss. (1915) 844–847.

---

## En español: La gravedad es geometría

> Newton dijo que la masa tira. Einstein dijo que la masa dobla, y las cosas siguen el doblez. Esto es una reticula de espacio con una masa dentro, y en el codigo no hay ninguna fuerza.

### El modelo

**`G_μν = 8πG/c⁴ · T_μν`**

Materia a la derecha, curvatura a la izquierda. Diez ecuaciones acopladas no lineales diciendo lo mismo en las dos direcciones: lo que hay decide la forma, y la forma decide como se mueven las cosas.

**`δ∫ds = 0`**

Una particula libre toma el mayor tiempo propio entre dos eventos. No la estan empujando; va derecho, y derecho en una geometria curva no es lo que parece desde afuera.

**`g_μν vs Γ`**

La distorsion aca es de distancias, no de una superficie de goma. Lo que cambia cerca de la masa es lo que marca una regla entre dos puntos de la reticula, y cada linea de la rejilla muestra exactamente eso.

### Cómo está implementado

Una reticula tridimensional, dibujada como lineas a lo largo de los tres ejes. Cada vertice se desplaza hacia la masa una cantidad que cae como uno sobre la distancia al cuadrado, con un nucleo suave para que la rejilla no pueda plegarse sobre si misma donde la aproximacion deja de servir. Las lineas se ordenan de atras hacia adelante antes de dibujar y se aclaran al acercarse a la masa, que es el mismo trabajo que hace el degradado azul a verde de las ilustraciones clasicas.

### Qué mirar

Mueve la masa con el cursor. Fijate que la reticula nunca se mueve entera: solo cambia el espaciado, y solo cerca de la masa. Lejos las celdas siguen cuadradas, que es lo que significa asintoticamente plana. Pon la masa en cero y todo es un cubo de lineas rectas, porque sin nada ahi el espacio no tiene nada que hacer.

### Por qué importa

El dibujo tiene un limite honesto que vale la pena decir: muestra el espacio doblandose en el espacio, y la curvatura real es intrinseca. No necesita un afuera hacia donde doblarse, e involucra al tiempo tanto como a la distancia. Lo que sobrevive a la simplificacion es la parte importante. La gravedad no es algo que cruza un hueco y tira. Es como se ve una linea recta cuando la geometria no es plana.
