
const mandelbrotCanvas = document.getElementById("canvas");
const juliaCanvas = document.getElementById("small_canvas");

const mandelbrotGl = mandelbrotCanvas.getContext('webgl2');
const juliaGl = juliaCanvas.getContext('webgl2');

if (!mandelbrotGl || !juliaGl) {
    console.error("WebGL2 is not available in your browser.");
    alert("Your browser does not support WebGL2.");
}

// Initialize both canvas dimensions
const initializeCanvas = () => {
    resizeCanvas(mandelbrotCanvas, mandelbrotGl);
    resizeCanvas(juliaCanvas, juliaGl);
};

const pixelRatio = window.devicePixelRatio;
const resizeCanvas = (canvas, gl) => {
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
};

// Call the resize function
initializeCanvas();

// Variables for Mandelbrot and Julia shaders
let mandelbrotShaderProgram, juliaShaderProgram;

// Fetch and initialize shaders
let vertexShaderSource, mandelbrotFragmentShaderSource, juliaFragmentShaderSource;

Promise.all([
    fetch('shaders/vertex.glsl').then(response => response.text()),
    fetch('shaders/fragment.glsl').then(response => response.text()),  // For Mandelbrot
    fetch('shaders/fragment_julia.glsl').then(response => response.text())  // For Julia
])
.then(shaders => {
    [vertexShaderSource, mandelbrotFragmentShaderSource, juliaFragmentShaderSource] = shaders;

    // Initialize shader programs for both sets
    mandelbrotShaderProgram = initShaderProgram(mandelbrotGl, vertexShaderSource, mandelbrotFragmentShaderSource);
    juliaShaderProgram = initShaderProgram(juliaGl, vertexShaderSource, juliaFragmentShaderSource);

    if (!mandelbrotShaderProgram || !juliaShaderProgram) {
        console.error('Shader program initialization failed.');
        return;
    }

    // Set up rendering for both canvases
    setupMandelbrot();
    setupJulia();

    // Start the animation loop
    window.requestAnimationFrame(frame);
})
.catch(error => console.error('Error loading shaders:', error));

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

// Set up the Mandelbrot canvas
const setupMandelbrot = () => {
    // Similar setup as you already have for the Mandelbrot set
    const positionBuffer = createBuffer(mandelbrotGl);
    configureAttributes(mandelbrotGl, mandelbrotShaderProgram, positionBuffer);
};

// Set up the Julia canvas
const setupJulia = () => {
    // Similar setup for the Julia set, use the same quad
    const positionBuffer = createBuffer(juliaGl);
    configureAttributes(juliaGl, juliaShaderProgram, positionBuffer);
};

// Function to create buffer for vertex positions
const createBuffer = (gl) => {
    const positions = new Float32Array([
        1.0, -1.0,  // Bottom-right
        1.0,  1.0,  // Top-right
        -1.0, -1.0, // Bottom-left
        -1.0,  1.0  // Top-left
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    return positionBuffer;
};

// Function to configure shader attributes
const configureAttributes = (gl, program, positionBuffer) => {
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
};

window.addEventListener('resize', () => {
    initializeCanvas();
});

// Frame rendering function
const frame = () => {

    smoothMoveCenter();
    // Smooth zooming logic: Interpolate between current zoom and target zoom
    const zoomDiff = targetZoom - zoom;
    if (Math.abs(zoomDiff) > 0.001) {  // Only update if difference is significant
        zoom += zoomDiff * zoomSpeed;  // Apply easing (adjust zoomSpeed for smoothness)
    }

    // Render Mandelbrot set
    renderMandelbrot();

    // Render Julia set using the mouse position on Mandelbrot canvas
    renderJulia();

    // Draw the cursor on the Julia canvas after the Julia set is rendered
    drawJuliaCursor();

    // Schedule the next frame
    window.requestAnimationFrame(frame);
};

// Store mouse coordinates in Mandelbrot space
let juliaConstant = [0, 0];
let center = [0, 0];
let zoom = 0;
const scalePerZoom = 2.0;
let maxIterations = 256;

// Update max iterations when the user adjusts the range input
const rangeInput = document.querySelector(".max-iterations input[type=range]");
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
let currentTheme = 0; // 0 for default, 1 for dark, 2 for light, 3 for blue

// Function to apply the selected theme to the Mandelbrot shader
const applyTheme = (theme) => {
    currentTheme = theme;
};

// Event listener for the theme selector
const themeSelector = document.getElementById('theme-select');
themeSelector.addEventListener('change', (event) => {
    const selectedTheme = event.target.value;
    applyTheme(parseInt(selectedTheme, 10));  // Update the theme based on selection
});


const renderMandelbrot = () => {
    if (!mandelbrotShaderProgram) return;

    mandelbrotGl.useProgram(mandelbrotShaderProgram);

    // Get uniform locations and set values for Mandelbrot
    const centerLocation = mandelbrotGl.getUniformLocation(mandelbrotShaderProgram, "center");
    const rectangleLocation = mandelbrotGl.getUniformLocation(mandelbrotShaderProgram, "rectangle");
    const maxIterationsLocation = mandelbrotGl.getUniformLocation(mandelbrotShaderProgram, "maxIterations");
    const themeLocation = mandelbrotGl.getUniformLocation(mandelbrotShaderProgram, "theme");

    // Pass the current theme to the shader
    mandelbrotGl.uniform1i(themeLocation, currentTheme);

    mandelbrotGl.uniform2fv(centerLocation, center);
    mandelbrotGl.uniform2fv(rectangleLocation, [scalePerZoom ** -zoom * mandelbrotCanvas.width / mandelbrotCanvas.height, scalePerZoom ** -zoom]);
    mandelbrotGl.uniform1i(maxIterationsLocation, maxIterations);

    mandelbrotGl.clear(mandelbrotGl.COLOR_BUFFER_BIT);
    mandelbrotGl.drawArrays(mandelbrotGl.TRIANGLE_STRIP, 0, 4);
};

const renderJulia = () => {
    if (!juliaShaderProgram) return;

    juliaGl.useProgram(juliaShaderProgram);

    const positionBuffer = createBuffer(juliaGl);
    configureAttributes(juliaGl, juliaShaderProgram, positionBuffer);

    // Pass the Mandelbrot coordinates as the Julia constant
    const juliaConstantLocation = juliaGl.getUniformLocation(juliaShaderProgram, "juliaConstant");
    const maxIterationsLocation = juliaGl.getUniformLocation(juliaShaderProgram, "maxIterations");
    const rectangleLocation = juliaGl.getUniformLocation(juliaShaderProgram, "rectangle");
    const cursorPositionLocation = juliaGl.getUniformLocation(juliaShaderProgram, "cursorPosition");
    const cursorSizeLocation = juliaGl.getUniformLocation(juliaShaderProgram, "cursorSize");
    const themeLocation = juliaGl.getUniformLocation(juliaShaderProgram, "theme");
    juliaGl.uniform2fv(juliaConstantLocation, juliaConstant);  // This is correct, using the Mandelbrot cursor

    
    juliaGl.uniform1i(maxIterationsLocation, maxIterations);
    juliaGl.uniform2fv(rectangleLocation, [ juliaCanvas.width / juliaCanvas.height, 1.0]);  // Keep the aspect ratio consistent with the Mandelbrot set
    juliaGl.uniform2fv(cursorPositionLocation, juliaConstant);  // Use Mandelbrot coordinates for cursor
    juliaGl.uniform1f(cursorSizeLocation, 0.1);  // Adjust size as needed
    juliaGl.uniform1i(themeLocation, currentTheme);

    // Clear and draw the Julia set
    juliaGl.clear(juliaGl.COLOR_BUFFER_BIT);
    juliaGl.drawArrays(juliaGl.TRIANGLE_STRIP, 0, 4);

    // Draw the Julia cursor (should already work)
    drawJuliaCursor();
};

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
         // Current zoom level
let targetZoom = 0;    // Target zoom level
const zoomSpeed = 0.1; // Zoom speed for smooth transition (adjust as needed)

// Track whether the Alt key is pressed
let isAltPressed = false;

// Add event listener to detect Alt key press and release
window.addEventListener('keydown', (event) => {
    if (event.key === 'Alt') {
        console.log('Alt pressed.');
        isAltPressed = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'Alt') {
        console.log('Alt unpressed.');
        isAltPressed = false;
    }
});

// Function to smoothly move the viewport center to the target
let targetCenter = [...center]; // Start with the current center

const smoothMoveCenter = () => {
    const lerpFactor = 0.1; // Linear interpolation factor (adjust for speed)
    center[0] += (targetCenter[0] - center[0]) * lerpFactor;
    center[1] += (targetCenter[1] - center[1]) * lerpFactor;

    // If the distance between current center and target center is small enough, stop moving
    if (Math.abs(targetCenter[0] - center[0]) < 0.0001 && Math.abs(targetCenter[1] - center[1]) < 0.0001) {
        center = [...targetCenter]; // Set exact target center to avoid overshooting
    }
};

// Event listener for Alt + Right Mouse Click
mandelbrotCanvas.addEventListener('mousedown', (event) => {
    if (isAltPressed) {
        event.preventDefault(); // Prevent default left-click 'mousedown'

        const { offsetX, offsetY } = event;

        // Convert mouse coordinates to Mandelbrot space
        const { x: mouseMandelbrotX, y: mouseMandelbrotY } = canvasToMandelbrot(offsetX, offsetY);

        // Set the target center to the Mandelbrot coordinates of the mouse
        targetCenter = [mouseMandelbrotX, mouseMandelbrotY];
    }
});


{
    canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
    
        const { offsetX, offsetY, deltaY } = event;
    
        // 1. Get the Mandelbrot coordinates under the mouse BEFORE zooming
        const { x: mouseXBefore, y: mouseYBefore } = canvasToMandelbrot(offsetX, offsetY);
    
        // 2. Update the target zoom based on the wheel event
        const delta = Math.min(Math.max(-deltaY * 5, -100), 100) / 100;
        targetZoom += delta;
    
        // 3. Calculate the Mandelbrot coordinates under the mouse AFTER zooming
        const { x: mouseXAfter, y: mouseYAfter } = canvasToMandelbrot(offsetX, offsetY);
    
        // 4. Adjust the center to zoom in/out towards the mouse pointer
        // Shift the center to compensate for the change in position of the point under the mouse
        center[0] += (mouseXBefore - mouseXAfter);
        center[1] += (mouseYBefore - mouseYAfter);
    
    }, { passive: false });
    
    
    


	canvas.addEventListener("mousemove", (event) => {
		if (event.buttons & 0b001) {
			const { movementX, movementY } = event;
			center[0] += (-(movementX / canvas.width * 2) / (
				(scalePerZoom ** zoom) / (canvas.width / canvas.height)
			));
			center[1] += ((movementY / canvas.height * 2) / (
				(scalePerZoom ** zoom)
			));
		}

		// Calculate Mandelbrot coordinates and update the display
		const { offsetX, offsetY } = event;
		const { x: mandelbrotX, y: mandelbrotY } = canvasToMandelbrot(offsetX, offsetY);

        document.querySelector("#Im").value = mandelbrotX.toFixed(8);
        document.querySelector("#Re").value = mandelbrotY.toFixed(8);
	
        juliaConstant = [mandelbrotX, mandelbrotY];
        renderJulia();
    });

	{
		let prevTouchX = -1;
		let prevTouchY = -1;
		let prevTouchDistance = -1;

		canvas.addEventListener("touchmove", (event) => {
			event.preventDefault();
			const { touches } = event;
			if (touches.length === 1) {
				const { clientX, clientY } = touches[0];
				const movementX = (clientX - prevTouchX) * pixelRatio;
				const movementY = (clientY - prevTouchY) * pixelRatio;
				center[0] += (-(movementX / canvas.width * 2) / (
					(scalePerZoom ** zoom) / (canvas.width / canvas.height)
				));
				center[1] += ((movementY / canvas.height * 2) / (
					(scalePerZoom ** zoom)
				));
				prevTouchX = clientX;
				prevTouchY = clientY;
			} else if (touches.length === 2) {
				const clientX = (touches[0].clientX + touches[1].clientX) / 2;
				const clientY = (touches[0].clientY + touches[1].clientY) / 2;
				const movementX = (clientX - prevTouchX) * pixelRatio;
				const movementY = (clientY - prevTouchY) * pixelRatio;
				const touchDistance = Math.hypot(
					touches[1].clientX - touches[0].clientX,
					touches[1].clientY - touches[0].clientY,
				);
				center[0] += (-(movementX / canvas.width * 2) / (
					(scalePerZoom ** zoom) / (canvas.width / canvas.height)
				));
				center[1] += ((movementY / canvas.height * 2) / (
					(scalePerZoom ** zoom)
				));

				const { x: canvasX, y: canvasY } = canvas.getBoundingClientRect();
				const offsetX = (clientX - canvasX) * pixelRatio;
				const offsetY = (clientY - canvasY) * pixelRatio;

				const pointX = ((offsetX / canvas.width * 2 - 1) / (
					(scalePerZoom ** zoom) / (canvas.width / canvas.height)
				)) + center[0];

				const pointY = (-(offsetY / canvas.height * 2 - 1) / (
					(scalePerZoom ** zoom)
				)) + center[1];

				const delta = log(touchDistance / prevTouchDistance, scalePerZoom);

				zoom += delta;

				center[0] = pointX - (pointX - center[0]) / (scalePerZoom ** delta);
				center[1] = pointY - (pointY - center[1]) / (scalePerZoom ** delta);


				prevTouchX = clientX;
				prevTouchY = clientY;
				prevTouchDistance = touchDistance;
			}
		}, { passive: false });

		canvas.addEventListener("touchstart", ({ touches }) => {
			if (touches.length === 1) {
				prevTouchX = touches[0].clientX;
				prevTouchY = touches[0].clientY;
			} else if (touches.length === 2) {
				prevTouchDistance = Math.hypot(
					touches[1].clientX - touches[0].clientX,
					touches[1].clientY - touches[0].clientY,
				);
				prevTouchX = (touches[0].clientX + touches[1].clientX) / 2;
				prevTouchY = (touches[0].clientY + touches[1].clientY) / 2;
			}
		}, { passive: false });

		canvas.addEventListener("touchend", ({ touches }) => {
			if (touches.length === 0) {
				prevTouchX = -1;
				prevTouchY = -1;
			} else if (touches.length === 1) {
				prevTouchDistance = -1;
				prevTouchX = touches[0].clientX;
				prevTouchY = touches[0].clientY;
			}
		}, { passive: false });
	}
}

export { };
