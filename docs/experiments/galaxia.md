# Spiral galaxy

*Astrophysics* · `galaxia` · [source](../../src/experiments/galaxia.js)

> Give two thousand stars one law — the closer to the core, the faster the orbit — and a spiral appears. Keep watching and the arms wind up tighter and tighter, which is exactly the problem that forced astronomy to rethink what a spiral arm is.

```js
import { mount } from 'bn-lab';
import galaxia from 'bn-lab/experiments/galaxia';

mount(document.querySelector('canvas'), galaxia, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `brazos` | Arms | 1 – 6 | 3 |
| `giro` | Pitch g | 1 – 9 | 4.6 |
| `vel` | Rotation ω | 0 – 3 | 1 |

## The model

**`ω(r) = ω₀ / √r`**

A Keplerian rotation curve: orbital speed set by the pull of the mass at the centre, falling with distance. Mercury laps the Sun four times while Earth finishes one orbit — same law, same reason.

**`θ = θ₀ + g·ln r + ω(r)·t`**

Each star sits on a logarithmic spiral — the curve that keeps the same pitch at every scale, the one nautilus shells and hurricanes share — and then drifts along it at its own angular speed.

**`y = cy + r·sin θ · cos i`**

The whole disc is projected by compressing the vertical axis by cos i, where i is the inclination. That single multiplication is what turns a flat spinning disc into a galaxy seen in perspective.

## How it is implemented

Two thousand stars are seeded once, denser toward the core. Each stores only its radius, its arm, its scatter and a twinkle phase — the angle is recomputed every frame from the sliders, so changing the arm count re-folds the whole galaxy instantly. Everything is drawn twice with additive compositing, a wide faint halo under a small bright core: where stars pile up the canvas saturates toward white, which is how a long-exposure photograph of a real galaxy works.

## What to look at

Drag the rotation up and let it run: the inner stars overtake the outer ones and the arms stretch into ever-tighter coils. This is the winding problem — if arms were fixed sets of stars, every old galaxy would be a featureless circle by now. Real arms are density waves the stars pass through, like a jam that stays put while the cars drive through it. The cursor tilts the disc: face-on at the top, edge-on at the bottom.

## Why it matters

The winding problem is a rare case of a simulation falsifying a theory by just running. This exact model — material arms plus differential rotation — is the one that fails on screen, and its failure is what pushed Lin and Shu toward density-wave theory in 1964. Sometimes the most useful model is the one that breaks on schedule.

## References

- C. C. Lin, F. H. Shu, "On the spiral structure of disk galaxies", Astrophys. J. 140 (1964) 646–655.

---

## En español: Galaxia espiral

> Dale a dos mil estrellas una sola ley —mientras más cerca del núcleo, más rápida la órbita— y aparece una espiral. Sigue mirando y los brazos se enrollan cada vez más apretados: exactamente el problema que obligó a la astronomía a repensar qué es un brazo espiral.

### El modelo

**`ω(r) = ω₀ / √r`**

Curva de rotación kepleriana: la velocidad orbital la fija el tirón de la masa del centro y cae con la distancia. Mercurio le da cuatro vueltas al Sol mientras la Tierra completa una: misma ley, misma razón.

**`θ = θ₀ + g·ln r + ω(r)·t`**

Cada estrella se sienta sobre una espiral logarítmica —la curva que mantiene el mismo paso a toda escala, la misma de las conchas de nautilus y los huracanes— y luego deriva sobre ella a su propia velocidad angular.

**`y = cy + r·sin θ · cos i`**

El disco entero se proyecta comprimiendo el eje vertical por cos i, donde i es la inclinación. Esa única multiplicación convierte un disco plano girando en una galaxia vista en perspectiva.

### Cómo está implementado

Dos mil estrellas se siembran una vez, más densas hacia el núcleo. Cada una guarda solo su radio, su brazo, su dispersión y una fase de parpadeo: el ángulo se recalcula en cada frame desde los deslizadores, así que cambiar el número de brazos repliega la galaxia entera al instante. Todo se dibuja dos veces con composición aditiva, un halo ancho y tenue bajo un núcleo chico y brillante: donde las estrellas se apilan el lienzo satura hacia el blanco, que es como funciona una fotografía de larga exposición de una galaxia real.

### Qué mirar

Sube la rotación y déjalo correr: las estrellas interiores adelantan a las exteriores y los brazos se estiran en espirales cada vez más apretadas. Es el problema del enrollamiento: si los brazos fueran conjuntos fijos de estrellas, toda galaxia vieja sería ya un círculo sin rasgos. Los brazos reales son ondas de densidad que las estrellas atraviesan, como un atasco que se queda quieto mientras los autos lo cruzan. El cursor inclina el disco: de frente arriba, de canto abajo.

### Por qué importa

El problema del enrollamiento es un caso raro de una simulación falseando una teoría con solo correr. Este modelo exacto —brazos materiales más rotación diferencial— es el que falla en pantalla, y su falla es lo que empujó a Lin y Shu hacia la teoría de ondas de densidad en 1964. A veces el modelo más útil es el que se rompe según lo previsto.
