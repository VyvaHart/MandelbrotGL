// rendering.js
import { mandelbrotGl, juliaGl, mandelbrotCanvas, juliaCanvas, scalePerZoom, config } from './config.js';

// Render the Mandelbrot set
export const renderMandelbrot = () => {
    if (!config.mandelbrotShaderProgram) return;
    mandelbrotGl.useProgram(config.mandelbrotShaderProgram);
    setMandelbrotUniforms(mandelbrotGl);
    mandelbrotGl.clear(mandelbrotGl.COLOR_BUFFER_BIT);
    mandelbrotGl.drawArrays(mandelbrotGl.TRIANGLE_STRIP, 0, 4);
};

// Set uniforms for the Mandelbrot shader
const setMandelbrotUniforms = (gl) => {
    const centerLocation = gl.getUniformLocation(config.mandelbrotShaderProgram, "center");
    const rectangleLocation = gl.getUniformLocation(config.mandelbrotShaderProgram, "rectangle");
    const maxIterationsLocation = gl.getUniformLocation(config.mandelbrotShaderProgram, "maxIterations");
    const themeLocation = gl.getUniformLocation(config.mandelbrotShaderProgram, "theme");
    const colorCompressionLocation = gl.getUniformLocation(config.mandelbrotShaderProgram, "colorCompression");
    gl.uniform1i(themeLocation, config.currentTheme);
    gl.uniform2fv(centerLocation, config.center);
    gl.uniform2fv(rectangleLocation, [scalePerZoom ** -config.zoom * mandelbrotCanvas.width / mandelbrotCanvas.height, scalePerZoom ** -config.zoom]);
    gl.uniform1i(maxIterationsLocation, config.maxIterations);
    gl.uniform1f(colorCompressionLocation, config.colorCompression);
}

// Render the Julia set
export const renderJulia = () => {
    if (!config.juliaShaderProgram) return;
    juliaGl.useProgram(config.juliaShaderProgram);
    setJuliaUniforms(juliaGl);

    juliaGl.clear(juliaGl.COLOR_BUFFER_BIT);
    juliaGl.drawArrays(juliaGl.TRIANGLE_STRIP, 0, 4);

    drawJuliaCursor();
};

// Set uniforms for the Julia shader
const setJuliaUniforms = (gl) => {
    const juliaConstantLocation = juliaGl.getUniformLocation(config.juliaShaderProgram, "juliaConstant");
    const maxIterationsLocation = juliaGl.getUniformLocation(config.juliaShaderProgram, "maxIterations");
    const rectangleLocation = juliaGl.getUniformLocation(config.juliaShaderProgram, "rectangle");
    const cursorPositionLocation = juliaGl.getUniformLocation(config.juliaShaderProgram, "cursorPosition");
    const cursorSizeLocation = juliaGl.getUniformLocation(config.juliaShaderProgram, "cursorSize");
    const themeLocation = juliaGl.getUniformLocation(config.juliaShaderProgram, "theme");
    juliaGl.uniform2fv(juliaConstantLocation, config.juliaConstant);
    juliaGl.uniform1i(maxIterationsLocation, config.maxIterations);
    juliaGl.uniform2fv(rectangleLocation, [juliaCanvas.width / juliaCanvas.height, 1.0]);
    juliaGl.uniform2fv(cursorPositionLocation, config.juliaConstant);
    juliaGl.uniform1f(cursorSizeLocation, 0.1);
    juliaGl.uniform1i(themeLocation, config.currentTheme);
}

// Draw the Julia cursor crosshair
export const drawJuliaCursor = () => {
    juliaGl.enable(juliaGl.BLEND);
    juliaGl.blendFunc(juliaGl.SRC_ALPHA, juliaGl.ONE_MINUS_SRC_ALPHA);
    const positionLocation = juliaGl.getAttribLocation(config.juliaShaderProgram, "a_position");
    juliaGl.enableVertexAttribArray(positionLocation);
    juliaGl.vertexAttribPointer(positionLocation, 2, juliaGl.FLOAT, false, 0, 0);
    juliaGl.drawArrays(juliaGl.LINES, 0, 4);
};
