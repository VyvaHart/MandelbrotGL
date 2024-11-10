import { mandelbrotGl, juliaGl, config } from './config.js';
import { configureAttributes } from './utils.js';

export const fetchShaders = async () => {
    const [vertexSource, mandelbrotSource, juliaSource] = await Promise.all([
        fetch('shaders/vertex.glsl').then(res => res.text()),
        fetch('shaders/fragment.glsl').then(res => res.text()),
        fetch('shaders/fragment_julia.glsl').then(res => res.text())
    ]);

    config.mandelbrotShaderProgram = initShaderProgram(mandelbrotGl, vertexSource, mandelbrotSource);
    config.juliaShaderProgram = initShaderProgram(juliaGl, vertexSource, juliaSource);

    if (!config.mandelbrotShaderProgram || !config.juliaShaderProgram) {
        console.error('Shader program initialization failed.');
        return;
    }

    // Set up buffers and attributes for each shader
    setupMandelbrot();
    setupJulia();
};

// Initialize shader programs
function initShaderProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

// Create individual shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Set up the Mandelbrot canvas
function setupMandelbrot() {
    configureAttributes(mandelbrotGl, config.mandelbrotShaderProgram);
}

// Set up the Julia canvas
function setupJulia() {
    configureAttributes(juliaGl, config.juliaShaderProgram);
}

export { initShaderProgram, createShader };
