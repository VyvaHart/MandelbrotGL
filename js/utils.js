// utils.js
import { pixelRatio, config, scalePerZoom, mandelbrotCanvas, zoomSpeed, zoomLevelDisplay } from './config.js';

export const createBuffer = (gl) => {
    const positionBuffer = gl.createBuffer();
    const positions = new Float32Array([
        1.0, -1.0,  // Bottom-right
        1.0,  1.0,  // Top-right
        -1.0, -1.0, // Bottom-left
        -1.0,  1.0  // Top-left
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    return positionBuffer;
};

export const configureAttributes = (gl, program) => {
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const buffer = createBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
};

// Helper functions
export const resizeCanvas = (canvas, gl) => {
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
};

// Function to convert canvas coordinates to Mandelbrot coordinates
export const canvasToMandelbrot = (x, y) => {
	const pointX = ((x / mandelbrotCanvas.width * 2 - 1) / (
		(scalePerZoom ** config.zoom) / (mandelbrotCanvas.width / mandelbrotCanvas.height)
	)) + config.center[0];

	const pointY = (-(y / mandelbrotCanvas.height * 2 - 1) / (
		(scalePerZoom ** config.zoom)
	)) + config.center[1];

	return { x: pointX, y: pointY };
};

// Helper function to get mouse or touch position in canvas coordinates
export const getCanvasCoordinates = (event) => {
    const { offsetX, offsetY } = event;
    return { x: offsetX, y: offsetY };
};

// Helper function to prevent default behavior for specific events
export const preventDefaultBehavior = (event) => event.preventDefault();

// Smooth zooming logic: Interpolate between current zoom and target zoom
export const updateZoom = () => {
    zoomLevelDisplay.textContent = Math.round(config.zoom).toString();
    const zoomDiff = config.targetZoom - config.zoom;
    if (Math.abs(zoomDiff) > 0.001) config.zoom += zoomDiff * zoomSpeed;
};

// Function to smoothly move the viewport center to the target
export const smoothMoveCenter = () => {
    const lerpFactor = 0.15; // Adjust for desired smoothness
    config.center[0] += (config.targetCenter[0] - config.center[0]) * lerpFactor;
    config.center[1] += (config.targetCenter[1] - config.center[1]) * lerpFactor;
};
