// events.js

import { config, mandelbrotCanvas, juliaCanvas, pixelRatio, scalePerZoom, rangeInput, colorCompressionRange, colorCompressionDisplay, themeSelector } from './config.js';
import { renderJulia } from './rendering.js';
import { canvasToMandelbrot, getCanvasCoordinates, preventDefaultBehavior } from './utils.js';

// Update max iterations
const updateMaxIterations = () => {
    config.maxIterations = 2 ** rangeInput.valueAsNumber;
    document.querySelector("#max-iterations").textContent = config.maxIterations.toString();
};

// Theme selection
const applyTheme = (theme) => {
    config.currentTheme = theme;
};

const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    applyTheme(parseInt(selectedTheme, 10));
};

// Update color compression
const updateColorCompression = () => {
    config.colorCompression = parseFloat(colorCompressionRange.value);
    colorCompressionDisplay.textContent = config.colorCompression.toFixed(1);
};

// Track Ctrl key press
const handleCtrlKey = (event, pressed) => {
    if (event.key === 'Control') {
        console.log(`Ctrl ${pressed ? 'pressed' : 'unpressed'}.`);
        config.isCtrlPressed = pressed;
    }
};

// Ctrl + Click for setting target center
const handleCtrlClick = (event) => {
    if (config.isCtrlPressed && event.button === 0) {
        preventDefaultBehavior(event);
        const { x, y } = getCanvasCoordinates(event);
        const { x: mouseX, y: mouseY } = canvasToMandelbrot(x, y);
        config.targetCenter = [mouseX, mouseY];
    }
};

// Wheel zoom
const handleWheelZoom = (event) => {
    preventDefaultBehavior(event);
    const { x, y } = getCanvasCoordinates(event);
    const delta = Math.min(Math.max(-event.deltaY * 5, -100), 100) / 100;
    config.targetZoom += delta;

    const { x: mouseXBefore, y: mouseYBefore } = canvasToMandelbrot(x, y);
    const { x: mouseXAfter, y: mouseYAfter } = canvasToMandelbrot(x, y);
    config.center[0] += (mouseXBefore - mouseXAfter);
    config.center[1] += (mouseYBefore - mouseYAfter);
};

// Mouse move for panning and updating Julia constant
const handleMouseMove = (event) => {
    if (event.buttons & 1) { // Left mouse button
        const { movementX, movementY } = event;
        const aspectRatio = mandelbrotCanvas.width / mandelbrotCanvas.height;
        config.targetCenter[0] -= (movementX * 2 * aspectRatio) / (mandelbrotCanvas.width * (scalePerZoom ** config.zoom));
        config.targetCenter[1] += (movementY * 2) / (mandelbrotCanvas.height * (scalePerZoom ** config.zoom));
    }

    const { x, y } = getCanvasCoordinates(event);
    const { x: mandelbrotX, y: mandelbrotY } = canvasToMandelbrot(x, y);
    config.juliaConstant = [mandelbrotX, mandelbrotY];
    renderJulia();
    document.querySelector("#Re").value = mandelbrotX.toFixed(8);
    document.querySelector("#Im").value = mandelbrotY.toFixed(8);
};

// Keyboard zoom controls
const handleKeyboardZoom = (event) => {
    if (event.key.toLowerCase() === 'q') config.targetZoom -= 0.2;
    if (event.key.toLowerCase() === 'e') config.targetZoom += 0.2;
};

// Touch handling
let prevTouchX = -1, prevTouchY = -1, prevTouchDistance = -1;

const handleTouchMove = (event) => {
    preventDefaultBehavior(event);
    const { touches } = event;

    if (touches.length === 1) {
        const { clientX, clientY } = touches[0];
        const movementX = (clientX - prevTouchX) * pixelRatio;
        const movementY = (clientY - prevTouchY) * pixelRatio;

        config.center[0] += (-(movementX / mandelbrotCanvas.width * 2) / ((scalePerZoom ** config.zoom) / (mandelbrotCanvas.width / mandelbrotCanvas.height)));
        config.center[1] += ((movementY / mandelbrotCanvas.height * 2) / (scalePerZoom ** config.zoom));

        prevTouchX = clientX;
        prevTouchY = clientY;
    } else if (touches.length === 2) {
        const [touch1, touch2] = touches;
        const clientX = (touch1.clientX + touch2.clientX) / 2;
        const clientY = (touch1.clientY + touch2.clientY) / 2;
        const touchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        const delta = Math.log(touchDistance / prevTouchDistance) / Math.log(scalePerZoom);
        config.zoom += delta;

        prevTouchX = clientX;
        prevTouchY = clientY;
        prevTouchDistance = touchDistance;
    }
};

const handleTouchStart = (event) => {
    const { touches } = event;
    if (touches.length === 1) {
        [prevTouchX, prevTouchY] = [touches[0].clientX, touches[0].clientY];
    } else if (touches.length === 2) {
        prevTouchDistance = Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
        );
        prevTouchX = (touches[0].clientX + touches[1].clientX) / 2;
        prevTouchY = (touches[0].clientY + touches[1].clientY) / 2;
    }
};

const handleTouchEnd = ({ touches }) => {
    if (touches.length === 0) {
        prevTouchX = prevTouchY = prevTouchDistance = -1;
    } else if (touches.length === 1) {
        prevTouchDistance = -1;
        [prevTouchX, prevTouchY] = [touches[0].clientX, touches[0].clientY];
    }
};

// Bind all event listeners
export const initializeEvents = () => {
    window.addEventListener('keydown', handleKeyboardZoom);
    window.addEventListener('keydown', (e) => handleCtrlKey(e, true));
    window.addEventListener('keyup', (e) => handleCtrlKey(e, false));
    mandelbrotCanvas.addEventListener('mousedown', handleCtrlClick);
    mandelbrotCanvas.addEventListener('wheel', handleWheelZoom, { passive: false });
    mandelbrotCanvas.addEventListener('mousemove', handleMouseMove);
    mandelbrotCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    mandelbrotCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    mandelbrotCanvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('contextmenu', preventDefaultBehavior);

    // Bind UI controls
    rangeInput.addEventListener("input", updateMaxIterations);
    themeSelector.addEventListener('change', handleThemeChange);
    colorCompressionRange.addEventListener("input", updateColorCompression);

    // Initialize values
    updateMaxIterations();
    updateColorCompression();
};
