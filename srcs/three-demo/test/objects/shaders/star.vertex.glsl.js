export const vertex = `
varying float intensity;

void main() {
    vec3 transformed = position;

    // Calculate distance to camera
    float distance = length(modelViewMatrix * vec4(transformed, 1.0));
    intensity = clamp(3.0 / (distance * 0.001), 0.6, 5.0);
    float sizeFactor = max(1.0 - distance / 1000.0, 0.1);
    gl_PointSize = sizeFactor * 10.0; // Size depends on distance
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}`;