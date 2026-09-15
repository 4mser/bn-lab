# Double slit

*Quantum mechanics* · `doubleslit` · [source](../../src/experiments/doubleslit.js)

> Send particles at two slits one at a time. Each lands as a single dot, and after enough of them the dots have arranged themselves into fringes. Then put a detector at the slits so somebody knows which one each particle went through, and the fringes are gone.

```js
import { mount } from 'phenomena';
import doubleslit from 'phenomena/experiments/doubleslit';

mount(document.querySelector('canvas'), doubleslit, { controls: document.querySelector('#controls') });
```

## Parameters

| key | label | range | default |
|---|---|---|---|
| `watch` | Observer at the slits | 0 – 1 | 0 |
| `eff` | Detector reliability | 0 – 1 | 1 |
| `sep` | Slit separation d | 20 – 140 px | 62 |
| `lam` | Wavelength λ | 8 – 40 px | 18 |

## The model

**`I = |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + 2Re(ψ₁*ψ₂)`**

The whole experiment is in that last term. Add the amplitudes and the cross term produces fringes; add the intensities and it does not appear at all.

**`V² + D² ≤ 1`**

Complementarity, as an inequality you can measure. V is fringe visibility, D is how well you could tell which slit. Knowing the path and seeing the fringes are not two options, they are two ends of one dial.

**`Δy = λL/d`**

Fringe spacing. Widen the slits and the pattern tightens, lengthen the wavelength and it spreads. Both sliders do exactly this.

## How it is implemented

The left side draws the field as the squared modulus of the summed amplitudes, and the right side samples individual detections from that same distribution by rejection. The observer switch sets how much which-path information exists, and that value multiplies the cross term rather than fading anything out, so the visibility of the pattern is a consequence of the formula and not a drawing effect. I checked it: measuring the contrast of the rendered pattern reproduces the square root of one minus D squared to within a few thousandths across the whole range.

## What to look at

Turn the observer on and off and watch the screen rebuild itself. With it off the fringes come back; with it on you get two plain bands. Then look at the counters next to each slit: those are the particles the detector registered going through, and that record is the entire price. Lower the reliability and the fringes creep back in proportion, because a detector that sometimes lies gives you less than a full answer.

## Why it matters

Feynman called it the only mystery, and said it contains everything strange about quantum mechanics. The strange part is not that particles behave like waves. It is that the pattern depends on whether the information exists at all, not on whether anyone ever reads it. Nothing needs a conscious observer: a detector left running in an empty room does the same damage.

## References

- A. Tonomura, J. Endo, T. Matsuda, T. Kawasaki, H. Ezawa, "Demonstration of single-electron buildup of an interference pattern", Am. J. Phys. 57 (1989) 117–120.

---

## En español: Doble rendija

> Manda particulas a dos rendijas de a una. Cada una llega como un punto, y despues de suficientes los puntos se han ordenado en franjas. Despues pon un detector en las rendijas para que alguien sepa por cual paso cada una, y las franjas desaparecen.

### El modelo

**`I = |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + 2Re(ψ₁*ψ₂)`**

El experimento entero esta en ese ultimo termino. Suma las amplitudes y el termino cruzado produce franjas; suma las intensidades y no aparece en absoluto.

**`V² + D² ≤ 1`**

Complementariedad, como una desigualdad que se puede medir. V es la visibilidad de las franjas, D es que tan bien podrias decir cual rendija. Saber el camino y ver las franjas no son dos opciones, son los dos extremos de una misma perilla.

**`Δy = λL/d`**

Espaciado de las franjas. Separa las rendijas y el patron se aprieta, alarga la longitud de onda y se abre. Los dos deslizadores hacen exactamente esto.

### Cómo está implementado

El lado izquierdo dibuja el campo como el modulo al cuadrado de la suma de amplitudes, y el derecho sortea detecciones individuales de esa misma distribucion por rechazo. El interruptor del observador fija cuanta informacion de camino existe, y ese valor multiplica el termino cruzado en vez de desvanecer nada, asi que la visibilidad del patron es consecuencia de la formula y no un efecto de dibujo. Lo comprobe: medir el contraste del patron renderizado reproduce la raiz de uno menos D al cuadrado con error de milesimas en todo el rango.

### Qué mirar

Enciende y apaga el observador y mira la pantalla reconstruirse. Apagado vuelven las franjas; encendido quedan dos bandas lisas. Despues mira los contadores junto a cada rendija: esas son las particulas que el detector registro pasando, y ese registro es todo el precio. Baja la fiabilidad y las franjas vuelven en proporcion, porque un detector que a veces miente te da menos que una respuesta completa.

### Por qué importa

Feynman lo llamo el unico misterio, y dijo que contiene todo lo raro de la mecanica cuantica. Lo raro no es que las particulas se comporten como ondas. Es que el patron dependa de si la informacion existe, no de si alguien la lee. No hace falta un observador consciente: un detector encendido en una pieza vacia hace el mismo dano.
