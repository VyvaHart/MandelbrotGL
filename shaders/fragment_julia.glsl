#version 300 es
precision highp float;

uniform vec2 juliaConstant;   // Julia constant (based on Mandelbrot coordinates)
uniform vec2 rectangle;       // Zoom and aspect ratio
uniform int maxIterations;
uniform vec2 cursorPosition;  // Normalized device coordinates of the cursor
uniform float cursorSize;     // Size of the cursor
uniform int theme;            // Uniform for selecting color theme

in vec2 fragmentPosition;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);

}

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

    float smoothIter = float(iteration) + 1.0 - log(log(sqrt(zx2 + zy2)) / log(2.0)) / log(2.0);
    float normalizedIter = float(iteration) / float(maxIterations);
    float intensity = smoothIter * 0.1;
    float noise = smoothIter * 0.1 + sin(smoothIter * 10.0) * 0.1;

    // Calculate color for the Julia set
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
            } else if (theme == 4) {
                fragColor = vec4(
                    float(iteration & 0x04) / 4.0,  // Extract the 3rd bit (red)
                    float(iteration & 0x02) / 2.0,  // Extract the 2nd bit (green)
                    float(iteration & 0x01),        // Extract the 1st bit (blue)
                    1.0
                );
            } else if (theme == 5) {
                vec3 colors[5] = vec3[](
                    vec3(1.0, 0.0, 0.0),  // Red
                    vec3(0.0, 1.0, 0.0),  // Green
                    vec3(0.0, 0.0, 1.0),  // Blue
                    vec3(1.0, 1.0, 0.0),  // Yellow
                    vec3(1.0, 0.0, 1.0)   // Magenta
                );
                int index = int(normalizedIter * float(colors.length()));
                fragColor = vec4(colors[index], 1.0);
            } else if (theme == 6) {
                float angle = atan(z.y, z.x) / (2.0 * 3.14159265359) + 0.5; // Normalize angle to [0, 1]
                fragColor = vec4(hsv2rgb(vec3(angle, 1.0, 1.0)), 1.0); // Convert HSV to RGB
            } else if (theme == 7) {
                float distance = length(z);
                fragColor = (mod(floor(distance * 10.0), 2.0) == 0.0) ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0, 1.0, 1.0, 1.0);
            // } else if (theme == 8) {
            //     float radius = length(c);
            //     float angle = atan(c.y, c.x) / (2.0 * 3.14159265359) + 0.5;
            //     fragColor = vec4(vec3(0.5 + 0.5 * cos(angle * 6.0), 0.5 + 0.5 * sin(radius * 3.0), radius), 1.0);
            } else if (theme == 9) {
                fragColor = vec4(
                    smoothstep(0.0, 1.0, normalizedIter * 1.5), 
                    smoothstep(0.5, 1.0, normalizedIter), 
                    1.0 - smoothstep(0.0, 0.5, normalizedIter), 
                    1.0
                    );
            } else if (theme == 10) {
                fragColor = vec4(
                    0.2 + 0.3 * sin(smoothIter * 3.0 + 0.5), 
                    0.2 + 0.3 * sin(smoothIter * 5.0 + 1.0), 
                    0.2 + 0.3 * sin(smoothIter * 7.0 + 1.5), 
                    1.0
                );
            } else if (theme == 11) {
                fragColor = vec4(
                    fract(sin(float(iteration) * 12.9898 + float(intensity) * 78.233) * 43758.5453), 
                    fract(sin(float(iteration) * 39.3467 + float(intensity) * 27.887) * 9631.2764), 
                    fract(sin(float(iteration) * 93.4768 + float(intensity) * 12.877) * 15731.753), 
                    1.0
                );
            } else if (theme == 12) {
                fragColor = vec4(
                    0.5 + 0.5 * sin(smoothIter * 8.0), 
                    0.5 + 0.5 * cos(smoothIter * 9.0), 
                    0.5 + 0.5 * sin(smoothIter * 10.0), 
                    1.0
                );
            } else if (theme == 13) {
                fragColor = vec4(
                    0.3 + 0.5 * smoothstep(0.0, 1.0, normalizedIter), 
                    0.25 + 0.4 * smoothstep(0.0, 1.0, normalizedIter * 1.2), 
                    0.15 + 0.2 * smoothstep(0.0, 1.0, normalizedIter * 0.8), 
                    1.0
                );
            } else if (theme == 14) {
                float angle = atan(z.y, z.x) / (2.0 * 3.14159265359) + 0.5;
                fragColor = vec4(
                    0.5 + 0.5 * sin(angle * 20.0 + smoothIter * 2.0),
                    0.5 + 0.5 * cos(angle * 10.0 + smoothIter * 3.0),
                    0.5 + 0.5 * sin(angle * 15.0 - smoothIter * 1.0),
                    1.0
                );
            }

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
