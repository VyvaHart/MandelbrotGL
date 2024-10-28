#version 300 es
precision highp float;
out vec4 fragColor;
in vec2 fragmentPosition;

struct DoubleVec2 {
    float hi;
    float lo;
};

// Double precision addition
DoubleVec2 twoSum(float a, float b) {
    float s = a + b;
    float v = s - a;
    float err = (a - (s - v)) + (b - v);
    return DoubleVec2(s, err);
}

// High-precision double addition
DoubleVec2 doubleAdd(DoubleVec2 a, DoubleVec2 b) {
    DoubleVec2 sum = twoSum(a.hi, b.hi);
    sum.lo += a.lo + b.lo;
    DoubleVec2 result = twoSum(sum.hi, sum.lo);
    return result;
}

// High-precision double subtraction
DoubleVec2 doubleSub(DoubleVec2 a, DoubleVec2 b) {
    DoubleVec2 negB = DoubleVec2(-b.hi, -b.lo);
    return doubleAdd(a, negB);  // Returns a DoubleVec2 structure
}

// High-precision double multiplication
DoubleVec2 doubleMul(DoubleVec2 a, DoubleVec2 b) {
    float p = a.hi * b.hi;
    float err = (a.hi * b.hi - p) + a.lo * b.hi + a.hi * b.lo + a.lo * b.lo;
    return twoSum(p, err);
}

// Uniforms for Mandelbrot center and scaling
uniform vec2 center_hi;
uniform vec2 center_lo;
uniform vec2 rectangle_hi;
uniform vec2 rectangle_lo;
uniform int maxIterations;

void main() {
    // Map fragmentPosition to Mandelbrot coordinates
    DoubleVec2 center = DoubleVec2(center_hi.x, center_lo.x);
    DoubleVec2 rectangle = DoubleVec2(rectangle_hi.x, rectangle_lo.x);

    // Scale fragmentPosition to Mandelbrot coordinates
    DoubleVec2 scaledPos = doubleMul(rectangle, DoubleVec2(fragmentPosition.x - 0.5, fragmentPosition.y - 0.5));
    DoubleVec2 c = doubleAdd(center, scaledPos);

    // Initialize z to 0
    DoubleVec2 z = DoubleVec2(0.0, 0.0);
    int iteration = 0;

    for (; iteration < maxIterations; iteration++) {
        // Calculate z^2 = (z.real^2 - z.imag^2) + 2 * z.real * z.imag * i
        DoubleVec2 zReal2 = doubleMul(DoubleVec2(z.hi, 0.0), DoubleVec2(z.hi, 0.0)); // z.real^2
        DoubleVec2 zImag2 = doubleMul(DoubleVec2(z.lo, 0.0), DoubleVec2(z.lo, 0.0)); // z.imag^2
        DoubleVec2 realPart = doubleSub(zReal2, zImag2); // Real part: z.real^2 - z.imag^2
        DoubleVec2 imagPart = doubleMul(DoubleVec2(2.0, 0.0), DoubleVec2(z.hi, z.lo)); // Imaginary part: 2 * z.real * z.imag

        // Update z = z^2 + c
        z = doubleAdd(realPart, DoubleVec2(c.hi, 0.0)); // Update z.real
        z.lo = imagPart.hi + c.lo;  // Update z.imag

        // Escape condition based on |z|^2 > 4
        DoubleVec2 magnitudeSquared = doubleAdd(zReal2, zImag2);
        if (magnitudeSquared.hi > 4.0 || (magnitudeSquared.hi == 4.0 && magnitudeSquared.lo > 0.0)) {
            break;
        }
    }

    // Color based on iteration count
    float normalizedIter = float(iteration) / float(maxIterations);
    if (iteration < maxIterations) {
        fragColor = vec4(
            0.5 + 0.5 * cos(3.0 + normalizedIter * 5.0),
            0.5 + 0.5 * cos(3.0 + normalizedIter * 10.0),
            0.5 + 0.5 * cos(3.0 + normalizedIter * 15.0),
            1.0
        );
    } else {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black for points within the Mandelbrot set
    }
}
