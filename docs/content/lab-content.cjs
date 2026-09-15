/* Contenido de las páginas de detalle del lab.
   Lo consume build-lab.js para generar /lab/<id>.html
   Cada entrada: la física, las ecuaciones, cómo está implementado y qué mirar. */
module.exports = {

  interference: {
    tag: { en: 'Wave optics', es: 'Óptica ondulatoria' },
    lede: {
      en: 'Two sources emitting the same wave. Where the crests meet, light. Where a crest meets a trough, nothing. The pattern is not in either wave: it only exists in the sum.',
      es: 'Dos fuentes emitiendo la misma onda. Donde las crestas se encuentran, luz. Donde una cresta encuentra un valle, nada. El patrón no está en ninguna de las dos ondas: solo existe en la suma.' },
    math: [
      { eq: 'ψ(r,t) = A/√r · cos(kr − ωt)',
        en: 'A single spherical source. Amplitude falls as 1/√r because energy spreads over a growing circumference; k = 2π/λ is the wavenumber and ω the angular frequency.',
        es: 'Una sola fuente esférica. La amplitud cae como 1/√r porque la energía se reparte sobre una circunferencia que crece; k = 2π/λ es el número de onda y ω la frecuencia angular.' },
      { eq: 'ψ_total = Σ ψ_i',
        en: 'Superposition. Waves add linearly, which is the whole reason interference exists. If they multiplied, there would be no pattern.',
        es: 'Superposición. Las ondas se suman linealmente, que es la razón entera de que exista la interferencia. Si se multiplicaran, no habría patrón.' },
      { eq: 'I = |ψ|²',
        en: 'What you actually see is the intensity: the square of the amplitude. Squaring is why the fringes are always positive and why the dark bands are exactly zero.',
        es: 'Lo que ves de verdad es la intensidad: el cuadrado de la amplitud. Elevar al cuadrado es la razón de que las franjas siempre sean positivas y de que las bandas oscuras sean exactamente cero.' }
    ],
    how: {
      en: 'The canvas is a grid of sample points spaced 6px apart. For each point I sum the contribution of every source, square it, and map the result to the radius and opacity of a dot. Nothing is precomputed: the whole field is evaluated every frame, which is roughly 10.000 evaluations at 60fps.',
      es: 'El canvas es una rejilla de puntos separados 6px. Para cada punto sumo la contribución de todas las fuentes, la elevo al cuadrado y mapeo el resultado al radio y la opacidad de un punto. Nada está precalculado: el campo entero se evalúa en cada frame, que son unas 10.000 evaluaciones a 60fps.' },
    watch: {
      en: 'Move the cursor over it. One of the sources follows you, so you can open and close the fringes by hand. Notice the hyperbolic shape of the dark bands: those are the points where the path difference is exactly half a wavelength.',
      es: 'Mueve el cursor encima. Una de las fuentes te sigue, así que puedes abrir y cerrar las franjas a mano. Fíjate en la forma hiperbólica de las bandas oscuras: son los puntos donde la diferencia de camino es exactamente media longitud de onda.' },
    why: {
      en: 'This is the experiment that forced physics to accept that light is a wave, and later that electrons are too. Young ran it with sunlight and a card in 1801. The same maths describes noise-cancelling headphones and the antenna array in a phone.',
      es: 'Este es el experimento que obligó a la física a aceptar que la luz es una onda, y después que los electrones también. Young lo corrió con luz solar y una tarjeta en 1801. Las mismas matemáticas describen los audífonos con cancelación de ruido y el arreglo de antenas de un teléfono.' }
  },

  galaxia: {
    tag: { en: 'Astrophysics', es: 'Astrofísica' },
    lede: {
      en: 'Give two thousand stars one law — the closer to the core, the faster the orbit — and a spiral appears. Keep watching and the arms wind up tighter and tighter, which is exactly the problem that forced astronomy to rethink what a spiral arm is.',
      es: 'Dale a dos mil estrellas una sola ley —mientras más cerca del núcleo, más rápida la órbita— y aparece una espiral. Sigue mirando y los brazos se enrollan cada vez más apretados: exactamente el problema que obligó a la astronomía a repensar qué es un brazo espiral.' },
    math: [
      { eq: 'ω(r) = ω₀ / √r',
        en: 'A Keplerian rotation curve: orbital speed set by the pull of the mass at the centre, falling with distance. Mercury laps the Sun four times while Earth finishes one orbit — same law, same reason.',
        es: 'Curva de rotación kepleriana: la velocidad orbital la fija el tirón de la masa del centro y cae con la distancia. Mercurio le da cuatro vueltas al Sol mientras la Tierra completa una: misma ley, misma razón.' },
      { eq: 'θ = θ₀ + g·ln r + ω(r)·t',
        en: 'Each star sits on a logarithmic spiral — the curve that keeps the same pitch at every scale, the one nautilus shells and hurricanes share — and then drifts along it at its own angular speed.',
        es: 'Cada estrella se sienta sobre una espiral logarítmica —la curva que mantiene el mismo paso a toda escala, la misma de las conchas de nautilus y los huracanes— y luego deriva sobre ella a su propia velocidad angular.' },
      { eq: 'y = cy + r·sin θ · cos i',
        en: 'The whole disc is projected by compressing the vertical axis by cos i, where i is the inclination. That single multiplication is what turns a flat spinning disc into a galaxy seen in perspective.',
        es: 'El disco entero se proyecta comprimiendo el eje vertical por cos i, donde i es la inclinación. Esa única multiplicación convierte un disco plano girando en una galaxia vista en perspectiva.' }
    ],
    how: {
      en: 'Two thousand stars are seeded once, denser toward the core. Each stores only its radius, its arm, its scatter and a twinkle phase — the angle is recomputed every frame from the sliders, so changing the arm count re-folds the whole galaxy instantly. Everything is drawn twice with additive compositing, a wide faint halo under a small bright core: where stars pile up the canvas saturates toward white, which is how a long-exposure photograph of a real galaxy works.',
      es: 'Dos mil estrellas se siembran una vez, más densas hacia el núcleo. Cada una guarda solo su radio, su brazo, su dispersión y una fase de parpadeo: el ángulo se recalcula en cada frame desde los deslizadores, así que cambiar el número de brazos repliega la galaxia entera al instante. Todo se dibuja dos veces con composición aditiva, un halo ancho y tenue bajo un núcleo chico y brillante: donde las estrellas se apilan el lienzo satura hacia el blanco, que es como funciona una fotografía de larga exposición de una galaxia real.' },
    watch: {
      en: 'Drag the rotation up and let it run: the inner stars overtake the outer ones and the arms stretch into ever-tighter coils. This is the winding problem — if arms were fixed sets of stars, every old galaxy would be a featureless circle by now. Real arms are density waves the stars pass through, like a jam that stays put while the cars drive through it. The cursor tilts the disc: face-on at the top, edge-on at the bottom.',
      es: 'Sube la rotación y déjalo correr: las estrellas interiores adelantan a las exteriores y los brazos se estiran en espirales cada vez más apretadas. Es el problema del enrollamiento: si los brazos fueran conjuntos fijos de estrellas, toda galaxia vieja sería ya un círculo sin rasgos. Los brazos reales son ondas de densidad que las estrellas atraviesan, como un atasco que se queda quieto mientras los autos lo cruzan. El cursor inclina el disco: de frente arriba, de canto abajo.' },
    why: {
      en: 'The winding problem is a rare case of a simulation falsifying a theory by just running. This exact model — material arms plus differential rotation — is the one that fails on screen, and its failure is what pushed Lin and Shu toward density-wave theory in 1964. Sometimes the most useful model is the one that breaks on schedule.',
      es: 'El problema del enrollamiento es un caso raro de una simulación falseando una teoría con solo correr. Este modelo exacto —brazos materiales más rotación diferencial— es el que falla en pantalla, y su falla es lo que empujó a Lin y Shu hacia la teoría de ondas de densidad en 1964. A veces el modelo más útil es el que se rompe según lo previsto.' }
  },

  lorenz: {
    tag: { en: 'Chaos theory', es: 'Teoría del caos' },
    lede: {
      en: 'Three equations with no randomness in them. Run them twice from almost the same starting point and the two paths diverge until they have nothing to do with each other. Nothing was added: the divergence was already in the equations.',
      es: 'Tres ecuaciones sin nada de azar dentro. Córrelas dos veces desde puntos de partida casi iguales y las dos trayectorias divergen hasta no tener nada que ver. No se agregó nada: la divergencia ya estaba en las ecuaciones.' },
    math: [
      { eq: 'dx/dt = σ(y − x)',
        en: 'σ is the Prandtl number. This term pulls x toward y at a rate set by the fluid viscosity.',
        es: 'σ es el número de Prandtl. Este término tira de x hacia y a una tasa que fija la viscosidad del fluido.' },
      { eq: 'dy/dt = x(ρ − z) − y',
        en: 'ρ is the Rayleigh number, the temperature difference driving the convection. Above ρ ≈ 24.74 the system stops settling and never repeats.',
        es: 'ρ es el número de Rayleigh, la diferencia de temperatura que impulsa la convección. Sobre ρ ≈ 24,74 el sistema deja de asentarse y no se repite nunca.' },
      { eq: 'dz/dt = xy − βz',
        en: 'β is a geometric factor. The classic values are σ=10, ρ=28, β=8/3, which is what runs here.',
        es: 'β es un factor geométrico. Los valores clásicos son σ=10, ρ=28, β=8/3, que son los que corren aquí.' }
    ],
    how: {
      en: 'Classical fourth-order Runge-Kutta with dt = 0.005, fourteen steps per frame so the curve advances at a readable speed. The trail keeps the last 2,600 points and fades along its length. The projection is simply x on screen-x and z on screen-y: the famous butterfly is the shadow of a three-dimensional curve. The validation suite measures the largest Lyapunov exponent of this exact scheme against the published value.',
      es: 'Runge-Kutta clásico de cuarto orden con dt = 0,005, catorce pasos por frame para que la curva avance a una velocidad legible. La estela guarda los últimos 2.600 puntos y se desvanece a lo largo. La proyección es simplemente x en la x de pantalla y z en la y: la famosa mariposa es la sombra de una curva tridimensional. La suite de validación mide el mayor exponente de Lyapunov de este mismo esquema contra el valor publicado.' },
    watch: {
      en: 'The curve never crosses itself and never closes. It orbits one wing an unpredictable number of times, jumps to the other, and comes back. Which wing it picks next is the part nobody can compute in advance.',
      es: 'La curva nunca se cruza a sí misma y nunca se cierra. Orbita un ala un número impredecible de veces, salta a la otra, y vuelve. Cuál ala elige después es la parte que nadie puede calcular por adelantado.' },
    why: {
      en: 'Lorenz found it in 1963 by restarting a weather simulation from a printout rounded to three decimals instead of six. The forecast came out completely different. That accident is why we have a word for the butterfly effect and why weather forecasts have a horizon.',
      es: 'Lorenz lo encontró en 1963 al reiniciar una simulación del clima desde una impresión redondeada a tres decimales en vez de seis. El pronóstico salió completamente distinto. Ese accidente es la razón de que exista la expresión efecto mariposa y de que los pronósticos del tiempo tengan un horizonte.' }
  },

  pendulum: {
    tag: { en: 'Classical mechanics', es: 'Mecánica clásica' },
    lede: {
      en: 'A pendulum hanging from another pendulum. Two rods, four numbers, and a system that no closed formula can solve. The first pendulum is predictable for centuries. Adding the second one breaks that permanently.',
      es: 'Un péndulo colgando de otro péndulo. Dos barras, cuatro números, y un sistema que ninguna fórmula cerrada resuelve. El primer péndulo es predecible por siglos. Agregar el segundo rompe eso para siempre.' },
    math: [
      { eq: 'L = T − V',
        en: 'The Lagrangian: kinetic minus potential energy. The equations of motion come out of it rather than from drawing force diagrams.',
        es: 'El lagrangiano: energía cinética menos potencial. Las ecuaciones de movimiento salen de ahí en vez de dibujar diagramas de fuerzas.' },
      { eq: 'd/dt (∂L/∂θ̇) − ∂L/∂θ = 0',
        en: 'Euler-Lagrange, applied to each angle. Expanding it for two coupled rods gives the pair of second-order equations the simulation integrates.',
        es: 'Euler-Lagrange, aplicada a cada ángulo. Expandirla para dos barras acopladas da el par de ecuaciones de segundo orden que integra la simulación.' },
      { eq: 'λ > 0',
        en: 'The Lyapunov exponent is positive, which is the formal definition of chaos: nearby trajectories separate exponentially rather than linearly.',
        es: 'El exponente de Lyapunov es positivo, que es la definición formal de caos: las trayectorias cercanas se separan exponencialmente en vez de linealmente.' }
    ],
    how: {
      en: 'The expanded equations are integrated with fourth-order Runge-Kutta, three steps of h = 0.05 per frame, with a damping factor of 0.9999 per step so the motion decays over minutes instead of running forever. With damping off, the validation suite measures the energy error of this scheme below 0.001 % over a minute. The tip leaves a 900-point trail that fades along its length.',
      es: 'Las ecuaciones expandidas se integran con Runge-Kutta de cuarto orden, tres pasos de h = 0,05 por frame, con un factor de amortiguación de 0,9999 por paso para que el movimiento decaiga en minutos en vez de correr para siempre. Sin amortiguación, la suite de validación mide el error de energía de este esquema bajo 0,001 % en un minuto. La punta deja una estela de 900 puntos que se desvanece a lo largo.' },
    watch: {
      en: 'The trail never repeats a shape. Grab the pendulum with the cursor and release it twice from what looks like the same spot: a sub-pixel difference in where you let go is enough, and within seconds the two runs have nothing in common.',
      es: 'La estela nunca repite una forma. Agarra el péndulo con el cursor y suéltalo dos veces desde lo que parece el mismo lugar: una diferencia de menos de un píxel en dónde lo sueltas basta, y en segundos las dos corridas no tienen nada en común.' },
    why: {
      en: 'It is the cheapest demonstration that determinism and predictability are not the same thing. Every step follows from the previous one with no randomness anywhere, and it is still impossible to say where the tip will be in thirty seconds.',
      es: 'Es la demostración más barata de que determinismo y predictibilidad no son lo mismo. Cada paso se deduce del anterior sin azar en ninguna parte, y aun así es imposible decir dónde estará la punta en treinta segundos.' }
  },

  flow: {
    tag: { en: 'Vector fields', es: 'Campos vectoriales' },
    lede: {
      en: 'Two hundred particles that know nothing. At each position they read one angle from an invisible field and take a step. The structure you see was never drawn: it is what the field looks like when enough things follow it.',
      es: 'Doscientas partículas que no saben nada. En cada posición leen un ángulo de un campo invisible y dan un paso. La estructura que ves nunca se dibujó: es cómo se ve el campo cuando suficientes cosas lo siguen.' },
    math: [
      { eq: 'θ(x,y,t) = π[sin(0.011x + 0.35t) + cos(0.013y − 0.28t)]',
        en: 'The field. Two sine waves at different spatial frequencies, both drifting in time, which is what keeps the structure from freezing.',
        es: 'El campo. Dos senoidales de distinta frecuencia espacial, ambas derivando en el tiempo, que es lo que evita que la estructura se congele.' },
      { eq: 'p ← p + (cos θ, sin θ)·v',
        en: 'Each particle steps in the direction the field gives it. No inertia, no memory: the trajectory is entirely a property of the field.',
        es: 'Cada partícula avanza en la dirección que le da el campo. Sin inercia, sin memoria: la trayectoria es enteramente una propiedad del campo.' }
    ],
    how: {
      en: 'The canvas is never cleared. Each frame it gets a black rectangle at 5.5% opacity, so old strokes fade instead of disappearing, and that fade is what produces the trails. Particles that leave the canvas or exhaust their lifetime respawn at random.',
      es: 'El canvas nunca se limpia. Cada frame recibe un rectángulo negro al 5,5% de opacidad, así los trazos viejos se desvanecen en vez de desaparecer, y ese desvanecimiento es lo que produce las estelas. Las partículas que salen del canvas o agotan su vida reaparecen al azar.' },
    watch: {
      en: 'Bright ridges form where many trajectories converge, and empty regions where the field pushes everything away. Those are the attractors and repellers of the field, visible only because something is moving through them.',
      es: 'Se forman crestas brillantes donde muchas trayectorias convergen, y regiones vacías donde el campo empuja todo hacia afuera. Esos son los atractores y repulsores del campo, visibles solo porque algo se mueve a través de ellos.' },
    why: {
      en: 'It is the same idea behind streamline plots in fluid dynamics and behind how wind maps are drawn. The field is the physics; the particles are just how you make it visible.',
      es: 'Es la misma idea detrás de los gráficos de líneas de corriente en dinámica de fluidos y de cómo se dibujan los mapas de viento. El campo es la física; las partículas son solo cómo lo haces visible.' }
  },

  rule30: {
    tag: { en: 'Cellular automata', es: 'Autómatas celulares' },
    lede: {
      en: 'One row of cells, each either on or off. One rule that looks at three neighbours and decides the cell below. Repeat. The left side settles into stripes, the right side never settles into anything.',
      es: 'Una fila de celdas, cada una encendida o apagada. Una regla que mira tres vecinas y decide la celda de abajo. Repetir. El lado izquierdo se asienta en franjas, el derecho no se asienta en nada.' },
    math: [
      { eq: 'c′ = l XOR (c OR r)',
        en: 'The whole rule. l, c and r are the three cells above. That single boolean expression is the entire program.',
        es: 'La regla completa. l, c y r son las tres celdas de arriba. Esa única expresión booleana es el programa entero.' },
      { eq: '00011110₂ = 30',
        en: 'The name: write the outputs for the eight possible neighbourhoods in order and read them as a binary number.',
        es: 'El nombre: escribe las salidas para los ocho vecindarios posibles en orden y léelas como número binario.' }
    ],
    how: {
      en: 'A Uint8Array one cell per 3px of width, starting with a single cell set in the middle. One row is drawn per frame and the array is replaced by its successor. When the bottom is reached it clears and starts over from the same single cell, and it draws exactly the same thing again.',
      es: 'Un Uint8Array de una celda por cada 3px de ancho, empezando con una sola celda encendida al medio. Se dibuja una fila por frame y el arreglo se reemplaza por su sucesor. Al llegar abajo se limpia y parte de nuevo desde la misma celda única, y dibuja exactamente lo mismo otra vez.' },
    watch: {
      en: 'The asymmetry. Same rule applied to both sides of a symmetric starting condition, and one side produces order while the other produces something that passes every statistical test for randomness.',
      es: 'La asimetría. La misma regla aplicada a los dos lados de una condición inicial simétrica, y un lado produce orden mientras el otro produce algo que pasa todos los tests estadísticos de aleatoriedad.' },
    why: {
      en: 'Wolfram used the centre column of this automaton as the random number generator in Mathematica for years. It is one line of boolean logic producing a sequence nobody has been able to predict or compress.',
      es: 'Wolfram usó la columna central de este autómata como generador de números aleatorios en Mathematica durante años. Es una línea de lógica booleana produciendo una secuencia que nadie ha podido predecir ni comprimir.' }
  },

  phyllotaxis: {
    tag: { en: 'Botany and number theory', es: 'Botánica y teoría de números' },
    lede: {
      en: 'Place each new seed at a fixed angle from the last one and push it slightly further out. Almost every angle wastes space. One angle does not, and it is the one sunflowers use.',
      es: 'Pon cada semilla nueva a un ángulo fijo de la anterior y empújala un poco más afuera. Casi cualquier ángulo desperdicia espacio. Un ángulo no, y es el que usan los girasoles.' },
    math: [
      { eq: 'φ = 137.507…°',
        en: 'The golden angle: 360° divided by the golden ratio squared. It is the most irrational number available, meaning it is the hardest to approximate with a fraction.',
        es: 'El ángulo áureo: 360° dividido por la razón áurea al cuadrado. Es el número más irracional disponible, o sea el más difícil de aproximar con una fracción.' },
      { eq: 'r = c√n,  θ = n·φ',
        en: 'Vogel\'s model. The square root is what keeps the density constant: area grows as r², so r must grow as √n for each seed to get the same room.',
        es: 'El modelo de Vogel. La raíz cuadrada es lo que mantiene la densidad constante: el área crece como r², así que r debe crecer como √n para que cada semilla tenga el mismo espacio.' }
    ],
    how: {
      en: '420 points, each drawn directly from the formula with no simulation and no state. The slow rotation is just a phase added to θ. Point size and opacity grow with the index so the outer ring reads as the newest growth.',
      es: '420 puntos, cada uno dibujado directamente de la fórmula sin simulación ni estado. La rotación lenta es solo una fase sumada a θ. El tamaño y la opacidad crecen con el índice para que el anillo exterior se lea como el crecimiento más nuevo.' },
    watch: {
      en: 'Spirals appear that nobody placed. Count them and you get Fibonacci numbers, and the count changes depending on whether you follow the clockwise or the counterclockwise family.',
      es: 'Aparecen espirales que nadie puso. Cuéntalas y salen números de Fibonacci, y la cuenta cambia según si sigues la familia horaria o la antihoraria.' },
    why: {
      en: 'The plant is not doing number theory. It grows each primordium in the largest gap available, and that local greedy rule converges on the golden angle by itself. It is one of the cleanest cases of mathematics being discovered rather than invented.',
      es: 'La planta no está haciendo teoría de números. Hace crecer cada primordio en el hueco más grande disponible, y esa regla local y codiciosa converge sola al ángulo áureo. Es uno de los casos más limpios de matemática que se descubre en vez de inventarse.' }
  },

  brownian: {
    tag: { en: 'Statistical mechanics', es: 'Mecánica estadística' },
    lede: {
      en: 'A particle with no direction of its own, hit from every side by things too small to see. It goes nowhere in particular, and how far it gets follows a law you can write down.',
      es: 'Una partícula sin dirección propia, golpeada por todos lados por cosas demasiado chicas para verse. No va a ninguna parte en particular, y cuánto se aleja sigue una ley que puedes escribir.' },
    math: [
      { eq: '⟨r²⟩ = 4Dt',
        en: 'Mean squared displacement grows linearly with time, not with time squared. That is the signature of diffusion as opposed to travel: doubling the distance takes four times as long.',
        es: 'El desplazamiento cuadrático medio crece linealmente con el tiempo, no con el tiempo al cuadrado. Esa es la firma de la difusión frente al viaje: duplicar la distancia toma cuatro veces más tiempo.' },
      { eq: 'D = kT / 6πηa',
        en: 'The Stokes-Einstein relation. It connects the jitter of one visible particle to Boltzmann\'s constant, and through it to the size of atoms.',
        es: 'La relación de Stokes-Einstein. Conecta el temblor de una partícula visible con la constante de Boltzmann, y a través de ella con el tamaño de los átomos.' }
    ],
    how: {
      en: 'Six independent walkers, three steps per frame, each step a uniform random offset in x and y clamped to the canvas. Each keeps its last 520 positions and draws them as a fading polyline.',
      es: 'Seis caminantes independientes, tres pasos por frame, cada paso un desplazamiento aleatorio uniforme en x e y acotado al canvas. Cada uno guarda sus últimas 520 posiciones y las dibuja como una polilínea que se desvanece.' },
    watch: {
      en: 'The paths look like they have structure, with long runs and tight clusters. They do not. Every step is independent of the last, and the apparent structure is what randomness actually looks like when you draw it.',
      es: 'Los caminos parecen tener estructura, con tramos largos y grumos apretados. No la tienen. Cada paso es independiente del anterior, y la estructura aparente es cómo se ve realmente el azar cuando lo dibujas.' },
    why: {
      en: 'In 1905 Einstein wrote down how far such a particle should drift. Perrin measured it, got Avogadro\'s number out of it, and that settled the argument about whether atoms were real objects or just a convenient accounting device.',
      es: 'En 1905 Einstein escribió cuánto debía derivar una partícula así. Perrin lo midió, sacó de ahí el número de Avogadro, y eso zanjó la discusión sobre si los átomos eran objetos reales o solo un artificio de contabilidad.' }
  },

  fourier: {
    tag: { en: 'Harmonic analysis', es: 'Análisis armónico' },
    lede: {
      en: 'A circle turning on the rim of another circle, on another, on another. Add enough of them at the right sizes and speeds and the tip traces a square wave: a shape with corners, drawn entirely by things with none.',
      es: 'Un círculo girando en el borde de otro círculo, sobre otro, sobre otro. Suma suficientes con los tamaños y velocidades correctos y la punta traza una onda cuadrada: una forma con esquinas, dibujada enteramente por cosas que no tienen ninguna.' },
    math: [
      { eq: 'f(t) = Σ (4/nπ)·sin(nt),  n odd',
        en: 'The square wave as a sum of sines. Only odd harmonics, each with amplitude falling as 1/n, which is why the series converges so slowly.',
        es: 'La onda cuadrada como suma de senos. Solo armónicos impares, cada uno con amplitud cayendo como 1/n, que es la razón de que la serie converja tan lento.' },
      { eq: 'radius = 4/nπ',
        en: 'Each circle in the chain is one term of that sum. Its radius is the amplitude and its rotation rate is the frequency.',
        es: 'Cada círculo de la cadena es un término de esa suma. Su radio es la amplitud y su velocidad de giro es la frecuencia.' }
    ],
    how: {
      en: 'Six circles, computed and drawn from scratch each frame: start at the centre, for each term add a rotating offset, and draw both the circle and the arm. The vertical position of the last tip is pushed into a buffer and plotted to the right, which is the waveform.',
      es: 'Seis círculos, calculados y dibujados desde cero en cada frame: parte del centro, por cada término suma un desplazamiento rotatorio, y dibuja tanto el círculo como el brazo. La posición vertical de la última punta se guarda en un buffer y se grafica a la derecha, que es la forma de onda.' },
    watch: {
      en: 'The ripple near the corners never goes away. Adding more circles makes it narrower but not shorter: it overshoots by about 9% no matter how many terms you use. That is the Gibbs phenomenon, and it is a property of the series rather than a bug.',
      es: 'La ondulación cerca de las esquinas nunca desaparece. Agregar más círculos la hace más angosta pero no más baja: se pasa alrededor de un 9% sin importar cuántos términos uses. Eso es el fenómeno de Gibbs, y es una propiedad de la serie y no un error.' },
    why: {
      en: 'Fourier claimed in 1807 that any function could be written this way and was rejected by the leading mathematicians of his time. The claim was too strong as stated, but the corrected version underpins JPEG, MP3, MRI, and essentially every signal processing system built since.',
      es: 'Fourier afirmó en 1807 que cualquier función podía escribirse así y fue rechazado por los matemáticos más importantes de su época. La afirmación era demasiado fuerte tal como estaba, pero la versión corregida sostiene JPEG, MP3, la resonancia magnética, y esencialmente todo sistema de procesamiento de señales construido desde entonces.' }
  },

  relativity: {
    tag: { en: 'Special relativity', es: 'Relatividad especial' },
    lede: {
      en: 'A photon bouncing between two mirrors is a clock. Put that clock on a moving train and the photon has to travel diagonally, which is a longer path at the same speed. So the clock ticks slower. That is the whole argument.',
      es: 'Un fotón rebotando entre dos espejos es un reloj. Pon ese reloj en un tren en movimiento y el fotón tiene que viajar en diagonal, que es un camino más largo a la misma velocidad. Entonces el reloj va más lento. Ese es el argumento entero.' },
    math: [
      { eq: 'γ = 1/√(1 − β²)',
        en: 'The Lorentz factor, with β = v/c. At β = 0.6 it is 1.25; at 0.99 it is 7.1. It blows up at β = 1, which is why nothing with mass gets there.',
        es: 'El factor de Lorentz, con β = v/c. En β = 0,6 vale 1,25; en 0,99 vale 7,1. Explota en β = 1, que es la razón de que nada con masa llegue ahí.' },
      { eq: 'Δt = γ·Δτ',
        en: 'Coordinate time against proper time. τ is what the moving clock reads; t is what you read. The counters in the corner drift apart by exactly this factor.',
        es: 'Tiempo coordenado contra tiempo propio. τ es lo que marca el reloj móvil; t es lo que marcas tú. Los contadores de la esquina se separan exactamente por este factor.' },
      { eq: 'L = L₀/γ',
        en: 'Length contraction, the same factor upside down. The moving clock is drawn shorter for that reason, not for perspective.',
        es: 'Contracción de longitud, el mismo factor al revés. El reloj móvil se dibuja más corto por eso, no por perspectiva.' }
    ],
    how: {
      en: 'Two clocks are drawn. The one at rest bounces its photon straight up and down; the moving one is carried sideways while its photon bounces, and its position is recorded frame by frame so the diagonal path draws itself. The only relativistic line in the whole thing is that the moving clock advances its phase by dt/gamma. The contracted ruler underneath is drawn separately, because contraction acts along the motion while the mirror separation is perpendicular to it and does not change.',
      es: 'Se dibujan dos relojes. El que esta en reposo rebota su foton recto arriba y abajo; el que se mueve es arrastrado de lado mientras su foton rebota, y su posicion se registra frame a frame para que el camino diagonal se dibuje solo. La unica linea relativista en todo esto es que el reloj movil avanza su fase en dt/gamma. La regla contraida de abajo se dibuja aparte, porque la contraccion actua a lo largo del movimiento mientras que la separacion entre espejos es perpendicular y no cambia.' },
    watch: {
      en: 'The view slider. At 1 (the default) it is the SAME clock seen from two frames: its own on top, yours below. The bounces are the SAME EVENTS, so both dots rise and fall exactly together, verified at 0.000000 px of drift. What differs is the path: H on top, gamma-H below. The animation runs on YOUR clock, so the bottom dot always moves at c no matter what beta does, while the top one slows to c/gamma: what you see slowing down is the rocket clock running slow. Move the slider and both panels respond. That is why your clock reads more: t/tau comes out as gamma, and that number is MEASURED off the drawing, not computed from the formula. At 0 the question changes: two separate clocks in one frame, and there both photons do move at the same on-screen speed, with the travelling one bouncing less often. Both views are correct and cannot coexist: bouncing together, moving at the same on-screen speed, and covering different distances are three things you can only ever have two of.',
      es: 'El deslizador de vista. En 1 (por defecto) es el MISMO reloj visto desde dos marcos: arriba en el suyo, abajo en el tuyo. Los rebotes son los MISMOS EVENTOS, asi que las dos bolitas suben y bajan exactamente juntas, verificado en 0.000000 px de desfase. Lo que cambia es el camino: H arriba, gamma-H abajo. La animacion corre sobre TU reloj, asi que la bolita de abajo va siempre a c pase lo que pase con beta, y la de arriba se frena a c/gamma: eso que ves frenarse es el reloj del cohete corriendo lento. Mueve el deslizador y los dos paneles reaccionan. Por eso tu reloj marca mas: t/tau sale gamma, y ese numero esta MEDIDO del dibujo, no calculado con la formula. En 0 cambia la pregunta: dos relojes distintos en un solo marco, y ahi los dos fotones si van a la misma rapidez en pantalla, con el que viaja rebotando menos seguido. Las dos vistas son correctas y no pueden coexistir: rebotar a la vez, ir a la misma rapidez en pantalla y recorrer distinto camino son tres cosas de las que solo puedes tener dos.' },

    why: {
      en: 'Einstein got here in 1905 from two assumptions: physics works the same in every inertial frame, and light has the same speed in all of them. Everything else, including E=mc², is bookkeeping from there. GPS satellites correct for this daily or positions would drift kilometres.',
      es: 'Einstein llegó acá en 1905 desde dos supuestos: la física funciona igual en todo marco inercial, y la luz tiene la misma velocidad en todos. Todo lo demás, incluido E=mc², es contabilidad desde ahí. Los satélites GPS corrigen esto a diario o las posiciones se irían kilómetros.' }
  },

  spacetime: {
    tag: { en: 'General relativity', es: 'Relatividad general' },
    lede: {
      en: 'There is no force in this simulation. The grid is bent by mass and the particles just go straight through it. What looks like attraction is geometry.',
      es: 'No hay ninguna fuerza en esta simulación. La rejilla está doblada por la masa y las partículas simplemente van derecho por ella. Lo que parece atracción es geometría.' },
    math: [
      { eq: 'G_μν = 8πG/c⁴ · T_μν',
        en: 'The Einstein field equations. Left side is curvature, right side is what is there. Matter tells spacetime how to bend; spacetime tells matter how to move.',
        es: 'Las ecuaciones de campo de Einstein. El lado izquierdo es curvatura, el derecho es lo que hay ahí. La materia le dice al espaciotiempo cómo doblarse; el espaciotiempo le dice a la materia cómo moverse.' },
      { eq: 'r_s = 2GM/c²',
        en: 'The Schwarzschild radius. Compress a mass inside it and the curvature closes on itself. For the Sun that is about three kilometres.',
        es: 'El radio de Schwarzschild. Comprime una masa dentro de él y la curvatura se cierra sobre sí misma. Para el Sol son unos tres kilómetros.' },
      { eq: 'δ = 4GM/c²b',
        en: 'Light deflection past a mass. Eddington measured it on the Sun during the 1919 eclipse and got twice the Newtonian value, which is what made Einstein famous overnight.',
        es: 'Desviación de la luz al pasar cerca de una masa. Eddington la midió en el Sol durante el eclipse de 1919 y obtuvo el doble del valor newtoniano, que es lo que hizo famoso a Einstein de un día para otro.' }
    ],
    how: {
      en: 'The surface is Flamm paraboloid, z(r) = 2√(r_s(r − r_s)): the exact embedding of the Schwarzschild metric, drawn as a polar mesh of rings and spokes and projected with a tilt. The throat is the horizon. Real curvature is four-dimensional and has no outside to bulge into, so an embedding diagram is the honest way to draw it. Particles are integrated with Newtonian gravity in the flat plane and then projected onto the surface.',
      es: 'La superficie es el paraboloide de Flamm, z(r) = 2√(r_s(r − r_s)): el embebimiento exacto de la métrica de Schwarzschild, dibujado como malla polar de anillos y radios y proyectado con inclinación. La garganta es el horizonte. La curvatura real es de cuatro dimensiones y no tiene un afuera hacia donde abultarse, así que un diagrama de embebimiento es la forma honesta de dibujarla. Las partículas se integran con gravedad newtoniana en el plano y después se proyectan a la superficie.' },
    watch: {
      en: 'The mass follows your cursor, so you can drag the whole funnel around under the orbits. Widen the Schwarzschild radius and the throat opens; flatten the view angle and the surface collapses to the flat plane it would be with no mass at all.',
      es: 'La masa sigue tu cursor, así que puedes arrastrar el embudo entero por debajo de las órbitas. Ensancha el radio de Schwarzschild y la garganta se abre; aplana el ángulo de vista y la superficie colapsa al plano que sería sin masa.' },
    why: {
      en: 'It replaced a force acting instantly at a distance with a field that bends and propagates at the speed of light. That prediction, gravitational waves, was confirmed in 2015 by LIGO measuring a length change a thousand times smaller than a proton.',
      es: 'Reemplazó una fuerza que actuaba al instante a distancia por un campo que se dobla y se propaga a la velocidad de la luz. Esa predicción, las ondas gravitacionales, se confirmó en 2015 cuando LIGO midió un cambio de longitud mil veces menor que un protón.' }
  },

  quantum: {
    tag: { en: 'Quantum mechanics', es: 'Mecánica cuántica' },
    lede: {
      en: 'Trap a particle between two walls and it can only have certain energies. Put it in two of them at once and the probability starts sloshing back and forth, forever, with no energy going anywhere.',
      es: 'Atrapa una partícula entre dos paredes y solo puede tener ciertas energías. Ponla en dos de ellas a la vez y la probabilidad empieza a chapotear de un lado a otro, para siempre, sin que la energía vaya a ninguna parte.' },
    math: [
      { eq: 'φₙ(x) = √(2/L)·sin(nπx/L)',
        en: 'The stationary states of an infinite well. They are the only shapes that fit with zero at both walls, which is why n has to be a whole number.',
        es: 'Los estados estacionarios de un pozo infinito. Son las únicas formas que calzan con cero en las dos paredes, y por eso n tiene que ser entero.' },
      { eq: 'Eₙ = n²π²ħ²/2mL²',
        en: 'Energy grows as n², not n. That quadratic gap is what makes the two states beat against each other at a visible rate.',
        es: 'La energía crece como n², no como n. Esa separación cuadrática es lo que hace que los dos estados batan entre sí a un ritmo visible.' },
      { eq: 'ψ = a·φ₁e^(−iE₁t/ħ) + b·φ₂e^(−iE₂t/ħ)',
        en: 'A superposition. Each piece rotates in the complex plane at its own rate, and the interference between them is the motion you see.',
        es: 'Una superposición. Cada pieza rota en el plano complejo a su propio ritmo, y la interferencia entre ellas es el movimiento que ves.' }
    ],
    how: {
      en: 'No integration at all: the solution is exact, so each frame evaluates the closed form at 220 points. Three curves are drawn: the real part, the imaginary part, and |ψ|² on top. The first two are not observable and are drawn faint on purpose.',
      es: 'Sin integración de ningún tipo: la solución es exacta, así que cada frame evalúa la forma cerrada en 220 puntos. Se dibujan tres curvas: la parte real, la imaginaria, y |ψ|² encima. Las dos primeras no son observables y se dibujan tenues a propósito.' },
    watch: {
      en: 'Set n₁ and n₂ to the same number and the motion stops dead: a single stationary state has a probability that does not depend on time. That is what stationary means, and it is why atoms do not radiate away.',
      es: 'Pon n₁ y n₂ en el mismo número y el movimiento se detiene en seco: un solo estado estacionario tiene una probabilidad que no depende del tiempo. Eso es lo que significa estacionario, y es la razón de que los átomos no se desintegren radiando.' },
    why: {
      en: 'This is the simplest system where quantisation falls out of the maths instead of being assumed. The walls are what force it: confinement plus a wave equation gives discrete energies, and that is the origin of every atomic spectrum ever measured.',
      es: 'Este es el sistema más simple donde la cuantización sale de las matemáticas en vez de suponerse. Las paredes son las que la fuerzan: confinamiento más una ecuación de onda da energías discretas, y ese es el origen de todo espectro atómico jamás medido.' }
  },

  oscillators: {
    tag: { en: 'Classical mechanics', es: 'Mecánica clásica' },
    lede: {
      en: 'Two masses joined by a spring. Start one moving and the other stays still, for a while. Then the energy has crossed over completely and the first one is the one at rest.',
      es: 'Dos masas unidas por un resorte. Pon una en movimiento y la otra se queda quieta, por un rato. Después la energía cruzó completa y la que está en reposo es la primera.' },
    math: [
      { eq: 'm₁ẍ₁ = −kx₁ − k_c(x₁ − x₂)',
        en: 'Newton for the first mass: its own spring plus the coupling. The second equation is the mirror image.',
        es: 'Newton para la primera masa: su propio resorte más el acoplamiento. La segunda ecuación es la imagen espejo.' },
      { eq: 'ω± = √(k/m), √((k+2k_c)/m)',
        en: 'The two normal modes: both masses moving together, and both moving against each other. Any motion at all is a mix of exactly these two.',
        es: 'Los dos modos normales: las dos masas moviéndose juntas, y las dos moviéndose en contra. Cualquier movimiento es una mezcla de exactamente esos dos.' },
      { eq: 'f_beat = (ω₊ − ω₋)/2π',
        en: 'The beat frequency is the difference between the modes. Weaker coupling means slower handover, which is why the slider changes the rhythm and not the pitch.',
        es: 'La frecuencia de batido es la diferencia entre los modos. Menos acoplamiento significa traspaso más lento, y por eso el deslizador cambia el ritmo y no el tono.' }
    ],
    how: {
      en: 'Two second-order equations integrated with a fixed step, three substeps per frame. The two traces at the bottom are the displacement history of each mass, and the beating is visible there long before you notice it in the masses themselves.',
      es: 'Dos ecuaciones de segundo orden integradas con paso fijo, tres subpasos por frame. Las dos trazas de abajo son la historia de desplazamiento de cada masa, y el batido se ve ahí mucho antes de que lo notes en las masas mismas.' },
    watch: {
      en: 'Turn the coupling to zero and the handover stops: two independent oscillators that never talk. Turn it up and they trade energy so fast the two motions blur into one.',
      es: 'Baja el acoplamiento a cero y el traspaso se detiene: dos osciladores independientes que nunca se hablan. Súbelo y se pasan la energía tan rápido que los dos movimientos se funden en uno.' },
    why: {
      en: 'Normal modes are how you solve any system of coupled linear oscillators: find the combinations that do not talk to each other, then everything decouples. Molecules, bridges, circuits and crystal lattices are all this problem with more indices.',
      es: 'Los modos normales son cómo se resuelve cualquier sistema de osciladores lineales acoplados: encontrar las combinaciones que no se hablan entre sí, y ahí todo se desacopla. Moléculas, puentes, circuitos y redes cristalinas son este mismo problema con más índices.' }
  },

  kepler: {
    tag: { en: 'Astronomy', es: 'Astronomía' },
    lede: {
      en: 'Planets do not move at a constant speed and their orbits are not circles. Kepler worked that out from Tycho\'s tables alone, decades before anyone could explain why.',
      es: 'Los planetas no se mueven a velocidad constante y sus órbitas no son círculos. Kepler dedujo eso solo de las tablas de Tycho, décadas antes de que alguien pudiera explicar por qué.' },
    math: [
      { eq: 'r = a(1 − e²)/(1 + e·cos θ)',
        en: 'First law: the orbit is an ellipse with the star at one focus, not at the centre. e is the eccentricity the slider controls.',
        es: 'Primera ley: la órbita es una elipse con la estrella en un foco, no en el centro. e es la excentricidad que controla el deslizador.' },
      { eq: 'dA/dt = constant',
        en: 'Second law: equal areas in equal times. The shaded wedges are drawn at a fixed number of frames apart, so they are all the same area even though they look different.',
        es: 'Segunda ley: áreas iguales en tiempos iguales. Las cuñas sombreadas se dibujan separadas por un número fijo de frames, así que todas tienen la misma área aunque se vean distintas.' },
      { eq: 'T² ∝ a³',
        en: 'Third law. It is why the outer planets in the simulation crawl and the inner ones sprint, without that ever being programmed in.',
        es: 'Tercera ley. Es la razón de que los planetas exteriores de la simulación se arrastren y los interiores corran, sin que eso esté programado en ninguna parte.' }
    ],
    how: {
      en: 'The three laws are not coded. Only Newtonian gravity is, integrated with leapfrog (kick-drift-kick) at 64 sub-steps per frame, and the ellipses, the varying speed and the period ratios all fall out of it. Leapfrog conserves angular momentum exactly, which is why the swept wedges, drawn from the stored path at a fixed frame spacing, have equal areas to machine precision.',
      es: 'Las tres leyes no están programadas. Solo está la gravedad newtoniana, integrada con leapfrog (impulso-deriva-impulso) a 64 subpasos por frame, y las elipses, la velocidad variable y las razones de período salen todas de ahí. Leapfrog conserva exactamente el momento angular, y por eso las cuñas barridas, dibujadas desde el camino guardado con una separación fija de frames, tienen áreas iguales a precisión de máquina.' },
    watch: {
      en: 'Your cursor is a second mass. Bring it near an orbit and you can pull a planet into a completely different one, or throw it out of the system entirely. That instability is the three-body problem in miniature.',
      es: 'Tu cursor es una segunda masa. Acércalo a una órbita y puedes arrastrar un planeta a otra completamente distinta, o expulsarlo del sistema. Esa inestabilidad es el problema de los tres cuerpos en miniatura.' },
    why: {
      en: 'Kepler spent years fitting circles to Mars and failing by eight arcminutes. He trusted the data over the shape everyone assumed was perfect, and that decision is where modern astronomy starts.',
      es: 'Kepler pasó años ajustando círculos a Marte y fallando por ocho minutos de arco. Le creyó a los datos por sobre la forma que todos daban por perfecta, y en esa decisión empieza la astronomía moderna.' }
  },

  neural: {
    tag: { en: 'Neural networks', es: 'Redes neuronales' },
    lede: {
      en: 'This is the picture people mean when they say a network activates. Two numbers go in on the left, and every neuron downstream lights up in proportion to how strongly it responds. The signal sweeps left to right, layer by layer.',
      es: 'Esta es la imagen que la gente tiene en mente cuando dice que una red se activa. Dos numeros entran por la izquierda, y cada neurona rio abajo se enciende en proporcion a cuanto responde. La senal barre de izquierda a derecha, capa por capa.' },
    math: [
      { eq: 'a⁽ˡ⁾ = tanh(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)',
        en: 'One layer. A matrix multiply, a bias, and a squashing function. Stack it and that is the whole forward pass.',
        es: 'Una capa. Una multiplicacion de matriz, un sesgo, y una funcion que aplasta. Apilala y eso es todo el paso hacia adelante.' },
      { eq: 'tanh(z) ∈ (−1, 1)',
        en: 'The squashing is what matters. Without it every layer collapses into a single linear map and depth buys you nothing at all.',
        es: 'El aplastamiento es lo que importa. Sin el cada capa colapsa en un solo mapa lineal y la profundidad no te compra nada.' },
      { eq: 'flow ∝ |w·a|',
        en: 'What the edges draw. A connection is bright when it has both a large weight and an active source, which is what makes some paths through the network visibly dominate.',
        es: 'Lo que dibujan las aristas. Una conexion brilla cuando tiene a la vez un peso grande y una fuente activa, y eso es lo que hace que algunos caminos por la red dominen a la vista.' }
    ],

    how: {
      en: 'Weights are random rather than trained: the point here is the shape of the computation, not the answer. Each frame runs a full forward pass, then draws every connection with opacity proportional to how much signal is flowing through it and every node sized by its activation. A sweeping front gates the layers so you can see the order things happen in.',
      es: 'Los pesos son aleatorios y no entrenados: aca lo que importa es la forma del computo, no la respuesta. Cada frame corre un paso hacia adelante completo, y despues dibuja cada conexion con opacidad proporcional a cuanta senal pasa por ella y cada nodo con tamano segun su activacion. Un frente que barre habilita las capas para que se vea el orden en que ocurren las cosas.' },
    watch: {
      en: 'Move the cursor: it is the input. Small moves near the middle barely change anything and then a whole branch of the network suddenly switches sign. That sensitivity is where nonlinearity lives, and it is why a network can do things a straight line cannot.',
      es: 'Mueve el cursor: es la entrada. Movimientos chicos cerca del centro casi no cambian nada y de pronto una rama entera de la red cambia de signo. Esa sensibilidad es donde vive la no linealidad, y es la razon de que una red pueda hacer cosas que una recta no.' },
    why: {
      en: 'Every large model is this picture with more layers and vastly more nodes. Nothing else about the mechanism changes: numbers come in, get multiplied by weights, get squashed, and move right. Seeing it at nine neurons per layer makes the rest less mysterious.',
      es: 'Todo modelo grande es esta misma imagen con mas capas y muchisimos mas nodos. Nada mas del mecanismo cambia: entran numeros, se multiplican por pesos, se aplastan, y avanzan a la derecha. Verlo con nueve neuronas por capa hace que el resto sea menos misterioso.' }
  },

  mandelbrot: {
    tag: { en: 'Fractals', es: 'Fractales' },
    lede: {
      en: 'Take a number, square it, add the one you started with. Repeat. Some numbers stay near the origin forever and some run off to infinity, and the border between those two sets is this.',
      es: 'Toma un numero, elevalo al cuadrado, sumale el que empezaste. Repite. Algunos numeros se quedan cerca del origen para siempre y otros se van al infinito, y la frontera entre esos dos conjuntos es esto.' },
    math: [
      { eq: 'z_{n+1} = z_n² + c,  z₀ = 0',
        en: 'The entire definition. c is the pixel you are looking at, treated as a complex number. There is nothing else in the rule.',
        es: 'La definicion entera. c es el pixel que estas mirando, tratado como numero complejo. No hay nada mas en la regla.' },
      { eq: '|z| > 2 ⟹ escapes',
        en: 'A proven bound: once the orbit leaves the disc of radius two it can never come back. That is what makes the set computable at all.',
        es: 'Una cota demostrada: una vez que la orbita sale del disco de radio dos ya no puede volver. Eso es lo que hace calculable el conjunto.' },
      { eq: 'μ = n + 1 − log₂(log|z|)',
        en: 'Smooth escape count. Using the raw integer n gives visible bands; this continuous version removes them and is why the gradients look clean.',
        es: 'Conteo de escape suavizado. Usar el entero n crudo deja bandas visibles; esta version continua las elimina y es la razon de que los degradados se vean limpios.' }
    ],
    how: {
      en: 'The set is rendered into an ImageData buffer and scaled up. The interesting part is the caching: the buffer is only recomputed when the view actually changes, so panning is expensive and sitting still is free. Without that this would eat a full core.',
      es: 'El conjunto se renderiza en un buffer ImageData y se escala. La parte interesante es el cacheo: el buffer solo se recalcula cuando la vista cambia de verdad, asi que desplazarse cuesta y quedarse quieto es gratis. Sin eso esto se comeria un nucleo entero.' },
    watch: {
      en: 'Move the cursor to drift the view and raise the zoom. The default centre is a Misiurewicz point, where the boundary is self-similar: keep zooming and you keep finding the same structure at every scale. Raise the iterations when the detail starts to smear.',
      es: 'Mueve el cursor para desplazar la vista y sube el zoom. El centro por defecto es un punto de Misiurewicz, donde la frontera es autosimilar: sigue haciendo zoom y sigues encontrando la misma estructura a toda escala. Sube las iteraciones cuando el detalle empiece a emborronarse.' },
    why: {
      en: 'Mandelbrot could only see this because he had a computer at IBM in 1980. It is the clearest case of a shape too complex for anyone to have drawn by hand, generated by a rule short enough to memorise.',
      es: 'Mandelbrot solo pudo ver esto porque tenia un computador en IBM en 1980. Es el caso mas claro de una forma demasiado compleja para que alguien la dibujara a mano, generada por una regla lo bastante corta como para memorizarla.' }
  },

  julia: {
    tag: { en: 'Fractals', es: 'Fractales' },
    lede: {
      en: 'The same squaring rule, but now the constant is fixed and the starting point is the pixel. Every value of that constant gives a completely different shape, and the cursor sweeps through them.',
      es: 'La misma regla de elevar al cuadrado, pero ahora la constante es fija y el punto de partida es el pixel. Cada valor de esa constante da una forma completamente distinta, y el cursor las recorre.' },
    math: [
      { eq: 'z_{n+1} = z_n² + c,  z₀ = pixel',
        en: 'Identical iteration to Mandelbrot, with the roles swapped: there c was the pixel, here c is a constant you choose and the pixel is where the orbit starts.',
        es: 'Iteracion identica a Mandelbrot, con los roles cambiados: alla c era el pixel, aca c es una constante que eliges y el pixel es donde arranca la orbita.' },
      { eq: 'c ∈ M ⟺ J_c connected',
        en: 'The two sets are linked. If c is inside the Mandelbrot set the Julia set is one connected piece; if it is outside the Julia set shatters into dust.',
        es: 'Los dos conjuntos estan ligados. Si c esta dentro del conjunto de Mandelbrot el de Julia es una pieza conexa; si esta fuera el de Julia se hace polvo.' }
    ],
    how: {
      en: 'Same escape-time loop and same smoothing as the Mandelbrot, same caching by view key. The only difference is which of the two numbers is held fixed, which is about four characters of code.',
      es: 'El mismo bucle de tiempo de escape y el mismo suavizado que el Mandelbrot, el mismo cacheo por clave de vista. La unica diferencia es cual de los dos numeros se mantiene fijo, que son unos cuatro caracteres de codigo.' },
    watch: {
      en: 'Move slowly near the edge of the shape. There is a boundary in cursor position where the figure stops being one connected object and explodes into disconnected dust. That transition is the Mandelbrot boundary, seen from the other side.',
      es: 'Muevete despacio cerca del borde de la forma. Hay una frontera en la posicion del cursor donde la figura deja de ser un objeto conexo y estalla en polvo disconexo. Esa transicion es la frontera de Mandelbrot, vista desde el otro lado.' },
    why: {
      en: 'Julia and Fatou worked these out around 1918 with no way to see them. They proved the structure existed and described it in writing, sixty years before anyone could render one.',
      es: 'Julia y Fatou dedujeron esto alrededor de 1918 sin ninguna forma de verlo. Demostraron que la estructura existia y la describieron por escrito, sesenta anos antes de que alguien pudiera dibujar una.' }
  },

  wormhole: {
    tag: { en: 'General relativity', es: 'Relatividad general' },
    lede: {
      en: 'Two regions of space joined by a tunnel that is shorter than the distance between them. Nothing in general relativity forbids the geometry. Keeping it open is the hard part.',
      es: 'Dos regiones del espacio unidas por un tunel mas corto que la distancia que las separa. Nada en la relatividad general prohibe la geometria. Mantenerla abierta es la parte dificil.' },
    math: [
      { eq: 'ds² = −c²dt² + dl² + (b₀² + l²)dΩ²',
        en: 'The Morris-Thorne metric. l is proper radial distance and runs from minus to plus infinity: it passes straight through the throat instead of stopping at it, which is what makes this traversable rather than a black hole.',
        es: 'La metrica de Morris-Thorne. l es distancia radial propia y va de menos a mas infinito: atraviesa la garganta en vez de detenerse en ella, y eso es lo que la hace transitable en vez de un agujero negro.' },
      { eq: 'r(l) = √(b₀² + l²)',
        en: 'The circumferential radius. At l = 0 it reaches its minimum b₀, the throat, and grows on both sides. There is no singularity anywhere and no horizon.',
        es: 'El radio circunferencial. En l = 0 alcanza su minimo b₀, la garganta, y crece hacia ambos lados. No hay singularidad en ninguna parte ni horizonte.' },
      { eq: 'z(l) = b₀·arcsinh(l/b₀)',
        en: 'The embedding height, obtained by integrating the shape function b(r) = b₀²/r. This is the exact surface drawn on screen, not an artistic hourglass.',
        es: 'La altura de embebimiento, obtenida integrando la funcion de forma b(r) = b₀²/r. Esta es la superficie exacta que se dibuja en pantalla, no un reloj de arena artistico.' },
      { eq: 'ρ + p < 0',
        en: 'The catch. Holding the throat open requires matter that violates the null energy condition, meaning negative energy density as measured by a passing light ray. Nothing known does this in bulk.',
        es: 'El problema. Mantener la garganta abierta exige materia que viola la condicion de energia nula, o sea densidad de energia negativa medida por un rayo de luz que pasa. Nada conocido hace esto a granel.' }
    ],
    how: {
      en: 'The surface is generated from the metric rather than drawn by hand: rings of constant l and meridians of constant angle, each vertex placed at r(l) and z(l). Rings are sorted by height before drawing so the far side of the tunnel renders behind the near side. The travellers advance at constant rate in l, which is proper distance, so they cross the throat and come out the other sheet without anything special happening at l = 0.',
      es: 'La superficie se genera desde la metrica y no se dibuja a mano: anillos de l constante y meridianos de angulo constante, con cada vertice puesto en r(l) y z(l). Los anillos se ordenan por altura antes de dibujar para que el lado lejano del tunel quede detras del cercano. Los viajeros avanzan a ritmo constante en l, que es distancia propia, asi que cruzan la garganta y salen por la otra hoja sin que pase nada especial en l = 0.' },
    watch: {
      en: 'Follow one traveller all the way through. It descends one sheet, passes the bright ring at the narrowest point and keeps going into the other sheet without turning around or slowing down. That is the whole difference from a black hole: the throat is a place you pass through, not a place you end.',
      es: 'Sigue a un viajero hasta el final. Baja por una hoja, pasa el anillo brillante del punto mas angosto y sigue hacia la otra hoja sin dar vuelta ni frenar. Esa es toda la diferencia con un agujero negro: la garganta es un lugar por donde se pasa, no un lugar donde se termina.' },
    why: {
      en: 'Morris and Thorne wrote this down in 1988 because Carl Sagan asked them for a way to move a character across the galaxy in Contact without breaking physics. They worked backwards: assume the trip is possible, then derive what the metric and the matter would have to be. The answer was a clean geometry and an impossible material, and that paper started the modern field.',
      es: 'Morris y Thorne escribieron esto en 1988 porque Carl Sagan les pidio una forma de mover un personaje a traves de la galaxia en Contact sin romper la fisica. Trabajaron al reves: suponer que el viaje es posible, y de ahi deducir como tendrian que ser la metrica y la materia. La respuesta fue una geometria limpia y un material imposible, y ese paper inicio el campo moderno.' }
  },

  hawking: {
    tag: { en: 'Black hole thermodynamics', es: 'Termodinamica de agujeros negros' },
    lede: {
      en: 'Empty space is not empty: pairs of particles appear and annihilate constantly. Do that right at a horizon and sometimes one falls in while the other escapes, and the hole pays for it.',
      es: 'El espacio vacio no esta vacio: pares de particulas aparecen y se aniquilan constantemente. Haz eso justo en un horizonte y a veces una cae mientras la otra escapa, y el agujero lo paga.' },
    math: [
      { eq: 'T = ħc³/(8πGMk_B)',
        en: 'The Hawking temperature, inversely proportional to mass. A hole the mass of the Sun is at 60 nanokelvin, colder than the cosmic background, so it absorbs more than it radiates.',
        es: 'La temperatura de Hawking, inversamente proporcional a la masa. Un agujero con la masa del Sol esta a 60 nanokelvin, mas frio que el fondo cosmico, asi que absorbe mas de lo que radia.' },
      { eq: 'L ∝ 1/M²',
        en: 'Luminosity. Losing mass raises the temperature, which raises the output, which loses mass faster. The process runs away instead of settling.',
        es: 'Luminosidad. Perder masa sube la temperatura, que sube la emision, que hace perder masa mas rapido. El proceso se dispara en vez de asentarse.' },
      { eq: 't_evap ∝ M³',
        en: 'Integrating that gives the lifetime. A solar mass hole would take 10⁶⁷ years, far longer than the age of the universe. A mountain-mass one would be ending about now.',
        es: 'Integrar eso da el tiempo de vida. Un agujero de masa solar tardaria 10⁶⁷ anos, mucho mas que la edad del universo. Uno con la masa de una montana estaria terminando ahora.' }
    ],
    how: {
      en: 'Pairs are spawned at the horizon radius and separated: the outward one drifts away and fades, the inward one sinks. Mass is integrated with dM/dt proportional to minus one over M squared, which is what makes the collapse accelerate on its own. When the mass runs out there is a flash and it restarts.',
      es: 'Los pares nacen en el radio del horizonte y se separan: el que va hacia afuera se aleja y se desvanece, el que va hacia adentro se hunde. La masa se integra con dM/dt proporcional a menos uno sobre M al cuadrado, que es lo que hace que el colapso se acelere solo. Cuando se acaba la masa hay un destello y vuelve a empezar.' },
    watch: {
      en: 'The pace. It sits there for a long time barely radiating, and then the last stretch happens fast and ends in a burst. That asymmetry is the whole physics: the final second of a black hole releases more energy than everything before it.',
      es: 'El ritmo. Se queda ahi mucho rato apenas radiando, y despues el ultimo tramo pasa rapido y termina en un estallido. Esa asimetria es toda la fisica: el ultimo segundo de un agujero negro libera mas energia que todo lo anterior.' },
    why: {
      en: 'Hawking derived this in 1974 and it broke something. General relativity says a black hole has no properties beyond mass, charge and spin, so if it evaporates completely the information about what fell in appears to be gone, which quantum mechanics forbids. That paradox is still open.',
      es: 'Hawking dedujo esto en 1974 y rompio algo. La relatividad general dice que un agujero negro no tiene mas propiedades que masa, carga y giro, asi que si se evapora del todo la informacion sobre lo que cayo parece haberse perdido, y la mecanica cuantica lo prohibe. Esa paradoja sigue abierta.' }
  },

  quasar: {
    tag: { en: 'Astrophysics', es: 'Astrofisica' },
    lede: {
      en: 'A supermassive black hole eating a galaxy. The infalling gas heats up until it outshines everything around it, and two jets leave along the rotation axis at nearly light speed.',
      es: 'Un agujero negro supermasivo comiendose una galaxia. El gas que cae se calienta hasta brillar mas que todo lo que lo rodea, y dos chorros salen por el eje de rotacion casi a la velocidad de la luz.' },
    math: [
      { eq: 'v(r) ∝ r^(−1/2)',
        en: 'Keplerian rotation. The inner disk moves much faster than the outer, so the disk shears against itself and that friction is what heats it.',
        es: 'Rotacion kepleriana. El disco interior se mueve mucho mas rapido que el exterior, asi que el disco se cizalla contra si mismo y esa friccion es la que lo calienta.' },
      { eq: 'δ = 1/(γ(1 − β·cosθ))',
        en: 'The Doppler factor. Material coming toward you has its emission compressed in time and blueshifted, and both effects multiply.',
        es: 'El factor Doppler. El material que viene hacia ti tiene su emision comprimida en el tiempo y corrida al azul, y los dos efectos se multiplican.' },
      { eq: 'I ∝ δ³',
        en: 'Observed brightness goes as the cube of that factor. It is why one side of the disk is visibly brighter here, and why most real quasars appear to have only one jet: the receding one is beamed away from us.',
        es: 'El brillo observado va como el cubo de ese factor. Es la razon de que un lado del disco brille visiblemente mas aca, y de que la mayoria de los cuasares reales parezcan tener un solo chorro: el que se aleja esta apuntado lejos de nosotros.' }
    ],
    how: {
      en: 'Nine hundred particles on Keplerian orbits, projected with an inclination you control. Each one is shaded by its own Doppler factor computed from its instantaneous direction of motion relative to the viewer, which is why the asymmetry appears without being drawn in. The jets are separate particle streams along the axis.',
      es: 'Novecientas particulas en orbitas keplerianas, proyectadas con una inclinacion que controlas. Cada una se sombrea con su propio factor Doppler calculado desde su direccion instantanea de movimiento relativa al observador, y por eso la asimetria aparece sin dibujarla. Los chorros son flujos de particulas aparte a lo largo del eje.' },
    watch: {
      en: 'Drop the inclination toward zero to look straight down the jet. That is a blazar: the beaming points almost entirely at you and the object appears hundreds of times brighter than it is. Raise the beaming slider and watch one side of the disk take over.',
      es: 'Baja la inclinacion hacia cero para mirar de frente por el chorro. Eso es un blazar: el beaming apunta casi todo hacia ti y el objeto parece cientos de veces mas brillante de lo que es. Sube el deslizador de beaming y mira como un lado del disco se impone.' },
    why: {
      en: 'Quasars were found in 1963 as radio sources that looked like stars but had impossible redshifts. Resolving that meant accepting they were billions of light years away and therefore brighter than entire galaxies, powered by something only a few light hours across. That something turned out to be a black hole.',
      es: 'Los cuasares se encontraron en 1963 como fuentes de radio que parecian estrellas pero tenian corrimientos al rojo imposibles. Resolver eso implico aceptar que estaban a miles de millones de anos luz y por lo tanto brillaban mas que galaxias enteras, alimentados por algo de solo unas horas luz de ancho. Ese algo resulto ser un agujero negro.' }
  },

  entanglement: {
    tag: { en: 'Quantum mechanics', es: 'Mecanica cuantica' },
    lede: {
      en: 'Two particles are measured far apart. Each result on its own is a coin flip. Put the two lists side by side and they agree more often than any theory where the answers were decided in advance could allow.',
      es: 'Dos particulas se miden lejos una de otra. Cada resultado por separado es una moneda al aire. Pon las dos listas lado a lado y coinciden mas seguido de lo que permitiria cualquier teoria donde las respuestas estuvieran decididas de antemano.' },
    math: [
      { eq: 'E(a,b) = −cos(a − b)',
        en: 'The correlation predicted for a singlet state. It depends only on the difference between the two detector angles, never on either one alone.',
        es: 'La correlacion predicha para un estado singlete. Depende solo de la diferencia entre los dos angulos de detector, nunca de ninguno por separado.' },
      { eq: 'S = |E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′)|',
        en: 'The CHSH combination of four measurement settings. Bell proved that any theory where the outcomes exist before measurement and nothing travels faster than light must keep this below 2.',
        es: 'La combinacion CHSH de cuatro ajustes de medicion. Bell demostro que cualquier teoria donde los resultados existan antes de medir y nada viaje mas rapido que la luz tiene que mantener esto bajo 2.' },
      { eq: 'S_max = 2√2 ≈ 2.828',
        en: 'What quantum mechanics gives at the optimal angles, and what experiments measure. The simulation converges here, above the classical ceiling.',
        es: 'Lo que da la mecanica cuantica en los angulos optimos, y lo que miden los experimentos. La simulacion converge aca, por encima del techo clasico.' }
    ],
    how: {
      en: 'Each pair is generated honestly: one side gets a fair coin flip, and the other agrees with probability (1 + E)/2 where E is the quantum correlation for that angle difference. Nothing is passed between the detectors in the code. Four angle settings run in parallel to accumulate the CHSH sum live.',
      es: 'Cada par se genera de forma honesta: un lado recibe una moneda justa, y el otro coincide con probabilidad (1 + E)/2 donde E es la correlacion cuantica para esa diferencia de angulos. En el codigo no se pasa nada entre los detectores. Cuatro ajustes de angulo corren en paralelo para acumular la suma CHSH en vivo.' },
    watch: {
      en: 'The S value climbing past 2 and settling near 2.828. Also look at each detector on its own: the plus and minus signs are an even coin flip no matter what angle you set, which is exactly why this cannot be used to send a message.',
      es: 'El valor de S subiendo mas alla de 2 y asentandose cerca de 2,828. Mira tambien cada detector por separado: los signos mas y menos son una moneda justa sin importar que angulo pongas, y por eso mismo esto no sirve para enviar un mensaje.' },
    why: {
      en: 'Einstein argued in 1935 that quantum mechanics had to be incomplete, that there must be hidden variables carrying the answers. Bell turned that argument into a number you can measure. Aspect, Clauser and Zeilinger measured it and shared the 2022 Nobel for closing the loopholes. The hidden variables are not there.',
      es: 'Einstein argumento en 1935 que la mecanica cuantica tenia que estar incompleta, que debian existir variables ocultas cargando las respuestas. Bell convirtio ese argumento en un numero que se puede medir. Aspect, Clauser y Zeilinger lo midieron y compartieron el Nobel 2022 por cerrar las escapatorias. Las variables ocultas no estan ahi.' }
  },

  shortcut: {
    tag: { en: 'General relativity', es: 'Relatividad general' },
    lede: {
      en: 'Not a diagram of a wormhole: the view through one. Every pixel is a light ray traced backwards through the metric, and the ones that make it to the other side bring back a different sky.',
      es: 'No es un diagrama de un agujero de gusano: es la vista a traves de uno. Cada pixel es un rayo de luz trazado hacia atras por la metrica, y los que llegan al otro lado traen de vuelta otro cielo.' },
    math: [
      { eq: 'ds² = −dt² + dl² + (b₀² + l²)dφ²',
        en: 'The Ellis metric, the simplest traversable wormhole. l runs through the throat instead of stopping at it, so light can cross.',
        es: 'La metrica de Ellis, el agujero de gusano transitable mas simple. l atraviesa la garganta en vez de detenerse en ella, asi que la luz puede cruzar.' },
      { eq: 'dl/dφ = ±(r²/b)·√(1 − b²/r²)',
        en: 'The null geodesic equation, with b the impact parameter and r² = b₀² + l². Integrating it is the entire renderer.',
        es: 'La ecuacion de la geodesica nula, con b el parametro de impacto y r² = b₀² + l². Integrarla es todo el renderizador.' },
      { eq: 'b < b₀ ⟹ crosses',
        en: 'The condition that decides everything. Since r never drops below b₀, a ray with a smaller impact parameter has no turning point and must come out the other side. Everything else bends around and returns.',
        es: 'La condicion que decide todo. Como r nunca baja de b₀, un rayo con parametro de impacto menor no tiene punto de retorno y tiene que salir por el otro lado. Todo lo demas se curva y vuelve.' }
    ],
    how: {
      en: 'A full per-pixel trace would be far too slow, but the camera sits on the axis so the deflection depends only on the angle from it. That makes the problem one-dimensional: 512 geodesics are integrated once into a lookup table, and every pixel is then a table read. The integration is done with respect to φ rather than l, which removes the square-root divergence at the turning point. Both skies are procedural and sampled by the same function, so what separates them is where the ray came from, not how they are drawn.',
      es: 'Un trazado completo por pixel seria demasiado lento, pero la camara esta sobre el eje y la desviacion depende solo del angulo respecto a el. Eso vuelve el problema unidimensional: se integran 512 geodesicas una vez a una tabla, y cada pixel pasa a ser una lectura. La integracion es respecto a φ y no a l, lo que elimina la divergencia de la raiz en el punto de retorno. Los dos cielos son procedurales y se muestrean con la misma funcion, asi que lo que los separa es de donde vino el rayo, no como se dibujan.' },
    watch: {
      en: 'The rim. Right at the edge of the disc the near sky is smeared into a thin ring: those rays passed close to the throat, wound part way around it and came back. Widen the throat and the other sky takes over the frame; pull the camera back and it shrinks to a coin. The readout tells you what fraction of your field of view is now somewhere else.',
      es: 'El borde. Justo en el filo del disco el cielo cercano queda embarrado en un anillo fino: esos rayos pasaron cerca de la garganta, la rodearon en parte y volvieron. Ensancha la garganta y el otro cielo se apodera del cuadro; aleja la camara y se encoge a una moneda. El numero de abajo dice que fraccion de tu campo de vision esta ahora en otra parte.' },
    why: {
      en: 'This is how the Interstellar wormhole was made: Kip Thorne wrote the equations, the effects team integrated them per pixel, and the result was a published paper as well as a film. The point is that a wormhole has no appearance of its own. You never see the tunnel. You see the other place, wrapped into a sphere by the geometry between you and it.',
      es: 'Asi se hizo el agujero de gusano de Interstellar: Kip Thorne escribio las ecuaciones, el equipo de efectos las integro por pixel, y el resultado fue un paper publicado ademas de una pelicula. El punto es que un agujero de gusano no tiene apariencia propia. Nunca ves el tunel. Ves el otro lugar, envuelto en una esfera por la geometria que hay entre tu y el.' }
  },

  handle: {
    tag: { en: 'General relativity', es: 'Relatividad general' },
    lede: {
      en: 'Both mouths in the same universe. Cut two discs out of a plane, glue their edges to each other, and the space you are left with has a route between two places that is not the road between them.',
      es: 'Las dos bocas en el mismo universo. Recorta dos discos de un plano, pega sus bordes entre si, y el espacio que queda tiene una ruta entre dos lugares que no es el camino que los separa.' },
    math: [
      { eq: '∂A ≡ ∂B',
        en: 'The identification. Every point on the edge of one disc is the same point as one on the edge of the other. Nothing is transported: there is only one circle, drawn twice.',
        es: 'La identificacion. Cada punto del borde de un disco es el mismo punto que uno del borde del otro. Nada se transporta: hay un solo circulo, dibujado dos veces.' },
      { eq: 'χ = 2 − 2g',
        en: 'Gluing a handle drops the Euler characteristic by two. That is the invariant that changed, and it is why no amount of bending the plane can imitate this.',
        es: 'Pegar un asa baja la caracteristica de Euler en dos. Ese es el invariante que cambio, y es la razon de que ninguna cantidad de doblado del plano pueda imitar esto.' },
      { eq: 'α ≈ 2R/b',
        en: 'The deflection each mouth produces on a passing ray. The same field warps the grid, so what you see bending the lines is what you see bending the paths.',
        es: 'La deflexion que cada boca produce sobre un rayo que pasa. El mismo campo deforma la rejilla, asi que lo que ves doblando las lineas es lo que ves doblando las trayectorias.' }
    ],
    how: {
      en: 'Rays are integrated under the attraction of both mouths. When one reaches a mouth boundary it is placed on the other mouth boundary with its direction unchanged, and its trail is cut at that instant. The cut matters: the path is continuous in the space but discontinuous on the screen, because the screen is drawing a plane and the space is not one. The grid is displaced by the same field that bends the rays, so the two are never telling different stories.',
      es: 'Los rayos se integran bajo la atraccion de las dos bocas. Cuando uno llega al borde de una se coloca en el borde de la otra con su direccion intacta, y su estela se corta en ese instante. El corte importa: el camino es continuo en el espacio y discontinuo en la pantalla, porque la pantalla dibuja un plano y el espacio no lo es. La rejilla se desplaza con el mismo campo que curva los rayos, asi que las dos nunca cuentan historias distintas.' },
    watch: {
      en: 'Drag mouth B around with the cursor. The separation readout changes and the distance through the handle stays zero, because the two circles are one circle no matter where you put them. Watch a ray fall toward A, vanish, and continue out of B travelling the same way it was going.',
      es: 'Arrastra la boca B con el cursor. La separacion cambia y la distancia por el asa sigue en cero, porque los dos circulos son un circulo pongas donde los pongas. Mira un rayo caer hacia A, desaparecer, y seguir saliendo de B viajando en la misma direccion que llevaba.' },
    why: {
      en: 'This is the version that would matter if wormholes existed: not a bridge to another universe but a shortcut inside this one. It is also the version with the worst problem. Move one mouth at high speed and time dilation desynchronises the two ends, which turns the handle into a machine for arriving before you left. Most physicists take that as evidence something forbids it.',
      es: 'Esta es la version que importaria si los agujeros de gusano existieran: no un puente a otro universo sino un atajo dentro de este. Es tambien la version con el peor problema. Mueve una boca a gran velocidad y la dilatacion temporal desincroniza los dos extremos, lo que convierte al asa en una maquina para llegar antes de haber salido. La mayoria de los fisicos toma eso como evidencia de que algo lo prohibe.' }
  },

  curvature: {
    tag: { en: 'General relativity', es: 'Relatividad general' },
    lede: {
      en: 'Newton said mass pulls. Einstein said mass bends, and things follow the bend. This is a lattice of space with a mass in it, and there is no force anywhere in the code.',
      es: 'Newton dijo que la masa tira. Einstein dijo que la masa dobla, y las cosas siguen el doblez. Esto es una reticula de espacio con una masa dentro, y en el codigo no hay ninguna fuerza.' },
    math: [
      { eq: 'G_μν = 8πG/c⁴ · T_μν',
        en: 'Matter on the right, curvature on the left. Ten coupled nonlinear equations saying the same thing in both directions: what is there decides the shape, and the shape decides how things move.',
        es: 'Materia a la derecha, curvatura a la izquierda. Diez ecuaciones acopladas no lineales diciendo lo mismo en las dos direcciones: lo que hay decide la forma, y la forma decide como se mueven las cosas.' },
      { eq: 'δ∫ds = 0',
        en: 'A free particle takes the longest proper time between two events. It is not being pushed; it is going straight, and straight in a curved geometry is not what it looks like from outside.',
        es: 'Una particula libre toma el mayor tiempo propio entre dos eventos. No la estan empujando; va derecho, y derecho en una geometria curva no es lo que parece desde afuera.' },
      { eq: 'g_μν vs Γ',
        en: 'The distortion here is of distances, not of a rubber surface. What changes near the mass is what a ruler reads between two lattice points, and every grid line shows exactly that.',
        es: 'La distorsion aca es de distancias, no de una superficie de goma. Lo que cambia cerca de la masa es lo que marca una regla entre dos puntos de la reticula, y cada linea de la rejilla muestra exactamente eso.' }
    ],
    how: {
      en: 'A three dimensional lattice, drawn as lines along all three axes. Every vertex is displaced toward the mass by an amount falling as one over distance squared, with a soft core so the grid cannot fold through itself where the approximation stops being useful. Lines are sorted back to front before drawing and brightened as they approach the mass, which is the same job the blue to green gradient does in the classic illustrations.',
      es: 'Una reticula tridimensional, dibujada como lineas a lo largo de los tres ejes. Cada vertice se desplaza hacia la masa una cantidad que cae como uno sobre la distancia al cuadrado, con un nucleo suave para que la rejilla no pueda plegarse sobre si misma donde la aproximacion deja de servir. Las lineas se ordenan de atras hacia adelante antes de dibujar y se aclaran al acercarse a la masa, que es el mismo trabajo que hace el degradado azul a verde de las ilustraciones clasicas.' },
    watch: {
      en: 'Move the mass with the cursor. Notice that the lattice never moves as a whole: only the spacing changes, and only near the mass. Far away the cells stay square, which is what asymptotically flat means. Set the mass to zero and the whole thing is a plain cube of straight lines, because with nothing there space has nothing to do.',
      es: 'Mueve la masa con el cursor. Fijate que la reticula nunca se mueve entera: solo cambia el espaciado, y solo cerca de la masa. Lejos las celdas siguen cuadradas, que es lo que significa asintoticamente plana. Pon la masa en cero y todo es un cubo de lineas rectas, porque sin nada ahi el espacio no tiene nada que hacer.' },
    why: {
      en: 'The picture has one honest limit worth stating: it draws space bending in space, and real curvature is intrinsic. It needs no outside to bend into, and it involves time as much as it involves distance. What survives the simplification is the important part. Gravity is not something that reaches across a gap and pulls. It is what a straight line looks like when the geometry is not flat.',
      es: 'El dibujo tiene un limite honesto que vale la pena decir: muestra el espacio doblandose en el espacio, y la curvatura real es intrinseca. No necesita un afuera hacia donde doblarse, e involucra al tiempo tanto como a la distancia. Lo que sobrevive a la simplificacion es la parte importante. La gravedad no es algo que cruza un hueco y tira. Es como se ve una linea recta cuando la geometria no es plana.' }
  },

  doubleslit: {
    tag: { en: 'Quantum mechanics', es: 'Mecanica cuantica' },
    lede: {
      en: 'Send particles at two slits one at a time. Each lands as a single dot, and after enough of them the dots have arranged themselves into fringes. Then put a detector at the slits so somebody knows which one each particle went through, and the fringes are gone.',
      es: 'Manda particulas a dos rendijas de a una. Cada una llega como un punto, y despues de suficientes los puntos se han ordenado en franjas. Despues pon un detector en las rendijas para que alguien sepa por cual paso cada una, y las franjas desaparecen.' },
    math: [
      { eq: 'I = |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + 2Re(ψ₁*ψ₂)',
        en: 'The whole experiment is in that last term. Add the amplitudes and the cross term produces fringes; add the intensities and it does not appear at all.',
        es: 'El experimento entero esta en ese ultimo termino. Suma las amplitudes y el termino cruzado produce franjas; suma las intensidades y no aparece en absoluto.' },
      { eq: 'V² + D² ≤ 1',
        en: 'Complementarity, as an inequality you can measure. V is fringe visibility, D is how well you could tell which slit. Knowing the path and seeing the fringes are not two options, they are two ends of one dial.',
        es: 'Complementariedad, como una desigualdad que se puede medir. V es la visibilidad de las franjas, D es que tan bien podrias decir cual rendija. Saber el camino y ver las franjas no son dos opciones, son los dos extremos de una misma perilla.' },
      { eq: 'Δy = λL/d',
        en: 'Fringe spacing. Widen the slits and the pattern tightens, lengthen the wavelength and it spreads. Both sliders do exactly this.',
        es: 'Espaciado de las franjas. Separa las rendijas y el patron se aprieta, alarga la longitud de onda y se abre. Los dos deslizadores hacen exactamente esto.' }
    ],
    how: {
      en: 'The left side draws the field as the squared modulus of the summed amplitudes, and the right side samples individual detections from that same distribution by rejection. The observer switch sets how much which-path information exists, and that value multiplies the cross term rather than fading anything out, so the visibility of the pattern is a consequence of the formula and not a drawing effect. I checked it: measuring the contrast of the rendered pattern reproduces the square root of one minus D squared to within a few thousandths across the whole range.',
      es: 'El lado izquierdo dibuja el campo como el modulo al cuadrado de la suma de amplitudes, y el derecho sortea detecciones individuales de esa misma distribucion por rechazo. El interruptor del observador fija cuanta informacion de camino existe, y ese valor multiplica el termino cruzado en vez de desvanecer nada, asi que la visibilidad del patron es consecuencia de la formula y no un efecto de dibujo. Lo comprobe: medir el contraste del patron renderizado reproduce la raiz de uno menos D al cuadrado con error de milesimas en todo el rango.' },
    watch: {
      en: 'Turn the observer on and off and watch the screen rebuild itself. With it off the fringes come back; with it on you get two plain bands. Then look at the counters next to each slit: those are the particles the detector registered going through, and that record is the entire price. Lower the reliability and the fringes creep back in proportion, because a detector that sometimes lies gives you less than a full answer.',
      es: 'Enciende y apaga el observador y mira la pantalla reconstruirse. Apagado vuelven las franjas; encendido quedan dos bandas lisas. Despues mira los contadores junto a cada rendija: esas son las particulas que el detector registro pasando, y ese registro es todo el precio. Baja la fiabilidad y las franjas vuelven en proporcion, porque un detector que a veces miente te da menos que una respuesta completa.' },
    why: {
      en: 'Feynman called it the only mystery, and said it contains everything strange about quantum mechanics. The strange part is not that particles behave like waves. It is that the pattern depends on whether the information exists at all, not on whether anyone ever reads it. Nothing needs a conscious observer: a detector left running in an empty room does the same damage.',
      es: 'Feynman lo llamo el unico misterio, y dijo que contiene todo lo raro de la mecanica cuantica. Lo raro no es que las particulas se comporten como ondas. Es que el patron dependa de si la informacion existe, no de si alguien la lee. No hace falta un observador consciente: un detector encendido en una pieza vacia hace el mismo dano.' }
  },

  duality: {
    tag: { en: 'Quantum mechanics', es: 'Mecanica cuantica' },
    lede: {
      en: 'One photon, one apparatus, and a plate you can slide in or out at the last moment. Leave it in and the photon behaves as if it took both routes. Take it out and one detector clicks, naming a single route.',
      es: 'Un foton, un aparato, y una placa que puedes meter o sacar en el ultimo momento. Dejala puesta y el foton se comporta como si hubiera tomado las dos rutas. Sacala y suena un solo detector, nombrando una sola ruta.' },
    math: [
      { eq: 'P(D0) = cos²(φ/2)',
        en: 'With the second splitter in place. The two amplitudes recombine and their relative phase decides which detector fires, so sweeping φ moves every photon from one detector to the other.',
        es: 'Con el segundo divisor puesto. Las dos amplitudes se recombinan y su fase relativa decide que detector se dispara, asi que barrer φ mueve cada foton de un detector al otro.' },
      { eq: 'P(D0) = ½',
        en: 'With it removed. No recombination, no phase dependence, and the detector that fires tells you which arm. Changing φ does nothing at all.',
        es: 'Con el sacado. Sin recombinacion no hay dependencia de fase, y el detector que se dispara te dice cual brazo. Cambiar φ no hace absolutamente nada.' },
      { eq: 'V = 1  ⟷  V = 0',
        en: 'The visibility flips between the two configurations with nothing in between, because the plate is either there or it is not. The rest of the apparatus never changed.',
        es: 'La visibilidad salta entre las dos configuraciones sin nada en medio, porque la placa esta o no esta. El resto del aparato nunca cambio.' }
    ],
    how: {
      en: 'The apparatus is labelled so you can read it: a source, a first splitter that divides the route, two mirrors, a second splitter that can be slid out, and two detectors. Photons are emitted one at a time and their detector is drawn from the probability for whichever configuration is in force when they arrive. The curve underneath is the point of the whole thing: every detection is filed into a phase bin, and the dots are the measured fraction landing in D0 while the dashed line is the prediction. With the splitter in you watch a cosine build itself out of single events. With it out the same dots pile up on a flat line at one half.',
      es: 'El aparato esta rotulado para que se pueda leer: una fuente, un primer divisor que reparte la ruta, dos espejos, un segundo divisor que se puede retirar, y dos detectores. Los fotones se emiten de a uno y su detector se sortea de la probabilidad de la configuracion vigente cuando llegan. La curva de abajo es el punto de todo esto: cada deteccion se archiva en una casilla de fase, y los puntos son la fraccion medida que cae en D0 mientras la linea punteada es la prediccion. Con el divisor puesto ves un coseno construirse a partir de eventos individuales. Sin el, los mismos puntos se apilan en una recta plana en un medio.' },
    watch: {
      en: 'Sweep the cursor across the canvas to move the phase and watch the measured dots fill in the curve. Then pull the second splitter out and sweep again: the cosine is gone and every bin sits at one half, because with no recombination the phase has nothing to act on. Finally turn on the delayed choice and compare the two numbers at the top. They agree, which is the whole of Wheeler argument reduced to two figures you can read off the screen.',
      es: 'Barre el cursor por el canvas para mover la fase y mira los puntos medidos llenar la curva. Despues retira el segundo divisor y barre otra vez: el coseno desaparecio y cada casilla se queda en un medio, porque sin recombinacion la fase no tiene sobre que actuar. Por ultimo activa la eleccion diferida y compara los dos numeros de arriba. Coinciden, y eso es todo el argumento de Wheeler reducido a dos cifras que se leen en pantalla.' },
    why: {
      en: 'Wheeler proposed it in 1978 to press on a tempting idea: that the photon somehow decides what to be on entering. If that were so, deciding afterwards should break something. It does not. The lesson is not that the present rewrites the past. It is that asking what the photon was doing between the two plates is asking about something the theory does not contain, and the experiment is a way of finding that out rather than a way of being confused by it.',
      es: 'Wheeler lo propuso en 1978 para presionar una idea tentadora: que el foton de algun modo decide que ser al entrar. Si fuera asi, decidir despues deberia romper algo. No lo rompe. La leccion no es que el presente reescriba el pasado. Es que preguntar que hacia el foton entre las dos placas es preguntar por algo que la teoria no contiene, y el experimento sirve para descubrir eso en vez de para quedar confundido.' }
  },

  entropy: {
    tag: { en: 'Statistical mechanics', es: 'Mecanica estadistica' },
    lede: {
      en: 'A gas let go in one corner spreads out and never gathers back. Nothing in the equations forbids it gathering. What forbids it is counting.',
      es: 'Un gas soltado en una esquina se expande y nunca vuelve a juntarse. Nada en las ecuaciones prohibe que se junte. Lo que lo prohibe es contar.' },
    math: [
      { eq: 'S = k·ln Ω',
        en: 'Boltzmann. Entropy is the logarithm of how many microscopic arrangements look the same from outside. It is a property of your description, not of the particles.',
        es: 'Boltzmann. La entropia es el logaritmo de cuantos arreglos microscopicos se ven iguales desde afuera. Es una propiedad de tu descripcion, no de las particulas.' },
      { eq: 'S = −Σ pᵢ ln pᵢ',
        en: 'The form used here, over the occupancy of each cell. Normalised by the log of the cell count so the maximum is one, which is the state where every cell holds the same share.',
        es: 'La forma usada aca, sobre la ocupacion de cada celda. Normalizada por el logaritmo del numero de celdas para que el maximo sea uno, que es el estado donde cada celda tiene la misma porcion.' },
      { eq: 'Ω_spread / Ω_corner ≈ 2^N',
        en: 'Why it never goes back. With a few hundred particles that ratio already exceeds the number of atoms in the observable universe. Nothing is forbidden; it is just outnumbered.',
        es: 'Por que nunca vuelve. Con unos cientos de particulas esa razon ya supera el numero de atomos del universo observable. Nada esta prohibido; simplemente esta en minoria.' }
    ],
    how: {
      en: 'Particles move in straight lines and bounce off the walls, with no collisions between them, which makes this a free expansion of an ideal gas and makes the dynamics exactly reversible. The shading is the coarse-grained description: how many particles are in each cell, which is all a macroscopic observer gets to know. Entropy is computed from those occupancies every frame and plotted underneath.',
      es: 'Las particulas se mueven en linea recta y rebotan en las paredes, sin colisiones entre ellas, lo que hace de esto una expansion libre de gas ideal y hace la dinamica exactamente reversible. El sombreado es la descripcion de grano grueso: cuantas particulas hay en cada celda, que es todo lo que un observador macroscopico llega a saber. La entropia se calcula de esas ocupaciones en cada frame y se grafica abajo.' },
    watch: {
      en: 'Flip the reverse switch once the gas has spread. Every velocity is negated and the whole thing retraces its path back into the corner, entropy falling the entire way. I measured it: reversing at step 600 sends S from 0.964 back to 0.313, the exact value it started from. Then set the particle count to four and watch entropy wander up and down on its own. At two hundred and forty it stops wandering, and that is the only reason the second law looks like a law.',
      es: 'Acciona el interruptor de inversion cuando el gas ya se expandio. Cada velocidad se niega y todo rehace su camino de vuelta a la esquina, con la entropia bajando en todo el trayecto. Lo medi: invertir en el paso 600 lleva S de 0,964 de vuelta a 0,313, el valor exacto del que partio. Despues pon el numero de particulas en cuatro y mira la entropia subir y bajar sola. En doscientas cuarenta deja de vagar, y esa es la unica razon de que la segunda ley parezca una ley.' },
    why: {
      en: 'Loschmidt raised the reversal objection to Boltzmann in 1876 and it is not answerable by finding an error in the mechanics, because there is none. The answer is that entropy increase is overwhelmingly probable rather than certain, and that the initial state of the universe was one of extraordinarily low entropy. Everything we call the direction of time rests on that second fact, which physics describes and does not explain.',
      es: 'Loschmidt le planteo la objecion de la inversion a Boltzmann en 1876 y no se responde encontrando un error en la mecanica, porque no lo hay. La respuesta es que el aumento de entropia es abrumadoramente probable y no seguro, y que el estado inicial del universo era de entropia extraordinariamente baja. Todo lo que llamamos direccion del tiempo descansa en ese segundo hecho, que la fisica describe y no explica.' }
  },
  ising: {
    tag: { en: 'Statistical physics', es: 'Física estadística' },
    lede: { en: 'A sheet of arrows that only care about their four neighbours. Warm it and they argue. Cool it and at one precise temperature the entire sheet picks a side at once, with nothing telling it to.',
            es: 'Una lámina de flechas a las que solo les importan sus cuatro vecinos. Caliéntala y discuten. Enfríala y a una temperatura precisa la lámina entera elige un bando de golpe, sin que nadie se lo ordene.' },
    math: [
      { eq: 'E = −Σ⟨ij⟩ sᵢsⱼ − B Σᵢ sᵢ',
        en: 'The energy of the whole sheet. Neighbours that agree cost less; the second term is an external field that bribes everyone toward one side. There is no long-range term anywhere: every interaction is between touching neighbours.',
        es: 'La energía de toda la lámina. Los vecinos que coinciden cuestan menos; el segundo término es un campo externo que soborna a todos hacia un lado. No hay ningún término de largo alcance: toda interacción es entre vecinos que se tocan.' },
      { eq: 'ΔE = 2sᵢ(Σ vecinos + B)',
        en: 'Flipping one spin changes the energy by exactly this. It only needs the four neighbours, which is why the simulation is cheap: the cost of a move is local even though the effect is not.',
        es: 'Dar vuelta un espín cambia la energía exactamente en esto. Solo necesita los cuatro vecinos, y por eso la simulación es barata: el costo de un movimiento es local aunque el efecto no lo sea.' },
      { eq: 'P(aceptar) = min(1, e^−ΔE/T)',
        en: 'The Metropolis rule. Downhill moves always happen; uphill moves happen with a probability that collapses as the temperature drops. The whole phase transition comes out of this single exponential.',
        es: 'La regla de Metropolis. Los movimientos que bajan la energía siempre ocurren; los que la suben ocurren con una probabilidad que se desploma al bajar la temperatura. La transición de fase entera sale de esa única exponencial.' },
      { eq: 'T_c = 2 / ln(1+√2) = 2.269…',
        en: 'Onsager solved the two-dimensional model exactly in 1944 and this number fell out. It is not fitted or measured here: it is a closed form, and the simulation lands on it. Run the sweep and the magnetisation holds near 1 below it and collapses above.',
        es: 'Onsager resolvió el modelo bidimensional exactamente en 1944 y este número salió de ahí. No está ajustado ni medido acá: es una forma cerrada, y la simulación cae en ella. Corre el barrido y la magnetización se queda cerca de 1 por debajo y se desploma por encima.' }
    ],
    how: { en: 'Metropolis Monte Carlo on a grid with periodic edges. Each frame proposes thousands of random flips and accepts them by the exponential above. One detail matters more than it looks: the grid starts fully ordered, not random. Starting from noise at low temperature freezes domains that would take astronomically long to merge, and the magnetisation readout would sit near zero and lie to you about the transition. I measured both: ordered start gives 1.000 / 0.960 / 0.874 / 0.657 at T = 1.0 / 1.8 / 2.1 / 2.269, which is the textbook curve. A quench from noise gets stuck around 0.1 at every temperature below T_c.',
           es: 'Monte Carlo de Metropolis sobre una rejilla con bordes periódicos. Cada frame propone miles de volteos al azar y los acepta con la exponencial de arriba. Un detalle importa más de lo que parece: la rejilla arranca completamente ordenada, no al azar. Partir del ruido a baja temperatura congela dominios que tardarían tiempos astronómicos en fusionarse, y la magnetización se quedaría cerca de cero mintiéndote sobre la transición. Medí las dos: con arranque ordenado da 1.000 / 0.960 / 0.874 / 0.657 a T = 1.0 / 1.8 / 2.1 / 2.269, que es la curva de libro. Un enfriamiento brusco desde ruido se queda pegado cerca de 0.1 a cualquier temperatura bajo T_c.' },
    watch: { en: 'Move the cursor left and right over the canvas: that sweeps the temperature directly, overriding the slider. Cross 2.269 and watch the trace at the bottom fall off a cliff. Near the critical point look at the grid itself, where you get domains of every size at once, from a few pixels to the whole frame. That scale-free look is the signature of criticality.',
             es: 'Mueve el cursor de izquierda a derecha sobre el canvas: eso barre la temperatura directamente, por encima del deslizador. Cruza 2.269 y mira cómo la traza de abajo se cae por un acantilado. Cerca del punto crítico fíjate en la rejilla misma: aparecen dominios de todos los tamaños a la vez, desde unos pocos píxeles hasta el cuadro entero. Ese aspecto sin escala propia es la firma de la criticalidad.' },
    why: { en: 'This is the simplest thing that has a phase transition, and it was the first one anybody solved exactly. Its importance is universality: near the critical point, a magnet, a liquid boiling and a binary alloy separating all follow the same exponents, and the microscopic details wash out. It is the reason physicists believe that some collective behaviour does not care what it is made of.',
           es: 'Es lo más simple que tiene una transición de fase, y fue lo primero que alguien resolvió exactamente. Su importancia es la universalidad: cerca del punto crítico, un imán, un líquido hirviendo y una aleación separándose siguen los mismos exponentes, y los detalles microscópicos se borran. Es la razón por la que los físicos creen que cierto comportamiento colectivo no depende de en qué esté hecho.' }
  },

  grayscott: {
    tag: { en: 'Reaction–diffusion', es: 'Reacción–difusión' },
    lede: { en: 'Two chemicals spreading and eating each other. Four numbers decide whether you get spots, stripes, a maze, or blobs that split like cells. Turing wrote the equations in 1952 to ask how an animal decides where to put its markings.',
            es: 'Dos químicos que se difunden y se comen entre ellos. Cuatro números deciden si salen manchas, rayas, un laberinto, o gotas que se dividen como células. Turing escribió las ecuaciones en 1952 para preguntarse cómo un animal decide dónde ponerse sus manchas.' },
    math: [
      { eq: '∂U/∂t = Du∇²U − UV² + F(1−U)',
        en: 'U diffuses, gets eaten by the reaction UV², and is topped back up toward 1 at rate F. That last term is the feed: without it the system runs out and dies flat.',
        es: 'U se difunde, es consumido por la reacción UV², y se repone hacia 1 a una tasa F. Ese último término es la alimentación: sin él el sistema se agota y muere plano.' },
      { eq: '∂V/∂t = Dv∇²V + UV² − (F+k)V',
        en: 'V is produced by the same reaction that consumes U, which makes it autocatalytic: V needs V to make more V. It is removed at rate F+k. The entire zoo of patterns lives in the balance between that self-feeding and that removal.',
        es: 'V se produce por la misma reacción que consume U, lo que la hace autocatalítica: V necesita V para hacer más V. Se remueve a una tasa F+k. Todo el zoológico de patrones vive en el equilibrio entre esa autoalimentación y esa remoción.' },
      { eq: 'Du / Dv = 2',
        en: 'The one condition that makes patterns possible: the inhibitor must spread faster than the activator. If they diffused at the same rate the sheet would stay uniform forever. Turing called it diffusion-driven instability, and it is deeply counterintuitive, because diffusion is supposed to smooth things out.',
        es: 'La única condición que hace posibles los patrones: el inhibidor debe esparcirse más rápido que el activador. Si se difundieran al mismo ritmo la lámina quedaría uniforme para siempre. Turing lo llamó inestabilidad inducida por difusión, y es profundamente contraintuitivo, porque se supone que la difusión suaviza.' },
      { eq: '∇²U ≈ U↑ + U↓ + U← + U→ − 4U',
        en: 'The Laplacian on a grid, five points. It measures how much a cell differs from the average of its neighbours: positive if it sits in a dip, negative on a bump. That single number is all the geometry the simulation ever knows.',
        es: 'El laplaciano en una rejilla, cinco puntos. Mide cuánto difiere una celda del promedio de sus vecinas: positivo si está en un hoyo, negativo en un montículo. Ese único número es toda la geometría que la simulación llega a conocer.' }
    ],
    how: { en: 'A 150×150 grid of two Float32Arrays, explicit Euler in time, five-point Laplacian in space. Two extra buffers hold the next state so a cell never reads a half-updated neighbour, and the pairs get swapped instead of copied. It runs several steps per frame because the timestep has to stay small for the integration to be stable.',
           es: 'Una rejilla de 150×150 con dos Float32Array, Euler explícito en el tiempo y laplaciano de cinco puntos en el espacio. Dos búferes extra guardan el estado siguiente para que una celda nunca lea a una vecina a medio actualizar, y los pares se intercambian en vez de copiarse. Corre varios pasos por frame porque el paso de tiempo tiene que ser chico para que la integración sea estable.' },
    watch: { en: 'Draw on it with the cursor: you are injecting V, and whatever you draw grows into the pattern the parameters allow. Then move k slowly. Around F=0.037, k=0.06 you get spots that divide like bacteria. Push k up and they freeze into a static maze. Push it down and everything floods.',
             es: 'Dibuja encima con el cursor: estás inyectando V, y lo que dibujes crece hacia el patrón que los parámetros permitan. Después mueve k despacio. Cerca de F=0.037, k=0.06 salen manchas que se dividen como bacterias. Sube k y se congelan en un laberinto estático. Bájala y todo se inunda.' },
    why: { en: 'Turing published this the year before he died, and it is the least famous of his big ideas. It gives a mechanism for how an undifferentiated sheet of cells can end up with stripes in the right places without any cell being told the plan. Zebrafish stripe mutants have since been shown to behave the way the equations predict.',
           es: 'Turing publicó esto el año antes de morir, y es la menos famosa de sus grandes ideas. Da un mecanismo para que una lámina de células indiferenciadas termine con rayas en los lugares correctos sin que ninguna célula conozca el plan. Después se demostró que los mutantes de rayas del pez cebra se comportan como predicen las ecuaciones.' }
  },

  boids: {
    tag: { en: 'Emergence', es: 'Emergencia' },
    lede: { en: 'Every bird follows three rules and looks only at whoever is nearby. Nobody is leading, nobody knows the shape of the flock, and there is no flock stored anywhere. It exists only as something you see.',
            es: 'Cada pájaro sigue tres reglas y solo mira a quien tiene cerca. Nadie lidera, nadie conoce la forma de la bandada, y la bandada no está guardada en ninguna parte. Existe solo como algo que tú ves.' },
    math: [
      { eq: 'separación = −Σ (rⱼ − rᵢ)/|rⱼ − rᵢ|',
        en: 'Push away from anyone too close, weighted by 1/distance so the nearest bird dominates. This is the rule that keeps the flock from collapsing into a point.',
        es: 'Alejarse de quien esté demasiado cerca, pesado por 1/distancia para que domine el pájaro más próximo. Es la regla que impide que la bandada colapse en un punto.' },
      { eq: 'alineación = ⟨vⱼ⟩ − vᵢ',
        en: 'Steer toward the average heading of the neighbours. This is what turns a crowd into a current, and it is the only rule that transmits direction across the group.',
        es: 'Girar hacia la dirección promedio de los vecinos. Es lo que convierte una multitud en una corriente, y la única regla que transmite dirección a través del grupo.' },
      { eq: 'cohesión = ⟨rⱼ⟩ − rᵢ',
        en: 'Steer toward the centre of mass of the neighbours. Alone it would make one dense clump; against separation it produces a flock with a size.',
        es: 'Girar hacia el centro de masa de los vecinos. Sola haría un solo grumo denso; contra la separación produce una bandada con un tamaño.' },
      { eq: 'r < 46 px',
        en: 'The only parameter that is not a weight: how far a bird can see. Nothing in the model has access to anything beyond this radius, and yet the flock behaves as a single object hundreds of pixels across.',
        es: 'El único parámetro que no es un peso: hasta dónde ve un pájaro. Nada en el modelo tiene acceso a algo más allá de este radio, y aun así la bandada se comporta como un solo objeto de cientos de píxeles de ancho.' }
    ],
    how: { en: '220 birds, each one checking all the others every frame. That is naive and quadratic, and at this size it is also the right call: 48.000 distance checks per frame is nothing, and a spatial hash would add code without buying anything visible. The three steering vectors are normalised before being weighted, so the sliders control balance and not magnitude, and speed is clamped to a constant so the flock never accelerates away.',
           es: 'Son 220 pájaros y cada uno revisa a todos los demás en cada frame. Es ingenuo y cuadrático, y a este tamaño también es lo correcto: 48.000 comparaciones de distancia por frame no son nada, y una rejilla espacial agregaría código sin comprar nada visible. Los tres vectores de dirección se normalizan antes de pesarse, así los deslizadores controlan el equilibrio y no la magnitud, y la rapidez se fija constante para que la bandada nunca se acelere y se escape.' },
    watch: { en: 'Move the cursor into them: birds flee from it and you can split the flock in half and watch it heal. Then take alignment to zero and the whole thing dies instantly into a milling crowd, which tells you which of the three rules is actually carrying the collective behaviour.',
             es: 'Mete el cursor entre ellos: los pájaros huyen y puedes partir la bandada en dos y verla sanar. Después baja la alineación a cero y todo muere al instante en una multitud que da vueltas, lo que te dice cuál de las tres reglas está cargando de verdad con el comportamiento colectivo.' },
    why: { en: 'Craig Reynolds wrote this in 1986 and it went straight into film: the bats and penguins in Batman Returns were boids. It matters beyond animation because it is the cleanest demonstration that collective behaviour does not require a collective plan, and the same argument gets used for traffic jams, crowd disasters and markets.',
           es: 'Craig Reynolds escribió esto en 1986 y se fue derecho al cine: los murciélagos y pingüinos de Batman Vuelve eran boids. Importa más allá de la animación porque es la demostración más limpia de que el comportamiento colectivo no requiere un plan colectivo, y el mismo argumento se usa para tacos, desastres de multitudes y mercados.' }
  },

  attention: {
    tag: { en: 'Machine learning', es: 'Aprendizaje automático' },
    lede: { en: 'The one operation underneath every language model. Each word builds a query, every other word offers a key, and the match decides who gets listened to. Everything else in a transformer is plumbing around this.',
            es: 'La única operación debajo de todo modelo de lenguaje. Cada palabra arma una consulta, todas las demás ofrecen una clave, y la coincidencia decide a quién se escucha. Todo lo demás en un transformer es plomería alrededor de esto.' },
    math: [
      { eq: 'Atención(Q,K,V) = softmax(QKᵀ/√d)·V',
        en: 'The whole thing, in one line. QKᵀ is every query dotted with every key, giving a square matrix of raw affinities. Softmax turns each row into a set of weights that sum to one, and those weights mix the values.',
        es: 'Todo, en una línea. QKᵀ es cada consulta multiplicada por cada clave, lo que da una matriz cuadrada de afinidades crudas. El softmax convierte cada fila en pesos que suman uno, y esos pesos mezclan los valores.' },
      { eq: 'softmax(x)ᵢ = e^xᵢ / Σⱼ e^xⱼ',
        en: 'Turns any list of numbers into a probability distribution. It is computed here after subtracting the row maximum, which changes nothing mathematically and prevents e^x from overflowing.',
        es: 'Convierte cualquier lista de números en una distribución de probabilidad. Acá se calcula después de restar el máximo de la fila, lo que no cambia nada matemáticamente y evita que e^x se desborde.' },
      { eq: '÷ √d',
        en: 'The detail people skip. Dot products of d-dimensional vectors grow like √d, so without this the softmax input gets large, the exponential saturates, and every row becomes almost one-hot with almost no gradient. Dividing by √d keeps the variance at 1 and the model trainable.',
        es: 'El detalle que la gente se salta. Los productos punto de vectores de d dimensiones crecen como √d, así que sin esto la entrada del softmax se hace grande, la exponencial se satura, y cada fila queda casi one-hot y casi sin gradiente. Dividir por √d mantiene la varianza en 1 y el modelo entrenable.' },
      { eq: 'multi-cabeza',
        en: 'The same sentence is projected several times with different weights, so each head can attend to a different kind of relation: one tracks syntax, another tracks what a pronoun refers to. Switching heads here changes the projection matrix and nothing else.',
        es: 'La misma frase se proyecta varias veces con pesos distintos, así cada cabeza puede atender a un tipo de relación distinto: una sigue la sintaxis, otra sigue a qué se refiere un pronombre. Cambiar de cabeza acá cambia la matriz de proyección y nada más.' }
    ],
    how: { en: 'Honest about what this is: the sentence and its four-dimensional vectors are hand-written, not learned. The dimensions mean animal, furniture, action and reference, and the four heads are fixed permutation-style matrices. It is a mechanism demo, not a model. The arithmetic, though, is exactly what runs inside a real transformer: same projections, same scaled dot product, same softmax. I checked that every row of the matrix sums to 1.000000.',
           es: 'Honesto sobre lo que es: la frase y sus vectores de cuatro dimensiones están escritos a mano, no aprendidos. Las dimensiones significan animal, mueble, acción y referencia, y las cuatro cabezas son matrices fijas tipo permutación. Es una demostración del mecanismo, no un modelo. La aritmética, eso sí, es exactamente la que corre dentro de un transformer real: mismas proyecciones, mismo producto punto escalado, mismo softmax. Verifiqué que cada fila de la matriz suma 1.000000.' },
    watch: { en: 'Hover over a row to isolate one word and see the arcs of who it is looking at. Then drag sharpness down toward 0.2: the attention spreads until every word listens to everything equally, which is the same as listening to nothing. Push it up and it collapses to a single hard pointer.',
             es: 'Pasa el cursor sobre una fila para aislar una palabra y ver los arcos de a quién está mirando. Después baja la nitidez hacia 0.2: la atención se reparte hasta que cada palabra escucha todo por igual, que es lo mismo que no escuchar nada. Súbela y colapsa a un único puntero duro.' },
    why: { en: 'This replaced recurrence in 2017 and everything since is built on it. The reason it won is not accuracy, it is shape: every pair of positions is compared in one step, with no sequential dependency, so the whole thing parallelises across a GPU. Recurrent networks could not, and that is the entire story of the last decade of scale.',
           es: 'Esto reemplazó a la recurrencia en 2017 y todo lo que vino después está construido encima. La razón por la que ganó no es la precisión, es la forma: cada par de posiciones se compara en un solo paso, sin dependencia secuencial, así que todo se paraleliza en una GPU. Las redes recurrentes no podían, y esa es la historia entera de la última década de escala.' }
  },

  optimizers: {
    tag: { en: 'Machine learning', es: 'Aprendizaje automático' },
    lede: { en: 'Training is one thing repeated a lot: look at the slope, take a step. Three ways of taking that step, released on the same surface from the same point, with the same learning rate.',
            es: 'Entrenar es una sola cosa repetida mucho: mira la pendiente, da un paso. Tres formas de dar ese paso, soltadas sobre la misma superficie desde el mismo punto y con la misma tasa de aprendizaje.' },
    math: [
      { eq: 'θ ← θ − η∇L',
        en: 'Plain gradient descent. Step downhill, proportional to the slope. When the slope is nearly flat the step is nearly nothing, which is exactly the failure you can watch on the saddle.',
        es: 'Descenso de gradiente simple. Un paso cuesta abajo, proporcional a la pendiente. Cuando la pendiente es casi plana el paso es casi nada, que es exactamente la falla que puedes ver en la silla.' },
      { eq: 'v ← βv − η∇L,   θ ← θ + v',
        en: 'Momentum. The step keeps a memory of the previous steps, so consistent directions accumulate and oscillations across a narrow valley cancel out. β = 0.9 means roughly the last ten gradients are still contributing.',
        es: 'Momentum. El paso guarda memoria de los pasos anteriores, así las direcciones consistentes se acumulan y las oscilaciones a través de un valle angosto se cancelan. β = 0.9 significa que los últimos diez gradientes más o menos siguen aportando.' },
      { eq: 'm ← β₁m + (1−β₁)g,   s ← β₂s + (1−β₂)g²',
        en: 'Adam tracks two running averages: the mean of the gradient and the mean of its square. The first is momentum, the second is a per-coordinate estimate of how steep that direction usually is.',
        es: 'Adam lleva dos promedios móviles: la media del gradiente y la media de su cuadrado. El primero es momentum, el segundo es una estimación por coordenada de qué tan empinada suele ser esa dirección.' },
      { eq: 'θ ← θ − η · m̂ / (√ŝ + ε)',
        en: 'Dividing by the typical magnitude makes the step size roughly the same in every direction, no matter how differently scaled they are. That is why Adam crosses a flat saddle fast: a tiny gradient divided by a tiny typical gradient is still order one.',
        es: 'Dividir por la magnitud típica hace que el tamaño del paso sea parecido en toda dirección, sin importar cuán distinto estén escaladas. Por eso Adam cruza rápido una silla plana: un gradiente diminuto dividido por un gradiente típico diminuto sigue siendo del orden de uno.' }
    ],
    how: { en: 'Gradients come from a central finite difference, not by hand, so swapping in a new landscape needs no new derivation. The three runners share a step budget and a learning rate; only the update rule differs. Each landscape starts somewhere its lesson is visible, and those starting points were measured rather than guessed: on the bumpy bowl every start I tried first sent all three into the same hole, which demonstrates nothing.',
           es: 'Los gradientes salen de una diferencia finita centrada, no a mano, así que meter un paisaje nuevo no necesita ninguna derivación nueva. Los tres corredores comparten presupuesto de pasos y tasa de aprendizaje; solo cambia la regla de actualización. Cada paisaje arranca donde su lección se ve, y esos puntos de partida están medidos y no elegidos a ojo: en el paisaje con baches, el primer arranque que probé mandaba a los tres al mismo hoyo, lo que no demuestra nada.' },
    watch: { en: 'Switch to the saddle. The gradient along the ridge is nearly zero, and the three separate hard: Adam gets off it at step 11, momentum at 64, plain descent at 315. Those are measured, not illustrative. Then switch to the bumpy bowl, where momentum is the only one that carries enough speed to roll out of the first trap and ends at loss −2.72 while the other two sit at 1.12.',
             es: 'Cambia a la silla. El gradiente a lo largo de la cresta es casi cero, y los tres se separan fuerte: Adam sale en el paso 11, momentum en el 64, el descenso simple en el 315. Están medidos, no son ilustrativos. Después cambia al paisaje con baches, donde momentum es el único que lleva suficiente velocidad para salir rodando de la primera trampa y termina en pérdida −2.72 mientras los otros dos se quedan en 1.12.' },
    why: { en: 'Every trained model you have used came out of this loop, just with millions of coordinates instead of two. The reason Adam became the default is not that it finds better minima, it is that it needs far less tuning of the learning rate to not fail, and at the scale where one run costs a fortune, not failing is the whole game.',
           es: 'Todo modelo entrenado que hayas usado salió de este bucle, solo que con millones de coordenadas en vez de dos. La razón de que Adam sea el predeterminado no es que encuentre mejores mínimos, es que necesita mucho menos ajuste de la tasa de aprendizaje para no fallar, y a la escala donde una corrida cuesta una fortuna, no fallar es todo el juego.' }
  },

  embedding: {
    tag: { en: 'Machine learning', es: 'Aprendizaje automático' },
    lede: { en: 'Models think in hundreds of dimensions. Screens have two. Every embedding plot you have seen is the result of squeezing one into the other, and something always breaks in the squeeze.',
            es: 'Los modelos piensan en cientos de dimensiones. Las pantallas tienen dos. Todo gráfico de embeddings que hayas visto es el resultado de exprimir una en la otra, y en el apretón algo siempre se rompe.' },
    math: [
      { eq: 'dᵢⱼ = ‖xᵢ − xⱼ‖',
        en: 'The target: the distance between every pair of points in the original high-dimensional space. This matrix is the only thing carried over; the coordinates themselves are thrown away.',
        es: 'El objetivo: la distancia entre cada par de puntos en el espacio original de muchas dimensiones. Esta matriz es lo único que se traslada; las coordenadas mismas se descartan.' },
      { eq: 'stress = Σᵢⱼ (‖yᵢ − yⱼ‖ − dᵢⱼ)²',
        en: 'What we are minimising: the total disagreement between distances on screen and distances in the real space. Classical multidimensional scaling, going back to Torgerson in 1952.',
        es: 'Lo que estamos minimizando: el desacuerdo total entre las distancias en pantalla y las distancias en el espacio real. Escalado multidimensional clásico, que viene de Torgerson en 1952.' },
      { eq: 'yᵢ += ((d − dᵢⱼ)/d)·(yⱼ − yᵢ)·η',
        en: 'The relaxation step, applied to random pairs. If two points are closer on screen than they should be, push them apart; if further, pull them together. Repeat forever. It is a spring network where every pair has its own rest length.',
        es: 'El paso de relajación, aplicado a pares al azar. Si dos puntos están más cerca en pantalla de lo que deberían, sepáralos; si están más lejos, acércalos. Repetir para siempre. Es una red de resortes donde cada par tiene su propia longitud de reposo.' }
    ],
    how: { en: 'Points are generated in genuinely high-dimensional space around random cluster centres, then their full pairwise distance matrix is computed once and used as the target. The layout starts as a blob and relaxes. Nothing here knows which cluster a point belongs to: the grouping you see on screen is recovered purely from distances.',
           es: 'Los puntos se generan de verdad en un espacio de muchas dimensiones alrededor de centros de grupo al azar, después se calcula una vez su matriz completa de distancias por pares y se usa como objetivo. La disposición arranca como un grumo y se relaja. Nada acá sabe a qué grupo pertenece un punto: la agrupación que ves en pantalla se recupera solo de las distancias.' },
    watch: { en: 'The number that matters is the residual distortion at the bottom. Take the true dimensions up to 24 and watch it climb: there is simply not enough room in a plane to keep all those distances honest. This is the caveat under every t-SNE picture in every paper, and it is usually not printed.',
             es: 'El número que importa es la distorsión residual de abajo. Sube las dimensiones reales a 24 y míralo trepar: sencillamente no hay espacio en un plano para mantener honestas todas esas distancias. Esta es la advertencia que va debajo de cada imagen de t-SNE en cada paper, y normalmente no se imprime.' },
    why: { en: 'Because these plots get read as if they were maps. Distances between clusters in a t-SNE or UMAP figure are frequently meaningless, and cluster sizes almost always are. Seeing the distortion percentage move while you change the dimension is the fastest way to stop trusting them more than they deserve.',
           es: 'Porque estos gráficos se leen como si fueran mapas. Las distancias entre grupos en una figura de t-SNE o UMAP con frecuencia no significan nada, y los tamaños de los grupos casi nunca significan algo. Ver moverse el porcentaje de distorsión mientras cambias la dimensión es la forma más rápida de dejar de confiar en ellos más de lo que merecen.' }
  },

  radiation: {
    tag: { en: 'Electromagnetism', es: 'Electromagnetismo' },
    lede: { en: 'A charge sitting still has field lines going straight out forever. Shake it, and a kink runs down every line at the speed of light and never comes back. That kink is light, and this is a drawing of it happening.',
            es: 'Una carga quieta tiene líneas de campo que salen rectas para siempre. Sacúdela, y un quiebre baja por cada línea a la velocidad de la luz y no vuelve nunca. Ese quiebre es la luz, y esto es un dibujo de eso ocurriendo.' },
    math: [
      { eq: 't_ret = t − r/c',
        en: 'The retarded time. The field at distance r right now was set by where the charge was r/c ago, because nothing about the charge can travel faster than c. Everything else follows from taking this seriously.',
        es: 'El tiempo retardado. El campo a distancia r ahora mismo fue fijado por dónde estaba la carga hace r/c, porque nada de la carga puede viajar más rápido que c. Todo lo demás sale de tomarse esto en serio.' },
      { eq: 'línea de campo ∥ (r⃗ − r⃗(t_ret))',
        en: 'Purcell\'s construction: each field line still points radially away from the retarded position, not the current one. Draw that for a moving charge and the kink appears on its own, with no extra physics inserted.',
        es: 'La construcción de Purcell: cada línea de campo sigue apuntando radialmente desde la posición retardada, no la actual. Dibuja eso para una carga en movimiento y el quiebre aparece solo, sin insertar física extra.' },
      { eq: 'E_rad = q·a·sinθ / (4πε₀c²r)',
        en: 'The transverse field in the kink. Note the r in the denominator, not r²: the radiation field falls off as 1/r while the static field falls as 1/r². Far enough away, the kink is all that is left, and that is why light reaches us from other galaxies.',
        es: 'El campo transversal dentro del quiebre. Fíjate en la r del denominador, no r²: el campo de radiación cae como 1/r mientras el estático cae como 1/r². Suficientemente lejos, el quiebre es lo único que queda, y por eso nos llega luz de otras galaxias.' },
      { eq: 'P = q²a² / (6πε₀c³)',
        en: 'Larmor: radiated power goes as acceleration squared. No acceleration, no light. A charge moving at constant velocity radiates nothing at all, no matter how fast it goes.',
        es: 'Larmor: la potencia radiada va como la aceleración al cuadrado. Sin aceleración, no hay luz. Una carga que se mueve a velocidad constante no radia nada, por rápido que vaya.' }
    ],
    how: { en: 'The trajectory is a pure function of time, so the entire past can be computed instead of waited for. A history buffer is filled at a fixed timestep chosen so that the index into it is exactly the distance divided by c, which makes the retarded lookup a single array access instead of a search. Prefilling matters: without it the canvas sits blank for about five seconds while the buffer accumulates, and the first version did exactly that.',
           es: 'La trayectoria es una función pura del tiempo, así que el pasado entero se puede calcular en vez de esperarlo. Un búfer de historia se llena a paso fijo elegido para que el índice sea exactamente la distancia dividida por c, lo que convierte la consulta retardada en un solo acceso a un arreglo en vez de una búsqueda. Precargar importa: sin eso el canvas queda en blanco unos cinco segundos mientras el búfer se llena, y la primera versión hacía exactamente eso.' },
    watch: { en: 'Start on the dipole and follow one single line outward with your eye. The bends do not stay put: they march away at a fixed speed and leave. Then switch to hard turns, where the charge reverses direction abruptly, and each reversal fires one clean pulse. Raising v/c compresses the pattern ahead of the motion, which is the beginning of relativistic beaming.',
             es: 'Empieza en el dipolo y sigue una sola línea hacia afuera con la vista. Los quiebres no se quedan quietos: marchan hacia afuera a rapidez fija y se van. Después cambia a giros bruscos, donde la carga invierte la dirección de golpe, y cada inversión dispara un pulso limpio. Subir v/c comprime el patrón por delante del movimiento, que es el comienzo del enfoque relativista.' },
    why: { en: 'This is the answer to why light exists at all, and it is not usually shown as a picture. Radio antennas are this with electrons in a wire, synchrotrons are this on a curve, and the blue of the sky is this happening in every air molecule. Purcell put the construction in his textbook in 1965 because he thought the algebra was hiding it.',
           es: 'Esta es la respuesta a por qué existe la luz, y no se suele mostrar como imagen. Las antenas de radio son esto con electrones en un cable, los sincrotrones son esto sobre una curva, y el azul del cielo es esto ocurriendo en cada molécula de aire. Purcell puso la construcción en su libro en 1965 porque pensaba que el álgebra la estaba escondiendo.' }
  },

  refraction: {
    tag: { en: 'Optics', es: 'Óptica' },
    lede: { en: 'Light crossing into a different medium has to bend, because it has to stay in step with itself. Tilt it far enough and it stops crossing at all: the surface becomes a perfect mirror. That is the whole reason fibre optics work.',
            es: 'La luz que cruza a otro medio tiene que doblarse, porque tiene que mantenerse en fase consigo misma. Inclínala lo suficiente y deja de cruzar: la superficie se vuelve un espejo perfecto. Esa es la razón entera de que funcione la fibra óptica.' },
    math: [
      { eq: 'n₁ sin θ₁ = n₂ sin θ₂',
        en: 'Snell. It is not a rule about bending, it is a statement that the component of the wave along the surface has to match on both sides, otherwise the crests would not line up at the boundary.',
        es: 'Snell. No es una regla sobre doblarse, es la afirmación de que la componente de la onda a lo largo de la superficie tiene que coincidir en ambos lados, si no las crestas no calzarían en el borde.' },
      { eq: 'θ_c = arcsin(n₂/n₁)',
        en: 'When n₁ > n₂ there is an angle past which the equation asks for sin θ₂ > 1, which has no solution. Physically, nothing crosses: total internal reflection. Glass to air gives 41.8°.',
        es: 'Cuando n₁ > n₂ hay un ángulo pasado el cual la ecuación pide sin θ₂ > 1, que no tiene solución. Físicamente, no cruza nada: reflexión total interna. Vidrio a aire da 41.8°.' },
      { eq: 'r_s = (n₁cosθ₁ − n₂cosθ₂)/(n₁cosθ₁ + n₂cosθ₂)',
        en: 'Snell says where the light goes; Fresnel says how much. This is the amplitude coefficient for one polarisation, and the reflected fraction is its square. At normal incidence on glass it gives 4%, which is why you see yourself in a window.',
        es: 'Snell dice adónde va la luz; Fresnel dice cuánta. Este es el coeficiente de amplitud para una polarización, y la fracción reflejada es su cuadrado. A incidencia normal sobre vidrio da 4%, que es por qué te ves en una ventana.' },
      { eq: 'tan θ_B = n₂/n₁',
        en: 'Brewster\'s angle, where the other polarisation reflects nothing at all. That is what polarised sunglasses exploit: glare off water and roads is mostly one polarisation, and a filter can delete it.',
        es: 'El ángulo de Brewster, donde la otra polarización no refleja nada. Eso es lo que aprovechan los lentes polarizados: el reflejo del agua y del pavimento es mayormente una polarización, y un filtro puede borrarla.' }
    ],
    how: { en: 'Both Fresnel coefficients are computed and averaged, which is what unpolarised light does. The dashes moving along each ray are spaced by the local wavelength, so you can see the transmitted beam physically shorten its wavelength inside the denser medium. Four limits were checked against hand calculation: 4.0% at normal incidence, 7.4% at Brewster, 89.1% approaching the critical angle, and exactly 100% past it.',
           es: 'Se calculan los dos coeficientes de Fresnel y se promedian, que es lo que hace la luz no polarizada. Los guiones que corren por cada rayo están separados por la longitud de onda local, así puedes ver el haz transmitido acortar físicamente su longitud de onda dentro del medio más denso. Cuatro casos límite se contrastaron con cálculo a mano: 4.0% a incidencia normal, 7.4% en Brewster, 89.1% acercándose al ángulo crítico, y exactamente 100% pasándolo.' },
    watch: { en: 'Move the cursor above the surface: the beam follows it, so you can walk the angle up by hand. Watch the reflected ray brighten as you approach 41.8° and the transmitted one flatten out and vanish. Then set n above to 1 and n below to 1.5 and try again: going into the denser medium, total internal reflection is impossible at any angle.',
             es: 'Mueve el cursor sobre la superficie: el haz lo sigue, así puedes subir el ángulo a mano. Mira cómo el rayo reflejado se aviva al acercarte a 41.8° y el transmitido se aplana y desaparece. Después pon n arriba en 1 y n abajo en 1.5 y prueba de nuevo: entrando al medio más denso, la reflexión total interna es imposible a cualquier ángulo.' },
    why: { en: 'A strand of fibre is just this, over and over: light enters shallow enough that every bounce is past the critical angle, so it cannot leak, and it travels kilometres inside a thread of glass. The internet runs on a boundary condition.',
           es: 'Una hebra de fibra es solo esto, una y otra vez: la luz entra lo bastante rasante como para que cada rebote pase el ángulo crítico, así no puede escapar, y viaja kilómetros dentro de un hilo de vidrio. Internet corre sobre una condición de borde.' }
  },

  chladni: {
    tag: { en: 'Acoustics', es: 'Acústica' },
    lede: { en: 'Sand on a metal plate. Bow it and the sand runs away from everywhere that is moving and piles up along the lines that are not. You end up looking directly at a standing wave.',
            es: 'Arena sobre una placa de metal. Frótala con un arco y la arena huye de todo lo que se mueve y se apila en las líneas que no. Terminas mirando directamente una onda estacionaria.' },
    math: [
      { eq: 'u(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)',
        en: 'A mode of a square plate with free edges. The subtraction is what matters: it is the antisymmetric combination of two degenerate modes, and it is what produces the curved, non-obvious figures rather than a plain grid.',
        es: 'Un modo de una placa cuadrada con bordes libres. La resta es lo que importa: es la combinación antisimétrica de dos modos degenerados, y es lo que produce las figuras curvas y no obvias en vez de una cuadrícula simple.' },
      { eq: 'u = 0',
        en: 'The nodal lines. Every point where the plate is not moving at all, at any moment in the cycle. This is where the sand ends up, so the pattern you see is literally the zero set of a function.',
        es: 'Las líneas nodales. Cada punto donde la placa no se mueve nada, en ningún momento del ciclo. Ahí termina la arena, así que el patrón que ves es literalmente el conjunto de ceros de una función.' },
      { eq: 'ṙ ∝ −∇|u| + ξ·|u|',
        en: 'How each grain is moved: downhill on the amplitude, plus a random kick whose size is the local amplitude. Where the plate is loud the grain bounces and wanders; where it is silent the kick is zero and the grain stays. Nobody tells the sand where the lines are.',
        es: 'Cómo se mueve cada grano: cuesta abajo en la amplitud, más una patada al azar cuyo tamaño es la amplitud local. Donde la placa suena fuerte el grano rebota y vaga; donde está en silencio la patada es cero y el grano se queda. Nadie le dice a la arena dónde están las líneas.' }
    ],
    how: { en: 'A few thousand grains, each following the gradient of |u| estimated by finite differences, plus noise proportional to the local amplitude. That second term is the whole mechanism and it is not a trick: it is why real sand accumulates at nodes, because a vibrating region keeps throwing grains until one lands somewhere that does not throw it back. I measured it: mean |u| across the grains starts at 0.541 for a random scatter and settles at 0.070.',
           es: 'Unos miles de granos, cada uno siguiendo el gradiente de |u| estimado por diferencias finitas, más ruido proporcional a la amplitud local. Ese segundo término es todo el mecanismo y no es un truco: es por qué la arena real se acumula en los nodos, porque una región que vibra sigue lanzando granos hasta que uno cae donde ya no lo lanzan. Lo medí: el |u| promedio sobre los granos parte en 0.541 con una dispersión al azar y se asienta en 0.070.' },
    watch: { en: 'Change m and n by one and the figure reorganises completely, which is the point: these patterns are not continuous in the parameters, they are discrete modes. Setting m equal to n cancels the expression exactly and the plate goes silent, and the sand just sits wherever it happened to be.',
             es: 'Cambia m y n en uno y la figura se reorganiza por completo, que es justamente el punto: estos patrones no son continuos en los parámetros, son modos discretos. Poner m igual a n cancela la expresión exactamente y la placa queda muda, y la arena se queda donde haya quedado.' },
    why: { en: 'Chladni toured Europe doing this in the 1780s and it was the closest thing to seeing sound. Napoleon set a prize for explaining it mathematically; Sophie Germain won it in 1816 after three attempts, working outside the academy because she was not allowed inside it. The theory of vibrating plates came out of that prize.',
           es: 'Chladni recorrió Europa haciendo esto en los años 1780 y era lo más cercano que había a ver el sonido. Napoleón puso un premio por explicarlo matemáticamente; Sophie Germain lo ganó en 1816 al tercer intento, trabajando fuera de la academia porque no la dejaban entrar. La teoría de placas vibrantes salió de ese premio.' }
  },

  ulam: {
    tag: { en: 'Number theory', es: 'Teoría de números' },
    lede: { en: 'Ulam was bored in a talk in 1963 and started numbering a square spiral on a napkin, circling the primes. They fell on diagonals. Sixty years later nobody has explained why.',
            es: 'Ulam estaba aburrido en una charla en 1963 y empezó a numerar una espiral cuadrada en una servilleta, marcando los primos. Cayeron en diagonales. Sesenta años después nadie ha explicado por qué.' },
    math: [
      { eq: 'π(N) ~ N / ln N',
        en: 'The prime number theorem: primes thin out, but slowly. Near 40.000 roughly one in ten numbers is prime, so a spiral of that size should look like uniform static. It does not.',
        es: 'El teorema de los números primos: los primos se ralean, pero despacio. Cerca de 40.000 más o menos uno de cada diez números es primo, así que una espiral de ese tamaño debería verse como estática uniforme. No se ve así.' },
      { eq: 'diagonal ⇒ 4n² + bn + c',
        en: 'Why diagonals are special: walking diagonally on the spiral means stepping by a full turn, and each turn adds a linearly growing amount. So a diagonal is exactly the set of values of a quadratic polynomial.',
        es: 'Por qué las diagonales son especiales: caminar en diagonal por la espiral significa avanzar una vuelta completa, y cada vuelta agrega una cantidad que crece linealmente. Así que una diagonal es exactamente el conjunto de valores de un polinomio cuadrático.' },
      { eq: 'n² + n + 41',
        en: 'Euler found this in 1772 and it is prime for every n from 0 to 39, without exception. Turn on the marker and it lights up as a single unbroken line. Over the first 200 values it is prime 78% of the time, against a background density of 10.5%.',
        es: 'Euler encontró esto en 1772 y es primo para todo n de 0 a 39, sin excepción. Enciende el marcador y se ilumina como una sola línea continua. En los primeros 200 valores es primo el 78% de las veces, contra una densidad de fondo de 10.5%.' }
    ],
    how: { en: 'A sieve of Eratosthenes for the whole range, then a single walk along the spiral writing pixels: right one, turn, up one, turn, left two, turn, down two, and so on. The arm length grows every second turn, which is the entire spiral in one line of logic. The image is cached by parameters, so panning the sliders is instant and only a change actually recomputes.',
           es: 'Una criba de Eratóstenes para todo el rango, después un solo recorrido por la espiral escribiendo píxeles: uno a la derecha, giro, uno arriba, giro, dos a la izquierda, giro, dos abajo, y así. El largo del brazo crece cada dos giros, que es la espiral entera en una línea de lógica. La imagen se cachea por parámetros, así que mover los deslizadores es instantáneo y solo un cambio real recalcula.' },
    watch: { en: 'Move the offset. The diagonals do not wash out, they reorganise, because shifting the start changes which quadratic sits on which line. Some offsets are visibly richer than others, and that is not an artefact: certain polynomials really are more prime-dense than others.',
             es: 'Mueve el desplazamiento. Las diagonales no se borran, se reorganizan, porque correr el inicio cambia qué cuadrática cae en qué línea. Algunos desplazamientos son visiblemente más ricos que otros, y eso no es un artefacto: ciertos polinomios de verdad son más densos en primos que otros.' },
    why: { en: 'Because the pattern is real and unexplained. Hardy and Littlewood conjectured in 1923 a formula for how dense primes are along a quadratic, and it predicts the effect well, but the conjecture is still a conjecture. This picture is one of the few places where an open problem in number theory is visible to the naked eye.',
           es: 'Porque el patrón es real y no está explicado. Hardy y Littlewood conjeturaron en 1923 una fórmula para la densidad de primos a lo largo de una cuadrática, y predice bien el efecto, pero la conjetura sigue siendo conjetura. Esta imagen es uno de los pocos lugares donde un problema abierto de teoría de números se ve a simple vista.' }
  },

  collatz: {
    tag: { en: 'Number theory', es: 'Teoría de números' },
    lede: { en: 'Take any number. Even, halve it. Odd, triple it and add one. Every number anybody has ever tried falls to 1. Nobody can prove it, and Erdős said mathematics is not ready for problems like this.',
            es: 'Toma cualquier número. Par, divídelo en dos. Impar, triplícalo y suma uno. Todo número que alguien haya probado cae a 1. Nadie puede demostrarlo, y Erdős dijo que la matemática no está lista para problemas así.' },
    math: [
      { eq: 'f(n) = n/2 si n par;  3n+1 si n impar',
        en: 'The entire rule. It fits on a line and a child can follow it, which is precisely what makes the difficulty embarrassing.',
        es: 'La regla completa. Cabe en una línea y un niño puede seguirla, que es exactamente lo que hace vergonzosa la dificultad.' },
      { eq: '3n+1 es par ⇒ el paso real es (3n+1)/2',
        en: 'Odd steps grow by about 1.5×, even steps halve. On average a random step multiplies by √(3/2)/... under 1, so heuristically everything should fall. Heuristics are not proofs, and the sequence for 27 climbs to 9232 before collapsing.',
        es: 'Los pasos impares crecen alrededor de 1.5×, los pares dividen en dos. En promedio un paso al azar multiplica por menos de 1, así que heurísticamente todo debería caer. Las heurísticas no son demostraciones, y la secuencia del 27 trepa hasta 9232 antes de derrumbarse.' },
      { eq: 'verificado hasta 2⁶⁸ ≈ 2.95 × 10²⁰',
        en: 'Every starting value below that has been checked by computer and every one reaches 1. That is overwhelming evidence and zero proof, and the distinction is the whole of mathematics.',
        es: 'Todo valor inicial bajo esa cifra se revisó por computador y todos llegan a 1. Es evidencia abrumadora y cero demostración, y esa distinción es la matemática entera.' }
    ],
    how: { en: 'For each starting number the sequence is computed down to 1, then drawn backwards from a common root, turning one way on an even step and the other way on an odd one. Because every sequence ends at 1, every drawing starts at the same point, and the shared prefixes overlap into thick trunks while the rare paths become thin outer branches. It is rendered once to an offscreen canvas and cached, because 2.200 paths is far too much to redraw at 60fps.',
           es: 'Para cada número inicial se calcula la secuencia hasta 1, después se dibuja al revés desde una raíz común, girando hacia un lado en un paso par y hacia el otro en uno impar. Como toda secuencia termina en 1, todo dibujo empieza en el mismo punto, y los prefijos compartidos se superponen en troncos gruesos mientras los caminos raros quedan como ramas finas de afuera. Se renderiza una vez a un canvas fuera de pantalla y se cachea, porque 2.200 caminos es demasiado para redibujar a 60fps.' },
    watch: { en: 'The readout gives the longest path found. Under 2.200 it is 181 steps, and that record belongs to 1161; the next number to beat it is 2223, just outside the range. Push the count up and watch the coral thicken without ever growing a branch that escapes: every single one of those thousands of paths comes home.',
             es: 'La lectura da el camino más largo encontrado. Bajo 2.200 son 181 pasos, y ese récord es del 1161; el siguiente número que lo supera es el 2223, justo fuera del rango. Sube la cantidad y mira el coral engrosarse sin que nunca crezca una rama que se escape: cada uno de esos miles de caminos vuelve a casa.' },
    why: { en: 'Terence Tao got the closest anybody has in 2019, proving that almost all starting values eventually get almost bounded, which is a long way from all. The problem is famous because it is the clearest example of a statement that is trivial to check, impossible to prove, and completely useless if true.',
           es: 'Terence Tao llegó más cerca que nadie en 2019, demostrando que casi todos los valores iniciales terminan casi acotados, que está lejos de todos. El problema es famoso porque es el ejemplo más claro de un enunciado trivial de comprobar, imposible de demostrar, y completamente inútil si es cierto.' }
  },

  voronoi: {
    tag: { en: 'Geometry', es: 'Geometría' },
    lede: { en: 'Scatter some points, then colour every position in the plane by whichever point is nearest. The boundaries that appear were never drawn: they are just where the answer changes.',
            es: 'Esparce unos puntos y después colorea cada posición del plano según cuál punto tenga más cerca. Los bordes que aparecen nunca se dibujaron: son solo el lugar donde cambia la respuesta.' },
    math: [
      { eq: 'V(pᵢ) = { x : d(x,pᵢ) ≤ d(x,pⱼ) ∀j }',
        en: 'The definition, and it is the whole thing. Each cell is the set of points closer to one site than to any other. Everything else, including the fact that the cells are convex polygons, is a consequence.',
        es: 'La definición, y es todo. Cada celda es el conjunto de puntos más cerca de un sitio que de cualquier otro. Todo lo demás, incluido que las celdas sean polígonos convexos, es consecuencia.' },
      { eq: 'd(x,y) = √(Δx² + Δy²)  |  |Δx|+|Δy|  |  max(|Δx|,|Δy|)',
        en: 'Euclidean, Manhattan, Chebyshev. Change which one you mean by nearest and the cell walls stop being straight-line bisectors: Manhattan gives staircase boundaries, Chebyshev gives boxes. The sites never moved.',
        es: 'Euclídea, Manhattan, Chebyshev. Cambia a cuál te refieres con más cerca y las paredes de las celdas dejan de ser bisectrices rectas: Manhattan da bordes en escalera, Chebyshev da cajas. Los sitios no se movieron.' },
      { eq: 'dual = triangulación de Delaunay',
        en: 'Connect every pair of sites whose cells touch and you get the Delaunay triangulation, the triangulation that maximises the smallest angle. Two of the most used structures in computational geometry are the same object seen from two sides.',
        es: 'Conecta cada par de sitios cuyas celdas se tocan y obtienes la triangulación de Delaunay, la que maximiza el ángulo más chico. Dos de las estructuras más usadas de la geometría computacional son el mismo objeto visto por dos lados.' }
    ],
    how: { en: 'Brute force on purpose: a coarse grid where every cell asks every site who is closest, then the result is scaled up with smoothing. Fortune\'s sweep-line algorithm would build the exact diagram in O(n log n), but it needs a priority queue and careful degenerate-case handling, and here the sites move every frame so the diagram would be rebuilt anyway. Borders are found by checking whether a pixel\'s owner differs from its right or lower neighbour, which is one comparison instead of any geometry.',
           es: 'Fuerza bruta a propósito: una rejilla gruesa donde cada celda le pregunta a cada sitio quién está más cerca, y después el resultado se escala con suavizado. El algoritmo de barrido de Fortune construiría el diagrama exacto en O(n log n), pero necesita una cola de prioridad y un manejo cuidadoso de casos degenerados, y acá los sitios se mueven cada frame así que el diagrama se reconstruiría igual. Los bordes se encuentran comprobando si el dueño de un píxel difiere del de su vecino derecho o inferior, que es una comparación en vez de geometría.' },
    watch: { en: 'Your cursor is a site. Move it slowly near a boundary and watch cells that are nowhere near you change shape, because adding a site steals area from everyone whose territory it touches. Then switch the distance to Manhattan and the whole world turns into city blocks without a single site moving.',
             es: 'Tu cursor es un sitio. Muévelo despacio cerca de un borde y mira cómo cambian de forma celdas que no están cerca de ti, porque agregar un sitio le roba área a todos cuyo territorio toca. Después cambia la distancia a Manhattan y el mundo entero se vuelve cuadras de ciudad sin que se mueva un solo sitio.' },
    why: { en: 'John Snow drew one by hand in 1854 around the water pumps of London and used it to argue that cholera came from a single pump on Broad Street. The same diagram is used for cell shapes in tissue, coverage areas for antennas, mesh generation for simulation, and crystal grain boundaries, which grow into exactly this because each seed claims what is nearest.',
           es: 'John Snow dibujó uno a mano en 1854 alrededor de las bombas de agua de Londres y lo usó para argumentar que el cólera venía de una sola bomba en Broad Street. El mismo diagrama se usa para formas celulares en tejidos, áreas de cobertura de antenas, generación de mallas para simulación, y bordes de grano en cristales, que crecen exactamente en esto porque cada semilla reclama lo que tiene más cerca.' }
  },
};

module.exports.steps = {
  interference: [
    { from: 'const STEP = 6, k = TAU / P.lambda;', to: 'src.push([w * (0.5 + 0.3 * Math.cos(a))',
      title: { en: 'Place the sources', es: 'Ubicar las fuentes' },
      explain: { en: 'k = 2π/λ turns a wavelength in pixels into a phase per pixel. The first source follows your cursor when it is over the canvas; the rest are spread on an arc, and the slider decides how many.',
                 es: 'k = 2π/λ convierte una longitud de onda en píxeles en una fase por píxel. La primera fuente sigue tu cursor cuando está sobre el canvas; el resto se reparten en un arco, y el deslizador decide cuántas.' } },
    { from: 'let psi = 0;', to: 'psi += s[2]',
      title: { en: 'Add every wave at that point', es: 'Sumar todas las ondas en ese punto' },
      explain: { en: 'Superposition, literally a running sum. r is the distance to the source, the +8 avoids the singularity at r=0, and 22/√r is the amplitude decay of a circular wave.',
                 es: 'Superposición, literalmente una suma acumulada. r es la distancia a la fuente, el +8 evita la singularidad en r=0, y 22/√r es la caída de amplitud de una onda circular.' } },
    { from: 'const I = Math.min(1, psi * psi / 9);', to: 'ctx.beginPath(); ctx.arc(x, y, 0.5 + I * 2.2, 0, TAU); ctx.fill();',
      title: { en: 'Square it and draw', es: 'Elevar al cuadrado y dibujar' },
      explain: { en: 'Intensity is amplitude squared. Squaring turns a signed wave into something visible and makes the dark fringes exactly zero. I then drives both the dot radius and its opacity.',
                 es: 'La intensidad es la amplitud al cuadrado. Elevar al cuadrado convierte una onda con signo en algo visible y hace que las franjas oscuras sean exactamente cero. I luego gobierna el radio del punto y su opacidad.' } },
  ],
  galaxia: [
    { from: 'const u = Math.pow(Math.random(), 0.72);', to: 'tw: Math.random() * Math.PI * 2',
      title: { en: 'Seed the field', es: 'Sembrar el campo' },
      explain: { en: 'The radius comes from a power of a uniform random number: the 0.72 exponent piles stars toward the core. The arm is an integer folded later with mod, and the scatter grows with u so the arms fray at the rim exactly like the real thing.',
                 es: 'El radio sale de una potencia de un azar uniforme: el exponente 0,72 apila estrellas hacia el núcleo. El brazo es un entero que después se pliega con módulo, y la dispersión crece con u para que los brazos se deshilachen en el borde igual que en las de verdad.' } },
    { from: 'const r = 0.05 + s.u * 0.95;', to: 'const y = cy + Math.sin(th) * r * R * ci;',
      title: { en: 'Differential rotation on a log spiral', es: 'Rotación diferencial sobre una espiral logarítmica' },
      explain: { en: 'Three terms build the angle: which arm, where along the log spiral, and how far the star has drifted — inner stars drift faster because ω grows as r shrinks. The vertical squash by cos i is the entire 3D of this experiment.',
                 es: 'Tres términos arman el ángulo: qué brazo, dónde sobre la espiral logarítmica y cuánto ha derivado la estrella — las interiores derivan más rápido porque ω crece cuando r se achica. El aplastamiento vertical por cos i es todo el 3D de este experimento.' } },
    { from: 'const b = (0.3 + 0.7 * (1 - s.u))', to: 'ctx.arc(x, y, s.sz * 0.75, 0, Math.PI * 2); ctx.fill();',
      title: { en: 'Draw it like a long exposure', es: 'Dibujarla como larga exposición' },
      explain: { en: 'Brightness falls with radius and twinkles with a per-star phase. Each star is a wide dim halo plus a small bright core, composited additively: overlap becomes brightness, and the crowded arms and nucleus bloom toward white on their own.',
                 es: 'El brillo cae con el radio y parpadea con una fase por estrella. Cada estrella es un halo ancho y tenue más un núcleo chico y brillante, compuestos aditivamente: la superposición se vuelve brillo, y los brazos poblados y el núcleo florecen hacia el blanco solos.' } },
  ],
  lorenz: [
    { from: 'const dt = 0.005;', to: 'trail.push([x, y, z]);',
      title: { en: 'Integrate the three equations', es: 'Integrar las tres ecuaciones' },
      explain: { en: 'Classical fourth-order Runge-Kutta: the derivative is sampled four times across the step and the samples are blended. Fourteen steps of dt = 0.005 per frame keep the curve smooth. It replaced forward Euler after a numerical check measured Euler\'s Lyapunov exponent 5.8 % above the published value. σ, ρ and β come from the sliders.',
                 es: 'Runge-Kutta clásico de cuarto orden: la derivada se evalúa cuatro veces a lo largo del paso y las muestras se combinan. Catorce pasos de dt = 0,005 por frame mantienen la curva suave. Reemplazó a Euler explícito después de que una prueba numérica midiera el exponente de Lyapunov de Euler un 5,8 % por encima del valor publicado. σ, ρ y β vienen de los deslizadores.' } },
    { from: 'const ang = M.in ?', to: 'const py = p => cy - p[2] * sc;',
      title: { en: 'Rotate and project to 2D', es: 'Rotar y proyectar a 2D' },
      explain: { en: 'The attractor lives in three dimensions and the screen has two. Moving the cursor left and right rotates the view around the vertical axis before projecting, so you can look at the butterfly from the side.',
                 es: 'El atractor vive en tres dimensiones y la pantalla tiene dos. Mover el cursor a izquierda y derecha rota la vista sobre el eje vertical antes de proyectar, así puedes mirar la mariposa de canto.' } },
    { from: 'for (let i = 1; i < trail.length; i++) {', to: 'ctx.stroke();',
      title: { en: 'Draw with a fading tail', es: 'Dibujar con la cola desvaneciéndose' },
      explain: { en: 'Opacity is proportional to the index, so the oldest segments are nearly invisible and the newest is bright. That gradient is what reads as motion in a still frame.',
                 es: 'La opacidad es proporcional al índice, así los segmentos más viejos quedan casi invisibles y el más nuevo brillante. Ese degradado es lo que se lee como movimiento en un frame quieto.' } },
  ],
  pendulum: [
    { from: 'if (M.in) {', to: 'trace.length = 0;',
      title: { en: 'Grab it with the cursor', es: 'Agarrarlo con el cursor' },
      explain: { en: 'While the pointer is over the canvas the pendulum stops integrating and simply points at it, with both velocities zeroed. Leave the canvas and it falls from wherever you left it.',
                 es: 'Mientras el puntero está sobre el canvas el péndulo deja de integrar y simplemente apunta hacia él, con las dos velocidades en cero. Sales del canvas y cae desde donde lo dejaste.' } },
    { from: 'const d = 2 * m1 + m2', to: 'v2 = (v2 + H / 6',
      title: { en: 'The equations of motion', es: 'Las ecuaciones de movimiento' },
      explain: { en: 'acel returns the expanded Euler-Lagrange accelerations: n1 and n2 are the numerators and d the shared denominator. Each of the three steps per frame is a fourth-order Runge-Kutta step, which keeps the undamped energy within a millionth of a percent over a minute; the earlier semi-implicit Euler lost 7 %. The damping slider is the final multiplication on both velocities.',
                 es: 'acel devuelve las aceleraciones de Euler-Lagrange expandidas: n1 y n2 son los numeradores y d el denominador común. Cada uno de los tres pasos por frame es un paso de Runge-Kutta de cuarto orden, que sin amortiguación conserva la energía dentro de una millonésima de por ciento en un minuto; el Euler semi-implícito anterior perdía 7 %. El deslizador de amortiguación es la multiplicación final sobre las dos velocidades.' } },
    { from: 'const x1 = ox + l1 * Math.sin(a1)', to: 'if (trace.length > 900) trace.shift();',
      title: { en: 'From angles to positions', es: 'De ángulos a posiciones' },
      explain: { en: 'The state is two angles, not two points. Positions come out with plain trigonometry, chained: the second rod hangs from wherever the first one ended up.',
                 es: 'El estado son dos ángulos, no dos puntos. Las posiciones salen con trigonometría simple, encadenada: la segunda barra cuelga de donde haya quedado la primera.' } },
  ],
  flow: [
    { from: 'const a = (Math.sin(p.x * f + t * 0.35)', to: 'let vx = Math.cos(a) * Q.speed, vy = Math.sin(a) * Q.speed;',
      title: { en: 'Read the field', es: 'Leer el campo' },
      explain: { en: 'The field is a closed-form function of position and time: no noise table, no lookup. Each particle asks for the angle where it stands. The scale slider changes f, which is how tight the swirls are.',
                 es: 'El campo es una función cerrada de posición y tiempo: sin tabla de ruido, sin lookup. Cada partícula pregunta el ángulo donde está. El deslizador de escala cambia f, que es qué tan apretados son los remolinos.' } },
    { from: 'if (M.in && Q.pull) {', to: 'if (d < 220) { const g = Q.pull',
      title: { en: 'Bend it with the cursor', es: 'Curvarlo con el cursor' },
      explain: { en: 'Within 220px the cursor adds a pull that falls off linearly with distance. It does not replace the field: it is added on top, so you deform the flow instead of overriding it.',
                 es: 'Dentro de 220px el cursor suma una atracción que decae linealmente con la distancia. No reemplaza al campo: se suma encima, así deformas el flujo en vez de anularlo.' } },
    { from: 'fade: 0.055', to: 'fade: 0.055',
      title: { en: 'The trails are a fade, not a buffer', es: 'Las estelas son un desvanecido, no un buffer' },
      explain: { en: 'The engine reads this flag and paints a black rectangle at 5.5% opacity instead of clearing. Old strokes decay exponentially, which costs nothing and stores no history.',
                 es: 'El motor lee esta bandera y pinta un rectángulo negro al 5,5% de opacidad en vez de limpiar. Los trazos viejos decaen exponencialmente, lo que no cuesta nada y no guarda historia.' } },
  ],
  rule30: [
    { from: 'const seed = c =>', to: 'const seed = c =>',
      title: { en: 'One row, one cell on', es: 'Una fila, una celda encendida' },
      explain: { en: 'The entire initial condition. A byte array with a single 1 in the middle: everything you see grows from that one cell.',
                 es: 'La condición inicial completa. Un arreglo de bytes con un solo 1 al medio: todo lo que ves crece de esa única celda.' } },
    { from: 'const R = P.rule | 0, next = new Uint8Array(cols);', to: 'row = next; y++;',
      title: { en: 'Apply the rule', es: 'Aplicar la regla' },
      explain: { en: 'The three neighbours are packed into a number 0-7, and the answer is that bit of the rule number. Rule 30 is 00011110 in binary. Move the slider and you can run all 256 elementary automata.',
                 es: 'Las tres vecinas se empaquetan en un número 0-7, y la respuesta es ese bit del número de regla. La Regla 30 es 00011110 en binario. Mueve el deslizador y puedes correr los 256 autómatas elementales.' } },
    { from: 'persist: true', to: 'persist: true',
      title: { en: 'Never clear the canvas', es: 'Nunca limpiar el canvas' },
      explain: { en: 'This flag tells the engine to skip the clear. Each frame paints exactly one new row on top of everything already drawn, which is how the triangle accumulates.',
                 es: 'Esta bandera le dice al motor que se salte el borrado. Cada frame pinta exactamente una fila nueva encima de todo lo ya dibujado, que es como se acumula el triángulo.' } },
  ],
  phyllotaxis: [
    { from: 'const GA = P.angle * Math.PI / 180;', to: 'const spin = M.in ?',
      title: { en: 'The divergence angle', es: 'El ángulo de divergencia' },
      explain: { en: 'The slider defaults to 137.507°, the golden angle. Move it a tenth of a degree in either direction and the spirals collapse into radial spokes: that is how sharp the optimum is.',
                 es: 'El deslizador parte en 137,507°, el ángulo áureo. Muévelo una décima de grado en cualquier dirección y las espirales colapsan en radios: así de afilado es el óptimo.' } },
    { from: 'const a = i * GA + spin, r = sc * Math.sqrt(i);', to: 'const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);',
      title: { en: 'Angle linear, radius as a square root', es: 'Ángulo lineal, radio como raíz' },
      explain: { en: 'The √i is the whole trick. Area grows as r², so for every seed to occupy the same area the radius has to grow as the square root of the index.',
                 es: 'El √i es todo el truco. El área crece como r², así que para que cada semilla ocupe la misma área el radio tiene que crecer como la raíz del índice.' } },
    { from: 'const f = i / n;', to: 'ctx.beginPath(); ctx.arc(x, y, 0.8 + f * 2.1, 0, TAU); ctx.fill();',
      title: { en: 'Newer points read as newer', es: 'Los puntos nuevos se leen nuevos' },
      explain: { en: 'Size and opacity scale with the index, so the outer ring looks like fresh growth. No simulation: it is drawn straight from the formula every frame.',
                 es: 'El tamaño y la opacidad escalan con el índice, así el anillo exterior parece crecimiento fresco. Sin simulación: se dibuja directo de la fórmula en cada frame.' } },
  ],
  brownian: [
    { from: 'k.x += (Math.random() - 0.5) * P.jump;', to: 'k.p.push([k.x, k.y]);',
      title: { en: 'One step, no memory', es: 'Un paso, sin memoria' },
      explain: { en: 'A uniform random offset per axis, independent of the previous step. That independence is the definition of a random walk. The drift slider adds a bias toward the cursor on top of it.',
                 es: 'Un desplazamiento aleatorio uniforme por eje, independiente del paso anterior. Esa independencia es la definición de caminata aleatoria. El deslizador de deriva le suma encima un sesgo hacia el cursor.' } },
    { from: 'if (k.p.length > 520)', to: 'ctx.lineTo(k.p[i][0], k.p[i][1]); ctx.stroke();',
      title: { en: 'Draw the history', es: 'Dibujar la historia' },
      explain: { en: 'The path is the interesting object, not the current position. Keeping 520 points and fading along the length shows where the walker has been without unbounded memory.',
                 es: 'El camino es el objeto interesante, no la posición actual. Guardar 520 puntos y desvanecer a lo largo muestra por dónde anduvo el caminante sin memoria ilimitada.' } },
  ],
  fourier: [
    { from: 'const phase = M.in ?', to: 'let x = cx, y = cy;',
      title: { en: 'Time, or your cursor', es: 'El tiempo, o tu cursor' },
      explain: { en: 'Normally the phase advances with time. With the pointer over the canvas it is taken from the cursor position instead, so you can scrub the wave by hand and stop it wherever you want.',
                 es: 'Normalmente la fase avanza con el tiempo. Con el puntero sobre el canvas se toma de la posición del cursor, así puedes recorrer la onda a mano y detenerla donde quieras.' } },
    { from: 'const n = i * 2 + 1, r = R * (4 / (n * Math.PI));', to: 'y += r * Math.sin(n * phase);',
      title: { en: 'One circle per harmonic', es: 'Un círculo por armónico' },
      explain: { en: 'n takes odd values only and the radius is 4/nπ: those are the Fourier coefficients of a square wave, straight from the series. The rotation rate is n, so higher harmonics spin faster.',
                 es: 'n toma solo valores impares y el radio es 4/nπ: esos son los coeficientes de Fourier de una onda cuadrada, directo de la serie. La velocidad de giro es n, así que los armónicos altos giran más rápido.' } },
    { from: 'trace.unshift(y);', to: 'ctx.stroke();',
      title: { en: 'Plot the tip over time', es: 'Graficar la punta en el tiempo' },
      explain: { en: 'Only the vertical position of the last tip is recorded. Pushing it to the front of a buffer and drawing that buffer to the right turns rotation into a waveform.',
                 es: 'Solo se registra la posición vertical de la última punta. Meterla al frente de un buffer y dibujar ese buffer hacia la derecha convierte rotación en forma de onda.' } },
  ],
  relativity: [
    { from: 'const beta = M.in ?', to: 'const g = 1 / Math.sqrt(1 - beta * beta);',
      title: { en: 'The Lorentz factor', es: 'El factor de Lorentz' },
      explain: { en: 'One line, and both effects on screen follow from it. Beta comes from the cursor when it is over the canvas, otherwise from the slider.',
                 es: 'Una linea, y los dos efectos en pantalla salen de ella. Beta viene del cursor cuando esta sobre el canvas, si no del deslizador.' } },
    { from: 'const prevT = tau;', to: 'if (Math.floor(tau * 1.2) !== Math.floor(prevT * 1.2)) ticksM++;',
      title: { en: 'Proper time runs at dt/gamma', es: 'El tiempo propio corre a dt/gamma' },
      explain: { en: 'This is the only place dilation is applied. It is not a drawing trick: the photon travels a longer diagonal at the same speed c, so each bounce takes gamma times longer measured from here. The tick counters diverge by exactly that ratio.',
                 es: 'Este es el unico lugar donde se aplica la dilatacion. No es un truco de dibujo: el foton recorre una diagonal mas larga a la misma velocidad c, asi que cada rebote tarda gamma veces mas medido desde aca. Los contadores de ticks se separan exactamente por esa razon.' } },
    { from: 'const phY = topY + H * pm;', to: 'else if (path.length > keep) path.splice(0, path.length - keep);',
      title: { en: 'The zigzag is the whole argument', es: 'El zigzag es todo el argumento' },
      explain: { en: 'The photon position is recorded frame by frame in this reference frame and drawn as a trail. Nobody draws the diagonal by hand: it appears because the clock moves sideways while the photon bounces, and the longer path is right there to see.',
                 es: 'La posicion del foton se registra frame a frame en este marco y se dibuja como estela. Nadie dibuja la diagonal a mano: aparece porque el reloj se desplaza mientras el foton rebota, y el camino mas largo queda a la vista.' } },
    { from: 'const rulerY = h * 0.79, L0 = w * 0.16;', to: 'ctx.beginPath(); ctx.moveTo(cxm - L0 / (2 * g), rulerY); ctx.lineTo(cxm + L0 / (2 * g), rulerY); ctx.stroke();',
      title: { en: 'Contraction, kept separate', es: 'La contraccion, aparte' },
      explain: { en: 'Length contraction only applies along the direction of motion, so the mirror separation is untouched and a ruler underneath carries that effect instead. Mixing the two into one drawing is the usual way this diagram gets it wrong.',
                 es: 'La contraccion de longitud solo aplica a lo largo del movimiento, asi que la separacion entre espejos queda intacta y una regla abajo lleva ese efecto. Mezclar los dos en un mismo dibujo es como este diagrama suele quedar mal.' } },
  ],

  spacetime: [
    { from: 'const zOf = r => 2 * Math.sqrt(rs * Math.max(0, r - rs));', to: '};',
      title: { en: 'Flamm paraboloid', es: 'Paraboloide de Flamm' },
      explain: { en: 'This is the exact embedding surface of the Schwarzschild metric, not an invented well. The throat sits at the Schwarzschild radius and the surface flattens toward infinity.',
                 es: 'Esta es la superficie de embebimiento exacta de la metrica de Schwarzschild, no un pozo inventado. La garganta esta en el radio de Schwarzschild y la superficie se aplana hacia el infinito.' } },
    { from: 'const RINGS = 16, SPOKES = 32, RMAX = Math.max(w, h) * 0.62;', to: 'ctx.stroke();',
      title: { en: 'A polar mesh, not a square one', es: 'Malla polar, no cuadrada' },
      explain: { en: 'Rings and spokes follow the symmetry of the problem. A square grid would cross itself near the throat, which is exactly what the first version of this did.',
                 es: 'Anillos y radios siguen la simetria del problema. Una rejilla cuadrada se cruzaria sobre si misma cerca de la garganta, que es exactamente lo que hacia la primera version de esto.' } },
    { from: 'for (let s = 0; s < 2; s++) {', to: 'b.x += b.vx * 0.5; b.y += b.vy * 0.5;',
      title: { en: 'Integrate flat, draw curved', es: 'Integrar plano, dibujar curvo' },
      explain: { en: 'The particles are integrated with Newtonian gravity in the flat plane and only then projected onto the surface. At these speeds general relativity reduces to Newton, so the two agree.',
                 es: 'Las particulas se integran con gravedad newtoniana en el plano y solo despues se proyectan a la superficie. A estas velocidades la relatividad general se reduce a Newton, asi que las dos coinciden.' } },
  ],

  quantum: [
    { from: 'const E1 = n1 * n1 * 0.35, E2 = n2 * n2 * 0.35;', to: 'const E1 = n1 * n1 * 0.35, E2 = n2 * n2 * 0.35;',
      title: { en: 'Energies go as n squared', es: 'Las energias van como n al cuadrado' },
      explain: { en: 'Not linear. That quadratic spacing is why the two states beat against each other, and why the beat gets faster the further apart you set them.',
                 es: 'No lineal. Ese espaciado cuadratico es la razon de que los dos estados batan entre si, y de que el batido se acelere mientras mas los separes.' } },
    { from: 'const f1 = Math.sin(n1 * Math.PI * u)', to: 'pr.push([x, base - (re * re + im * im) * A * 1.5]);',
      title: { en: 'Evaluate the exact solution', es: 'Evaluar la solucion exacta' },
      explain: { en: 'No integration: the closed form is known, so each point is computed directly. Real and imaginary parts are tracked separately because the phase between them is the whole physics.',
                 es: 'Sin integracion: la forma cerrada se conoce, asi que cada punto se calcula directo. Las partes real e imaginaria se llevan por separado porque la fase entre ellas es toda la fisica.' } },
    { from: 'line(reP, 0.35, 1);', to: 'line(pr, 0.95, 1.6);',
      title: { en: 'Only the squared modulus is observable', es: 'Solo el modulo al cuadrado es observable' },
      explain: { en: 'Re and Im are drawn faint on purpose. No measurement returns them: what you can actually detect is the sum of their squares, drawn bright on top.',
                 es: 'Re e Im se dibujan tenues a proposito. Ninguna medicion los devuelve: lo que puedes detectar es la suma de sus cuadrados, dibujada brillante encima.' } },
  ],
  oscillators: [
    { from: 'const a1 = (-P.k * x1 - P.kc * (x1 - x2));', to: 'v1 += a1 * dt; v2 += a2 * dt; x1 += v1 * dt; x2 += v2 * dt;',
      title: { en: 'Two coupled equations', es: 'Dos ecuaciones acopladas' },
      explain: { en: 'Each mass feels its own spring plus the shared one. That single coupling term is what makes the system exchange energy instead of being two separate problems.',
                 es: 'Cada masa siente su propio resorte mas el compartido. Ese unico termino de acoplamiento es lo que hace que el sistema intercambie energia en vez de ser dos problemas separados.' } },
    { from: 'if (M.in) { x1 = (M.y / h - 0.5) * 2; v1 = 0; }', to: 'if (M.in) { x1 = (M.y / h - 0.5) * 2; v1 = 0; }',
      title: { en: 'Lift the first mass', es: 'Levantar la primera masa' },
      explain: { en: 'The cursor sets the displacement of the first mass directly and zeroes its velocity. Let go and the coupling starts handing that energy to the second one.',
                 es: 'El cursor fija el desplazamiento de la primera masa directo y anula su velocidad. La sueltas y el acoplamiento empieza a pasarle esa energia a la segunda.' } },
    { from: '[[h1, 0.85], [h2, 0.4]].forEach', to: 'ctx.stroke();',
      title: { en: 'Plot both histories', es: 'Graficar las dos historias' },
      explain: { en: 'The beating is far easier to read in the traces than in the masses. Two envelopes in antiphase: as one grows the other shrinks, and the total stays constant.',
                 es: 'El batido se lee mucho mejor en las trazas que en las masas. Dos envolventes en antifase: cuando una crece la otra decrece, y el total se mantiene constante.' } },
  ],
  kepler: [
    { from: 'const acel = () => {', to: '// segundo medio impulso',
      title: { en: 'Only Newton is coded', es: 'Solo esta programado Newton' },
      explain: { en: 'Inverse-square attraction toward the star with a half-pixel Plummer softening, integrated with leapfrog at 64 sub-steps per frame. Kepler\'s three laws are never written anywhere: the ellipses, the varying speed and the period ratios emerge from these lines. Leapfrog conserves angular momentum exactly and the orbits close; the earlier scheme added 6 px to the distance and made them precess 60° per revolution.',
                 es: 'Atracción del inverso del cuadrado hacia la estrella con un suavizado de Plummer de medio píxel, integrada con leapfrog a 64 subpasos por frame. Las tres leyes de Kepler no están escritas en ninguna parte: las elipses, la velocidad variable y las razones de período salen de estas líneas. Leapfrog conserva exactamente el momento angular y las órbitas se cierran; el esquema anterior sumaba 6 px a la distancia y las hacía precesar 60° por vuelta.' } },
    { from: 'if (M.in && P.perturb) {', to: 'ay += (uy / ur) * (P.perturb / (ur * ur));',
      title: { en: 'Your cursor is a second mass', es: 'Tu cursor es una segunda masa' },
      explain: { en: 'It contributes its own inverse square term. Two masses is solvable in closed form; adding this third one is not, which is why the orbits go unpredictable so easily.',
                 es: 'Aporta su propio termino inverso al cuadrado. Dos masas se resuelve en forma cerrada; agregar esta tercera no, y por eso las orbitas se vuelven impredecibles tan facil.' } },
    { from: 'for (let k = b.p.length - 1; k > b.p.length - 60 && k > 11; k -= 12) {', to: 'ctx.closePath(); ctx.fill();',
      title: { en: 'Draw the swept areas', es: 'Dibujar las areas barridas' },
      explain: { en: 'The wedges are taken every twelve stored frames, so they cover equal times by construction. They look wildly different in shape and are the same area: that is the second law, measured rather than asserted.',
                 es: 'Las cunas se toman cada doce frames guardados, asi que cubren tiempos iguales por construccion. Se ven muy distintas de forma y tienen la misma area: esa es la segunda ley, medida en vez de afirmada.' } },
  ],
  neural: [
    { from: 'const acts = [[ix, iy]];', to: 'acts.push(out);',
      title: { en: 'The forward pass', es: 'El paso hacia adelante' },
      explain: { en: 'Every layer is stored, not just the final answer, because the whole point is drawing what happened in between. Multiply by weights, sum, squash with tanh, hand it to the next layer.',
                 es: 'Se guarda cada capa, no solo la respuesta final, porque el punto entero es dibujar lo que paso en el medio. Multiplicar por pesos, sumar, aplastar con tanh, y pasarselo a la capa siguiente.' } },
    { from: 'const front = (t * P.speed * 0.6) % (D + 2);', to: 'const reach = l => Math.max(0, Math.min(1, front - l));',
      title: { en: 'The sweeping front', es: 'El frente que barre' },
      explain: { en: 'A single number that walks across the layers and gates how much each one is drawn. Without it every layer would light at once and you would lose the sense of a signal travelling.',
                 es: 'Un solo numero que camina por las capas y controla cuanto se dibuja cada una. Sin el todas las capas se encenderian a la vez y se perderia la sensacion de una senal viajando.' } },
    { from: 'const flow = Math.abs(wgt * from[k]) * g;', to: 'ctx.stroke();',
      title: { en: 'Draw the traffic, not the wiring', es: 'Dibujar el trafico, no el cableado' },
      explain: { en: 'A connection is bright when the weight is large and the source neuron is active. Drawing every edge equally would be a grey mess; weighting by actual flow is what makes some paths visibly dominate.',
                 es: 'Una conexion brilla cuando el peso es grande y la neurona fuente esta activa. Dibujar todas las aristas iguales seria un enredo gris; ponderar por el flujo real es lo que hace que algunos caminos dominen a la vista.' } },
  ],



  mandelbrot: [
    { from: 'while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + y0; x = x2 - y2 + x0; x2 = x * x; y2 = y * y; n++; }', to: 'while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + y0; x = x2 - y2 + x0; x2 = x * x; y2 = y * y; n++; }',
      title: { en: 'The whole fractal, one line', es: 'El fractal entero, una linea' },
      explain: { en: 'Complex multiplication written out in real arithmetic, which avoids allocating objects per pixel. x2 and y2 are carried between iterations so each step costs three multiplications instead of five.',
                 es: 'Multiplicacion compleja escrita en aritmetica real, que evita crear objetos por pixel. x2 e y2 se arrastran entre iteraciones para que cada paso cueste tres multiplicaciones en vez de cinco.' } },
    { from: 'const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;', to: 'px[o+3] = 255;',
      title: { en: 'Smooth the escape count', es: 'Suavizar el conteo de escape' },
      explain: { en: 'The raw iteration count is an integer, so colouring by it produces hard concentric bands. Subtracting the log of the log of the final magnitude turns it continuous, and the gradients come out clean.',
                 es: 'El conteo crudo de iteraciones es entero, asi que colorear por el produce bandas concentricas duras. Restar el logaritmo del logaritmo de la magnitud final lo vuelve continuo, y los degradados salen limpios.' } },
    { from: 'const k = [RES, IT, P.zoom.toFixed(3), cx.toFixed(12), cy.toFixed(12), acc].join(\'|\');', to: 'if (k !== key) {',
      title: { en: 'Cache by view', es: 'Cachear por vista' },
      explain: { en: 'The frame is only recomputed when something that affects it changed: resolution, iterations, zoom, centre or theme colour. Sitting still costs one drawImage. Without this the fractal would burn a core continuously.',
                 es: 'El frame solo se recalcula cuando cambio algo que lo afecta: resolucion, iteraciones, zoom, centro o color del tema. Quedarse quieto cuesta un drawImage. Sin esto el fractal quemaria un nucleo de forma continua.' } },
  ],
  julia: [
    { from: 'const th = M.in ?', to: 'const ji = (0.5 * Math.sin(th) - 0.25 * Math.sin(2 * th)) * k1;',
      title: { en: 'The cursor is the constant', es: 'El cursor es la constante' },
      explain: { en: 'Cursor position maps straight onto the complex number c. That is why the shape reorganises continuously as you move instead of just panning: you are not moving the camera, you are changing which fractal exists.',
                 es: 'La posicion del cursor mapea directo al numero complejo c. Por eso la forma se reorganiza continuamente al moverte en vez de solo desplazarse: no estas moviendo la camara, estas cambiando cual fractal existe.' } },
    { from: 'let x = x0, y = y0, n = 0, x2 = x * x, y2 = y * y;', to: 'while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + ji; x = x2 - y2 + jr; x2 = x * x; y2 = y * y; n++; }',
      title: { en: 'Same loop, swapped roles', es: 'Mismo bucle, roles cambiados' },
      explain: { en: 'In Mandelbrot the orbit starts at zero and c is the pixel. Here the orbit starts at the pixel and c is fixed. Two lines apart, and they generate entirely different families of shape.',
                 es: 'En Mandelbrot la orbita arranca en cero y c es el pixel. Aca la orbita arranca en el pixel y c es fijo. Dos lineas de diferencia, y generan familias de formas completamente distintas.' } },
  ],
  wormhole: [
    { from: 'const rOf = l => S * Math.sqrt(1 + l * l);', to: 'const zOf = l => S * Math.asinh(l);',
      title: { en: 'The metric, in two lines', es: 'La metrica, en dos lineas' },
      explain: { en: 'These are not shape parameters chosen to look right. They come from integrating the Morris-Thorne shape function, and every vertex on screen is placed by them. Change b0 and the whole surface reshapes correctly because the geometry is doing the work.',
                 es: 'Estos no son parametros de forma elegidos para que se vea bien. Salen de integrar la funcion de forma de Morris-Thorne, y cada vertice en pantalla lo ubican ellos. Cambia b0 y la superficie entera se reforma correctamente porque la geometria es la que trabaja.' } },
    { from: 'const proj = (l, a) => {', to: '};',
      title: { en: 'Azimuth, then camera tilt', es: 'Azimut, y despues inclinacion de camara' },
      explain: { en: 'A point on the surface is turned into three dimensions, rotated about the vertical axis, and only then flattened. The cursor drives both angles: horizontal spins it, vertical moves the camera from edge-on to looking down the tunnel.',
                 es: 'Un punto de la superficie se lleva a tres dimensiones, se rota sobre el eje vertical, y recien despues se aplana. El cursor maneja los dos angulos: horizontal lo gira, vertical mueve la camara de canto a mirar por el tunel.' } },
    { from: 'ls.sort((A, B) => zOf(B) - zOf(A));', to: 'ctx.stroke();',
      title: { en: 'Sort by depth or it looks flat', es: 'Ordenar por profundidad o se ve plano' },
      explain: { en: 'Rings are drawn from the top down so the far wall of the tunnel is laid before the near one. Without this the wireframe reads as a flat pattern instead of a surface with an inside.',
                 es: 'Los anillos se dibujan de arriba hacia abajo para que la pared lejana del tunel quede antes que la cercana. Sin esto la malla se lee como un patron plano en vez de una superficie con un adentro.' } },
    { from: 'tr.l += tr.dir * 0.016;', to: 'if (tr.l < -LMAX) { tr.l = -LMAX; tr.dir = 1; tr.p.length = 0; }',
      title: { en: 'Crossing is unremarkable', es: 'Cruzar no tiene nada de especial' },
      explain: { en: 'The traveller advances at a constant rate in l, which is proper distance. Note there is no special case at l = 0: the throat is just another value of the coordinate, and that is exactly the point of a traversable wormhole.',
                 es: 'El viajero avanza a ritmo constante en l, que es distancia propia. Fijate que no hay ningun caso especial en l = 0: la garganta es solo otro valor de la coordenada, y eso es exactamente el punto de un agujero de gusano transitable.' } },
  ],
  hawking: [
    { from: 'const T = 60 / M;', to: 'if (M < 6) { flash = 1; M = P.mass; pairs = []; }',
      title: { en: 'Evaporation accelerates itself', es: 'La evaporacion se acelera sola' },
      explain: { en: 'Temperature goes as one over mass and luminosity as one over mass squared, so dM/dt is proportional to minus one over M squared. Losing mass makes it hotter, which makes it lose mass faster. Nothing damps it.',
                 es: 'La temperatura va como uno sobre la masa y la luminosidad como uno sobre la masa al cuadrado, asi que dM/dt es proporcional a menos uno sobre M al cuadrado. Perder masa la calienta, y eso la hace perder masa mas rapido. Nada lo amortigua.' } },
    { from: 'pairs = pairs.filter(p => {', to: 'return fade > 0.02;',
      title: { en: 'One out, one in', es: 'Uno afuera, uno adentro' },
      explain: { en: 'Both members of the pair are drawn from the same spawn point on the horizon. The escaping one carries positive energy away; the infalling one carries negative energy in, and that is the accounting that makes the hole shrink.',
                 es: 'Los dos miembros del par se dibujan desde el mismo punto de nacimiento en el horizonte. El que escapa se lleva energia positiva; el que cae mete energia negativa, y esa es la contabilidad que hace encoger al agujero.' } },
  ],
  quasar: [
    { from: 'd.a += (2.2 / Math.pow(d.r, 1.5)) * 60;', to: 'd.a += (2.2 / Math.pow(d.r, 1.5)) * 60;',
      title: { en: 'Keplerian shear', es: 'Cizalla kepleriana' },
      explain: { en: 'Angular speed falls as r to the minus three halves, so the inner disk laps the outer one. That differential rotation is the friction that heats the gas, and it is one line.',
                 es: 'La velocidad angular cae como r a la menos tres medios, asi que el disco interior le saca vueltas al exterior. Esa rotacion diferencial es la friccion que calienta el gas, y es una linea.' } },
    { from: 'const beta = P.beam * Math.min(1, (Math.min(w, h) * 0.12) / d.r);', to: 'ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${b.toFixed(3)})`;',
      title: { en: 'Doppler beaming, per particle', es: 'Beaming Doppler, por particula' },
      explain: { en: 'Each particle computes its own Doppler factor from its instantaneous motion relative to the viewer, then brightness goes as that cubed. The bright side is not painted in: it emerges from every particle answering the same formula.',
                 es: 'Cada particula calcula su propio factor Doppler desde su movimiento instantaneo relativo al observador, y el brillo va como ese factor al cubo. El lado brillante no se pinta: emerge de que cada particula responde la misma formula.' } },
  ],
  entanglement: [
    { from: 'const measure = (a, b) => {', to: '};',
      title: { en: 'An honest measurement', es: 'Una medicion honesta' },
      explain: { en: 'One side gets a fair coin flip and the other agrees with probability (1 + E)/2. Note that no information passes between them in the code: each outcome is generated where it is measured, and only the correlation is quantum.',
                 es: 'Un lado recibe una moneda justa y el otro coincide con probabilidad (1 + E)/2. Fijate que en el codigo no pasa informacion entre ellos: cada resultado se genera donde se mide, y solo la correlacion es cuantica.' } },
    { from: 'const E = tally.map(x => (x.n ? x.s / x.n : 0));', to: 'const S = Math.abs(E[0] - E[1] + E[2] + E[3]);',
      title: { en: 'The CHSH sum', es: 'La suma CHSH' },
      explain: { en: 'Four angle settings run in parallel and their measured correlations are combined. Any theory where the answers existed before measurement caps this at 2. The settings are the ones that maximise the quantum value, so the simulation climbs past the classical ceiling and settles near 2.828.',
                 es: 'Cuatro ajustes de angulo corren en paralelo y sus correlaciones medidas se combinan. Cualquier teoria donde las respuestas existieran antes de medir topa esto en 2. Los ajustes son los que maximizan el valor cuantico, asi que la simulacion supera el techo clasico y se asienta cerca de 2,828.' } },
  ],
  shortcut: [
    { from: 'let l = l0, phi = 0, dir = -1;', to: 'if (l > LINF || l < -LINF) break;',
      title: { en: 'Integrate in phi, not in l', es: 'Integrar en phi, no en l' },
      explain: { en: 'Written in terms of l the integrand blows up at the turning point where the square root vanishes. Stepping in phi instead makes dl/dphi go smoothly to zero there, so plain Euler with a fine step is stable and no special case is needed.',
                 es: 'Escrito en terminos de l el integrando explota en el punto de retorno, donde la raiz se anula. Avanzar en phi hace que dl/dphi vaya suavemente a cero ahi, asi que Euler con paso fino es estable y no hace falta ningun caso especial.' } },
    { from: 'side[i] = l < 0 ? 1 : 0;', to: 't[i] = phi;',
      title: { en: 'Which sky the ray came from', es: 'De que cielo vino el rayo' },
      explain: { en: 'After integration the sign of l says which side the ray escaped to, and the accumulated phi is the direction it came from out there. Two numbers per ray, and that is the whole lookup table.',
                 es: 'Tras integrar, el signo de l dice a que lado escapo el rayo, y el phi acumulado es la direccion de donde venia alla afuera. Dos numeros por rayo, y esa es toda la tabla.' } },
    { from: 'const psi = Math.atan(rad * tanH);', to: 'sky(lut.side[idx], lut.t[idx], az, rgb, px, o);',
      title: { en: 'Every pixel is one table read', es: 'Cada pixel es una lectura de tabla' },
      explain: { en: 'The camera is on the axis, so deflection depends only on the angle from it and the problem collapses to one dimension. Without that symmetry this would need tens of thousands of integrations per frame instead of 512 once.',
                 es: 'La camara esta sobre el eje, asi que la desviacion depende solo del angulo respecto a el y el problema colapsa a una dimension. Sin esa simetria esto necesitaria decenas de miles de integraciones por frame en vez de 512 una sola vez.' } },
  ],

  handle: [
    { from: 'const warp = (x, y) => {', to: '};',
      title: { en: 'One field, two uses', es: 'Un campo, dos usos' },
      explain: { en: 'This displacement is applied to the grid vertices, and the same inverse square law drives the rays a few lines below. If the grid bends one way and the paths another, the picture is lying; here they cannot disagree because they come from the same expression.',
                 es: 'Este desplazamiento se aplica a los vertices de la rejilla, y la misma ley inversa al cuadrado mueve los rayos unas lineas mas abajo. Si la rejilla se dobla de una forma y las trayectorias de otra, el dibujo miente; aca no pueden discrepar porque salen de la misma expresion.' } },
    { from: 'if (Math.hypot(r.p[0] - m[0], r.p[1] - m[1]) < R) {', to: 'break;',
      title: { en: 'The identification, in five lines', es: 'La identificacion, en cinco lineas' },
      explain: { en: 'Reaching one mouth boundary means being at the other, since they are the same circle. Direction is preserved, so the ray keeps going the way it was going. Nothing is teleported and nothing travels: the two positions were never two places.',
                 es: 'Llegar al borde de una boca es estar en el de la otra, porque son el mismo circulo. La direccion se conserva, asi que el rayo sigue como iba. Nada se teletransporta y nada viaja: las dos posiciones nunca fueron dos lugares.' } },
    { from: 'r.tr.push(null);', to: 'r.hops++; flash = 1;',
      title: { en: 'Cut the trail on purpose', es: 'Cortar la estela a proposito' },
      explain: { en: 'A null entry breaks the line where the crossing happened. The path is continuous in the space and discontinuous on the screen, and pretending otherwise by drawing a segment between the mouths would be drawing a distance that does not exist.',
                 es: 'Un valor nulo corta la linea donde ocurrio el cruce. El camino es continuo en el espacio y discontinuo en la pantalla, y fingir lo contrario dibujando un segmento entre las bocas seria dibujar una distancia que no existe.' } },
  ],
  curvature: [
    { from: 'const warp = p => {', to: '};',
      title: { en: 'Distances, not positions', es: 'Distancias, no posiciones' },
      explain: { en: 'Each vertex moves toward the mass by an amount falling as one over distance squared. The clamp against r times 0.75 is what keeps the lattice from folding through itself at the centre, where this approximation stops being the physics anyway.',
                 es: 'Cada vertice se mueve hacia la masa una cantidad que cae como uno sobre la distancia al cuadrado. El tope contra r por 0,75 es lo que evita que la reticula se pliegue sobre si misma en el centro, donde esta aproximacion deja de ser la fisica de todos modos.' } },
    { from: 'const proj = q => {', to: '};',
      title: { en: 'Yaw, tilt, perspective', es: 'Giro, inclinacion, perspectiva' },
      explain: { en: 'Three dimensions flattened in one expression: rotate about the vertical axis, tip the camera, then divide by depth. The perspective divide is what makes the far face of the cube read as further away rather than just smaller.',
                 es: 'Tres dimensiones aplanadas en una expresion: rotar sobre el eje vertical, inclinar la camara, y dividir por la profundidad. Esa division en perspectiva es lo que hace que la cara lejana del cubo se lea como mas lejos y no solo como mas chica.' } },
    { from: 'for (let k = 0; k <= N * SUB; k++) {', to: 'near = Math.max(near, 1 / (1 + q[3] * q[3] * 2.2));',
      title: { en: 'Subdivide or you see nothing', es: 'Subdividir o no se ve nada' },
      explain: { en: 'Each lattice edge is sampled at eight points instead of two. Drawing only the endpoints would give straight segments between warped corners and the curvature would vanish entirely, which is the single mistake that ruins this diagram.',
                 es: 'Cada arista de la reticula se muestrea en ocho puntos en vez de dos. Dibujar solo los extremos daria segmentos rectos entre esquinas desplazadas y la curvatura desapareceria por completo, que es el unico error que arruina este diagrama.' } },
    { from: 'lines.sort((a, b) => b.depth - a.depth);', to: 'lines.sort((a, b) => b.depth - a.depth);',
      title: { en: 'Back to front', es: 'De atras hacia adelante' },
      explain: { en: 'Without sorting, near and far lines interleave arbitrarily and the cube collapses into a flat tangle. This single line is the difference between a volume and a mess.',
                 es: 'Sin ordenar, las lineas cercanas y lejanas se entremezclan al azar y el cubo colapsa en una marana plana. Esta unica linea es la diferencia entre un volumen y un enredo.' } },
  ],
  doubleslit: [
    { from: 'const on = P.watch > 0.5;', to: 'const V = Math.sqrt(Math.max(0, 1 - D * D));',
      title: { en: 'The observer, in three lines', es: 'El observador, en tres lineas' },
      explain: { en: 'A switch decides whether path information exists, its reliability decides how much, and the complementarity relation turns that into fringe visibility. Nothing here is a fade parameter tuned by eye: V is what the inequality forces.',
                 es: 'Un interruptor decide si existe informacion de camino, su fiabilidad decide cuanta, y la relacion de complementariedad convierte eso en visibilidad de franjas. Nada aca es un parametro de desvanecido ajustado a ojo: V es lo que fuerza la desigualdad.' } },
    { from: 'const inten = (x, y) => {', to: '};',
      title: { en: 'Where the fringes live', es: 'Donde viven las franjas' },
      explain: { en: 'Two intensities added, plus a cross term scaled by V. That third piece is the entire interference. With the observer on and a perfect detector, V is zero and the expression collapses to the sum of two independent sources, which is exactly what a classical particle picture predicts.',
                 es: 'Dos intensidades sumadas, mas un termino cruzado escalado por V. Esa tercera pieza es toda la interferencia. Con el observador encendido y un detector perfecto, V es cero y la expresion colapsa a la suma de dos fuentes independientes, que es exactamente lo que predice una imagen clasica de particulas.' } },
    { from: 'if (on) {', to: 'seen[which]++; glow[which] = 1;',
      title: { en: 'The record is the cost', es: 'El registro es el costo' },
      explain: { en: 'When the observer is on, each detection also writes down which slit it came through, and the counters beside the barrier are that record. An unreliable detector sometimes writes the wrong slit, which is why partial reliability buys back part of the pattern.',
                 es: 'Con el observador encendido, cada deteccion ademas anota por cual rendija vino, y los contadores junto a la barrera son ese registro. Un detector poco fiable a veces anota la rendija equivocada, y por eso la fiabilidad parcial recupera parte del patron.' } },
    { from: 'for (let q = 0; q < 3; q++) {', to: 'if (hits.length > 260) hits.splice(0, hits.length - 260);',
      title: { en: 'One detection at a time', es: 'Una deteccion a la vez' },
      explain: { en: 'Each arrival is drawn from the intensity by rejection sampling, individually. Nobody paints the fringes: they accumulate out of single events, which is the part of this experiment that actually unsettles people.',
                 es: 'Cada llegada se sortea de la intensidad por rechazo, de a una. Nadie pinta las franjas: se acumulan a partir de eventos individuales, que es la parte de este experimento que de verdad incomoda.' } },
  ],

  duality: [
    { from: 'if (!s.decided && s.u > 0.55) { s.decided = true; s.bs2 = hasBS2; }', to: 'if (!s.decided && s.u > 0.55) { s.decided = true; s.bs2 = hasBS2; }',
      title: { en: 'The delayed choice', es: 'La eleccion diferida' },
      explain: { en: 'The configuration is captured when the photon is already past the first splitter and well inside the apparatus. Nothing about the earlier part of its flight is revisited, which is what makes the comparison against the early-choice tally meaningful.',
                 es: 'La configuracion se captura cuando el foton ya paso el primer divisor y esta bien adentro del aparato. Nada de la parte anterior de su vuelo se revisa, y eso es lo que hace significativa la comparacion contra el contador de eleccion temprana.' } },
    { from: 'const arms = (s.decided && !s.bs2) ? [s.arm] : [0, 1];', to: 'arms.length === 1 ? dot(p, 0.95, 3) : dot(p, 0.45, 2.4);',
      title: { en: 'What gets drawn is the honest part', es: 'Lo que se dibuja es la parte honesta' },
      explain: { en: 'With the plate in there is no which-path information, so both amplitudes are drawn, faintly. With it out the detector will name an arm, so a single solid dot is drawn. The picture changes because what can be known changed, not because the photon did something different.',
                 es: 'Con la placa puesta no hay informacion de camino, asi que se dibujan las dos amplitudes, tenues. Sin ella el detector va a nombrar un brazo, asi que se dibuja un solo punto solido. La imagen cambia porque cambio lo que se puede saber, no porque el foton hiciera algo distinto.' } },
    { from: 'const pd0 = s.bs2 ? Math.cos(phi / 2) ** 2 : 0.5;', to: 'else { early++; if (!s.hit) earlyD0++; }',
      title: { en: 'Two tallies, one claim', es: 'Dos contadores, una afirmacion' },
      explain: { en: 'Early and late choices accumulate separately so you can compare them instead of taking my word for it. If deciding late changed anything, these two columns would drift apart. They do not.',
                 es: 'Las elecciones tempranas y tardias se acumulan por separado para que puedas compararlas en vez de creerme. Si decidir tarde cambiara algo, estas dos columnas se separarian. No lo hacen.' } },
  ],
  entropy: [
    { from: 'if (P0.rev !== lastRev) { lastRev = P0.rev; for (const p of P) { p.vx = -p.vx; p.vy = -p.vy; } }', to: 'if (P0.rev !== lastRev) { lastRev = P0.rev; for (const p of P) { p.vx = -p.vx; p.vy = -p.vy; } }',
      title: { en: 'Reversing time is one minus sign', es: 'Invertir el tiempo es un signo menos' },
      explain: { en: 'That is the whole of Loschmidt objection, in code. Negating every velocity is a perfectly legal state of the same physics, and it runs the film backwards with entropy falling. No law is broken, which is exactly the uncomfortable part.',
                 es: 'Esa es toda la objecion de Loschmidt, en codigo. Negar cada velocidad es un estado perfectamente legal de la misma fisica, y corre la pelicula hacia atras con la entropia bajando. No se rompe ninguna ley, que es justo la parte incomoda.' } },
    { from: 'const cnt = new Float64Array(C * C);', to: 'S /= Math.log(C * C);',
      title: { en: 'Entropy of the description', es: 'Entropia de la descripcion' },
      explain: { en: 'Only cell occupancies enter the sum. The exact positions are never used, and that is deliberate: entropy measures how much you are not tracking. Coarsen the grid and it drops, refine it and it rises, on the very same particles.',
                 es: 'Solo entran las ocupaciones de celda en la suma. Las posiciones exactas nunca se usan, y eso es deliberado: la entropia mide cuanto no estas siguiendo. Engruesa la rejilla y baja, afinala y sube, sobre las mismisimas particulas.' } },
    { from: 'if (M.in && M.y < boxH) {', to: '}',
      title: { en: 'Lowering it costs work', es: 'Bajarla cuesta trabajo' },
      explain: { en: 'The cursor pushes particles away, so you can herd them into a corner and drive the entropy down by hand. It takes continuous effort and it undoes itself the moment you stop, which is the honest version of what a refrigerator does.',
                 es: 'El cursor empuja las particulas, asi que puedes arrearlas a una esquina y bajar la entropia a mano. Cuesta esfuerzo continuo y se deshace apenas paras, que es la version honesta de lo que hace un refrigerador.' } },
  ],
  ising: [
    { from: 'const TC = 2 / Math.log(1 + Math.SQRT2);',
      to: 'const init = n => { N = n; sp = new Int8Array(N * N).fill(1); hist = []; };',
      title: { en: 'The grid, and why it starts ordered', es: 'La rejilla, y por qué arranca ordenada' },
      explain: { en: 'Int8Array because a spin is +1 or −1 and nothing else. The fill(1) is the part I got wrong first: starting from random noise looks more natural but at low temperature it freezes into domains that never merge, and the magnetisation reads near zero when it should read near one. Measured both before choosing.',
                 es: 'Int8Array porque un espín es +1 o −1 y nada más. El fill(1) es la parte que tuve mal primero: arrancar de ruido al azar se ve más natural pero a baja temperatura congela dominios que nunca se fusionan, y la magnetización marca cerca de cero cuando debería marcar cerca de uno. Medí las dos antes de elegir.' } },
    { from: 'const flips = (P.sw | 0) * N * N / 6;',
      to: 'if (dE <= 0 || Math.random() < Math.exp(-dE / T)) sp[k] = -s;',
      title: { en: 'Metropolis, the whole physics', es: 'Metropolis, la física entera' },
      explain: { en: 'Pick a spin at random, add up its four neighbours with wraparound, and the energy change of flipping it is 2s(nb+B). Downhill always accepted; uphill accepted with e^(−ΔE/T). That single exponential is where the phase transition comes from — there is no other physics in this file.',
                 es: 'Elige un espín al azar, suma sus cuatro vecinos con bordes que dan la vuelta, y el cambio de energía al voltearlo es 2s(nb+B). Cuesta abajo siempre se acepta; cuesta arriba se acepta con e^(−ΔE/T). Esa única exponencial es de donde sale la transición de fase: no hay otra física en este archivo.' } },
    { from: 'let m = 0;',
      to: 'if (hist.length > 240) hist.shift();',
      title: { en: 'Magnetisation', es: 'Magnetización' },
      explain: { en: 'The order parameter: the average spin. Near 1 means the sheet agrees, near 0 means it does not. Keeping the absolute value matters because which side wins is arbitrary, and the history buffer is what draws the trace that falls off a cliff at T_c.',
                 es: 'El parámetro de orden: el espín promedio. Cerca de 1 significa que la lámina está de acuerdo, cerca de 0 que no. Guardar el valor absoluto importa porque qué lado gana es arbitrario, y el búfer de historia es lo que dibuja la traza que se cae por un acantilado en T_c.' } }
  ],

  grayscott: [
    { from: 'const seed = () => {',
      to: 'U[k] = 0.5; V[k] = 0.25;',
      title: { en: 'Seed the disturbance', es: 'Sembrar la perturbación' },
      explain: { en: 'U starts at 1 everywhere and V at 0, which is a perfectly stable state: leave it alone and nothing happens, forever. The patterns need a defect to grow from, so a handful of square patches get knocked to a different mix. The pattern is a response to damage.',
                 es: 'U arranca en 1 en todos lados y V en 0, que es un estado perfectamente estable: déjalo solo y no pasa nada, nunca. Los patrones necesitan un defecto del que crecer, así que un puñado de parches cuadrados se golpean a otra mezcla. El patrón es una respuesta al daño.' } },
    { from: 'const Du = 0.16, Dv = 0.08',
      to: 'V2[i] = V[i] + Dv * lv + uvv - (F + kk) * V[i];',
      title: { en: 'One Euler step of both equations', es: 'Un paso de Euler de ambas ecuaciones' },
      explain: { en: 'The five-point Laplacian is the four neighbours minus four times the centre — the discrete version of ∇². Then the two equations, written literally. Du is twice Dv, and that ratio is the entire condition for patterns to be possible: the inhibitor has to outrun the activator.',
                 es: 'El laplaciano de cinco puntos son los cuatro vecinos menos cuatro veces el centro: la versión discreta de ∇². Después las dos ecuaciones, escritas literalmente. Du es el doble de Dv, y esa razón es la condición entera para que los patrones sean posibles: el inhibidor tiene que correr más rápido que el activador.' } },
    { from: 'const tu = U; U = U2; U2 = tu;',
      to: 'const tv = V; V = V2; V2 = tv;',
      title: { en: 'Swap, do not copy', es: 'Intercambiar, no copiar' },
      explain: { en: 'The new state is written into a second pair of buffers so no cell ever reads a neighbour that has already been updated this step, which would silently turn the explicit scheme into something else. Then the references are swapped, which is free, instead of copying 22.500 floats twice per iteration.',
                 es: 'El estado nuevo se escribe en un segundo par de búferes para que ninguna celda lea a una vecina ya actualizada en este paso, lo que convertiría el esquema explícito en otra cosa sin avisar. Después se intercambian las referencias, que es gratis, en vez de copiar 22.500 flotantes dos veces por iteración.' } }
  ],

  boids: [
    { from: 'const R = 46, RS = 20;',
      to: 'if (d2 < RS * RS)',
      title: { en: 'Look only at the neighbours', es: 'Mirar solo a los vecinos' },
      explain: { en: 'Two radii: 46px to be considered a neighbour at all, 20px to be considered too close. Distances stay squared through the comparison so no square root is needed except in the one branch that actually normalises. Everything the model knows lives inside this loop.',
                 es: 'Dos radios: 46px para contar como vecino, 20px para contar como demasiado cerca. Las distancias se mantienen al cuadrado en la comparación, así no hace falta raíz salvo en la única rama que sí normaliza. Todo lo que el modelo sabe vive dentro de este bucle.' } },
    { from: 'if (n) {',
      to: 'b.vy += c2 * P.coh * 0.05',
      title: { en: 'The three rules', es: 'Las tres reglas' },
      explain: { en: 'Cohesion is the neighbours\' average position minus mine, alignment is their average velocity minus mine, separation is the accumulated push. Each gets normalised before being weighted, so the sliders control the balance between the rules rather than the overall speed — otherwise turning one up would just make the flock faster.',
                 es: 'Cohesión es la posición promedio de los vecinos menos la mía, alineación es su velocidad promedio menos la mía, separación es el empuje acumulado. Cada una se normaliza antes de pesarse, así los deslizadores controlan el equilibrio entre reglas y no la rapidez general: si no, subir una solo haría más rápida a la bandada.' } },
    { from: 'const sp = Math.hypot(b.vx, b.vy) || 1;',
      to: 'b.x = (b.x + b.vx + w) % w;',
      title: { en: 'Constant speed, wrapped world', es: 'Rapidez constante, mundo que da la vuelta' },
      explain: { en: 'Velocity is renormalised to a fixed speed every frame, so the rules only ever change direction. Without that the accelerations accumulate and the flock leaves the screen. The modulo makes the canvas a torus: fly off the right and come back on the left, with no walls to distort the flocking.',
                 es: 'La velocidad se renormaliza a una rapidez fija cada frame, así las reglas solo cambian dirección. Sin eso las aceleraciones se acumulan y la bandada se va de la pantalla. El módulo convierte el canvas en un toro: sales por la derecha y vuelves por la izquierda, sin muros que distorsionen el comportamiento.' } }
  ],

  attention: [
    { from: "const TOK = ['the', 'cat'",
      to: '[1.4, 0.1, 0.9, 0.3]',
      title: { en: 'A sentence with hand-made meaning', es: 'Una frase con significado hecho a mano' },
      explain: { en: 'Ten tokens and a four-dimensional vector each, with axes that mean animal, furniture, action and reference. These are written by hand, not learned — being clear about that is the point. A real model has thousands of dimensions and no axis means anything nameable.',
                 es: 'Diez tokens y un vector de cuatro dimensiones cada uno, con ejes que significan animal, mueble, acción y referencia. Están escritos a mano, no aprendidos, y ser claro sobre eso es parte del asunto. Un modelo real tiene miles de dimensiones y ningún eje significa algo nombrable.' } },
    { from: 'const proj = v => W.map',
      to: 'return ex.map(v => v / sum);',
      title: { en: 'Queries, keys, softmax', es: 'Consultas, claves, softmax' },
      explain: { en: 'Project every token twice, once as a query and once as a key, then dot each query with every key. Dividing by √d keeps the numbers in the range where the exponential still has a gradient. Subtracting the row max before exponentiating changes nothing mathematically and stops e^x from overflowing — the standard stable softmax.',
                 es: 'Proyecta cada token dos veces, una como consulta y otra como clave, después multiplica cada consulta con cada clave. Dividir por √d mantiene los números en el rango donde la exponencial todavía tiene gradiente. Restar el máximo de la fila antes de exponenciar no cambia nada matemáticamente y evita que e^x se desborde: el softmax estable de siempre.' } },
    { from: 'if (focus >= 0) {',
      to: 'ctx.quadraticCurveTo(',
      title: { en: 'Draw who is listening to whom', es: 'Dibujar quién escucha a quién' },
      explain: { en: 'One row of the matrix is one word\'s distribution of attention, and it sums to one. Drawing it as arcs whose thickness is the weight makes the sentence readable in a way the grid alone is not: you can see "it" reaching back for "cat".',
                 es: 'Una fila de la matriz es la distribución de atención de una palabra, y suma uno. Dibujarla como arcos cuyo grosor es el peso hace la frase legible de una forma que la rejilla sola no logra: puedes ver a "it" estirándose hacia atrás para agarrar "cat".' } }
  ],

  optimizers: [
    { from: 'const f = (x, y, L) =>',
      to: 'x * x + y * y + 1.6 * (Math.sin(3 * x) + Math.sin(3 * y));',
      title: { en: 'Three landscapes, three failure modes', es: 'Tres paisajes, tres formas de fallar' },
      explain: { en: 'Rosenbrock is a narrow curved valley that punishes anything that oscillates. The saddle is flat along one axis, which starves plain descent of gradient. The bumpy bowl has local minima everywhere. Each one breaks a different optimiser, which is the whole reason for having three.',
                 es: 'Rosenbrock es un valle angosto y curvo que castiga a todo lo que oscile. La silla es plana a lo largo de un eje, lo que deja al descenso simple sin gradiente. El paisaje con baches tiene mínimos locales por todos lados. Cada uno rompe a un optimizador distinto, que es la razón de tener tres.' } },
    { from: 'const grad = (x, y, L) => {',
      to: '(f(x, y + e, L) - f(x, y - e, L)) / (2 * e)];',
      title: { en: 'Gradient without doing calculus', es: 'Gradiente sin hacer cálculo' },
      explain: { en: 'A central finite difference: evaluate slightly either side and divide by the gap. Error is O(e²) rather than the O(e) of a one-sided difference, which is why both sides are worth the extra evaluation. Adding a new landscape needs no derivation at all.',
                 es: 'Una diferencia finita centrada: evalúa un poco a cada lado y divide por la distancia. El error es O(e²) en vez del O(e) de una diferencia de un solo lado, y por eso vale la evaluación extra. Agregar un paisaje nuevo no necesita ninguna derivación.' } },
    { from: "if (r.n === 'SGD')",
      to: 'r.y -= lr * 8 * mhy / (Math.sqrt(shy) + e);',
      title: { en: 'The three update rules, side by side', es: 'Las tres reglas de actualización, lado a lado' },
      explain: { en: 'SGD is one line. Momentum adds a velocity that decays at 0.9, so about the last ten gradients still push. Adam keeps a mean and a mean-of-squares, bias-corrects both because they start at zero and would otherwise be biased toward it for the first steps, then divides one by the root of the other. That division is why Adam crosses a flat saddle in 11 steps where SGD needs 315.',
                 es: 'SGD es una línea. Momentum agrega una velocidad que decae a 0.9, así que los últimos diez gradientes más o menos siguen empujando. Adam lleva una media y una media de cuadrados, corrige el sesgo de ambas porque parten en cero y si no quedarían sesgadas hacia el cero los primeros pasos, y después divide una por la raíz de la otra. Esa división es por qué Adam cruza una silla plana en 11 pasos donde SGD necesita 315.' } }
  ],

  embedding: [
    { from: 'const centres = Array.from({ length: clus }',
      to: 'lo.push([w / 2 + (Math.random() - 0.5) * 40',
      title: { en: 'Build the points in real high dimensions', es: 'Construir los puntos en muchas dimensiones de verdad' },
      explain: { en: 'The clusters genuinely live in as many dimensions as the slider says — this is not a 2D picture pretending. The screen positions start as a small random blob in the middle, so whatever structure appears was found, not planted.',
                 es: 'Los grupos viven de verdad en tantas dimensiones como diga el deslizador: no es una imagen 2D disfrazada. Las posiciones en pantalla arrancan como un grumo pequeño al azar en el medio, así que cualquier estructura que aparezca fue encontrada, no plantada.' } },
    { from: 'target = new Float32Array(n * n);',
      to: 'for (let i = 0; i < n * n; i++) target[i] *= scale;',
      title: { en: 'The distance matrix is the only input', es: 'La matriz de distancias es la única entrada' },
      explain: { en: 'Every pairwise distance is computed once in the original space and scaled to fit the canvas. From here on the high-dimensional coordinates are never touched again: the layout has access to distances and nothing else, which is exactly the constraint that classical MDS operates under.',
                 es: 'Cada distancia por pares se calcula una vez en el espacio original y se escala para caber en el canvas. De acá en adelante las coordenadas de alta dimensión no se tocan nunca más: la disposición tiene acceso a distancias y a nada más, que es exactamente la restricción bajo la que opera el MDS clásico.' } },
    { from: 'for (let s = 0; s < 3; s++) {',
      to: 'lo[j][1] -= dy * push;',
      title: { en: 'Relax it like a spring network', es: 'Relajarlo como una red de resortes' },
      explain: { en: 'Take a random pair, compare their distance on screen against what it should be, and move both toward agreement. Random pairs instead of all pairs keeps the cost linear per iteration, and over many frames every pair gets its turn. The residual error printed at the bottom is what never goes away, because the plane cannot hold that much structure.',
                 es: 'Toma un par al azar, compara su distancia en pantalla contra la que debería ser, y mueve a los dos hacia el acuerdo. Pares al azar en vez de todos los pares mantiene el costo lineal por iteración, y a lo largo de muchos frames a cada par le toca. El error residual impreso abajo es lo que nunca se va, porque el plano no puede sostener tanta estructura.' } }
  ],

  radiation: [
    { from: 'const posAt = (tt, mode, beta, w, h) => {',
      to: 'return [w / 2 + x, h / 2];',
      title: { en: 'The trajectory as a pure function of time', es: 'La trayectoria como función pura del tiempo' },
      explain: { en: 'Writing the motion as position(t) rather than stepping it forward is what makes everything else easy: the past is computable rather than something you have to have lived through. Three modes — an oscillating dipole, a circle, and a hard bounce with abrupt reversals.',
                 es: 'Escribir el movimiento como posición(t) en vez de integrarlo hacia adelante es lo que hace fácil todo lo demás: el pasado es calculable en vez de algo que hay que haber vivido. Tres modos: un dipolo oscilante, un círculo, y un rebote duro con inversiones bruscas.' } },
    { from: 'if (hist.length < need)',
      to: 'hist.unshift(posAt(st, mode, P.beta, w, h));',
      title: { en: 'Prefill the past', es: 'Precargar el pasado' },
      explain: { en: 'The first version only recorded positions as they happened, which meant about 600 samples had to accumulate before a single line could be drawn — five seconds of blank canvas, and I only caught it by running the experiment headless and finding it drew nothing. Since the motion is analytic, the history is just evaluated backwards at startup. The fixed timestep is chosen so the array index equals distance divided by c, making the retarded lookup a single array access.',
                 es: 'La primera versión solo grababa posiciones a medida que ocurrían, lo que significaba que había que acumular unas 600 muestras antes de poder dibujar una sola línea: cinco segundos de canvas en blanco, y lo pillé solo corriendo el experimento sin pantalla y viendo que no dibujaba nada. Como el movimiento es analítico, la historia simplemente se evalúa hacia atrás al arrancar. El paso de tiempo fijo está elegido para que el índice del arreglo sea la distancia dividida por c, lo que hace la consulta retardada un solo acceso a un arreglo.' } },
    { from: 'for (let r = 6; r < RMAX; r += dr) {',
      to: 'started ? ctx.lineTo(x, y)',
      title: { en: 'Draw one field line', es: 'Dibujar una línea de campo' },
      explain: { en: 'Walk outward along a fixed angle. At each radius, look up where the charge was when the news left, and offset from there. Nothing in this loop knows about acceleration or radiation — the kinks appear because the retarded position keeps moving. That is the entire Purcell argument, expressed as four lines of drawing code.',
                 es: 'Camina hacia afuera a lo largo de un ángulo fijo. En cada radio, consulta dónde estaba la carga cuando salió la noticia, y desplázate desde ahí. Nada en este bucle sabe de aceleración ni de radiación: los quiebres aparecen porque la posición retardada se sigue moviendo. Ese es el argumento entero de Purcell, expresado como cuatro líneas de código de dibujo.' } }
  ],

  refraction: [
    { from: 'const s2 = (n1 / n2) * Math.sin(th1);',
      to: 'const critical = n1 > n2 ? Math.asin(n2 / n1) : null;',
      title: { en: 'Snell, and where it runs out', es: 'Snell, y dónde se acaba' },
      explain: { en: 'Rearranging Snell gives sin θ₂ directly. When that comes out greater than 1 there is no angle that satisfies it, and the honest response in code is not to clamp it but to branch: total internal reflection is not an approximation, it is the equation having no solution.',
                 es: 'Reordenar Snell da sin θ₂ directamente. Cuando eso sale mayor que 1 no hay ángulo que lo satisfaga, y la respuesta honesta en código no es recortarlo sino bifurcar: la reflexión total interna no es una aproximación, es que la ecuación no tiene solución.' } },
    { from: 'const rs = tir ? 1 :',
      to: 'const R = (rs + rp) / 2, T = 1 - R;',
      title: { en: 'Fresnel, both polarisations', es: 'Fresnel, las dos polarizaciones' },
      explain: { en: 'Snell says where, Fresnel says how much. The two polarisations behave very differently — at Brewster\'s angle one of them reflects nothing at all — and unpolarised light is the average of the two. Checked against hand calculation at four angles including 4.0% at normal incidence, the number you know from window reflections.',
                 es: 'Snell dice adónde, Fresnel dice cuánta. Las dos polarizaciones se comportan muy distinto (en el ángulo de Brewster una de ellas no refleja nada) y la luz no polarizada es el promedio de las dos. Contrastado con cálculo a mano en cuatro ángulos, incluido el 4.0% a incidencia normal, el número que conoces de los reflejos en las ventanas.' } },
    { from: 'beam(ox - Math.sin(th1) * Lr',
      to: 'if (!tir) beam(ox, iy, ox + Math.sin(th2) * Lr',
      title: { en: 'Three rays, weighted by energy', es: 'Tres rayos, pesados por energía' },
      explain: { en: 'Incident, reflected, transmitted, with opacity and width driven by the actual coefficients rather than picked for looks. So as you approach the critical angle the reflected ray really does swell and the transmitted one really does die, and past it the third ray is not drawn at all because there is nothing there.',
                 es: 'Incidente, reflejado, transmitido, con opacidad y grosor manejados por los coeficientes reales en vez de elegidos para que se vea bien. Así que al acercarte al ángulo crítico el rayo reflejado de verdad engorda y el transmitido de verdad muere, y pasándolo el tercer rayo no se dibuja porque no hay nada ahí.' } }
  ],

  chladni: [
    { from: 'const u = (x, y, m, n) =>',
      to: 'Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);',
      title: { en: 'The mode shape', es: 'La forma del modo' },
      explain: { en: 'Two standing waves with their indices swapped, subtracted. The subtraction is not decoration: it is the antisymmetric combination of two modes that happen to have the same frequency, and it is what turns a boring grid of squares into the curved figures Chladni actually drew.',
                 es: 'Dos ondas estacionarias con sus índices intercambiados, restadas. La resta no es adorno: es la combinación antisimétrica de dos modos que resultan tener la misma frecuencia, y es lo que convierte una cuadrícula aburrida en las figuras curvas que Chladni dibujó de verdad.' } },
    { from: 'const e = 0.004;',
      to: 'p[1] = Math.max(0, Math.min(1, p[1]));',
      title: { en: 'How a grain finds a node', es: 'Cómo un grano encuentra un nodo' },
      explain: { en: 'Two terms. Downhill on |u|, by finite difference. And a random kick whose size is the local amplitude — that is the real mechanism: a vibrating patch of plate keeps throwing grains until one lands where it will not be thrown again. No grain knows where the nodal lines are; they are just the only places that stop shaking.',
                 es: 'Dos términos. Cuesta abajo en |u|, por diferencia finita. Y una patada al azar cuyo tamaño es la amplitud local: ese es el mecanismo real, un trozo de placa que vibra sigue lanzando granos hasta que uno cae donde ya no lo van a lanzar. Ningún grano sabe dónde están las líneas nodales; son simplemente los únicos lugares que dejan de sacudirse.' } },
    { from: 'const RES = 120, img = ctx.createImageData(RES, RES)',
      to: 'ctx.drawImage(off, px, py, S, S);',
      title: { en: 'The field underneath', es: 'El campo de abajo' },
      explain: { en: 'A low-resolution buffer of |u| drawn faintly under the grains, scaled up with smoothing. It is there so you can see what the sand is responding to, and it makes it obvious that the grains are settling exactly on the dark curves rather than approximately near them.',
                 es: 'Un búfer de baja resolución de |u| dibujado tenue bajo los granos, escalado con suavizado. Está para que veas a qué está respondiendo la arena, y deja obvio que los granos se asientan exactamente sobre las curvas oscuras y no aproximadamente cerca de ellas.' } }
  ],

  ulam: [
    { from: 'const sieve = n => {',
      to: 'return p;',
      title: { en: 'Sieve of Eratosthenes', es: 'Criba de Eratóstenes' },
      explain: { en: 'Two thousand three hundred years old and still the right answer at this scale. Mark every multiple of every prime; whatever survives is prime. The inner loop starts at i² because everything smaller was already crossed off by a smaller factor, and the outer loop stops at √n for the same reason.',
                 es: 'Dos mil trescientos años y sigue siendo la respuesta correcta a esta escala. Marca todo múltiplo de todo primo; lo que sobreviva es primo. El bucle interno arranca en i² porque todo lo menor ya fue tachado por un factor más chico, y el externo para en √n por la misma razón.' } },
    { from: 'let x = N >> 1, y = N >> 1',
      to: 'if (dy === 0) run++;',
      title: { en: 'Walking the spiral', es: 'Caminar la espiral' },
      explain: { en: 'The whole spiral is four lines: move, and when the current arm is done, rotate the direction ninety degrees. The arm length grows every second turn, which is why the condition is on dy hitting zero. Arms go 1, 1, 2, 2, 3, 3 — that pattern is the spiral.',
                 es: 'La espiral entera son cuatro líneas: avanza, y cuando el brazo actual se acaba, rota la dirección noventa grados. El largo del brazo crece cada dos giros, y por eso la condición es que dy llegue a cero. Los brazos van 1, 1, 2, 2, 3, 3: ese patrón es la espiral.' } },
    { from: 'const isP = !!pr[num]',
      to: 'd[o+3] = 255;',
      title: { en: 'One pixel per integer', es: 'Un píxel por entero' },
      explain: { en: 'Writing straight into an ImageData buffer instead of drawing rectangles: 40.000 numbers would be 40.000 fill calls otherwise. Euler\'s polynomial gets pure white so it separates from the accent colour, and the whole image is cached by parameters because nothing about it changes between frames.',
                 es: 'Escribir directo en un búfer de ImageData en vez de dibujar rectángulos: 40.000 números serían 40.000 llamadas de relleno si no. El polinomio de Euler queda en blanco puro para que se separe del color de acento, y la imagen entera se cachea por parámetros porque nada de ella cambia entre frames.' } }
  ],

  collatz: [
    { from: "const k = N + ':' + P.even",
      to: 'cache.width = w; cache.height = h;',
      title: { en: 'Cache by everything that matters', es: 'Cachear por todo lo que importa' },
      explain: { en: 'The key includes the count, both angles, the canvas size and the accent colour. If any of them changes the drawing is rebuilt; otherwise the cached canvas is blitted. Drawing two thousand paths every frame would be pointless when the picture is completely static.',
                 es: 'La llave incluye la cantidad, los dos ángulos, el tamaño del canvas y el color de acento. Si cualquiera cambia el dibujo se reconstruye; si no, se copia el canvas cacheado. Dibujar dos mil caminos por frame sería absurdo cuando la imagen es completamente estática.' } },
    { from: 'let v = s, guard = 0;',
      to: 'while (v !== 1 && guard++ < 1000)',
      title: { en: 'The sequence itself', es: 'La secuencia misma' },
      explain: { en: 'Two operations and a stopping condition. What gets stored is not the numbers but the parities, because that is all the drawing needs. The guard is there because the conjecture is unproven and I would rather have a bounded loop than an act of faith in the render path.',
                 es: 'Dos operaciones y una condición de parada. Lo que se guarda no son los números sino las paridades, porque es todo lo que necesita el dibujo. El guardia está porque la conjetura no está demostrada, y prefiero un bucle acotado antes que un acto de fe en el camino de renderizado.' } },
    { from: 'let x = w / 2, y = h * 0.94',
      to: 'c.lineTo(x, y);',
      title: { en: 'Draw it backwards', es: 'Dibujarlo al revés' },
      explain: { en: 'Every sequence ends at 1, so drawing from the end means every path starts at the same root. Paths that share a tail — and most of them do — overlap into the same strokes, which is why trunks emerge from pure transparency stacking rather than from any tree being built. Turn one way on an even step, the other way on an odd one.',
                 es: 'Toda secuencia termina en 1, así que dibujar desde el final significa que todo camino parte de la misma raíz. Los caminos que comparten cola (y la mayoría la comparte) se superponen en los mismos trazos, y por eso los troncos emergen de puro apilamiento de transparencia y no de que se construya ningún árbol. Gira hacia un lado en un paso par, hacia el otro en uno impar.' } }
  ],

  voronoi: [
    { from: 'const dist = (dx, dy) =>',
      to: 'Math.max(Math.abs(dx), Math.abs(dy));',
      title: { en: 'Three meanings of "near"', es: 'Tres significados de "cerca"' },
      explain: { en: 'The diagram is defined by a distance, and swapping the distance swaps the geometry. Euclidean skips the square root because only the ordering matters and squaring is monotonic. Manhattan is city blocks, Chebyshev is how a king moves. Same sites, entirely different world.',
                 es: 'El diagrama está definido por una distancia, y cambiar la distancia cambia la geometría. La euclídea se salta la raíz porque solo importa el orden y elevar al cuadrado es monótono. Manhattan son cuadras de ciudad, Chebyshev es cómo se mueve un rey. Mismos sitios, mundo completamente distinto.' } },
    { from: 'const RES = 150, RH =',
      to: 'own[j * RES + i] = bi;',
      title: { en: 'Brute force, deliberately', es: 'Fuerza bruta, a propósito' },
      explain: { en: 'Every grid cell asks every site who is closest. Fortune\'s sweep-line would do it exactly in O(n log n), but it needs a priority queue and careful handling of degenerate cases, and here the sites move every frame so the diagram would be rebuilt regardless. At this resolution the naive loop costs under a millisecond.',
                 es: 'Cada celda de la rejilla le pregunta a cada sitio quién está más cerca. El barrido de Fortune lo haría exacto en O(n log n), pero necesita cola de prioridad y manejo cuidadoso de casos degenerados, y acá los sitios se mueven cada frame así que el diagrama se reconstruiría igual. A esta resolución el bucle ingenuo cuesta menos de un milisegundo.' } },
    { from: 'const edge = (i + 1 < RES',
      to: 'd[o] = rgb[0] * a;',
      title: { en: 'Borders for free', es: 'Bordes gratis' },
      explain: { en: 'No geometry is computed to find the cell walls. A pixel is on a border if its owner differs from the neighbour to its right or below — one comparison. The bisector lines you see were never constructed; they are just where the answer changes, which is also exactly what a Voronoi edge is.',
                 es: 'No se calcula geometría para encontrar las paredes de las celdas. Un píxel está en un borde si su dueño difiere del vecino de la derecha o de abajo: una comparación. Las bisectrices que ves nunca se construyeron; son solo donde cambia la respuesta, que es también exactamente lo que es una arista de Voronoi.' } }
  ],
};
