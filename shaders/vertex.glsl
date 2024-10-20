#version 300 es

in vec2 a_position;  // Input vertex position

out vec2 fragmentPosition;  // Pass the position to the fragment shader

void main() {
    fragmentPosition = a_position;   // Pass the position to the fragment shader
    gl_Position = vec4(a_position, 0.0, 1.0);  // Set the vertex position in clip space
}
