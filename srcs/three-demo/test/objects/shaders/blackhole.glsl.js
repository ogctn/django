export const vertex = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const fragment = `
uniform vec3 blackHoleColor;
uniform float radius;

void main() {
    // Simulate lensing effect by darkening towards the center
    vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0); // Adjust resolution
    float dist = length(uv - vec2(0.5));
    float intensity = smoothstep(radius, 0.0, dist);
    gl_FragColor = vec4(blackHoleColor * intensity, 1.0);
}`;