import { mandelbrotCanvas, juliaCanvas, mandelbrotGl, juliaGl } from './config.js';
import { fetchShaders } from './shaders.js';
import { renderMandelbrot, renderJulia, drawJuliaCursor } from './rendering.js';
import { resizeCanvas, updateZoom, smoothMoveCenter } from './utils.js';
import { initializeEvents } from './events.js';

// Initialize both canvas dimensions
const initializeCanvas = () => {
    resizeCanvas(mandelbrotCanvas, mandelbrotGl);
    resizeCanvas(juliaCanvas, juliaGl);
};

window.addEventListener('resize', initializeCanvas);
initializeCanvas();

// Frame rendering function
const frame = () => {

    smoothMoveCenter();
    updateZoom();
    renderMandelbrot();
    renderJulia();
    drawJuliaCursor();
    window.requestAnimationFrame(frame);
};


// Initialize and start
initializeEvents();
fetchShaders().then(() => window.requestAnimationFrame(frame));