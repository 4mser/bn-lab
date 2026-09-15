# Third-party notices

BN Lab Simulations is MIT-licensed. One component is adapted from third-party code under
a compatible license, and its notice is reproduced here as that license requires.

## WebGL-Fluid-Simulation — `src/experiments/fluid.js`

The GPU fluid solver (shader set, framebuffer ping-pong, half-float capability
checks and overall step structure) is adapted from
[WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
by Pavel Dobryakov.

```
MIT License

Copyright (c) 2017 Pavel Dobryakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Modifications in BN Lab Simulations: packaged as an experiment driven by the BN Lab Simulations
engine; WebGL2 half-float textures treated as filterable per the WebGL2
specification (keeps iOS devices supported); a display shader that renders the
same dye as additive light on dark themes and as a subtractive tint on light
themes; resource cleanup on `destroy()`.

The numerical method itself is from the literature: J. Stam, *Stable Fluids*
(SIGGRAPH 1999); R. Fedkiw, J. Stam, H. W. Jensen, *Visual Simulation of Smoke*
(SIGGRAPH 2001); M. J. Harris, *Fast Fluid Dynamics Simulation on the GPU*
(GPU Gems, ch. 38, 2004).
