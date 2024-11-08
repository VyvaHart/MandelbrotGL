// config.js

// Immutable constants
export const mandelbrotCanvas = document.getElementById("canvas");
export const juliaCanvas = document.getElementById("small_canvas");
export const mandelbrotGl = mandelbrotCanvas.getContext('webgl2');
export const juliaGl = juliaCanvas.getContext('webgl2');

// Mutable state
export const config = {
    mandelbrotShaderProgram: null,
    juliaShaderProgram: null,
    targetZoom: 0,
    targetCenter: [-0.5, 0],
    center: [-0.5, 0],
    zoom: 0,
    maxIterations: 256,
    currentTheme: 2,
    juliaConstant: [0, 0],
    colorCompression: undefined,
    isCtrlPressed: false,
};

// UI elements
export const themeSelector = document.getElementById('theme-select');
export const rangeInput = document.querySelector(".max-iterations input[type=range]");
export const colorCompressionRange = document.getElementById("colorCompressionRange");
export const colorCompressionDisplay = document.getElementById("colorCompressionDisplay");
export const zoomLevelDisplay = document.getElementById("zoom-level");

// Other constants
export const pixelRatio = window.devicePixelRatio;
export const scalePerZoom = 1.5;
export const zoomSpeed = 0.1;
