#version 300 es
precision highp float;

uniform vec2 center;          // Uniform for the center of the fractal
uniform vec2 rectangle;       // Uniform for the rectangle size (zoom level)
uniform int maxIterations;    // Uniform for the maximum number of iterations
uniform int theme;           // New uniform for selecting color theme

in vec2 fragmentPosition;   // The position from the vertex shader
out vec4 fragColor;         // Output color

void main() {
    vec2 c = center + fragmentPosition * rectangle;  // Map fragment position to fractal coordinates
    vec2 z = c;
    int iteration = 0;
    float zx2, zy2;

    for (; iteration < maxIterations; iteration++) {
        zx2 = z.x * z.x;
        zy2 = z.y * z.y;
        z = vec2(zx2 - zy2 + c.x, 2.0 * z.x * z.y + c.y);

        if (zx2 + zy2 > 4.0) {
            break;
        }
    }

    // Calculate smooth iteration count (fractional escape)
    float smoothIter = float(iteration) + 1.0 - log(log(sqrt(zx2 + zy2)) / log(2.0)) / log(2.0);
    float normalizedIter = float(iteration) / float(maxIterations);
    float intensity = smoothIter * 0.1;
    float noise = smoothIter * 0.1 + sin(smoothIter * 10.0) * 0.1;

 if (iteration < maxIterations) {
        // Apply different color schemes based on the theme value
        if (theme == 0) {
            fragColor = vec4(
                sin(normalizedIter * 5.0),
                sin(normalizedIter * 10.0),
                sin(normalizedIter * 15.0),
                1.0
            );
        } else if (theme == 1) {
            fragColor = vec4(
                sin(noise * 1.0), 
                sin(noise * 2.0), 
                sin(noise * 3.0), 
                1.0
            );
        } else if (theme == 2) {
            fragColor = vec4(
                0.5 + 0.5 * sin(smoothIter * 4.0), 
                0.5 + 0.5 * sin(smoothIter * 8.0), 
                0.5 + 0.5 * sin(smoothIter * 12.0), 
                1.0
            );
        } else if (theme == 3) {
            fragColor = vec4(
                sin(intensity * 1.0), 
                sin(intensity * 2.0), 
                sin(intensity * 3.0), 
                1.0
            );
        }
    } else {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
