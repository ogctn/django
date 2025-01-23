/* glsl */
export const vertex = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const fragment = `
uniform vec2 blackHoleCenter;
uniform float lensStrength;

varying vec2 vUv;

void main() {
    // Calculate the distortion from the black hole center
    vec2 offset = vUv - blackHoleCenter;
    float distortion = lensStrength / length(offset);

    // Apply distortion to UV coordinates
    vec2 distortedUv = vUv + offset * distortion;

    // Sample the original scene
    vec4 color = texture2D(sceneTexture, distortedUv);
    gl_FragColor = color;
}`;