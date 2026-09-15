# Why light exists

*Electromagnetism* · `radiation` · [source](../../src/experiments/radiation.js)

> A charge sitting still has field lines going straight out forever. Shake it, and a kink runs down every line at the speed of light and never comes back. That kink is light, and this is a drawing of it happening.

```js
import { mount } from 'bn-lab-simulations';
import radiation from 'bn-lab-simulations/experiments/radiation';

mount(document.querySelector('canvas'), radiation, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `mode` | Motion | 0 – 2 | 0 |
| `beta` | Speed (v/c) | 0.05 – 0.75 | 0.35 |
| `lines` | Field lines | 8 – 40 | 24 |

## The model

**`t_ret = t − r/c`**

The retarded time. The field at distance r right now was set by where the charge was r/c ago, because nothing about the charge can travel faster than c. Everything else follows from taking this seriously.

**`línea de campo ∥ (r⃗ − r⃗(t_ret))`**

Purcell's construction: each field line still points radially away from the retarded position, not the current one. Draw that for a moving charge and the kink appears on its own, with no extra physics inserted.

**`E_rad = q·a·sinθ / (4πε₀c²r)`**

The transverse field in the kink. Note the r in the denominator, not r²: the radiation field falls off as 1/r while the static field falls as 1/r². Far enough away, the kink is all that is left, and that is why light reaches us from other galaxies.

**`P = q²a² / (6πε₀c³)`**

Larmor: radiated power goes as acceleration squared. No acceleration, no light. A charge moving at constant velocity radiates nothing at all, no matter how fast it goes.

## How it is implemented

The trajectory is a pure function of time, so the entire past can be computed instead of waited for. A history buffer is filled at a fixed timestep chosen so that the index into it is exactly the distance divided by c, which makes the retarded lookup a single array access instead of a search. Prefilling matters: without it the canvas sits blank for about five seconds while the buffer accumulates, and the first version did exactly that.

## What to look at

Start on the dipole and follow one single line outward with your eye. The bends do not stay put: they march away at a fixed speed and leave. Then switch to hard turns, where the charge reverses direction abruptly, and each reversal fires one clean pulse. Raising v/c compresses the pattern ahead of the motion, which is the beginning of relativistic beaming.

## Why it matters

This is the answer to why light exists at all, and it is not usually shown as a picture. Radio antennas are this with electrons in a wire, synchrotrons are this on a curve, and the blue of the sky is this happening in every air molecule. Purcell put the construction in his textbook in 1965 because he thought the algebra was hiding it.

## References

- J. Larmor, "On a dynamical theory of the electric and luminiferous medium, Part III", Phil. Trans. R. Soc. A 190 (1897) 205–300.

---

## En español: Por qué existe la luz

> Una carga quieta tiene líneas de campo que salen rectas para siempre. Sacúdela, y un quiebre baja por cada línea a la velocidad de la luz y no vuelve nunca. Ese quiebre es la luz, y esto es un dibujo de eso ocurriendo.

### El modelo

**`t_ret = t − r/c`**

El tiempo retardado. El campo a distancia r ahora mismo fue fijado por dónde estaba la carga hace r/c, porque nada de la carga puede viajar más rápido que c. Todo lo demás sale de tomarse esto en serio.

**`línea de campo ∥ (r⃗ − r⃗(t_ret))`**

La construcción de Purcell: cada línea de campo sigue apuntando radialmente desde la posición retardada, no la actual. Dibuja eso para una carga en movimiento y el quiebre aparece solo, sin insertar física extra.

**`E_rad = q·a·sinθ / (4πε₀c²r)`**

El campo transversal dentro del quiebre. Fíjate en la r del denominador, no r²: el campo de radiación cae como 1/r mientras el estático cae como 1/r². Suficientemente lejos, el quiebre es lo único que queda, y por eso nos llega luz de otras galaxias.

**`P = q²a² / (6πε₀c³)`**

Larmor: la potencia radiada va como la aceleración al cuadrado. Sin aceleración, no hay luz. Una carga que se mueve a velocidad constante no radia nada, por rápido que vaya.

### Cómo está implementado

La trayectoria es una función pura del tiempo, así que el pasado entero se puede calcular en vez de esperarlo. Un búfer de historia se llena a paso fijo elegido para que el índice sea exactamente la distancia dividida por c, lo que convierte la consulta retardada en un solo acceso a un arreglo en vez de una búsqueda. Precargar importa: sin eso el canvas queda en blanco unos cinco segundos mientras el búfer se llena, y la primera versión hacía exactamente eso.

### Qué mirar

Empieza en el dipolo y sigue una sola línea hacia afuera con la vista. Los quiebres no se quedan quietos: marchan hacia afuera a rapidez fija y se van. Después cambia a giros bruscos, donde la carga invierte la dirección de golpe, y cada inversión dispara un pulso limpio. Subir v/c comprime el patrón por delante del movimiento, que es el comienzo del enfoque relativista.

### Por qué importa

Esta es la respuesta a por qué existe la luz, y no se suele mostrar como imagen. Las antenas de radio son esto con electrones en un cable, los sincrotrones son esto sobre una curva, y el azul del cielo es esto ocurriendo en cada molécula de aire. Purcell puso la construcción en su libro en 1965 porque pensaba que el álgebra la estaba escondiendo.
