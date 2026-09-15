# Flocking

*Emergence* · `boids` · [source](../../src/experiments/boids.js)

> Every bird follows three rules and looks only at whoever is nearby. Nobody is leading, nobody knows the shape of the flock, and there is no flock stored anywhere. It exists only as something you see.

```js
import { mount } from 'bn-lab';
import boids from 'bn-lab/experiments/boids';

mount(document.querySelector('canvas'), boids, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `sep` | Separation | 0 – 3 | 1.4 |
| `ali` | Alignment | 0 – 3 | 1 |
| `coh` | Cohesion | 0 – 3 | 0.9 |

## The model

**`separación = −Σ (rⱼ − rᵢ)/|rⱼ − rᵢ|`**

Push away from anyone too close, weighted by 1/distance so the nearest bird dominates. This is the rule that keeps the flock from collapsing into a point.

**`alineación = ⟨vⱼ⟩ − vᵢ`**

Steer toward the average heading of the neighbours. This is what turns a crowd into a current, and it is the only rule that transmits direction across the group.

**`cohesión = ⟨rⱼ⟩ − rᵢ`**

Steer toward the centre of mass of the neighbours. Alone it would make one dense clump; against separation it produces a flock with a size.

**`r < 46 px`**

The only parameter that is not a weight: how far a bird can see. Nothing in the model has access to anything beyond this radius, and yet the flock behaves as a single object hundreds of pixels across.

## How it is implemented

220 birds, each one checking all the others every frame. That is naive and quadratic, and at this size it is also the right call: 48.000 distance checks per frame is nothing, and a spatial hash would add code without buying anything visible. The three steering vectors are normalised before being weighted, so the sliders control balance and not magnitude, and speed is clamped to a constant so the flock never accelerates away.

## What to look at

Move the cursor into them: birds flee from it and you can split the flock in half and watch it heal. Then take alignment to zero and the whole thing dies instantly into a milling crowd, which tells you which of the three rules is actually carrying the collective behaviour.

## Why it matters

Craig Reynolds wrote this in 1986 and it went straight into film: the bats and penguins in Batman Returns were boids. It matters beyond animation because it is the cleanest demonstration that collective behaviour does not require a collective plan, and the same argument gets used for traffic jams, crowd disasters and markets.

## References

- C. W. Reynolds, "Flocks, herds and schools: A distributed behavioral model", Computer Graphics (SIGGRAPH '87) 21(4) (1987) 25–34.

---

## En español: Bandada

> Cada pájaro sigue tres reglas y solo mira a quien tiene cerca. Nadie lidera, nadie conoce la forma de la bandada, y la bandada no está guardada en ninguna parte. Existe solo como algo que tú ves.

### El modelo

**`separación = −Σ (rⱼ − rᵢ)/|rⱼ − rᵢ|`**

Alejarse de quien esté demasiado cerca, pesado por 1/distancia para que domine el pájaro más próximo. Es la regla que impide que la bandada colapse en un punto.

**`alineación = ⟨vⱼ⟩ − vᵢ`**

Girar hacia la dirección promedio de los vecinos. Es lo que convierte una multitud en una corriente, y la única regla que transmite dirección a través del grupo.

**`cohesión = ⟨rⱼ⟩ − rᵢ`**

Girar hacia el centro de masa de los vecinos. Sola haría un solo grumo denso; contra la separación produce una bandada con un tamaño.

**`r < 46 px`**

El único parámetro que no es un peso: hasta dónde ve un pájaro. Nada en el modelo tiene acceso a algo más allá de este radio, y aun así la bandada se comporta como un solo objeto de cientos de píxeles de ancho.

### Cómo está implementado

Son 220 pájaros y cada uno revisa a todos los demás en cada frame. Es ingenuo y cuadrático, y a este tamaño también es lo correcto: 48.000 comparaciones de distancia por frame no son nada, y una rejilla espacial agregaría código sin comprar nada visible. Los tres vectores de dirección se normalizan antes de pesarse, así los deslizadores controlan el equilibrio y no la magnitud, y la rapidez se fija constante para que la bandada nunca se acelere y se escape.

### Qué mirar

Mete el cursor entre ellos: los pájaros huyen y puedes partir la bandada en dos y verla sanar. Después baja la alineación a cero y todo muere al instante en una multitud que da vueltas, lo que te dice cuál de las tres reglas está cargando de verdad con el comportamiento colectivo.

### Por qué importa

Craig Reynolds escribió esto en 1986 y se fue derecho al cine: los murciélagos y pingüinos de Batman Vuelve eran boids. Importa más allá de la animación porque es la demostración más limpia de que el comportamiento colectivo no requiere un plan colectivo, y el mismo argumento se usa para tacos, desastres de multitudes y mercados.
