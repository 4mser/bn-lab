# Curved spacetime

*General relativity* · `spacetime` · [source](../../src/experiments/spacetime.js)

> There is no force in this simulation. The grid is bent by mass and the particles just go straight through it. What looks like attraction is geometry.

```js
import { mount } from 'bn-lab-simulations';
import spacetime from 'bn-lab-simulations/experiments/spacetime';

mount(document.querySelector('canvas'), spacetime, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `rs` | Schwarzschild radius | 4 – 40 px | 16 |
| `tilt` | View angle | 0.1 – 0.9 | 0.42 |
| `orbit` | Orbiting particles | 0 – 6 | 3 |

## The model

**`G_μν = 8πG/c⁴ · T_μν`**

The Einstein field equations. Left side is curvature, right side is what is there. Matter tells spacetime how to bend; spacetime tells matter how to move.

**`r_s = 2GM/c²`**

The Schwarzschild radius. Compress a mass inside it and the curvature closes on itself. For the Sun that is about three kilometres.

**`δ = 4GM/c²b`**

Light deflection past a mass. Eddington measured it on the Sun during the 1919 eclipse and got twice the Newtonian value, which is what made Einstein famous overnight.

## How it is implemented

The surface is Flamm paraboloid, z(r) = 2√(r_s(r − r_s)): the exact embedding of the Schwarzschild metric, drawn as a polar mesh of rings and spokes and projected with a tilt. The throat is the horizon. Real curvature is four-dimensional and has no outside to bulge into, so an embedding diagram is the honest way to draw it. Particles are integrated with Newtonian gravity in the flat plane and then projected onto the surface.

## What to look at

The mass follows your cursor, so you can drag the whole funnel around under the orbits. Widen the Schwarzschild radius and the throat opens; flatten the view angle and the surface collapses to the flat plane it would be with no mass at all.

## Why it matters

It replaced a force acting instantly at a distance with a field that bends and propagates at the speed of light. That prediction, gravitational waves, was confirmed in 2015 by LIGO measuring a length change a thousand times smaller than a proton.

## References

- A. Einstein, "Die Feldgleichungen der Gravitation", Sitzungsber. Preuss. Akad. Wiss. (1915) 844–847.
- F. W. Dyson, A. S. Eddington, C. Davidson, "A determination of the deflection of light by the Sun's gravitational field", Phil. Trans. R. Soc. A 220 (1920) 291–333.

---

## En español: Espaciotiempo curvo

> No hay ninguna fuerza en esta simulación. La rejilla está doblada por la masa y las partículas simplemente van derecho por ella. Lo que parece atracción es geometría.

### El modelo

**`G_μν = 8πG/c⁴ · T_μν`**

Las ecuaciones de campo de Einstein. El lado izquierdo es curvatura, el derecho es lo que hay ahí. La materia le dice al espaciotiempo cómo doblarse; el espaciotiempo le dice a la materia cómo moverse.

**`r_s = 2GM/c²`**

El radio de Schwarzschild. Comprime una masa dentro de él y la curvatura se cierra sobre sí misma. Para el Sol son unos tres kilómetros.

**`δ = 4GM/c²b`**

Desviación de la luz al pasar cerca de una masa. Eddington la midió en el Sol durante el eclipse de 1919 y obtuvo el doble del valor newtoniano, que es lo que hizo famoso a Einstein de un día para otro.

### Cómo está implementado

La superficie es el paraboloide de Flamm, z(r) = 2√(r_s(r − r_s)): el embebimiento exacto de la métrica de Schwarzschild, dibujado como malla polar de anillos y radios y proyectado con inclinación. La garganta es el horizonte. La curvatura real es de cuatro dimensiones y no tiene un afuera hacia donde abultarse, así que un diagrama de embebimiento es la forma honesta de dibujarla. Las partículas se integran con gravedad newtoniana en el plano y después se proyectan a la superficie.

### Qué mirar

La masa sigue tu cursor, así que puedes arrastrar el embudo entero por debajo de las órbitas. Ensancha el radio de Schwarzschild y la garganta se abre; aplana el ángulo de vista y la superficie colapsa al plano que sería sin masa.

### Por qué importa

Reemplazó una fuerza que actuaba al instante a distancia por un campo que se dobla y se propaga a la velocidad de la luz. Esa predicción, las ondas gravitacionales, se confirmó en 2015 cuando LIGO midió un cambio de longitud mil veces menor que un protón.
