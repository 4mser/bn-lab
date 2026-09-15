# Snell and the trapped ray

*Optics* · `refraction` · [source](../../src/experiments/refraction.js)

> Light crossing into a different medium has to bend, because it has to stay in step with itself. Tilt it far enough and it stops crossing at all: the surface becomes a perfect mirror. That is the whole reason fibre optics work.

```js
import { mount } from 'bn-lab';
import refraction from 'bn-lab/experiments/refraction';

mount(document.querySelector('canvas'), refraction, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `n1` | n above | 1 – 2.6 | 1.5 |
| `n2` | n below | 1 – 2.6 | 1 |
| `ang` | Angle of incidence | 1 – 89 | 35 |

## The model

**`n₁ sin θ₁ = n₂ sin θ₂`**

Snell. It is not a rule about bending, it is a statement that the component of the wave along the surface has to match on both sides, otherwise the crests would not line up at the boundary.

**`θ_c = arcsin(n₂/n₁)`**

When n₁ > n₂ there is an angle past which the equation asks for sin θ₂ > 1, which has no solution. Physically, nothing crosses: total internal reflection. Glass to air gives 41.8°.

**`r_s = (n₁cosθ₁ − n₂cosθ₂)/(n₁cosθ₁ + n₂cosθ₂)`**

Snell says where the light goes; Fresnel says how much. This is the amplitude coefficient for one polarisation, and the reflected fraction is its square. At normal incidence on glass it gives 4%, which is why you see yourself in a window.

**`tan θ_B = n₂/n₁`**

Brewster's angle, where the other polarisation reflects nothing at all. That is what polarised sunglasses exploit: glare off water and roads is mostly one polarisation, and a filter can delete it.

## How it is implemented

Both Fresnel coefficients are computed and averaged, which is what unpolarised light does. The dashes moving along each ray are spaced by the local wavelength, so you can see the transmitted beam physically shorten its wavelength inside the denser medium. Four limits were checked against hand calculation: 4.0% at normal incidence, 7.4% at Brewster, 89.1% approaching the critical angle, and exactly 100% past it.

## What to look at

Move the cursor above the surface: the beam follows it, so you can walk the angle up by hand. Watch the reflected ray brighten as you approach 41.8° and the transmitted one flatten out and vanish. Then set n above to 1 and n below to 1.5 and try again: going into the denser medium, total internal reflection is impossible at any angle.

## Why it matters

A strand of fibre is just this, over and over: light enters shallow enough that every bounce is past the critical angle, so it cannot leak, and it travels kilometres inside a thread of glass. The internet runs on a boundary condition.

## References

- M. Born, E. Wolf, Principles of Optics, 7th ed., Cambridge University Press (1999).

---

## En español: Snell y el rayo atrapado

> La luz que cruza a otro medio tiene que doblarse, porque tiene que mantenerse en fase consigo misma. Inclínala lo suficiente y deja de cruzar: la superficie se vuelve un espejo perfecto. Esa es la razón entera de que funcione la fibra óptica.

### El modelo

**`n₁ sin θ₁ = n₂ sin θ₂`**

Snell. No es una regla sobre doblarse, es la afirmación de que la componente de la onda a lo largo de la superficie tiene que coincidir en ambos lados, si no las crestas no calzarían en el borde.

**`θ_c = arcsin(n₂/n₁)`**

Cuando n₁ > n₂ hay un ángulo pasado el cual la ecuación pide sin θ₂ > 1, que no tiene solución. Físicamente, no cruza nada: reflexión total interna. Vidrio a aire da 41.8°.

**`r_s = (n₁cosθ₁ − n₂cosθ₂)/(n₁cosθ₁ + n₂cosθ₂)`**

Snell dice adónde va la luz; Fresnel dice cuánta. Este es el coeficiente de amplitud para una polarización, y la fracción reflejada es su cuadrado. A incidencia normal sobre vidrio da 4%, que es por qué te ves en una ventana.

**`tan θ_B = n₂/n₁`**

El ángulo de Brewster, donde la otra polarización no refleja nada. Eso es lo que aprovechan los lentes polarizados: el reflejo del agua y del pavimento es mayormente una polarización, y un filtro puede borrarla.

### Cómo está implementado

Se calculan los dos coeficientes de Fresnel y se promedian, que es lo que hace la luz no polarizada. Los guiones que corren por cada rayo están separados por la longitud de onda local, así puedes ver el haz transmitido acortar físicamente su longitud de onda dentro del medio más denso. Cuatro casos límite se contrastaron con cálculo a mano: 4.0% a incidencia normal, 7.4% en Brewster, 89.1% acercándose al ángulo crítico, y exactamente 100% pasándolo.

### Qué mirar

Mueve el cursor sobre la superficie: el haz lo sigue, así puedes subir el ángulo a mano. Mira cómo el rayo reflejado se aviva al acercarte a 41.8° y el transmitido se aplana y desaparece. Después pon n arriba en 1 y n abajo en 1.5 y prueba de nuevo: entrando al medio más denso, la reflexión total interna es imposible a cualquier ángulo.

### Por qué importa

Una hebra de fibra es solo esto, una y otra vez: la luz entra lo bastante rasante como para que cada rebote pase el ángulo crítico, así no puede escapar, y viaja kilómetros dentro de un hilo de vidrio. Internet corre sobre una condición de borde.
