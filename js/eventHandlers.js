// Shared state for Alt key (using a getter/setter)
let altPressedState = false;

export const setAltPressed = (state) => {
    altPressedState = state;
};

export const isAltPressed = () => {
    return altPressedState;
};

// Track Alt key press
export const handleKeyDown = (event) => {
    if (event.key === 'Alt') {
        console.log('Alt pressed.');
        setAltPressed(true);  // Set Alt key state to true
    }
};

// Track Alt key release
export const handleKeyUp = (event) => {
    if (event.key === 'Alt') {
        console.log('Alt unpressed.');
        setAltPressed(false);  // Set Alt key state to false
    }
};

// Mandelbrot canvas context menu handler
export const handleContextMenu = (mandelbrotCanvas, canvasToMandelbrot, targetCenter) => {
    mandelbrotCanvas.addEventListener('contextmenu', (event) => {
        if (isAltPressed()) {  // Check the current state dynamically
            event.preventDefault(); // Prevent default right-click context menu

            const { offsetX, offsetY } = event;
            const { x: mouseMandelbrotX, y: mouseMandelbrotY } = canvasToMandelbrot(offsetX, offsetY);

            targetCenter[0] = mouseMandelbrotX;
            targetCenter[1] = mouseMandelbrotY;
        }
    });
};
