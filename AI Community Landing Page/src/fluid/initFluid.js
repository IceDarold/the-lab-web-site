/*
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
*/

function hashCode(s) {
    if (s.length === 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function addKeywords(source, keywords) {
    if (keywords == null) return source;
    let keywordsString = '';
    keywords.forEach(keyword => {
        keywordsString += '#define ' + keyword + '\n';
    });
    return keywordsString + source;
}

function compileShader(glContext, type, source, keywords = null) {
    const shader = glContext.createShader(type);
    glContext.shaderSource(shader, addKeywords(source, keywords));
    glContext.compileShader(shader);

    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS))
        console.trace(glContext.getShaderInfoLog(shader));

    return shader;
}

function createProgram(glContext, vertexShader, fragmentShader) {
    const program = glContext.createProgram();
    glContext.attachShader(program, vertexShader);
    glContext.attachShader(program, fragmentShader);
    glContext.linkProgram(program);

    if (!glContext.getProgramParameter(program, glContext.LINK_STATUS))
        console.trace(glContext.getProgramInfoLog(program));

    return program;
}

function getUniforms(glContext, program) {
    const uniforms = [];
    const uniformCount = glContext.getProgramParameter(program, glContext.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
        const uniformName = glContext.getActiveUniform(program, i).name;
        uniforms[uniformName] = glContext.getUniformLocation(program, uniformName);
    }
    return uniforms;
}

class Material {
    constructor(glContext, vertexShader, fragmentShaderSource) {
        this.gl = glContext;
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
    }

    setKeywords(keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++)
            hash += hashCode(keywords[i]);

        let program = this.programs[hash];
        if (program == null)
        {
            const fragmentShader = compileShader(this.gl, this.gl.FRAGMENT_SHADER, addKeywords(this.fragmentShaderSource, keywords));
            program = createProgram(this.gl, this.vertexShader, fragmentShader);
            this.programs[hash] = program;
        }

        if (program === this.activeProgram) return;

        this.uniforms = getUniforms(this.gl, program);
        this.activeProgram = program;
    }

    bind () {
        this.gl.useProgram(this.activeProgram);
    }
}

class Program {
    constructor(glContext, vertexShader, fragmentSource, keywords = null) {
        this.gl = glContext;
        const fragmentShader = compileShader(glContext, glContext.FRAGMENT_SHADER, fragmentSource, keywords);
        this.program = createProgram(glContext, vertexShader, fragmentShader);
        this.uniforms = getUniforms(glContext, this.program);
    }

    bind () {
        this.gl.useProgram(this.program);
    }
}

const DEFAULT_CONFIG = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 2,
    VELOCITY_DISSIPATION: 0.1,
    PRESSURE: 0,
    PRESSURE_ITERATIONS: 20,
    CURL: 0,
    SPLAT_RADIUS: 0.2,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: false,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: true,
    BLOOM: false,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
};

export function initFluid(canvas, options = {}) {
    if (!canvas) throw new Error('initFluid requires a canvas element');

    const doc = options.document || canvas.ownerDocument || document;
    const win = options.window || doc.defaultView || window;
    const ga = typeof options.ga === 'function' ? options.ga : () => {};
    const dat = options.dat;
    const enableGui = !!options.enableGui;
    const assetsBase = options.assetsBasePath || '';
    const ditherTexture = options.ditherTexturePath || `${assetsBase}LDR_LLL1_0.png`;

    let config = mergeConfig(DEFAULT_CONFIG, options.config);

    function pointerPrototype() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = generateColor();
    }

    const pointers = [];
    pointers.push(new pointerPrototype());

    const { gl, ext } = getWebGLContext(canvas, ga);

    if (isMobile(win)) {
        config.DYE_RESOLUTION = Math.min(config.DYE_RESOLUTION, 512);
    }
    if (!ext.supportLinearFiltering) {
        config.DYE_RESOLUTION = Math.min(config.DYE_RESOLUTION, 512);
        config.SHADING = false;
        config.BLOOM = false;
        config.SUNRAYS = false;
    }

    const gui = enableGui && dat ? startGUI(dat, config) : null;

    let dye;
    let velocity;
    let divergence;
    let curl;
    let pressure;
    let bloom;
    let bloomFramebuffers = [];
    let sunrays;
    let sunraysTemp;

    let ditheringTexture = createTextureAsync(gl, ditherTexture);

    const blurVertex = compileShader(gl, gl.VERTEX_SHADER, BLUR_VERTEX_SOURCE);
    const baseVertex = compileShader(gl, gl.VERTEX_SHADER, BASE_VERTEX_SOURCE);

    const blurProgram            = new Program(gl, blurVertex, BLUR_SHADER_SOURCE);
    const copyProgram            = new Program(gl, baseVertex, COPY_SHADER_SOURCE);
    const clearProgram           = new Program(gl, baseVertex, CLEAR_SHADER_SOURCE);
    const colorProgram           = new Program(gl, baseVertex, COLOR_SHADER_SOURCE);
    const checkerboardProgram    = new Program(gl, baseVertex, CHECKERBOARD_SHADER_SOURCE);
    const bloomPrefilterProgram  = new Program(gl, baseVertex, BLOOM_PREFILTER_SHADER_SOURCE);
    const bloomBlurProgram       = new Program(gl, baseVertex, BLOOM_BLUR_SHADER_SOURCE);
    const bloomFinalProgram      = new Program(gl, baseVertex, BLOOM_FINAL_SHADER_SOURCE);
    const sunraysMaskProgram     = new Program(gl, baseVertex, SUNRAYS_MASK_SHADER_SOURCE);
    const sunraysProgram         = new Program(gl, baseVertex, SUNRAYS_SHADER_SOURCE);
    const splatProgram           = new Program(gl, baseVertex, SPLAT_SHADER_SOURCE);
    const advectionProgram       = new Program(gl, baseVertex, ADVECTION_SHADER_SOURCE, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);
    const divergenceProgram      = new Program(gl, baseVertex, DIVERGENCE_SHADER_SOURCE);
    const curlProgram            = new Program(gl, baseVertex, CURL_SHADER_SOURCE);
    const vorticityProgram       = new Program(gl, baseVertex, VORTICITY_SHADER_SOURCE);
    const pressureProgram        = new Program(gl, baseVertex, PRESSURE_SHADER_SOURCE);
    const gradienSubtractProgram = new Program(gl, baseVertex, GRADIENT_SUBTRACT_SHADER_SOURCE);

    const displayMaterial = new Material(gl, baseVertex, DISPLAY_SHADER_SOURCE);

    const blit = createBlit(gl);

    updateKeywords();
    initFramebuffers();
    // multipleSplats(parseInt(Math.random() * 20) + 5); // Убраны случайные вспышки в начале

    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;
    let animationHandle = null;
    let autoSplatInterval = null;
    let disposed = false;

    resizeCanvas();

    const handleMouseMove = event => {
        const rect = canvas.getBoundingClientRect();
        const x = scaleByPixelRatio(win, event.clientX - rect.left);
        const y = scaleByPixelRatio(win, event.clientY - rect.top);
        const pointer = pointers[0];
        pointer.down = true;
        updatePointerMoveData(pointer, x, y);
    };

    const handleMouseLeave = () => {
        const pointer = pointers[0];
        updatePointerUpData(pointer);
    };

    const handleResize = () => {
        if (resizeCanvas()) {
            initFramebuffers();
        }
    };

    win.addEventListener('mousemove', handleMouseMove, { passive: true });
    win.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    win.addEventListener('resize', handleResize);

    function update() {
        if (disposed) return;
        const dt = calcDeltaTime();
        if (resizeCanvas()) initFramebuffers();
        updateColors(dt);
        applyInputs();
        if (!config.PAUSED) step(dt);
        render(null);
        animationHandle = win.requestAnimationFrame(update);
    }

    animationHandle = win.requestAnimationFrame(update);

    // Автоматические вспышки
    if (config.AUTO_SPLATS_ENABLED && config.AUTO_SPLATS_INTERVAL > 0) {
        autoSplatInterval = win.setInterval(() => {
            if (!disposed) {
                const x = Math.random();
                const y = Math.random();
                const dx = (Math.random() - 0.5) * config.AUTO_SPLAT_FORCE;
                const dy = (Math.random() - 0.5) * config.AUTO_SPLAT_FORCE;
                const color = generateColor();
                splat(x, y, dx, dy, color);
            }
        }, config.AUTO_SPLATS_INTERVAL);
    }

    return function dispose() {
        disposed = true;
        if (animationHandle) {
            win.cancelAnimationFrame(animationHandle);
        }
        if (autoSplatInterval) {
            win.clearInterval(autoSplatInterval);
        }
        win.removeEventListener('mousemove', handleMouseMove);
        win.removeEventListener('mouseleave', handleMouseLeave);
        win.removeEventListener('resize', handleResize);
        if (gui && typeof gui.destroy === 'function') gui.destroy();
    };

    function mergeConfig(base, overrides = {}) {
        const result = JSON.parse(JSON.stringify(base));
        Object.keys(overrides).forEach(key => {
            const value = overrides[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = { ...result[key], ...value };
            } else if (value !== undefined) {
                result[key] = value;
            }
        });
        return result;
    }

    function calcDeltaTime() {
        const now = Date.now();
        let dt = (now - lastUpdateTime) / 1000;
        dt = Math.min(dt, 0.016666);
        lastUpdateTime = now;
        return dt;
    }

    function resizeCanvas() {
        const width = scaleByPixelRatio(win, canvas.clientWidth);
        const height = scaleByPixelRatio(win, canvas.clientHeight);
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    function updateColors(dt) {
        if (!config.COLORFUL) return;

        colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
        if (colorUpdateTimer >= 1) {
            colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
            pointers.forEach(p => {
                p.color = generateColor();
            });
        }
    }

    function applyInputs() {
        pointers.forEach(p => {
            if (!p.down) return;
            if (p.moved) {
                p.moved = false;
                splatPointer(p);
            }
        });
    }

    function step(dt) {
        gl.disable(gl.BLEND);

        curlProgram.bind();
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(curl);

        vorticityProgram.bind();
        gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
        gl.uniform1f(vorticityProgram.uniforms.dt, dt);
        blit(velocity.write);
        velocity.swap();

        divergenceProgram.bind();
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence);

        clearProgram.bind();
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
        blit(pressure.write);
        pressure.swap();

        pressureProgram.bind();
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write);
            pressure.swap();
        }

        gradienSubtractProgram.bind();
        gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        advectionProgram.bind();
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        if (!ext.supportLinearFiltering) {
            gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
        }
        const velocityId = velocity.read.attach(0);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
        gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        if (!ext.supportLinearFiltering) {
            gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
        }
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();
    }

    function render(target) {
        if (config.BLOOM) {
            applyBloom(dye.read, bloom);
        }
        if (config.SUNRAYS) {
            applySunrays(dye.read, dye.write, sunrays);
            blur(sunrays, sunraysTemp, 1);
        }

        if (target == null || !config.TRANSPARENT) {
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }
        else {
            gl.disable(gl.BLEND);
        }

        if (!config.TRANSPARENT) {
            drawColor(target, normalizeColor(config.BACK_COLOR));
        }
        if (target == null && config.TRANSPARENT) {
            drawCheckerboard(target);
        }
        drawDisplay(target);
    }

    function drawColor(target, color) {
        colorProgram.bind();
        gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
        blit(target);
    }

    function drawCheckerboard(target) {
        checkerboardProgram.bind();
        gl.uniform1f(checkerboardProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        blit(target);
    }

    function drawDisplay(target) {
        const width = target == null ? gl.drawingBufferWidth : target.width;
        const height = target == null ? gl.drawingBufferHeight : target.height;

        displayMaterial.bind();
        if (config.SHADING) {
            gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
        }
        gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
        if (config.BLOOM) {
            gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1));
            gl.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2));
            const scale = getTextureScale(ditheringTexture, width, height);
            gl.uniform2f(displayMaterial.uniforms.ditherScale, scale.x, scale.y);
        }
        if (config.SUNRAYS) {
            gl.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3));
        }
        blit(target);
    }

    function applyBloom(source, destination) {
        if (bloomFramebuffers.length < 2) return;

        let last = destination;

        gl.disable(gl.BLEND);
        bloomPrefilterProgram.bind();
        const knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
        const curve0 = config.BLOOM_THRESHOLD - knee;
        const curve1 = knee * 2;
        const curve2 = 0.25 / knee;
        gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
        gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
        gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
        blit(last);

        bloomBlurProgram.bind();
        for (let i = 0; i < bloomFramebuffers.length; i++) {
            const dest = bloomFramebuffers[i];
            gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
            gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
            blit(dest);
            last = dest;
        }

        gl.blendFunc(gl.ONE, gl.ONE);
        gl.enable(gl.BLEND);

        for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
            const baseTex = bloomFramebuffers[i];
            gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
            gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
            gl.viewport(0, 0, baseTex.width, baseTex.height);
            blit(baseTex);
            last = baseTex;
        }

        gl.disable(gl.BLEND);
        bloomFinalProgram.bind();
        gl.uniform2f(bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
        gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
        blit(destination);
    }

    function applySunrays(source, mask, destination) {
        gl.disable(gl.BLEND);
        sunraysMaskProgram.bind();
        gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, source.attach(0));
        blit(mask);

        sunraysProgram.bind();
        gl.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT);
        gl.uniform1i(sunraysProgram.uniforms.uTexture, mask.attach(0));
        blit(destination);
    }

    function blur(target, temp, iterations) {
        blurProgram.bind();
        for (let i = 0; i < iterations; i++) {
            gl.uniform2f(blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
            gl.uniform1i(blurProgram.uniforms.uTexture, target.attach(0));
            blit(temp);

            gl.uniform2f(blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
            gl.uniform1i(blurProgram.uniforms.uTexture, temp.attach(0));
            blit(target);
        }
    }

    function splatPointer(pointer) {
        const dx = pointer.deltaX * config.SPLAT_FORCE;
        const dy = pointer.deltaY * config.SPLAT_FORCE;
        splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    function multipleSplats(amount) {
        for (let i = 0; i < amount; i++) {
            const color = generateColor();
            color.r *= 10.0;
            color.g *= 10.0;
            color.b *= 10.0;
            const x = Math.random();
            const y = Math.random();
            const dx = 1000 * (Math.random() - 0.5);
            const dy = 1000 * (Math.random() - 0.5);
            splat(x, y, dx, dy, color);
        }
    }

    function splat(x, y, dx, dy, color) {
        splatProgram.bind();
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x, y);
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
        blit(velocity.write);
        velocity.swap();

        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
        blit(dye.write);
        dye.swap();
    }

    function correctRadius(radius) {
        const aspectRatio = canvas.width / canvas.height;
        if (aspectRatio > 1) {
            radius *= aspectRatio;
        }
        return radius;
    }

    function updatePointerMoveData(pointer, posX, posY) {
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = posX / canvas.width;
        pointer.texcoordY = 1.0 - posY / canvas.height;
        pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
        pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    function updatePointerUpData(pointer) {
        pointer.down = false;
        pointer.moved = false;
    }

    function correctDeltaX(delta) {
        const aspectRatio = canvas.width / canvas.height;
        if (aspectRatio < 1) delta *= aspectRatio;
        return delta;
    }

    function correctDeltaY(delta) {
        const aspectRatio = canvas.width / canvas.height;
        if (aspectRatio > 1) delta /= aspectRatio;
        return delta;
    }

    function generateColor() {
        const hue = config.FIXED_HUE !== undefined ? config.FIXED_HUE : Math.random();
        const c = HSVtoRGB(hue, 1.0, 1.0);
        c.r *= 0.15;
        c.g *= 0.15;
        c.b *= 0.15;
        return c;
    }

    function HSVtoRGB(h, s, v) {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return { r, g, b };
    }

    function normalizeColor(input) {
        return {
            r: input.r / 255,
            g: input.g / 255,
            b: input.b / 255
        };
    }

    function wrap(value, min, max) {
        const range = max - min;
        if (range === 0) return min;
        return (value - min) % range + min;
    }

    function getResolution(resolution) {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

        const min = Math.round(resolution);
        const max = Math.round(resolution * aspectRatio);

        if (gl.drawingBufferWidth > gl.drawingBufferHeight)
            return { width: max, height: min };
        else
            return { width: min, height: max };
    }

    function getTextureScale(texture, width, height) {
        return {
            x: width / texture.width,
            y: height / texture.height
        };
    }

    function scaleByPixelRatio(targetWindow, input) {
        const pixelRatio = targetWindow.devicePixelRatio || 1;
        return Math.floor(input * pixelRatio);
    }

    function getWebGLContext(targetCanvas, gaFn) {
        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

        let glContext = targetCanvas.getContext('webgl2', params);
        const isWebGL2 = !!glContext;
        if (!isWebGL2)
            glContext = targetCanvas.getContext('webgl', params) || targetCanvas.getContext('experimental-webgl', params);

        if (!glContext) {
            throw new Error('Failed to get WebGL context');
        }

        let halfFloat;
        let supportLinearFiltering;
        if (isWebGL2) {
            glContext.getExtension('EXT_color_buffer_float');
            supportLinearFiltering = glContext.getExtension('OES_texture_float_linear');
        } else {
            halfFloat = glContext.getExtension('OES_texture_half_float');
            supportLinearFiltering = glContext.getExtension('OES_texture_half_float_linear');
        }

        glContext.clearColor(0.0, 0.0, 0.0, 1.0);

        const halfFloatTexType = isWebGL2 ? glContext.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
        let formatRGBA;
        let formatRG;
        let formatR;

        if (isWebGL2)
        {
            formatRGBA = getSupportedFormat(glContext, glContext.RGBA16F, glContext.RGBA, halfFloatTexType);
            formatRG = getSupportedFormat(glContext, glContext.RG16F, glContext.RG, halfFloatTexType);
            formatR = getSupportedFormat(glContext, glContext.R16F, glContext.RED, halfFloatTexType);
        }
        else
        {
            formatRGBA = getSupportedFormat(glContext, glContext.RGBA, glContext.RGBA, halfFloatTexType);
            formatRG = getSupportedFormat(glContext, glContext.RGBA, glContext.RGBA, halfFloatTexType);
            formatR = getSupportedFormat(glContext, glContext.RGBA, glContext.RGBA, halfFloatTexType);
        }

        gaFn('send', 'event', isWebGL2 ? 'webgl2' : 'webgl', formatRGBA == null ? 'not supported' : 'supported');

        return {
            gl: glContext,
            ext: {
                formatRGBA,
                formatRG,
                formatR,
                halfFloatTexType,
                supportLinearFiltering
            }
        };
    }

    function getSupportedFormat(glContext, internalFormat, format, type)
    {
        if (!supportRenderTextureFormat(glContext, internalFormat, format, type))
        {
            switch (internalFormat)
            {
                case glContext.R16F:
                    return getSupportedFormat(glContext, glContext.RG16F, glContext.RG, type);
                case glContext.RG16F:
                    return getSupportedFormat(glContext, glContext.RGBA16F, glContext.RGBA, type);
                default:
                    return null;
            }
        }

        return {
            internalFormat,
            format
        };
    }

    function supportRenderTextureFormat(glContext, internalFormat, format, type) {
        const texture = glContext.createTexture();
        glContext.bindTexture(glContext.TEXTURE_2D, texture);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);
        glContext.texImage2D(glContext.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

        const fbo = glContext.createFramebuffer();
        glContext.bindFramebuffer(glContext.FRAMEBUFFER, fbo);
        glContext.framebufferTexture2D(glContext.FRAMEBUFFER, glContext.COLOR_ATTACHMENT0, glContext.TEXTURE_2D, texture, 0);

        const status = glContext.checkFramebufferStatus(glContext.FRAMEBUFFER);
        return status == glContext.FRAMEBUFFER_COMPLETE;
    }

    function startGUI(datLib, cfg) {
        const gui = new datLib.GUI({ width: 300 });
        gui.add(cfg, 'DYE_RESOLUTION', { 'high': 1024, 'medium': 512, 'low': 256, 'very low': 128 }).name('quality').onFinishChange(initFramebuffers);
        gui.add(cfg, 'SIM_RESOLUTION', { '32': 32, '64': 64, '128': 128, '256': 256 }).name('sim resolution').onFinishChange(initFramebuffers);
        gui.add(cfg, 'DENSITY_DISSIPATION', 0, 4.0).name('density diffusion');
        gui.add(cfg, 'VELOCITY_DISSIPATION', 0, 4.0).name('velocity diffusion');
        gui.add(cfg, 'PRESSURE', 0.0, 1.0).name('pressure');
        gui.add(cfg, 'CURL', 0, 50).name('vorticity').step(1);
        gui.add(cfg, 'SPLAT_RADIUS', 0.01, 1.0).name('splat radius');
        gui.add(cfg, 'SHADING').name('shading').onFinishChange(updateKeywords);
        gui.add(cfg, 'COLORFUL').name('colorful');
        gui.add(cfg, 'PAUSED').name('paused').listen();

        const captureFolder = gui.addFolder('Capture');
        captureFolder.addColor(cfg, 'BACK_COLOR').name('background color');
        captureFolder.add(cfg, 'TRANSPARENT').name('transparent');
        captureFolder.add({ fun: captureScreenshot }, 'fun').name('take screenshot');

        if (isMobile(win)) gui.close();
        return gui;
    }

    function isMobile(targetWindow) {
        return /Mobi|Android/i.test(targetWindow.navigator.userAgent);
    }

    function captureScreenshot() {
        const res = getResolution(config.CAPTURE_RESOLUTION);
        const target = createFBO(res.width, res.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, gl.NEAREST);
        render(target);

        let texture = framebufferToTexture(target);
        texture = normalizeTexture(texture, target.width, target.height);

        const captureCanvas = textureToCanvas(texture, target.width, target.height, doc);
        const datauri = captureCanvas.toDataURL();
        downloadURI(doc, 'fluid.png', datauri);
        URL.revokeObjectURL(datauri);
    }

    function framebufferToTexture(target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        const length = target.width * target.height * 4;
        const texture = new Float32Array(length);
        gl.readPixels(0, 0, target.width, target.height, gl.RGBA, gl.FLOAT, texture);
        return texture;
    }

    function normalizeTexture(texture, width, height) {
        const result = new Uint8Array(texture.length);
        let id = 0;
        for (let i = height - 1; i >= 0; i--) {
            for (let j = 0; j < width; j++) {
                const nid = i * width * 4 + j * 4;
                result[nid + 0] = clamp01(texture[id + 0]) * 255;
                result[nid + 1] = clamp01(texture[id + 1]) * 255;
                result[nid + 2] = clamp01(texture[id + 2]) * 255;
                result[nid + 3] = clamp01(texture[id + 3]) * 255;
                id += 4;
            }
        }
        return result;
    }

    function clamp01(input) {
        return Math.min(Math.max(input, 0), 1);
    }

    function textureToCanvas(texture, width, height, documentRef) {
        const captureCanvas = documentRef.createElement('canvas');
        const ctx = captureCanvas.getContext('2d');
        captureCanvas.width = width;
        captureCanvas.height = height;

        if (!ctx) return captureCanvas;

        const imageData = ctx.createImageData(width, height);
        imageData.data.set(texture);
        ctx.putImageData(imageData, 0, 0);

        return captureCanvas;
    }

    function downloadURI(documentRef, filename, uri) {
        const link = documentRef.createElement('a');
        link.download = filename;
        link.href = uri;
        documentRef.body.appendChild(link);
        link.click();
        documentRef.body.removeChild(link);
    }

    function createTextureAsync(glContext, url) {
        const texture = glContext.createTexture();
        glContext.bindTexture(glContext.TEXTURE_2D, texture);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.REPEAT);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.REPEAT);
        glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGB, 1, 1, 0, glContext.RGB, glContext.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));

        const obj = {
            texture,
            width: 1,
            height: 1,
            attach(id) {
                glContext.activeTexture(glContext.TEXTURE0 + id);
                glContext.bindTexture(glContext.TEXTURE_2D, texture);
                return id;
            }
        };

        const image = new Image();
        image.onload = () => {
            obj.width = image.width;
            obj.height = image.height;
            glContext.bindTexture(glContext.TEXTURE_2D, texture);
            glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGB, glContext.RGB, glContext.UNSIGNED_BYTE, image);
        };
        image.src = url;

        return obj;
    }

    function initFramebuffers() {
        const simRes = getResolution(config.SIM_RESOLUTION);
        const dyeRes = getResolution(config.DYE_RESOLUTION);

        const texType = ext.halfFloatTexType;
        const rgba    = ext.formatRGBA;
        const rg      = ext.formatRG;
        const r       = ext.formatR;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

        gl.disable(gl.BLEND);

        if (dye == null)
            dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
        else
            dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

        if (velocity == null)
            velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
        else
            velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

        divergence = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
        curl       = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
        pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

        initBloomFramebuffers();
        initSunraysFramebuffers();
    }

    function initBloomFramebuffers() {
        const res = getResolution(config.BLOOM_RESOLUTION);

        const texType = ext.halfFloatTexType;
        const rgba = ext.formatRGBA;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

        bloom = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);

        bloomFramebuffers.length = 0;
        for (let i = 0; i < config.BLOOM_ITERATIONS; i++)
        {
            const width = res.width >> (i + 1);
            const height = res.height >> (i + 1);

            if (width < 2 || height < 2) break;

            const fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
            bloomFramebuffers.push(fbo);
        }
    }

    function initSunraysFramebuffers() {
        const res = getResolution(config.SUNRAYS_RESOLUTION);

        const texType = ext.halfFloatTexType;
        const r = ext.formatR;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

        sunrays     = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
        sunraysTemp = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
    }

    function createFBO(w, h, internalFormat, format, type, param) {
        gl.activeTexture(gl.TEXTURE0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const texelSizeX = 1.0 / w;
        const texelSizeY = 1.0 / h;

        return {
            texture,
            fbo,
            width: w,
            height: h,
            texelSizeX,
            texelSizeY,
            attach(id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    function createDoubleFBO(w, h, internalFormat, format, type, param) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);

        return {
            width: w,
            height: h,
            texelSizeX: fbo1.texelSizeX,
            texelSizeY: fbo1.texelSizeY,
            get read() {
                return fbo1;
            },
            set read(value) {
                fbo1 = value;
            },
            get write() {
                return fbo2;
            },
            set write(value) {
                fbo2 = value;
            },
            swap() {
                const temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        };
    }

    function resizeFBO(target, w, h, internalFormat, format, type, param) {
        const newFBO = createFBO(w, h, internalFormat, format, type, param);
        copyProgram.bind();
        gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
        blit(newFBO);
        return newFBO;
    }

    function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
        if (target.width === w && target.height === h)
            return target;
        target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
        target.write = createFBO(w, h, internalFormat, format, type, param);
        target.width = w;
        target.height = h;
        target.texelSizeX = 1.0 / w;
        target.texelSizeY = 1.0 / h;
        return target;
    }

    function createBlit(glContext) {
        const buffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), glContext.STATIC_DRAW);
        const indexBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), glContext.STATIC_DRAW);

        return (target) => {
            glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer);
            glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
            glContext.vertexAttribPointer(0, 2, glContext.FLOAT, false, 0, 0);
            glContext.enableVertexAttribArray(0);

            if (target == null)
            {
                glContext.viewport(0, 0, glContext.drawingBufferWidth, glContext.drawingBufferHeight);
                glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
            }
            else
            {
                glContext.viewport(0, 0, target.width, target.height);
                glContext.bindFramebuffer(glContext.FRAMEBUFFER, target.fbo);
            }
            glContext.drawElements(glContext.TRIANGLES, 6, glContext.UNSIGNED_SHORT, 0);
        };
    }

    function updateKeywords() {
        const displayKeywords = [];
        if (config.SHADING) displayKeywords.push('SHADING');
        if (config.BLOOM) displayKeywords.push('BLOOM');
        if (config.SUNRAYS) displayKeywords.push('SUNRAYS');
        displayMaterial.setKeywords(displayKeywords);
    }



}
const BASE_VERTEX_SOURCE = `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const BLUR_VERTEX_SOURCE = `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const BLUR_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`;

const COPY_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`;

const CLEAR_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`;

const COLOR_SHADER_SOURCE = `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`;

const CHECKERBOARD_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;

    #define SCALE 25.0

    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`;

const DISPLAY_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);

        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`;

const BLOOM_PREFILTER_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`;

const BLOOM_BLUR_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`;

const BLOOM_FINAL_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`;

const SUNRAYS_MASK_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`;

const SUNRAYS_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`;

const SPLAT_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`;

const ADVECTION_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }
`;

const DIVERGENCE_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;

const CURL_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`;

const VORTICITY_SHADER_SOURCE = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

const PRESSURE_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`;

const GRADIENT_SUBTRACT_SHADER_SOURCE = `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

export const defaultFluidConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
