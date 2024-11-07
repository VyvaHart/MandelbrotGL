const mandelbrotCanvas = document.getElementById("canvas");
const juliaCanvas = document.getElementById("small_canvas");
const mandelbrotGl = mandelbrotCanvas.getContext('webgl2');
const juliaGl = juliaCanvas.getContext('webgl2');

if (!mandelbrotGl || !juliaGl) {
    console.error("WebGL2 is not available in your browser.");
    alert("Your browser does not support WebGL2.");
}

// Global variables
let mandelbrotShaderProgram, juliaShaderProgram;
let targetZoom = 0, targetCenter = [-0.5, 0];
let center = [...targetCenter];
let zoom = 0, maxIterations = 256, currentTheme = 2;
let juliaConstant = [0, 0];
let colorCompression;
let isCtrlPressed = false;
const pixelRatio = window.devicePixelRatio;
const scalePerZoom = 1.5, zoomSpeed = 0.1;
const themeSelector = document.getElementById('theme-select');
const rangeInput = document.querySelector(".max-iterations input[type=range]");
const colorCompressionRange = document.getElementById("colorCompressionRange");
const colorCompressionDisplay = document.getElementById("colorCompressionDisplay");

// Helper functions
const resizeCanvas = (canvas, gl) => {
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
};

// Initialize both canvas dimensions
const initializeCanvas = () => {
    resizeCanvas(mandelbrotCanvas, mandelbrotGl);
    resizeCanvas(juliaCanvas, juliaGl);
};

window.addEventListener('resize', () => {
    initializeCanvas();
});

// Call the resize function
initializeCanvas();

// Fetch shaders
const fetchShaders = async () => {
    const [vertexSource, mandelbrotSource, juliaSource] = await Promise.all([
        fetch('shaders/vertex.glsl').then(res => res.text()),
        fetch('shaders/fragment.glsl').then(res => res.text()),
        fetch('shaders/fragment_julia.glsl').then(res => res.text())
    ]);
    mandelbrotShaderProgram = initShaderProgram(mandelbrotGl, vertexSource, mandelbrotSource);
    juliaShaderProgram = initShaderProgram(juliaGl, vertexSource, juliaSource);

    if (!mandelbrotShaderProgram || !juliaShaderProgram) {
        console.error('Shader program initialization failed.');
        return;
    }

    // Set up rendering for both canvases
    setupMandelbrot();
    setupJulia();

    // Start the animation loop
    window.requestAnimationFrame(frame);
};

// Function to initialize the shader program
function initShaderProgram(gl, vertexSource, fragmentSource) {
    // Create vertex and fragment shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    // Check shader compilation status
    if (!vertexShader || !fragmentShader) {
        return null;
    }

    // Link shaders into a program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check program linking status
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

// Utility function to create and compile individual shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check for compilation errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}   

// Function to create buffer for vertex positions
const createBuffer = (gl) => {
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

// Set up the Mandelbrot canvas
const setupMandelbrot = () => configureAttributes(mandelbrotGl, mandelbrotShaderProgram);
const setupJulia = () => configureAttributes(juliaGl, juliaShaderProgram);

const configureAttributes = (gl, program) => {
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, createBuffer(gl));
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
};

// Frame rendering function
const frame = () => {

    smoothMoveCenter();
    updateZoom();
    zoomLevelDisplay.textContent = Math.round(zoom).toString();
    renderMandelbrot();
    renderJulia();
    drawJuliaCursor();
    window.requestAnimationFrame(frame);
};

// Smooth zooming logic: Interpolate between current zoom and target zoom
const updateZoom = () => {
    const zoomDiff = targetZoom - zoom;
    if (Math.abs(zoomDiff) > 0.001) zoom += zoomDiff * zoomSpeed;
};

// Function to smoothly move the viewport center to the target
const smoothMoveCenter = () => {
    const lerpFactor = 0.15; // Adjust for desired smoothness
    center[0] += (targetCenter[0] - center[0]) * lerpFactor;
    center[1] += (targetCenter[1] - center[1]) * lerpFactor;

    // // Set `center` exactly to `targetCenter` if the difference is negligible
    // if (Math.abs(targetCenter[0] - center[0]) < 0.0001 && Math.abs(targetCenter[1] - center[1]) < 0.0001) {
    //     center = [...targetCenter];
    // }
};

// Update max iterations when the user adjusts the range input
const updateMaxIterations = () => {
    maxIterations = 2 ** rangeInput.valueAsNumber;
    document.querySelector("#max-iterations").textContent = maxIterations.toString();
};
rangeInput.addEventListener("input", updateMaxIterations);
updateMaxIterations();


// Function to convert canvas coordinates to Mandelbrot coordinates
const canvasToMandelbrot = (x, y) => {
	const pointX = ((x / canvas.width * 2 - 1) / (
		(scalePerZoom ** zoom) / (canvas.width / canvas.height)
	)) + center[0];

	const pointY = (-(y / canvas.height * 2 - 1) / (
		(scalePerZoom ** zoom)
	)) + center[1];

	return { x: pointX, y: pointY };
};

// Add a variable to track the current theme

// Function to apply the selected theme to the Mandelbrot shader
const applyTheme = (theme) => {
    currentTheme = theme;
};

// Event listener for the theme selector
themeSelector.addEventListener('change', (event) => {
    const selectedTheme = event.target.value;
    applyTheme(parseInt(selectedTheme, 10));  // Update the theme based on selection
});

const zoomLevelDisplay = document.getElementById("zoom-level");

// Update the displayed compression value and pass it to the shader
const updateColorCompression = () => {
    colorCompression = parseFloat(colorCompressionRange.value);
    colorCompressionDisplay.textContent = colorCompression.toFixed(1);
};

// Listen for input changes on the color compression slider
colorCompressionRange.addEventListener("input", updateColorCompression);
updateColorCompression();


export const renderMandelbrot = () => {
    if (!mandelbrotShaderProgram) return;
    mandelbrotGl.useProgram(mandelbrotShaderProgram);
    setMandelbrotUniforms(mandelbrotGl);
    mandelbrotGl.clear(mandelbrotGl.COLOR_BUFFER_BIT);
    mandelbrotGl.drawArrays(mandelbrotGl.TRIANGLE_STRIP, 0, 4);
};

const setMandelbrotUniforms = (gl) => {
    const centerLocation = gl.getUniformLocation(mandelbrotShaderProgram, "center");
    const rectangleLocation = gl.getUniformLocation(mandelbrotShaderProgram, "rectangle");
    const maxIterationsLocation = gl.getUniformLocation(mandelbrotShaderProgram, "maxIterations");
    const themeLocation = gl.getUniformLocation(mandelbrotShaderProgram, "theme");
    const colorCompressionLocation = gl.getUniformLocation(mandelbrotShaderProgram, "colorCompression");
    gl.uniform1i(themeLocation, currentTheme);
    gl.uniform2fv(centerLocation, center);
    gl.uniform2fv(rectangleLocation, [scalePerZoom ** -zoom * mandelbrotCanvas.width / mandelbrotCanvas.height, scalePerZoom ** -zoom]);
    gl.uniform1i(maxIterationsLocation, maxIterations);
    gl.uniform1f(colorCompressionLocation, colorCompression); // Pass the color compression value
}

const renderJulia = () => {
    if (!juliaShaderProgram) return;
    juliaGl.useProgram(juliaShaderProgram);
    setJuliaUniforms(juliaGl);

    // Clear and draw the Julia set
    juliaGl.clear(juliaGl.COLOR_BUFFER_BIT);
    juliaGl.drawArrays(juliaGl.TRIANGLE_STRIP, 0, 4);

    drawJuliaCursor();
};

const setJuliaUniforms = (gl) => {
    const juliaConstantLocation = juliaGl.getUniformLocation(juliaShaderProgram, "juliaConstant");
    const maxIterationsLocation = juliaGl.getUniformLocation(juliaShaderProgram, "maxIterations");
    const rectangleLocation = juliaGl.getUniformLocation(juliaShaderProgram, "rectangle");
    const cursorPositionLocation = juliaGl.getUniformLocation(juliaShaderProgram, "cursorPosition");
    const cursorSizeLocation = juliaGl.getUniformLocation(juliaShaderProgram, "cursorSize");
    const themeLocation = juliaGl.getUniformLocation(juliaShaderProgram, "theme");
    juliaGl.uniform2fv(juliaConstantLocation, juliaConstant);
    juliaGl.uniform1i(maxIterationsLocation, maxIterations);
    juliaGl.uniform2fv(rectangleLocation, [ juliaCanvas.width / juliaCanvas.height, 1.0]);
    juliaGl.uniform2fv(cursorPositionLocation, juliaConstant);
    juliaGl.uniform1f(cursorSizeLocation, 0.1);
    juliaGl.uniform1i(themeLocation, currentTheme);
}

const drawJuliaCursor = () => {
    // Enable blending for transparency
    juliaGl.enable(juliaGl.BLEND);
    juliaGl.blendFunc(juliaGl.SRC_ALPHA, juliaGl.ONE_MINUS_SRC_ALPHA);

    const positionLocation = juliaGl.getAttribLocation(juliaShaderProgram, "a_position");
    juliaGl.enableVertexAttribArray(positionLocation);
    juliaGl.vertexAttribPointer(positionLocation, 2, juliaGl.FLOAT, false, 0, 0);

    // Draw the crosshair (two short lines forming a cross)
    juliaGl.drawArrays(juliaGl.LINES, 0, 4);
};

// Helper function to get mouse or touch position in canvas coordinates
const getCanvasCoordinates = (event) => {
    const { offsetX, offsetY } = event;
    return { x: offsetX, y: offsetY };
};

// Helper function to prevent default behavior for specific events
const preventDefaultBehavior = (event) => event.preventDefault();

// Track Ctrl key press status
const handleCtrlKey = (event, pressed) => {
    if (event.key === 'Control') {
        console.log(`Ctrl ${pressed ? 'pressed' : 'unpressed'}.`);
        isCtrlPressed = pressed;
    }
};

// Function to handle Ctrl + Right Mouse Click to set target center
const handleCtrlClick = (event) => {
    if (isCtrlPressed && event.button === 0) {
        preventDefaultBehavior(event);
        const { x, y } = getCanvasCoordinates(event);
        const { x: mouseX, y: mouseY } = canvasToMandelbrot(x, y);
        targetCenter = [mouseX, mouseY];
    }
};

// Pan and zoom events on mouse and touch input
const handleWheelZoom = (event) => {
    preventDefaultBehavior(event);
    const { x, y } = getCanvasCoordinates(event);
    const delta = Math.min(Math.max(-event.deltaY * 5, -100), 100) / 100;
    targetZoom += delta;

    const { x: mouseXBefore, y: mouseYBefore } = canvasToMandelbrot(x, y);
    const { x: mouseXAfter, y: mouseYAfter } = canvasToMandelbrot(x, y);
    center[0] += (mouseXBefore - mouseXAfter);
    center[1] += (mouseYBefore - mouseYAfter);
};

// Handle panning with mouse or touch move
const handleMouseMove = (event) => {
    if (event.buttons & 1) { // Left mouse button
        const { movementX, movementY } = event;
        const aspectRatio = mandelbrotCanvas.width / mandelbrotCanvas.height;
        targetCenter[0] -= (movementX * 2 * aspectRatio) / (mandelbrotCanvas.width * (scalePerZoom ** zoom));
        targetCenter[1] += (movementY * 2) / (mandelbrotCanvas.height * (scalePerZoom ** zoom));
    }

    const { x, y } = getCanvasCoordinates(event);
    const { x: mandelbrotX, y: mandelbrotY } = canvasToMandelbrot(x, y);
    juliaConstant = [mandelbrotX, mandelbrotY];
    renderJulia();
    document.querySelector("#Re").value = mandelbrotX.toFixed(8);
    document.querySelector("#Im").value = mandelbrotY.toFixed(8);
};

// Keyboard zoom controls
const handleKeyboardZoom = (event) => {
    if (event.key.toLowerCase() === 'q') targetZoom -= 0.2;
    if (event.key.toLowerCase() === 'e') targetZoom += 0.2;
};

// Touch handling
let prevTouchX = -1, prevTouchY = -1, prevTouchDistance = -1;

const handleTouchMove = (event) => {
    preventDefaultBehavior(event);
    const { touches } = event;

    if (touches.length === 1) {
        // Single touch for panning
        const { clientX, clientY } = touches[0];
        const movementX = (clientX - prevTouchX) * pixelRatio;
        const movementY = (clientY - prevTouchY) * pixelRatio;

        center[0] += (-(movementX / canvas.width * 2) / ((scalePerZoom ** zoom) / (canvas.width / canvas.height)));
        center[1] += ((movementY / canvas.height * 2) / (scalePerZoom ** zoom));

        prevTouchX = clientX;
        prevTouchY = clientY;
    } else if (touches.length === 2) {
        // Pinch-zoom
        const [touch1, touch2] = touches;
        const clientX = (touch1.clientX + touch2.clientX) / 2;
        const clientY = (touch1.clientY + touch2.clientY) / 2;
        const touchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        const delta = Math.log(touchDistance / prevTouchDistance) / Math.log(scalePerZoom);
        zoom += delta;

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

// Initialize and start
fetchShaders().then(() => window.requestAnimationFrame(frame));