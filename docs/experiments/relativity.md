# Special relativity

*Special relativity* · `relativity` · [source](../../src/experiments/relativity.js)

> A photon bouncing between two mirrors is a clock. Put that clock on a moving train and the photon has to travel diagonally, which is a longer path at the same speed. So the clock ticks slower. That is the whole argument.

```js
import { mount } from 'bn-lab';
import relativity from 'bn-lab/experiments/relativity';

mount(document.querySelector('canvas'), relativity, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `vista` | View: 0 same frame · 1 two frames | 0 – 1 | 1 |
| `beta` | Speed β = v/c | 0 – 0.98 | 0.6 |
| `rate` | Clock rate | 0.3 – 2.5 | 1 |
| `trail` | Path memory | 0 – 900 | 420 |

## The model

**`γ = 1/√(1 − β²)`**

The Lorentz factor, with β = v/c. At β = 0.6 it is 1.25; at 0.99 it is 7.1. It blows up at β = 1, which is why nothing with mass gets there.

**`Δt = γ·Δτ`**

Coordinate time against proper time. τ is what the moving clock reads; t is what you read. The counters in the corner drift apart by exactly this factor.

**`L = L₀/γ`**

Length contraction, the same factor upside down. The moving clock is drawn shorter for that reason, not for perspective.

## How it is implemented

Two clocks are drawn. The one at rest bounces its photon straight up and down; the moving one is carried sideways while its photon bounces, and its position is recorded frame by frame so the diagonal path draws itself. The only relativistic line in the whole thing is that the moving clock advances its phase by dt/gamma. The contracted ruler underneath is drawn separately, because contraction acts along the motion while the mirror separation is perpendicular to it and does not change.

## What to look at

The view slider. At 1 (the default) it is the SAME clock seen from two frames: its own on top, yours below. The bounces are the SAME EVENTS, so both dots rise and fall exactly together, verified at 0.000000 px of drift. What differs is the path: H on top, gamma-H below. The animation runs on YOUR clock, so the bottom dot always moves at c no matter what beta does, while the top one slows to c/gamma: what you see slowing down is the rocket clock running slow. Move the slider and both panels respond. That is why your clock reads more: t/tau comes out as gamma, and that number is MEASURED off the drawing, not computed from the formula. At 0 the question changes: two separate clocks in one frame, and there both photons do move at the same on-screen speed, with the travelling one bouncing less often. Both views are correct and cannot coexist: bouncing together, moving at the same on-screen speed, and covering different distances are three things you can only ever have two of.

## Why it matters

Einstein got here in 1905 from two assumptions: physics works the same in every inertial frame, and light has the same speed in all of them. Everything else, including E=mc², is bookkeeping from there. GPS satellites correct for this daily or positions would drift kilometres.

## References

- A. Einstein, "Zur Elektrodynamik bewegter Körper", Ann. Phys. 17 (1905) 891–921.

---

## En español: Relatividad especial

> Un fotón rebotando entre dos espejos es un reloj. Pon ese reloj en un tren en movimiento y el fotón tiene que viajar en diagonal, que es un camino más largo a la misma velocidad. Entonces el reloj va más lento. Ese es el argumento entero.

### El modelo

**`γ = 1/√(1 − β²)`**

El factor de Lorentz, con β = v/c. En β = 0,6 vale 1,25; en 0,99 vale 7,1. Explota en β = 1, que es la razón de que nada con masa llegue ahí.

**`Δt = γ·Δτ`**

Tiempo coordenado contra tiempo propio. τ es lo que marca el reloj móvil; t es lo que marcas tú. Los contadores de la esquina se separan exactamente por este factor.

**`L = L₀/γ`**

Contracción de longitud, el mismo factor al revés. El reloj móvil se dibuja más corto por eso, no por perspectiva.

### Cómo está implementado

Se dibujan dos relojes. El que esta en reposo rebota su foton recto arriba y abajo; el que se mueve es arrastrado de lado mientras su foton rebota, y su posicion se registra frame a frame para que el camino diagonal se dibuje solo. La unica linea relativista en todo esto es que el reloj movil avanza su fase en dt/gamma. La regla contraida de abajo se dibuja aparte, porque la contraccion actua a lo largo del movimiento mientras que la separacion entre espejos es perpendicular y no cambia.

### Qué mirar

El deslizador de vista. En 1 (por defecto) es el MISMO reloj visto desde dos marcos: arriba en el suyo, abajo en el tuyo. Los rebotes son los MISMOS EVENTOS, asi que las dos bolitas suben y bajan exactamente juntas, verificado en 0.000000 px de desfase. Lo que cambia es el camino: H arriba, gamma-H abajo. La animacion corre sobre TU reloj, asi que la bolita de abajo va siempre a c pase lo que pase con beta, y la de arriba se frena a c/gamma: eso que ves frenarse es el reloj del cohete corriendo lento. Mueve el deslizador y los dos paneles reaccionan. Por eso tu reloj marca mas: t/tau sale gamma, y ese numero esta MEDIDO del dibujo, no calculado con la formula. En 0 cambia la pregunta: dos relojes distintos en un solo marco, y ahi los dos fotones si van a la misma rapidez en pantalla, con el que viaja rebotando menos seguido. Las dos vistas son correctas y no pueden coexistir: rebotar a la vez, ir a la misma rapidez en pantalla y recorrer distinto camino son tres cosas de las que solo puedes tener dos.

### Por qué importa

Einstein llegó acá en 1905 desde dos supuestos: la física funciona igual en todo marco inercial, y la luz tiene la misma velocidad en todos. Todo lo demás, incluido E=mc², es contabilidad desde ahí. Los satélites GPS corrigen esto a diario o las posiciones se irían kilómetros.
