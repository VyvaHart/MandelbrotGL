#version 300 es
precision highp float;

uniform vec2 juliaConstant;   // Julia constant (based on Mandelbrot coordinates)
uniform vec2 rectangle;       // Zoom and aspect ratio
uniform int maxIterations;

in vec2 fragmentPosition;
out vec4 fragColor;

void main() {
    vec2 z = fragmentPosition * rectangle;
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
}
