#version 300 es
precision highp float;

uniform vec2 juliaConstant;   // Julia constant (based on Mandelbrot coordinates)
uniform vec2 rectangle;       // Zoom and aspect ratio
uniform int maxIterations;
uniform vec2 cursorPosition;  // Normalized device coordinates of the cursor
uniform float cursorSize;     // Size of the cursor

in vec2 fragmentPosition;
out vec4 fragColor;

void main() {

    vec2 scaledPosition = fragmentPosition * 2.0;

    // Julia set rendering
    vec2 z = scaledPosition * rectangle;
    int iteration = 0;
    float zx2, zy2;

    for (; iteration < maxIterations; iteration++) {
        zx2 = z.x * z.x;
        zy2 = z.y * z.y;
        z = vec2(zx2 - zy2 + juliaConstant.x, 2.0 * z.x * z.y + juliaConstant.y);

        if (zx2 + zy2 > 4.0) {
            break;
        }
    }

    // Calculate color for the Julia set
    if (iteration < maxIterations) {
        float normalizedIter = float(iteration) / float(maxIterations);
        fragColor = vec4(
            sin(normalizedIter * 5.0),
            sin(normalizedIter * 10.0),
            sin(normalizedIter * 15.0),
            1.0
        );
    } else {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }

    float maxCursorLength = 0.03;  // Adjust this value to control the cursor line length

    // Draw cursor as a white crosshair
    float distX = abs(scaledPosition.x - cursorPosition.x);
    float distY = abs(scaledPosition.y - cursorPosition.y);

    // Check if the fragment is within the cursor's size and also within the max line length
    if ((distX < cursorSize && distY < maxCursorLength) || (distY < cursorSize && distX < maxCursorLength)) {
        fragColor = vec4(0.8, 1.0, 1.0, 0.7);  // Set the cursor color (white with transparency)
    }
}
